import React, { useState, useEffect, useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { sendChat, fetchRagPrompt } from './services/ChatService';

// ---- Markdown support -------------------------------------------------------
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// ---- Constants --------------------------------------------------------------
// const EMPTY_TEMPLATE = `// ---- Mol* Query template (insert code below) ----\n`;
const DEFAULT_MOLQL = `// Example, select all carbon atoms that are part of aromatic rings
Q.struct.generator.rings({\n  'only-aromatic': true,\n  'atom-test': Q.core.set.has([\n    Q.set('C'),\n    Q.acp('elementSymbol')\n  ])\n})
\n\n\n`;

// -----------------------------------------------------------------------------
// 🪄1) Logic layer – isolate LLM chat in a reusable hook
// -----------------------------------------------------------------------------
function useLLMChat(proteinData, molql) {
  /* ---- LLM‑related state ---- */
  const [chatHistory, setChatHistory] = useState([]);           // messages w/o system
  const [input, setInput] = useState('');                       // textarea value
  const [isSending, setIsSending] = useState(false);            // UX flag
  const [ragPrompt, setRagPrompt] = useState('');               // backend prompt
  const [loadError, setLoadError] = useState(null);             // prompt fetch error

  /* ---- boot‑time prompt fetch ---- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const txt = await fetchRagPrompt();
        if (!cancelled) setRagPrompt(txt);
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ---- system prompt ---- */
  const systemPrompt = useMemo(() => `
  You are an expert Mol* assistant.
  The user is currently exploring protein **${proteinData?.pdbId ?? 'N/A'}**. Use that context when it matters.
  You can use emoji to add liveliness.

  Here is the current working MolQL query (may be partial or incorrect):
  \`\`\`js
  ${molql.trim()}
  \`\`\`

  ${ragPrompt}`.trim(), 
  [ragPrompt, proteinData?.pdbId]);

  /* ---- call LLM API ---- */
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const nextHistory = [...chatHistory, { role: 'user', content: trimmed }];
    setChatHistory(nextHistory);
    setInput('');
    setIsSending(true);

    try {
      const fullHistory = [{ role: 'system', content: systemPrompt }, ...nextHistory];
      const backendHistory = await sendChat(fullHistory);
      setChatHistory(backendHistory.slice(1)); // drop system message
    } catch (err) {
      setChatHistory([...nextHistory, { role: 'assistant', content: `❌ ${err.message}` }]);
    } finally {
      setIsSending(false);
    }
  };

  return {
    chatHistory,
    input,
    setInput,
    isSending,
    handleSend,
    loadError,
  };
}



// -----------------------------------------------------------------------------
// 2) Presentation layer – purely visual components
// -----------------------------------------------------------------------------

// Markdown code‑block renderer reused by ChatPanel
const mdComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>{children}</code>
    );
  },
};

function ChatPanel({ chatHistory, input, setInput, isSending, onSend }) {
  const bottomRef = useRef(null);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [chatHistory]);

  return (
    <div className="chat-panel">
      <div className="chat-history">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`msg ${msg.role}`}>
            <ReactMarkdown components={mdComponents}>{msg.content}</ReactMarkdown>
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
              onSend();
            }
          }}
        />
        <button onClick={onSend} disabled={isSending || !input.trim()}>{isSending ? '…' : 'Send'}</button>
      </div>
    </div>
  );
}

function CodeEditorPanel({ molql, setMolql, onRun }) {
  return (
    <div className="code-panel">
      <CodeMirror
        id="molql-editor"
        value={molql}
        onChange={setMolql}
        extensions={[javascript()]}
        className="molql-editor"
        basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true }}
      />
      <button className="run-btn" onClick={onRun}>Run</button>
    </div>
  );
}



// -----------------------------------------------------------------------------
// 3) Orchestrator – wire logic & UI together
// -----------------------------------------------------------------------------
export default function QueryAgentView({ proteinData = null, proteinDataUpdateHandle = () => {} }) {
  /* ---- editor state ---- */
  const [molql, setMolql] = useState(DEFAULT_MOLQL);

  /* ---- LLM chat hook ---- */
  const {
    chatHistory,
    input,
    setInput,
    isSending,
    handleSend,
    loadError,
  } = useLLMChat(proteinData, molql);

  /* ---- trigger parent callback ---- */
  const runQuery = () => {
    proteinDataUpdateHandle({
      selectedAtomRange: null,
      selectedAtom: null,
      queryLanguage: 'MOLQL',
      queryCode: molql,
    });
  };

  return (
    <div className="query-two-col query-view-wrapper">
      {loadError && <div className="rag-error">Error loading prompt: {loadError}</div>}

      <ChatPanel
        chatHistory={chatHistory}
        input={input}
        setInput={setInput}
        isSending={isSending}
        onSend={handleSend}
      />

      <CodeEditorPanel molql={molql} setMolql={setMolql} onRun={runQuery} />
    </div>
  );
}
