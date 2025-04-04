import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PDBLoader } from 'three/addons/loaders/PDBLoader.js';

const ContactMatrixViewer = ({ pdbUrl, pdbId, threshold = 10.0, width = 500, height = 500, onAtomSelect }) => {
  const canvasRef = useRef(null);  

  useEffect(() => {
    if (!pdbUrl) return;
    const pdbLoader = new PDBLoader();

    const loadPdb = async () => {
      try {
  
        pdbLoader.load(
          pdbUrl,
          (pdb) => {
            const atoms = pdb.json.atoms;
            const numAtoms = atoms.length;
            console.log(`The molecule contains ${numAtoms} atoms.`);
  
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
  
            canvas.width = numAtoms;
            canvas.height = numAtoms;
  
            const imageData = ctx.createImageData(numAtoms, numAtoms);
  
            for (let i = 0; i < numAtoms; i++) {
              const [xi, yi, zi] = atoms[i];
              for (let j = 0; j < numAtoms; j++) {
                const [xj, yj, zj] = atoms[j];
                const dx = xi - xj;
                const dy = yi - yj;
                const dz = zi - zj;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                const pixelIndex = (i * numAtoms + j) * 4;
  
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
  
            ctx.putImageData(imageData, 0, 0);
            canvas.addEventListener('click', handleCanvasClick);
          },
          (xhr) => {
            if (xhr.total) {
              console.log(`${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`);
            } else {
              console.log('Loading...');
            }
          },
          (error) => {
            console.error('An error occurred while loading the PDB file:', error);
          }
        );
      } catch (e) {
        console.error('Failed to load PDB file:', e);
      }
    };
  
    loadPdb();
  }, [pdbId, threshold]);
  
  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
  
    const x = Math.floor((event.clientX - rect.left) * scaleX);
    const y = Math.floor((event.clientY - rect.top) * scaleY);
  
    console.log(`Clicked matrix at [${y}, ${x}]`);
  
    if (typeof onAtomSelect === 'function') {
      onAtomSelect([y, x]);
    }
  };


  return (
    <canvas
      ref={canvasRef}
      style={{
        width: width,
        height: height,
        border: '1px solid #ccc',
        imageRendering: 'pixelated'
      }}
    />
  );
};

export default ContactMatrixViewer;
