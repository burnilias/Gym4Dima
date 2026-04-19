import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Validate form
    if (!email || !username || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      // Use email as the identifier for Supabase auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username, // Store username in user_metadata
          }
        }
      });

      if (signUpError) {
        console.error('Supabase registration error:', signUpError);
        setError(signUpError.message || 'Registration failed. Please try again.');
        return;
      }

      // Supabase sends a confirmation email by default.
      if (data.user) {
        // Registration successful, show verification message
        setVerificationNeeded(true);

        // ALSO: Insert user into 'profiles' table
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id, // Link to the auth.users table
                username: username, // Use the username from the form
                email: data.user.email,
                // created_at can be set by default in Supabase table definition
              },
            ]);

          if (profileError) {
            console.error('Error creating profile:', profileError);
            // setError((prevError) => (prevError ? prevError + ' ' : '') + 'Failed to create user profile. Chat features might be limited.');
            // We'll let the registration proceed but log the error. User might need to update profile later or contact support.
          }
        } catch (profileInsertError) {
          console.error('Exception during profile insert:', profileInsertError);
          // setError((prevError) => (prevError ? prevError + ' ' : '') + 'An unexpected error occurred while creating your profile.');
        }

      } else if (data.session === null && !data.user) {
        // This case might happen if email confirmation is required and the user is not yet confirmed.
        // Or if there's an issue not caught by signUpError but user is not created.
        setVerificationNeeded(true);
      } else {
        // Fallback error if user is not created and no specific error was thrown
        setError('Registration failed. An unexpected error occurred.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred during registration. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <Navbar />
      <div className="register-content">
        <div className="register-form-container">
          <h2 className="register-title">Register</h2>
          {error && <div className="error-message">{error}</div>}
          {verificationNeeded ? (
            <div className="verification-message">
              <h3>Email Verification Required</h3>
              <p>We've sent a verification link to your email address. Please check your inbox and verify your account to continue.</p>
              <button 
                className="register-button" 
                onClick={() => navigate('/login')}
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister}>
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
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a unique username"
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
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
            <button type="submit" className="register-button">
              Register
            </button>
          </form>
          )}
          {!verificationNeeded && (
            <div className="login-link">
              Already have an account? <Link to="/login">Login here</Link>
            </div>
          )}
          <div className="motivational-quote">
            "THE ONLY BAD WORKOUT IS THE ONE THAT DIDN'T HAPPEN."
          </div>
        </div>
        <div className="register-image"></div>
      </div>
    </div>
  );
};

export default Register;