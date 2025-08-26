import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Home as HomeIcon,
  LogOut,
  Users,
  FileText,
  Shield,
} from "lucide-react";
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CogIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";

import styles from "./SideBar.module.css";

const Sidebar = ({ username, isAdmin, isOpen = true, onToggle, notificationCount = 0 }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(isOpen);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (onToggle) onToggle(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/signin";
  };

  // Menu for regular users
  const userMenu = [
    { name: "Home", icon: HomeIcon, path: "/" },
    { name: "Dashboard", icon: ChartBarIcon, path: "/dashboard" },
    { name: "Reports", icon: ClipboardDocumentListIcon, path: "/reports" },
    { name: "Report Disaster", icon: ExclamationTriangleIcon, path: "/disForm" },
    { name: "Settings", icon: CogIcon, path: "/settings" },
  ];

  // Menu for admins
  const adminMenu = [
    { name: "Dashboard", icon: HomeIcon, path: "/admin" },
    { name: "Users", icon: Users, path: "/admin" },
    { name: "Reports", icon: FileText, path: "/reports" },
  ];

  const menuItems = isAdmin ? adminMenu : userMenu;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`${styles.sidebarToggle} ${
          isSidebarOpen ? styles.active : ""
        }`}
        aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        aria-expanded={isSidebarOpen}
        aria-controls="app-sidebar"
      >
        {isSidebarOpen ? (
          <ChevronLeftIcon className={styles.icon} />
        ) : (
          <ChevronRightIcon className={styles.icon} />
        )}
      </button>

      {/* Optional backdrop for mobile when open */}
      <div
        className={`${styles.backdrop} ${isSidebarOpen ? styles.backdropVisible : ""}`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        className={`${styles.sidebar} ${
          isSidebarOpen ? styles.open : styles.collapsed
        }`}
        role="navigation"
        aria-label="Main"
      >
        <div className={styles.logoRow}>
          <div className={styles.logo}>🌍 DRM</div>
          {/* Live status pulse */}
          <div className={styles.liveStatus} title="Live updates active">
            <span className={styles.pulseDot} />
            {isSidebarOpen && <span className={styles.pulseText}>Live</span>}
          </div>
        </div>

        <div className={styles.userBox}>
          <Shield size={20} />
          <span>{isAdmin ? `Admin: ${username}` : username}</span>
          {/* Notification bell */}
          <button
            className={styles.bellBtn}
            aria-label={`Notifications${notificationCount > 0 ? `: ${notificationCount} new` : ""}`}
            title={notificationCount > 0 ? `${notificationCount} new notifications` : "Notifications"}
          >
            <BellAlertIcon className={styles.icon} />
            {notificationCount > 0 && (
              <span className={styles.badge} aria-hidden="true">{notificationCount}</span>
            )}
          </button>
        </div>

        <nav className={styles.nav}>
          <ul>
            {menuItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ""}`
                  }
                >
                  <item.icon className={styles.icon} />
                  {isSidebarOpen && (
                    <span className={styles.menuText}>{item.name}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={18} /> {isSidebarOpen && "Logout"}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
