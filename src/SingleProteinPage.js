import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import './ResultsPage.css';
import MolstarViewer from './MolstarViewer';
import ContactMatrixViewer from './ContactMatrixViewer';
import QueryAgentView from './QueryAgentView';
import BarContrastView from './BarContrastView';
import { getPdbBlobURL, fetchPdbInfo } from './services/ProteinService';
import ProteinData from './ProteinData';
import logo from './logo.png';

import { DarkModeProvider, useDarkMode } from "@rbnd/react-dark-mode"
// import { Button } from "@rbnd/react-dark-mode" // Assuming Button is from the same library

const SingleProteinPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [miniSearchQuery, setMiniSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [proteinData, setProteinData] = useState(new ProteinData());
  
  // Add state for collapsible sections
  const [isStructureViewOpen, setIsStructureViewOpen] = useState(true);
  const [isContactMatrixOpen, setIsContactMatrixOpen] = useState(true);
  const [isMolScriptOpen, setIsMolScriptOpen] = useState(true);
  const [isBarContrastOpen, setIsBarContrastOpen] = useState(true);

  // const { mode, setMode } = useDarkMode()

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

      const pdbInfo = await fetchPdbInfo(pdbId);
      console.log("pdbInfo"+pdbInfo)
      const firstCitation = pdbInfo?.citation?.[0] ?? {};
      const citationTitle = firstCitation.title ?? `Protein ${pdbId}`;
      const doi = firstCitation.pdbx_database_id_DOI;
      const description = `
        ${citationTitle}${doi ? ` (<a href="https://doi.org/${doi}" target="_blank" style="color: grey;">DOI</a>)` : ''}
        — <a href="https://www.rcsb.org/structure/${pdbId}" target="_blank" style="color: grey;">RCSB PDB</a>
      `;

      setTimeout(() => {
        const newProteinData = new ProteinData(
          searchQuery || 'Trypsin',
          description,
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
    <DarkModeProvider>
    <div className="results-page">
      <div className="results-container">
        <div className="results-header">
          <div className="logo">
            <img src={logo} alt="Protein Master logo" className="logo-image" />
            <h1 className="logo-text">Protein Master</h1>
          </div>

          <div className="header-actions">
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
        <button onClick={handleCompareClick} className="compare-button">Compare With Another Protein</button>
        </div>

        {/* <Button
          onClick={() => setMode("dark")}
          active={mode === "dark"}>
          Dark
        </Button> */}

        <div className="results-content">
          <div className="protein-header">
            <h2 className="protein-name">{proteinData.name}</h2>
            <div className="protein-id">{proteinData.id}</div>
            {/* <p className="protein-description">{proteinData.description}</p> */}
            <p
              className="protein-description"
              dangerouslySetInnerHTML={{ __html: proteinData.description }}
            />
          </div>
          
          <div className="visualization-section">
            <div className="visualization-grid single-protein-layout">
              {/* MolStar View */}
              <div className="visualization-card">
                <div className="visualization-header">
                  Structure View
                  <button 
                    className="collapse-button"
                    onClick={() => setIsStructureViewOpen(!isStructureViewOpen)}
                  >
                    {isStructureViewOpen ? '−' : '+'}
                  </button>
                </div>
                {isStructureViewOpen && (
                  <div className="protein-visualization">
                    <MolstarViewer
                      pdbId={proteinData.pdbId}
                      pdbUrl={proteinData.pdbUrl}
                      proteinData={proteinData}
                      viewType="structure"
                      height="350px"
                    />
                  </div>
                )}
              </div>

              {/* ContactMap View */}
              <div className="visualization-card">
                <div className="visualization-header">
                  Contact Matrix
                  <button 
                    className="collapse-button"
                    onClick={() => setIsContactMatrixOpen(!isContactMatrixOpen)}
                  >
                    {isContactMatrixOpen ? '−' : '+'}
                  </button>
                </div>
                {isContactMatrixOpen && (
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
                )}
              </div>

              {/* QueryAgentView - Wide */}
              <div className="visualization-card wide">
                <div className="visualization-header">
                  MolScript AI Editor
                  <button 
                    className="collapse-button"
                    onClick={() => setIsMolScriptOpen(!isMolScriptOpen)}
                  >
                    {isMolScriptOpen ? '−' : '+'}
                  </button>
                </div>
                {isMolScriptOpen && (
                  <div className="protein-visualization query-agent">
                    <QueryAgentView
                      proteinData={proteinData}
                      proteinDataUpdateHandle={handleProteinDataUpdate}
                    />
                  </div>
                )}
              </div>

              {/* BarContrastView */}
              <div className="visualization-card wide">
                <div className="visualization-header">
                  Bar Contrast View
                  <button 
                    className="collapse-button"
                    onClick={() => setIsBarContrastOpen(!isBarContrastOpen)}
                  >
                    {isBarContrastOpen ? '−' : '+'}
                  </button>
                </div>
                {isBarContrastOpen && (
                  <div className="protein-visualization bar-contrast one-protein">
                    <BarContrastView
                      proteinData={proteinData}
                      proteinDataUpdateHandle={handleProteinDataUpdate}
                    />
                  </div>
                )}
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
    </DarkModeProvider>
  );
};

export default SingleProteinPage;