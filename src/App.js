import React, { useEffect, useState, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import DifficultySelection from './pages/DifficultySelection';
import CalorieCalculator from './pages/CalorieCalculator';
import Workout from './pages/Workout';
import WorkoutDetail from './pages/WorkoutDetail';
import MealPlan from './pages/MealPlan';
import Profile from './pages/Profile';
import CoachPage from './pages/CoachPage';
import CoachDetailPage from './pages/CoachDetailPage';
import NotePage from './pages/NotePage';
import CommunityChatPage from './pages/CommunityChatPage';
import ImageUploadPage from './pages/ImageUploadPage'; // Import for image upload page
import ProtectedRoute from './components/ProtectedRoute'; // Import for protected routes
import './App.css';
import './theme.css';
import Chatbot from './components/Chatbot';
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
