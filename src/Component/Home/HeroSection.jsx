import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./HeroSection.module.css";

const heroImages = [
  {
    url: 'modern_flood_response.jpg',
    title: 'Empower Resilience',
    subtitle: 'Rebuilding communities in the wake of rising waters.'
  },
  {
    url: 'ai_wildfire_detection.jpg',
    title: 'AI for Wildfire Relief',
    subtitle: 'Using technology to fight and recover from wildfires.'
  },
  {
    url: 'urban_hurricane_aid.jpg',
    title: 'Shelter from the Storm',
    subtitle: 'Urban hubs united against hurricane havoc.'
  },
  {
    url: 'real_time_disaster_reporting.jpg',
    title: 'Report. React. Recover.',
    subtitle: 'Real-time data driving faster relief.'
  },
  {
    url: 'green_reforestation_project.jpg',
    title: 'Green the Earth',
    subtitle: 'Fighting erosion through sustainable reforestation.'
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // 5s for smoother transition
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <section 
      className={styles.hero}
      style={{ backgroundImage: `url(${heroImages[currentSlide].url})` }}
    >
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>{heroImages[currentSlide].title}</h1>
        <p className={styles.heroSubtitle}>{heroImages[currentSlide].subtitle}</p>
        <Link to="/donate" className={styles.joinUsButton}>Donate</Link>
      </div>

      {/* Navigation dots */}
      <div className={styles.navigationDots}>
        {heroImages.map((_, index) => (
          <span 
            key={index}
            className={`${styles.dot} ${index === currentSlide ? styles.active : ""}`}
            onClick={() => setCurrentSlide(index)}
          ></span>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
