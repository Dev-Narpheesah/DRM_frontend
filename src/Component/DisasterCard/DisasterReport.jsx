import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './DisasterReport.module.css';

const DisasterReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://drm-backend.vercel.app/api/user/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            
          },
          credentials: 'include' 
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch report: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data) {
          throw new Error('No report data received');
        }

        setReport(data);
      } catch (error) {
        console.error("Error fetching report:", error);
        setError(error.message || "Failed to fetch report. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.loading}>Loading report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error}</p>
        <button onClick={goBack} className={styles.backButton}>Go Back</button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>Report not found.</p>
        <button onClick={goBack} className={styles.backButton}>Go Back</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          {report.disasterType || 'Unknown Disaster'}
        </h1>
        {report.image?.url ? (
          <img 
            src={report.image.url} 
            alt={report.disasterType || 'Disaster'} 
            className={styles.image}
            onError={(e) => {
              e.target.src = '/default-disaster-image.jpg'; // Fallback image
            }}
          />
        ) : (
          <div className={styles.noImage}>No image available</div>
        )}
        <p className={styles.description}>
          {report.report || 'No description provided'}
        </p>
        <p className={styles.details}>
          <strong>Location:</strong> {report.location || 'Not specified'}
        </p>
        <p className={styles.details}>
          <strong>Email:</strong> {report.email || 'Not provided'}
        </p>
        <p className={styles.details}>
          <strong>Phone:</strong> {report.phone || 'Not provided'}
        </p>
        <button onClick={goBack} className={styles.backButton}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default DisasterReport;