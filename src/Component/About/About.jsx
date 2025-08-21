import React from 'react';
import { HeartIcon, UsersIcon, LightBulbIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import styles from './About.module.css';

const About = () => {
  return (
    <section className={styles.aboutSection}>
      <div className={styles.overlay}></div>
      <div className={styles.container}>
        
        <h2 className={styles.heading}>About Relief</h2>
        <p className={styles.intro}>
          Relief is a platform dedicated to streamlining disaster response, 
          connecting volunteers and resources with communities in need.
        </p>

        {/* Mission, Vision, etc. */}
        <div className={styles.grid}>
          <Block 
            icon={<HeartIcon className={styles.icon} />} 
            title="Our Mission" 
            text="To deliver swift, effective disaster relief through technology and collaboration."
          />
          <Block 
            icon={<ShieldCheckIcon className={styles.icon} />} 
            title="Our Vision" 
            text="A world where disaster response is fast, efficient, and compassionate, empowering resilient communities."
          />
          <Block 
            icon={<UsersIcon className={styles.icon} />} 
            title="How We Work" 
            text="We coordinate disaster response teams, volunteers, and resources using advanced technology for rapid aid delivery."
          />
          <Block 
            icon={<LightBulbIcon className={styles.icon} />} 
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

        {/* Features & Benefits */}
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
