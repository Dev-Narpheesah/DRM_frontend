

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./DisasterForm.module.css";

const initialState = {
  email: "",
  phone: "",
  password: "",
  disasterType: "",
  location: "",
  report: "",
};

const DisasterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialState);
  const [imagePreview, setImagePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formDataWithImage = new FormData();
    formDataWithImage.append("email", formData.email);
    formDataWithImage.append("phone", formData.phone);
    formDataWithImage.append("password", formData.password); // backend requires this
    formDataWithImage.append("disasterType", formData.disasterType);
    formDataWithImage.append("location", formData.location);
    formDataWithImage.append("report", formData.report);
    if (file) {
      formDataWithImage.append("file", file); // must match multer field name in backend
    }

    try {
      const response = await fetch(
        "https://drm-backend.vercel.app/api/user", // backend register route
        {
          method: "POST",
          body: formDataWithImage,
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit disaster report");
      }

      toast.success("Disaster report submitted successfully!");
      setFormData(initialState);
      setFile(null);
      setImagePreview(null);
      navigate("/card");
    } catch (error) {
      console.error("Failed to submit disaster report", error);
      toast.error("Failed to submit disaster report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.container} onSubmit={handleSubmit}>
        <label htmlFor="email">Email Address</label>
        <input
          name="email"
          type="email"
          placeholder="example@gmail.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="phone">Phone Number</label>
        <input
          name="phone"
          type="tel"
          placeholder="+234 567890"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          name="password"
          type="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label htmlFor="disasterType">Disaster Type</label>
        <select
          name="disasterType"
          value={formData.disasterType}
          onChange={handleChange}
          required
          className={styles.select}
        >
          <option value="">Select Disaster Type</option>
          <option value="Flood">Flood</option>
          <option value="Earthquake">Earthquake</option>
          <option value="Fire">Fire</option>
          <option value="Hurricane">Hurricane</option>
          <option value="Tornado">Tornado</option>
          <option value="Other">Other</option>
        </select>

        <label htmlFor="location">Location</label>
        <input
          name="location"
          type="text"
          placeholder="Main St, Springfield"
          value={formData.location}
          onChange={handleChange}
          required
        />

        <label htmlFor="report">Report</label>
        <textarea
          name="report"
          placeholder="Provide details of the disaster..."
          value={formData.report}
          onChange={handleChange}
          required
        ></textarea>

        <label htmlFor="file" className={styles.imgLabel}>
          <input
            type="file"
            id="file"
            name="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            required
          />
          <p>Upload Disaster Image</p>
        </label>

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className={styles.previewImage}
          />
        )}

        <button
          type="submit"
          className={styles.btn_disaster}
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
};

export default DisasterForm;
