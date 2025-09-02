import React, { useState, useEffect } from 'react';
import { API_URL } from "../../config";
import { toast } from 'react-toastify';
import styles from './Settings.module.css';

const Settings = () => {
  const [user, setUser] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sound: true,
  });
  const [profilePic, setProfilePic] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const token = JSON.parse(localStorage.getItem('user') || '{}')?.token;
        if (!token) throw new Error('Please sign in');
        const response = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch user data');

        const data = await response.json();
        setUser({ username: data.username || '', email: data.email || '', password: '', confirmPassword: '' });
        setNotifications(data.notifications || notifications);
        setTheme(data.theme || 'light');
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user settings.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    toast.info(`Theme changed to ${newTheme}`);
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications((prev) => ({ ...prev, [name]: checked }));
    toast.info(`${name} notifications ${checked ? 'enabled' : 'disabled'}`);
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    if (user.password && user.password !== user.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('user') || '{}')?.token;
      if (!token) throw new Error('Please sign in');
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          username: user.username,
          email: user.email,
          password: user.password || undefined,
          notifications,
          theme,
        }),
      });

      if (!response.ok) throw new Error('Failed to update user settings');
      toast.success('Settings updated successfully');
      setUser((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('profilePic', file);
      const token = JSON.parse(localStorage.getItem('user') || '{}')?.token;
      if (!token) throw new Error('Please sign in');
      const response = await fetch(`${API_URL}/auth/profile-pic`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload profile picture');
      const { profilePicUrl } = await response.json();
      setProfilePic(profilePicUrl);
      toast.success('Profile picture updated');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    setIsLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('user') || '{}')?.token;
      if (!token) throw new Error('Please sign in');
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete account');
      toast.success('Account deleted successfully');
      // Redirect to login page
      // Example: window.location.href = '/login';
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    toast.info('Logging out...');
    // Example: window.location.href = '/login';
  };

  if (isLoading) {
    return <div className={styles.loader}>Loading settings...</div>;
  }

  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.pageTitle}>Settings</h1>

      {/* Profile Card */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Profile</h2>
        <form onSubmit={handleUserUpdate} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="profilePic" className={styles.label}>Profile Picture</label>
            <div className={styles.profilePicContainer}>
              {profilePic && <img src={profilePic} alt="Profile" className={styles.profilePic} />}
              <input
                type="file"
                id="profilePic"
                accept="image/*"
                onChange={handleProfilePicChange}
                className={styles.fileInput}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <input
              type="text"
              id="username"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className={styles.input}
              disabled={isLoading}
              aria-required="true"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className={styles.input}
              disabled={isLoading}
              aria-required="true"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>New Password</label>
            <input
              type="password"
              id="password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className={styles.input}
              disabled={isLoading}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={user.confirmPassword}
              onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
              className={styles.input}
              disabled={isLoading}
            />
          </div>
          <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
            Save Profile
          </button>
        </form>
      </div>

      {/* Theme Card */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Appearance</h2>
        <div className={styles.themePreview}>
          <div className={styles.previewBox} data-theme="light">
            <span>Light Theme</span>
          </div>
          <div className={styles.previewBox} data-theme="dark">
            <span>Dark Theme</span>
          </div>
        </div>
        <select
          value={theme}
          onChange={handleThemeChange}
          className={styles.select}
          aria-label="Select theme"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      {/* Notifications Card */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Notifications</h2>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="email"
              checked={notifications.email}
              onChange={handleNotificationChange}
              className={styles.checkbox}
            />
            Email Notifications
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="push"
              checked={notifications.push}
              onChange={handleNotificationChange}
              className={styles.checkbox}
            />
            Push Notifications
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="sound"
              checked={notifications.sound}
              onChange={handleNotificationChange}
              className={styles.checkbox}
            />
            Notification Sound
          </label>
        </div>
      </div>

      {/* Account Card */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Account</h2>
        <button onClick={handleLogout} className={styles.dangerBtn}>
          Log Out
        </button>
        <button onClick={handleDeleteAccount} className={`${styles.dangerBtn} ${styles.deleteBtn}`}>
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Settings;