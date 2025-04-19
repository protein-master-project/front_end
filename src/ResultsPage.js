import React, { useState, useEffect } from 'react';
import './ResultsPage.css';
import MolstarViewer from './MolstarViewer';
import ContactMatrixViewer from './ContactMatrixViewer';
import AlignPdbViewer from './AlignPdbViewer';
import QueryView from './QueryView';
import QueryAgentView from './QueryAgentView';
import { getPdbBlobURL } from './services/ProteinService';
import ProteinData from './ProteinData';

// views
const AVAILABLE_VIEWS = [
  {
    key: 'structure',
    title: 'Structure View',
    component: (data, onUpdate) => (
      <MolstarViewer
        pdbId={data.pdbId}
        pdbUrl={data.pdbUrl}
        proteinData={data}
        viewType="structure"
        height="350px"
      />
    ),
  },
  {
    key: 'contact',
    title: 'Contact Matrix',
    component: (data, onUpdate) => (
      <ContactMatrixViewer
        pdbUrl={data.pdbUrl}
        pdbId={data.pdbId}
        threshold={10.0}
        width={350}
        height={350}
        proteinData={data}
        proteinDataUpdateHandle={onUpdate}
      />
    ),
  },
  {
    key: 'align',
    title: 'Alignment View',
    component: (data) => (
      <AlignPdbViewer
        pdbId={data.pdbId}
        pdbUrl={data.pdbUrl}
        db="rcsb"
        height="350px"
      />
    ),
  },
  {
    key: 'query',
    title: 'MolScript Editor',
    component: (data, onUpdate) => (
      <QueryView
        proteinData={data}
        proteinDataUpdateHandle={onUpdate}
      />
    ),
  },
  {
    key: 'query_ai',
    title: 'MolScript AI Editor',
    component: (data, onUpdate) => (
      <QueryAgentView
        proteinData={data}
        proteinDataUpdateHandle={onUpdate}
      />
    ),
  }
];

const ResultsPage = () => {
  const [query, setQuery] = useState('');
  const [miniSearchQuery, setMiniSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [proteinData, setProteinData] = useState(new ProteinData());

  // const [vizConfigs, setVizConfigs] = useState(
  //   AVAILABLE_VIEWS.map(view => ({ key: `${view.key}-${view.key}`, viewKey: view.key, title: view.title }))
  // );
  const [vizConfigs, setVizConfigs] = useState(
    AVAILABLE_VIEWS
      .slice(0, 2) 
      .map(view => ({
        key: `${view.key}-${view.key}`,
        viewKey: view.key,
        title: view.title
      }))
  );
  

  const [selectedView, setSelectedView] = useState('');

  const handleProteinDataUpdate = (newData) => {
    setProteinData(prev => ({ ...prev, ...newData }));
  };


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('query');
    setQuery(searchQuery);
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
  }, []);


  const handleMiniSearchChange = (e) => setMiniSearchQuery(e.target.value);
  const handleNewSearch = () => {
    if (miniSearchQuery.trim()) {
      window.location.href = `/results?query=${encodeURIComponent(miniSearchQuery)}`;
    }
  };


  // add view
  const handleAddView = (e) => {
    const viewKey = e.target.value;
    const view = AVAILABLE_VIEWS.find(v => v.key === viewKey);
    if (view) {
      setVizConfigs(prev => [
        ...prev,
        { key: `${view.key}-${Date.now()}`, viewKey: view.key, title: view.title }
      ]);
    }
    // setSelectedView(AVAILABLE_VIEWS[0].key);
    setSelectedView('');
  };


  // remove view
  const handleRemoveView = (index) => {
    setVizConfigs(prev => prev.filter((_, i) => i !== index));
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

          {/* view selection */}
          <div className="view-selector">
            <select value={selectedView} onChange={handleAddView}>
              <option value="" disabled>Add view</option>
              {AVAILABLE_VIEWS.map(view => (
                <option key={view.key} value={view.key}>
                  {view.title}
                </option>
              ))}
            </select>
          </div>

          {/* view search var */}
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

          {/* view visualization-cards */}
        <div className="results-content">
          <div className="protein-header">
            <h2 className="protein-name">{proteinData.name}</h2>
            <div className="protein-id">{proteinData.id}</div>
            <p className="protein-description">{proteinData.description}</p>
          </div>

          <div className="visualization-section">
            <h3 className="section-title">Protein Visualization</h3>
            <div className="visualization-grid">

              {vizConfigs.map((cfg, idx) => {
                const viewDef = AVAILABLE_VIEWS.find(v => v.key === cfg.viewKey);
                // return (
                  // <div className="visualization-card" key={cfg.key}>
                const isQuery = cfg.viewKey === 'query_ai';
                return (
                    <div
                      className={`visualization-card ${isQuery ? 'wide' : ''}`}
                      key={cfg.key}
                    >
                    <div className="visualization-header">
                      {cfg.title}
                      <button className="remove-button" onClick={() => handleRemoveView(idx)}>✕</button>
                    </div>
                    <div className="protein-visualization">
                      {viewDef.component(proteinData, handleProteinDataUpdate)}
                    </div>
                  </div>
                );
              })}
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

export default ResultsPage;