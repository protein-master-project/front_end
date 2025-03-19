import React, { useState } from 'react';
import './SearchPage.css';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to results page with the search query
    window.location.href = `/results?query=${encodeURIComponent(searchQuery)}`;
  };
  
  return (
    <div className="search-page">
      <div className="search-container">
        <div className="search-header">
          <h1 className="app-title">Protein Master</h1>
          <p className="app-subtitle">Search for protein structure visualization</p>
        </div>
        
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter protein name ..."
              className="search-input"
            />
            <button
              type="submit"
              className="search-button"
            >
              Search
            </button>
          </div>
        </form>
        
        <div className="search-footer">
          <p>Find 3D and 2D visualizations about proteins</p>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;