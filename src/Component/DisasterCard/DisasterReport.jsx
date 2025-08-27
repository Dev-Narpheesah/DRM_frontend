import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./DisasterReport.module.css";
import Map from "../Map/MapLeaf";
import SocialFeatures from "./SocialFeatures";

const DisasterReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const relativeTime = useMemo(() => {
    if (!report?.createdAt) return "";
    const diffMs = Date.now() - new Date(report.createdAt).getTime();
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h`;
    const day = Math.floor(hr / 24);
    return `${day}d`;
  }, [report?.createdAt]);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          // `https://drm-backend.vercel.app/api/user/${id}`,

          `https://drm-backend.vercel.app/api/reports/${id}`,

          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch report: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data) {
          throw new Error("No report data received");
        }

        setReport(data);
      } catch (error) {
        console.error("Error fetching report:", error);
        setError(
          error.message || "Failed to fetch report. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const goBack = () => navigate(-1);

  if (loading)
    return (
      <div className={styles.container}>
        <p>Loading report...</p>
      </div>
    );
  if (error)
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error}</p>
        <button onClick={goBack} className={styles.backButton}>
          Go Back
        </button>
      </div>
    );
  if (!report)
    return (
      <div className={styles.container}>
        <p className={styles.error}>Report not found.</p>
        <button onClick={goBack} className={styles.backButton}>
          Go Back
        </button>
      </div>
    );

  return (
    <div className={styles.container}>
      <article className={styles.postCard}>
        <header className={styles.postHeader}>
          <div className={styles.postAvatar} aria-hidden>
            {(report.disasterType || 'D').slice(0, 1)}
          </div>
          <div className={styles.postMeta}>
            <h2 className={styles.postTitle}>{report.disasterType || "Unknown Disaster"}</h2>
            <div className={styles.postSubMeta}>
              <span>{report.location || 'Unknown location'}</span>
              <span>·</span>
              <time dateTime={report.createdAt || ''}>
                {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Unknown date'}
              </time>
            </div>
          </div>
          <button onClick={goBack} className={styles.backButton}>
            Go Back
          </button>
        </header>

        {report.image?.url && (
          <div className={styles.imageWrapper}>
            <img
              src={report.image.url}
              alt={report.disasterType || "Disaster"}
              loading="lazy"
              onClick={() => setIsLightboxOpen(true)}
              onError={(e) => (e.target.src = "/default-disaster-image.jpg")}
            />
          </div>
        )}

        <div className={styles.postBody}>
          <p className={styles.description}>{report.report || "No description provided"}</p>
        </div>

        <div className={styles.postExtras}>
          <div className={styles.mapWrapper}>
            <Map
              address={report.location || "Lagos, Nigeria"}
              title={report.disasterType}
              details={{
                "Reported On": report.createdAt ? new Date(report.createdAt).toLocaleString() : "Unknown",
                Location: report.location || "Not specified",
                Email: report.email || undefined,
                Phone: report.phone || undefined,
              }}
            />
          </div>
        </div>

        <footer className={styles.postFooter}>
          <div className={styles.summaryRow}>
            {/* Placeholder summary; SocialFeatures can emit a custom event to update these */}
            <span className={styles.summaryItem}>{report.location || ""}</span>
            <span className={styles.dot}>·</span>
            <span className={styles.summaryItem}>{relativeTime}</span>
          </div>
          <SocialFeatures reportId={id} />
        </footer>

        {isLightboxOpen && report.image?.url && (
          <div className={styles.lightbox} role="dialog" aria-modal="true" onClick={() => setIsLightboxOpen(false)}>
            <img src={report.image.url} alt={report.disasterType || 'Disaster'} />
          </div>
        )}
      </article>
    </div>
  );
};

export default DisasterReport;
