import React, { useContext, useState, useEffect } from 'react';
import './HeroSection.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext/AuthContext';
import { MdCreditCard } from 'react-icons/md';
import { FaBars, FaTimes } from 'react-icons/fa';
import logo_text from '../../Assets/logo_text.png';
import logo_big from '../../Assets/logo_big.png';

function HeroSection() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Array of hero images - you can add more images here
  const heroImages = [
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1920',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920',
    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920'
  ];
  
  // Auto-scroll images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [heroImages.length]);
  
  const handleFABClick = () => {
    if (currentUser) {
      navigate('/membership');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="hero-container" style={{ backgroundImage: `url(${heroImages[currentImageIndex]})` }}>
      <header className="navbar">
        <div className="logo-container">
          <img src={logo_big} alt="Mahathma Veliyancode" className="logo-icon" />
          <div className="logo-text">
            <h2>Mahathma Veliyancode</h2>
            <p>Serving Since 2010</p>
          </div>
        </div>
        <button className="hamburger-menu" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
        <nav className={isMenuOpen ? 'nav-open' : ''}>
          <ul>
            <li><a href="#home" onClick={closeMenu}>Home</a></li>
            <li><a href="#join-us" onClick={closeMenu}>Join Us</a></li>
            <li><a href="#events" onClick={closeMenu}>Events</a></li>
            <li><a href="#about" onClick={closeMenu}>About</a></li>
            <li><a href="#contact" onClick={closeMenu}>Contact</a></li>
          </ul>
        </nav>
      </header>

      <main className="hero-content">
        <div className="hero-overlay">
          {/* <h1>Welcome to Our Mahathma Veliyancode</h1> */}
          {/* <p>Join 200+ members making a difference in our community through service, friendship, and shared values.</p> */}
        </div>
      </main>

      <div className="hero-indicators">
        {heroImages.map((_, index) => (
          <span
            key={index}
            className={currentImageIndex === index ? 'active' : ''}
            onClick={() => goToImage(index)}
          ></span>
        ))}
      </div>

      {/* Floating Action Button */}
      {currentUser && (
        <div className="fab" onClick={handleFABClick}>
          <MdCreditCard size={24} />
        </div>
      )}
    </div>
  );
}

export default HeroSection;
