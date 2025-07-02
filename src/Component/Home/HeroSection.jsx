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
  {
    url: 'coastal_tsunami_rebuild.jpg',
    title: 'Rising Again',
    subtitle: 'Tsunami-struck towns finding strength in unity.'
  },
  {
    url: 'earthquake_drone_aid.jpg',
    title: 'Drones of Hope',
    subtitle: 'Precision aid delivery after quakes.'
  },
  {
    url: 'smart_irrigation_drought.jpg',
    title: 'Innovate to Irrigate',
    subtitle: 'Smart farming in drought zones.'
  },
  {
    url: 'arctic_aid_delivery.jpg',
    title: 'Warming the Coldest Hearts',
    subtitle: 'Bringing warmth to blizzard-battered lives.'
  },
  {
    url: 'landslide_sensor_monitoring.jpg',
    title: 'Prevent the Fall',
    subtitle: 'Predicting and preventing landslides with tech.'
  },
  {
    url: 'volcano_drone_monitor.jpg',
    title: 'Eyes on the Volcano',
    subtitle: 'Saving lives with real-time eruption monitoring.'
  }
];


const HeroSection = () => {
  const handleJoinUsClick = () => {
    // alert('Thank you for donating! ');
  };
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % heroImages.length);
    }, 2000); 
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <div 
      className={styles.hero} 
      style={{ backgroundImage: `url(${heroImages[currentSlide].url})` }}
    >
      <div className={styles.heroOverlay}></div>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>{heroImages[currentSlide].title}</h1>
        <p className={styles.heroSubtitle}>{heroImages[currentSlide].subtitle}</p>
        <button className={styles.joinUsButton} onClick={handleJoinUsClick}>
            <Link to="/help">Donate</Link>
          </button>
      </div>
      <div className={styles.navigationDots}>
        {heroImages.map((_, index) => (
          <span 
            key={index} 
            className={`${styles.dot} ${index === currentSlide ? styles.active : ''}`} 
            onClick={() => setCurrentSlide(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
