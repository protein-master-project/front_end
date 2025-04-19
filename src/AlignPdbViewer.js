// src/AlignPdbViewer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { alignProteins } from './services/ProteinService';  // Helper to call the backend alignment API

const AlignPdbViewer = ({ 
  pdbId, 
  db = 'rcsb', 
  height = '350px',
  proteinData = null,
  proteinDataUpdateHandle = null}) => {
  const [secondId, setSecondId] = useState('');
  const [struct1, setStruct1] = useState(null);
  const [aligned2, setAligned2] = useState(null);
  const [error, setError] = useState('');
  const containerRef = useRef(null);

  // 1) Fetch the initial PDB structure
  useEffect(() => {
    const fetchPdb = async () => {
      try {
        const url = `https://files.rcsb.org/download/${pdbId.toUpperCase()}.pdb`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Failed to fetch ${pdbId}`);
        const text = await resp.text();
        setStruct1(text);
      } catch (e) {
        setError(e.message);
      }
    };
    fetchPdb();
  }, [pdbId]);

  // 2) Perform alignment using the backend
  const doAlign = async () => {
    if (!secondId) return;
    setError('');
    try {
      const { aligned1, aligned2 } = await alignProteins(pdbId, secondId, db);
      setStruct1(aligned1);
      setAligned2(aligned2);

      console.log("update secondId:" + secondId)
      proteinDataUpdateHandle({
        secondPdbId: secondId
      })

    } catch (e) {
      setError(e.message);
    }
  };

  // 3) Update viewer whenever the structures change
  useEffect(() => {
    if (!struct1 || !containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = ''; // Clear previous rendering
    // eslint-disable-next-line no-undef
    const viewer = $3Dmol.createViewer(container, {
      backgroundColor: 'white'
    });

    // Load the first model
    viewer.addModel(struct1, 'pdb');
    viewer.setStyle({ model: 0 }, { cartoon: { color: 'red' } });

    // If aligned2 exists, load it as the second model
    if (aligned2) {
      viewer.addModel(aligned2, 'pdb');
      viewer.setStyle({ model: 1 }, { cartoon: { color: 'blue' } });
    }

    viewer.zoomTo();
    viewer.render();
  }, [struct1, aligned2]);

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      {/* Alignment input panel */}
      <div style={{
        position: 'absolute',
        top: 8, right: 8,
        background: 'rgba(255,255,255,0.9)',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        gap: '4px',
        zIndex: 10
      }}>
        <input
          type="text"
          placeholder="Second PDB ID"
          value={secondId}
          onChange={e => setSecondId(e.target.value.trim())}
          onKeyDown={e => e.key === 'Enter' && doAlign()}
          style={{ width: '100px', padding: '2px 4px' }}
        />
        <button onClick={doAlign} style={{ padding: '2px 6px' }}>
          Align
        </button>
      </div>

      {/* 3Dmol viewer container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #ccc',
        }}
      />

      {/* Error display */}
      {error && (
        <div style={{
          position: 'absolute',
          bottom: 8, left: 8,
          background: 'rgba(255,255,255,0.9)',
          color: 'red',
          padding: '4px',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default AlignPdbViewer;
