import React, { useState } from "react";
import styles from "./HelpForm.module.css";

const HelpForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    assistanceType: "",
    message: "",
    anonymous: false,
    stakeholderName: "",
    stakeholderPhone: "",
    stakeholderPosition: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, anonymous: e.target.checked });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Aid Victims of Disaster</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            disabled={formData.anonymous}
            required={!formData.anonymous}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={formData.anonymous}
            required={!formData.anonymous}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={formData.anonymous}
            required={!formData.anonymous}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={formData.anonymous}
            required={!formData.anonymous}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="assistanceType">Type of Assistance</label>
          <select
            id="assistanceType"
            name="assistanceType"
            value={formData.assistanceType}
            onChange={handleChange}
            required
            className={styles.input}
          >
            <option value="">Select Assistance Type</option>
            <option value="financial">Financial Support</option>
            <option value="supplies">Supplies Donation</option>
            <option value="volunteering">Volunteering</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message">Additional Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              id="anonymous"
              name="anonymous"
              checked={formData.anonymous}
              onChange={handleCheckboxChange}
            />
            Submit Anonymously
          </label>
        </div>
        <button type="submit" className={styles.submitBtn}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default HelpForm;