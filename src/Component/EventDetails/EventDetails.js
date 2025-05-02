import React from "react";
import { useLocation} from"react-router-dom";
import "./EventDetails.css";


const EventDetails = () => {
  const { state: event } = useLocation();
  if (!event) {
    return <div>No Event Data Available</div>;
  }

  return (
    <div className="event-details-wrapper">
    <div className="event-left">
      <div className="event-card">
        <img src={event.image} alt={event.title} />
        <h3>{event.title}</h3>
        <p>{event.date}</p>
        <span>{event.time}</span>
      </div>
    </div>
    <div className="event-right">
      <h2 className="details-heading">Events Details</h2>
      <p className="malayalam-text">
       {event.description}
      </p>
      <div className="gray-boxes">
        {Array(6)
          .fill(0)
          .map((_, idx) => (
            <div className="gray-box" key={idx}></div>
          ))}
      </div>
    </div>
  </div>

  
  );
};

export default EventDetails;
