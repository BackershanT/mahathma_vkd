import React, { useEffect, useState } from 'react';
import {db}from '../Firebase/Firebase';
import { collection, getDocs,addDoc } from 'firebase/firestore';
import "./Dashboard.css";



const MemberCard = ({ user }) => (
    <div className="member-card">
      <div className="member-icon">{user.name? user.name.charAt(0).toUpperCase():"A"}</div>
      <div>
        <div className="member-name">Name: {user.name}</div>
        <div className="member-gender">Gender: {user.gender}</div>
        <div className="member-mobile">Mobile: {user.mobile}</div>
        <div className="member-blood">Blood: {user.bloodGroup}</div>
      </div>
    </div>
  );
  
  const InfoBox = ({ title, value }) => (
    <div className="info-box">
      <div className="info-title">{title}</div>
      <div className="info-value">{value}</div>
    </div>
  );
  
  const BloodGroupCard = ({ name, mobile }) => (
    <div className="blood-card">
      <div className="blood-icon">{name ?name.charAt(0).toUpperCase():"A"}</div>
      <div>
        <div className="blood-name">name:{name}</div>
        <div className="blood-mobile">mobile:{mobile}</div>
      </div>
    </div>
  );

  const EventCard =({event})=>(
    <div className="event-card">
    <img src={event.imageUrl} alt={event.title} />
    <h3>{event.title}</h3>
    <p>{event.date}</p>
    <span>{event.time}</span>
    <p>{event.description}</p>
  </div>
);
const EventModal = ({ isOpen, onClose, onAddEvent }) => {
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    description: '',
    image: '',
    time: '',
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newEvent.title || !newEvent.date || !newEvent.description || !newEvent.image || !newEvent.time) {
      alert('Please fill out all fields');
      return;
    }

    try {
      await addDoc(collection(db, 'events'), {
        ...newEvent,
        status: 'upcoming',
      });

      alert('Event added successfully!');
      onAddEvent(newEvent); // Pass the event back to the parent to update UI
      onClose(); // Close the modal after adding event
    } catch (error) {
      console.error('Error adding event: ', error);
    }
  };

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Add Event</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={newEvent.title}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="date"
            placeholder="Event Date"
            value={newEvent.date}
            onChange={handleChange}
            required
          />
          <input
            type="time"
            name="time"
            placeholder="Event Time"
            value={newEvent.time}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Event Description"
            value={newEvent.description}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={newEvent.image}
            onChange={handleChange}
            required
          />
          <button type="submit">Add Event</button>
        </form>
      </div>
    </div>
  );
};

  
  export default function AdminDash() {
    const [members, setMembers] = useState([]);
    const [stats, setStats] = useState({ male: 0, female: 0, total: 0 });
    const [bloodGroups, setBloodGroups] = useState({});
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

      // Toggle the modal visibility
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAddEvent = (newEvent) => {
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  };
  
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const membersSnapshot = await getDocs(collection(db, "users"));
          const membersData = [];
          const bloodData = {};
          let maleCount = 0;
          let femaleCount = 0;
  
          membersSnapshot.forEach((doc) => {
            const data = doc.data();
            membersData.push(data);
  
            if (data.gender?.toLowerCase() === "male") {maleCount++;}
            else if (data.gender?.toLowerCase() === "female") {femaleCount++;}
  
            if (data.bloodGroup) {
              if (!bloodData[data.bloodGroup]) {
                bloodData[data.bloodGroup] = [];
              }
              bloodData[data.bloodGroup].push({ name: data.name, mobile: data.mobile });
            }
          });
  
          setMembers(membersData);
          setStats({ male: maleCount, female: femaleCount, total: membersData.length });
          setBloodGroups(bloodData);




        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      };
  
      fetchData();
    }, []);
  
  
    return (
      <div className="dashboard">
        <div className="left-panel">
          <h2 className="members-title">Users</h2>
          <div className="members-list">
            {members.map((user, i) => (
              <MemberCard user={user} key={i} />
            ))}
          </div>
        </div>
  
        <div className="main-panel">
          <div className="stats">
          <InfoBox title="Male Members" value={stats.male} />
          <InfoBox title="Female Members" value={stats.female} />
          <InfoBox title="Total" value={stats.total} />
          </div>
  
          <div className="blood-group-title">Blood Groups</div>
          <div className="blood-group-grid">
            {Object.entries(bloodGroups).map(([group, members]) => (
              <div key={group}>
                <div className="group-title">{group}</div>
                <div className="group-members">
                  {members.map((member, i) => (
                    <BloodGroupCard key={i} name={member.name} mobile={member.mobile} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="down-panel">
        <h2 className="members-title">Events</h2>
        <button onClick={openModal} className="add-event-btn">
          Add Event
        </button>
        <div className="events-list">
          {events.map((event, i) => (
            <EventCard key={i} event={event} />
          ))}
        </div>
      </div>

      <EventModal isOpen={isModalOpen} onClose={closeModal} onAddEvent={handleAddEvent} />
    </div>
    );
  }