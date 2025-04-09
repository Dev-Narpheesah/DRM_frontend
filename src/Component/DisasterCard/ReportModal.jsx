
import React from 'react';
import { FaInfoCircle } from 'react-icons/fa'; 
import styles from './ReportModal.module.css';

const ReportModal = ({ report, onClose }) => {
  if (!report) return null; 

  const goBack = () => {
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={goBack}>
          &times;
        </button>
        <h1 className={styles.title}>
          <FaInfoCircle className={styles.infoIcon} /> 
          {report.disasterType}
        </h1>
        
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

export default ReportModal;
