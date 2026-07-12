import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { streamChat, fetchModels, fetchSettings, updateSettings } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function ChatWindow({ activeId, messages, onAddMessage, onUpdateLastMessage, onSetMessages, onConversationUpdate, onLoadConversation, onNewConversation }) {
  const { user } = useAuth();
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef(null);
  const firstTokenRef = useRef(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const welcomeRef = useRef(null);
  const modelPickerRef = useRef(null);
  const [feedback, setFeedback] = useState({});
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [welcomeInput, setWelcomeInput] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editText, setEditText] = useState('');
  const editRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    Promise.all([fetchModels(), fetchSettings()])
      .then(([modelsData, settingsData]) => {
        setModels(modelsData);
        setSelectedModel(settingsData.selectedModel || modelsData[0]?.id || '');
      })
      .catch(() => {});
  }, []);

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
    updateSettings({ selectedModel: modelId }).catch(() => {});
  };

  const scrollToBottom = useCallback((force) => {
    if (!force && !autoScroll) return;
    messagesEndRef.current?.scrollIntoView({ behavior: force ? 'auto' : 'smooth' });
  }, [autoScroll]);

  const handleChatScroll = useCallback(() => {
    const el = chatRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setAutoScroll(atBottom);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  useEffect(() => {
    if (welcomeRef.current) {
      welcomeRef.current.style.height = 'auto';
      welcomeRef.current.style.height = Math.min(welcomeRef.current.scrollHeight, 180) + 'px';
    }
  }, [welcomeInput]);

  useEffect(() => {
    const handleClick = (e) => {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target)) {
        setModelPickerOpen(false);
      }
    };
    if (modelPickerOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [modelPickerOpen]);

  const doStream = (convId, msg) => {
    let fullContent = '';

    const abortFn = streamChat(
      convId,
      msg,
      (chunk) => {
        if (!firstTokenRef.current) {
          firstTokenRef.current = true;
        }
        fullContent += chunk;
        onUpdateLastMessage(fullContent);
        scrollToBottom();
      },
      () => {
        setStreaming(false);
        onConversationUpdate?.();
        onLoadConversation?.(convId);
      },
      (err) => {
        setStreaming(false);
        const errMsg = err.message;

        if (errMsg.includes('No API key') || errMsg.includes('Incorrect API key') || errMsg.includes('401')) {
          onUpdateLastMessage(
            `**Error:** ${errMsg}\n\nGet a free Groq API key at **https://console.groq.com/keys** (no credit card needed), then add \`GROQ_API_KEY=your_key\` to your \`.env\` file.`
          );
        } else if (errMsg.includes('Insufficient credits') || errMsg.includes('credits') || errMsg.includes('quota') || errMsg.includes('rate') || errMsg.includes('429')) {
          onUpdateLastMessage(
            `**Whoa there, speed racer!** 🏎️💨\n\nYou've hit Groq's rate limit. Guess they weren't ready for your sheer intellectual firepower.\n\n**Quick fixes:**\n- Take a breath ☕ (wait 30–60s)\n- Pick a different model above\n- Or just accept that greatness is sometimes throttled.\n\n*For real though — Groq's free tier has limits. They reset quickly. Try again in a bit.*`
          );
        } else {
          onUpdateLastMessage(`**Error:** ${errMsg}`);
        }
      }
    );

    abortRef.current = abortFn;
  };

  const handleSend = async () => {
    if (!input.trim() || !activeId || streaming) return;

    const userMsg = input.trim();
    setInput('');
    setStreaming(true);
    firstTokenRef.current = false;

    onAddMessage({ role: 'user', content: userMsg, _temp: true, createdAt: new Date().toISOString() });
    doStream(activeId, userMsg);
  };

  const handleRetry = (msgIndex) => {
    if (streaming || !activeId) return;

    const userMsg = messages[msgIndex - 1];
    if (!userMsg || userMsg.role !== 'user') return;

    const rest = messages.slice(0, msgIndex - 1);
    onSetMessages(rest);
    setStreaming(true);
    firstTokenRef.current = false;

    onAddMessage({ role: 'user', content: userMsg.content, _temp: true, createdAt: new Date().toISOString() });
    doStream(activeId, userMsg.content);
  };

  const handleStop = () => {
    if (typeof abortRef.current === 'function') {
      abortRef.current();
    }
    setStreaming(false);
  };

  const handleWelcomeSend = async () => {
    if (!welcomeInput.trim() || streaming) return;
    if (!onNewConversation) return;

    setStreaming(true);
    const msg = welcomeInput.trim();
    setWelcomeInput('');

    try {
      const convId = await onNewConversation();
      onAddMessage({ role: 'user', content: msg, _temp: true, createdAt: new Date().toISOString() });
      doStream(convId, msg);
    } catch {
      setStreaming(false);
    }
  };

  const handleWelcomeKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleWelcomeSend();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleFeedback = (idx, type) => {
    setFeedback(prev => {
      const current = prev[idx];
      if (current === type) {
        const next = { ...prev };
        delete next[idx];
        return next;
      }
      return { ...prev, [idx]: type };
    });
  };

  const formatTime = (msg) => {
    if (!msg.createdAt) return 'now';
    const d = new Date(msg.createdAt);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const copyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  const handleStartEdit = (idx, content) => {
    if (streaming) {
      if (typeof abortRef.current === 'function') abortRef.current();
      setStreaming(false);
    }
    setEditingIndex(idx);
    setEditText(content);
    setTimeout(() => editRef.current?.focus(), 50);
  };

  const handleCancelEdit = () => {
    setEditingIndex(-1);
    setEditText('');
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || editingIndex < 0) return;
    const rest = messages.slice(0, editingIndex);
    onSetMessages(rest);
    setEditingIndex(-1);
    const content = editText.trim();
    setEditText('');
    setStreaming(true);
    firstTokenRef.current = false;
    onAddMessage({ role: 'user', content, _temp: true, createdAt: new Date().toISOString() });
    doStream(activeId, content);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (!activeId) {
    return (
      <div className="welcome-empty">
        <div className="welcome-content">
          <div className="welcome-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'M'}
          </div>
          <p className="welcome-greeting">{greeting}, {user?.name || user?.email?.split('@')[0]}</p>
          <p className="welcome-hint">What do you want to ask?</p>
          <div className="welcome-input-wrapper">
            <textarea
              ref={welcomeRef}
              className="welcome-input"
              placeholder="Ask anything..."
              value={welcomeInput}
              onChange={e => setWelcomeInput(e.target.value)}
              onKeyDown={handleWelcomeKeyDown}
              rows={1}
              disabled={streaming}
            />
            <div className="input-model-row">
              <div className="model-picker" ref={modelPickerRef}>
                <button
                  className="model-pill"
                  onClick={() => setModelPickerOpen(v => !v)}
                  disabled={streaming}
                  type="button"
                >
                  {models.find(m => m.id === selectedModel)?.label || 'Model'}
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {modelPickerOpen && (
                  <div className="model-dropdown">
                    {models.map(m => (
                      <button
                        key={m.id}
                        className={`model-option ${m.id === selectedModel ? 'active' : ''}`}
                        onClick={() => { handleModelChange(m.id); setModelPickerOpen(false); }}
                        type="button"
                      >
                        {m.label}
                        {m.id === selectedModel && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="btn-send"
                onClick={handleWelcomeSend}
                disabled={!welcomeInput.trim() || streaming}
                title="Send message"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8L14 2l-4 12-3-5-5-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="chat-window">
      <div className="chat-messages" ref={chatRef} onScroll={handleChatScroll}>
        {messages.length === 0 && (
          <div className="chat-empty">
            <p className="chat-empty-subtitle">Send a message to start the conversation</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`message message-${msg.role}`}>
            <div className="message-label">
              {msg.role === 'user' ? 'You' : 'Mofa'}
              <span className="message-time">{formatTime(msg)}</span>
            </div>
            <div className="message-content">
              {msg.role === 'assistant' ? (
                <MarkdownRenderer content={msg.content} />
              ) : editingIndex === i ? (
                <div className="edit-wrap">
                  <textarea
                    ref={editRef}
                    className="edit-textarea"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    rows={2}
                  />
                  <div className="edit-actions">
                    <button className="edit-save" onClick={handleSaveEdit} disabled={!editText.trim()}>Save</button>
                    <button className="edit-cancel" onClick={handleCancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
              )}
            </div>
            {msg.role === 'user' && editingIndex !== i && (
              <div className="message-actions">
                <button className="btn-action" onClick={() => handleStartEdit(i, msg.content)} title="Edit">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M11.5 2.5l2 2L7 11H5V9l6.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                    <path d="M2 13h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            )}
            {msg.role === 'assistant' && !msg._temp && (
              <div className="message-actions">
                <button
                  className={`btn-action ${feedback[i] === 'up' ? 'active' : ''}`}
                  onClick={() => toggleFeedback(i, 'up')}
                  title="Like"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M6 14V7M3 8v6a1 1 0 001 1h7.3a1.5 1.5 0 001.48-1.23l.7-4A1.5 1.5 0 0012 8H9V4a2 2 0 00-2-2L6 4v3H3a1 1 0 00-1 1v4a1 1 0 001 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  className={`btn-action ${feedback[i] === 'down' ? 'active' : ''}`}
                  onClick={() => toggleFeedback(i, 'down')}
                  title="Dislike"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M10 2v7m3-1V2a1 1 0 00-1-1H4.7a1.5 1.5 0 00-1.48 1.23l-.7 4A1.5 1.5 0 004 8h3v4a2 2 0 002 2l1-2V7h3a1 1 0 001-1V4a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="btn-action" onClick={() => copyMessage(msg.content)} title="Copy message">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="5" y="5" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M2 11V2.5A.5.5 0 012.5 2H11" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                </button>
                <button className="btn-action" onClick={() => handleRetry(i)} title="Retry">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8a6 6 0 0110.5-4M14 2v4h-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 8a6 6 0 01-10.5 4M2 14v-4h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
        {streaming && !firstTokenRef.current && (
          <div className="message message-assistant">
            <div className="message-label">Mofa</div>
            <div className="typing-indicator">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-bar">
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder="Send a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={streaming}
          />
          <div className="input-model-row">
            <div className="model-picker" ref={modelPickerRef}>
              <button
                className="model-pill"
                onClick={() => setModelPickerOpen(v => !v)}
                disabled={streaming}
                type="button"
              >
                {models.find(m => m.id === selectedModel)?.label || 'Model'}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {modelPickerOpen && (
                <div className="model-dropdown">
                  {models.map(m => (
                    <button
                      key={m.id}
                      className={`model-option ${m.id === selectedModel ? 'active' : ''}`}
                      onClick={() => { handleModelChange(m.id); setModelPickerOpen(false); }}
                      type="button"
                    >
                      {m.label}
                      {m.id === selectedModel && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {streaming ? (
              <button className="btn-stop" onClick={handleStop} title="Stop generating">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="3" width="10" height="10" rx="2" fill="currentColor" />
                </svg>
              </button>
            ) : (
              <button
                className="btn-send"
                onClick={handleSend}
                disabled={!input.trim()}
                title="Send message"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8L14 2l-4 12-3-5-5-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
