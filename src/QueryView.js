import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import './QueryView.css';

// Select all carbon atoms
// return Q.struct.generator.atomGroups({
//   'atom-test': Q.core.set.has([
//     Q.set('C'),
//     Q.acp('elementSymbol')
//   ])
// });

// Q.struct.generator.atomGroups({
//   'atom-test': MS.core.set.has([MS.set('FE'), MS.acp('elementSymbol')])
// })
const defaultMolql = `// Select all carbon atoms that are part of aromatic rings
Q.struct.generator.rings({
    'only-aromatic': true,
    'atom-test': Q.core.set.has([
      Q.set('C'),
      Q.acp('elementSymbol')
    ])
  })`;

const QueryView = ({
    proteinData = null,
    proteinDataUpdateHandle = null,
}) => {
  const [molql, setMolql] = useState(defaultMolql);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className=""
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="query-view-wrapper">
        <CodeMirror
          id="molql-editor"
          value={molql}
          extensions={[javascript()]}
          onChange={(value) => setMolql(value)}
          className="molql-editor"
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
          }}
        />
        
        <button
          onClick={() => {
            console.log('Running query with MolQL:', molql);
    
            proteinDataUpdateHandle({ 
                selectedAtomRange: null,
                selectedAtom: null,
                queryLanguage: 'MOLQL',
                queryCode: molql
            });
            
          }}
          className={`
            absolute bottom-6 right-6
            bg-blue-600 hover:bg-blue-700 text-white
            font-semibold py-2 px-4 rounded-full shadow-lg
            transition-opacity duration-200
            ${hovered ? 'opacity-100' : 'opacity-0'}
          `}
        >
          Run
        </button>
      </div>
    </div>
  );
};

export default QueryView;
