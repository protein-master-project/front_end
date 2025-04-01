import React, { useState, useEffect } from 'react';
import './ResultsPage.css';
import MolstarViewer from './MolstarViewer';

const ResultsPage = () => {
  // State to track if MolstarViewer fails to load
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
        // Mock data with sample PDB ID
        const proteinId = searchQuery?.toLowerCase() || 'unknown';
        let pdbId = '3PTB'; // Default PDB ID
        
        // Map some common proteins to actual PDB IDs for demo purposes
        if (proteinId.includes('insulin')) pdbId = '4INS';
        else if (proteinId.includes('hemoglobin')) pdbId = '1HHO';
        else if (proteinId.includes('lysozyme')) pdbId = '1LYZ';
        else if (proteinId.includes('myoglobin')) pdbId = '1MBO';
        
        setProteinData({
          name: searchQuery || 'Trypsin',
          id: pdbId,
          description: `A protein structure visualization for ${searchQuery || 'Trypsin'} using Mol* viewer`,
          pdbId: pdbId
        });
        
        setLoading(false);
      }, 1000);
    };
    
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
                <div className="protein-image">
                    <MolstarViewer 
                      pdbId={proteinData.pdbId} 
                      viewType="structure"
                      height="300px"
                    />
                </div>
              </div>
              <div className="image-card">
                <div className="image-header">Surface View</div>
                // To fill matrix view here
                <div className="protein-image">
                    <MolstarViewer 
                      pdbId={proteinData.pdbId} 
                      viewType="surface"
                      height="300px"
                    />
                </div>
              </div>
            </div>
          </div>
          
          <div className="results-footer">
            <div className="footer-note">
              Note: This is a prototype of the Protein Master interface using Mol* for 3D protein structure visualization.
              Protein structures are loaded from the RCSB Protein Data Bank.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;