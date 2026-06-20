import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Dumbbell, Apple, Users, Star } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <div className="home-container">
      <Navbar />
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title hero-animate">Révélez votre potentiel</h1>
          <p className="cta-text hero-animate">
            Crée tes plans de repas et tes programmes d'entraînement, adaptés à tes objectifs.
            <br />
            Suis ta progression. Reste constant. Avance.
          </p>
          <Link to="/login" className="join-button hero-animate">
            join now
          </Link>
        </div>
      </div>
      
      <div 
        className="features-section"
        onMouseMove={handleMouseMove}
        style={{
          '--mouse-x': `${mousePosition.x}%`,
          '--mouse-y': `${mousePosition.y}%`
        }}
      >
        <h2 className="section-title">Nos Services</h2>
        
        <div className="features-grid">
          <div className="feature-card feature-card-workout">
            <h3>Entraînements Personnalisés</h3>
            <p>Des programmes d'entraînement adaptés à vos objectifs et à votre niveau.</p>
          </div>
          
          <div className="feature-card feature-card-nutrition">
            <h3>Plans Nutritionnels</h3>
            <p>Des plans alimentaires équilibrés pour atteindre vos objectifs de santé.</p>
          </div>
          
          <div className="feature-card feature-card-coaching">
            <h3>Coaching Expert</h3>
            <p>Un suivi personnalisé par nos coachs professionnels.</p>
          </div>
        </div>
      </div>
      
      <div className="testimonials-section">
        <h2 className="section-title">Témoignages</h2>
        
        <div className="testimonial-card">
          <div className="testimonial-rating">
            <Star size={20} className="star-filled" />
            <Star size={20} className="star-filled" />
            <Star size={20} className="star-filled" />
            <Star size={20} className="star-filled" />
            <Star size={20} className="star-filled" />
          </div>
          <p className="testimonial-text">"Grâce à GYM4DIMA, j'ai atteint mes objectifs de fitness en seulement 3 mois. Les entraînements sont parfaits pour mon emploi du temps chargé!"</p>
          <p className="testimonial-author">- Sophie M.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;