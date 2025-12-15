import React, { useState } from 'react';
import './Signup.css';
import { db, auth } from '../Firebase/Firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';


const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    lastName: '',
    email: '',
    mobile: '',
    address: '',
    bloodGroup: '',
    gender: '',
    dob: '',
    fatherName: '',
    qualification: '',
    profession: '',
    workplace: '',
    password: '',
    confirmPassword: '',
    status: '',
    availability: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      // Prepare data
      const userData = {
        name: form.name,
        lastName: form.lastName,
        email: form.email,
        mobile: form.mobile,
        address: form.address,
        bloodGroup: form.bloodGroup,
        gender: form.gender,
        dob: form.dob,
        fatherName: form.fatherName,
        qualification: form.qualification,
        profession: form.status === 'Working' ? form.profession : '',
        workplace: form.status === 'Working' ? form.workplace : '',
        status: form.status,
        availability: form.availability,
        createdAt: new Date().toISOString(),
        // Password should not be stored in Firestore
        // isAdmin and isBloodDonor fields omitted to prevent permission errors
        uid: user.uid,
      };

      // Store in Firestore using the Auth UID
      await setDoc(doc(db, 'users', user.uid), userData);

      alert('Signup successful! Please login with your credentials.');
      navigate('/login');
    } catch (error) {
      console.error('Error signing up:', error.message);
      alert('Signup failed: ' + error.message);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        <div className="input-row">
          <input type="text" name="name" placeholder="First Name" value={form.name} onChange={handleChange} required />
          <input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
        </div>

        <div className="input-row">
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input type="tel" name="mobile" placeholder="Mobile Number" value={form.mobile} onChange={handleChange} required />
        </div>

        <textarea name="address" placeholder="Address" value={form.address} onChange={handleChange} required />

        <div className="input-row">
          <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} required>
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>

          <select name="gender" value={form.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="input-row">
          <input type="date" name="dob" value={form.dob} onChange={handleChange} required />
          <input type="text" name="fatherName" placeholder="Father's Name" value={form.fatherName} onChange={handleChange} required />
        </div>

        <div className="input-row">
          <label>Status:</label>
          <select name="status" value={form.status} onChange={handleChange} required>
            <option value="">Select Status</option>
            <option value="Studying">Studying</option>
            <option value="Working">Working</option>
          </select>
        </div>

        {form.status && (
          <div className="input-row">
            <input
              type="text"
              name="qualification"
              placeholder="Educational Qualification"
              value={form.qualification}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {form.status === 'Working' && (
          <>
            <div className="input-row">
              <input
                type="text"
                name="profession"
                placeholder="Profession"
                value={form.profession}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-row">
              <input
                type="text"
                name="workplace"
                placeholder="Workplace"
                value={form.workplace}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        <div className="input-row">
          <label>Availability:</label>
          <select name="availability" value={form.availability} onChange={handleChange} required>
            <option value="">Select Availability</option>
            <option value="Native">Native</option>
            <option value="Abroad">Abroad</option>
          </select>
        </div>

        <div className="input-row">
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />
        </div>

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
