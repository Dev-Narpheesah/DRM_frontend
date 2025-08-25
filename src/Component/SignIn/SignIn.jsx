import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./SignIn.module.css";
import { toast } from "react-toastify";
import PasswordInput from "../passwordInput/passwordInput";

const initialState = {
  email: "",
  password: "",
};

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialState);
  const [formValidMessage, setFormValidMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = useCallback((e) => {
    setFormValidMessage("");
    const { name, value } = e.target;
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
        const response = await fetch(
          "https://drm-backend.vercel.app/api/auth/login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Sign in failed");
        }

        // Backend sends user fields at top level
        const user = {
          _id: data._id,
          username: data.username,
          email: data.email,
          role: data.role,
          token: data.token,
        };

        toast.success("Welcome back " + user.username);

        // Redirect based on role
        if (user.role === "admin") {
          navigate("/admin", { state: { user } });
        } else {
          navigate("/dashboard", { state: { user } });
        }
      } catch (error) {
        console.error("Sign in error:", error);
        setFormValidMessage(error.message || "Network error. Please try again.");
        toast.error(error.message || "Network error. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, navigate]
  );

  return (
    <div className={styles.signinContainer}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.formTitle}>Sign In</h2>

        <div className={styles.inputContainer}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
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
          />
        </div>

        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>

        <p className={styles.signupLink}>
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </p>

        {formValidMessage && (
          <p className={styles.errorMessage}>{formValidMessage}</p>
        )}
      </form>
    </div>
  );
};

export default SignIn;
