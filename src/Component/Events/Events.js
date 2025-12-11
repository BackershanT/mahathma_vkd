import React, { useEffect, useState } from "react";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../Firebase/Firebase';
import "./Events.css";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaCalendar } from 'react-icons/fa';

// Dummy events data
const dummyUpcomingEvents = [
  {
    id: '1',
    title: 'Health Camp 2024',
    description: 'Free health checkup and consultation for community members with expert doctors. Get your health screened and receive professional medical advice.',
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
    time: '9:00 AM - 5:00 PM',
    location: 'Community Center Hall',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800'
  },
  {
    id: '2',
    title: 'Blood Donation Drive',
    description: 'Annual blood donation camp in partnership with local hospitals to save lives. Your donation can help someone in need.',
    date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(), // 22 days from now
    time: '8:00 AM - 4:00 PM',
    location: 'City Hospital Campus',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800'
  },
  {
    id: '3',
    title: 'Cultural Festival',
    description: 'Celebrate diversity with music, dance, and food from different cultures. Join us for a day of cultural exchange and entertainment.',
    date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days from now
    time: '4:00 PM - 10:00 PM',
    location: 'Open Ground Park',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'
  },
  {
    id: '4',
    title: 'Educational Workshop',
    description: 'Learn new skills and enhance your knowledge in our educational workshop. Topics include digital literacy, financial planning, and more.',
    date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
    time: '10:00 AM - 2:00 PM',
    location: 'Community Library',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800'
  }
];

const dummyPastEvents = [
  {
    id: '5',
    title: 'Tree Plantation Drive',
    description: 'Successfully planted 500+ saplings across the community. A great initiative towards environmental conservation and green living.',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    time: '6:00 AM - 12:00 PM',
    location: 'Community Park',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800'
  },
  {
    id: '6',
    title: 'Food Distribution Program',
    description: 'Distributed food packets to 200+ families in need. A heartwarming event that brought the community together to help those less fortunate.',
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    time: '11:00 AM - 3:00 PM',
    location: 'Community Center',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'
  },
  {
    id: '7',
    title: 'Sports Tournament',
    description: 'Annual community sports tournament featuring cricket, football, and badminton. Great participation from all age groups.',
    date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
    time: '7:00 AM - 6:00 PM',
    location: 'Sports Complex',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'
  },
  {
    id: '8',
    title: 'Cleanliness Campaign',
    description: 'Community-wide cleanliness drive that covered all major streets and public areas. Together we made our neighborhood cleaner.',
    date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
    time: '8:00 AM - 1:00 PM',
    location: 'Various Locations',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'
  }
];

