import React, { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import { UserContext } from "../../../context/userContext";
import { useNavigate } from "react-router-dom";
import styles from "./AdminDashboard.module.css";
import {
  FaCheck,
  FaHourglassHalf,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import disasterData from "../../../api/disasters";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [totalReports, setTotalReports] = useState(0);
  const [totalRegions, setTotalRegions] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const itemsPerPage = 10;

  // Encapsulated shortenText function
  const shortenText = (text = "", n) => {
    return text?.length > n ? `${text.substring(0, n)}...` : text;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://drm-backend.vercel.app/api/user");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data);
        setTotalReports(data.length);
        const uniqueRegions = new Set(data.map((user) => user.location));
        setTotalRegions(uniqueRegions.size);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch user data.");
        setError("Unable to load user data.");
      }
    };

    const fetchApiDisasters = async () => {
      try {
        const response = await axios.get(
          "https://api.reliefweb.int/v1/disasters",
          {
            params: { offset: 0, limit: 100, profile: "full" },
          }
        );

        const apiDisasters = response.data.data.map((disaster) => ({
          id: disaster.id,
          disasterType: disaster.fields.name || "Unknown",
          country: disaster.fields.primary_country?.name || "Unknown",
          date: disaster.fields.date?.created || new Date().toISOString(),
          status:
            disaster.fields.status ||
            (new Date(disaster.fields.date?.created) < new Date()
              ? "Resolved"
              : "Ongoing"),
          injured: disaster.fields.injured || "N/A",
          death: disaster.fields.death || "N/A",
          casualties: disaster.fields.casualties || "N/A",
          necessity: disaster.fields.necessity || "N/A",
        }));

        setDisasters([...disasterData, ...apiDisasters]);
      } catch (error) {
        console.error("Error fetching disasters:", error);
        toast.error("Failed to fetch disaster data. Using local data.");
        setDisasters(disasterData);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchUsers(), fetchApiDisasters()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.warn("Invalid date format:", dateString);
      return "N/A";
    }
  };

  const disastersToDisplay = useMemo(() => {
    return disasters.slice(
      currentPage * itemsPerPage,
      (currentPage + 1) * itemsPerPage
    );
  }, [disasters, currentPage]);

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
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.topSection}>
        <div className={styles.topText}>
          <h1>Admin Dashboard</h1>
          <p>Manage users, reports, and disasters efficiently!</p>
        </div>
      </div>
      <div className={styles.statistics}>
        <div className={styles.statCard}>
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Reports</h3>
          <p>{totalReports}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Regions</h3>
          <p>{totalRegions}</p>
        </div>
      </div>

      <div className={styles.tableSection}>
        <h2>Disaster Data</h2>
        <div className={styles.tableContainer}>
          <table
            className={styles.table}
            role="grid"
            aria-label="Disaster Data Table"
          >
            <thead>
              <tr>
                <th scope="col">Disaster Type</th>
                <th scope="col">Country</th>
                <th scope="col">Date</th>
                <th scope="col">Injured</th>
                <th scope="col">Deaths</th>
                <th scope="col">Necessities</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {disastersToDisplay.length > 0 ? (
                disastersToDisplay.map((disaster) => (
                  <tr key={disaster.id}>
                    <td>{shortenText(disaster.disasterType, 20)}</td>
                    <td>{shortenText(disaster.country, 20)}</td>
                    <td>{formatDate(disaster.date)}</td>
                    <td>
                      {typeof disaster.injured === "number"
                        ? disaster.injured.toLocaleString()
                        : disaster.injured}
                    </td>
                    <td>
                      {typeof disaster.death === "number"
                        ? disaster.death.toLocaleString()
                        : disaster.death}
                    </td>
                    <td>{shortenText(disaster.necessity, 20)}</td>
                    <td>
                      {disaster.status === "Resolved" ? (
                        <FaCheck
                          aria-label="Resolved"
                          className={styles.resolvedIcon}
                        />
                      ) : (
                        <FaHourglassHalf
                          aria-label="Ongoing"
                          className={styles.ongoingIcon}
                        />
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No disaster data available.</td>
                </tr>
              )}
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
          <span>
            Page {currentPage + 1} of{" "}
            {Math.ceil(disasters.length / itemsPerPage)}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                (prev + 1) * itemsPerPage < disasters.length ? prev + 1 : prev
              )
            }
            disabled={(currentPage + 1) * itemsPerPage >= disasters.length}
            className={styles.pageButton}
            aria-label="Next page"
          >
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
