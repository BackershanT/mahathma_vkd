import React, { useEffect, useState, useContext } from 'react';
import { db } from '../Firebase/Firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaImages, FaSignOutAlt, FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../AuthContext/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('members');
  
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
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingCarousel, setEditingCarousel] = useState(null);

  useEffect(() => {
    fetchMembers();
    fetchEvents();
    fetchCarousel();
  }, []);

  const fetchMembers = async () => {
    try {
      const membersSnapshot = await getDocs(collection(db, 'users'));
      const membersData = [];
      let maleCount = 0;
      let femaleCount = 0;
      let bloodDonorCount = 0;

      membersSnapshot.forEach((docSnapshot) => {
        const data = { id: docSnapshot.id, ...docSnapshot.data() };
        membersData.push(data);
        if (data.gender?.toLowerCase() === 'male') maleCount++;
        if (data.gender?.toLowerCase() === 'female') femaleCount++;
        if (data.isBloodDonor) bloodDonorCount++;
      });

      setMembers(membersData);
      setStats({
        total: membersData.length,
        male: maleCount,
        female: femaleCount,
        bloodDonors: bloodDonorCount,
      });
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const eventsSnapshot = await getDocs(query(collection(db, 'events'), orderBy('date', 'desc')));
      const eventsData = [];
      eventsSnapshot.forEach((docSnapshot) => {
        eventsData.push({ id: docSnapshot.id, ...docSnapshot.data() });
      });
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchCarousel = async () => {
    try {
      const carouselSnapshot = await getDocs(collection(db, 'carousel'));
      const carouselData = [];
      carouselSnapshot.forEach((docSnapshot) => {
        carouselData.push({ id: docSnapshot.id, ...docSnapshot.data() });
      });
      setCarouselItems(carouselData.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      console.error('Error fetching carousel:', error);
    }
  };

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
        fetchEvents();
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
        fetchCarousel();
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
            onDelete={handleDeleteCarousel}
            onClose={() => {
              setIsCarouselModalOpen(false);
              setEditingCarousel(null);
            }}
            onSave={fetchCarousel}
          />
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

const EventsTab = ({ events, onAdd, onEdit, onDelete, onSave }) => {
  return (
    <div className="events-tab">
      <div className="section-header">
        <h2>Events Management</h2>
        <button className="add-btn" onClick={onAdd}>
          <FaPlus /> Add Event
        </button>
      </div>

      <div className="events-grid">
        {events.map((event) => (
          <div key={event.id} className="event-card-admin">
            <img src={event.image || event.imageUrl || 'https://via.placeholder.com/400x250'} alt={event.title} />
            <div className="event-card-content">
              <h3>{event.title}</h3>
              <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
              {event.time && <p><strong>Time:</strong> {event.time}</p>}
              <p><strong>Description:</strong> {event.description?.substring(0, 100)}...</p>
              <div className="event-actions">
                <button className="edit-btn" onClick={() => onEdit(event)}>
                  <FaEdit /> Edit
                </button>
                <button className="delete-btn" onClick={() => onDelete(event.id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CarouselTab = ({ carouselItems, onAdd, onEdit, onDelete, onSave }) => {
  return (
    <div className="carousel-tab">
      <div className="section-header">
        <h2>Carousel Management</h2>
        <button className="add-btn" onClick={onAdd}>
          <FaPlus /> Add Carousel Item
        </button>
      </div>

      <div className="carousel-grid">
        {carouselItems.map((item) => (
          <div key={item.id} className="carousel-card">
            <img src={item.imageUrl} alt={item.title || 'Carousel'} />
            <div className="carousel-card-content">
              <h3>{item.title || 'Untitled'}</h3>
              {item.description && <p>{item.description.substring(0, 100)}...</p>}
              <div className="carousel-actions">
                <button className="edit-btn" onClick={() => onEdit(item)}>
                  <FaEdit /> Edit
                </button>
                <button className="delete-btn" onClick={() => onDelete(item.id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
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
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        date: event.date || '',
        time: event.time || '',
        description: event.description || '',
        image: event.image || event.imageUrl || '',
        location: event.location || '',
      });
    }
  }, [event]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (event) {
        await updateDoc(doc(db, 'events', event.id), formData);
        alert('Event updated successfully!');
      } else {
        await addDoc(collection(db, 'events'), formData);
        alert('Event added successfully!');
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event');
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
            <label>Image URL</label>
            <input type="url" name="image" value={formData.image} onChange={handleChange} required />
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {event ? 'Update' : 'Add'} Event
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
    title: '',
    description: '',
    order: 0,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        imageUrl: item.imageUrl || '',
        title: item.title || '',
        description: item.description || '',
        order: item.order || 0,
      });
    }
  }, [item]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (item) {
        await updateDoc(doc(db, 'carousel', item.id), formData);
        alert('Carousel item updated successfully!');
      } else {
        await addDoc(collection(db, 'carousel'), formData);
        alert('Carousel item added successfully!');
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving carousel item:', error);
      alert('Error saving carousel item');
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
            <label>Image URL</label>
            <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required />
          </div>
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
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {item ? 'Update' : 'Add'} Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
