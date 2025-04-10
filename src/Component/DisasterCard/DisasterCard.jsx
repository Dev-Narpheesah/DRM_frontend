import React, { useEffect, useState } from 'react';
import styles from './DisasterCard.module.css';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const DisasterCard = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('https://drm-backend.vercel.app/api/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
           
          },
          credentials: 'include' 
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch reports: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Validate data structure
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from server');
        }

        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
        setError(error.message);
        toast.error(error.message || "Failed to load reports.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.cardContainer}>
        <p>Loading reports...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.cardContainer}>
        <p className={styles.error}>Error: {error}</p>
      </div>
    );
  }

  // Empty state
  if (reports.length === 0) {
    return (
      <div className={styles.cardContainer}>
        <p>No disaster reports available at this time.</p>
      </div>
    );
  }

  return (
    <div className={styles.cardContainer}>
      {reports.map((report) => {
        // Add basic validation for report properties
        if (!report?._id || !report?.disasterType || !report?.report) {
          console.warn('Invalid report data:', report);
          return null;
        }

        return (
          <div className={styles.card} key={report._id}>
            <img 
              src={report.image?.url || '/default-disaster-image.jpg'} 
              alt={report.disasterType || 'Disaster'} 
              className={styles.cardImage}
              onError={(e) => {
                e.target.src = '/default-disaster-image.jpg'; // Fallback image
              }}
            />
            <h1 className={styles.cardTitle}>
              {report.disasterType || 'Unknown Disaster'}
            </h1>
            <p className={styles.cardDescription}>
              {report.report?.length > 10 
                ? `${report.report.substring(0, 10)}...` 
                : report.report || 'No description available'}
            </p>
            <button className={styles.cardButton}>
              <Link to={`/disReport/${report._id}`}>Learn More</Link>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default DisasterCard;