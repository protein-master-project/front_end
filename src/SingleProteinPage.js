import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import './ResultsPage.css';
import MolstarViewer from './MolstarViewer';
import ContactMatrixViewer from './ContactMatrixViewer';
import QueryAgentView from './QueryAgentView';
import BarContrastView from './BarContrastView';
import { getPdbBlobURL } from './services/ProteinService';
import ProteinData from './ProteinData';

const SingleProteinPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [miniSearchQuery, setMiniSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [proteinData, setProteinData] = useState(new ProteinData());
  
  // Debug information
  console.log("Current path:", location.pathname);
  console.log("Query params:", Object.fromEntries(searchParams.entries()));

  useEffect(() => {
    const searchQuery = searchParams.get('query');
    setMiniSearchQuery(searchQuery);

    const fetchData = async () => {
      setLoading(true);
      const pdbId = searchQuery;
      const pdbBlobUrl = await getPdbBlobURL(pdbId);

      setTimeout(() => {
        const newProteinData = new ProteinData(
          searchQuery || 'Trypsin',
          `A protein structure visualization for ${searchQuery || 'Trypsin'} using Mol* viewer`,
          pdbBlobUrl,
          pdbId,
          [],
          []
        );
        setProteinData(newProteinData);
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, [searchParams]);

  const handleProteinDataUpdate = (newData) => {
    setProteinData(prev => ({ ...prev, ...newData }));
  };

  const handleMiniSearchChange = (e) => setMiniSearchQuery(e.target.value);
  
  const handleNewSearch = () => {
    if (miniSearchQuery.trim()) {
      // Try to preserve the original URL structure as used in SearchPage.js
      navigate(`/results?query=${encodeURIComponent(miniSearchQuery)}`);
    }
  };

   const handleCompareClick = () => {
       const id = proteinData.pdbId;
      navigate(`/compare?protein1=${encodeURIComponent(id)}`);
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
            <button onClick={handleNewSearch} className="search-button-small">Search</button>
          </div>
        </div>

        <div className="results-content">
          <div className="protein-header">
            <h2 className="protein-name">{proteinData.name}</h2>
            <div className="protein-id">{proteinData.id}</div>
            <p className="protein-description">{proteinData.description}</p>
            <button onClick={handleCompareClick} className="compare-button">Compare With Another Protein</button>
          </div>

          <div className="visualization-section">
            <h3 className="section-title">Protein Visualization</h3>
            <div className="visualization-grid single-protein-layout">
              {/* MolStar View */}
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

              {/* ContactMap View */}
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

              {/* QueryAgentView - Wide */}
              <div className="visualization-card wide">
                <div className="visualization-header">MolScript AI Editor</div>
                <div className="protein-visualization query-agent">
                  <QueryAgentView
                    proteinData={proteinData}
                    proteinDataUpdateHandle={handleProteinDataUpdate}
                  />
                </div>
              </div>

              {/* BarContrastView */}
              <div className="visualization-card wide">
                <div className="visualization-header">Bar Contrast View</div>
                <div className="protein-visualization bar-contrast">
                  <BarContrastView
                    proteinData={proteinData}
                    proteinDataUpdateHandle={handleProteinDataUpdate}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="results-footer">
            <div className="footer-note">
              Note: This is a prototype using Mol* for 3D visualization. Data from RCSB PDB.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProteinPage;