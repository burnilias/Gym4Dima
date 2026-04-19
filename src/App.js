import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './theme.css';
import { ThemeProvider } from './ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <header className="App-header">
            <h1>Gym4Dima</h1>
            <p>Your fitness journey starts here!</p>
          </header>
          <Routes>
            <Route path="/" element={
              <div>
                <h2>Welcome to Gym4Dima</h2>
                <p>This is the main page of your fitness application.</p>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
