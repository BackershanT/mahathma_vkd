import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <section className="about-section">
      <div className="about-sidebar">
        <h2>About Us</h2>
      </div>
      <div className="about-content">
        <div className="about-block">
          <h3>Vision</h3>
          <p>Our vision is to empower the community through social initiatives, cultural events, and educational programs.</p>
        </div>
        <div className="about-block">
          <h3>Mission</h3>
          <p>Our mission is to create a positive impact by organizing inclusive activities and fostering unity in Veliyancode.</p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
