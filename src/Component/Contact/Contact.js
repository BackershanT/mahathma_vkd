import React, { useState, useRef } from 'react';
import './Contact.css';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import emailjs from '@emailjs/browser';

const Contact = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    message: '' 
  });
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
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
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
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('EmailJS error:', error);
      setFormStatus('There was an error sending your message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <h2 className="section-title">Get In Touch</h2>
        <p className="section-description">
          Have questions or want to learn more about our club? We'd love to hear from you!
        </p>

        <div className="contact-content">
          <div className="contact-form-wrapper">
            <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
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
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>

              <div className="input-group">
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>

              <div className="input-group">
                <textarea
                  name="message"
                  placeholder="Your message here..."
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                />
                {errors.message && <span className="error">{errors.message}</span>}
              </div>

              <button type="submit" disabled={isSubmitting} className="submit-btn">
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
              
              {formStatus && (
                <p className={`form-status ${formStatus.includes('error') ? 'error' : 'success'}`}>
                  {formStatus}
                </p>
              )}
            </form>
          </div>

          <div className="contact-info-card">
            <h3>Contact Information</h3>
            <div className="contact-info-item">
              <FaMapMarkerAlt className="contact-icon" />
              <div>
                <p>Mahathma Veliyancode,</p>
                <p>Veliyancode Kinar, Veliyancode P.O,</p>
                <p>Malappuram, Kerala</p>
                <p>Pin: 679579</p>
              </div>
            </div>
            
            <div className="contact-info-item">
              <FaPhoneAlt className="contact-icon" />
              <div>
                <p>+91 9946411699</p>
                <p>+91 9946411699</p>
              </div>
            </div>
            
            <div className="contact-info-item">
              <FaEnvelope className="contact-icon" />
              <div>
                <p>
                  <a href="mailto:mahathmavkd123@gmail.com">mahathmavkd123@gmail.com</a>
                </p>
                <p>
                  <a href="mailto:contact@mahathmaveliyancode.org">contact@mahathmaveliyancode.org</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
