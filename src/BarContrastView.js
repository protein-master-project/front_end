import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './BarContrastView.css';
import { fetchBarContrast } from './services/ProteinService';

const BarContrastView = ({ 
  proteinData = null,
  secondProteinData = null,
  proteinDataUpdateHandle = null
}) => {
  const pdb1 = proteinData?.pdbId;
  const pdb2 = secondProteinData?.pdbId;
  const [datasets, setDatasets] = useState([]);
  const [highlightedResidue, setHighlightedResidue] = useState(null);
  const [hoveredResidue, setHoveredResidue] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!pdb1) return;
    fetchBarContrast(pdb1, pdb2)
      .then(data => setDatasets(data))
      .catch(err => console.error(err));
  }, [pdb1, pdb2]);

  useEffect(() => {
    if (!datasets.length) return;
    renderSecondaryStructure();
  }, [datasets, proteinData, highlightedResidue, hoveredResidue]);

  function handleResidueClick(residueIndex) {
    if (!proteinDataUpdateHandle) return;
    
    // If clicking the same residue that's already selected, clear the selection
    if (residueIndex === highlightedResidue) {
      setHighlightedResidue(null);
      proteinDataUpdateHandle({
        selectedAtomRange: null,
        selectedAtom: null,
        queryLanguage: null,
        queryCode: null,
        selectedResidues: []
      });
      return;
    }

    setHighlightedResidue(residueIndex);
    proteinDataUpdateHandle({
      selectedAtomRange: null,
      selectedAtom: null,
      queryLanguage: null,
      queryCode: null,
      selectedResidues: [residueIndex]
    });
  }

  function handleResidueHover(residueIndex) {
    setHoveredResidue(residueIndex);

    if (!highlightedResidue) {
      proteinDataUpdateHandle({
        selectedAtomRange: null,
        selectedAtom: null,
        queryLanguage: null,
        queryCode: null,
        selectedResidues: [residueIndex]
      });
    }
  }

  function getResidueStyle(d, color) {
    if (d === highlightedResidue) {
      return {
        fill: '#00ff00',
        stroke: '#000000',
        strokeWidth: 1
      };
    } else if (d === hoveredResidue) {
      return {
        fill: '#ff00ff',
        stroke: '#000000',
        strokeWidth: 1
      };
    }
    return {
      fill: color,
      stroke: 'none',
      strokeWidth: 0
    };
  }

  function renderSecondaryStructure() {
    const maxResidue = Math.max(
      ...datasets.flatMap(d => [...d.helix, ...d.strand, ...d.turn]),
      200
    );

    const labels = ['helix', 'strand', 'turn'];
    const colors = {
      helix: '#ff4040',
      strand: '#ffd700',
      turn: '#4040ff'
    };

    labels.forEach(label => {
      drawBar(label, datasets.map(d => d[label]), label, colors[label]);
    });

    function drawBar(type, valuesArray, idPrefix, color) {
      valuesArray.forEach((values, i) => {
        const id = `${idPrefix}${i + 1}`;
        const svg = d3.select(`#${id}`)
          .selectAll('svg').data([null]).join('svg')
          .attr('width', 600)
          .attr('height', 20);

        svg.selectAll('rect')
          .data(values)
          .join('rect')
          .attr('x', d => (d / maxResidue) * 600)
          .attr('y', 0)
          .attr('width', 2)
          .attr('height', 20)
          .attr('fill', d => getResidueStyle(d, color).fill)
          .attr('stroke', d => getResidueStyle(d, color).stroke)
          .attr('stroke-width', d => getResidueStyle(d, color).strokeWidth)
          .on('click', (event, d) => handleResidueClick(d))
          .on('mouseover', (event, d) => handleResidueHover(d))
          .on('mouseout', () => handleResidueHover(null));
      });
    }
  }

  return (
    <div className="ssc-container" ref={containerRef}>
      <h3>Secondary Structure Comparison</h3>

      <div className="ssc-row">
        <span className="structure-label">Helix ({pdb1})</span>
        <div id="helix1" className="structure-bar"></div>
      </div>
      {pdb2 && (
        <div className="ssc-row">
          <span className="structure-label">Helix ({pdb2})</span>
          <div id="helix2" className="structure-bar"></div>
        </div>
      )}

      <div className="ssc-row">
        <span className="structure-label">Beta strand ({pdb1})</span>
        <div id="strand1" className="structure-bar"></div>
      </div>
      {pdb2 && (
        <div className="ssc-row">
          <span className="structure-label">Beta strand ({pdb2})</span>
          <div id="strand2" className="structure-bar"></div>
        </div>
      )}

      <div className="ssc-row">
        <span className="structure-label">Turn ({pdb1})</span>
        <div id="turn1" className="structure-bar"></div>
      </div>
      {pdb2 && (
        <div className="ssc-row">
          <span className="structure-label">Turn ({pdb2})</span>
          <div id="turn2" className="structure-bar"></div>
        </div>
      )}
    </div>
  );
};

export default BarContrastView;
