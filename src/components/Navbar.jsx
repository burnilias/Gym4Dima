import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useTheme } from '../ThemeContext';

const Navbar = ({ showProfile = false }) => {
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user ?? null);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setErrorMessage('');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      setErrorMessage('Logout failed. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    } else {
      // setCurrentUser(null); // Handled by onAuthStateChange
      navigate('/');
    }
  };

  const handleNavLinkClick = (e, path) => {
    // If user is not logged in, prevent default navigation and show error
    if (!currentUser) {
      e.preventDefault();
      setErrorMessage('You should login first');
      
      // Hide the error message after 3 seconds
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    } else {
      // If logged in, allow navigation
      navigate(path);
    }
  };
  
  const handleLogoClick = (e) => {
    e.preventDefault();
    // If user is logged in, navigate to difficulty selection page
    if (currentUser) {
      navigate('/difficulty-selection');
    } else {
      // If not logged in, navigate to home page
      navigate('/');
    }
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="#" onClick={handleLogoClick}>
          <span className="logo-gym">GYM4</span>
          <span className="logo-dima">DIMA</span>
        </a>
      </div>
      <div className="navbar-links">
        <a href="#" onClick={(e) => handleNavLinkClick(e, '/calorie-calculator')}>calorie calculator</a>
        <a href="#" onClick={(e) => handleNavLinkClick(e, '/workout')}>workout</a>
        <a href="#" onClick={(e) => handleNavLinkClick(e, '/coach')}>coach</a>
        <a href="#" onClick={(e) => handleNavLinkClick(e, '/meal-plan')}>meal plan</a>
        <a href="#" onClick={(e) => handleNavLinkClick(e, '/note')}>note</a>
        <a href="#" onClick={(e) => handleNavLinkClick(e, '/community-chat')}>Community Chat</a>
      </div>
      <div className="navbar-right">
        <div className="navbar-social">
          <a href="#" className="social-icon discord"></a>
          <a href="#" className="social-icon twitter"></a>
          <a href="#" className="social-icon twitch"></a>
          <a href="#" className="social-icon youtube"></a>
        </div>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
            marginRight: '1rem'
          }}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        {showProfile && (
          <div className="profile-container">
            <button 
              className="profile-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              {currentUser ? (currentUser.user_metadata?.username || currentUser.email)?.charAt(0).toUpperCase() : 'U'}
            </button>
            
            {showProfileMenu && (
              <div className="profile-menu">
                <div className="profile-menu-item" onClick={() => navigate('/profile')}>
                  Edit Profile
                </div>
                <div className="profile-menu-item" onClick={handleLogout}>
                  Logout
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {errorMessage && (
        <div className="error-popup">
          {errorMessage}
        </div>
      )}

      {/* Mobile menu button */}
      <div className="hamburger-menu" onClick={() => setShowMobileMenu(!showMobileMenu)}>
        <div></div>
        <div></div>
        <div></div>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu ${showMobileMenu ? 'active' : ''}`}>
        <a href="#" onClick={(e) => handleNavLinkClick(e, '/calorie-calculator')}>calorie calculator</a>
        <a href="#" onClick={(e) => handleNavLinkClick(e, '/workout')}>workout</a>
        <a href="#" onClick={(e) => handleNavLinkClick(e, '/coach')}>coach</a>
        <a href="#" onClick={(e) => handleNavLinkClick(e, '/meal-plan')}>meal plan</a>
        <a href="#" onClick={(e) => handleNavLinkClick(e, '/note')}>note</a>
        <a href="#" onClick={(e) => handleNavLinkClick(e, '/community-chat')}>Community Chat</a>
      </div>
    </nav>
  );
};

export default Navbar;