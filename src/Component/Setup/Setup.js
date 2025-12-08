import React, { useState } from 'react';
import { db } from '../Firebase/Firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Setup.css';

const Setup = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const createAdmin = async () => {
    try {
      const adminEmail = 'admin@gmail.com';
      const adminPassword = '123456';

      // Check if admin already exists
      const usersSnapshot = await getDocs(query(collection(db, 'users'), where('email', '==', adminEmail)));
      if (!usersSnapshot.empty) {
        return { success: false, message: 'Admin already exists' };
      }

      // Store admin data in Firestore
      await addDoc(collection(db, 'users'), {
        name: 'Admin',
        lastName: 'User',
        email: adminEmail,
        mobile: '0000000000',
        address: 'Admin Address',
        bloodGroup: 'O+',
        gender: 'Male',
        dob: '1990-01-01',
        fatherName: 'Admin Father',
        qualification: 'Admin',
        status: 'Working',
        profession: 'Administrator',
        workplace: 'Mahathma Veliyancode',
        availability: 'Native',
        createdAt: new Date().toISOString(),
        password: adminPassword, // Store password (in production, this should be hashed)
        isAdmin: true,
        isBloodDonor: false,
      });

      return { success: true, message: 'Admin created successfully!' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const createMember = async () => {
    try {
      const memberEmail = 'user@gmail.com';
      const memberPassword = '123456';

      // Check if member already exists
      const usersSnapshot = await getDocs(query(collection(db, 'users'), where('email', '==', memberEmail)));
      if (!usersSnapshot.empty) {
        return { success: false, message: 'Member already exists' };
      }

      // Store member data in Firestore
      await addDoc(collection(db, 'users'), {
        name: 'Test',
        lastName: 'User',
        email: memberEmail,
        mobile: '1234567890',
        address: 'Test Address, Test City',
        bloodGroup: 'A+',
        gender: 'Male',
        dob: '1995-01-01',
        fatherName: 'Test Father',
        qualification: 'B.Tech',
        status: 'Working',
        profession: 'Software Developer',
        workplace: 'Test Company',
        availability: 'Native',
        createdAt: new Date().toISOString(),
        password: memberPassword, // Store password (in production, this should be hashed)
        isAdmin: false,
        isBloodDonor: false,
      });

      return { success: true, message: 'Member created successfully!' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const handleSetup = async () => {
    setIsCreating(true);
    setStatus('Creating users...');

    const adminResult = await createAdmin();
    const memberResult = await createMember();

    let message = '';
    if (adminResult.success && memberResult.success) {
      message = '✅ Setup completed! Both admin and member accounts created successfully.';
    } else if (adminResult.success || memberResult.success) {
      message = `⚠️ Partial setup: ${adminResult.message} | ${memberResult.message}`;
    } else {
      message = `❌ Setup failed: ${adminResult.message} | ${memberResult.message}`;
    }

    setStatus(message);
    setIsCreating(false);
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <h1>Initial Setup</h1>
        <p className="setup-description">
          This page will create the initial admin and member accounts for the application.
          <br />
          <strong>Run this only once!</strong>
        </p>

        <div className="credentials-info">
          <h3>Credentials to be created:</h3>
          <div className="credential-box">
            <h4>Admin Account</h4>
            <p><strong>Email:</strong> admin@gmail.com</p>
            <p><strong>Password:</strong> 123456</p>
          </div>
          <div className="credential-box">
            <h4>Member Account</h4>
            <p><strong>Email:</strong> user@gmail.com</p>
            <p><strong>Password:</strong> 123456</p>
          </div>
        </div>

        <button 
          className="setup-btn" 
          onClick={handleSetup} 
          disabled={isCreating}
        >
          {isCreating ? 'Creating...' : 'Create Accounts'}
        </button>

        {status && (
          <div className={`status-message ${status.includes('✅') ? 'success' : status.includes('⚠️') ? 'warning' : 'error'}`}>
            {status}
          </div>
        )}

        <button 
          className="back-btn" 
          onClick={() => navigate('/login')}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default Setup;

