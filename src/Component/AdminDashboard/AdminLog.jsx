import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./AdminDashboard.module.css";
import PasswordInput from "../passwordInput/passwordInput";

const initialState = {
  email: "",
  password: "",
};

const AdminLog = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialState);
  const [formValidMessage, setFormValidMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormValidMessage("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const { email, password } = formData;

      if (!email || !password) {
        setFormValidMessage("All fields are required");
        return;
      }

      setIsSubmitting(true);

      try {
        const endpoint = "https://drm-backend.vercel.app/api/admin/login";

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Admin login failed");
        }

        const data = await response.json();
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("admin", JSON.stringify(data.user));
        toast.success("Admin login successful");
        navigate("/admin");
      } catch (error) {
        console.error("Admin login error:", error);
        setFormValidMessage(error.message || "Network error. Please try again.");
        toast.error(error.message || "Network error. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, navigate]
  );

  return (
    <div className={styles.container_reg}>
      <form className={styles.container} onSubmit={handleSubmit}>
        <p className={styles.formTitle}>Admin Sign In</p>

        <div className={styles.inputContainer}>
          <input
            type="email"
            name="email"
            placeholder="example@gmail.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.inputContainer}>
          <PasswordInput
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        <button className={styles.btn} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Admin Sign In"}
        </button>

        <p className={styles.signupLink}>
          Don't have an admin account? <Link to="/adminReg">Register</Link>
        </p>

        {formValidMessage && <p className={styles.errorMessage}>{formValidMessage}</p>}
      </form>
    </div>
  );
};

export default AdminLog;
