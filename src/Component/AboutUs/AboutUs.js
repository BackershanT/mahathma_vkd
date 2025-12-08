import React from 'react';
import './AboutUs.css';
import logo_big from '../../Assets/logo_big.png';
import { FaBullseye, FaEye } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <h2 className="section-title">About Our Club</h2>
        <p className="section-description">
          Founded with a vision to bring positive change in our community, we have grown into a family of 200+ dedicated members working together for a better tomorrow.
        </p>

        <div className="about-main-content">
          <div className="about-image-container">
            <img src={logo_big} alt="Mahathma Veliyancode Community" />
          </div>
          
          <div className="about-text-content">
            <div className="about-story">
              <h3>Our Story</h3>
              <p>
                Established in 2010, our club started with a small group of passionate individuals who wanted to make a difference in the local community. Over the years, we have grown significantly while maintaining our core values of service, integrity, and unity.
              </p>
              <p>
                Today, we are proud to have 200+ active members from diverse backgrounds, all united by a common goal: to create positive impact through community service, education, health initiatives, and cultural programs.
              </p>
              
              <div className="about-stats">
                <div className="stat-item">
                  <span className="stat-number">200+</span>
                  <span className="stat-label">Members</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Events/Year</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">14+</span>
                  <span className="stat-label">Years</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mission-vision-cards">
          <div className="mission-vision-card">
            <div className="card-icon mission-icon">
              <FaBullseye size={40} />
            </div>
            <h3>Our Mission</h3>
            <p>
              Our mission is to empower the community through collaborative action, fostering unity, and creating sustainable 
              programs that address the needs of our members and neighbors. We strive to be a catalyst for positive change, 
              bringing together people from all walks of life to work towards common goals that benefit everyone.
            </p>
          </div>

          <div className="mission-vision-card">
            <div className="card-icon vision-icon">
              <FaEye size={40} />
            </div>
            <h3>Our Vision</h3>
            <p>
              We envision Mahathma Veliyancode as a leading community organization recognized for excellence in service, 
              innovation, and impact. Our vision is to inspire and create a model of community engagement that others can 
              follow, ultimately contributing to a more inclusive, healthy, and prosperous society for all.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
