const BACKEND_BASE_URL = 'http://127.0.0.1:8080';

/**
 * Send full conversation history to the backend LLM endpoint and
 * return whatever array of messages the backend sends back.
 */
export async function sendChat(history) {
  const resp = await fetch(`${BACKEND_BASE_URL}/llm`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ messages: history }),
  });

  if (!resp.ok) {
    const { error } = await resp.json().catch(() => ({}));
    throw new Error(error || resp.statusText);
  }
  const data = await resp.json();
  if (!Array.isArray(data.messages)) {
    throw new Error('Malformed LLM response');
  }
  return data.messages;
}


export async function fetchRagPrompt() {
  const resp = await fetch(`${BACKEND_BASE_URL}/rag`, {
    method: 'GET',
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(errText || resp.statusText);
  }

  // /rag returns text/plain, so use .text()
  return resp.text();
}