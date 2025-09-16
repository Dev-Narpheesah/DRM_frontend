import React, { useState, useEffect, useRef } from "react";
// ...existing imports...
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
  // ...existing code...
  // Most Current Disaster Reports
  const [recentDisasters, setRecentDisasters] = useState([]);
  useEffect(() => {
    async function fetchRecentDisasters() {
      try {
        const res = await fetch(`${API_URL}/reports`);
        if (!res.ok) throw new Error("Failed to fetch disasters");
        const data = await res.json();
        // Sort by createdAt if available, else use as is
        const sorted = Array.isArray(data)
          ? data.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
          : [];
  setRecentDisasters(sorted.slice(0, 3)); // Show most recent 3
      } catch (err) {
        setRecentDisasters([]);
      }
    }
    fetchRecentDisasters();
  }, []);



  // Contact Form
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: contactName, email: contactEmail, message: contactMessage }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('Message sent!');
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } else {
      toast.error(data.error || 'Message failed');
    }
  };
  const navRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  // Fetch total amount donated
  // Fetch all donations for analytics card
  const [totalDonated, setTotalDonated] = useState(0);
  useEffect(() => {
    async function fetchTotalDonated() {
      try {
        const res = await fetch(`${API_URL}/donations/total`);
        if (!res.ok) throw new Error("Failed to fetch total donated");
        const data = await res.json();
        setTotalDonated(typeof data.total === 'number' ? data.total : 0);
      } catch (err) {
        setTotalDonated(null);
      }
    }
    fetchTotalDonated();
  }, []);

  // Fetch total disasters reported
  const [totalDisasters, setTotalDisasters] = useState(0);
  useEffect(() => {
    async function fetchTotalDisasters() {
      try {
        const res = await fetch(`${API_URL}/reports`);
        if (!res.ok) throw new Error("Failed to fetch total disasters");
        const data = await res.json();
        setTotalDisasters(Array.isArray(data) ? data.length : 0);
      } catch (err) {
        setTotalDisasters(null);
      }
    }
    fetchTotalDisasters();
  }, []);

  // Fetch necessities/resources
  // useEffect(() => {
  //   async function fetchNecessities() {
  //     try {
  //       const res = await fetch(`${API_URL}/necessities`);
  //       if (!res.ok) throw new Error("Failed to fetch necessities");
  //       const data = await res.json();
  //       setNecessities(Array.isArray(data) ? data : []);
  //     } catch (err) {
  //       setNecessities([]);
  //     }
  //   }
  //   fetchNecessities();
  // }, []);

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
          >
            {item.label}
          </NavLink>
        )}
      </li>
    ));
  // ...existing code...
  return (
    <div className={`${styles.container} ${isDarkMode ? styles.dark : ""}`}>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
        <div className={styles.headerContent}>
          <div className={styles.headerLogo}>
            <h1 className={styles.logo}>Relief</h1>
            <span className={styles.tagline}>Disaster Response Management</span>
          </div>
          <nav className={styles.nav} ref={navRef} aria-label="Primary navigation">
            <ul className={styles.navLinks}>{renderNavLinks(false)}</ul>
            <div className={styles.navActions}>
              <ThemeToggle />
              <button className={styles.menuButton} onClick={toggleMenu} aria-label={isMenuOpen ? "Close menu" : "Open menu"} aria-expanded={isMenuOpen} aria-controls="dropdown-menu">
                {isMenuOpen ? (
                  <svg className={styles.menuIcon} viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                    <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg className={styles.menuIcon} viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                    <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>
            <div id="dropdown-menu" className={`${styles.dropdown} ${isMenuOpen ? styles.open : ""}`} role="menu">
              <ul className={styles.dropdownLinks}>{renderNavLinks(true)}</ul>
            </div>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        {/* Restore original HeroSection with cycling images */}
        <HeroSection />

        {/* Impact Stats (Card-Based, Live Data) */}
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Funds Raised</h3>
              <p>{totalDonated !== null ? `₦${totalDonated.toLocaleString()}` : 'Loading...'}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Disasters Reported</h3>
              <p>{totalDisasters !== null ? totalDisasters : 'Loading...'}</p>
            </div>
          </div>
        </section>

        {/* Most Current Disaster Reports (Card-Based) */}
        <section className={styles.newsSection}>
          <h2 className={styles.sectionTitle}>Most Recent Disaster Reports</h2>
          <div className={styles.newsGrid}>
            {recentDisasters.length === 0 ? (
              <div className={styles.newsCard}>No disaster reports available.</div>
            ) : (
              recentDisasters.map((item) => (
                <div className={styles.newsCard} key={item._id || item.location+item.date}>
                  <h3>{item.disasterType} in {item.location}</h3>
                  {item.image && item.image.url && (
                    <img src={item.image.url} alt={item.disasterType} className={styles.newsImage} />
                  )}
                  <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : (item.date ? new Date(item.date).toLocaleDateString() : '')}</span>
                </div>
              ))
            )}
          </div>
        </section>


        {/* No contact section on homepage; navigation to contact is via footer only. */}

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