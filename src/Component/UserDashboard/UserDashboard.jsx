import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../SideBar/SideBar";
import styles from "./UserDashboard.module.css";


const UserDashboard = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [isActiveAccount, setIsActiveAccount] = useState(true);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = storedUser?.email;
  const authToken = storedUser?.token;

  const fetchUserDisasters = async () => {
    try {
      if (!userEmail || !authToken) {
        throw new Error("Please sign in to view your reports");
      }

      const [byToken, byEmail] = await Promise.all([
        fetch("https://drm-backend.vercel.app/api/reports/my", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }),
        fetch(
          `https://drm-backend.vercel.app/api/reports/my?email=${encodeURIComponent(
          userEmail
          )}`,
          { headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` } }
        ),
      ]);

      if (!byEmail.ok || !byToken.ok) {
        const status = !byEmail.ok ? byEmail.status : byToken.status;
        throw new Error(`Failed to fetch reports (HTTP ${status})`);
      }

      const tokenReports = authToken ? await byToken.json() : [];
      const emailReports = await byEmail.json();

      const map = new Map();
      [...(Array.isArray(tokenReports) ? tokenReports : []), ...(Array.isArray(emailReports) ? emailReports : [])].forEach((r) => {
        if (r && r._id) map.set(r._id, r);
      });
      setReports(Array.from(map.values()));
    } catch (err) {
      setError(err.message || "Unable to load your reports");
    }
  };

  useEffect(() => {
    fetchUserDisasters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userEmail]);

  useEffect(() => {}, [userEmail]);

  const greetingName = storedUser?.username || storedUser?.email || "User";
  const avatarUrl = userEmail ? `https://i.pravatar.cc/160?u=${encodeURIComponent(userEmail)}` : "https://i.pravatar.cc/160";

  const notificationCount = useMemo(() => {
    const now = Date.now();
    return reports.filter((r) => {
      const isRecent = r?.createdAt ? now - new Date(r.createdAt).getTime() < 1000 * 60 * 60 * 48 : false;
      const isPending = (r?.status || "Pending").toLowerCase() === "pending";
      return isRecent || isPending;
    }).length;
  }, [reports]);

  const latestReports = useMemo(() => {
    const sorted = [...reports].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return sorted.slice(0, 4);
  }, [reports]);

  if (!userEmail) {
    return (
      <div className={styles.layout}>
        <Sidebar username={"Guest"} notificationCount={0} />
        <main className={styles.dashboardMain}>
          <p className={styles.error}>You need to sign in to view your dashboard.</p>
          <p>
            <a href="/">Go back home</a>
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar username={greetingName} notificationCount={notificationCount} />

      <main className={styles.dashboardMain}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Welcome to DRM portal</p>
          </div>
          <div className={styles.helloBox}>
            <img src={avatarUrl} alt={greetingName} className={styles.avatar} onError={(e)=>{ e.currentTarget.style.visibility = "hidden"; }} />
            <span className={styles.helloText}>Hello {greetingName}</span>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <section className={styles.grid}>
          <article className={`${styles.card} ${styles.profileCard}`}>
            <div className={styles.profileImageWrap}>
              <img src={avatarUrl} alt={greetingName} className={styles.profileImage} onError={(e)=>{ e.currentTarget.style.display = "none"; }} />
            </div>
            <div className={styles.profileContent}>
              <h3 className={styles.cardTitle}>My Profile</h3>
              <div className={styles.profileFields}>
                <div className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>Name</span>
                  <span className={styles.fieldValue}>{greetingName}</span>
                </div>
                <div className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>Email</span>
                  <span className={styles.fieldValue}>{userEmail}</span>
                </div>
              </div>
              <button className={`${styles.ctaBtn} ${styles.saveBtn}`}>Save</button>
            </div>
          </article>

          <article className={`${styles.card} ${styles.accountsCard}`}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>My account</h3>
              <button className={`${styles.ctaBtn} ${styles.editBtn}`}>Edit</button>
            </div>
            <ul className={styles.itemList}>
              <li className={styles.itemRow}>
                <span>Active account</span>
                <button
                  className={`${styles.pillBtn} ${isActiveAccount ? styles.block : styles.unblock}`}
                  onClick={() => setIsActiveAccount((v) => !v)}
                >
                  {isActiveAccount ? "Block" : "Unblock"}
                </button>
              </li>
              <li className={styles.itemRow}>
                <span>Blocked account</span>
                <button
                  className={`${styles.pillBtn} ${!isActiveAccount ? styles.unblock : styles.block}`}
                  onClick={() => setIsActiveAccount((v) => !v)}
                >
                  {!isActiveAccount ? "Unblock" : "Block"}
                </button>
              </li>
            </ul>
          </article>

          <article className={`${styles.card} ${styles.reportsCard}`}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>My reports</h3>
            </div>
            {latestReports.length === 0 ? (
              <p className={styles.noReports}>No reports submitted yet.</p>
            ) : (
              <ul className={styles.itemList}>
                {latestReports.map((r) => {
                  const status = (r?.status || "Pending").toLowerCase();
                  return (
                    <li className={styles.itemRow} key={r._id}>
                      <span>{r?.disasterType || "Report"}</span>
                      <span className={`${styles.badge} ${status === "pending" ? styles.badgePending : status === "resolved" ? styles.badgeSuccess : styles.badgeInfo}`}>
                        {r?.status || "Pending"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <a className={styles.viewAll} href="/reports">View all</a>
          </article>
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;
