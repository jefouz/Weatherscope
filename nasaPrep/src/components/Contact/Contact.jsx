import React, { useState } from "react";
import "./Contact.css";
import emailjs from "emailjs-com";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState(""); // success | error | sending

  // ⚙️ Your EmailJS credentials (replace these with your own)
  const SERVICE_ID = "service_bht0f1d";
  const TEMPLATE_ID = "template_hxgdkde";
  const PUBLIC_KEY = "D739shCHBKFqRtP3I";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("sending");

    // Send email using EmailJS
    emailjs
      .send(SERVICE_ID, TEMPLATE_ID, formData, PUBLIC_KEY)
      .then(() => {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      })
      .catch((error) => {
        console.error("EmailJS Error:", error);
        setStatus("error");
      });
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
          <p>ajaffal121@gmail.com</p>
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

        {status === "success" ? (
          <div className="thank-you-message">
            <h3>🎉 Thank you for reaching out!</h3>
            <p>Your message has been sent successfully.</p>
            <button onClick={() => setStatus("")} className="btn-submit">
              Send Another Message
            </button>
          </div>
        ) : (
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

            <button
              type="submit"
              className="btn-submit"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>

            {status === "error" && (
              <p className="error-text">
                ❌ Something went wrong. Please try again later.
              </p>
            )}
          </form>
        )}
      </section>
    </div>
  );
};

export default Contact;
