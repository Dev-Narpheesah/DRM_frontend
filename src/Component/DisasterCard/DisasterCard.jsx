import React, { useEffect, useState } from 'react';
import styles from './DisasterCard.module.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const DisasterCard = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('https://drm-backend.vercel.app/api/user')
        // ("http://localhost:4000/api/user");
        setReports(response.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast.error("Failed to load reports.");
      }
    };

    fetchReports();
  }, []);

  return (
    <div className={styles.cardContainer}>
      {reports.map((report) => (
        <div className={styles.card} key={report._id}>
          <img src={report.image.url} alt="Disaster" className={styles.cardImage} />
          <h1 className={styles.cardTitle}>{report.disasterType}</h1>
          <p className={styles.cardDescription}>
            {report.report.length > 10 ? `${report.report.substring(0, 10)}...` : report.report}
          </p>
          <button className={styles.cardButton}>
            <Link to={`/disReport/${report._id}`}>Learn More</Link> 
          </button>
        </div>
      ))}
    </div>
  );
};

export default DisasterCard;
