import React, { useState, useEffect, useRef } from 'react';
import './RegisterDonor.css';
import { FaTint, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { auth, db } from '../Firebase/Firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

const RegisterDonor = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        place: '',
        bloodGroup: ''
    });

    // Changed otp state to array of 6 strings
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const recaptchaContainerRef = useRef(null);
    const recaptchaVerifierRef = useRef(null);

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    // Initialize RecaptchaVerifier once on mount
    useEffect(() => {
        // Cleanup function first to handle StrictMode double-mount safely
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

        // If we are re-mounting, clean up the old one first logic is handled by the return function of the previous effect, 
        // but explicit check here helps.
        cleanup();

        if (!auth || !recaptchaContainerRef.current) {
            console.error("Auth or Recaptcha Container not found");
            return;
        }

        try {
            // Create new verifier with DOM element ref
            const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
                'size': 'invisible',
                'callback': (response) => {
                    // reCAPTCHA solved
                },
                'expired-callback': () => {
                    setError('Recaptcha expired. Please refresh the page and try again.');
                    setLoading(false);
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
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const onSignInSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');

        // Basic validation
        if (!formData.name || !formData.email || !formData.phone || !formData.place || !formData.bloodGroup) {
            setError('Please fill in all fields.');
            return;
        }

        if (formData.phone.length < 10) {
            setError('Please enter a valid phone number.');
            return;
        }

        setLoading(true);

        if (!recaptchaVerifierRef.current) {
            setError("System verification failed. Please refresh the page.");
            setLoading(false);
            return;
        }

        const appVerifier = recaptchaVerifierRef.current;
        const phoneNumber = formData.phone.startsWith('+')
            ? formData.phone
            : `+91${formData.phone.replace(/\D/g, '')}`;

        try {
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            setConfirmationResult(confirmation);
            setShowOtpInput(true);
            setLoading(false);
            setSuccess('OTP sent successfully to your phone number.');
        } catch (err) {
            setLoading(false);
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

        setLoading(true);
        setError('');

        try {
            await confirmationResult.confirm(otpCode);
            await saveDonorData();
        } catch (err) {
            setLoading(false);
            setError('Invalid OTP. Please check and try again.');
            console.error(err);
        }
    };

    const saveDonorData = async () => {
        try {
            const uid = auth.currentUser ? auth.currentUser.uid : null;

            // 1. Save to blood_donors collection (for tracking donations)
            await addDoc(collection(db, 'blood_donors'), {
                ...formData,
                createdAt: new Date().toISOString(),
                verified: true,
                uid: uid
            });

            // 2. Also create/update the user in 'users' collection (so they become a Member)
            if (uid) {
                // Split name into first and last for the user schema
                const nameParts = formData.name.split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.slice(1).join(' ') || '';

                await setDoc(doc(db, 'users', uid), {
                    name: firstName,
                    lastName: lastName,
                    email: formData.email,
                    mobile: formData.phone,
                    address: formData.place,
                    bloodGroup: formData.bloodGroup,
                    // Default values for fields not collected in donor form
                    gender: '',
                    dob: '',
                    fatherName: '',
                    qualification: '',
                    profession: '',
                    workplace: '',
                    status: 'Donor',
                    availability: 'Native',
                    createdAt: new Date().toISOString(),
                    // isAdmin field omitted to avoid permission errors
                    isBloodDonor: true,
                    uid: uid
                });
            }

            setLoading(false);
            setSuccess('Registration successful! You are now a registered blood donor and member.');
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            setLoading(false);
            setError('Error saving data: ' + err.message);
            console.error("Firestore Error:", err);
        }
    };

    // Add Paste functionality
    const handleOtpPaste = (e) => {
        const data = e.clipboardData.getData("text");
        if (!Number(data) || data.length !== 6) return;
        e.preventDefault();
        const pasteCode = data.split("");
        setOtp(pasteCode);
    };


    return (
        <section className="register-donor-section">
            <div className="register-donor-container">
                <div className="register-donor-card">
                    <div className="register-donor-header">
                        <FaTint size={50} className="blood-icon" />
                        <h2>Register as Blood Donor</h2>
                        <p>Join our mission to save lives. Please fill in your details below.</p>
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
                        <form onSubmit={onSignInSubmit} className="donor-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                                <small style={{ color: '#94a3b8', fontSize: '0.8rem' }}>We will send an OTP to verify this number.</small>
                            </div>

                            <div className="form-group">
                                <label>Place / City</label>
                                <input
                                    type="text"
                                    name="place"
                                    placeholder="Enter your current location"
                                    value={formData.place}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Blood Group</label>
                                <select
                                    name="bloodGroup"
                                    value={formData.bloodGroup}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Blood Group</option>
                                    {bloodGroups.map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Verify & Register'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={verifyOtp} className="donor-form anime-fade-in">
                            <div className="form-group" style={{ textAlign: 'center' }}>
                                <label>Enter OTP</label>
                                <p style={{ color: '#64748b', marginBottom: '15px' }}>
                                    We sent a code to {formData.phone}
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

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Verifying...' : 'Confirm Registration'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowOtpInput(false)}
                                className="submit-btn"
                                style={{ background: 'transparent', color: '#64748b', boxShadow: 'none', border: '1px solid #e2e8f0' }}
                            >
                                Back to details
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
};

export default RegisterDonor;
