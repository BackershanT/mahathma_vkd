import React, { useEffect, useState, useContext } from 'react';
import { db, storage } from '../Firebase/Firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaImages, FaSignOutAlt, FaEdit, FaTrash, FaPlus, FaTimes, FaEye, FaPlay, FaTint, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { AuthContext } from '../AuthContext/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('members');
  const [bloodDonors, setBloodDonors] = useState([]);

  // Check if user is admin
  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [carouselItems, setCarouselItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, male: 0, female: 0, bloodDonors: 0 });
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false);
  const [isEventDetailModalOpen, setIsEventDetailModalOpen] = useState(false);
  const [isCarouselPreviewOpen, setIsCarouselPreviewOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingCarousel, setEditingCarousel] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [viewingCarousel, setViewingCarousel] = useState(null);

  useEffect(() => {
    // Prevent unprivileged access attempts
    if (!currentUser || !currentUser.isAdmin) {
      return;
    }

    // Real-time listener for Members (users)
    const unsubscribeMembers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const membersData = [];
      let maleCount = 0;
      let femaleCount = 0;

      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        membersData.push(data);
        if (data.gender?.toLowerCase() === 'male') maleCount++;
        if (data.gender?.toLowerCase() === 'female') femaleCount++;
      });

      setMembers(membersData);
      setStats(prev => ({
        ...prev,
        total: membersData.length,
        male: maleCount,
        female: femaleCount,
      }));
    }, (error) => {
      // Ignore permission errors caused by race conditions during redirect
      if (error.code !== 'permission-denied') {
        console.error("Error fetching members:", error);
      }
    });

    // Real-time listener for Blood Donors
    const unsubscribeDonors = onSnapshot(collection(db, 'blood_donors'), (snapshot) => {
      const donorsData = [];
      snapshot.forEach((doc) => {
        donorsData.push({ id: doc.id, ...doc.data() });
      });
      setBloodDonors(donorsData);
      setStats(prev => ({ ...prev, bloodDonors: donorsData.length }));
    }, (error) => {
      if (error.code !== 'permission-denied') {
        console.error("Error fetching donors:", error);
      }
    });

    // Real-time listener for Events
    const unsubscribeEvents = onSnapshot(query(collection(db, 'events'), orderBy('date', 'desc')), (snapshot) => {
      const gEventsData = [];
      snapshot.forEach((doc) => {
        gEventsData.push({ id: doc.id, ...doc.data() });
      });
      // Handle dummy data logic if empty
      if (gEventsData.length === 0 && !snapshot.metadata.fromCache) {
        // Logic for dummy events could go here, but for now we just set empty
        // To keep it simple in real-time mode, we usually don't auto-insert dummy data inside the listener loop
        // unless strict "init" logic is separated.
        setEvents([]);
      } else {
        setEvents(gEventsData);
      }
    }, (error) => {
      if (error.code !== 'permission-denied') {
        console.error("Error fetching events:", error);
      }
    });

    // Real-time listener for Carousel
    const unsubscribeCarousel = onSnapshot(collection(db, 'carousel'), (snapshot) => {
      const carouselData = [];
      snapshot.forEach((doc) => {
        carouselData.push({ id: doc.id, ...doc.data() });
      });
      setCarouselItems(carouselData.sort((a, b) => (a.order || 0) - (b.order || 0)));
    }, (error) => {
      if (error.code !== 'permission-denied') {
        console.error("Error fetching carousel:", error);
      }
    });

    return () => {
      unsubscribeMembers();
      unsubscribeDonors();
      unsubscribeEvents();
      unsubscribeCarousel();
    };
  }, [currentUser]); // added currentUser dependency

  // Removed manual fetch functions as they are replaced by subscriptions
  const fetchEvents = () => { }; // No-op for compatibility with child components calling onSave
  const fetchCarousel = () => { }; // No-op for compatibility

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate('/login');
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'events', eventId));
        await deleteDoc(doc(db, 'events', eventId));
        // fetchEvents(); // Handled by listener
        alert('Event deleted successfully!');
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event');
      }
    }
  };

  const handleDeleteCarousel = async (carouselId) => {
    if (window.confirm('Are you sure you want to delete this carousel item?')) {
      try {
        await deleteDoc(doc(db, 'carousel', carouselId));
        await deleteDoc(doc(db, 'carousel', carouselId));
        // fetchCarousel(); // Handled by listener
        alert('Carousel item deleted successfully!');
      } catch (error) {
        console.error('Error deleting carousel item:', error);
        alert('Error deleting carousel item');
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <FaUsers /> Members
        </button>
        <button
          className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <FaCalendarAlt /> Events
        </button>
        <button
          className={`tab-btn ${activeTab === 'carousel' ? 'active' : ''}`}
          onClick={() => setActiveTab('carousel')}
        >
          <FaImages /> Carousel
        </button>
        <button
          className={`tab-btn ${activeTab === 'bloodDonors' ? 'active' : ''}`}
          onClick={() => setActiveTab('bloodDonors')}
        >
          <FaTint /> Blood Donors
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'members' && (
          <MembersTab members={members} stats={stats} />
        )}

        {activeTab === 'events' && (
          <EventsTab
            events={events}
            onAdd={() => {
              setEditingEvent(null);
              setIsEventModalOpen(true);
            }}
            onEdit={(event) => {
              setEditingEvent(event);
              setIsEventModalOpen(true);
            }}
            onView={(event) => {
              setViewingEvent(event);
              setIsEventDetailModalOpen(true);
            }}
            onDelete={handleDeleteEvent}
            onClose={() => {
              setIsEventModalOpen(false);
              setEditingEvent(null);
            }}
            onSave={fetchEvents}
          />
        )}

        {activeTab === 'carousel' && (
          <CarouselTab
            carouselItems={carouselItems}
            onAdd={() => {
              setEditingCarousel(null);
              setIsCarouselModalOpen(true);
            }}
            onEdit={(item) => {
              setEditingCarousel(item);
              setIsCarouselModalOpen(true);
            }}
            onView={(item) => {
              setViewingCarousel(item);
              setIsCarouselPreviewOpen(true);
            }}
            onDelete={handleDeleteCarousel}
            onClose={() => {
              setIsCarouselModalOpen(false);
              setEditingCarousel(null);
            }}
            onSave={fetchCarousel}
          />
        )}

        {activeTab === 'bloodDonors' && (
          <BloodDonorsTab bloodDonors={bloodDonors} />
        )}
      </div>

      {isEventModalOpen && (
        <EventModal
          event={editingEvent}
          onClose={() => {
            setIsEventModalOpen(false);
            setEditingEvent(null);
          }}
          onSave={fetchEvents}
        />
      )}

      {isCarouselModalOpen && (
        <CarouselModal
          item={editingCarousel}
          onClose={() => {
            setIsCarouselModalOpen(false);
            setEditingCarousel(null);
          }}
          onSave={fetchCarousel}
        />
      )}

      {isEventDetailModalOpen && (
        <EventDetailModal
          event={viewingEvent}
          onClose={() => {
            setIsEventDetailModalOpen(false);
            setViewingEvent(null);
          }}
          onEdit={(event) => {
            setViewingEvent(null);
            setIsEventDetailModalOpen(false);
            setEditingEvent(event);
            setIsEventModalOpen(true);
          }}
        />
      )}

      {isCarouselPreviewOpen && (
        <CarouselPreviewModal
          item={viewingCarousel}
          onClose={() => {
            setIsCarouselPreviewOpen(false);
            setViewingCarousel(null);
          }}
          onEdit={(item) => {
            setViewingCarousel(null);
            setIsCarouselPreviewOpen(false);
            setEditingCarousel(item);
            setIsCarouselModalOpen(true);
          }}
        />
      )}
    </div>
  );
};

