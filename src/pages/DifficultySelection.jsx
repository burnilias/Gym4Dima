import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './DifficultySelection.css';

const DifficultySelection = () => {
  const navigate = useNavigate();

  // Plan options with their descriptions
  const planOptions = [
    {
      id: 'calorie-calculator',
      title: 'CALORIE CALCULATOR',
      description: 'Calculate your daily calorie needs based on your goals, activity level, and body metrics.',
      path: '/calorie-calculator',
      className: 'difficulty-card-calculator'
    },
    {
      id: 'workout',
      title: 'WORKOUT PLANS',
      description: 'Access customized workout routines for different body parts and fitness levels.',
      path: '/workout',
      className: 'difficulty-card-workout'
    },
    {
      id: 'meal-plan',
      title: 'MEAL PLANS',
      description: 'Discover healthy meal plans tailored to your calorie needs and dietary preferences.',
      path: '/meal-plan',
      className: 'difficulty-card-meal'
    }
  ];

  const handlePlanSelect = (path) => {
    // Navigate to selected plan page
    navigate(path);
  };

  return (
    <div className="difficulty-container">
      <Navbar showProfile={true} />
      <div className="difficulty-content">
        <h1 className="difficulty-title">Choose your Plan</h1>
        <p className="difficulty-subtitle">
          Select one of our specialized tools to help you achieve your fitness goals. Each option provides unique features to support your fitness journey.
        </p>
        
        <div className="difficulty-cards">
          {planOptions.map((plan) => (
            <div key={plan.id} className={`difficulty-card ${plan.className}`}>
              <h3 className="card-title">{plan.title}</h3>
              <p className="card-description">{plan.description}</p>
              <button 
                className="lets-begin-btn"
                onClick={() => handlePlanSelect(plan.path)}
              >
                SELECT
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DifficultySelection;