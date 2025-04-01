import React from 'react';
import './MatrixViewer.css';

const MatrixViewer = ({ matrix, cellSize = 20, colorRange = { min: 0, max: 1 } }) => {
  // Simple function to convert a value to a color (blue to red gradient)
  const getColorForValue = (value) => {
    const { min, max } = colorRange;
    let ratio = (value - min) / (max - min);
    ratio = Math.max(0, Math.min(1, ratio)); // clamp between 0 and 1
    const red = Math.round(ratio * 255);
    const blue = Math.round((1 - ratio) * 255);
    return `rgb(${red}, 0, ${blue})`;
  };

  return (
    <div className="matrix-viewer">
      {matrix.map((row, rowIndex) => (
        <div key={rowIndex} className="matrix-row">
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className="matrix-cell"
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: getColorForValue(cell),
                border: '1px solid #ccc'
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default MatrixViewer;
