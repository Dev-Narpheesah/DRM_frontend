import React from "react";
import { Link } from "react-router-dom";
import styles from  "./Service.module.css";

const Service = () => {
  return (
    <div className={styles.service}>
      <div className={styles.three}>
        <ServiceCard
          imgSrc="serve.jpeg"
          linkTo=""
          title1="Affected Individual Tracking"
          description="Our affected individual tracking system enables real-time tracking, needs assessment, customizable reports, and multi-user access for effective coordination and assistance to those affected by the…"
        />
        <ServiceCard
          imgSrc="res.webp"
          linkTo=""
          title2="Resource Management"
          description="Our resource management system tracks and allocates resources in real-time, with customizable reports and multi-user access for effective collaboration."
        />
        <ServiceCard
          imgSrc="phone.png"
          linkTo=""
          title3="Incident Reporting"
          description="Our incident reporting system enables real-time reporting, location tracking, and customizable reports to ensure accurate and efficient communication between all parties involved in disaster response…"
        />
      </div>
    </div>
  );
};

const ServiceCard = ({ imgSrc, linkTo, title1, title2, title3, description }) => (
  <div className={styles.one}>
    <img src={imgSrc} alt={title1} />
    
    <h2>
      <Link to='/affect'>{title1}</Link>
      <Link to='/resource'>{title2}</Link>
      <Link to='/resource'>{title3}</Link>
    
    </h2>
    <p>{description}</p>
  </div>
);

export default Service;
