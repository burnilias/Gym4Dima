import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../supabaseClient';
import './CoachPage.css';

// Fallback data in case the database fetch fails
const fallbackCoaches = [
  {
    id: 'chris',
    name: 'COACH CHRIS',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=500&auto=format&fit=crop',
    phone: '212612345678',
    bioLink: '/coach/chris',
    specialization: 'Strength Training',
    experience: 7
  },
  {
    id: 'david',
    name: 'COACH DAVID',
    image: 'https://images.unsplash.com/photo-1567013127542-490d757e6349?q=80&w=500&auto=format&fit=crop',
    phone: '212687654321',
    bioLink: '/coach/david',
    specialization: 'Nutrition & Weight Loss',
    experience: 5
  },
  {
    id: 'hany',
    name: 'COACH HANY',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=500&auto=format&fit=crop',
    phone: '212698765432',
    bioLink: '/coach/hany',
    specialization: 'CrossFit & Functional Training',
    experience: 8
  }
];

const CoachPage = () => {
  const [coaches, setCoaches] = useState(fallbackCoaches);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Check if user is logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Session check error:', error);
        // Continue with fallback data if session check fails
      }
    };
    checkSession();
  }, [navigate]);

  // Fetch coaches from Supabase
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        setLoading(true);
        
        // Fetch coaches from the 'coaches' table
        const { data, error } = await supabase
          .from('coaches')
          .select('*')
          .order('id');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Process the data to ensure image URLs are complete
          const processedCoaches = data.map(coach => ({
            ...coach,
            // If the image URL is a storage path, get the public URL
            image: coach.image_url && coach.image_url.startsWith('coaches/') 
              ? `${supabase.supabaseUrl}/storage/v1/object/public/coach-images/${coach.image_url}` 
              : coach.image_url,
            bioLink: `/coach/${coach.id}`
          }));
          
          setCoaches(processedCoaches);
          setError(null); // Clear any previous errors
        } else {
          // If no data is returned, keep using the fallback data
          console.log('No coaches found in database, using fallback data');
        }
      } catch (error) {
        console.error('Error fetching coaches:', error);
        // We're already using fallback data, so just log the error
        // but don't show it to the user since we have data to display
      } finally {
        setLoading(false);
      }
    };
    
    fetchCoaches();
  }, []);
  
  return (
    <div className="coach-page-container">
      <Navbar showProfile={true} />
      <div className="coach-page-content">
        <h1 className="coach-page-title">Meet Our Expert Coaches: Your Guides to Achieving Fitness Excellence</h1>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading coaches...</p>
          </div>
        ) : (
          <div className="coaches-grid">
            {coaches.map(coach => (
              <div key={coach.id} className="coach-card">
                <div className="coach-card-header">
                  <span className="window-icon">□</span>
                  <span className="window-icon">-</span>
                  <span className="window-icon close-icon">×</span>
                </div>
                <img 
                  src={coach.image} 
                  alt={coach.name} 
                  className="coach-image" 
                  onError={(e) => {
                    console.error(`Failed to load image for ${coach.name}`);
                    e.target.src = 'https://via.placeholder.com/300x200?text=Coach+Image+Not+Available';
                  }}
                />
                <div className="coach-info">
                  <h3 className="coach-name">{coach.name}</h3>
                  {coach.specialization && (
                    <p className="coach-specialization">{coach.specialization}</p>
                  )}
                  <Link to={coach.bioLink} className="coach-bio-button">BIOGRAPHY</Link>
                </div>
                <div className="coach-card-footer">
                  <span className="arrow-icon">{'<'}</span>
                  <span className="arrow-icon">{'>'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachPage;