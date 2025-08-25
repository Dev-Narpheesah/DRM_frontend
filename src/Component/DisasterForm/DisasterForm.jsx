import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "react-toastify";
import styles from "./DisasterForm.module.css";

const initialState = {
  email: "",
  phone: "",
  disasterType: "",
  location: "",
  report: "",
};

const DisasterForm = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState(initialState);
  const [imagePreview, setImagePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setImagePreview(selectedFile ? URL.createObjectURL(selectedFile) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formDataWithImage = new FormData();
    formDataWithImage.append("email", formData.email);
    formDataWithImage.append("phone", formData.phone);
    formDataWithImage.append("disasterType", formData.disasterType);
    formDataWithImage.append("location", formData.location);
    formDataWithImage.append("report", formData.report);
    formDataWithImage.append("createdAt", new Date().toISOString());
    if (file) {
      formDataWithImage.append("image", file);
    }

    try {
      const response = await fetch(
        "https://drm-backend.vercel.app/api/user",
        {
          method: "POST",
          body: formDataWithImage,
        }
      );

      if (!response.ok) throw new Error("Failed to submit disaster report");

      toast.success("Report submitted successfully!", {
        className: styles.successToast,
      });
      setFormData(initialState);
      setFile(null);
      setImagePreview(null);
      navigate("/card");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit disaster report", {
        className: styles.errorToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.wrapper} ${isDarkMode ? styles.dark : ''}`}>
      <form className={styles.container} onSubmit={handleSubmit}>
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="example@gmail.com"
          value={formData.email}
          onChange={handleChange}
          required
          aria-label="Enter your email address"
        />

        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+234 567890"
          value={formData.phone}
          onChange={handleChange}
          required
          aria-label="Enter your phone number"
        />

        <label htmlFor="disasterType">Disaster Type</label>
        <input
          id="disasterType"
          name="disasterType"
          type="text"
          placeholder="e.g., Flood, Earthquake"
          value={formData.disasterType}
          onChange={handleChange}
          required
          aria-label="Enter the type of disaster"
        />

        <label htmlFor="location">Location</label>
        <input
          id="location"
          name="location"
          type="text"
          placeholder="Main St, Springfield"
          value={formData.location}
          onChange={handleChange}
          required
          aria-label="Enter the disaster location"
        />

        <label htmlFor="report">Report</label>
        <textarea
          id="report"
          name="report"
          placeholder="Provide details of the disaster..."
          value={formData.report}
          onChange={handleChange}
          required
          aria-label="Provide details of the disaster"
        ></textarea>

        <label htmlFor="file" className={styles.imgLabel}>
          <input
            type="file"
            id="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            aria-label="Upload a disaster image"
          />
          <p>Upload Disaster Image</p>
        </label>

        {imagePreview && (
          <img src={imagePreview} alt="Disaster preview" className={styles.previewImage} />
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={styles.btnDisaster}
          aria-label={isLoading ? "Submitting report" : "Submit disaster report"}
        >
          {isLoading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
};

export default DisasterForm;