import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext/AuthContext';
import { db } from '../Firebase/Firebase';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import {
  FaUser, FaPhone, FaMapMarkerAlt, FaTint, FaVenusMars,
  FaCalendar, FaBriefcase, FaGraduationCap, FaEdit, FaSave, FaSignOutAlt,
  FaUserTie, FaGlobe
} from 'react-icons/fa';
// Reuse the styles from the modal for consistency
import '../FloatingActionButton/MembershipCardModal.css';
import './MembershipCard.css'; // Page specific overrides

const getInitial = (name) => name?.[0]?.toUpperCase() || '?';

const MembershipCard = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      // If no user, stop loading immediately (will show login prompt or redirect)
      if (!currentUser) {
        setLoading(false);
        return;
      }

      if (currentUser.email) {
        try {
          const usersQuery = query(collection(db, 'users'), where('email', '==', currentUser.email));
          const usersSnapshot = await getDocs(usersQuery);

          if (!usersSnapshot.empty) {
            const docData = usersSnapshot.docs[0].data();
            const docId = usersSnapshot.docs[0].id;
            const fullData = { id: docId, ...docData };
            setUserData(fullData);
            setFormData(fullData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    if (!userData?.id) return;

    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', userData.id);
      await updateDoc(userRef, {
        name: formData.name,
        lastName: formData.lastName,
        mobile: formData.mobile,
        address: formData.address,
        bloodGroup: formData.bloodGroup,
        gender: formData.gender,
        dob: formData.dob,
        fatherName: formData.fatherName,
        qualification: formData.qualification,
        status: formData.status,
        profession: formData.profession || '',
        workplace: formData.workplace || '',
        availability: formData.availability,
        updatedAt: new Date().toISOString()
      });

      setUserData({ ...formData });
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      window.location.href = '/';
    }
  };

  const getColorFromName = (name) => {
    if (!name) return '#2563eb';
    const colors = [
      '#2563eb', '#7c3aed', '#dc2626', '#ea580c',
      '#ca8a04', '#16a34a', '#0891b2', '#be185d'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  if (loading) {
    return (
      <div className="profile-page-container">
        <div className="loading-container dark-loader">
          <div className="spinner dark-spinner"></div>
          <p>Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="profile-page-container">
        <div className="profile-modal-content static-content">
          <div className="profile-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <h2>Please Login</h2>
            <p>You need to be logged in to view your membership card.</p>
            <a href="/login" className="save-btn" style={{ justifyContent: 'center', maxWidth: '200px', margin: '1rem auto' }}>Login Now</a>
          </div>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="profile-page-container">
        <div className="profile-modal-content static-content">
          <div className="profile-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <h2>Profile Not Found</h2>
            <p>We couldn't find your membership details. Please contact support or register.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page-container">
      <div className="profile-modal-content static-content">

        {/* Header */}
        <header className="profile-header">
          <h2>Member Profile</h2>
          {/* No Close button for page view */}
        </header>

        <div className="profile-body">
          {/* Section 1: Membership Card */}
          <div className="card-section">
            <div className={`membership-card ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
              <div className="card-face card-front">
                <div className="card-header-visual">
                  <div className="club-logo-small">MV</div>
                  <div className="club-name-small">Mahathma Veliyancode</div>
                </div>
                <div className="member-photo-large" style={{ backgroundColor: getColorFromName(userData.name) }}>
                  {getInitial(userData.name)}
                </div>
                <div className="card-details-visual">
                  <h3>{userData.name} {userData.lastName}</h3>
                  <p className="member-id">ID: #{String(userData.id?.substring(0, 6) || '001').toUpperCase()}</p>
                </div>
                <div className="card-chip"></div>
                <p className="flip-instruction">Tap to flip</p>
              </div>
              <div className="card-face card-back">
                <div className="back-content">
                  <h4>Mahathma Veliyancode</h4>
                  <p>Official Membership Card</p>
                  <div className="qr-placeholder">QR CODE</div>
                  <p className="validity">Valid Lifelong</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Personal Details */}
          <div className="details-section">
            <div className="section-title-row">
              <h3>Personal Information</h3>
              {!isEditing ? (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  <FaEdit /> Edit
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="cancel-edit-btn" onClick={() => {
                    setFormData(userData); // Reset changes
                    setIsEditing(false);
                  }}>
                    Cancel
                  </button>
                  <button className="save-btn" onClick={handleSave} disabled={isSaving}>
                    <FaSave /> {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="details-grid">

              {/* Name (First & Last) */}
              <div className="detail-item">
                <label><FaUser /> Name</label>
                {isEditing ? (
                  <div className="input-group-row">
                    <input
                      type="text" name="name" value={formData.name} onChange={handleChange} placeholder="First Name"
                    />
                    <input
                      type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name"
                    />
                  </div>
                ) : (
                  <p>{userData.name} {userData.lastName}</p>
                )}
              </div>

              {/* Mobile */}
              <div className="detail-item">
                <label><FaPhone /> Mobile</label>
                {isEditing ? (
                  <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} />
                ) : (
                  <p>{userData.mobile}</p>
                )}
              </div>

              {/* Email (Read-only usually, but editable if requested. Making Read-only for safety unless asked) */}
              <div className="detail-item">
                <label><FaUser /> Email</label>
                <p className="read-only-text">{userData.email}</p>
              </div>

              {/* Address */}
              <div className="detail-item full-width">
                <label><FaMapMarkerAlt /> Address</label>
                {isEditing ? (
                  <textarea name="address" value={formData.address} onChange={handleChange} rows="2" />
                ) : (
                  <p>{userData.address}</p>
                )}
              </div>

              {/* Blood Group */}
              <div className="detail-item">
                <label><FaTint /> Blood Group</label>
                {isEditing ? (
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                ) : (
                  <p className="blood-tag">{userData.bloodGroup}</p>
                )}
              </div>

              {/* Gender */}
              <div className="detail-item">
                <label><FaVenusMars /> Gender</label>
                {isEditing ? (
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p>{userData.gender}</p>
                )}
              </div>

              {/* DOB */}
              <div className="detail-item">
                <label><FaCalendar /> Date of Birth</label>
                {isEditing ? (
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                ) : (
                  <p>{formatDate(userData.dob)}</p>
                )}
              </div>

              {/* Father's Name */}
              <div className="detail-item">
                <label><FaUserTie /> Father's Name</label>
                {isEditing ? (
                  <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} />
                ) : (
                  <p>{userData.fatherName}</p>
                )}
              </div>

              {/* Availability */}
              <div className="detail-item">
                <label><FaGlobe /> Availability</label>
                {isEditing ? (
                  <select name="availability" value={formData.availability} onChange={handleChange}>
                    <option value="Native">Native</option>
                    <option value="Abroad">Abroad</option>
                  </select>
                ) : (
                  <p>{userData.availability}</p>
                )}
              </div>

              {/* Status */}
              <div className="detail-item">
                <label><FaBriefcase /> Status</label>
                {isEditing ? (
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="Studying">Studying</option>
                    <option value="Working">Working</option>
                  </select>
                ) : (
                  <p>{userData.status}</p>
                )}
              </div>

              {/* Qualification */}
              <div className="detail-item">
                <label><FaGraduationCap /> Qualification</label>
                {isEditing ? (
                  <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} />
                ) : (
                  <p>{userData.qualification}</p>
                )}
              </div>

              {/* Profession - conditional in logic, but let's show if exists or editing */}
              {(isEditing && formData.status === 'Working') || userData.profession ? (
                <div className="detail-item">
                  <label><FaBriefcase /> Profession</label>
                  {isEditing ? (
                    <input type="text" name="profession" value={formData.profession} onChange={handleChange} />
                  ) : (
                    <p>{userData.profession || '-'}</p>
                  )}
                </div>
              ) : null}

              {/* Workplace */}
              {(isEditing && formData.status === 'Working') || userData.workplace ? (
                <div className="detail-item">
                  <label><FaBriefcase /> Workplace</label>
                  {isEditing ? (
                    <input type="text" name="workplace" value={formData.workplace} onChange={handleChange} />
                  ) : (
                    <p>{userData.workplace || '-'}</p>
                  )}
                </div>
              ) : null}

            </div>
          </div>

          <div className="logout-section">
            <button className="logout-btn-large" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipCard;
