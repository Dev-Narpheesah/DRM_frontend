import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import styles from "./Home.module.css";
import { toast } from "react-toastify";
import HeroSection from "./HeroSection";
import Footer from "./Footer";
import About from "../About/About";
import ThemeToggle from "./ThemeToggle";
import {
  FaBolt,
  FaUsers,
  FaChartLine,
  FaShieldAlt,
  FaHeart,
  FaBoxOpen,
  FaHandshake,
  FaExclamationTriangle,
} from "react-icons/fa";

const API_URL = "https://drm-backend.vercel.app/api";



const Home = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [query, setQuery] = useState({
    location: "",
    type: "",
    start: "",
    end: "",
  });
  const [activeCategory, setActiveCategory] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const navRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleDashboardClick = () => {
    setIsMenuOpen(false);
    if (user?.email) navigate(`/dashboard`);
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    ...(user?.email
      ? [
          {
            to: "/dashboard",
            label: "Dashboard",
            onClick: handleDashboardClick,
          },
        ]
      : [{ to: "/signin", label: "Sign In" }]),
    { to: "/disForm", label: "Report Disaster" },
    { to: "/donate", label: "Donate" },
  ];

  const renderNavLinks = (isDropdown = false) =>
    navItems.map((item, idx) => (
      <li key={idx}>
        {item.type === "button" ? (
          <button
            className={isDropdown ? styles.dropdownBtn : styles.navBtn}
            onClick={item.onClick}
            aria-label={item.label}
          >
            {item.label}
          </button>
        ) : (
          <NavLink
            to={item.to}
            aria-label={item.label}
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

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported", {
        className: styles.errorToast,
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setQuery((q) => ({
          ...q,
          location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        }));
        toast.success("Location filled", { className: styles.successToast });
      },
      () =>
        toast.error("Unable to get location", { className: styles.errorToast }),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const onSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(`${API_URL}/user/reports`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      const filtered = (Array.isArray(data) ? data : []).filter((r) => {
        const matchesLocation = query.location
          ? (r.location || "")
              .toLowerCase()
              .includes(query.location.toLowerCase())
          : true;
        const typeFilter = activeCategory || query.type;
        const matchesType = typeFilter
          ? (r.disasterType || "")
              .toLowerCase()
              .includes(typeFilter.toLowerCase())
          : true;
        const created = r.createdAt ? new Date(r.createdAt) : null;
        const startOk = query.start
          ? created
            ? created >= new Date(query.start)
            : false
          : true;
        const endOk = query.end
          ? created
            ? created <= new Date(query.end)
            : false
          : true;
        return matchesLocation && matchesType && startOk && endOk;
      });
      setResults(filtered.slice(0, 12));
      if (filtered.length === 0) {
        toast.warn("No results found", { className: styles.warnToast });
      }
    } catch (err) {
      setSearchError(err.message || "Search failed");
      toast.error(err.message || "Search failed", {
        className: styles.errorToast,
      });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.dark : ""}`}>
      <header
        className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}
      >
        <div className={styles.headerContent}>
          <div className={styles.headerLogo}>
            <h1 className={styles.logo}>Relief</h1>
            <span className={styles.tagline}>Disaster Response Management</span>
          </div>
          <nav
            className={styles.nav}
            ref={navRef}
            aria-label="Primary navigation"
          >
            <ul className={styles.navLinks}>{renderNavLinks(false)}</ul>
            <div className={styles.navActions}>
              <ThemeToggle />
              <button
                className={styles.menuButton}
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                aria-controls="dropdown-menu"
              >
                <span
                  className={`${styles.hamburger} ${
                    isMenuOpen ? styles.active : ""
                  }`}
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
            </div>
            <div
              id="dropdown-menu"
              className={`${styles.dropdown} ${isMenuOpen ? styles.open : ""}`}
              role="menu"
            >
              <ul className={styles.dropdownLinks}>{renderNavLinks(true)}</ul>
            </div>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <HeroSection />
        <section className={styles.features}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Why Choose Relief?</h2>
            <div className={styles.featuresGrid}>
              <FeatureCard
                icon={<FaBolt />}
                title="Real-time Reporting"
                description="Report disasters instantly with location tracking and photo evidence"
              />
              <FeatureCard
                icon={<FaUsers />}
                title="Community Support"
                description="Connect with volunteers and organizations for immediate assistance"
              />
              <FeatureCard
                icon={<FaChartLine />}
                title="Data Analytics"
                description="Track disaster patterns and optimize response strategies"
              />
              <FeatureCard
                icon={<FaShieldAlt />}
                title="Transparent Donations"
                description="Direct donations to verified relief efforts with full transparency"
              />
            </div>
          </div>
        </section>

        <About />

        <section className={styles.CallToAction}>
          <div className={styles.ctaContent}>
            <h2>Join Us in Making a Difference</h2>
            <p>
              Become a part of our mission to provide effective disaster relief
              and support to those in need. Every report, every donation, every
              volunteer makes a real impact.
            </p>
            <div className={styles.ctaButtons}>
              <NavLink
                to="/disForm"
                className={`${styles.CtaBtn} ${styles.primary}`}
                aria-label="Report a disaster now"
              >
                Report Now
              </NavLink>
              <NavLink
                to="/donate"
                className={`${styles.CtaBtn} ${styles.action}`}
                aria-label="Donate today"
              >
                Donate Today
              </NavLink>
            </div>
          </div>
        </section>

        <section className={styles.testimonials}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>What People Are Saying</h2>
            <div className={styles.testimonialItems}>
              <Testimonial
                quote="This platform has transformed how we manage resources during crises. The real-time reporting feature is a game-changer."
                author="John Doe"
                role="Relief Coordinator"
                avatar={<FaShieldAlt />}
              />
              <Testimonial
                quote="As a volunteer, I can quickly respond to disasters in my area. The community features make coordination seamless."
                author="Jane Smith"
                role="Volunteer"
                avatar={<FaUsers />}
              />
              <Testimonial
                quote="The transparency in donations gives me confidence that my contributions are making a real difference."
                author="Mike Johnson"
                role="Donor"
                avatar={<FaHeart />}
              />
            </div>
          </div>
        </section>

        <section className={styles.stats}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Our Impact</h2>
            <div className={styles.statsItems}>
              <Stat number="1000+" text="Lives Impacted" icon={<FaHeart />} />
              <Stat
                number="500+"
                text="Resources Managed"
                icon={<FaBoxOpen />}
              />
              <Stat
                number="200+"
                text="Volunteers Engaged"
                icon={<FaHandshake />}
              />
              <Stat
                number="50+"
                text="Disasters Responded"
                icon={<FaExclamationTriangle />}
              />
            </div>
          </div>
        </section>

        {/* <section className={styles.emergency}>
          <div className={styles.container}>
            <div className={styles.emergencyContent}>
              <h2>Emergency? Need Immediate Help?</h2>
              <p>
                Call emergency services immediately if you're in immediate
                danger
              </p>
              <div className={styles.emergencyNumbers}>
                <div className={styles.emergencyNumber}>
                  <span className={styles.number}>911</span>
                  <span className={styles.label}>Emergency</span>
                </div>
                <div className={styles.emergencyNumber}>
                  <span className={styles.number}>1-800-RED-CROSS</span>
                  <span className={styles.label}>Red Cross</span>
                </div>
              </div>
            </div>
          </div>
        </section> */}
      </main>

      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className={styles.featureCard}>
    <div className={styles.featureIcon}>{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

const Testimonial = ({ quote, author, role, avatar }) => (
  <div className={styles.testimonialItem}>
    <div className={styles.testimonialAvatar}>{avatar}</div>
    <p className={styles.testimonialQuote}>"{quote}"</p>
    <div className={styles.testimonialAuthor}>
      <h4>{author}</h4>
      <span>{role}</span>
    </div>
  </div>
);

const Stat = ({ number, text, icon }) => (
  <div className={styles.statItem}>
    <div className={styles.statIcon}>{icon}</div>
    <h3>{number}</h3>
    <p>{text}</p>
  </div>
);

export default Home;