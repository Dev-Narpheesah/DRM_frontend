import React, { useState, useEffect } from "react";
import { FlutterWaveButton, closePaymentModal } from "flutterwave-react-v3";
import axios from "axios";
import { API_URL } from "../../config";
import { useNavigate } from "react-router-dom";
import styles from "./DonationForm.module.css";

const DonationForm = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    amount: "",
    message: "",
  });
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(
        () => setToast({ show: false, type: "", message: "" }),
        4000
      );
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ✅ Validation before payment
  const handleValidation = () => {
    if (!form.fullName || !form.email || !form.amount) {
      setToast({
        show: true,
        type: "error",
        message: "Please fill in all required fields",
      });
      return false;
    }
    if (Number(form.amount) <= 0) {
      setToast({
        show: true,
        type: "error",
        message: "Amount must be greater than zero",
      });
      return false;
    }
    return true;
  };

  const config = {
    public_key: import.meta.env.VITE_FLW_PUBLIC_KEY || "", // ✅ fallback
    tx_ref: `donation-${Date.now()}`,
    amount: Number(form.amount),
    currency: "NGN",
    payment_options: "card, mobilemoney, ussd",
    customer: {
      email: form.email,
      phonenumber: "08012345678",
      name: form.fullName,
    },
    customizations: {
      title: "Disaster Relief Donation",
      description: "Support relief efforts",
      logo: "https://i.pinimg.com/736x/6f/3c/64/6f3c6405c5948f72a8b9f71c3baf92ad.jpg",
    },
  };

  const fwConfig = {
    ...config,
    text: loading ? "Processing..." : "Donate Now",
    callback: async (response) => {
      setLoading(true);
      try {
        if (response.status === "successful") {
          const res = await axios.post(`${API_URL}/donations/verify`, { transaction_id: response.transaction_id, ...form });
          setToast({ show: true, type: "success", message: res.data.message });

          // Go back after success
          setTimeout(() => navigate(-1), 2000);
        } else {
          setToast({
            show: true,
            type: "error",
            message: "Payment not completed.",
          });
        }
      } catch {
        setToast({
          show: true,
          type: "error",
          message: "Payment verification failed.",
        });
      }
      setLoading(false);
      closePaymentModal(); // close Flutterwave modal
    },
    onClose: () => setLoading(false),
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Make a Donation</h2>

        {["fullName", "email", "amount", "message"].map((field) => (
          <div key={field} className={styles.inputGroup}>
            <label>
              {field === "amount"
                ? "Amount (NGN)"
                : field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            {field === "message" ? (
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            ) : (
              <input
                type={field === "amount" ? "number" : "text"}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              />
            )}
          </div>
        ))}

        <FlutterWaveButton
          {...fwConfig}
          className={`${styles.submitButton} ${loading ? styles.loading : ""}`}
          disabled={loading}
          onClick={(e) => {
            if (!handleValidation()) {
              e.preventDefault(); // stop payment if invalid
            }
          }}
        />
      </div>

      {toast.show && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          <p>{toast.message}</p>
        </div>
      )}
    </div>
  );
};

export default DonationForm;
