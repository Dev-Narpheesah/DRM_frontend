import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import AdminSidebar from "./AdminSidebar";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, reports, settings

  // Utility
  const shortenText = (text = "", n) =>
    text?.length > n ? `${text.substring(0, n)}...` : text;

  useEffect(() => {
    // Check admin authentication status
    const adminToken = localStorage.getItem("adminToken");
    const adminData = localStorage.getItem("admin");
    
    console.log("Admin Dashboard - Auth Check:", {
      hasToken: !!adminToken,
      hasAdminData: !!adminData,
      adminData: adminData ? JSON.parse(adminData) : null
    });
    
    if (!adminToken) {
      console.error("No admin token found - redirecting to login");
      window.location.href = "/admin/signin";
      return;
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const adminToken = localStorage.getItem("adminToken");
        console.log("Admin token for users:", adminToken ? "Present" : "Missing");
        
        if (!adminToken) {
          console.error("No admin token found for users fetch");
          return;
        }
        
        const res = await fetch("https://drm-backend.vercel.app/api/admin/users", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        
        console.log("Users API response status:", res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Users API error response:", errorText);
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Users API data:", data);
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
        console.log("Admin token for reports:", adminToken ? "Present" : "Missing");
        
        if (!adminToken) {
          console.error("No admin token found for reports fetch");
          return;
        }
        
        const res = await fetch("https://drm-backend.vercel.app/api/admin/reports", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        
        console.log("Reports API response status:", res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Reports API error response:", errorText);
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Reports API data:", data);
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
  const submittedCount = useMemo(() => disasters.filter((d) => d.status === 'Submitted' || !d.status).length, [disasters]);
  const ongoingCount = useMemo(() => disasters.filter((d) => d.status && d.status !== 'Resolved' && d.status !== 'Submitted').length, [disasters]);

  // ===== Admin Actions =====
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

  const handleResolveReport = async (reportId) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const res = await fetch(`https://drm-backend.vercel.app/api/admin/reports/${reportId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}` 
        },
        body: JSON.stringify({ status: "Resolved" }),
      });
      
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      
      toast.success("Report marked as resolved");
      setDisasters(disasters.map(report => 
        report._id === reportId 
          ? { ...report, status: "Resolved" }
          : report
      ));
    } catch (error) {
      console.error("Error resolving report:", error);
      toast.error("Failed to resolve report");
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    
    try {
      const adminToken = localStorage.getItem("adminToken");
      const res = await fetch(`https://drm-backend.vercel.app/api/admin/reports/${reportId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      
      toast.success("Report deleted successfully");
      setDisasters(disasters.filter(report => report._id !== reportId));
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    }
  };

  // ===== Settings Functions =====
  const handleSystemBackup = () => {
    toast.info("System backup initiated...");
    // Implement backup logic here
  };

  const handleClearCache = () => {
    toast.success("Cache cleared successfully");
    // Implement cache clearing logic here
  };

  const handleUpdateSettings = (settings) => {
    toast.success("Settings updated successfully");
    // Implement settings update logic here
  };

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
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const renderOverview = () => (
    <>
      {/* Analytics Cards */}
      <div className={styles.analyticsGrid}>
        <div className={styles.analyticsCard}>
          <div className={`${styles.analyticsIcon} ${styles.usersIcon}`}>
            👥
          </div>
          <div className={styles.analyticsValue}>{users.length}</div>
          <div className={styles.analyticsLabel}>Total Users</div>
        </div>

        <div className={styles.analyticsCard}>
          <div className={`${styles.analyticsIcon} ${styles.reportsIcon}`}>
            📊
          </div>
          <div className={styles.analyticsValue}>{disasters.length}</div>
          <div className={styles.analyticsLabel}>Total Reports</div>
        </div>

        <div className={styles.analyticsCard}>
          <div className={`${styles.analyticsIcon} ${styles.resolvedIcon}`}>
            ✅
          </div>
          <div className={styles.analyticsValue}>{resolvedCount}</div>
          <div className={styles.analyticsLabel}>Resolved</div>
        </div>

        <div className={styles.analyticsCard}>
          <div className={`${styles.analyticsIcon} ${styles.submittedIcon}`}>
            📝
          </div>
          <div className={styles.analyticsValue}>{submittedCount}</div>
          <div className={styles.analyticsLabel}>Submitted</div>
        </div>

        <div className={styles.analyticsCard}>
          <div className={`${styles.analyticsIcon} ${styles.ongoingIcon}`}>
            🔄
          </div>
          <div className={styles.analyticsValue}>{ongoingCount}</div>
          <div className={styles.analyticsLabel}>Ongoing</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={styles.quickStatsSection}>
        <h3>Recent Activity</h3>
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{newUsers7d}</span>
            <small>New Users (7 Days)</small>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{newReports7d}</span>
            <small>New Reports (7 Days)</small>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{resolvedCount}</span>
            <small>Total Resolved</small>
          </div>
        </div>
      </div>
    </>
  );

  const renderUsers = () => (
    <div className={styles.contentSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <span className={`${styles.sectionIcon} ${styles.usersSectionIcon}`}>
            👥
          </span>
          User Management
        </h2>
        <span className={styles.analyticsLabel}>
          {newUsers7d} new this week
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
  );

  const renderReports = () => (
    <div className={styles.contentSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <span className={`${styles.sectionIcon} ${styles.reportsSectionIcon}`}>
            📊
          </span>
          Disaster Reports
        </h2>
        <span className={styles.analyticsLabel}>
          {newReports7d} new this week
        </span>
        </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
              <th>Type</th>
              <th>Location</th>
              <th>Status</th>
                  <th>Date</th>
              <th>Actions</th>
                </tr>
              </thead>
              <tbody>
            {disastersToDisplay.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>
                  No reports found
                </td>
              </tr>
            ) : (
              disastersToDisplay.map((disaster) => (
                <tr key={disaster._id}>
                  <td>{disaster.disasterType || "N/A"}</td>
                  <td>{shortenText(disaster.location, 30)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${
                      disaster.status === 'Resolved' 
                        ? styles.statusResolved 
                        : disaster.status === 'Submitted' || !disaster.status
                        ? styles.statusSubmitted
                        : styles.statusOngoing
                    }`}>
                      {disaster.status || 'Submitted'}
                    </span>
                  </td>
                  <td>{formatDate(disaster.date || disaster.createdAt)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      {disaster.status !== 'Resolved' && (
                        <button
                          className={`${styles.btn} ${styles.btnSuccess}`}
                          onClick={() => handleResolveReport(disaster._id)}
                        >
                          Resolve
                        </button>
                      )}
                      <button
                        className={`${styles.btn} ${styles.btnDanger}`}
                        onClick={() => handleDeleteReport(disaster._id)}
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

          {/* Pagination */}
      {disasters.length > itemsPerPage && (
          <div className={styles.pagination}>
            <button
            className={`${styles.paginationBtn} ${currentPage === 0 ? styles.active : ''}`}
            onClick={() => setCurrentPage(0)}
            disabled={currentPage === 0}
          >
            First
          </button>
          <button
            className={styles.paginationBtn}
            onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage + 1} of {Math.ceil(disasters.length / itemsPerPage)}
          </span>
          <button
            className={styles.paginationBtn}
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= Math.ceil(disasters.length / itemsPerPage) - 1}
          >
            Next
          </button>
          <button
            className={`${styles.paginationBtn} ${
              currentPage === Math.ceil(disasters.length / itemsPerPage) - 1 ? styles.active : ''
            }`}
            onClick={() => setCurrentPage(Math.ceil(disasters.length / itemsPerPage) - 1)}
            disabled={currentPage >= Math.ceil(disasters.length / itemsPerPage) - 1}
          >
            Last
          </button>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className={styles.contentSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <span className={`${styles.sectionIcon} ${styles.settingsIcon}`}>
            ⚙️
          </span>
          System Settings
        </h2>
        <span className={styles.analyticsLabel}>
          Configure system preferences
        </span>
      </div>

      <div className={styles.settingsGrid}>
        <div className={styles.settingCard}>
          <h3>System Maintenance</h3>
          <div className={styles.settingActions}>
            <button 
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleSystemBackup}
            >
              Create Backup
            </button>
            <button 
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={handleClearCache}
            >
              Clear Cache
            </button>
          </div>
        </div>

        <div className={styles.settingCard}>
          <h3>Notification Settings</h3>
          <div className={styles.settingOption}>
            <label>
              <input type="checkbox" defaultChecked />
              Email notifications for new reports
            </label>
          </div>
          <div className={styles.settingOption}>
            <label>
              <input type="checkbox" defaultChecked />
              System alerts
            </label>
          </div>
        </div>

        <div className={styles.settingCard}>
          <h3>Security Settings</h3>
          <div className={styles.settingOption}>
            <label>
              <input type="checkbox" defaultChecked />
              Two-factor authentication
            </label>
          </div>
          <div className={styles.settingOption}>
            <label>
              <input type="checkbox" defaultChecked />
              Session timeout (1 hour)
            </label>
          </div>
        </div>

        <div className={styles.settingCard}>
          <h3>Data Management</h3>
          <div className={styles.settingActions}>
            <button 
              className={`${styles.btn} ${styles.btnWarning}`}
              onClick={() => toast.warning("Export functionality coming soon")}
            >
              Export Data
            </button>
            <button
              className={`${styles.btn} ${styles.btnDanger}`}
              onClick={() => toast.warning("This action cannot be undone")}
            >
              Reset System
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return renderUsers();
      case 'reports':
        return renderReports();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className={styles.container}>
      {/* Admin Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onToggle={setSidebarOpen}
        stats={{
          users: users.length,
          reports: disasters.length,
          resolved: resolvedCount
        }}
      />
      
      {/* Main Content */}
      <div className={`${styles.mainContent} ${sidebarOpen ? styles.withSidebar : styles.withoutSidebar}`}>
        {/* Dashboard Header */}
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>Admin Dashboard</h1>
          <p className={styles.dashboardSubtitle}>
            Manage users, disaster reports, and system settings
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'reports' ? styles.active : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            📋 Reports
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Tab Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
