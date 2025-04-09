import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./HeroSection.module.css";

const heroImages = [
  { url: 'flood.jpeg', title: 'Empower Hope', subtitle: 'Be the change in flood-stricken areas.' },
  { url: 'res.jpeg', title: 'Rapid Action, Real Impact', subtitle: 'Mobilize resources for wildfire recovery.' },
  { url: 'hurricane.jpeg', title: 'Resilience in the Storm', subtitle: 'Supporting communities through every hurricane.' },
  { url: 'flames.jpeg', title: 'United for Relief', subtitle: 'Harness the power of volunteer efforts globally.' },
  { url: 'art.jpeg', title: 'Every Report Counts', subtitle: 'Your voice matters in disaster response.' },
  { url: 'erosion.jpeg', title: 'Preserve Our Lands', subtitle: 'Combating erosion with sustainable solutions.' },
  { url: 'tsunamis.jpeg', title: 'Waves of Support', subtitle: 'Helping communities rebuild after tsunamis.' },
  { url: 'earthquake.jpeg', title: 'Standing Strong', subtitle: 'Rebuilding lives after devastating earthquakes.' },
  { url: 'drought.jpeg', title: 'Hope in Dry Times', subtitle: 'Providing resources in drought-stricken regions.' },
  { url: 'blizzard.jpeg', title: 'Surviving the Cold', subtitle: 'Delivering aid during harsh winter storms.' },
  { url: 'landslide.jpeg', title: 'Overcoming Landslides', subtitle: 'Restoring communities after landslides.' },
  { url: 'volcano.jpeg', title: 'Volcanic Vigilance', subtitle: 'Responding swiftly to volcanic eruptions.' }
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
