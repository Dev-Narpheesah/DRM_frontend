import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../../context/userContext";
import { FaCheck, FaHourglassHalf, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./UserDashboard.module.css";
import { toast } from "react-toastify";
import disasters from "../../../api/disasters"; 

export const shortenText = (text = "", n) => {
  return text?.length > n ? `${text.substring(0, n)}...` : text;
};

const UserDashboard = () => {
  const { user } = useContext(UserContext); 
  const { id } = useParams();
  const [userReports, setUserReports] = useState([]);
  const [allDisasters, setAllDisasters] = useState(disasters); 
  const [userDisasters, setUserDisasters] = useState([]);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/user`);
        setUserReports(response.data);
      } catch (error) {
        console.error("Error fetching user reports:", error);
      }
    };

    const fetchApiDisasters = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/disaster`); 
        console.log("Fetched all disasters:", response.data);
      
        setAllDisasters([...disasters, ...response.data]);
      } catch (error) {
        console.error("Error fetching all disasters:", error);
        toast.error("Failed to fetch all disaster data. Using local data only.");
        setAllDisasters(disasters); 
      }
    };

    const fetchUserDisasters = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/user/${id}`, {
          params: { email: user?.email }, 
        });
        console.log("Fetched user-specific disasters:", response.data); 
        setUserDisasters(Array.isArray(response.data) ? response.data : []); 
      } catch (error) {
        console.error("Error fetching user-specific disasters:", error);
        toast.error("Failed to fetch user-specific disaster data.");
        setUserDisasters([]); 
      }
    };

    fetchUserReports();
    fetchApiDisasters();
    fetchUserDisasters();
  }, [id, navigate, user?.email]);

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
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
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
          <h1>Hi, {user?.username || "User"}!</h1> 
          <p>Welcome to your dashboard!</p>
        </div>

        <div className={styles.tableSection}>
          <h2>Your Submitted Disasters</h2>
          {userDisasters.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Disaster Type</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userDisasters.map((disaster) => (
                  <tr key={disaster.id}>
                    <td>{disaster.disasterType || disaster.name}</td>
                    <td>{disaster.country || (disaster.geo?.length > 0 ? disaster.geo[0].country : "N/A")}</td>
                    <td>{formatDate(disaster.date || disaster.formattedDate)}</td>
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
                {disastersToDisplay.map((disaster) => (
                  <tr key={disaster.id}>
                    <td>{disaster.country}</td>
                    <td>{disaster.disasterType}</td>
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
            <span>Page {currentPage + 1} of {Math.ceil(allDisasters.length / 10)}</span>
            <button
              onClick={() => setCurrentPage(prev => (prev + 1) * 10 < allDisasters.length ? prev + 1 : prev)}
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