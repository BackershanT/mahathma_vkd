import React from "react";
import "./Events.css";
import { useNavigate } from "react-router-dom";

const Events = () => {
  const navigate = useNavigate();

  const handleViewDetails = (event) => {
    navigate(`/eventdetails/${event.id}`,{state:event});
  };



  const upcoming = [
    {
      title: "Vishu Celebration",
      image: "/images/vishu.jpg",
      date: "15th April, Friday",
      time: "5pm – 8:30pm",
      button: "Register Now",
    },
   
    {
      title: "Charity Drive",
      image: "/images/vishu.jpg",
      date: "25th April, Thursday",
      time: "4pm – 7:30pm",
      button: "Register Now",
    },
  ];

  const past = [
    {
      id: 1,
      title: "Support",
      image: "/images/support.jpg",
      date: "15th April, Friday",
      time: "5pm – 8:30pm",
      button: "View Details",
      description:
      "This event was organized to support local communities and raise awareness.",
    },
    {
      id: 2,
      title: "Motivation",
      image: "/images/motivation.jpg",
      date: "16th April, Saturday",
      time: "4pm – 7:30pm",
      button: "View Details",
       description:
      "A motivational session conducted by experts to uplift the spirit of youth.",

    },
  ];

  return (
    <section className="events-wrapper">
      {/* Upcoming Events Vertical */}
      <div className="upcoming-section">
        <h2>Upcoming Events</h2>
        <div className="upcoming-list">
          {upcoming.map((event, index) => (
            <div className="event-card" key={index}>
              <img src={event.image} alt={event.title} />
              <h3>{event.title}</h3>
              <p>{event.date}</p>
              <span>{event.time}</span>
              <button>{event.button}</button>
            </div>
          ))}
        </div>
      </div>

      {/* Past Events Horizontal */}
      <div className="past-section">
        <h2>Past Events</h2>
        <div className="past-grid">
          {past.map((event, index) => (
            <div className="event-card" key={index}>
              <img src={event.image} alt={event.title} />
              <h3>{event.title}</h3>
              <p>{event.date}</p>
              <span>{event.time}</span>
              <button onClick={() => handleViewDetails(event)}>
  {event.button}
</button>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Events;
