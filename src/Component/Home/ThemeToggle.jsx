import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import styles from "./ThemeToggle.module.css";

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      className={styles.themeToggle}
      onClick={toggleTheme}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div
        className={`${styles.toggleTrack} ${isDarkMode ? styles.dark : ""}`}
      >
        <div
          className={`${styles.toggleThumb} ${isDarkMode ? styles.dark : ""}`}
        >
          {isDarkMode ? (
            <svg
              className={styles.moonIcon}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
            </svg>
          ) : (
            <svg
              className={styles.sunIcon}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2" />
              <path d="M12 21v2" />
              <path d="M4.22 4.22l1.42 1.42" />
              <path d="M18.36 18.36l1.42 1.42" />
              <path d="M1 12h2" />
              <path d="M21 12h2" />
              <path d="M4.22 19.78l1.42-1.42" />
              <path d="M18.36 5.64l1.42-1.42" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
