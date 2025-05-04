import React, { useState,useRef } from 'react';
import './Contact.css';
import { FaFacebookF, FaInstagram, FaXTwitter } from 'react-icons/fa6'; 
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import emailjs from '@emailjs/browser';


const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState(null);

  const formRef = useRef(); 
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }
  
    setErrors({});
  


    try {
      await emailjs.sendForm(
        'service_luetwvj',     
        'template_5vpqvie',   
        formRef.current,       
        'KmiTDTJnuMogsQ9Gr'        
      );

      setFormStatus('Your message has been sent!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('EmailJS error:', error);
      setFormStatus('There was an error sending your message.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="contact-container">
      <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
        <div className="row">
          <div className="input-group">
            <input
              type="text"
              name="name"
              placeholder="Name"
              required
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
          <div className="input-group">
            <input
              type="email"
              name="email"
              required
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
            required
            value={formData.message}
            onChange={handleChange}
            rows="10"
          />
          {errors.message && <span className="error">{errors.message}</span>}
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send'}
        </button>
      </form>
      {formStatus && <p className='form-status'>{formStatus}</p>}

      <br />

      <div className="contact-info">
        <h1>Contact Us</h1>
        <p>Feel free to reach out on any queries, feedback, or collaborations</p>
        <ul className="contact-list">
          <li><FaPhoneAlt /> +91 9946411699</li>
          <li><FaEnvelope /> <a href="mailto:mahathmavkd123@gmail.com">mahathmavkd123@gmail.com</a></li>
          <li>
            <FaMapMarkerAlt /> Mahathma Veliyancode,<br />
            Veliyancode Kinar, Veliyancode P.O,<br />
            Malappuram, Kerala<br />
            Pin: 679579
          </li>
        </ul>
        <div className="social-icons">
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
          <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer"><FaXTwitter /></a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
