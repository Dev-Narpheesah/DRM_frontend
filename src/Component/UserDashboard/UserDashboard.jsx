import React, { useEffect, useState } from "react";
import Sidebar from "../SideBar/SideBar";
import styles from "./UserDashboard.module.css";

const UserDashboard = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("userInfo"));
  const userId = user?._id;
  const token = user?.token;

  const fetchUserDisasters = async () => {
    try {
      const res = await fetch(
        `https://drm-backend.vercel.app/api/user/report/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      setReports(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (userId) fetchUserDisasters();
  }, [userId]);

  return (
    <div className={styles.layout}>
      <Sidebar username={user?.username} />

      <main className={styles.dashboardContainer}>
        <h2 className={styles.greeting}>Hi {user?.username} 👋</h2>
        <p className={styles.subHeading}>Here are your submitted reports:</p>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.tableWrapper}>
          {reports.length > 0 ? (
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Disaster Type</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td>{report.disasterType}</td>
                    <td>{report.location}</td>
                    <td>{new Date(report.date).toLocaleDateString()}</td>
                    <td>{report.status || "Pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.noReports}>No reports submitted yet.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
