import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../SideBar/SideBar";
import styles from "./UserDashboard.module.css";
import { io } from "socket.io-client";

const SOCKET_URL = "https://drm-backend.vercel.app";

const UserDashboard = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");

  // Read signed-in user from localStorage set by SignIn
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = storedUser?.email;

  const fetchUserDisasters = async () => {
    try {
      if (!userEmail) {
        throw new Error("Missing user email. Please sign in again.");
      }

      const res = await fetch(
        `https://drm-backend.vercel.app/api/user/reports?email=${encodeURIComponent(
          userEmail
        )}`
      );

      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load your reports");
    }
  };

  useEffect(() => {
    fetchUserDisasters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userEmail]);

  // Socket.IO setup for live updates
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    const onCreated = (payload) => {
      if (payload?.email && payload.email === userEmail) {
        setReports((prev) => [payload, ...prev]);
      }
    };

    const onUpdated = (payload) => {
      if (payload?.email && payload.email === userEmail) {
        setReports((prev) => prev.map((r) => (r._id === payload._id ? payload : r)));
      }
    };

    const onDeleted = (payload) => {
      if (payload?._id) {
        setReports((prev) => prev.filter((r) => r._id !== payload._id));
      }
    };

    socket.on("report:created", onCreated);
    socket.on("report:updated", onUpdated);
    socket.on("report:deleted", onDeleted);

    return () => {
      socket.off("report:created", onCreated);
      socket.off("report:updated", onUpdated);
      socket.off("report:deleted", onDeleted);
      socket.close();
    };
  }, [userEmail]);

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

  return (
    <div className={styles.layout}>
      <Sidebar username={greetingName} notificationCount={notificationCount} />

      <main className={styles.dashboardContainer}>
        <h2 className={styles.greeting}>Hi {greetingName} 👋</h2>
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
