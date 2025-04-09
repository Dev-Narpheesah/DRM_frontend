import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/userContext";
import HeroSection from "../Home/HeroSection";
import Footer from "./Footer";
import styles from "./Home.module.css";

const Home = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    if (user && user.hasSubmittedReport) {
      navigate(`/user/${user.id}`);
    } else {
      navigate("/signup"); // Redirect to the disaster report form if the user hasn't submitted a report
    }
  };

  useEffect(() => {
    // Check if user has submitted a report and navigate to their dashboard if so
    if (user && user.hasSubmittedReport) {
      navigate(`/user/${user.id}`);
    }
  }, [user, navigate]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLogo}>
          <h1 className={styles.logo}>Relief</h1>
        </div>
        <nav>
          <ul className={styles.navLinks}>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/emergency">Help</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <button className={styles.headerBtn} onClick={handleDashboardClick}>
                Dashboard
              </button>
            </li>
            <li>
              <button className={styles.headerBtn}>
                <Link to="/disForm" style={{ color: "#141315" }}>
                  Report Disaster
                </Link>
              </button>
            </li>
            <li>
              <button className={styles.headerBtn}>
                <Link to="/card" style={{ color: "#141315" }}>
                  View Reports
                </Link>
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <HeroSection />

        <section className={styles.CallToAction}>
          <h2>Join Us in Making a Difference</h2>
          <p>
            Become a part of our mission to provide effective disaster relief
            and support to those in need.
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
