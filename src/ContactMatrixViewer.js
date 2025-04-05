import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PDBLoader } from 'three/addons/loaders/PDBLoader.js';

const ContactMatrixViewer = ({
  pdbUrl,
  pdbId,
  threshold = 10.0,
  width = 500,
  height = 500,
  proteinData=null,
  proteinDataUpdateHandle=null,
}) => {
  const canvasRef = useRef(null);
  const baseMatrixCanvasRef = useRef(document.createElement('canvas'));
  const [atomCount, setAtomCount] = useState(0);
  const [atomsData, setAtomsData] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Initialize the PDB data and base matrix
  useEffect(() => {
    if (!pdbUrl) return;
    
    setIsLoading(true);
    setErrorMessage('');
    
    const pdbLoader = new PDBLoader();
    
    // Load and process PDB data
    pdbLoader.load(
      pdbUrl,
      (pdb) => {
        try {
          const atoms = pdb.json.atoms;
          setAtomsData(atoms);
          const totalAtoms = atoms.length;
          setAtomCount(totalAtoms);
          
          // Initialize the offscreen base canvas
          const baseCanvas = baseMatrixCanvasRef.current;
          baseCanvas.width = totalAtoms;
          baseCanvas.height = totalAtoms;
          const baseCtx = baseCanvas.getContext('2d', { alpha: false });
          
          // Create contact matrix on the base canvas
          const imageData = baseCtx.createImageData(totalAtoms, totalAtoms);
          
          // Compute the contact matrix (distance-based coloring)
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
                imageData.data[pixelIndex] = 255;         // R
                imageData.data[pixelIndex + 1] = 255 - intensity; // G
                imageData.data[pixelIndex + 2] = 255 - intensity; // B
                imageData.data[pixelIndex + 3] = 255;     // A
              } else {
                // White for atoms beyond threshold distance
                imageData.data[pixelIndex] = 255;     // R
                imageData.data[pixelIndex + 1] = 255; // G
                imageData.data[pixelIndex + 2] = 255; // B
                imageData.data[pixelIndex + 3] = 255; // A
              }
            }
          }
          
          // Put the base matrix on the offscreen canvas
          baseCtx.putImageData(imageData, 0, 0);
          
          // Initial render
          renderCanvas();
          setIsLoading(false);
        } catch (error) {
          console.error('Error processing PDB data:', error);
          setErrorMessage('Error processing protein data.');
          setIsLoading(false);
        }
      },
      (xhr) => {
        const progress = xhr.total ? (xhr.loaded / xhr.total * 100).toFixed(0) : 'unknown';
        console.log(`Loading PDB: ${progress}%`);
      },
      (error) => {
        console.error('Error loading PDB file:', error);
        setErrorMessage('Failed to load protein data.');
        setIsLoading(false);
      }
    );
    
    // Cleanup function
    return () => {
      // Cancel any pending operations if needed
    };
  }, [pdbUrl, pdbId, threshold]);
  
  // Main render function for the visible canvas
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const baseCanvas = baseMatrixCanvasRef.current;
    
    if (!canvas || baseCanvas.width === 0) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    
    // First, ensure canvas has the right dimensions
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    
    // Clear canvas with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the base contact matrix (scaled to fit)
    if (baseCanvas.width > 0) {
      ctx.imageSmoothingEnabled = false; // Keep pixelated look
      ctx.drawImage(baseCanvas, 0, 0, baseCanvas.width, baseCanvas.height, 
                    0, 0, canvas.width, canvas.height);
    }
    
    // Draw crosshair if a cell is selected
    if (selectedCell && atomsData.length > 0) {
      const scaleX = canvas.width / atomCount;
      const scaleY = canvas.height / atomCount;
      
      // Convert data coordinates to screen coordinates
      const screenX = selectedCell.dataX * scaleX;
      const screenY = selectedCell.dataY * scaleY;
      
      // Draw crosshair
      ctx.save();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      
      // Draw as a single path for consistent rendering
      ctx.beginPath();
      // Vertical line
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, canvas.height);
      // Horizontal line
      ctx.moveTo(0, screenY);
      ctx.lineTo(canvas.width, screenY);
      ctx.stroke();
      
      // Add a highlight box at intersection
      ctx.strokeRect(screenX - 4, screenY - 4, 8, 8);
      
      // Show distance
      if (selectedCell.dataX < atomsData.length && selectedCell.dataY < atomsData.length) {
        const [xi, yi, zi] = atomsData[selectedCell.dataX];
        const [xj, yj, zj] = atomsData[selectedCell.dataY];
        const dx = xi - xj;
        const dy = yi - yj;
        const dz = zi - zj;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        // Draw distance value with a background for better visibility
        const text = `${distance.toFixed(2)}`;
        ctx.font = '16px Arial';
        const textWidth = ctx.measureText(text).width;
        
        // Position text away from the edges
        let textX = screenX + 10;
        let textY = screenY - 10;
        
        // Keep text within bounds
        if (textX + textWidth + 10 > canvas.width) textX = screenX - textWidth - 10;
        if (textY < 20) textY = screenY + 25;
        
        // Draw text background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(textX - 2, textY - 16, textWidth + 4, 20);
        
        // Draw text
        ctx.fillStyle = '#3b82f6';
        ctx.fillText(text, textX, textY);
      }
      
      ctx.restore();
    }
  };
  
  // Re-render when selectedCell changes
  useEffect(() => {
    if (canvasRef.current) {
      renderCanvas();
    }
  }, [selectedCell, atomsData, atomCount]);
  
  // Handle click events on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || atomCount === 0) return;
    
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      
      // Get click position in canvas coordinates
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;
      
      // Convert to data coordinates
      const dataX = Math.floor((canvasX / canvas.width) * atomCount);
      const dataY = Math.floor((canvasY / canvas.height) * atomCount);
      
      // Check bounds
      if (dataX >= 0 && dataX < atomCount && dataY >= 0 && dataY < atomCount) {
        setSelectedCell({
          dataX: dataX,
          dataY: dataY,
        });
      }

      if (typeof proteinDataUpdateHandle === 'function') {
        console.log("selected atoms, X: " + dataX + "Y: " + dataY)
        proteinDataUpdateHandle({ 
          selectedAtomRange: null,
          selectedAtom: [dataX, dataY] 
        });
      }
    };
    
    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [atomCount]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      renderCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="contact-matrix-viewer" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: '2px 0'
    }}>
      {isLoading && <div className="loading-indicator">Loading protein data...</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
          border: '1px solid #ccc',
          imageRendering: 'pixelated',
          cursor: 'crosshair',
          margin: '0 auto',  // Center horizontally
        }}
      />
      
      {selectedCell && atomsData.length > 0 && (
        <div className="selection-info" style={{ 
          marginTop: '2px', 
          fontSize: '14px',
          textAlign: 'center' 
        }}>
          Selected: Atom {selectedCell.dataX} ↔ Atom {selectedCell.dataY}
        </div>
      )}
    </div>
  );
};

export default ContactMatrixViewer;


