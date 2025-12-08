import React, { useState } from 'react';
import './MembershipForm.css';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTint, FaVenusMars, FaCalendar, FaUserTie, FaGraduationCap, FaBriefcase } from 'react-icons/fa';
import { db } from '../Firebase/Firebase';
import { collection, addDoc } from 'firebase/firestore';

const MembershipForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.fatherName.trim()) newErrors.fatherName = "Father's name is required";
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.availability) newErrors.availability = 'Availability is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.status === 'Working') {
      if (!formData.profession.trim()) newErrors.profession = 'Profession is required';
    }
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = {
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.address,
        bloodGroup: formData.bloodGroup,
        gender: formData.gender,
        dob: formData.dob,
        fatherName: formData.fatherName,
        qualification: formData.qualification,
        profession: formData.status === 'Working' ? formData.profession : '',
        workplace: formData.status === 'Working' ? formData.workplace : '',
        status: formData.status,
        availability: formData.availability,
        createdAt: new Date().toISOString(),
        password: formData.password, // Store password (in production, this should be hashed)
        isAdmin: false,
        isBloodDonor: false,
      };

      await addDoc(collection(db, 'users'), userData);

      alert('Membership application submitted successfully! Please login with your credentials.');
      navigate('/login');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="membership-form-page">
      <div className="membership-form-container">
        <div className="form-header">
          <h1>Apply for Membership</h1>
          <p>Join our community and make a difference. Please fill out the form below.</p>
        </div>

        <form className="membership-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label><FaUser /> First Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label><FaUser /> Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><FaEnvelope /> Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label><FaPhone /> Mobile Number</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="+91 1234567890"
                />
                {errors.mobile && <span className="error-text">{errors.mobile}</span>}
              </div>
            </div>

            <div className="form-group">
              <label><FaMapMarkerAlt /> Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your complete address"
                rows="3"
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><FaTint /> Blood Group</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
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
                {errors.bloodGroup && <span className="error-text">{errors.bloodGroup}</span>}
              </div>
              <div className="form-group">
                <label><FaVenusMars /> Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <span className="error-text">{errors.gender}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><FaCalendar /> Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                />
                {errors.dob && <span className="error-text">{errors.dob}</span>}
              </div>
              <div className="form-group">
                <label><FaUserTie /> Father's Name</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  placeholder="Enter father's name"
                />
                {errors.fatherName && <span className="error-text">{errors.fatherName}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Education & Profession</h3>
            <div className="form-group">
              <label><FaGraduationCap /> Educational Qualification</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="e.g., B.Tech, B.Sc, etc."
              />
              {errors.qualification && <span className="error-text">{errors.qualification}</span>}
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="">Select Status</option>
                <option value="Studying">Studying</option>
                <option value="Working">Working</option>
              </select>
              {errors.status && <span className="error-text">{errors.status}</span>}
            </div>

            {formData.status === 'Working' && (
              <>
                <div className="form-group">
                  <label><FaBriefcase /> Profession</label>
                  <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    placeholder="Enter your profession"
                  />
                  {errors.profession && <span className="error-text">{errors.profession}</span>}
                </div>
                <div className="form-group">
                  <label>Workplace</label>
                  <input
                    type="text"
                    name="workplace"
                    value={formData.workplace}
                    onChange={handleChange}
                    placeholder="Enter your workplace (optional)"
                  />
                </div>
              </>
            )}
          </div>

          <div className="form-section">
            <h3>Additional Information</h3>
            <div className="form-group">
              <label>Availability</label>
              <select name="availability" value={formData.availability} onChange={handleChange}>
                <option value="">Select Availability</option>
                <option value="Native">Native</option>
                <option value="Abroad">Abroad</option>
              </select>
              {errors.availability && <span className="error-text">{errors.availability}</span>}
            </div>
          </div>

          <div className="form-section">
            <h3>Account Setup</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/')}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MembershipForm;

