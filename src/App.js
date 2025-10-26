import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import './App.css';

import AppContent from './components/AppContent';

// Configure axios base URL
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8003';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="santa-container">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;