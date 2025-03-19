import React, { useState, useEffect } from 'react';
import './ResultsPage.css';

const ResultsPage = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [proteinData, setProteinData] = useState(null);
  
  useEffect(() => {
    // Get query parameter from URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('query');
    setQuery(searchQuery);
    
    // In a real application, you would fetch actual protein data here
    // For this example, we'll simulate a data fetch
    const fetchData = async () => {
      setLoading(true);
      
      // Simulating API call with timeout
      setTimeout(() => {
        // Mock data
        setProteinData({
          name: searchQuery || 'Unknown Protein',
          id: 'P' + Math.floor(Math.random() * 100000),
          description: 'A protein involved in cellular function',
          images: [
            '/api/placeholder/400/300', // Using placeholder images
            '/api/placeholder/400/300'
          ]
        });
        setLoading(false);
      }, 1000);
    };
    // const fetchData = async () => {
    //     try {
    //       setLoading(true);
    //       const response = await fetch(`https://your-api.com/proteins?query=${searchQuery}`);
    //       const data = await response.json();
    //       setProteinData(data);
    //     } catch (error) {
    //       console.error("Error fetching protein data:", error);
    //       // Handle error state
    //     } finally {
    //       setLoading(false);
    //     }
    //   };
    
    fetchData();
  }, []);
  
  const handleNewSearch = () => {
    window.location.href = '/';
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-text">Loading...</div>
          <p className="loading-subtext">Fetching protein information</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="results-page">
      <div className="results-container">
        <div className="results-header">
          <div className="logo">
            <h1 className="logo-text">Protein Master</h1>
          </div>
          <div className="search-bar">
            <input
              type="text"
              defaultValue={query}
              className="search-input-small"
            />
            <button 
              onClick={handleNewSearch}
              className="search-button-small"
            >
              Search
            </button>
          </div>
        </div>
        
        <div className="results-content">
          <div className="protein-header">
            <h2 className="protein-name">{proteinData.name}</h2>
            <div className="protein-id">{proteinData.id}</div>
            <p className="protein-description">{proteinData.description}</p>
          </div>
          
          <div className="visualization-section">
            <h3 className="section-title">Protein Visualization</h3>
            <div className="image-grid">
              <div className="image-card">
                <div className="image-header">Structure View</div>
                <img 
                  src={proteinData.images[0]} 
                  alt="Protein Structure" 
                  className="protein-image"
                />
              </div>
              <div className="image-card">
                <div className="image-header">Surface View</div>
                <img 
                  src={proteinData.images[1]} 
                  alt="Protein Surface" 
                  className="protein-image"
                />
              </div>
            </div>
          </div>
          
          <div className="results-footer">
            <div className="footer-note">
              Note: This is a demonstration of the Protein Master interface. In a real application, actual protein data and images would be displayed.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;