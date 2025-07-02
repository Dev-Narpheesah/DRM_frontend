import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './DisasterCard.module.css';
import CommentSection from './CommentSection'; 

const DisasterCard = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

 

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://drm-backend.vercel.app/api/user`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch reports: ${response.statusText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from server');
        }

        setReports(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setError(error.message);
        toast.error(error.message || 'Failed to load reports.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleDonationClick = (reportId) => {
    navigate(`/donate/${reportId}`);
    toast.info('Redirecting to donation page...');
  };

  if (isLoading) {
    return (
      <div className={styles.cardContainer}>
        <p>Loading reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.cardContainer}>
        <p className={styles.error}>Error: {error}</p>
      </div>
    );
  }

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
        if (!report?._id || !report?.disasterType || !report?.report) {
          console.warn('Invalid report data:', report);
          return null;
        }

        const timestamp = report.createdAt
          ? new Date(report.createdAt).toLocaleString()
          : 'Unknown date';

        return (
          <div className={styles.postCard} key={report._id}>
            {/* Post Header */}
            <div className={styles.postHeader}>
              <div className={styles.postAvatar}></div>
              <div>
                <h3 className={styles.postTitle}>{report.disasterType}</h3>
                <p className={styles.postTimestamp}>{timestamp}</p>
              </div>
            </div>

            {/* Post Content */}
            <div className={styles.postContent}>
              <p>{report.report || 'No description available'}</p>
              {report.image?.url && (
                <img
                  src={report.image.url}
                  alt={report.disasterType}
                  className={styles.postImage}
                  onError={(e) => {
                    e.target.src = '/default-disaster-image.jpg';
                  }}
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className={styles.postActions}>
              <button
                className={styles.actionButton}
                onClick={() => handleDonationClick(report._id)}
              >
                Donate
              </button>
              <Link
                to={`/disReport/${report._id}`}
                className={styles.actionButton}
              >
                Learn More
              </Link>
            </div>

           
            <CommentSection reportId={report._id} />
          </div>
        );
      })}
    </div>
  );
};

export default DisasterCard;