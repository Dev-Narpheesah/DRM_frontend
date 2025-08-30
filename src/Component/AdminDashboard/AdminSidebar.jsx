import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home as HomeIcon,
  LogOut,
  Users,
  FileText,
  Shield,
  BarChart3,
  Settings,
  Bell,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Menu,
  X
} from "lucide-react";
import styles from "./AdminSidebar.module.css";

const AdminSidebar = ({ isOpen = true, onToggle, stats = {} }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(isOpen);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (onToggle) onToggle(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin/signin");
  };

  const adminMenu = [
    { 
      name: "Dashboard", 
      icon: BarChart3, 
      path: "/admin",
      description: "Overview and analytics"
    },
    { 
      name: "Users", 
      icon: Users, 
      path: "/admin/users",
      description: "Manage user accounts"
    },
    { 
      name: "Reports", 
      icon: FileText, 
      path: "/admin/reports",
      description: "Disaster reports"
    },
    { 
      name: "Settings", 
      icon: Settings, 
      path: "/admin/settings",
      description: "Admin preferences"
    },
  ];

  const getAdminData = () => {
    const adminData = localStorage.getItem("admin");
    return adminData ? JSON.parse(adminData) : { username: "Admin", email: "" };
  };

  const adminData = getAdminData();

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={styles.mobileToggle}
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className={styles.backdrop} 
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.collapsed}`}
        role="navigation"
        aria-label="Admin Navigation"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <Shield size={32} />
            <span className={styles.logoText}>DRMS Admin</span>
          </div>
          <button
            onClick={toggleSidebar}
            className={styles.closeBtn}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Admin Info */}
        <div className={styles.adminInfo}>
          <div className={styles.adminAvatar}>
            <User size={24} />
          </div>
          <div className={styles.adminDetails}>
            <h3 className={styles.adminName}>{adminData.username}</h3>
            <p className={styles.adminRole}>Administrator</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className={styles.nav}>
          <ul className={styles.menuList}>
            {adminMenu.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.name} className={styles.menuItem}>
                  <NavLink
                    to={item.path}
                    className={`${styles.menuLink} ${isActive ? styles.active : ''}`}
                    onClick={() => {
                      // If it's the same path, scroll to top
                      if (location.pathname === item.path) {
                        window.scrollTo(0, 0);
                      }
                    }}
                  >
                    <Icon size={20} className={styles.menuIcon} />
                    <div className={styles.menuContent}>
                      <span className={styles.menuName}>{item.name}</span>
                      <span className={styles.menuDescription}>{item.description}</span>
                    </div>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Quick Stats */}
        <div className={styles.quickStats}>
          <h4 className={styles.statsTitle}>Quick Stats</h4>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <Users size={16} />
              <span>{stats.users || 0}</span>
              <small>Users</small>
            </div>
            <div className={styles.statItem}>
              <FileText size={16} />
              <span>{stats.reports || 0}</span>
              <small>Reports</small>
            </div>
            <div className={styles.statItem}>
              <CheckCircle size={16} />
              <span>{stats.resolved || 0}</span>
              <small>Resolved</small>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
