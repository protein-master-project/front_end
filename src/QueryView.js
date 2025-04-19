import React, { useState, useRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { sendChat } from './services/ChatService';
import './QueryView.css';

const EMPTY_TEMPLATE = `// ‑‑‑‑ Mol* Query template (insert code below) ‑‑‑‑
`;
/* 🌟 Initial editor text – tweak as you like */
const defaultMolql = `// Select all carbon atoms that are part of aromatic rings
Q.struct.generator.rings({
  'only-aromatic': true,
  'atom-test': Q.core.set.has([
    Q.set('C'),
    Q.acp('elementSymbol')
  ])
})`;

export default function QueryView({
  proteinData = null,
  proteinDataUpdateHandle = () => {},
}) {
  /* ────────────────────────── Code editor ─────────────────────────── */
  const [molql, setMolql] = useState(defaultMolql);

  /* ─────────────────────────── Chat state ─────────────────────────── */
  const systemPrompt = `
You are an expert Mol* / MolQL assistant.

1. **Always** generate a valid Mol* Structure Query **inside a single \`\`\`js block**,
   starting from the template below and **modifying only the body**.

${EMPTY_TEMPLATE}

2. The user is currently exploring protein **${proteinData?.id ?? 'N/A'}**.
   Use that context when it matters.

Return nothing except the code and, if necessary, a one‑sentence explanation.
`.trim();

  const [messages, setMessages] = useState([
    { role: 'system', content: systemPrompt },
  ]);
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);
  const bottomRef               = useRef(null);

  /* autoscroll */
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); });

  /* send message */
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    const newHistory = [...messages, { role: 'user', content: text }];
    setMessages(newHistory);
    setInput('');
    setSending(true);
    try {
      const backendHistory = await sendChat(newHistory);
      setMessages(backendHistory);

      /* if assistant just replied with code, drop it into the editor */
      const lastMsg = backendHistory[backendHistory.length - 1];
      const match   = lastMsg?.content.match(/```js([^]*)```/i);
      if (match) setMolql(match[1].trim());
    } catch (e) {
      setMessages([...newHistory,
        { role: 'assistant', content: `❌ ${e.message}` }]);
    } finally { setSending(false); }
  };

  /* run the code in the outer app */
  const runQuery = () => {
    proteinDataUpdateHandle({
      selectedAtomRange: null,
      selectedAtom: null,
      queryLanguage: 'MOLQL',
      queryCode: molql,
    });
  };

  /* ─────────────────────────── UI ──────────────────────────────── */
  return (
    <div className="query‑two‑col">
      {/* CHAT (left) */}
      <div className="chat-panel">
        <div className="chat-history">
          {messages.filter(m => m.role !== 'system').map((m, i) => (
            <div
              key={i}
              className={`msg ${m.role === 'user' ? 'user' : 'assistant'}`}
            >
              {m.content}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={2}
            placeholder="Ask LLM to build a query…"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); handleSend();
              }
            }}
          />
          <button onClick={handleSend} disabled={sending || !input.trim()}>
            {sending ? '…' : 'Send'}
          </button>
        </div>
      </div>

      {/* CODE (right) */}
      <div className="code-panel">
        <CodeMirror
          id="molql-editor"
          value={molql}
          onChange={v => setMolql(v)}
          extensions={[javascript()]}
          className="molql-editor"
          basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true }}
        />
        <button className="run-btn" onClick={runQuery}>Run</button>
      </div>
    </div>
  );
}


// import React, { useState } from 'react';
// import CodeMirror from '@uiw/react-codemirror';
// import { javascript } from '@codemirror/lang-javascript';
// import './QueryView.css';

// // Select all carbon atoms
// // return Q.struct.generator.atomGroups({
// //   'atom-test': Q.core.set.has([
// //     Q.set('C'),
// //     Q.acp('elementSymbol')
// //   ])
// // });

// // Q.struct.generator.atomGroups({
// //   'atom-test': MS.core.set.has([MS.set('FE'), MS.acp('elementSymbol')])
// // })
// const defaultMolql = `// Select all carbon atoms that are part of aromatic rings
// Q.struct.generator.rings({
//     'only-aromatic': true,
//     'atom-test': Q.core.set.has([
//       Q.set('C'),
//       Q.acp('elementSymbol')
//     ])
//   })`;

// const QueryView = ({
//     proteinData = null,
//     proteinDataUpdateHandle = null,
// }) => {
//   const [molql, setMolql] = useState(defaultMolql);
//   const [hovered, setHovered] = useState(false);

//   return (
//     <div
//       className=""
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//     >
//       <div className="query-view-wrapper">
//         <CodeMirror
//           id="molql-editor"
//           value={molql}
//           extensions={[javascript()]}
//           onChange={(value) => setMolql(value)}
//           className="molql-editor"
//           basicSetup={{
//             lineNumbers: true,
//             foldGutter: true,
//             highlightActiveLine: true,
//           }}
//         />
        
//         <button
//           onClick={() => {
//             console.log('Running query with MolQL:', molql);
    
//             proteinDataUpdateHandle({ 
//                 selectedAtomRange: null,
//                 selectedAtom: null,
//                 queryLanguage: 'MOLQL',
//                 queryCode: molql
//             });
            
//           }}
//           className={`
//             absolute bottom-6 right-6
//             bg-blue-600 hover:bg-blue-700 text-white
//             font-semibold py-2 px-4 rounded-full shadow-lg
//             transition-opacity duration-200
//             ${hovered ? 'opacity-100' : 'opacity-0'}
//           `}
//         >
//           Run
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QueryView;
