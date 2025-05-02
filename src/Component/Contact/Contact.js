import React, { useState } from 'react';
import './Contact.css';
import { FaFacebookF, FaInstagram, FaXTwitter } from 'react-icons/fa6'; // XTwitter is the new Twitter icon
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear error on input
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      alert('Form submitted successfully!');
      // Process form here (e.g., send to backend)
      setFormData({ name: '', email: '', message: '' });
    }
  };


  return (
    <div className="contact-container">
         <form className="contact-form" onSubmit={handleSubmit}>
      <div className="row">
        <div className="input-group">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>
        <div className="input-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
      </div>
      <div className="input-group">
        <textarea
          name="message"
          placeholder="Message"
          value={formData.message}
          onChange={handleChange}
          rows="10"
        />
        {errors.message && <span className="error">{errors.message}</span>}
      </div>
      <button type="submit">Send</button>
    </form>
    <br/>
      {/* Left Section */}
      <div className="contact-info">
        <h1>Contact Us</h1>
        <p>feel free to reach out on any Queries, feedback, or collaborations</p>
        <ul className="contact-list">
  <li>
    <FaPhoneAlt /> +91 1234567890
  </li>
  <li>
    <FaEnvelope /> <a href="mailto:backershan.t@gmail.com">mahathma@gmail.com</a>
  </li>
  <li>
    <FaMapMarkerAlt /> Mahathma Veliyancode,<br />
    Veliyancode Kinar, Veliyancode P.O,<br />
    Malappuram, Kerala<br />
    Pin : 679579
  </li>
</ul>
        <div className="social-icons">
        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
          <FaInstagram />
        </a>
        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
          <FaFacebookF />
        </a>
        <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
          <FaXTwitter />
        </a>
      </div>
      </div>

   
    </div>
  );
};

export default Contact;
