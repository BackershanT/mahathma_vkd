import React, { useContext } from 'react';
import './JoinMission.css';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaTint } from 'react-icons/fa';
import { AuthContext } from '../AuthContext/AuthContext';
import { db } from '../Firebase/Firebase';
import { doc, updateDoc, getDocs, collection } from 'firebase/firestore';

const JoinMission = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  return (
    <section id="join-us" className="join-mission-section">
      <div className="join-mission-container">
        <h2 className="section-title">Join Our Mission</h2>
        <p className="section-description">
          Be part of something bigger. Whether you want to become a member or contribute to our blood donation program, we welcome you.
        </p>

        <div className="mission-cards">
          <div className="mission-card">l̥
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
              onClick={async () => {
                if (currentUser) {
                  try {
                    // Find user by email in Firestore
                    const usersSnapshot = await getDocs(collection(db, 'users'));
                    let userDoc = null;
                    let userRef = null;

                    usersSnapshot.forEach((docSnapshot) => {
                      if (docSnapshot.data().email === currentUser.email) {
                        userDoc = docSnapshot;
                        userRef = doc(db, 'users', docSnapshot.id);
                      }
                    });

                    if (userDoc && userRef) {
                      await updateDoc(userRef, { isBloodDonor: true });
                      alert('You have been registered as a blood donor!');
                    } else {
                      alert('Please complete your membership application first.');
                      navigate('/membership-form');
                    }
                  } catch (error) {
                    console.error('Error registering as donor:', error);
                    alert('Error registering as donor. Please try again.');
                  }
                } else {
                  navigate('/login');
                }
              }}
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

