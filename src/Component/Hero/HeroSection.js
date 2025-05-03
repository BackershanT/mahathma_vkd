import React, { useContext } from 'react';
import './HeroSection.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext/AuthContext';
import { MdCreditCard } from 'react-icons/md';
import logo_text from '../../Assets/logo_text.png';
import logo_big from '../../Assets/logo_big.png';



function HeroSection() {
  const navigate = useNavigate();
  const { currentUser ,logout} = useContext(AuthContext);
  const handleClick = () => {
    if (currentUser) {
      logout();
    } else {
      navigate('/login');
    }
  };
  const handleFABClick=()=>{
    if(currentUser){
      navigate('/membership');
    }
  }


  return (
    <div className="hero-container">
      <header className="navbar">
        <img src={logo_text} alt="Mahathma"
       className="logo"  />
        <nav>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#events">Events</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><button className="join-btn" onClick={handleClick}>{currentUser ? currentUser.displayName||currentUser.email:"Login"}</button></li>
          </ul>
        </nav>
      </header>
    

      <main className="hero-content">
        <section className="text-section">
          <h1>Welcome to <br /><span>Mahathma Veliyancode</span></h1>
          <p>
            mahatma veliyancode is a social club that performs social activities in Veliyancode and was established in 2000.
          </p>
          <button className="explore-btn" onClick={()=>navigate('/signup')}>Join Community</button>
        </section>
        <section className="image-section">
          <img src={logo_big} alt="Mahathma" />
        </section>
      </main>


           {/* Floating Action Button */}
           {currentUser && (
        <div className="fab" onClick={handleFABClick}>
  <MdCreditCard size={24} />        </div>
      )}
    </div>
  );
}

export default HeroSection;
