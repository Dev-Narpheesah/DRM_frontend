import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import { toast } from "react-toastify";
import HeroSection from "../Home/HeroSection";
import Footer from "./Footer";

const Home = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleDashboardClick = () => {
    setIsMenuOpen(false);
    if (user && user.email) {
      navigate(`/user`);
    } else {
      navigate("/signup");
    }
  };

  const handleSignOut = () => {
    setIsMenuOpen(false);
    localStorage.removeItem("user");
    toast.success("Signed out successfully");
    navigate("/signin");
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

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
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `${styles.dropdownLink} ${isActive ? styles.active : ""}`
                  }
                  onClick={toggleMenu}
                  aria-current={({ isActive }) => (isActive ? "page" : undefined)}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/emergency"
                  className={({ isActive }) =>
                    `${styles.dropdownLink} ${isActive ? styles.active : ""}`
                  }
                  onClick={toggleMenu}
                  aria-current={({ isActive }) => (isActive ? "page" : undefined)}
                >
                  Help
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `${styles.dropdownLink} ${isActive ? styles.active : ""}`
                  }
                  onClick={toggleMenu}
                  aria-current={({ isActive }) => (isActive ? "page" : undefined)}
                >
                  About
                </NavLink>
              </li>
              {user && user.email ? (
                <>
                  <li>
                    <NavLink
                      to="/user"
                      className={({ isActive }) =>
                        `${styles.dropdownLink} ${isActive ? styles.active : ""}`
                      }
                      onClick={handleDashboardClick}
                      aria-current={({ isActive }) => (isActive ? "page" : undefined)}
                    >
                      Dashboard
                    </NavLink>
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
                  <NavLink
                    to="/signin"
                    className={({ isActive }) =>
                      `${styles.dropdownLink} ${isActive ? styles.active : ""}`
                    }
                    onClick={toggleMenu}
                    aria-current={({ isActive }) => (isActive ? "page" : undefined)}
                  >
                    Sign In
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink
                  to="/disForm"
                  className={({ isActive }) =>
                    `${styles.dropdownLink} ${isActive ? styles.active : ""}`
                  }
                  onClick={toggleMenu}
                  aria-current={({ isActive }) => (isActive ? "page" : undefined)}
                >
                  Report Disaster
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/card"
                  className={({ isActive }) =>
                    `${styles.dropdownLink} ${isActive ? styles.active : ""}`
                  }
                  onClick={toggleMenu}
                  aria-current={({ isActive }) => (isActive ? "page" : undefined)}
                >
                  View Reports
                </NavLink>
              </li>
            </ul>
          </div>
          <ul className={styles.navLinks}>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ""}`
                }
                aria-current={({ isActive }) => (isActive ? "page" : undefined)}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/emergency"
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ""}`
                }
                aria-current={({ isActive }) => (isActive ? "page" : undefined)}
              >
                Help
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ""}`
                }
                aria-current={({ isActive }) => (isActive ? "page" : undefined)}
              >
                About
              </NavLink>
            </li>
            {user && user.email ? (
              <>
                <li>
                  <NavLink
                    to="/user"
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.active : ""}`
                    }
                    onClick={handleDashboardClick}
                    aria-current={({ isActive }) => (isActive ? "page" : undefined)}
                  >
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <button
                    className={styles.navBtn}
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <NavLink
                  to="/signin"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ""}`
                  }
                  aria-current={({ isActive }) => (isActive ? "page" : undefined)}
                >
                  Sign In
                </NavLink>
              </li>
            )}
            <li>
              <NavLink
                to="/disForm"
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ""}`
                }
                aria-current={({ isActive }) => (isActive ? "page" : undefined)}
              >
                Report Disaster
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/card"
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ""}`
                }
                aria-current={({ isActive }) => (isActive ? "page" : undefined)}
              >
                View Reports
              </NavLink>
            </li>
          </ul>
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
            <NavLink to="/about">Learn More</NavLink>
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