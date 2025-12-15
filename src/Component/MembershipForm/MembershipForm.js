import React, { useState, useEffect, useRef } from 'react';
import './MembershipForm.css';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaPhone, FaMapMarkerAlt, FaTint, FaVenusMars, FaCalendar, FaUserTie, FaGraduationCap, FaBriefcase, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { db, auth } from '../Firebase/Firebase';
import { doc, setDoc } from 'firebase/firestore';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const MembershipForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    mobile: '',
    address: '',
    bloodGroup: '',
    gender: '',
    dob: '',
    fatherName: '',
    qualification: '',
    profession: '',
    workplace: '',
    status: '',
    availability: '',
  });
  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const recaptchaContainerRef = useRef(null);
  const recaptchaVerifierRef = useRef(null);

  // Initialize RecaptchaVerifier once on mount
  useEffect(() => {
    const cleanup = () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          console.error("Error clearing recaptcha", e);
        }
        recaptchaVerifierRef.current = null;
      }
    };

    cleanup();

    if (!auth || !recaptchaContainerRef.current) {
      console.error("Auth or Recaptcha Container not found");
      return;
    }

    try {
      const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setError('Recaptcha expired. Please refresh the page and try again.');
          setIsSubmitting(false);
        }
      });

      recaptchaVerifierRef.current = verifier;
    } catch (err) {
      console.error("Recaptcha Init Error:", err);
      setError("Error initializing verification system. Please refresh.");
    }

    return cleanup;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    setError('');
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    const data = e.clipboardData.getData("text");
    if (!Number(data) || data.length !== 6) return;
    e.preventDefault();
    const pasteCode = data.split("");
    setOtp(pasteCode);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (formData.mobile.length < 10) {
      newErrors.mobile = 'Please enter a valid mobile number';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.fatherName.trim()) newErrors.fatherName = "Father's name is required";
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.availability) newErrors.availability = 'Availability is required';
    if (formData.status === 'Working') {
      if (!formData.profession.trim()) newErrors.profession = 'Profession is required';
    }
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    if (!recaptchaVerifierRef.current) {
      setError("System verification failed. Please refresh the page.");
      setIsSubmitting(false);
      return;
    }

    const appVerifier = recaptchaVerifierRef.current;
    const phoneNumber = formData.mobile.startsWith('+')
      ? formData.mobile
      : `+91${formData.mobile.replace(/\D/g, '')}`;

    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setShowOtpInput(true);
      setIsSubmitting(false);
      setSuccess('OTP sent successfully to your mobile number.');
    } catch (err) {
      setIsSubmitting(false);
      console.error("SMS Error:", err);

      if (err.code === 'auth/invalid-phone-number') {
        setError('The phone number is invalid. Please check the number and country code.');
      } else if (err.code === 'auth/quota-exceeded') {
        setError('SMS quota exceeded. Please try again later.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a while before trying again.');
      } else {
        setError(err.message || 'Error sending OTP. Please try again.');
      }
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError('Please enter the valid 6-digit OTP.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await confirmationResult.confirm(otpCode);
      await saveMemberData();
    } catch (err) {
      setIsSubmitting(false);
      setError('Invalid OTP. Please check and try again.');
      console.error(err);
    }
  };

  const saveMemberData = async () => {
    try {
      const uid = auth.currentUser ? auth.currentUser.uid : null;

      if (!uid) {
        throw new Error('User authentication failed');
      }

      const userData = {
        name: formData.name,
        lastName: formData.lastName,
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
        uid: uid,
        // Email field can be left empty or set to a placeholder
        email: `${formData.mobile}@member.mahathma.org`,
      };

      // Store in Firestore using the Auth UID
      await setDoc(doc(db, 'users', uid), userData);

      setIsSubmitting(false);
      setSuccess('Registration successful! You are now a member.');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setIsSubmitting(false);
      setError('Error saving data: ' + err.message);
      console.error("Firestore Error:", err);
    }
  };


  return (
    <div className="membership-form-page">
      <div className="membership-form-container">
        <div className="form-header">
          <h1>Be a Member</h1>
          <p>Join our community and make a difference. Please fill out the form below.</p>
        </div>

        {error && (
          <div className="error-message">
            <FaExclamationCircle /> {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <FaCheckCircle /> {success}
          </div>
        )}

        <div ref={recaptchaContainerRef} id="recaptcha-container"></div>

        {!showOtpInput ? (
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

              <div className="form-group">
                <label><FaPhone /> Mobile Number</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="+91 1234567890"
                />
                <small style={{ color: '#94a3b8', fontSize: '0.8rem' }}>We will send an OTP to verify this number.</small>
                {errors.mobile && <span className="error-text">{errors.mobile}</span>}
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

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate('/')}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending OTP...' : 'Verify & Register'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="membership-form">
            <div className="form-section" style={{ textAlign: 'center' }}>
              <h3>Verify OTP</h3>
              <p style={{ color: '#64748b', marginBottom: '15px' }}>
                We sent a code to {formData.mobile}
              </p>
              <div className="otp-input-container" onPaste={handleOtpPaste}>
                {otp.map((data, index) => {
                  return (
                    <input
                      className="otp-box"
                      type="text"
                      name="otp"
                      maxLength="1"
                      key={index}
                      value={data}
                      onChange={e => handleOtpChange(e.target, index)}
                      onKeyDown={e => handleOtpKeyDown(e, index)}
                      onFocus={e => e.target.select()}
                    />
                  );
                })}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowOtpInput(false)}
                disabled={isSubmitting}
              >
                Back to Form
              </button>
              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying...' : 'Confirm Registration'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};



export default MembershipForm;


