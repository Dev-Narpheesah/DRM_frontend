import React from 'react';
import styles from './About.module.css';

const About = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.imageWrapper}>
          <img src="about.jpg" alt="About Us" className={styles.image} />
        </div>
        <div className={styles.content}>
          <h1 className={styles.title}>About Us</h1>
          <p className={styles.description}>
            At Relief, we believe that disasters can strike at any moment, leaving communities devastated and in need of urgent support. That's why we created a platform that streamlines disaster response and connects volunteers and resources with those who need them most.
          </p>
          <h2 className={styles.subtitle}>Our Mission</h2>
          <p className={styles.text}>
            Our mission is to provide a comprehensive framework for disaster relief efforts, enabling swift and effective response and recovery. We aim to harness the power of technology and collaboration to make a meaningful difference in the lives of individuals affected by disasters.
          </p>
          <h2 className={styles.subtitle}>Our Vision</h2>
          <p className={styles.text}>
            Our vision is to build a world where disaster response is swift, efficient, and compassionate. We envision a future where communities are resilient, and individuals are empowered to rebuild and thrive in the face of adversity.
          </p>
          <h2 className={styles.subtitle}>How We Work</h2>
          <p className={styles.text}>
            Our platform is designed to facilitate seamless coordination between disaster response teams, volunteers, and resource providers. By leveraging cutting-edge technology and a robust network of partners, we ensure that aid reaches those who need it most, quickly and efficiently.
          </p>
          <h2 className={styles.subtitle}>Our Values</h2>
          <ul className={styles.valuesList}>
            <li><strong>Compassion:</strong> We care deeply about the well-being of individuals affected by disasters and are committed to providing support with empathy and kindness.</li>
            <li><strong>Collaboration:</strong> We believe that collective action is key to effective disaster response and recovery.</li>
            <li><strong>Innovation:</strong> We harness the power of technology to streamline disaster response and improve outcomes.</li>
            <li><strong>Resilience:</strong> We empower communities to rebuild and thrive in the face of adversity.</li>
          </ul>
          <section className={styles.services}>
            <h2 className={styles.subtitle}>Our Services</h2>
            <div className={styles.ServiceItems}>
              <ServiceItem 
                title="Features"
                features={[
                  "Incident Reporting",
                  "Resource Management",
                  "Affected Individual Tracking",
                  "Volunteer Management"
                ]}
              />
              <ServiceItem 
                title="Benefits"
                features={[
                  "Improved Impact",
                  "Efficient Response Coordination",
                  "Maximized Resource Allocation",
                  "Effective Disaster Relief Management"
                ]}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const ServiceItem = ({ title, features }) => (
  <div className={styles.ServiceItem}>
    <h3 className={styles.serviceTitle}>{title}</h3>
    <ul className={styles.featureList}>
      {features.map((feature, index) => (
        <li key={index} className={styles.featureItem}>{feature}</li>
      ))}
    </ul>
  </div>
);

export default About;
