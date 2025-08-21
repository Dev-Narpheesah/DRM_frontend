import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import { toast } from "react-toastify";
import HeroSection from "../Home/HeroSection";
import Footer from "./Footer";
import About from "../About/About"; // ✅ Import About component

const Home = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleDashboardClick = () => {
    setIsMenuOpen(false);
    if (user?.email) navigate(`/user`);
    else navigate("/signup");
  };

  const handleSignOut = () => {
    setIsMenuOpen(false);
    localStorage.removeItem("user");
    toast.success("Signed out successfully");
    navigate("/signin");
  };

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  
  const navItems = [
    { to: "/", label: "Home" },
    // { to: "/emergency", label: "Help" },
   ...(user?.email
  ? [
      { to: "/dashboard", label: "Dashboard", onClick: handleDashboardClick },
    ]
  : [{ to: "/signin", label: "Sign In" }]),

    { to: "/disForm", label: "Report Disaster" },

  ];

  const renderNavLinks = (isDropdown = false) =>
    navItems.map((item, idx) => (
      <li key={idx}>
        {item.type === "button" ? (
          <button
            className={isDropdown ? styles.dropdownBtn : styles.navBtn}
            onClick={item.onClick}
          >
            {item.label}
          </button>
        ) : (
          <NavLink
            to={item.to}
            className={({ isActive }) =>
              `${isDropdown ? styles.dropdownLink : styles.navLink} ${
                isActive ? styles.active : ""
              }`
            }
            onClick={item.onClick || (isDropdown ? toggleMenu : undefined)}
          >
            {item.label}
          </NavLink>
        )}
      </li>
    ));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLogo}>
          <h1 className={styles.logo}>Relief</h1>
        </div>

        <nav className={styles.nav} ref={navRef}>
          {/* Mobile menu toggle */}
          <button
            className={styles.menuButton}
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="dropdown-menu"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>

          {/* Mobile Dropdown */}
          <div
            id="dropdown-menu"
            className={`${styles.dropdown} ${isMenuOpen ? styles.open : ""}`}
          >
            <ul className={styles.dropdownLinks}>{renderNavLinks(true)}</ul>
          </div>

          {/* Desktop Nav */}
          <ul className={styles.navLinks}>{renderNavLinks(false)}</ul>
        </nav>
      </header>

      <main>
        <HeroSection />

        {/* ✅ Render About directly */}
        <About />

        <section className={styles.CallToAction}>
          <h2>Join Us in Making a Difference</h2>
          <p>
            Become a part of our mission to provide effective disaster relief and
            support to those in need.
          </p>
          <button className={styles.CtaBtn}>
            <NavLink to="/disForm">Report Now</NavLink>
          </button>
        </section>

        <section className={styles.testimonials}>
          <h2>What People Are Saying</h2>
          <div className={styles.testimonialItems}>
            <Testimonial
              quote="This platform has transformed how we manage resources during crises."
              author="John Doe, Relief Coordinator"
            />
            <Testimonial
              quote="A game-changer in disaster management!"
              author="Jane Smith, Volunteer"
            />
          </div>
        </section>

        <section className={styles.stats}>
          <h2>Our Impact</h2>
          <div className={styles.statsItems}>
            <Stat number="1000+" text="Lives Impacted" />
            <Stat number="500+" text="Resources Managed" />
            <Stat number="200+" text="Volunteers Engaged" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

// Subcomponents
const Testimonial = ({ quote, author }) => (
  <div className={styles.testimonialItem}>
    <p>"{quote}"</p>
    <h4>- {author}</h4>
  </div>
);

const Stat = ({ number, text }) => (
  <div className={styles.statItem}>
    <h3>{number}</h3>
    <p>{text}</p>
  </div>
);

export default Home;
