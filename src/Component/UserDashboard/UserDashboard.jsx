import React, { useEffect, useState } from "react";
import { FaCheck, FaHourglassHalf, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styles from "./UserDashboard.module.css";
import { toast } from "react-toastify";
import disasters from "../../../api/disasters";

export const shortenText = (text = "", n) => {
  return text?.length > n ? `${text.substring(0, n)}...` : text;
};

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [allDisasters, setAllDisasters] = useState([]);
  const [userDisasters, setUserDisasters] = useState([]);
  const [isLoadingDisasters, setIsLoadingDisasters] = useState(false);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);

  const API_URL = "https://drm-backend.vercel.app";

  useEffect(() => {
    // Retrieve user from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("Please log in to view your dashboard");
      navigate("/signin");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (!parsedUser.email || typeof parsedUser.isAdmin !== "boolean") {
      console.error("Invalid user object:", parsedUser);
      toast.error("Invalid user data. Please log in again.");
      localStorage.removeItem("user");
      navigate("/signin");
      return;
    }
    setUser(parsedUser);

    const fetchUserReports = async () => {
      try {
        const response = await fetch(`${API_URL}/api/user/reports`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch user reports: ${response.statusText}`);
        }
        const data = await response.json();
        setUserReports(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching user reports:", error);
        toast.error("Failed to fetch user reports.");
      }
    };

    const fetchApiDisasters = async () => {
      try {
        const response = await fetch(`${API_URL}/api/disaster`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch disasters: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Fetched all disasters:", data);
        // Normalize local disasters to match API structure
        const normalizedLocalDisasters = disasters.map((d) => ({
          country: d.country || "N/A",
          disasterType: d.disasterType || "N/A",
          date: d.date || new Date().toISOString(),
          injured: d.injured || 0,
          death: d.death || 0,
          necessity: d.necessity || "N/A",
          status: d.status || "Ongoing",
        }));
        setAllDisasters([...normalizedLocalDisasters, ...(Array.isArray(data) ? data : [])]);
      } catch (error) {
        console.error("Error fetching all disasters:", error);
        toast.error("Failed to fetch all disaster data. Using local data only.");
        setAllDisasters(disasters);
      }
    };

    const fetchUserDisasters = async () => {
      setIsLoadingDisasters(true);
      try {
        const endpoint = parsedUser.isAdmin
          ? `${API_URL}/api/disaster`
          : `${API_URL}/api/disaster?email=${encodeURIComponent(parsedUser.email)}`;
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch user disasters: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Fetched user-specific disasters:", data);
        const userDisasters = Array.isArray(data)
          ? data.map((report) => ({
              id: report._id,
              disasterType: report.disasterType || "N/A",
              country: report.location || "N/A",
              date: report.createdAt || new Date().toISOString(),
              isDone: false,
              submittedBy: report.email || "N/A",
            }))
          : [];
        setUserDisasters(userDisasters);
      } catch (error) {
        console.error("Error fetching user-specific disasters:", error);
        toast.error("Failed to fetch your disaster data.");
        setUserDisasters([]);
      } finally {
        setIsLoadingDisasters(false);
      }
    };

    fetchUserReports();
    fetchApiDisasters();
    fetchUserDisasters();
  }, [navigate]);

  const handleMarkAsDone = async (disasterId) => {
    try {
      const updatedDisasters = userDisasters.map((disaster) =>
        disaster.id === disasterId ? { ...disaster, isDone: !disaster.isDone } : disaster
      );
      setUserDisasters(updatedDisasters);
      toast.success("Disaster status updated!");
    } catch (error) {
      toast.error("Failed to mark disaster as done.");
      console.error("Failed to mark disaster as done:", error);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const disastersToDisplay = allDisasters.slice(currentPage * 10, (currentPage + 1) * 10);

  return (
    <div className={styles.dashboard}>
      <div className={styles.content}>
        <div className={styles.welcomeMessage}>
          <h1>Hi, {user?.email || "User"}!</h1>
          <p>Welcome to your {user?.isAdmin ? "Admin" : "User"} dashboard!</p>
        </div>

        <div className={styles.tableSection}>
          <h2>{user?.isAdmin ? "All Submitted Disasters" : "Your Submitted Disasters"}</h2>
          {isLoadingDisasters ? (
            <p>Loading disasters...</p>
          ) : userDisasters.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Disaster Type</th>
                  <th>Location</th>
                  <th>Date</th>
                  {user?.isAdmin && <th>Submitted By</th>}
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userDisasters.map((disaster) => (
                  <tr key={disaster.id}>
                    <td>{disaster.disasterType}</td>
                    <td>{disaster.country}</td>
                    <td>{formatDate(disaster.date)}</td>
                    {user?.isAdmin && <td>{disaster.submittedBy}</td>}
                    <td>{disaster.isDone ? "Past Event" : "Ongoing"}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={disaster.isDone}
                        onChange={() => handleMarkAsDone(disaster.id)}
                      />
                      {disaster.isDone ? (
                        <FaCheck title="Past Event" className={styles.icon} />
                      ) : (
                        <FaHourglassHalf title="Ongoing Event" className={styles.icon} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No disasters submitted yet.</p>
          )}
        </div>

        <div className={styles.tableSection}>
          <h2>All Disasters</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Disaster Type</th>
                  <th>Date</th>
                  <th>Injured</th>
                  <th>Deaths</th>
                  <th>Necessities</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {disastersToDisplay.map((disaster, i) => (
                  <tr key={i + 1}>
                    <td>{disaster.country || "N/A"}</td>
                    <td>{disaster.disasterType || "N/A"}</td>
                    <td>{formatDate(disaster.date)}</td>
                    <td>{disaster.injured?.toLocaleString() || "N/A"}</td>
                    <td>{disaster.death?.toLocaleString() || "N/A"}</td>
                    <td>{shortenText(disaster.necessity, 25) || "N/A"}</td>
                    <td>
                      {disaster.status === "Resolved" ? (
                        <FaCheck title="Resolved" className={styles.resolvedIcon} />
                      ) : (
                        <FaHourglassHalf title="Ongoing" className={styles.ongoingIcon} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
              className={styles.pageButton}
              aria-label="Previous page"
            >
              <FaArrowLeft />
            </button>
            <span>Page {currentPage + 1} of {Math.ceil(allDisasters.length / 10)}</span>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  (prev + 1) * 10 < allDisasters.length ? prev + 1 : prev
                )
              }
              disabled={(currentPage + 1) * 10 >= allDisasters.length}
              className={styles.pageButton}
              aria-label="Next page"
            >
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;