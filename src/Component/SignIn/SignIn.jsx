import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import PasswordInput from "../passwordInput/passwordInput";
import styles from "./SignIn.module.css";

const initialState = { email: "", password: "" };

const SignIn = () => {
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
    const { email, password } = formData;

    if (!email || !password) {
      setFormValidMessage("All fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormValidMessage("Invalid email address");
      return;
    }

    setIsSubmitting(true);

   try {
  const response = await fetch("https://drm-backend.vercel.app/api/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) throw new Error(data.message || "Login failed");

  const authUser = {
    id: data?.user?.id || data?.user?._id,
    username: data?.user?.username,
    email: data?.user?.email,
    token: data?.token,
  };
  localStorage.setItem("user", JSON.stringify(authUser));
  toast.success("Login successful");
  navigate("/dashboard");

} catch (err) {
  toast.error(err.message || "Something went wrong");
  setFormValidMessage(err.message || "Network error");
} finally {
  setIsSubmitting(false);
}
  }

  return (
    <div className={styles.container_signin}>
      <form className={styles.container} onSubmit={handleSubmit}>
        <p className={styles.formTitle}>Sign In</p>

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

        <button type="submit" className={styles.btn} disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>

        <p>
          Don't have an account? <Link to="/signup" className={styles.coloredLink}>Register</Link>
        </p>
        {formValidMessage && <p className={styles.errorMessage}>{formValidMessage}</p>}
      </form>
    </div>
  );
};

export default SignIn;
