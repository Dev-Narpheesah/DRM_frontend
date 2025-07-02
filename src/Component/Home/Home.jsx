
import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/userContext";
import HeroSection from "../Home/HeroSection";
import Footer from "./Footer";
import styles from "./Home.module.css";

const Home = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);

  const handleDashboardClick = () => {
    setIsMenuOpen(false);
    if (user && user.hasSubmittedReport) {
      navigate(`/user/${user.id}`);
    } else {
      navigate("/signup");
    }
  };

  const handleSignOut = () => {
    setIsMenuOpen(false);
    logout();
    navigate("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    if (user && user.hasSubmittedReport) {
      setIsMenuOpen(false);
      navigate(`/user/${user.id}`);
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLogo}>
          <h1 className={styles.logo}>Relief</h1>
        </div>
        <nav className={styles.nav} ref={navRef}>
          <button
            className={styles.menuButton}
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="dropdown-menu"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
          <div
            id="dropdown-menu"
            className={`${styles.dropdown} ${isMenuOpen ? styles.open : ""}`}
          >
            <ul className={styles.dropdownLinks}>
              <li>
                <Link to="/" onClick={toggleMenu}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/emergency" onClick={toggleMenu}>
                  Help
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={toggleMenu}>
                  About
                </Link>
              </li>
              {user ? (
                <>
                  <li>
                    <Link
                      to={user.hasSubmittedReport ? `/user/${user.id}` : "/signup"}
                      className={styles.dropdownLink}
                      onClick={() => {
                        handleDashboardClick();
                      }}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <button
                      className={styles.dropdownBtn}
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link to="/signin" onClick={toggleMenu}>
                    Sign In
                  </Link>
                </li>
              )}
              <li>
                <Link to="/disForm" onClick={toggleMenu}>
                  Report Disaster
                </Link>
              </li>
              <li>
                <Link to="/card" onClick={toggleMenu}>
                  View Reports
                </Link>
                </li>
              </ul>
          </div>
        </nav>
      </header>

      <main>
        <HeroSection />
        <section className={styles.CallToAction}>
          <h2>Join Us in Making a Difference</h2>
          <p>
            Become a part of our mission to provide effective disaster relief and
            support to those in need.
          </p>
          <button className={styles.CtaBtn}>
            <Link to="/about">Learn More</Link>
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