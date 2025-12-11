import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext/AuthContext';
import MembershipCardModal from './MembershipCardModal';
import { FaIdCard } from 'react-icons/fa';
import './FloatingActionButton.css';

const FloatingActionButton = () => {
  const { currentUser } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!currentUser || currentUser.isAdmin) {
    return null; // Don't show FAB for admin or logged out users
  }

  const handleClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="fab-container">
        <button
          className="fab-button"
          onClick={handleClick}
          aria-label="Member Profile"
        >
          <FaIdCard />
        </button>
      </div>

      {isModalOpen && (
        <MembershipCardModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default FloatingActionButton;

