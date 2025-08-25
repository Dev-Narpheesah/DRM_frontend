import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import styles from "./HeroSection.module.css";

const heroImages = [
  {
    url: '/modern_flood_response.jpg',
    title: 'Empower Resilience',
    subtitle: 'Rebuilding communities in the wake of rising waters.',
  },
  {
    url: '/ai_wildfire_detection.jpg',
    title: 'AI for Wildfire Relief',
    subtitle: 'Using technology to fight and recover from wildfires.',
  },
  {
    url: '/urban_hurricane_aid.jpg',
    title: 'Shelter from the Storm',
    subtitle: 'Urban hubs united against hurricane havoc.',
  },
  {
    url: '/real_time_disaster_reporting.jpg',
    title: 'Report. React. Recover.',
    subtitle: 'Real-time data driving faster relief.',
  },
  {
    url: '/green_reforestation_project.jpg',
    title: 'Green the Earth',
    subtitle: 'Fighting erosion through sustainable reforestation.',
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <section 
      className={`${styles.hero} ${isDarkMode ? styles.dark : ''}`}
      style={{ backgroundImage: `url(${heroImages[currentSlide].url})` }}
      role="banner"
    >
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>{heroImages[currentSlide].title}</h1>
        <p className={styles.heroSubtitle}>{heroImages[currentSlide].subtitle}</p>
        <div className={styles.heroButtons}>
          <Link to="/donate" className={`${styles.heroButton} ${styles.primary}`} aria-label="Donate now">
            Donate Now
          </Link>
          <Link to="/disForm" className={`${styles.heroButton} ${styles.secondary}`} aria-label="Report a disaster">
            Report Disaster
          </Link>
        </div>
      </div>

      {/* <div className={styles.navigationDots}>
        {heroImages.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === currentSlide ? styles.active : ""}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentSlide ? "true" : "false"}
          />
        ))}
      </div> */}

      {/* <div className={styles.scrollIndicator}>
        <span>Scroll to explore</span>
        <div className={styles.scrollArrow}>↓</div>
      </div> */}
    </section>
  );
};

export default HeroSection;