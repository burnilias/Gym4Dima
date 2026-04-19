import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in via Supabase session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // If there's an active session, redirect to difficulty selection
        // This prevents showing the login page if already authenticated
        navigate('/difficulty-selection');
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Basic validation
    if (!email || !password) {
      setError('All fields are required');
      return;
    }

    try {
      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || 'Login failed. Please check your credentials.');
        return;
      }

      if (!data.user) {
        setError('Login failed. Please try again.');
        return;
      }

      // Check if user exists in profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id);

      // If profile doesn't exist, create one
      if (!profileData || profileData.length === 0) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              username: data.user.email.split('@')[0],
              is_active: true
            }
          ]);

        if (insertError) {
          console.error('Error creating profile:', insertError);
          // Continue anyway - user is authenticated
        }
      }

      // Check if user is admin
      if (data.user.email === 'admin@gmail.com') {
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin-dashboard');
        return;
      } else {
        localStorage.removeItem('isAdmin');
      }
      // Redirect to main application
      navigate('/difficulty-selection');
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };


  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) {
        console.error('Password reset error:', error);
        setError(error.message || 'Failed to send reset email. Please try again.');
        return;
      }

      // Success
      setSuccessMessage('Password reset email sent. Please check your inbox.');
      setResetEmail('');
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const toggleForgotPassword = () => {
    setShowForgotPassword(!showForgotPassword);
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="login-container">
      <Navbar />
      <div className="login-content">
        <div className="login-form-container">
          <h2 className="login-title">{showForgotPassword ? 'Reset Password' : 'Login'}</h2>
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label htmlFor="resetEmail">Email Address:</label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <button type="submit" className="login-button">
                Send Reset Link
              </button>
              <button type="button" className="back-button" onClick={toggleForgotPassword}>
                Back to Login
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="email">Email Address:</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password:</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="login-button">
                  Login
                </button>
              </form>
              <div className="forgot-password-link">
                <a href="#" onClick={(e) => { e.preventDefault(); toggleForgotPassword(); }}>
                  Forgot your password?
                </a>
              </div>
              <div className="register-link">
                Don't have an account? <Link to="/register">Register here</Link>
              </div>
            </>
          )}
          
          <div className="motivational-quote">
            "IF IT DOESN'T CHALLENGE YOU, IT WON'T CHANGE YOU."
          </div>
        </div>
        <div className="login-image"></div>
      </div>
    </div>
  );
};

export default Login;