const MembersTab = ({ members, stats }) => {
  const [selectedMember, setSelectedMember] = useState(null);

  return (
    <div className="members-tab">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Members</h3>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Male</h3>
          <p className="stat-value">{stats.male}</p>
        </div>
        <div className="stat-card">
          <h3>Female</h3>
          <p className="stat-value">{stats.female}</p>
        </div>
        <div className="stat-card">
          <h3>Blood Donors</h3>
          <p className="stat-value">{stats.bloodDonors}</p>
        </div>
      </div>

      <div className="members-container">
        <div className="members-list">
          <h2>Members List</h2>
          {members.map((member) => (
            <div
              key={member.id}
              className={`member-item ${selectedMember?.id === member.id ? 'selected' : ''}`}
              onClick={() => setSelectedMember(member)}
            >
              <div className="member-avatar">
                {member.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="member-info">
                <h4>{member.name} {member.lastName}</h4>
                <p>{member.email}</p>
                <p>{member.mobile}</p>
              </div>
            </div>
          ))}
        </div>

        {selectedMember && (
          <div className="member-details">
            <h2>Member Details</h2>
            <div className="detail-section">
              <h3>Personal Information</h3>
              <p><strong>Name:</strong> {selectedMember.name} {selectedMember.lastName}</p>
              <p><strong>Email:</strong> {selectedMember.email}</p>
              <p><strong>Mobile:</strong> {selectedMember.mobile}</p>
              <p><strong>Address:</strong> {selectedMember.address}</p>
              <p><strong>Date of Birth:</strong> {selectedMember.dob}</p>
              <p><strong>Gender:</strong> {selectedMember.gender}</p>
              <p><strong>Blood Group:</strong> {selectedMember.bloodGroup}</p>
              <p><strong>Father's Name:</strong> {selectedMember.fatherName}</p>
            </div>
            <div className="detail-section">
              <h3>Education & Profession</h3>
              <p><strong>Qualification:</strong> {selectedMember.qualification}</p>
              <p><strong>Status:</strong> {selectedMember.status}</p>
              {selectedMember.profession && (
                <p><strong>Profession:</strong> {selectedMember.profession}</p>
              )}
              {selectedMember.workplace && (
                <p><strong>Workplace:</strong> {selectedMember.workplace}</p>
              )}
              <p><strong>Availability:</strong> {selectedMember.availability}</p>
            </div>
            <div className="detail-section">
              <h3>Additional Info</h3>
              <p><strong>Blood Donor:</strong> {selectedMember.isBloodDonor ? 'Yes' : 'No'}</p>
              <p><strong>Member Since:</strong> {new Date(selectedMember.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EventsTab = ({ events, onAdd, onEdit, onView, onDelete, onSave }) => {
  return (
    <div className="events-tab">
      <div className="section-header">
        <h2>Events Management</h2>
        <button className="add-btn" onClick={onAdd}>
          <FaPlus /> Add Event
        </button>
      </div>

      <div className="events-grid">
        {events.length > 0 ? (
          events.map((event) => {
            const eventDate = new Date(event.date);
            const isPast = eventDate < new Date();
            const eventType = isPast ? 'past' : 'upcoming';

            return (
              <div key={event.id} className="event-card-admin">
                <img src={event.image || event.imageUrl || 'https://via.placeholder.com/400x250'} alt={event.title} />
                <div className="event-card-content">
                  <div className="event-type-badge">
                    <span className={`type-badge ${eventType}`}>
                      {eventType === 'upcoming' ? 'Upcoming' : 'Past'}
                    </span>
                  </div>
                  <h3>{event.title}</h3>
                  <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                  {event.time && <p><strong>Time:</strong> {event.time}</p>}
                  {event.location && <p><strong>Location:</strong> {event.location}</p>}
                  <p><strong>Description:</strong> {event.description?.substring(0, 100)}...</p>
                  <div className="event-actions">
                    <button className="view-btn" onClick={() => onView(event)}>
                      <FaEye /> View
                    </button>
                    <button className="edit-btn" onClick={() => onEdit(event)}>
                      <FaEdit /> Edit
                    </button>
                    <button className="delete-btn" onClick={() => onDelete(event.id)}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-events-message">
            <p>No events found. Click "Add Event" to create your first event.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CarouselTab = ({ carouselItems, onAdd, onEdit, onView, onDelete, onSave }) => {
  return (
    <div className="carousel-tab">
      <div className="section-header">
        <h2>Carousel Management</h2>
        <button className="add-btn" onClick={onAdd}>
          <FaPlus /> Add Carousel Item
        </button>
      </div>

      <div className="carousel-grid">
        {carouselItems.length > 0 ? (
          carouselItems.map((item) => {
            const isVideo = item.mediaType === 'video' || item.videoUrl;
            const mediaUrl = isVideo ? (item.videoUrl || item.imageUrl) : item.imageUrl;

            return (
              <div key={item.id} className="carousel-card">
                <div className="carousel-media-container">
                  {isVideo ? (
                    <video src={mediaUrl} alt={item.title || 'Carousel'} muted>
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img src={mediaUrl} alt={item.title || 'Carousel'} />
                  )}
                  <div className="media-type-badge">
                    {isVideo ? <FaPlay /> : <FaImages />}
                    <span>{isVideo ? 'Video' : 'Image'}</span>
                  </div>
                </div>
                <div className="carousel-card-content">
                  <h3>{item.title || 'Untitled'}</h3>
                  {item.description && <p>{item.description.substring(0, 100)}...</p>}
                  <p className="order-info">Order: {item.order || 0}</p>
                  <div className="carousel-actions">
                    <button className="view-btn" onClick={() => onView(item)}>
                      <FaEye /> Preview
                    </button>
                    <button className="edit-btn" onClick={() => onEdit(item)}>
                      <FaEdit /> Edit
                    </button>
                    <button className="delete-btn" onClick={() => onDelete(item.id)}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-carousel-message">
            <p>No carousel items found. Click "Add Carousel Item" to create your first item.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const EventModal = ({ event, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    image: '',
    location: '',
    eventType: 'upcoming',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (event) {
      const eventDate = new Date(event.date);
      const isPast = eventDate < new Date();
      setFormData({
        title: event.title || '',
        date: event.date || '',
        time: event.time || '',
        description: event.description || '',
        image: event.image || event.imageUrl || '',
        location: event.location || '',
        eventType: isPast ? 'past' : 'upcoming',
      });
      setImagePreview(event.image || event.imageUrl || '');
    }
  }, [event]);

  const handleChange = (e) => {
    if (e.target.name === 'imageFile') {
      const file = e.target.files[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else if (e.target.name === 'date') {
      // Auto-update event type when date changes
      const newDate = e.target.value;
      const eventDate = new Date(newDate);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);
      const isPast = eventDate < currentDate;
      setFormData({
        ...formData,
        date: newDate,
        eventType: isPast ? 'past' : 'upcoming'
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Helper to add timeout to promises
  const timeoutPromise = (ms, promise) => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Operation timed out: Check your internet connection or firebasestorage rules."));
      }, ms);
      promise.then(
        (res) => {
          clearTimeout(timeoutId);
          resolve(res);
        },
        (err) => {
          clearTimeout(timeoutId);
          reject(err);
        }
      );
    });
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    try {
      setStatusMessage('Uploading image (starting)...');
      console.log('Starting event image upload...');

      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const imageRef = ref(storage, `events/${Date.now()}_${cleanFileName}`);

      console.log('Ref created, starting uploadBytes...');
      setStatusMessage('Uploading image (sending bytes)...');

      // 30s timeout for image upload
      const snapshot = await timeoutPromise(30000, uploadBytes(imageRef, file));

      console.log('Upload complete, getting URL...');
      setStatusMessage('Uploading image (getting URL)...');

      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setStatusMessage('Saving...');

    try {
      let imageUrl = formData.image;

      // Upload image if file is selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      setStatusMessage('Updating database...');

      // Determine event type based on date (automatically categorize)
      // Format date as YYYY-MM-DD for consistency
      const dateStr = formData.date;
      const eventDate = new Date(dateStr + 'T00:00:00');
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const isPast = eventDate < currentDate;
      const autoEventType = isPast ? 'past' : 'upcoming';

      const eventData = {
        title: formData.title,
        date: dateStr, // Store as YYYY-MM-DD format
        time: formData.time || '',
        description: formData.description,
        image: imageUrl,
        location: formData.location || '',
        eventType: autoEventType, // Auto-determined based on date
        createdAt: event ? event.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (event) {
        await updateDoc(doc(db, 'events', event.id), eventData);
        alert('Event updated successfully!');
      } else {
        await addDoc(collection(db, 'events'), eventData);
        alert('Event added successfully!');
      }
      onSave();
      onClose();
      // Reset form
      setImageFile(null);
      setImagePreview('');
      setStatusMessage('');
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event: ' + error.message);
    } finally {
      setIsUploading(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'Add Event'}</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input type="time" name="time" value={formData.time} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required />
          </div>
          <div className="form-group">
            <label>Event Type (Auto-determined by date)</label>
            <select name="eventType" value={formData.eventType} onChange={handleChange} disabled>
              <option value="upcoming">Upcoming Event</option>
              <option value="past">Past Event</option>
            </select>
            <small style={{ display: 'block', marginTop: '0.25rem', color: '#64748b' }}>
              Event type will be automatically set based on the selected date
            </small>
          </div>
          <div className="form-group">
            <label>Event Image</label>
            <input
              type="file"
              name="imageFile"
              accept="image/*"
              onChange={handleChange}
              style={{ marginBottom: '0.5rem' }}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
              </div>
            )}
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="Or enter image URL"
              style={{ marginTop: '0.5rem' }}
            />
            <small style={{ display: 'block', marginTop: '0.25rem', color: '#64748b' }}>
              Upload an image file or provide an image URL
            </small>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={isUploading}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={isUploading}>
              {isUploading ? (statusMessage || 'Saving...') : (event ? 'Update' : 'Add') + ' Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CarouselModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    imageUrl: '',
    videoUrl: '',
    mediaType: 'image',
    title: '',
    description: '',
    order: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (item) {
      const isVideo = item.mediaType === 'video' || item.videoUrl;
      setFormData({
        imageUrl: item.imageUrl || '',
        videoUrl: item.videoUrl || '',
        mediaType: isVideo ? 'video' : 'image',
        title: item.title || '',
        description: item.description || '',
        order: item.order || 0,
      });
      if (isVideo && item.videoUrl) {
        setVideoPreview(item.videoUrl);
      } else if (item.imageUrl) {
        setImagePreview(item.imageUrl);
      }
    }
  }, [item]);

  const handleChange = (e) => {
    if (e.target.name === 'imageFile') {
      const file = e.target.files[0];
      if (file) {
        setImageFile(file);
        setFormData({ ...formData, mediaType: 'image' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else if (e.target.name === 'videoFile') {
      const file = e.target.files[0];
      if (file) {
        setVideoFile(file);
        setFormData({ ...formData, mediaType: 'video' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setVideoPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else if (e.target.name === 'mediaType') {
      setFormData({ ...formData, mediaType: e.target.value });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Helper to add timeout to promises
  const timeoutPromise = (ms, promise) => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Operation timed out: Check your internet connection or firebasestorage rules."));
      }, ms);
      promise.then(
        (res) => {
          clearTimeout(timeoutId);
          resolve(res);
        },
        (err) => {
          clearTimeout(timeoutId);
          reject(err);
        }
      );
    });
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    try {
      setStatusMessage('Uploading image (starting)...');
      console.log('Starting image upload checking storage ref...');

      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const imageRef = ref(storage, `carousel/images/${Date.now()}_${cleanFileName}`);

      console.log('Ref created, starting uploadBytes...');
      setStatusMessage('Uploading image (sending bytes)...');

      // 30 second timeout for upload
      const snapshot = await timeoutPromise(30000, uploadBytes(imageRef, file));

      console.log('Upload complete, getting URL...');
      setStatusMessage('Uploading image (getting URL)...');

      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('URL retrieved:', downloadURL);

      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  };

  const uploadVideo = async (file) => {
    if (!file) return null;
    try {
      setStatusMessage('Uploading video (starting)...');
      console.log('Starting video upload...');

      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const videoRef = ref(storage, `carousel/videos/${Date.now()}_${cleanFileName}`);

      console.log('Ref created, starting uploadBytes...');
      setStatusMessage('Uploading video (sending bytes)...');

      // 60 second timeout for video upload
      const snapshot = await timeoutPromise(60000, uploadBytes(videoRef, file));

      console.log('Upload complete, getting URL...');
      setStatusMessage('Uploading video (getting URL)...');

      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw new Error(`Video upload failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setStatusMessage('Saving...');

    try {
      let imageUrl = formData.imageUrl;
      let videoUrl = formData.videoUrl;

      // Upload image if file is selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Upload video if file is selected
      if (videoFile) {
        videoUrl = await uploadVideo(videoFile);
      }

      setStatusMessage('Updating database...');

      const carouselData = {
        title: formData.title || '',
        description: formData.description || '',
        order: Number(formData.order) || 0,
        mediaType: formData.mediaType,
        imageUrl: formData.mediaType === 'image' ? imageUrl : (imageUrl || ''),
        videoUrl: formData.mediaType === 'video' ? videoUrl : (videoUrl || ''),
        createdAt: item ? item.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (item) {
        await updateDoc(doc(db, 'carousel', item.id), carouselData);
        alert('Carousel item updated successfully!');
      } else {
        await addDoc(collection(db, 'carousel'), carouselData);
        alert('Carousel item added successfully!');
      }
      onSave();
      onClose();
      // Reset form
      setImageFile(null);
      setVideoFile(null);
      setImagePreview('');
      setVideoPreview('');
      setStatusMessage('');
    } catch (error) {
      console.error('Error saving carousel item:', error);
      alert('Error saving carousel item: ' + error.message);
    } finally {
      setIsUploading(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item ? 'Edit Carousel Item' : 'Add Carousel Item'}</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Media Type</label>
            <select name="mediaType" value={formData.mediaType} onChange={handleChange} required>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          {formData.mediaType === 'image' ? (
            <div className="form-group">
              <label>Image</label>
              <input
                type="file"
                name="imageFile"
                accept="image/*"
                onChange={handleChange}
                style={{ marginBottom: '0.5rem' }}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                </div>
              )}
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="Or enter image URL"
                style={{ marginTop: '0.5rem' }}
              />
              <small style={{ display: 'block', marginTop: '0.25rem', color: '#64748b' }}>
                Upload an image file or provide an image URL
              </small>
            </div>
          ) : (
            <div className="form-group">
              <label>Video</label>
              <input
                type="file"
                name="videoFile"
                accept="video/*"
                onChange={handleChange}
                style={{ marginBottom: '0.5rem' }}
              />
              {videoPreview && (
                <div className="video-preview">
                  <video src={videoPreview} controls style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}>
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="Or enter video URL"
                style={{ marginTop: '0.5rem' }}
              />
              <small style={{ display: 'block', marginTop: '0.25rem', color: '#64748b' }}>
                Upload a video file or provide a video URL
              </small>
            </div>
          )}

          <div className="form-group">
            <label>Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" />
          </div>
          <div className="form-group">
            <label>Order (Display order)</label>
            <input type="number" name="order" value={formData.order} onChange={handleChange} min="0" />
            <small style={{ display: 'block', marginTop: '0.25rem', color: '#64748b' }}>
              Lower numbers appear first
            </small>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={isUploading}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={isUploading}>
              {isUploading ? (statusMessage || 'Saving...') : (item ? 'Update' : 'Add') + ' Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EventDetailModal = ({ event, onClose, onEdit }) => {
  if (!event) return null;

  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const eventType = isPast ? 'past' : 'upcoming';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content event-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Event Details</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="event-detail-content">
          <div className="event-detail-image">
            <img src={event.image || event.imageUrl || 'https://via.placeholder.com/600x400'} alt={event.title} />
            <div className="event-type-badge-large">
              <span className={`type-badge ${eventType}`}>
                {eventType === 'upcoming' ? 'Upcoming Event' : 'Past Event'}
              </span>
            </div>
          </div>
          <div className="event-detail-info">
            <h3>{event.title}</h3>
            <div className="detail-row">
              <strong>Date:</strong>
              <span>{new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            {event.time && (
              <div className="detail-row">
                <strong>Time:</strong>
                <span>{event.time}</span>
              </div>
            )}
            {event.location && (
              <div className="detail-row">
                <strong>Location:</strong>
                <span>{event.location}</span>
              </div>
            )}
            <div className="detail-row description-row">
              <strong>Description:</strong>
              <p>{event.description}</p>
            </div>
            {event.createdAt && (
              <div className="detail-row">
                <strong>Created:</strong>
                <span>{new Date(event.createdAt).toLocaleDateString()}</span>
              </div>
            )}
            {event.updatedAt && (
              <div className="detail-row">
                <strong>Last Updated:</strong>
                <span>{new Date(event.updatedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Close
            </button>
            <button type="button" className="save-btn" onClick={() => onEdit(event)}>
              <FaEdit /> Edit Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CarouselPreviewModal = ({ item, onClose, onEdit }) => {
  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content carousel-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Carousel Preview</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="carousel-preview-content">
          <div className="preview-media">
            {item.mediaType === 'video' ? (
              <video
                src={item.videoUrl || item.imageUrl}
                controls
                autoPlay
                style={{ width: '100%', maxHeight: '500px', borderRadius: '12px' }}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={item.imageUrl}
                alt={item.title || 'Carousel'}
                style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '12px' }}
              />
            )}
            {item.mediaType === 'video' && (
              <div className="media-type-indicator">
                <span>Video Content</span>
              </div>
            )}
          </div>
          <div className="preview-info">
            <h3>{item.title || 'Untitled'}</h3>
            {item.description && (
              <p className="preview-description">{item.description}</p>
            )}
            <div className="preview-meta">
              <div className="meta-item">
                <strong>Type:</strong> {item.mediaType === 'video' ? 'Video' : 'Image'}
              </div>
              <div className="meta-item">
                <strong>Display Order:</strong> {item.order || 0}
              </div>
              {item.createdAt && (
                <div className="meta-item">
                  <strong>Created:</strong> {new Date(item.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Close
            </button>
            <button type="button" className="save-btn" onClick={() => onEdit(item)}>
              <FaEdit /> Edit Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BloodDonorsTab = ({ bloodDonors }) => {
  // Group donors by blood group
  const groupedDonors = bloodDonors.reduce((acc, donor) => {
    const bg = donor.bloodGroup || 'Unknown';
    if (!acc[bg]) {
      acc[bg] = [];
    }
    acc[bg].push(donor);
    return acc;
  }, {});

  // Sort blood groups
  const bloodGroups = Object.keys(groupedDonors).sort();

  const downloadPDF = () => {
    // Dynamic import for jsPDF
    import('jspdf').then((jsPDFModule) => {
      import('jspdf-autotable').then((autoTable) => {
        const jsPDF = jsPDFModule.default;
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text('Blood Donors List - Mahathma Veliyancode', 14, 20);
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        let yPosition = 40;

        bloodGroups.forEach((bg) => {
          const donors = groupedDonors[bg];

          // Blood Group Header
          doc.setFontSize(14);
          doc.setTextColor(220, 38, 38);
          doc.text(`Blood Group: ${bg} (${donors.length} donors)`, 14, yPosition);
          yPosition += 10;

          // Table data
          const tableData = donors.map((donor, index) => [
            index + 1,
            `${donor.name || ''} ${donor.lastName || ''}`.trim(),
            donor.phone || donor.mobile || 'N/A',
            donor.email || 'N/A',
            donor.place || donor.address || 'N/A',
            donor.gender || 'N/A',
            donor.dob ? new Date(donor.dob).toLocaleDateString() : 'N/A'
          ]);

          autoTable.default(doc, {
            head: [['#', 'Name', 'Mobile', 'Email', 'Address', 'Gender', 'Date of Birth']],
            body: tableData,
            startY: yPosition,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [220, 38, 38], textColor: 255 },
            margin: { top: yPosition },
          });

          yPosition = doc.lastAutoTable.finalY + 15;

          // Add new page if needed
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
        });

        doc.save('blood-donors-list.pdf');
      });
    });
  };

  const downloadExcel = () => {
    // Dynamic import for xlsx
    import('xlsx').then((XLSX) => {
      const workbook = XLSX.utils.book_new();

      // Create a sheet for each blood group
      bloodGroups.forEach((bg) => {
        const donors = groupedDonors[bg];
        const excelData = [
          ['#', 'Name', 'Mobile', 'Email', 'Address', 'Gender', 'Date of Birth', 'Blood Group']
        ];

        donors.forEach((donor, index) => {
          excelData.push([
            index + 1,
            `${donor.name || ''} ${donor.lastName || ''}`.trim(),
            donor.phone || donor.mobile || 'N/A',
            donor.email || 'N/A',
            donor.place || donor.address || 'N/A',
            donor.gender || 'N/A',
            donor.dob ? new Date(donor.dob).toLocaleDateString() : 'N/A',
            donor.bloodGroup || 'N/A'
          ]);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(excelData);
        XLSX.utils.book_append_sheet(workbook, worksheet, `Blood Group ${bg}`);
      });

      // Create summary sheet
      const summaryData = [
        ['Blood Group', 'Number of Donors']
      ];
      bloodGroups.forEach((bg) => {
        summaryData.push([bg, groupedDonors[bg].length]);
      });
      summaryData.push(['Total', bloodDonors.length]);

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      XLSX.writeFile(workbook, 'blood-donors-list.xlsx');
    });
  };

  const getBloodGroupColor = (bg) => {
    const colors = {
      'A+': '#dc2626',
      'A-': '#ea580c',
      'B+': '#ca8a04',
      'B-': '#16a34a',
      'AB+': '#0891b2',
      'AB-': '#7c3aed',
      'O+': '#be185d',
      'O-': '#2563eb',
      'Unknown': '#64748b'
    };
    return colors[bg] || colors['Unknown'];
  };

  return (
    <div className="blood-donors-tab">
      <div className="section-header">
        <h2>Blood Donors Management</h2>
        <div className="download-buttons">
          <button className="download-btn pdf-btn" onClick={downloadPDF}>
            <FaFilePdf /> Download PDF
          </button>
          <button className="download-btn excel-btn" onClick={downloadExcel}>
            <FaFileExcel /> Download Excel
          </button>
        </div>
      </div>

      {bloodDonors.length === 0 ? (
        <div className="no-donors-message">
          <p>No blood donors registered yet.</p>
        </div>
      ) : (
        <div className="blood-donors-container">
          {bloodGroups.map((bg) => {
            const donors = groupedDonors[bg];
            return (
              <div key={bg} className="blood-group-section">
                <div className="blood-group-header">
                  <div className="blood-group-badge">
                    <span className="blood-group-text">{bg}</span>
                    <span className="donor-count">{donors.length} {donors.length === 1 ? 'Donor' : 'Donors'}</span>
                  </div>
                </div>
                <div className="donors-grid">
                  {donors.map((donor) => (
                    <div key={donor.id} className="donor-card">
                      <div className="donor-avatar" style={{ backgroundColor: getBloodGroupColor(bg) }}>
                        {donor.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="donor-info">
                        <h4>{donor.name} {donor.lastName || ''}</h4>
                        <p className="donor-mobile">
                          <strong>Mobile:</strong> {donor.phone || donor.mobile || 'N/A'}
                        </p>
                        <p className="donor-email">
                          <strong>Email:</strong> {donor.email || 'N/A'}
                        </p>
                        <p className="donor-address">
                          <strong>Address:</strong> {donor.place || donor.address || 'N/A'}
                        </p>
                        {donor.gender && (
                          <p className="donor-gender">
                            <strong>Gender:</strong> {donor.gender}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
