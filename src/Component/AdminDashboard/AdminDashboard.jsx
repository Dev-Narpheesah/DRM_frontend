import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../../context/userContext";
import { useNavigate } from "react-router-dom";
import styles from "./AdminDashboard.module.css";
import { FaCheck, FaHourglassHalf, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import disasterData from "../../../api/disasters"; 
import { toast } from "react-toastify";

export const shortenText = (text = "", n) => {
  return text?.length > n ? `${text.substring(0, n)}...` : text;
};

const AdminDashboard = () => {
  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [disasters, setDisasters] = useState(disasterData);
  const [totalReports, setTotalReports] = useState(0);
  const [totalRegions, setTotalRegions] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://drm-backend.vercel.app/api/user')
        // ("http://localhost:4000/api/user");
        const users = response.data;
        setUsers(users);
        setTotalReports(users.length);
        const uniqueRegions = new Set(users.map((user) => user.location));
        setTotalRegions(uniqueRegions.size);
      } catch (error) {
        toast.error("Error fetching users.");
        console.error("Error fetching users:", error);
      }
    };

    const fetchApiDisasters = async () => {
      try {
        const response = await axios.get("https://api.reliefweb.int/v1/disasters", {
          params: { offset: 0, limit: 100, profile: "full" },
        });

        const apiDisasters = response.data.data.map((disaster) => ({
          id: disaster.id,
          disasterType: disaster.fields.name,
          country: disaster.fields.primary_country?.name || "Unknown",
          date: disaster.fields.date.created,
          status: new Date(disaster.fields.date.created) < new Date() ? "Resolved" : "Ongoing",
          // Add dummy data for missing fields to match your structure
          injured: Math.floor(Math.random() * 50000),
          death: Math.floor(Math.random() * 10000),
          casualties: Math.floor(Math.random() * 60000),
          necessity: ["Shelter", "Food", "Medical Aid", "Clean Water"][Math.floor(Math.random() * 4)]
        }));

        // Combine dummy data with API data
        setDisasters([...disasterData, ...apiDisasters]);
      } catch (error) {
        console.error("Error fetching disasters:", error);
        toast.error("Failed to fetch disaster data. Using local data only.");
        setDisasters(disasterData); // Fallback to local data
      }
    };

    fetchUsers();
    fetchApiDisasters();
  }, []);

  const disastersToDisplay = disasters.slice(currentPage * 10, (currentPage + 1) * 10);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.topSection}>
        <img src="adHead.jpeg" alt="Header" className={styles.topImage} />
        <div className={styles.topText}>
          <h1>Dashboard</h1>
          <p>Manage users, reports, and more efficiently!</p>
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
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Disaster Type</th>
                <th>Country</th>
                <th>Date</th>
                <th>Injured</th>
                <th>Deaths</th>
                <th>Necessities</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {disastersToDisplay.map((disaster) => (
                <tr key={disaster.id}>
                  <td>{disaster.disasterType}</td>
                  <td>{disaster.country}</td>
                  <td>{formatDate(disaster.date)}</td>
                  <td>{disaster.injured?.toLocaleString() || 'N/A'}</td>
                  <td>{disaster.death?.toLocaleString() || 'N/A'}</td>
                  <td>{shortenText(disaster.necessity, 25)}</td>
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
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
            className={styles.pageButton}
            aria-label="Previous page"
          >
            <FaArrowLeft />
          </button>
          <span>Page {currentPage + 1} of {Math.ceil(disasters.length / 10)}</span>
          <button
            onClick={() => setCurrentPage(prev => (prev + 1) * 10 < disasters.length ? prev + 1 : prev)}
            disabled={(currentPage + 1) * 10 >= disasters.length}
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