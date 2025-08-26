import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import PasswordInput from "../passwordInput/passwordInput";
import styles from "./Register.module.css";

const initialState = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialState);
  const [formValidMessage, setFormValidMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormValidMessage("");
  };

  const handleSubmit = async (e) => {
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
      setFormValidMessage("Password must be at least 6 characters");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormValidMessage("Invalid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "https://drm-backend.vercel.app/api/user/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Registration failed");
      }

      const data = await response.json();
      toast.success("Registration successful");
      navigate("/signin", { state: { user: data.user } });
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(
        err.message || "Network error. Make sure the backend is accessible."
      );
      setFormValidMessage(err.message || "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container_reg}>
      <form className={styles.container} onSubmit={handleSubmit}>
        <p className={styles.formTitle}>Register</p>

        <input
          type="text"
          name="username"
          placeholder="Full Name"
          value={formData.username}
          onChange={handleInputChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <PasswordInput
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        <PasswordInput
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
        />

        <button type="submit" className={styles.btn} disabled={isSubmitting}>
          {isSubmitting ? "Signing up..." : "Create Account"}
        </button>

        <p>
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
