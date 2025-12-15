import React from 'react';
import './JoinMission.css';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaTint } from 'react-icons/fa';

const JoinMission = () => {
  const navigate = useNavigate();

  return (
    <section id="join-us" className="join-mission-section">
      <div className="join-mission-container">
        <h2 className="section-title">Join Our Mission</h2>
        <p className="section-description">
          Be part of something bigger. Whether you want to become a member or contribute to our blood donation program, we welcome you.
        </p>

        <div className="mission-cards">
          <div className="mission-card">
            <div className="card-icon ">
              <FaUserPlus size={40} />
            </div>
            <h3>Become a Member</h3>
            <p>Join our community of 200+ active members and participate in meaningful activities that make a real difference.</p>
            <button className="card-button membership-btn" onClick={() => navigate('/membership-form')}>
              Apply for Membership
            </button>
          </div>

          <div className="mission-card">
            <div className="card-icon donation-icon">
              <FaTint size={40} />
            </div>
            <h3>Blood Donation Program</h3>
            <p>Register as a blood donor and save lives. Your contribution can make a critical difference in emergency situations.</p>
            <button
              className="card-button donation-btn"
              onClick={() => navigate('/register-donor')}
            >
              Register as Donor
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinMission;

