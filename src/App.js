import './App.css';
import HeroSection from './Component/Hero/HeroSection';
import JoinMission from './Component/JoinMission/JoinMission';
import Event from './Component/Events/Events';
import AboutUs from './Component/AboutUs/AboutUs';
import Contact from './Component/Contact/Contact';
import Footer from './Component/Footer/Footer';
import EventDetails from './Component/EventDetails/EventDetails';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Component/Login/Login';
import Signup from './Component/Signup/Signup';
import MembershipCard from './Component/MembershipCard/MembershipCard';
import MembershipForm from './Component/MembershipForm/MembershipForm';
import { AuthProvider } from './Component/AuthContext/AuthContext';
import Dashboard from './Component/Dashboard/Dashboard';
import Setup from './Component/Setup/Setup';
import FloatingActionButton from './Component/FloatingActionButton/FloatingActionButton';

function Home() {
  return (
    <>
      <div id="home">
        <HeroSection />
      </div>
      <JoinMission />
      <div id="events">
        <Event />
      </div>
      <div id="about">
        <AboutUs />
      </div>
      <div id="contact">
        <Contact />
      </div>
      <Footer />
      <FloatingActionButton />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/eventdetails/:Id" element={<EventDetails />} />
          <Route path="/membership" element={<MembershipCard />} />
          <Route path="/membership-form" element={<MembershipForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/setup" element={<Setup />} />



        </Routes>
      </Router>
      </AuthProvider>
      {/* <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/eventdetails/:eventId" element={<EventDetails />} />
          <Route path="/membership" element={<MembershipCard />} />

        </Routes> */}
      {/* </Router> */}
    </div>
  );
}

export default App;
