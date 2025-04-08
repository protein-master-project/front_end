import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PDBLoader } from 'three/addons/loaders/PDBLoader.js';

const ContactMatrixViewer = ({
  pdbUrl,
  pdbId,
  threshold = 10.0,
  width = 300, // Adjusted width of the canvas
  height = 300, // Adjusted height of the canvas
  proteinData = null,
  proteinDataUpdateHandle = null,
}) => {
  const canvasRef = useRef(null);
  const baseMatrixCanvasRef = useRef(document.createElement('canvas'));
  const [atomCount, setAtomCount] = useState(0);
  const [atomsData, setAtomsData] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Load and process PDB data
  useEffect(() => {
    if (!pdbUrl) return;
    
    setIsLoading(true);
    setErrorMessage('');
    
    const pdbLoader = new PDBLoader();
    
    pdbLoader.load(
      pdbUrl,
      (pdb) => {
        try {
          const atoms = pdb.json.atoms;
          setAtomsData(atoms);
          const totalAtoms = atoms.length;
          setAtomCount(totalAtoms);
          
          // Set up the offscreen base canvas
          const baseCanvas = baseMatrixCanvasRef.current;
          baseCanvas.width = totalAtoms;
          baseCanvas.height = totalAtoms;
          const baseCtx = baseCanvas.getContext('2d', { alpha: false });
          
          // Create contact matrix on the base canvas
          const imageData = baseCtx.createImageData(totalAtoms, totalAtoms);
          for (let i = 0; i < totalAtoms; i++) {
            const [xi, yi, zi] = atoms[i];
            for (let j = 0; j < totalAtoms; j++) {
              const [xj, yj, zj] = atoms[j];
              const dx = xi - xj;
              const dy = yi - yj;
              const dz = zi - zj;
              const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
              const pixelIndex = (i * totalAtoms + j) * 4;
              
              if (distance < threshold) {
                const intensity = Math.floor(((threshold - distance) / threshold) * 255);
                imageData.data[pixelIndex] = 255;                   // R
                imageData.data[pixelIndex + 1] = 255 - intensity;     // G
                imageData.data[pixelIndex + 2] = 255 - intensity;     // B
                imageData.data[pixelIndex + 3] = 255;                 // A
              } else {
                imageData.data[pixelIndex] = 255; // R
                imageData.data[pixelIndex + 1] = 255; // G
                imageData.data[pixelIndex + 2] = 255; // B
                imageData.data[pixelIndex + 3] = 255; // A
              }
            }
          }
          
          baseCtx.putImageData(imageData, 0, 0);
          renderCanvas();
          setIsLoading(false);
        } catch (error) {
          console.error('Error processing PDB data:', error);
          setErrorMessage('Error processing protein data.');
          setIsLoading(false);
        }
      },
      (xhr) => {
        const progress = xhr.total ? ((xhr.loaded / xhr.total) * 100).toFixed(0) : 'unknown';
        console.log(`Loading PDB: ${progress}%`);
      },
      (error) => {
        console.error('Error loading PDB file:', error);
        setErrorMessage('Failed to load protein data.');
        setIsLoading(false);
      }
    );
  }, [pdbUrl, pdbId, threshold]);
  
  // Main render function for the canvas
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const baseCanvas = baseMatrixCanvasRef.current;
    if (!canvas || baseCanvas.width === 0) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    
    // Set canvas dimensions
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    
    // Clear with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the contact matrix image (scaled)
    if (baseCanvas.width > 0) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        baseCanvas,
        0, 0, baseCanvas.width, baseCanvas.height,
        0, 0, canvas.width, canvas.height
      );
    }
    
    // If a cell is selected, draw the crosshair and label
    if (selectedCell && atomsData.length > 0) {
      const scaleX = canvas.width / atomCount;
      const scaleY = canvas.height / atomCount;
      const screenX = selectedCell.dataX * scaleX;
      const screenY = selectedCell.dataY * scaleY;
      
      ctx.save();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, canvas.height);
      ctx.moveTo(0, screenY);
      ctx.lineTo(canvas.width, screenY);
      ctx.stroke();
      ctx.strokeRect(screenX - 4, screenY - 4, 8, 8);
      
      if (selectedCell.dataX < atomsData.length && selectedCell.dataY < atomsData.length) {
        const [xi, yi, zi] = atomsData[selectedCell.dataX];
        const [xj, yj, zj] = atomsData[selectedCell.dataY];
        const dx = xi - xj;
        const dy = yi - yj;
        const dz = zi - zj;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        const text = `${distance.toFixed(2)}`;
        ctx.font = '14px Arial';
        const textWidth = ctx.measureText(text).width;
        
        let textX = screenX + 10;
        let textY = screenY - 10;
        if (textX + textWidth + 10 > canvas.width) textX = screenX - textWidth - 10;
        if (textY < 20) textY = screenY + 25;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(textX - 2, textY - 16, textWidth + 4, 20);
        ctx.fillStyle = '#3b82f6';
        ctx.fillText(text, textX, textY);
      }
      
      ctx.restore();
    }
  };
  
  // Re-render when state changes
  useEffect(() => {
    if (canvasRef.current) {
      renderCanvas();
    }
  }, [selectedCell, atomsData, atomCount]);
  
  // Handle canvas clicks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || atomCount === 0) return;
    
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;
      const dataX = Math.floor((canvasX / canvas.width) * atomCount);
      const dataY = Math.floor((canvasY / canvas.height) * atomCount);
      
      if (dataX >= 0 && dataX < atomCount && dataY >= 0 && dataY < atomCount) {
        setSelectedCell({ dataX, dataY });
      }

      if (typeof proteinDataUpdateHandle === 'function') {
        console.log("Selected atoms, X: " + dataX + ", Y: " + dataY);
        proteinDataUpdateHandle({ 
          selectedAtomRange: null,
          selectedAtom: [dataX, dataY]
        });
      }
    };
    
    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [atomCount]);
  
  // Re-render on window resize
  useEffect(() => {
    const handleResize = () => renderCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div 
      className="contact-matrix-viewer" 
      style={{
        display: 'flex',
        flexDirection: 'row', // Arrange the matrix and legend side by side
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: '10px', // Space between the matrix and the legend
        width: '100%',
        padding: '2px 0'
      }}
    >
      {/* Left Column: Matrix and Selection Info */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {isLoading && <div style={{ fontSize: '12px' }}>Loading protein data...</div>}
        {errorMessage && <div style={{ fontSize: '12px', color: 'red' }}>{errorMessage}</div>}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            display: 'block',
            border: '1px solid #ccc',
            imageRendering: 'pixelated',
            cursor: 'crosshair',
            margin: '0 auto'
          }}
        />
        {selectedCell && atomsData.length > 0 && (
          <div 
            className="selection-info" 
            style={{ 
              marginTop: '4px', 
              fontSize: '12px',
              textAlign: 'center'
            }}
          >
            Selected: Atom {selectedCell.dataX} ↔ Atom {selectedCell.dataY}
          </div>
        )}
      </div>
      
      {/* Right Column: Vertical Legend */}
      <div 
        className="matrix-legend"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          fontSize: '10px'
        }}
      >
        {/* Vertical gradient bar */}
        <div style={{
          width: '8px',
          height: '300px',
          background: 'linear-gradient(to bottom, rgb(255,0,0), white)',
          border: '1px solid #ccc'
        }} />
        {/* Labels for the gradient */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '300px',
          marginLeft: '6px'
        }}>
          <span>Near (0)</span>
          <span>Far (&ge; {threshold})</span>
        </div>
      </div>
    </div>
  );
};

export default ContactMatrixViewer;



