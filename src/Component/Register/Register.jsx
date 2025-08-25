import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Register.module.css";
import { toast } from "react-toastify";
import PasswordInput from "../passwordInput/passwordInput";

const initialState = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "user",
};

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialState);
  const [formValidMessage, setFormValidMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormValidMessage("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Handle form submit
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const { username, email, password, confirmPassword, role } = formData;

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
        const endpoint = "https://drm-backend.vercel.app/api/auth/register";

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password, role }),
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Registration failed");
        }

        toast.success("Registration successful");
        navigate("/signin", { state: { user: data.user } });
      } catch (error) {
        console.error("Registration error:", error);
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
        <p className={styles.formTitle}>Register</p>

        <div className={styles.inputContainer}>
          <label htmlFor="role">Register as</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            required
            className={styles.dropdown}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className={styles.inputContainer}>
          <input
            type="text"
            name="username"
            placeholder="Full Name"
            value={formData.username}
            onChange={handleInputChange}
            required
            aria-label="Full Name"
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
            aria-label="Email"
          />
        </div>

        <div className={styles.inputContainer}>
          <PasswordInput
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            required
            aria-label="Password"
          />
        </div>

        <div className={styles.inputContainer}>
          <PasswordInput
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            aria-label="Confirm Password"
          />
        </div>

        <button className={styles.btn} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing you up..." : "Create Account"}
        </button>

        <p className={styles.signupLink}>
          Already registered? <Link to="/signin">Sign In</Link>
        </p>

        {formValidMessage && (
          <p className={styles.errorMessage}>{formValidMessage}</p>
        )}
      </form>
    </div>
  );
};

export default Register;
