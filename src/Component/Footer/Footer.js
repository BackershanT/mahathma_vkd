import React from 'react';
import './Footer.css';
import logo_big from '../../Assets/logo_big.png';
import { useNavigate } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaXTwitter, FaMapPin } from 'react-icons/fa6';

const Footer = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo-section">
          <div className="footer-logo">
            <img src={logo_big} alt="Mahathma Veliyancode" />
            <div className="footer-logo-text">
              <h3>Mahathma Veliyancode</h3>
            </div>
          </div>
          <p className="footer-tagline">
            Building a stronger community together through service, unity, and shared values.
          </p>
          <div className="footer-social">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaXTwitter />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-links-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li>
              <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>
                Home
              </a>
            </li>
            <li>
              <a href="#join-us" onClick={(e) => { e.preventDefault(); scrollToSection('join-us'); }}>
                Join Us
              </a>
            </li>
            <li>
              <a href="#events" onClick={(e) => { e.preventDefault(); scrollToSection('events'); }}>
                Events
              </a>
            </li>
            <li>
              <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>
                About
              </a>
            </li>
            <li>
              <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-map-section">
          <h4>Our Location</h4>
          <div className="footer-map-wrapper">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.5!2d76.0!3d11.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDAwJzAwLjAiTiA3NsKwMDAnMDAuMCJF!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mahathma Veliyancode Location"
            ></iframe>
          </div>
          <div className="footer-address">
            <FaMapPin />
            <p>Veliyancode Kinar, Veliyancode P.O,<br />Malappuram, Kerala - 679579</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Mahathma Veliyancode. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

