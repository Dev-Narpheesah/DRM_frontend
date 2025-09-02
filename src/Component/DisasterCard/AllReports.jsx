import React, { useEffect, useState, useRef } from "react";
import { API_URL } from "../../config";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "../SideBar/SideBar";
import SocialFeatures from "./SocialFeatures";
import styles from "./DisasterCard.module.css";

const AllReports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const sentinelRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/reports`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch reports: ${response.statusText}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid response format from server");

        setReports(data);
      } catch (err) {
        console.error("Error fetching all reports:", err);
        setError(err.message);
        toast.error(err.message || "Failed to load reports.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  // infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisibleCount((c) => c + 6);
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  const handleDonationClick = () => {
    navigate("/donate");
    toast.info("Redirecting to donation page...");
  };

  return (
    <div className={styles.appContainer}>
      <Sidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
      <div className={`${styles.mainContent} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarCollapsed}`}>
        <header className={styles.pageHeader}>
          <h1>All Disaster Reports</h1>
          <p>Stay informed about recent disaster events.</p>
        </header>

        {isLoading && <p>Loading reports...</p>}
        {error && <p className={styles.error}>Error: {error}</p>}
        {!isLoading && !error && reports.length === 0 && <p>No disaster reports available at this time.</p>}

        <div className={styles.cardContainer}>
          {reports.slice(0, visibleCount).map((report) => (
            <div className={styles.postCard} key={report._id}>
              <div className={styles.postHeader}>
                <h3 className={styles.postTitle}>{report.disasterType}</h3>
                <p className={styles.postTimestamp}>
                  {new Date(report.createdAt).toLocaleString()} {report.location && `· ${report.location}`}
                </p>
              </div>
              <div className={styles.postContent}>
                <p>{report.report}</p>
                {report.image?.url && <img src={report.image.url} alt="disaster" className={styles.postImage} />}
              </div>
              <div className={styles.postActions}>
                <button className={styles.actionButton} onClick={handleDonationClick}>
                  Donate
                </button>
                <Link to={`/disReport/${report._id}`} className={styles.actionButton}>
                  Details
                </Link>
              </div>
              <div className={styles.postFooter}>
                <SocialFeatures reportId={report._id} />
              </div>
            </div>
          ))}
          {visibleCount < reports.length && <div ref={sentinelRef} style={{ height: 1 }} />}
        </div>
      </div>
    </div>
  );
};

export default AllReports;