const Events = () => {
  // Force rebuild for CSS update
  const [activeTab, setActiveTab] = useState('upcoming');
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [totalIndicators, setTotalIndicators] = useState(1);
  const eventsGridRef = React.useRef(null);
  const navigate = useNavigate();

  const parseDate = (dateString) => {
    const date = new Date(dateString);
    return date.getTime();
  };

  const handleViewDetails = (event) => {
    navigate(`/eventdetails/${event.id}`, { state: event });
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsData = [];
        querySnapshot.forEach((doc) => {
          eventsData.push({ id: doc.id, ...doc.data() });
        });
        const currentDate = new Date().getTime();

        // Filter events based on date (automatically categorize)
        const upcoming = eventsData.filter(event => {
          const eventDate = parseDate(event.date);
          return eventDate > currentDate;
        });
        const past = eventsData.filter(event => {
          const eventDate = parseDate(event.date);
          return eventDate <= currentDate;
        });

        // Use dummy data if no events from Firebase
        setUpcomingEvents(upcoming.length > 0 ? upcoming : dummyUpcomingEvents);
        setPastEvents(past.length > 0 ? past : dummyPastEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        // Use dummy data on error
        setUpcomingEvents(dummyUpcomingEvents);
        setPastEvents(dummyPastEvents);
      }
    };

    fetchEvents();
  }, []);

  const formatFullDate = (dateStr) => {
    const date = new Date(dateStr);
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const displayEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  // Update indicators on resize and tab change
  useEffect(() => {
    // Calculate visible cards and indicators
    const calculateIndicators = () => {
      if (!eventsGridRef.current || displayEvents.length === 0) return 1;

      const container = eventsGridRef.current;
      const cards = container.querySelectorAll('.event-card');
      if (cards.length === 0) return 1;

      const containerRect = container.getBoundingClientRect();
      const firstCard = cards[0];
      if (!firstCard) return 1;

      const cardWidth = firstCard.getBoundingClientRect().width;
      const gap = window.innerWidth <= 768 ? 24 : 32; // 1.5rem on mobile, 2rem on desktop
      const visibleCards = Math.max(1, Math.floor(containerRect.width / (cardWidth + gap)));
      return Math.ceil(displayEvents.length / visibleCards);
    };

    const updateIndicators = () => {
      setTotalIndicators(calculateIndicators());
    };

    updateIndicators();
    window.addEventListener('resize', updateIndicators);
    return () => window.removeEventListener('resize', updateIndicators);
  }, [displayEvents.length, activeTab]);

  // Auto-scroll functionality - scroll by individual cards
  useEffect(() => {
    if (displayEvents.length <= 3 || isPaused || !eventsGridRef.current) return;

    const scrollInterval = setInterval(() => {
      if (eventsGridRef.current) {
        const container = eventsGridRef.current;
        const cards = container.querySelectorAll('.event-card');
        if (cards.length === 0) return;

        // Find which card is currently most visible
        let currentCardIndex = 0;
        let maxVisible = 0;
        const containerRect = container.getBoundingClientRect();

        cards.forEach((card, index) => {
          const cardRect = card.getBoundingClientRect();
          const visibleWidth = Math.min(cardRect.right, containerRect.right) - Math.max(cardRect.left, containerRect.left);
          if (visibleWidth > maxVisible) {
            maxVisible = visibleWidth;
            currentCardIndex = index;
          }
        });

        // Scroll to next card
        const nextIndex = (currentCardIndex + 1) % cards.length;
        const nextCard = cards[nextIndex];
        if (nextCard) {
          const cardRect = nextCard.getBoundingClientRect();
          const scrollAmount = cardRect.left - containerRect.left + container.scrollLeft;

          container.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
          });
        }
      }
    }, 3000); // Auto-scroll every 3 seconds

    return () => clearInterval(scrollInterval);
  }, [displayEvents.length, isPaused]);

  // Reset index when tab changes
  useEffect(() => {
    setCurrentIndex(0);
    if (eventsGridRef.current) {
      eventsGridRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const handleScroll = () => {
    if (eventsGridRef.current) {
      const container = eventsGridRef.current;
      const cards = container.querySelectorAll('.event-card');
      if (cards.length === 0) return;

      const containerRect = container.getBoundingClientRect();
      let mostVisibleIndex = 0;
      let maxVisible = 0;

      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const visibleWidth = Math.min(cardRect.right, containerRect.right) - Math.max(cardRect.left, containerRect.left);
        if (visibleWidth > maxVisible) {
          maxVisible = visibleWidth;
          mostVisibleIndex = index;
        }
      });

      // Calculate which page/indicator should be active
      const firstCard = cards[0];
      if (firstCard) {
        const cardWidth = firstCard.getBoundingClientRect().width;
        const gap = window.innerWidth <= 768 ? 24 : 32;
        const visibleCards = Math.max(1, Math.floor(containerRect.width / (cardWidth + gap)));
        const pageIndex = Math.floor(mostVisibleIndex / visibleCards);
        setCurrentIndex(Math.min(pageIndex, totalIndicators - 1));
      }
    }
  };

  const handleIndicatorClick = (index) => {
    if (eventsGridRef.current) {
      const container = eventsGridRef.current;
      const cards = container.querySelectorAll('.event-card');
      if (cards.length === 0) return;

      const containerRect = container.getBoundingClientRect();
      const firstCard = cards[0];
      if (firstCard) {
        const cardWidth = firstCard.getBoundingClientRect().width;
        const gap = window.innerWidth <= 768 ? 24 : 32;
        const visibleCards = Math.max(1, Math.floor(containerRect.width / (cardWidth + gap)));
        const targetCardIndex = Math.min(index * visibleCards, cards.length - 1);
        const targetCard = cards[targetCardIndex];

        if (targetCard) {
          const cardRect = targetCard.getBoundingClientRect();
          const scrollAmount = cardRect.left - containerRect.left + container.scrollLeft;

          container.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
          });
          setCurrentIndex(index);
        }
      }
    }
  };

  return (
    <section id="events" className="events-section">
      <div className="events-container">
        <h2 className="section-title">Our Events</h2>
        <p className="section-description">
          Stay updated with our upcoming activities and revisit memorable moments from past events.
        </p>

        <div className="events-tabs">
          <button
            className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Events
          </button>
          <button
            className={`tab-button ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past Events
          </button>
        </div>

        <div
          className="events-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="events-grid"
            ref={eventsGridRef}
            onScroll={handleScroll}
            style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', overflowX: 'auto' }}
          >
            {displayEvents.length > 0 ? (
              displayEvents.map((event) => (
                <div className="event-card" key={event.id}>
                  <div className="event-image-container">
                    <img src={event.image || 'https://via.placeholder.com/400x250'} alt={event.title} />
                  </div>
                  <div className="event-content">
                    <div className="event-date-row">
                      <FaCalendar className="calendar-icon" />
                      <span className="event-date">{formatFullDate(event.date)}</span>
                    </div>
                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-description">
                      {event.description || 'Join us for this exciting community event.'}
                    </p>
                    {event.location && (
                      <div className="event-location-row">
                        <FaMapMarkerAlt className="location-icon" />
                        <span className="event-location-text">{event.location}</span>
                      </div>
                    )}
                    {activeTab === 'past' && (
                      <button className="view-more-btn" onClick={() => handleViewDetails(event)}>
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-events">
                <p>No {activeTab === 'upcoming' ? 'upcoming' : 'past'} events at the moment.</p>
              </div>
            )}
          </div>

          {displayEvents.length > 1 && totalIndicators > 1 && (
            <div className="events-indicators">
              {Array.from({ length: totalIndicators }).map((_, index) => (
                <button
                  key={index}
                  className={`indicator-dot ${currentIndex === index ? 'active' : ''}`}
                  onClick={() => handleIndicatorClick(index)}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Events;
