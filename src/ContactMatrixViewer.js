import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { PDBLoader } from 'three/addons/loaders/PDBLoader.js';

const ContactMatrixViewer = ({
  pdbUrl,
  pdbId,
  threshold = 10.0,
  width = 500,
  height = 500,
  highLightAtomRange,
}) => {
  const canvasRef = useRef(null);
  const [atomCount, setAtomCount] = useState(0);
  const [atomsData, setAtomsData] = useState([]);
  const [cachedImageData, setCachedImageData] = useState(null);
  const [selection, setSelection] = useState(null);       // For drag selection (range)
  const [selectedCell, setSelectedCell] = useState(null); // For single-cell (click) selection

  // Load PDB file and generate contact matrix image data
  useEffect(() => {
    if (!pdbUrl) return;

    const pdbLoader = new PDBLoader();

    const loadPdb = async () => {
      try {
        pdbLoader.load(
          pdbUrl,
          (pdb) => {
            const atoms = pdb.json.atoms;
            setAtomsData(atoms);
            const totalAtoms = atoms.length;
            setAtomCount(totalAtoms);

            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            // Set canvas dimensions to match the number of atoms (1:1 pixel matrix)
            canvas.width = totalAtoms;
            canvas.height = totalAtoms;

            const imageData = ctx.createImageData(totalAtoms, totalAtoms);

            // Compute distance between each pair of atoms and set pixel color accordingly
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
                  imageData.data[pixelIndex] = 255;
                  imageData.data[pixelIndex + 1] = 255 - intensity;
                  imageData.data[pixelIndex + 2] = 255 - intensity;
                  imageData.data[pixelIndex + 3] = 255;
                } else {
                  imageData.data[pixelIndex] = 255;
                  imageData.data[pixelIndex + 1] = 255;
                  imageData.data[pixelIndex + 2] = 255;
                  imageData.data[pixelIndex + 3] = 255;
                }
              }
            }

            // Cache the generated image data for later redraws
            setCachedImageData(imageData);
            ctx.putImageData(imageData, 0, 0);
          },
          (xhr) => {
            if (xhr.total) {
              console.log(`${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`);
            } else {
              console.log('Loading...');
            }
          },
          (error) => {
            console.error('Error loading the PDB file:', error);
          }
        );
      } catch (error) {
        console.error('Failed to load PDB file:', error);
      }
    };

    loadPdb();
  }, [pdbUrl, pdbId, threshold]);

  // Create a drawOverlay function that always uses the latest state.
  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !cachedImageData) return;
    const ctx = canvas.getContext('2d');
    // Redraw the cached contact matrix image
    ctx.putImageData(cachedImageData, 0, 0);

    // Draw drag selection overlay if present
    if (selection) {
      const { startX, endX } = selection;
      const rectWidth = endX - startX;
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.fillRect(startX, 0, rectWidth, canvas.height);
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.lineWidth = 1;
      ctx.strokeRect(startX + 0.5, 0.5, rectWidth - 1, canvas.height - 1);
    }

    // If a single-cell selection exists, draw crosshairs and display the distance
    if (selectedCell) {
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 1;

      // Draw vertical line at selectedCell.x
      ctx.beginPath();
      ctx.moveTo(selectedCell.x + 0.5, 0);
      ctx.lineTo(selectedCell.x + 0.5, canvas.height);
      ctx.stroke();

      // Draw horizontal line at selectedCell.y
      ctx.beginPath();
      ctx.moveTo(0, selectedCell.y + 0.5);
      ctx.lineTo(canvas.width, selectedCell.y + 0.5);
      ctx.stroke();

      // Compute and display the Euclidean distance between the two atoms
      if (atomsData.length > selectedCell.x && atomsData.length > selectedCell.y) {
        const [xi, yi, zi] = atomsData[selectedCell.x];
        const [xj, yj, zj] = atomsData[selectedCell.y];
        const dx = xi - xj;
        const dy = yi - yj;
        const dz = zi - zj;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        ctx.fillStyle = 'blue';
        // Increase font size for better visibility
        ctx.font = '120px Arial';
        ctx.fillText(distance.toFixed(2), selectedCell.x + 5, selectedCell.y - 5);
      }
    }
  }, [cachedImageData, selection, selectedCell, atomsData]);

  // Trigger a redraw whenever dependent state changes
  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  // Handle mouse interactions for drag vs. click selection
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDragging = false;
    let dragStartX = null;
    let dragStartY = null;
    let currentX = null;
    let currentY = null;
    let hasDragged = false;

    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      dragStartX = Math.floor((e.clientX - rect.left) * scaleX);
      dragStartY = Math.floor((e.clientY - rect.top) * scaleY);
      currentX = dragStartX;
      currentY = dragStartY;
      isDragging = true;
      hasDragged = false;
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      currentX = Math.floor((e.clientX - rect.left) * scaleX);
      currentY = Math.floor((e.clientY - rect.top) * scaleY);
      // Increase threshold to avoid accidental drags
      if (Math.abs(currentX - dragStartX) > 5 || Math.abs(currentY - dragStartY) > 5) {
        hasDragged = true;
      }
      drawOverlay();
    };

    const handleMouseUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const dragEndX = Math.floor((e.clientX - rect.left) * scaleX);
      const dragEndY = Math.floor((e.clientY - rect.top) * scaleY);

      if (!hasDragged) {
        // Single click selection: update selectedCell (this triggers a redraw via our effect)
        setSelectedCell({ x: dragStartX, y: dragStartY });
        setSelection(null);
      } else {
        // Drag selection: use horizontal range for selection
        const start = Math.min(dragStartX, dragEndX);
        const end = Math.max(dragStartX, dragEndX);
        setSelection({ startX: start, endX: end });
        setSelectedCell(null);
        if (typeof highLightAtomRange === 'function') {
          highLightAtomRange([start, end]);
        }
      }
      // Call drawOverlay in case the state change is not immediate
      drawOverlay();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [drawOverlay, highLightAtomRange]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: width,
        height: height,
        border: '1px solid #ccc',
        imageRendering: 'pixelated',
        cursor: 'crosshair',
      }}
    />
  );
};

export default ContactMatrixViewer;


