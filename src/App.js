import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import SearchPage from './SearchPage';
import SingleProteinPage from './SingleProteinPage';
import CompareProteinsPage from './CompareProteinsPage';
import ResultsPage from './ResultsPage'; // Keep the original for fallback

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Keep original ResultsPage but also add redirect */}
          <Route path="/results" element={<SingleProteinPage />} />
          
          {/* New routes */}
          <Route path="/protein" element={<SingleProteinPage />} />
          <Route path="/compare" element={<CompareProteinsPage />} />
          
          {/* Home page */}
          <Route path="/" element={<SearchPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
