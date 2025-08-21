import React, { useState } from "react";
import { Link } from "react-router-dom";
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
} from "@heroicons/react/24/outline";

import styles from "./SideBar.module.css";

const Sidebar = ({ username, isAdmin, isOpen = true, onToggle }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(isOpen);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (onToggle) onToggle(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    window.location.href = "/login";
  };

  // Menu for regular users
  const userMenu = [
    { name: "Home", icon: HomeIcon, path: "/" },
    { name: "Dashboard", icon: ChartBarIcon, path: "/dashboard" },
    { name: "Reports", icon: ClipboardDocumentListIcon, path: "/reports" },
    { name: "Disasters", icon: ExclamationTriangleIcon, path: "/disasters" },
    { name: "Profile", icon: UserIcon, path: "/profile" },
    { name: "Settings", icon: CogIcon, path: "/settings" },
  ];

  // Menu for admins
  const adminMenu = [
    { name: "Dashboard", icon: HomeIcon, path: "/admin/dashboard" },
    { name: "Users", icon: Users, path: "/admin/users" },
    { name: "Reports", icon: FileText, path: "/admin/reports" },
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
      >
        {isSidebarOpen ? (
          <ChevronLeftIcon className={styles.icon} />
        ) : (
          <ChevronRightIcon className={styles.icon} />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${
          isSidebarOpen ? styles.open : styles.collapsed
        }`}
      >
        <div className={styles.logo}>🌍 DRM</div>

        <div className={styles.userBox}>
          <Shield size={20} />
          <span>{isAdmin ? `Admin: ${username}` : username}</span>
        </div>

        <nav className={styles.nav}>
          <ul>
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link to={item.path} className={styles.navItem}>
                  <item.icon className={styles.icon} />
                  {isSidebarOpen && (
                    <span className={styles.menuText}>{item.name}</span>
                  )}
                </Link>
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
