import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaArrowLeft } from "react-icons/fa";
import "./EventDetails.css";

const EventDetails = () => {
  const { state: event } = useLocation();
  const navigate = useNavigate();

  if (!event) {
    return (
      <div className="event-details-error">
        <p>No Event Data Available</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="event-details-page">
      <div className="event-details-container">
        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        <div className="event-content-layout">
          {/* Left Column: Image */}
          <div className="event-image-section">
            <div className="image-wrapper">
              <img src={event.image} alt={event.title} />
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="event-info-section">
            <h1 className="event-title">{event.title}</h1>

            {/* Tags Section */}
            <div className="event-tags">
              <div className="tag-item">
                <FaCalendarAlt className="tag-icon" />
                <span>{event.date ? formatDate(event.date) : event.date}</span>
              </div>
              <div className="tag-item">
                <FaClock className="tag-icon" />
                <span>{event.time}</span>
              </div>
              {event.location && (
                <div className="tag-item">
                  <FaMapMarkerAlt className="tag-icon" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>

            {/* Description Section */}
            <div className="event-description-card">
              <h3>About the Event</h3>
              <p>{event.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
