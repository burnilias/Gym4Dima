import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Navigate } from 'react-router-dom';
import './ProtectedRoute.css';

// Component for protecting routes that require admin privileges
const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      try {
        // First check if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error('Error getting session or not authenticated:', sessionError);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }
        
        // Check if user is admin - first by checking user metadata
        const isAdminInMetadata = session.user.user_metadata?.is_admin === true;
        
        if (isAdminInMetadata) {
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }
        
        // If not in metadata, check if user email is the admin email
        const adminEmail = 'chahirilias8@gmail.com';
        if (session.user.email.toLowerCase() === adminEmail.toLowerCase()) {
          console.log('✅ Admin email detected in AdminRoute:', session.user.email);
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }
        console.log('❌ Not admin email in AdminRoute:', session.user.email);
        
        // As a fallback, check if user has admin role in profiles table
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching admin status:', profileError);
            setIsAdmin(false);
          } else if (profile && profile.is_admin) {
            setIsAdmin(true);
          } else if (profile && profile.email === 'chahirilias8@gmail.com') {
            // If the email matches our admin email, grant access
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (e) {
          console.error('Exception checking admin status:', e);
          setIsAdmin(false);
        }
      } catch (e) {
        console.error('Exception during admin check:', e);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        checkAdminStatus();
      }
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
        <p>Checking admin privileges...</p>
      </div>
    );
  }

  // Redirect to home if not an admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Render the protected component if user is an admin
  return children;
};

export default AdminRoute;
