import React from 'react';
import { Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import styles from './Footer.module.css';

const Footer = () => {
  const date = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.contain}>
        <div className={styles.footerSection}>
          <h3>Contact Us</h3>
          <p>Email: <a href="mailto:info@example.com">info@example.com</a></p>
          <p>Phone: <a href="tel:+121565565556">+121 56556 565556</a></p>
          <p>Address: Your Address, 123 Street</p>
        </div>
        <div className={styles.footerSection}>
          <h3>Quick Links</h3>
          <ul className={styles.footerLinks}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div className={styles.footerSection}>
          <h3>Follow Us</h3>
          <ul className={styles.socialIcons}>
            <li><a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a></li>
            <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a></li>
            <li><a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a></li>
            <li><a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a></li>
          </ul>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <p>&copy; {date} All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
