import React, { useState } from 'react';
import { db, auth } from '../Firebase/Firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
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
      let user;

      try {
        // Try to create the user in Auth
        const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        user = userCredential.user;
      } catch (authError) {
        if (authError.code === 'auth/email-already-in-use') {
          // If auth user exists, we might still need to create the firestore doc
          // In a real setup, we'd probably just stop here, but for "Setup", let's try to fix the DB
          console.log("Admin auth exists, checking DB...");
          // We can't get the UID easily without signing in. 
          // For this simple setup script, we'll assume failure if auth exists to avoid complexity.
          return { success: false, message: 'Admin Authentication account already exists. data not written.' };
        }
        throw authError;
      }

      // Store admin data in Firestore using the Auth UID
      await setDoc(doc(db, 'users', user.uid), {
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
        // Password not stored in DB
        isAdmin: true, // This is the ONE place we try to write isAdmin=true. 
        // Note: This will FAIL if rules forbid ANY client writing isAdmin=true.
        // Use Firebase Console to set your first admin if this fails.
        isBloodDonor: false,
        uid: user.uid
      });

      return { success: true, message: 'Admin created successfully!' };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Admin creation failed: ' + error.message };
    }
  };

  const createMember = async () => {
    try {
      const memberEmail = 'user@gmail.com';
      const memberPassword = '123456';
      let user;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, memberEmail, memberPassword);
        user = userCredential.user;
      } catch (authError) {
        if (authError.code === 'auth/email-already-in-use') {
          return { success: false, message: 'Member Authentication account already exists.' };
        }
        throw authError;
      }

      // Store member data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
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
        // No password in DB
        isAdmin: false,
        isBloodDonor: false,
        uid: user.uid
      });

      return { success: true, message: 'Member created successfully!' };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Member creation failed: ' + error.message };
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

