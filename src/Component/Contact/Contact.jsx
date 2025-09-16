import React, { useState } from "react";
import styles from "./Contact.module.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [formSuccess, setFormSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = "Name is required.";
    if (!formData.email) errors.email = "Email is required.";
    if (!formData.message) errors.message = "Message is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const res = await fetch("http://localhost:4000/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setFormSuccess("Thank you for your message. We will get back to you soon.");
          setFormData({ name: "", email: "", message: "" });
          setFormErrors({});
        } else {
          setFormSuccess("");
          setFormErrors({ message: data.message || "Failed to send message." });
        }
      } catch (err) {
        setFormSuccess("");
        setFormErrors({ message: "Server error. Please try again later." });
      }
    }
  };

  return (
    <div className={styles.contactContainer}>
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        {formErrors.name && <p className={styes.error}>{formErrors.name}</p>}

        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {formErrors.email && <p className={styles.error}>{formErrors.email}</p>}

        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows="5"
          value={formData.message}
          onChange={handleChange}
        ></textarea>
        {formErrors.message && <p className={styles.error}>{formErrors.message}</p>}

        <button type="submit">Submit</button>
      </form>
      {formSuccess && <p className={styles.success}>{formSuccess}</p>}
    </div>
  );
};

export default Contact;
