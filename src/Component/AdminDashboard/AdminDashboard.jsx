import React, { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import { UserContext } from "../../../context/userContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../SideBar/SideBar"; // ✅ New Sidebar
import styles from "./AdminDashboard.module.css";
import {
  FaCheck,
  FaHourglassHalf,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const itemsPerPage = 10;

  // Utility
  const shortenText = (text = "", n) =>
    text?.length > n ? `${text.substring(0, n)}...` : text;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("https://drm-backend.vercel.app/api/user");
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch user data.");
        setError("Unable to load user data.");
      }
    };

  
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchUsers()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) throw new Error("Invalid date");
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const disastersToDisplay = useMemo(
    () =>
      disasters.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
      ),
    [disasters, currentPage]
  );

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      {/* ✅ Sidebar */}
      <Sidebar username={user?.username} isAdmin={true} />

      {/* ✅ Main Dashboard */}
      <main className={styles.dashboard}>
        <div className={styles.topSection}>
          <h1>Admin Dashboard</h1>
          <p>Manage users, reports, and disasters efficiently!</p>
        </div>

        {/* ✅ Stats */}
        <div className={styles.statistics}>
          <div className={styles.statCard}>
            <h3>Total Users</h3>
            <p>{users.length}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Total Disasters</h3>
            <p>{disasters.length}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Active Disasters</h3>
            <p>{disasters.filter((d) => d.status !== "Resolved").length}</p>
          </div>
        </div>

        {/* ✅ Users Table */}
        <div className={styles.tableSection}>
          <h2>Users</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.location || "N/A"}</td>
                      <td>{formatDate(u.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ Disasters Table */}
        <div className={styles.tableSection}>
          <h2>Disaster Data</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Disaster Type</th>
                  <th>Country</th>
                  <th>Date</th>
                  <th>Injured</th>
                  <th>Deaths</th>
                  <th>Necessities</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {disastersToDisplay.length > 0 ? (
                  disastersToDisplay.map((d) => (
                    <tr key={d.id}>
                      <td>{shortenText(d.disasterType, 20)}</td>
                      <td>{shortenText(d.country, 20)}</td>
                      <td>{formatDate(d.date)}</td>
                      <td>{d.injured}</td>
                      <td>{d.death}</td>
                      <td>{shortenText(d.necessity, 20)}</td>
                      <td>
                        {d.status === "Resolved" ? (
                          <FaCheck className={styles.resolvedIcon} />
                        ) : (
                          <FaHourglassHalf className={styles.ongoingIcon} />
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No disaster data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
              disabled={currentPage === 0}
              className={styles.pageButton}
            >
              <FaArrowLeft />
            </button>
            <span>
              Page {currentPage + 1} of{" "}
              {Math.ceil(disasters.length / itemsPerPage)}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) =>
                  (p + 1) * itemsPerPage < disasters.length ? p + 1 : p
                )
              }
              disabled={(currentPage + 1) * itemsPerPage >= disasters.length}
              className={styles.pageButton}
            >
              <FaArrowRight />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
