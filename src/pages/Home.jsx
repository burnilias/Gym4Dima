import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <Navbar />
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Révélez votre potentiel</h1>
          <div className="cta-card">
            <p className="cta-text">
              Commence à créer tes plans de repas et tes entraînements personnalisés.
              <br />
              Ensemble, on avance vers tes objectifs —
              <br />
              plus fort, plus sain, plus motivé ! 💪
            </p>
            <Link to="/login" className="join-button">
              join now
            </Link>
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <h2 className="section-title">Nos Services</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💪</div>
            <h3>Entraînements Personnalisés</h3>
            <p>Des programmes d'entraînement adaptés à vos objectifs et à votre niveau.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🥗</div>
            <h3>Plans Nutritionnels</h3>
            <p>Des plans alimentaires équilibrés pour atteindre vos objectifs de santé.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Coaching Expert</h3>
            <p>Un suivi personnalisé par nos coachs professionnels.</p>
          </div>
        </div>
      </div>
      
      <div className="testimonials-section">
        <h2 className="section-title">Témoignages</h2>
        
        <div className="testimonial-card">
          <div className="testimonial-avatar">👤</div>
          <p className="testimonial-text">"Grâce à GYM4DIMA, j'ai atteint mes objectifs de fitness en seulement 3 mois. Les entraînements sont parfaits pour mon emploi du temps chargé!"</p>
          <p className="testimonial-author">- Sophie M.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;