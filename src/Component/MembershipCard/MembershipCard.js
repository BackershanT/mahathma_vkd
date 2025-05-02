import React, { useEffect, useState } from 'react';
import { auth, db } from '../Firebase/Firebase';
import { doc, getDoc } from 'firebase/firestore';
import './MembershipCard.css';

const getInitial = (name) => name?.[0]?.toUpperCase() || '?';

const MembershipCard = () => {
  const [userData, setUserData] = useState(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, []);

  if (!userData) return <div className="card-container">Loading...</div>;

  return (
    <div className="card-scene" onClick={() => setFlipped(!flipped)}>
      <div className={`card ${flipped ? 'is-flipped' : ''}`}>
        {/* Front Side */}
        <div className="card-face card-front">
          <div className="card-photo" style={{ backgroundColor: '#'+(userData.name.charCodeAt(0)*100).toString(16).slice(0,6) }}>
            {getInitial(userData.name)}
          </div>
          <div className="card-info">
            <p><strong>Name:</strong> {userData.name}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Mobile:</strong> {userData.mobile}</p>
          </div>
        </div>

        {/* Back Side */}
        <div className="card-face card-back">
        <div className="card-info">
  <div className="info-item">
    <span className="label">Address:</span>
    <span className="value">{userData.address}</span>
  </div>
  <div className="info-item">
    <span className="label">Blood Group:</span>
    <span className="value">{userData.bloodGroup}</span>
  </div>
  <div className="info-item">
    <span className="label">Gender:</span>
    <span className="value">{userData.gender}</span>
  </div>
  <div className="info-item">
    <span className="label">DOB:</span>
    <span className="value">{userData.dob}</span>
  </div>
</div>

        </div>
      </div>
    </div>
  );
};

export default MembershipCard;
