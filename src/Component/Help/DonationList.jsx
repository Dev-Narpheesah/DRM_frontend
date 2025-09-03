import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import styles from "./DonationsList.module.css";

const DonationsList = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null); // ✅ modal state

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await axios.get(
          "https://drm-backend.vercel.app/api/donations"
        );
        setDonations(res.data.donations || []);
      } catch (error) {
        console.error("Failed to fetch donations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const exportPDF = (donation) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Donation Receipt", 20, 20);
    doc.setFontSize(12);
    doc.text(`Donor Name: ${donation.fullName}`, 20, 40);
    doc.text(`Email: ${donation.email}`, 20, 50);
    doc.text(`Amount: ₦${Number(donation.amount).toLocaleString()}`, 20, 60);
    doc.text(`Message: ${donation.message || "N/A"}`, 20, 70);
    doc.text(`Transaction ID: ${donation.transactionId}`, 20, 80);
    doc.text(
      `Date: ${new Date(donation.createdAt).toLocaleString()}`,
      20,
      90
    );
    doc.save(`Donation-${donation.transactionId}.pdf`);
  };

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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation) => (
              <tr key={donation._id} className={styles.row}>
                <td>{donation.fullName}</td>
                <td>{donation.email}</td>
                <td>₦{Number(donation.amount).toLocaleString()}</td>
                <td>{donation.message}</td>
                <td>{donation.transactionId}</td>
                <td>{new Date(donation.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    className={styles.viewBtn}
                    onClick={() => setSelectedDonation(donation)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ✅ Modal */}
      {selectedDonation && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Donation Details</h3>
            <p>
              <strong>Donor Name:</strong> {selectedDonation.fullName}
            </p>
            <p>
              <strong>Email:</strong> {selectedDonation.email}
            </p>
            <p>
              <strong>Amount:</strong> ₦
              {Number(selectedDonation.amount).toLocaleString()}
            </p>
            <p>
              <strong>Message:</strong>{" "}
              {selectedDonation.message || "No message"}
            </p>
            <p>
              <strong>Transaction ID:</strong> {selectedDonation.transactionId}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedDonation.createdAt).toLocaleString()}
            </p>

            <div className={styles.modalActions}>
              <button
                onClick={() => exportPDF(selectedDonation)}
                className={styles.exportBtn}
              >
                Export as PDF
              </button>
              <button
                onClick={() => setSelectedDonation(null)}
                className={styles.closeBtn}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationsList;
