const API_BASE = import.meta.env.VITE_API_URL || '/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return res;
}

export async function fetchConversations() {
  const res = await apiFetch(`${API_BASE}/conversations`);
  return res.json();
}

export async function fetchConversation(id) {
  const res = await apiFetch(`${API_BASE}/conversations/${id}`);
  return res.json();
}

export async function createConversation(title) {
  const res = await apiFetch(`${API_BASE}/conversations`, {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
  return res.json();
}

export async function renameConversation(id, title) {
  const res = await apiFetch(`${API_BASE}/conversations/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title }),
  });
  return res.json();
}

export async function deleteConversation(id) {
  const res = await apiFetch(`${API_BASE}/conversations/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function fetchModels() {
  const res = await apiFetch(`${API_BASE}/models`);
  return res.json();
}

export async function fetchSettings() {
  const res = await apiFetch(`${API_BASE}/settings`);
  return res.json();
}

export async function updateSettings(settings) {
  const res = await apiFetch(`${API_BASE}/settings`, {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
  return res.json();
}

export function streamChat(conversationId, message, onChunk, onDone, onError) {
  const controller = new AbortController();

  fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ conversationId, message }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Stream request failed' }));
        onError(new Error(err.error || `HTTP ${response.status}`));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              onError(new Error(parsed.error));
              return;
            }
            if (parsed.content) {
              onChunk(parsed.content);
            }
          } catch {
            // skip
          }
        }
      }
      onDone();
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onError(err);
      }
    });

  return () => controller.abort();
}
