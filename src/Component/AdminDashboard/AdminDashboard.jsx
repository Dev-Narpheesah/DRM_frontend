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
        const adminToken = localStorage.getItem("adminToken");
        const res = await fetch("https://drm-backend.vercel.app/api/admin/users", {
          headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch user data.");
        setError("Unable to load user data.");
      }
    };

    const fetchReports = async () => {
      try {
        const adminToken = localStorage.getItem("adminToken");
        const res = await fetch("https://drm-backend.vercel.app/api/admin/reports", {
          headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setDisasters(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast.error("Failed to fetch reports.");
      }
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchUsers(), fetchReports()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    // WebSocket removed for Vercel compatibility
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

  // ===== Analytics =====
  const countInLastDays = (items, dateKey, days = 7) => {
    const now = Date.now();
    const windowMs = days * 24 * 60 * 60 * 1000;
    return items.filter((it) => {
      const raw = it?.[dateKey] || it?.createdAt || it?.updatedAt;
      const t = raw ? new Date(raw).getTime() : 0;
      return t && now - t <= windowMs;
    }).length;
  };

  const newUsers7d = useMemo(() => countInLastDays(users, 'createdAt', 7), [users]);
  const newReports7d = useMemo(() => countInLastDays(disasters, 'date', 7), [disasters]);
  const resolvedCount = useMemo(() => disasters.filter((d) => d.status === 'Resolved').length, [disasters]);
  const ongoingCount = useMemo(() => disasters.filter((d) => d.status !== 'Resolved').length, [disasters]);

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

        {/* ✅ Lightweight Analytics */}
        <div className={styles.statistics}>
          <div className={styles.statCard}>
            <h3>New Users (7d)</h3>
            <p>{newUsers7d}</p>
          </div>
          <div className={styles.statCard}>
            <h3>New Reports (7d)</h3>
            <p>{newReports7d}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Status Breakdown</h3>
            <p>
              <span title="Resolved">✅ {resolvedCount}</span>
              <span style={{ margin: '0 8px' }}>·</span>
              <span title="Ongoing">⏳ {ongoingCount}</span>
            </p>
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
                  <th>Actions</th>
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
                      <td>
                        <button
                          className={styles.dangerButton}
                          onClick={async () => {
                            if (!window.confirm(`Delete user ${u.username}?`)) return;
                            try {
                              const adminToken = localStorage.getItem("adminToken");
                              const res = await fetch(`https://drm-backend.vercel.app/api/admin/users/${u._id}` , {
                                method: 'DELETE',
                                headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
                              });
                              if (!res.ok) throw new Error(`Failed: ${res.status}`);
                              setUsers((prev) => prev.filter((x) => x._id !== u._id));
                              toast.success('User deleted');
                            } catch (e) {
                              console.error('Delete user error:', e);
                              toast.error('Failed to delete user');
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No users found.</td>
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
                  <th>Actions</th>
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
                      <td>
                        {d.status !== 'Resolved' && (
                          <button
                            className={styles.primaryButton}
                            onClick={async () => {
                              try {
                                const adminToken = localStorage.getItem("adminToken");
                                const res = await fetch(`https://drm-backend.vercel.app/api/admin/reports/${d.id}`, {
                                  method: 'PUT',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
                                  },
                                  body: JSON.stringify({ status: 'Resolved' })
                                });
                                if (!res.ok) throw new Error(`Failed: ${res.status}`);
                                setDisasters((prev) => prev.map((x) => x.id === d.id ? { ...x, status: 'Resolved' } : x));
                                toast.success('Report marked as Resolved');
                              } catch (e) {
                                console.error('Resolve report error:', e);
                                toast.error('Failed to resolve report');
                              }
                            }}
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          className={styles.dangerButton}
                          onClick={async () => {
                            if (!window.confirm('Delete this report?')) return;
                            try {
                              const adminToken = localStorage.getItem("adminToken");
                              const res = await fetch(`https://drm-backend.vercel.app/api/admin/reports/${d.id}`, {
                                method: 'DELETE',
                                headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
                              });
                              if (!res.ok) throw new Error(`Failed: ${res.status}`);
                              setDisasters((prev) => prev.filter((x) => x.id !== d.id));
                              toast.success('Report deleted');
                            } catch (e) {
                              console.error('Delete report error:', e);
                              toast.error('Failed to delete report');
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No disaster data available.</td>
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
              Page {currentPage + 1} of {Math.ceil(disasters.length / itemsPerPage)}
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
