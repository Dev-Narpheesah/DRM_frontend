import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminSidebar from "./AdminSidebar";
import styles from "./AdminDashboard.module.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Check admin authentication status
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      window.location.href = "/admin/signin";
      return;
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const adminToken = localStorage.getItem("adminToken");
        const res = await fetch("https://drm-backend.vercel.app/api/admin/users", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch user data.");
        setError("Unable to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const adminToken = localStorage.getItem("adminToken");
      const res = await fetch(`https://drm-backend.vercel.app/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      
      toast.success("User deleted successfully");
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

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

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h3>Error Loading Users</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Admin Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onToggle={setSidebarOpen}
        stats={{
          users: users.length,
          reports: 0,
          resolved: 0
        }}
      />
      
      {/* Main Content */}
      <div className={`${styles.mainContent} ${sidebarOpen ? styles.withSidebar : styles.withoutSidebar}`}>
        {/* Page Header */}
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>User Management</h1>
          <p className={styles.dashboardSubtitle}>
            Manage user accounts and permissions
          </p>
        </div>

        {/* Users Section */}
        <div className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={`${styles.sectionIcon} ${styles.usersSectionIcon}`}>
                👥
              </span>
              All Users
            </h2>
            <span className={styles.analyticsLabel}>
              {users.length} total users
            </span>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "40px" }}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.username || "N/A"}</td>
                      <td>{user.email || "N/A"}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className={`${styles.btn} ${styles.btnDanger}`}
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;

