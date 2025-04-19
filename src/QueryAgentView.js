import React, { useState, useRef, useEffect, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { sendChat, fetchRagPrompt } from './services/ChatService';

// --- Markdown Imports ---
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// Choose a style (e.g., vs, vscDarkPlus, okaidia, materialDark, etc.)
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
// --- End Markdown Imports ---

import './QueryView.css';

const EMPTY_TEMPLATE = `// ---- Mol* Query template (insert code below) ----
`;

const defaultMolql = `// Select all carbon atoms that are part of aromatic rings
Q.struct.generator.rings({
  'only-aromatic': true,
  'atom-test': Q.core.set.has([
    Q.set('C'),
    Q.acp('elementSymbol')
  ])
})`;

export default function QueryAgentView({
  proteinData = null,
  proteinDataUpdateHandle = () => {},
}) {
  // MolQL editor content
  const [molql, setMolql] = useState(defaultMolql);

  // RAG prompt fetched from backend
  const [ragPrompt, setRagPrompt] = useState('');
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    (async () => {
      try {
        const text = await fetchRagPrompt();
        if (!isCancelled) {
          setRagPrompt(text);
        }
      } catch (err) {
        if (!isCancelled) {
          setLoadError(err.message);
        }
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Build the system prompt whenever ragPrompt or proteinData.id changes
//   const systemPrompt = useMemo(() => {
//     // *** Keep the instruction for ```js block ``` ***
//     return `
// You are an expert Mol* / MolQL assistant.

// 1. Always generate a valid Mol* structure query inside a single \`\`\`js block\`\`\`, starting from the template below and modifying only the body.

// ${EMPTY_TEMPLATE}

// 2. The user is currently exploring protein **${proteinData?.id ?? 'N/A'}**. Use that context when it matters.

// Return nothing except the code and, if necessary, a one‑sentence explanation.

// ${ragPrompt}
//     `.trim();
//   }, [ragPrompt, proteinData?.id]);

const systemPrompt = useMemo(() => {
  // *** Keep the instruction for ```js block ``` ***
  return `
You are an expert Mol* assistant.
The user is currently exploring protein **${proteinData?.pdbId ?? 'N/A'}**. Use that context when it matters.

${ragPrompt}
  `.trim();
}, [ragPrompt, proteinData?.id]);

  // Only store user & assistant messages in state
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom when chatHistory changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Send a user message and fetch assistant reply
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const nextHistory = [...chatHistory, { role: 'user', content: trimmed }];
    setChatHistory(nextHistory);
    setInput('');
    setIsSending(true);

    try {
      // Prepend the system prompt before sending
      const fullHistory = [
        { role: 'system', content: systemPrompt },
        ...nextHistory
      ];
      const backendHistory = await sendChat(fullHistory);
      // Drop the system prompt from the returned history
      setChatHistory(backendHistory.slice(1));
    } catch (err) {
      setChatHistory([
        ...nextHistory,
        { role: 'assistant', content: `❌ ${err.message}` }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Trigger the query run in the parent component
  const runQuery = () => {
    proteinDataUpdateHandle({
      selectedAtomRange: null,
      selectedAtom: null,
      queryLanguage: 'MOLQL',
      queryCode: molql,
    });
  };

  // --- Markdown Renderer Component Configuration ---
  const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      // Use SyntaxHighlighter for block code with a language specified (e.g., ```js)
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus} // Apply the chosen style
          language={match[1]} // Extract language (e.g., 'js')
          PreTag="div" // Use div instead of pre to avoid potential nesting issues
          {...props}
        >
          {String(children).replace(/\n$/, '') /* Remove trailing newline */}
        </SyntaxHighlighter>
      ) : (
        // Render inline code or block code without a language normally
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };
  // --- End Markdown Configuration ---


  return (
    <div className="query-two-col query-view-wrapper">
      {/* {loadError && (
        <div className="rag-error">
          Error loading prompt: {loadError}
        </div>
      )} */}

      {/* Chat panel */}
      <div className="chat-panel">
        <div className="chat-history">
          {chatHistory.map((message, idx) => (
            <div key={idx} className={`msg ${message.role}`}>
              {/* --- Use ReactMarkdown to render content --- */}
              <ReactMarkdown components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
              {/* --- End ReactMarkdown usage --- */}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={2}
            placeholder="Ask the LLM to build a query…"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={isSending || !input.trim()}
          >
            {isSending ? '…' : 'Send'}
          </button>
        </div>
      </div>

      {/* Code editor panel */}
      <div className="code-panel">
        <CodeMirror
          id="molql-editor"
          value={molql}
          onChange={v => setMolql(v)}
          extensions={[javascript()]}
          className="molql-editor"
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
          }}
        />
        <button className="run-btn" onClick={runQuery}>
          Run
        </button>
      </div>
    </div>
  );
}