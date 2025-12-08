import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext/AuthContext';
import { db } from '../Firebase/Firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FaTimes } from 'react-icons/fa';
import './MembershipCardModal.css';

const getInitial = (name) => name?.[0]?.toUpperCase() || '?';

const MembershipCardModal = ({ onClose }) => {
  const [userData, setUserData] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser && currentUser.email) {
        try {
          const usersQuery = query(collection(db, 'users'), where('email', '==', currentUser.email));
          const usersSnapshot = await getDocs(usersQuery);
          
          if (!usersSnapshot.empty) {
            usersSnapshot.forEach((doc) => {
              setUserData(doc.data());
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [currentUser]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getColorFromName = (name) => {
    if (!name) return '#2563eb';
    const colors = [
      '#2563eb', '#7c3aed', '#dc2626', '#ea580c', 
      '#ca8a04', '#16a34a', '#0891b2', '#be185d'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="membership-modal-overlay" onClick={onClose}>
        <div className="membership-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading membership card...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="membership-modal-overlay" onClick={onClose}>
        <div className="membership-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
          <div className="error-message">
            <p>Unable to load membership card. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="membership-modal-overlay" onClick={onClose}>
      <div className="membership-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="membership-card-wrapper">
          <div className={`membership-card ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
            {/* Front Side */}
            <div className="card-face card-front">
              <div className="card-header">
                <div className="club-logo">
                  <h2>MV</h2>
                </div>
                <div className="club-name">
                  <h3>Mahathma Veliyancode</h3>
                  <p>Membership Card</p>
                </div>
              </div>
              
              <div className="member-photo" style={{ backgroundColor: getColorFromName(userData.name) }}>
                {getInitial(userData.name)}
              </div>
              
              <div className="member-info">
                <div className="info-row">
                  <span className="label">Member ID</span>
                  <span className="value">#{String(userData.id || '001').padStart(3, '0')}</span>
                </div>
                <div className="info-row">
                  <span className="label">Name</span>
                  <span className="value">{userData.name} {userData.lastName || ''}</span>
                </div>
                <div className="info-row">
                  <span className="label">Blood Group</span>
                  <span className="value blood-group">{userData.bloodGroup || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Date of Birth</span>
                  <span className="value">{formatDate(userData.dob)}</span>
                </div>
              </div>
              
              <div className="card-footer">
                <p className="flip-hint">Tap to flip</p>
              </div>
            </div>

            {/* Back Side */}
            <div className="card-face card-back">
              <div className="card-header-back">
                <h3>Contact Information</h3>
              </div>
              
              <div className="member-info-back">
                <div className="info-item">
                  <span className="label">Address</span>
                  <span className="value">{userData.address || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Mobile</span>
                  <span className="value">{userData.mobile || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email</span>
                  <span className="value">{userData.email || 'N/A'}</span>
                </div>
                {userData.qualification && (
                  <div className="info-item">
                    <span className="label">Qualification</span>
                    <span className="value">{userData.qualification}</span>
                  </div>
                )}
                {userData.profession && (
                  <div className="info-item">
                    <span className="label">Profession</span>
                    <span className="value">{userData.profession}</span>
                  </div>
                )}
              </div>
              
              <div className="card-footer-back">
                <p className="flip-hint">Tap to flip back</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipCardModal;

