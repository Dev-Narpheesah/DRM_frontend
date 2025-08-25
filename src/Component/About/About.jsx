import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { FaHeart, FaShieldAlt, FaUsers, FaLightbulb } from 'react-icons/fa';
import styles from './About.module.css';

const About = () => {
  const { isDarkMode } = useTheme();

  return (
    <section className={`${styles.aboutSection} ${isDarkMode ? styles.dark : ''}`}>
      <div className={styles.container}>
        <h2 className={styles.heading}>About Relief</h2>
        <p className={styles.intro}>
          Relief is a platform dedicated to streamlining disaster response, 
          connecting volunteers and resources with communities in need.
        </p>

        <div className={styles.grid}>
          <Block 
            icon={<FaHeart className={styles.icon} />} 
            title="Our Mission" 
            text="To deliver swift, effective disaster relief through technology and collaboration."
          />
          <Block 
            icon={<FaShieldAlt className={styles.icon} />} 
            title="Our Vision" 
            text="A world where disaster response is fast, efficient, and compassionate, empowering resilient communities."
          />
          <Block 
            icon={<FaUsers className={styles.icon} />} 
            title="How We Work" 
            text="We coordinate disaster response teams, volunteers, and resources using advanced technology for rapid aid delivery."
          />
          <Block 
            icon={<FaLightbulb className={styles.icon} />} 
            title="Our Values"
            text={
              <ul className={styles.values}>
                <li><strong>Compassion:</strong> Supporting communities with empathy.</li>
                <li><strong>Collaboration:</strong> Uniting efforts for effective relief.</li>
                <li><strong>Innovation:</strong> Leveraging technology for better outcomes.</li>
                <li><strong>Resilience:</strong> Empowering communities to rebuild.</li>
              </ul>
            }
          />
        </div>

        <div className={styles.services}>
          <ServiceItem
            title="Features"
            features={["Incident Reporting", "Resource Management", "Individual Tracking", "Volunteer Coordination"]}
          />
          <ServiceItem
            title="Benefits"
            features={["Enhanced Impact", "Efficient Coordination", "Optimized Resources", "Effective Relief"]}
          />
        </div>
      </div>
    </section>
  );
};

const Block = ({ icon, title, text }) => (
  <div className={styles.block}>
    {icon}
    <h3>{title}</h3>
    <p>{text}</p>
  </div>
);

const ServiceItem = ({ title, features }) => (
  <div className={styles.serviceItem}>
    <h4>{title}</h4>
    <ul>
      {features.map((f, i) => (
        <li key={i}>{f}</li>
      ))}
    </ul>
  </div>
);

export default About;