// src/AlignPdbViewer.js
import React, { useState, useEffect, useRef } from 'react';
import { alignProteins } from './services/ProteinService';

const AlignPdbViewer = ({
  pdbId,
  secondPdbId,
  db = 'rcsb',
  height = '350px',
  proteinDataUpdateHandle = null
}) => {
  const [struct1,  setStruct1]  = useState(null);
  const [aligned2, setAligned2] = useState(null);
  const [error,    setError]    = useState('');
  const containerRef = useRef(null);

  // 1) Fetch the initial PDB structure
  useEffect(() => {
    if (!pdbId) return;
    (async () => {
      try {
        const url = `https://files.rcsb.org/download/${pdbId.toUpperCase()}.pdb`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Failed to fetch ${pdbId}`);
        const text = await resp.text();
        setStruct1(text);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [pdbId]);

  // 2) Auto‑align when both struct1 & secondPdbId are present
  useEffect(() => {
    if (!struct1 || !secondPdbId) return;
    (async () => {
      setError('');
      try {
        const { aligned1, aligned2 } = await alignProteins(pdbId, secondPdbId, db);
        setStruct1(aligned1);
        setAligned2(aligned2);

        // inform parent that we have secondPdbId
        proteinDataUpdateHandle?.({ secondPdbId });
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [struct1, secondPdbId, pdbId, db, proteinDataUpdateHandle]);

  // 3) Render/update the viewer whenever struct1 or aligned2 change
  useEffect(() => {
    if (!struct1 || !containerRef.current) return;
    const viewer = window.$3Dmol.createViewer(containerRef.current, {
      backgroundColor: 'white'
    });
    viewer.addModel(struct1, 'pdb');
    viewer.setStyle({ model: 0 }, { cartoon: { color: 'red' } });
    if (aligned2) {
      viewer.addModel(aligned2, 'pdb');
      viewer.setStyle({ model: 1 }, { cartoon: { color: 'blue' } });
    }
    viewer.zoomTo();
    viewer.render();
  }, [struct1, aligned2]);

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      {/* 3Dmol viewer container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #ccc'
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
