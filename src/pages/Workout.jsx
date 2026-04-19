import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Workout.css';
import { supabase } from '../supabaseClient'; // Added for auth check

const Workout = () => {
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    checkSession();
  }, [navigate]);

  // Workout categories
  const workoutCategories = [
    {
      id: 'back',
      title: 'Back workout',
      image: 'https://learn.athleanx.com/wp-content/uploads/2021/10/BACK-MAIN-IMAGE.png'
    },
    {
      id: 'legs',
      title: 'Legs Workout',
      image: 'https://learn.athleanx.com/wp-content/uploads/2022/09/LEG-WORKOUTS-1024x576.png'
    },
    {
      id: 'abs',
      title: 'Abdominal Workout',
      image: 'https://learn.athleanx.com/wp-content/uploads/2021/08/MAIN-MAGE.png'
    },
    {
      id: 'chest',
      title: 'Chest workout',
      image: 'https://i.ytimg.com/vi/yGxbxtlgOpk/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAFmJSkktsER4PbBBbO0zL4mIDRFw'
    },
    {
      id: 'arms',
      title: 'Arms workout',
      image: 'https://images.unsplash.com/photo-1590507621108-433608c97823?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'core',
      title: 'Core Workout',
      image: 'https://res.cloudinary.com/peloton-cycle/image/fetch/f_auto,c_limit,w_3840,q_90/https://images.ctfassets.net/6ilvqec50fal/5wieyCZ94q6Sgexl48QVWz/774cbb8ce5ee568bdb34e93a5a9b2709/birddog_deepcore.jpg'
    }
  ];

  return (
    <div className="workout-container">
      <Navbar showProfile={true} />
      <div className="workout-content">
        <h1 className="page-title">BEST WORKOUT PLANS !</h1>
        <div className="orange-line"></div>
        <div className="workout-grid">
          {workoutCategories.map(category => (
            <Link to={`/workout/${category.id}`} key={category.id} className="workout-card">
              <div className="workout-card-header">
                <span className="minimize-icon">-</span>
                <span className="close-icon">×</span>
              </div>
              <div 
                className="workout-card-image" 
                style={{ backgroundImage: `url(${category.image})` }}
              ></div>
              <div className="workout-card-title">{category.title}</div>
              <div className="workout-card-footer">
                <span className="arrow-left">◀</span>
                <span className="arrow-right">▶</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Workout;