// // FloatingBar.jsx
// import React, { useState } from 'react';
// import './FloatingBar.css';
// import MembershipCard from './MembershipCard';

// const FloatingBar = ({ user }) => {
//   const [showCard, setShowCard] = useState(false);

//   const toggleCard = () => setShowCard(!showCard);

//   return (
//     <>
//       <div className="floating-bar" onClick={toggleCard}>
//         👤 {user.name}'s Card
//       </div>

//       {showCard && <MembershipCard user={user} onClose={toggleCard} />}
//     </>
//   );
// };

// export default FloatingBar;
