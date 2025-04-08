import React, { useState, useEffect } from 'react';
import { searchProteins } from './services/ProteinService';
import './SearchPage.css';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState('primary');
  const [showDataSourceDropdown, setShowDataSourceDropdown] = useState(false);
  
  // Available data sources
  const dataSources = [
    { id: 'RCSB', name: 'RCSB' },
    { id: 'pdb', name: 'PDB' },
    { id: 'uniprot', name: 'UniProt' },
    { id: 'alphafold', name: 'AlphaFold' }
  ];

  // Debounce API calls
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 4) {
      setSuggestions([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      setLoading(true);
      const results = await searchProteins(searchQuery);
      setSuggestions(results);
      setShowSuggestions(true);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = `/results?query=${encodeURIComponent(searchQuery)}&source=${dataSource}`;
  };

  const handleSuggestionClick = (s) => {
    setSearchQuery(s);
    setShowSuggestions(false);
  };

  const handleDataSourceSelect = (sourceId) => {
    setDataSource(sourceId);
    setShowDataSourceDropdown(false);
  };

  // Get the name of the currently selected data source
  const getCurrentDataSourceName = () => {
    const source = dataSources.find(s => s.id === dataSource);
    return source ? source.name : 'Primary Database';
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="search-header">
          <h1 className="app-title">Protein Master</h1>
          <p className="app-subtitle">Search for protein structure visualization</p>
        </div>
        
        <form onSubmit={handleSearch} className="search-form" autoComplete="off">
          <div className="search-input-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter protein name ..."
              className="search-input"
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            />
            
            <div className="search-buttons-container">
              {/* Data Source dropdown button */}
              <div className="data-source-dropdown">
                <button 
                  type="button" 
                  className="data-source-button"
                  onClick={() => setShowDataSourceDropdown(!showDataSourceDropdown)}
                  onBlur={() => setTimeout(() => setShowDataSourceDropdown(false), 150)}
                >
                  {getCurrentDataSourceName()}
                  <span className="dropdown-arrow">▼</span>
                </button>
                
                {showDataSourceDropdown && (
                  <ul className="data-source-options">
                    {dataSources.map((source) => (
                      <li 
                        key={source.id} 
                        onClick={() => handleDataSourceSelect(source.id)}
                        className={dataSource === source.id ? 'selected' : ''}
                      >
                        {source.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              {/* Search button */}
              <button type="submit" className="search-button">
                Search
              </button>
            </div>
          </div>
          
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {suggestions.map((s) => (
                <li
                  key={s}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s}
                </li>
              ))}
              {loading && <li className="suggestion-item">Loading...</li>}
            </ul>
          )}
        </form>
        
        <div className="search-footer">
          <p>Find 3D and 2D visualizations about proteins</p>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
