import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
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

const API_URL = "https://drm-backend.vercel.app/api";

const Sidebar = ({ username, isAdmin, isOpen = true, onToggle}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(isOpen);
  const navigate = useNavigate();
 

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
    { name: "My Reports", icon: ClipboardDocumentListIcon, path: "/reports" },
    { name: "Report Disaster", icon: ExclamationTriangleIcon, path: "/disForm" },
    { name: "Profile", icon: UserIcon, path: "/profile" },
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
      {/* Single toggle button - same place for open/close */}
      <button
        onClick={toggleSidebar}
        className={styles.sidebarToggle}
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
            aria-label={"Notifications"}
            title={"Notifications"}
            onClick={(e)=> e.preventDefault()}
          >
            <BellAlertIcon className={styles.icon} />
            
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
                  title={item.name}
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
