import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Register.module.css";
import { toast } from "react-toastify";
import { UserContext } from "../../../context/userContext";

const initialState = {
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
};

const Register = () => {
  const { login } = useContext(UserContext);
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValidMessage, setFormValidMessage] = useState("");

  const { username, email, password, confirmPassword } = formData;
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const validateForm = () => {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedUsername || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      setFormValidMessage('All fields are required');
      return false;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setFormValidMessage('Passwords do not match');
      return false;
    }

    if (trimmedPassword.length < 6) {
      setFormValidMessage('Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFormValidMessage('Invalid email address');
      return false;
    }

  

    setFormValidMessage('');
    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsSubmitting(true);

  try {
    const response = await fetch('https://drm-backend.vercel.app/api/admin/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password, confirmPassword }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // login(data.user, data.token);
    toast.success("Registration Successful");
    navigate('/signin', { state: { user: data.user } });
  } catch (error) {
    console.error('Failed to register user', error);
    toast.error(error.message || 'Failed to register user');
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className={styles.container_reg}>
      <form className={styles.container} onSubmit={handleSubmit}>
        <p>Full Name</p>
        <input
          value={username}
          placeholder="eg: full name"
          id='username'
          onChange={handleInputChange}
          required
        />

        <p>Email Address</p>
        <input
          value={email}
          placeholder="example@gmail.com"
          id='email'
          onChange={handleInputChange}
          required
        />

        <div>
          <label className={styles.password}>Password</label>
          <input
            type="password"
            className={styles.input}
            value={password}
            placeholder="Enter your password"
            required
            id='password'
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className={styles.password}>Confirm Password</label>
          <input
            type="password"
            className={styles.input}
            value={confirmPassword}
            placeholder="Re-enter your password"
            required
            id='confirmPassword'
            onChange={handleInputChange}
          />
        </div>

        <button type="submit" className={styles.btn} disabled={isSubmitting}>
          {isSubmitting ? "Signing you up..." : "Create Account"}
        </button>

        <div>
          <p style={{ textAlign: "center" }}>Already registered?{' '}
            <Link to='/signin' style={{ color: "#11648a" }}>Sign In</Link>
          </p>
        </div>

        {formValidMessage && <p className="error-message">{formValidMessage}</p>}
      </form>
    </div>
  );
};

export default Register;