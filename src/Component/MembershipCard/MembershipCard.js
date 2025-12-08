import React, { useState, useEffect, useContext } from 'react';
import './MembershipCard.css';
import { db } from '../Firebase/Firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { AuthContext } from '../AuthContext/AuthContext';
const getInitial = (name) => name?.[0]?.toUpperCase() || '?';

function MemberCard() {
  const [userData, setUserData] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const [flipped, setFlipped] = useState(false);

  const handleCardClick = () => {
    setFlipped(!flipped);
  };
  
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
        }
      }
    };
    fetchUserData();
  }, [currentUser]);
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  

  if (!userData) {
    return <div className="card-container">Loading...</div>;
  }

  return (
    <div className="card-container">
      <div className={`card ${flipped ? 'flipped' : ''}`} onClick={handleCardClick}>
        {/* Front Side */}
        <div className="card-face card-front">
          <div className="photo-placeholder"style={{ backgroundColor: '#'+(userData.name.charCodeAt(0)*100).toString(16).slice(0,6) }}>
          {getInitial(userData.name)}

          </div>
          <div className="info">
            <p><strong>Id</strong>: 001</p>
            <p><strong>Name</strong>: {userData.name} {userData.lastName} </p>
            <p><strong>Blood Group</strong>: {userData.bloodGroup} </p>
            <p><strong>Date of Birth</strong>: {formatDate(userData.dob)}</p>
          </div>
        </div>

        {/* Back Side */}
        <div className="card-face card-back">
          <div className="info">
            <p><strong>Address</strong>: {userData.address} </p>
            <p><strong>Mobile</strong>: {userData.mobile}</p>
            <p><strong>Email Address</strong>: {userData.email}</p>

          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberCard;
