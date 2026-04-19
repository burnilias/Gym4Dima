import React, { useEffect, useState, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import DifficultySelection from './pages/DifficultySelection.jsx';
import CalorieCalculator from './pages/CalorieCalculator.jsx';
import Workout from './pages/Workout.jsx';
import WorkoutDetail from './pages/WorkoutDetail.jsx';
import MealPlan from './pages/MealPlan.jsx';
import Profile from './pages/Profile.jsx';
import CoachPage from './pages/CoachPage.jsx';
import CoachDetailPage from './pages/CoachDetailPage.jsx';
import NotePage from './pages/NotePage.jsx';
import CommunityChatPage from './pages/CommunityChatPage.jsx';
import ImageUploadPage from './pages/ImageUploadPage.jsx'; // Import for image upload page
import ProtectedRoute from './components/ProtectedRoute.jsx'; // Import for protected routes
import './App.css';
import './theme.css';
import Chatbot from './components/Chatbot.jsx';
import { ThemeProvider } from './ThemeContext';

import { supabase } from './supabaseClient';

// Create a UserContext to provide user state throughout the app
export const UserContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <ThemeProvider>
      <Router>
      <Chatbot />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/difficulty-selection" element={<DifficultySelection />} />
        <Route path="/calorie-calculator" element={<CalorieCalculator />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/workout/:type" element={<WorkoutDetail />} />
        <Route path="/meal-plan" element={<MealPlan />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/coach" element={<CoachPage />} />
        <Route path="/coach/:coachId" element={<CoachDetailPage />} />
        <Route path="/note" element={<NotePage />} />
        <Route path="/community-chat" element={<CommunityChatPage />} />
        <Route path="/image-upload" element={<ProtectedRoute><ImageUploadPage /></ProtectedRoute>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Redirect to home if route doesn't exist */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;
