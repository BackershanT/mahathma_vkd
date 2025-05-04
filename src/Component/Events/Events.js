import React ,{useEffect, useState}from "react";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../Firebase/Firebase';
import "./Events.css";
import { useNavigate } from "react-router-dom";

const Events = () => {
  const parseDate = (dateString) => {
    const date = new Date(dateString);
    return date.getTime();
  };
  const navigate = useNavigate();

  const handleViewDetails = (event) => {
    navigate(`/eventdetails/${event.id}`,{state:event});
  };
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsData = [];
        querySnapshot.forEach((doc) => {
          eventsData.push({ id: doc.id, ...doc.data() });
        });
        const currentDate = new Date().getTime();

 // Separate events into upcoming and past based on the current date
 const upcoming = eventsData.filter(event => parseDate(event.date) > currentDate);
 const past = eventsData.filter(event => parseDate(event.date) <= currentDate);

 setUpcomingEvents(upcoming);
 setPastEvents(past);
 setEvents(eventsData); // Store all events for other use cases (optional)
} catch (error) {
 console.error("Error fetching events:", error);
}
};

fetchEvents();
}, []);

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
  return (
    <section className="events-wrapper">
      {/* Upcoming Events Vertical */}
      <div className="upcoming-section">
        <h2>Upcoming Events</h2>
        <div className="upcoming-list">
          {upcomingEvents.length>0?(
            upcomingEvents.map((event) => (
            <div className="event-card" key={event.id} style={{ width: "100%", borderRadius: '8px' }}>

              <img src={event.image} alt={event.title} />
              <h3>{event.title}</h3>
              <p>{formatDate(event.date)}</p>
              <span>{event.time}</span>
            </div>
          ))):(
            <p>No upcoming events.</p>
          )}
        </div>
      </div>

      {/* Past Events Horizontal */}
      <div className="past-section">
        <h2>Past Events</h2>
        <div className="past-grid">
        {pastEvents.length>0?(
pastEvents.map((event) => (
            <div className="event-card" key={event.id}>
              <img src={event.image} alt={event.title}  style={{
                width :"100%",borderRadius:"8px"
              }}/>
              <h3>{event.title}</h3>
              <p>{formatDate(event.date)}</p>
              <span>{event.time}</span>
              <button onClick={() => handleViewDetails(event)}>
  View More
</button>

            </div>
          ))):( <p>No Past events.</p>)}
        </div>
      </div>
    </section>
  );
};

export default Events;
