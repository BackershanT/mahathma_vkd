import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext/AuthContext';
import MembershipCardModal from './MembershipCardModal';
import { FaIdCard, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import './FloatingActionButton.css';

const FloatingActionButton = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (!currentUser || currentUser.isAdmin) {
    return null; // Don't show FAB for admin or logged out users
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      setShowMenu(false);
      window.location.href = '/';
    }
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
    setShowMenu(false);
  };

  return (
    <>
      <div className={`fab-container ${showMenu ? 'menu-open' : ''}`}>
        {showMenu && (
          <div className="fab-menu">
            <button className="fab-menu-item" onClick={handleCardClick}>
              <FaIdCard /> Membership Card
            </button>
            <button className="fab-menu-item logout" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        )}
        <button
          className="fab-button"
          onClick={() => setShowMenu(!showMenu)}
          aria-label="User menu"
        >
          {showMenu ? <FaTimes /> : <FaIdCard />}
        </button>
      </div>

      {isModalOpen && (
        <MembershipCardModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default FloatingActionButton;

