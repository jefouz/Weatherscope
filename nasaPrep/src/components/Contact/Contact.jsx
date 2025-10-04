import React, { useState } from "react";
import "./Contact.css";
import { Link } from "react-router-dom";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can handle form submission (API call or email service)
    alert("Thank you! Your message has been submitted.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="contact-container">
      {/* Hero Section */}
      <section className="contact-hero">
        <h1>Contact Us</h1>
        <p>
          Have questions or feedback? Reach out to us using the form below or
          through our contact details. We’d love to hear from you!
        </p>
      </section>

      {/* Contact Info Section */}
      <section className="contact-info">
        <div className="info-card">
          <h3>Email</h3>
          <p>ajaffal126@gmail.com</p>
        </div>
        <div className="info-card">
          <h3>Phone</h3>
          <p>+961 70 945 378</p>
        </div>
        <div className="info-card">
          <h3>Location</h3>
          <p>Beirut, Lebanon</p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-section">
        <h2>Send Us a Message</h2>
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              required
            />
          </div>
          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subject"
              required
            />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message"
              rows="5"
              required
            ></textarea>
          </div>
          <button type="submit" className="btn-submit">
            Send Message
          </button>
        </form>
      </section>
    </div>
  );
};

export default Contact;
