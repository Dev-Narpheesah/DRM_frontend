import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import styles from "./DonationsList.module.css";

const DonationsList = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await axios.get(`${API_URL}/donations`);
        setDonations(res.data.donations || []);
      } catch (error) {
        console.error("Failed to fetch donations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  if (loading) return <p className={styles.loading}>Loading donations...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>All Donations</h2>
      {donations.length === 0 ? (
        <p className={styles.noData}>No donations yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Donor Name</th>
              <th>Email</th>
              <th>Amount (NGN)</th>
              <th>Message</th>
              <th>Transaction ID</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation) => (
              <tr key={donation._id}>
                <td>{donation.fullName}</td>
                <td>{donation.email}</td>
                <td>₦{Number(donation.amount).toLocaleString()}</td>
                <td>{donation.message}</td>
                <td>{donation.transactionId}</td>
                <td>{new Date(donation.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DonationsList;
