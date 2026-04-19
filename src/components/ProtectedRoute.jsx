import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Navigate } from 'react-router-dom';
// import { checkAuth } from '../utils/auth'; // Replaced by Supabase
import './ProtectedRoute.css';

// Component for protecting routes that require authentication
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setIsAuthenticated(false);
        } else if (session) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error('Exception during session check:', e);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoading(true);
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || (event === 'INITIAL_SESSION' && session)) {
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
      // For other events like TOKEN_REFRESHED, PASSWORD_RECOVERY, MFA_CHALLENGE, we might not need to change isAuthenticated immediately
      // or it's handled by the session object update.
      // If session is null after an event, it implies logout or session expiry.
      if (!session) {
          setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render the protected component if authenticated
  return children;
};

export default ProtectedRoute;
