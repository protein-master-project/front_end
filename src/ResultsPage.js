import React, { useState, useEffect } from 'react';
import './ResultsPage.css';
import MolstarViewer from './MolstarViewer';
import MatrixViewer from './MatrixViewer';
import ContactMatrixViewer from './ContactMatrixViewer';
import { getPdbBlobURL } from "./services/ProteinService"
import ProteinData from './ProteinData'

const ResultsPage = () => {
  const [query, setQuery] = useState('');
  const [miniSearchQuery, setMiniSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [proteinData, setProteinData] = useState(new ProteinData());

  const handleProteinDataUpdate = (newData) => {
    setProteinData(prevData => ({
      ...prevData,
      ...newData,
    }));
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('query');
    setQuery(searchQuery);
    setMiniSearchQuery(searchQuery); // Initialize mini search with current query
    
    const fetchData = async () => {
      setLoading(true);
      
      const proteinId = searchQuery?.toLowerCase() || 'unknown';
      let pdbId = searchQuery; 
      let pdbBlobUrl = await getPdbBlobURL(pdbId);

      setTimeout(() => {
        const newProteinData = new ProteinData(
          searchQuery || 'Trypsin',
          `A protein structure visualization for ${searchQuery || 'Trypsin'} using Mol* viewer`,
          pdbBlobUrl,
          pdbId,
          [], 
          []
        );

        console.log(newProteinData);
        setProteinData(newProteinData);
        setLoading(false);
      }, 1000);
    };
    
    fetchData();
  }, []);
  
  const handleMiniSearchChange = (e) => {
    setMiniSearchQuery(e.target.value);
  };

  const handleNewSearch = () => {
    if (miniSearchQuery && miniSearchQuery.trim() !== '') {
      // Redirect to the results page with the new query parameter
      window.location.href = `/results?query=${encodeURIComponent(miniSearchQuery)}`;
    }
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
              value={miniSearchQuery}
              onChange={handleMiniSearchChange}
              className="search-input-small"
              onKeyPress={(e) => e.key === 'Enter' && handleNewSearch()}
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
            <div className="visualization-grid">
              <div className="visualization-card">
                <div className="visualization-header">Structure View</div>
                <div className="protein-visualization">
                  <MolstarViewer 
                    pdbId={proteinData.pdbId} 
                    pdbUrl={proteinData.pdbUrl} 
                    proteinData={proteinData}
                    viewType="structure"
                    height="350px"
                  />
                </div>
              </div>
              <div className="visualization-card">
                <div className="visualization-header">Contact Matrix</div>
                <div className="protein-visualization">
                  <ContactMatrixViewer 
                    pdbUrl={proteinData.pdbUrl}
                    pdbId={proteinData.pdbId}
                    threshold={10.0}
                    width={350}
                    height={350}
                    proteinData={proteinData}
                    proteinDataUpdateHandle={handleProteinDataUpdate}
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
