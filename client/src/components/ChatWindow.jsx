import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { streamChat } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function ChatWindow({ activeId, messages, onAddMessage, onUpdateLastMessage, onConversationUpdate, onLoadConversation, onNewConversation }) {
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

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const handleSend = async () => {
    if (!input.trim() || !activeId || streaming) return;

    const userMsg = input.trim();
    setInput('');
    setStreaming(true);
    firstTokenRef.current = false;

    onAddMessage({ role: 'user', content: userMsg, _temp: true });

    let fullContent = '';

    const abortFn = streamChat(
      activeId,
      userMsg,
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
        onLoadConversation?.(activeId);
      },
      (err) => {
        setStreaming(false);
        const msg = err.message;

        if (msg.includes('No API key') || msg.includes('Incorrect API key') || msg.includes('401') || msg.includes('401')) {
          onUpdateLastMessage(
            `**Error:** ${msg}\n\n👉 Get a free Groq API key at **https://console.groq.com/keys** (no credit card needed), then add \`GROQ_API_KEY=your_key\` to your \`.env\` file.`
          );
        } else if (msg.includes('Insufficient credits') || msg.includes('credits') || msg.includes('quota')) {
          onUpdateLastMessage(
            `**Error:** ${msg}\n\nYou may have hit Groq's rate limit. Wait a moment and try again, or select a different model in **Settings**.`
          );
        } else {
          onUpdateLastMessage(`**Error:** ${msg}`);
        }
      }
    );

    abortRef.current = abortFn;
  };

  const handleStop = () => {
    if (typeof abortRef.current === 'function') {
      abortRef.current();
    }
    setStreaming(false);
  };

  const [welcomeInput, setWelcomeInput] = useState('');

  const handleWelcomeSend = async () => {
    if (!welcomeInput.trim() || streaming) return;
    if (!onNewConversation) return;

    setStreaming(true);
    const msg = welcomeInput.trim();
    setWelcomeInput('');

    try {
      const convId = await onNewConversation();
      onAddMessage({ role: 'user', content: msg, _temp: true });

      let fullContent = '';
      streamChat(
        convId,
        msg,
        (chunk) => {
          fullContent += chunk;
          onUpdateLastMessage(fullContent);
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
              `**Error:** ${errMsg}\n\n👉 Get a free Groq API key at **https://console.groq.com/keys** (no credit card needed), then add \`GROQ_API_KEY=your_key\` to your \`.env\` file.`
            );
          } else if (errMsg.includes('Insufficient credits') || errMsg.includes('credits') || errMsg.includes('quota')) {
            onUpdateLastMessage(
              `**Error:** ${errMsg}\n\nYou may have hit Groq's rate limit. Wait a moment and try again, or select a different model in **Settings**.`
            );
          } else {
            onUpdateLastMessage(`**Error:** ${errMsg}`);
          }
        }
      );
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
              className="welcome-input"
              placeholder="Ask anything..."
              value={welcomeInput}
              onChange={e => setWelcomeInput(e.target.value)}
              onKeyDown={handleWelcomeKeyDown}
              rows={1}
              disabled={streaming}
            />
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
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p className="chat-empty-subtitle">Send a message to start the conversation</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`message message-${msg.role}`}>
            <div className="message-label">
              {msg.role === 'user' ? 'You' : 'Mofa'}
            </div>
            <div className="message-content">
              {msg.role === 'assistant' ? (
                <MarkdownRenderer content={msg.content} />
              ) : (
                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
              )}
            </div>
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
  );
}
