import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './BarContrastView.css';
import { fetchBarContrast } from './services/ProteinService';

const BarContrastView = ({ 
  proteinData = null,
  proteinDataUpdateHandle = null
}) => {

  let pdb1 = proteinData.pdbId
  let pdb2 = proteinData.secondPdbId

  const [datasets, setDatasets] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchBarContrast(pdb1, pdb2)
      .then(data => setDatasets(data))
      .catch(err => console.error(err));
  }, [pdb1, pdb2]);

  useEffect(() => {
    if (!datasets.length) return;
    renderSecondaryStructure();
    console.log(datasets)
  }, [datasets]);


  function renderSecondaryStructure() {
    const maxResidue = Math.max(
      ...datasets.flatMap(d => [...d.helix, ...d.strand, ...d.turn]),
      200
    );

    drawBar('helix',  datasets, ['helix1','helix2'],  '#ff4040');
    drawBar('strand', datasets, ['strand1','strand2'], '#ffd700');
    drawBar('turn',   datasets, ['turn1','turn2'],   '#4040ff');

    function drawBar(type, dataArr, idArr, color) {
      dataArr.forEach((data, i) => {
        const id = idArr[i];
        if (!id) return;
        const svg = d3.select(`#${id}`)
          .selectAll('svg').data([null]).join('svg')
          .attr('width', 600)
          .attr('height', 20);

        svg.selectAll('rect')
          .data(data[type])
          .join('rect')
          .attr('x', d => (d / maxResidue) * 600)
          .attr('y', 0)
          .attr('width', 2)
          .attr('height', 20)
          .attr('fill', color);
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
      <div className="ssc-row">
        <span className="structure-label">Helix ({pdb2})</span>
        <div id="helix2" className="structure-bar"></div>
      </div>
      <div className="ssc-row">
        <span className="structure-label">Beta strand ({pdb1})</span>
        <div id="strand1" className="structure-bar"></div>
      </div>
      <div className="ssc-row">
        <span className="structure-label">Beta strand ({pdb2})</span>
        <div id="strand2" className="structure-bar"></div>
      </div>
      <div className="ssc-row">
        <span className="structure-label">Turn ({pdb1})</span>
        <div id="turn1" className="structure-bar"></div>
      </div>
      <div className="ssc-row">
        <span className="structure-label">Turn ({pdb2})</span>
        <div id="turn2" className="structure-bar"></div>
      </div>
    </div>
  );
};

export default BarContrastView;
