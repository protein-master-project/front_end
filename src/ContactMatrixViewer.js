import React, { useEffect, useRef, useState } from 'react';
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
  const [selection, setSelection] = useState(null); // { startX: number, endX: number }
  const [cachedImageData, setCachedImageData] = useState(null);

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
            const totalAtoms = atoms.length;
            setAtomCount(totalAtoms);

            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            // Set canvas dimensions to match the number of atoms for a 1:1 pixel matrix
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
                  // Set pixel to a color gradient (red with decreasing green/blue as intensity increases)
                  imageData.data[pixelIndex] = 255;
                  imageData.data[pixelIndex + 1] = 255 - intensity;
                  imageData.data[pixelIndex + 2] = 255 - intensity;
                  imageData.data[pixelIndex + 3] = 255;
                } else {
                  // Set pixel to white if the distance is above the threshold
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

  // Drag selection logic and overlay drawing for highlight
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDragging = false;
    let dragStartX = null;
    let currentX = null;

    // Redraw the cached image data and overlay the selection rectangle if applicable
    const drawOverlay = () => {
      if (!canvas || !cachedImageData) return;
      const ctx = canvas.getContext('2d');
      ctx.putImageData(cachedImageData, 0, 0);

      const range = isDragging && dragStartX !== null && currentX !== null
        ? [Math.min(dragStartX, currentX), Math.max(dragStartX, currentX)]
        : selection
          ? [selection.startX, selection.endX]
          : null;

      if (range) {
        const [start, end] = range;
        const rectWidth = end - start;

        // Draw a semi-transparent red rectangle over the selected region
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.fillRect(start, 0, rectWidth, canvas.height);

        // Draw a red border around the selection
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 1;
        ctx.strokeRect(start + 0.5, 0.5, rectWidth - 1, canvas.height - 1);
      }
    };

    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      dragStartX = Math.floor((e.clientX - rect.left) * scaleX);
      currentX = dragStartX;
      isDragging = true;
      drawOverlay();
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      currentX = Math.floor((e.clientX - rect.left) * scaleX);
      drawOverlay();
    };

    const handleMouseUp = (e) => {
      if (!isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const dragEndX = Math.floor((e.clientX - rect.left) * scaleX);
      isDragging = false;

      if (dragStartX !== null) {
        const start = Math.min(dragStartX, dragEndX);
        const end = Math.max(dragStartX, dragEndX);
        setSelection({ startX: start, endX: end });
        if (typeof highLightAtomRange === 'function') {
          highLightAtomRange([start, end]);
        }
      }

      dragStartX = null;
      currentX = null;
      drawOverlay();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    // Initial overlay draw to restore any existing selection
    drawOverlay();

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [cachedImageData, selection, highLightAtomRange]);

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
