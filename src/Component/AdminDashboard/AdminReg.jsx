import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./AdminDashboard.module.css";
import { toast } from "react-toastify";
import PasswordInput from "../passwordInput/passwordInput";

const initialState = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const AdminReg = () => {
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
      const { username, email, password, confirmPassword } = formData;

      if (!username || !email || !password || !confirmPassword) {
        setFormValidMessage("All fields are required");
        return;
      }

      if (password !== confirmPassword) {
        setFormValidMessage("Passwords do not match");
        return;
      }

      if (password.length < 6) {
        setFormValidMessage("Password must be at least 6 characters long");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setFormValidMessage("Invalid email address");
        return;
      }

      setIsSubmitting(true);

      try {
        const endpoint = "https://drm-backend.vercel.app/api/admin/register";

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Admin registration failed");
        }

        const data = await response.json();
        toast.success("Admin registered successfully");
        navigate("/adminLog", { state: { user: data.user } });
      } catch (error) {
        console.error("Admin registration error:", error);
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
        <p className={styles.formTitle}>Admin Register</p>

        <div className={styles.inputContainer}>
          <input
            type="text"
            name="username"
            placeholder="Full Name"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>

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

        <div className={styles.inputContainer}>
          <PasswordInput
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
        </div>

        <button className={styles.btn} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing you up..." : "Create Admin Account"}
        </button>

        <p className={styles.signupLink}>
          Already registered? <Link to="/adminLog">Admin Sign In</Link>
        </p>

        {formValidMessage && <p className={styles.errorMessage}>{formValidMessage}</p>}
      </form>
    </div>
  );
};

export default AdminReg;
