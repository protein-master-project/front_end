// src/CompareProteinsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './ResultsPage.css';

import AlignPdbViewer from './AlignPdbViewer';
import ContactMatrixViewer from './ContactMatrixViewer';
import BarContrastView from './BarContrastView';
import { getPdbBlobURL } from './services/ProteinService';
import ProteinData from './ProteinData';

const CompareProteinsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [protein1Id, setProtein1Id] = useState('');
  const [protein2Id, setProtein2Id] = useState('');
  const [loading, setLoading] = useState(true);
  const [protein1Data, setProtein1Data] = useState(new ProteinData());
  const [protein2Data, setProtein2Data] = useState(new ProteinData());
  const [comparisonText, setComparisonText] = useState('');

  useEffect(() => {
    const p1 = searchParams.get('protein1') || '';
    const p2 = searchParams.get('protein2') || '';
    setProtein1Id(p1);
    setProtein2Id(p2);

    const fetchData = async () => {
      setLoading(true);

      if (p1 && !p2) {
        const url1 = await getPdbBlobURL(p1);
        setProtein1Data(new ProteinData(p1, `Structure for ${p1}`, url1, p1, [], []));
        setLoading(false);
        return;
      }

      const [url1, url2] = await Promise.all([
        getPdbBlobURL(p1),
        getPdbBlobURL(p2)
      ]);
      setProtein1Data(new ProteinData(p1, `Structure for ${p1}`, url1, p1, [], []));
      setProtein2Data(new ProteinData(p2, `Structure for ${p2}`, url2, p2, [], []));
      setComparisonText(
        `Comparing ${p1} vs ${p2}: core‐domain alignment is strong, with notable differences in the loop regions.`
      );
      setLoading(false);
    };

    fetchData();
  }, [searchParams]);

  const handleSearchChange = e => setProtein2Id(e.target.value);
  const handleAddProtein2 = () => {
    if (!protein2Id.trim()) return;
    navigate(
      `/compare?protein1=${encodeURIComponent(protein1Id)}&protein2=${encodeURIComponent(protein2Id)}`
    );
  };
  const handleBackToSingleView = () => {
    navigate(`/results?query=${encodeURIComponent(protein1Id)}`);
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

        {/* Header & second‐protein form */}
        <div className="results-header">
          <h1 className="logo-text">Protein Master</h1>
          {!searchParams.get('protein2') && (
            <form
              className="search-bar"
              onSubmit={e => {
                e.preventDefault();
                handleAddProtein2();
              }}
            >
              <input
                type="text"
                value={protein2Id}
                onChange={handleSearchChange}
                placeholder="Enter second protein ID"
                className="search-input-small"
                autoFocus
              />
              <button type="submit" className="search-button-small">
                Compare
              </button>
            </form>
          )}
        </div>

        <div className="results-content">
          <div className="protein-header compare-header">
            <h2 className="protein-name">
              {protein1Id}{protein2Id && ` vs ${protein2Id}`}
            </h2>
            <button onClick={handleBackToSingleView} className="back-button">
              Back to Single View
            </button>
          </div>

          <div className="visualization-section">
            <h3 className="section-title">Protein Comparison</h3>

            {!protein2Id ? (
              <div className="select-second-protein">
                <p>Please enter a second protein ID to compare with {protein1Id}.</p>
              </div>
            ) : (
              <div
                className="visualization-grid compare-proteins-layout"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gridGap: '16px'
                }}
              >

                {/* ↓↓↓ Row 1: ALIGNMENT + TEXT ↓↓↓ */}
                <div className="visualization-card">
                  <div className="visualization-header">Alignment View</div>
                  <AlignPdbViewer
                      pdbId={protein1Id}
                      secondPdbId={protein2Id}
                      height="350px"
                      proteinDataUpdateHandle={data =>
                        setProtein2Data(prev => ({ ...prev, ...data }))
                      }
                    />

                </div>
                <div className="visualization-card">
                  <div className="visualization-header">Comparison Analysis</div>
                  <div className="protein-visualization">
                    <div className="comparison-text">{comparisonText}</div>
                  </div>
                </div>

                {/* ↓↓↓ Row 2: CONTACT MAPS ↓↓↓ */}
                <div className="visualization-card">
                  <div className="visualization-header">Contact Matrix: {protein1Id}</div>
                  <ContactMatrixViewer
                    pdbUrl={protein1Data.pdbUrl}
                    pdbId={protein1Data.pdbId}
                    threshold={10}
                    width={350}
                    height={350}
                    proteinData={protein1Data}
                    proteinDataUpdateHandle={data =>
                      setProtein1Data(prev => ({ ...prev, ...data }))
                    }
                  />
                </div>
                <div className="visualization-card">
                  <div className="visualization-header">Contact Matrix: {protein2Id}</div>
                  <ContactMatrixViewer
                    pdbUrl={protein2Data.pdbUrl}
                    pdbId={protein2Data.pdbId}
                    threshold={10}
                    width={350}
                    height={350}
                    proteinData={protein2Data}
                    proteinDataUpdateHandle={data =>
                      setProtein2Data(prev => ({ ...prev, ...data }))
                    }
                  />
                </div>

                {/* ↓↓↓ Row 3: BAR CONTRAST (full‑width) ↓↓↓ */}
                <div className="visualization-card" style={{ gridColumn: '1 / -1' }}>
                  <div className="visualization-header">Bar Contrast View</div>
                  <BarContrastView
                    proteinData={protein1Data}
                    secondProteinData={protein2Data}
                    proteinDataUpdateHandle={data => {
                      console.log('Updating protein data with:', data);
                      setProtein1Data(prev => ({ ...prev, ...data }));
                    }}
                  />
                </div>

              </div>
            )}
          </div>

          <div className="results-footer">
            <div className="footer-note">
              Note: Prototype using Mol* and 3Dmol.js. Data from RCSB PDB.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareProteinsPage;


