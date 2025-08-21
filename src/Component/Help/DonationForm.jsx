import React, { useState, useEffect } from "react";
import { FlutterWaveButton, closePaymentModal } from "flutterwave-react-v3";
import axios from "axios";
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

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, type: "", message: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const config = {
    public_key: import.meta.env.VITE_FLW_PUBLIC_KEY,
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
          const res = await axios.post(
            "https://drm-backend.vercel.app/api/donations/verify",
            { transaction_id: response.transaction_id, ...form }
          );
          setToast({ show: true, type: "success", message: res.data.message });
        } else {
          setToast({ show: true, type: "error", message: "Payment not completed." });
        }
      } catch {
        setToast({ show: true, type: "error", message: "Payment verification failed." });
      }
      setLoading(false);
      closePaymentModal();
    },
    onClose: () => setLoading(false),
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Make a Donation</h2>

        {["fullName", "email", "amount", "message"].map((field) => (
          <div key={field} className={styles.inputGroup}>
            <label>{field === "amount" ? "Amount (NGN)" : field.charAt(0).toUpperCase() + field.slice(1)}</label>
            {field === "message" ? (
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            ) : (
              <input type={field === "amount" ? "number" : "text"} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
            )}
          </div>
        ))}

        <FlutterWaveButton
          {...fwConfig}
          className={`${styles.submitButton} ${loading ? styles.loading : ""}`}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className={styles.spinner}></div> Processing...
            </>
          ) : (
            "Donate Now"
          )}
        </FlutterWaveButton>
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
