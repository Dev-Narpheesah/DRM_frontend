import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "../SideBar/SideBar";
import CommentSection from "./CommentSection";
import SocialFeatures from "./SocialFeatures";
import styles from "./DisasterCard.module.css";
const DisasterCard = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const sentinelRef = useRef(null);
  const navigate = useNavigate();

  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://drm-backend.vercel.app/api/reports`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch reports: ${response.statusText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received from server");
        }

        // If ?mine=1, filter to current user's reports
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const mine = query.get('mine') === '1';
        const filtered = mine && currentUser?.id
          ? data.filter((r) => (r.userId === currentUser.id || r.user === currentUser.id))
          : data;

        setReports(filtered);
      } catch (error) {
        console.error("Error fetching reports:", error);
        setError(error.message);
        toast.error(error.message || "Failed to load reports.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [location.search, query]);

  // Infinite scroll: reveal more already-fetched reports
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCount((c) => c + 6);
          }
        });
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [sentinelRef]);

  const handleDonationClick = (reportId) => {
    navigate(`/donate`);
    toast.info("Redirecting to donation page...");
  };

  const handleSidebarToggle = (isOpen) => {
    setIsSidebarOpen(isOpen);
  };

  if (isLoading) {
    return (
      <div className={styles.appContainer}>
        <Sidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />
        <div
          className={`${styles.mainContent} ${
            isSidebarOpen ? styles.sidebarOpen : styles.sidebarCollapsed
          }`}
        >
          <div className={styles.cardContainer}>
            <p>Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.appContainer}>
        <Sidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />
        <div
          className={`${styles.mainContent} ${
            isSidebarOpen ? styles.sidebarOpen : styles.sidebarCollapsed
          }`}
        >
          <div className={styles.cardContainer}>
            <p className={styles.error}>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className={styles.appContainer}>
        <Sidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />
        <div
          className={`${styles.mainContent} ${
            isSidebarOpen ? styles.sidebarOpen : styles.sidebarCollapsed
          }`}
        >
          <div className={styles.cardContainer}>
            <p>No disaster reports available at this time.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      <Sidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />
      <div
        className={`${styles.mainContent} ${
          isSidebarOpen ? styles.sidebarOpen : styles.sidebarCollapsed
        }`}
      >
        <header className={styles.pageHeader}>
          <h1>Disaster Reports</h1>
          <p>Stay informed about recent disaster events</p>
        </header>
        <div className={styles.cardContainer}>
          {reports.slice(0, visibleCount).map((report) => {
            if (!report?._id || !report?.disasterType || !report?.report) {
              console.warn("Invalid report data:", report);
              return null;
            }

            const timestamp = report.createdAt
              ? new Date(report.createdAt).toLocaleString()
              : "Unknown date";

            return (
              <div className={styles.postCard} key={report._id}>
                <div className={styles.postHeader}>
                  <div className={styles.postAvatar}></div>
                  <div>
                    <h3 className={styles.postTitle}>{report.disasterType}</h3>
                    <p className={styles.postTimestamp}>{timestamp}{report.location ? ` · ${report.location}` : ''}</p>
                  </div>
                </div>
                <div className={styles.postContent}>
                  <p>{report.report || "No description available"}</p>
                  {report.image?.url && (
                    <img
                      src={report.image.url}
                      alt={report.disasterType}
                      className={styles.postImage}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "/default-disaster-image.jpg";
                      }}
                    />
                  )}
                </div>
                <div className={styles.postActions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleDonationClick()}
                  >
                    Donate
                  </button>
                  <Link
                    to={`/disReport/${report._id}`}
                    className={styles.actionButton}
                  >
                    Details
                  </Link>
                </div>
                <div className={styles.postFooter}>
                  <SocialFeatures reportId={report._id} />
                </div>
              </div>
            );
          })}
          {visibleCount < reports.length && (
            <div ref={sentinelRef} style={{ height: 1 }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DisasterCard;
