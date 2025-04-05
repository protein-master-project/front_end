import React, { useState, useEffect } from 'react';
import './ResultsPage.css';
import MolstarViewer from './MolstarViewer';
import MatrixViewer from './MatrixViewer';
import ContactMatrixViewer from './ContactMatrixViewer';
import { getPdbBlobURL } from "./services/ProteinService"
import ProteinData from './ProteinData'

const ResultsPage = () => {
  const [query, setQuery] = useState('');
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
    
    const fetchData = async () => {
      setLoading(true);
      
      const proteinId = searchQuery?.toLowerCase() || 'unknown';
      let pdbId = searchQuery; 
      let pdbBlobUrl =await getPdbBlobURL(pdbId);

      setTimeout(() => {
        // setProteinData({
        //   name: searchQuery || 'Trypsin',
        //   id: pdbId,
        //   description: `A protein structure visualization for ${searchQuery || 'Trypsin'} using Mol* viewer`,
        //   pdbId: pdbId,
        //   pdbBlobUrl: pdbBlobUrl
        // }
        // );
        
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
  
  const handleNewSearch = () => {
    window.location.href = '/';
  };

  // const sampleMatrix = [
  //   [0.1, 0.2, 0.5, 0.8],
  //   [0.3, 0.6, 0.7, 0.9],
  //   [0.4, 0.2, 0.1, 0.3],
  //   [0.9, 0.8, 0.7, 0.4]
  // ];
  
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
                    pdbUrl={proteinData.pdbUrl} 
                    proteinData={proteinData}
                    viewType="structure"
                    height="250px"
                  />
                </div>
              </div>
              {/* <div className="image-card">
                <div className="image-header">Surface View</div>
                <div className="protein-image">
                  <MatrixViewer 
                    matrix={sampleMatrix}
                    cellSize={30}
                    colorRange={{ min: 0, max: 1 }}
                  />
                </div>
              </div> */}
              <div className="image-card">
                <div className="image-header">Contact Matrix</div>
                <div className="protein-image">
                  <ContactMatrixViewer 
                    pdbUrl={proteinData.pdbUrl}
                    pdbId={proteinData.pdbId}
                    threshold={10.0}
                    width={250}
                    height={250}
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
