import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './DisasterReport.module.css';

const DisasterReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get('https://drm-backend.vercel.app/')
        // (`http://localhost:4000/api/user/${id}`);
        setReport(response.data);
      } catch (error) {
        console.error("Error fetching report:", error);
        setError("Failed to fetch report. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const goBack = () => {
    navigate(-1);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!report) return <p>Report not found.</p>;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>{report.disasterType}</h1>
        {report.image && <img src={report.image.url} alt="Disaster" className={styles.image} />}
        <p className={styles.description}>{report.report}</p>
        <p className={styles.details}><strong>Location:</strong> {report.location}</p>
        <p className={styles.details}><strong>Email:</strong> {report.email}</p>
        <p className={styles.details}><strong>Phone:</strong> {report.phone}</p>
        <button onClick={goBack} className={styles.backButton}>Go Back</button>
      </div>
    </div>
  );
};

export default DisasterReport;
