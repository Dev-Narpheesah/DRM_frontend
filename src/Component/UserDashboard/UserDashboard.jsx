import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../SideBar/SideBar";
import styles from "./UserDashboard.module.css";


const UserDashboard = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");

  // Read signed-in user from localStorage set by SignIn
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = storedUser?.email;
  const authToken = storedUser?.token;

  const fetchUserDisasters = async () => {
    try {
      if (!userEmail || !authToken) {
        throw new Error("Please sign in to view your reports");
      }

      // Combine token-owned and email-submitted reports
      const [byToken, byEmail] = await Promise.all([
        fetch("https://drm-backend.vercel.app/api/reports/my", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }),
        fetch(
          `https://drm-backend.vercel.app/api/reports/my?email=${encodeURIComponent(
          userEmail
          )}`,
          { headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` } }
        ),
      ]);

      if (!byEmail.ok || !byToken.ok) {
        const status = !byEmail.ok ? byEmail.status : byToken.status;
        throw new Error(`Failed to fetch reports (HTTP ${status})`);
      }

      const tokenReports = authToken ? await byToken.json() : [];
      const emailReports = await byEmail.json();

      const map = new Map();
      [...(Array.isArray(tokenReports) ? tokenReports : []), ...(Array.isArray(emailReports) ? emailReports : [])].forEach((r) => {
        if (r && r._id) map.set(r._id, r);
      });
      setReports(Array.from(map.values()));
    } catch (err) {
      setError(err.message || "Unable to load your reports");
    }
  };

  useEffect(() => {
    fetchUserDisasters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userEmail]);

  // WebSocket removed for Vercel compatibility
  useEffect(() => {}, [userEmail]);

  const greetingName = storedUser?.username || storedUser?.email || "User";

  // Memoized notifications: recent (48h) or pending
  const notificationCount = useMemo(() => {
    const now = Date.now();
    return reports.filter((r) => {
      const isRecent = r?.createdAt ? now - new Date(r.createdAt).getTime() < 1000 * 60 * 60 * 48 : false;
      const isPending = (r?.status || "Pending").toLowerCase() === "pending";
      return isRecent || isPending;
    }).length;
  }, [reports]);

  if (!userEmail) {
    return (
      <div className={styles.layout}>
        <Sidebar username={"Guest"} notificationCount={0} />
        <main className={styles.dashboardContainer}>
          <p className={styles.error}>You need to sign in to view your dashboard.</p>
          <p>
            <a href="/">Go back home</a>
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar username={greetingName} notificationCount={notificationCount} />

      <main className={styles.dashboardContainer}>
        <h2 className={styles.greeting}>Hi {greetingName} </h2>
        <p className={styles.subHeading}>Here are your submitted reports:</p>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.tableWrapper}>
          {reports.length > 0 ? (
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Disaster Type</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td>
                      {report.image?.url ? (
                        <img
                          src={report.image.url}
                          alt={report.disasterType || "disaster"}
                          style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }}
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{report.disasterType || "-"}</td>
                    <td>{report.location || "-"}</td>
                    <td>
                      {report.createdAt
                        ? new Date(report.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
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
