import React, { useState, useEffect } from 'react';
import { searchProteins } from './services/ProteinService';
import './SearchPage.css';
import logo from './logo.png';
import { BackgroundAnimation } from './background-animation/BackgroundAnimation';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);      // Store full result objects
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState('RCSB');
  const [showDataSourceDropdown, setShowDataSourceDropdown] = useState(false);

  // Available data sources
  const dataSources = [
    { id: 'RCSB',      name: 'RCSB' },
    { id: 'uniprot',   name: 'UniProt' },
    { id: 'alphafold', name: 'AlphaFold' }
  ];

  /* ---------- Fetch autocomplete suggestions with debounce ---------- */
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 4) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // The service returns an array of result objects
        const results = await searchProteins(searchQuery, dataSource);
        setSuggestions(results.slice(0, 15)); // front‑end limit
      } catch (err) {
        console.error(err);
        setSuggestions([]);
      }
      setShowSuggestions(true);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery, dataSource]);


  /* ---------- Event handlers ---------- */
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    window.location.href =
      `/results?query=${encodeURIComponent(searchQuery)}&source=${dataSource}`;
  };

  const handleSuggestionClick = (item) => {
    setSearchQuery(item.rcsb_id);   // Fill input with selected PDB ID
    setShowSuggestions(false);
  };

  const getCurrentDataSourceName = () =>
    dataSources.find((s) => s.id === dataSource)?.name ?? 'Primary';


  /* ---------- Helpers ---------- */
  const formatExtra = (item) => {
    const method =
      item.exptl?.[0]?.method?.replace(/_/g, ' ') ?? 'Unknown method';
    const res = item.rcsb_entry_info?.resolution_combined?.[0];
    const resTxt = res ? `${res.toFixed(2)} Å` : 'N/A';
    return `${method} • ${resTxt}`;
  };


  return (
    <div className="search-page">
      <div className="background-animation-container">
        <BackgroundAnimation />
      </div>
      
      <a
        href="https://protein-master-project.github.io/"
        className="project-link"
      >
        <img src={logo} alt="Protein Master logo" className="homepage-logo" />
      </a>
      
      <div className="search-container">
        {/* Header */}
        <div className="search-header">
          {/* <h1 className="app-title">Protein Master</h1> */}
          <p className="app-subtitle">
          An Intelligent Platform for Protein Structure Retrieval and Visualization
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="search-form" autoComplete="off">
          <div className="search-input-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter protein name or PDB ID..."
              className="search-input"
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            />

            {/* Data‑source selector and search button */}
            <div className="search-buttons-container">
              <div className="data-source-dropdown">
                <button
                  type="button"
                  className="data-source-button"
                  onClick={() =>
                    setShowDataSourceDropdown(!showDataSourceDropdown)
                  }
                  onBlur={() =>
                    setTimeout(() => setShowDataSourceDropdown(false), 150)
                  }
                >
                  {getCurrentDataSourceName()}
                  <span className="dropdown-arrow">▼</span>
                </button>

                {showDataSourceDropdown && (
                  <ul className="data-source-options">
                    {dataSources.map((src) => (
                      <li
                        key={src.id}
                        onClick={() => {
                          setDataSource(src.id);
                          setShowDataSourceDropdown(false);
                        }}
                        className={dataSource === src.id ? 'selected' : ''}
                      >
                        {src.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button type="submit" className="search-button">
                Visualize
              </button>
            </div>
          </div>

          {/* Autocomplete dropdown */}
          {showSuggestions && (suggestions.length > 0 || loading) && (
            <ul className="suggestions-dropdown">
              {loading && <li className="suggestion-item">Loading…</li>}
              {suggestions.map((item) => (
                <li
                  key={item.rcsb_id}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(item)}
                >
                  <span className="sugg-id">{item.rcsb_id}</span>
                  <span className="sugg-title">
                    {item.struct?.title ?? 'Untitled'}
                  </span>
                  <span className="sugg-extra">{formatExtra(item)}</span>
                </li>
              ))}
            </ul>
          )}
        </form>

        

        {/* createRoot(document.getElementById('root')).render(<BackgroundAnimation />) */}
        {/* Footer */}
        {/* <div className="search-footer">
          <p>Find 3D and 2D visualizations about proteins</p>
          <a
            href="https://protein-master-project.github.io/"
            className="project-link"
          >
            Project Homepage
          </a>
        </div> */}
      </div>
    </div>
  );
};

export default SearchPage;
