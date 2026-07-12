import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import SettingsPanel from './components/SettingsPanel';
import DevPanel from './components/DevPanel';
import AuthPage from './components/AuthPage';
import { useConversations } from './hooks/useConversations';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import './styles/global.css';
import './styles/app.css';

function AppContent() {
  const { user, isAdmin, isAuthenticated, loading } = useAuth();
  const { cycleMode, isDark, theme } = useTheme();
  const {
    conversations,
    activeId,
    messages,
    loadConversation,
    newConversation,
    rename,
    remove,
    loadConversations,
    addMessage,
    updateLastMessage,
    setMessages,
  } = useConversations();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [devPanelVisible, setDevPanelVisible] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  const handleSelect = (id) => loadConversation(id);
  const handleNew = async () => await newConversation();
  const handleRename = async (id, title) => await rename(id, title);
  const handleDelete = async (id) => await remove(id);

  const themeIcon = theme === 'system' ? 'Auto' : isDark ? '🌙' : '☀️';

  if (loading) {
    return <div className="app-loading"><div className="typing-indicator"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div></div>;
  }

  return (
    <div className="app-layout">
      {isAuthenticated && (
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          onNew={handleNew}
          onRename={handleRename}
          onDelete={handleDelete}
          onSettings={() => setSettingsOpen(true)}
          onAuth={() => setAuthOpen(true)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}
      <div className="main-area">
        <div className="mobile-header">
          {isAuthenticated && (
            <button className="btn-hamburger" onClick={() => setSidebarOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
          {activeId && (
            <span className="mobile-header-title">
              {conversations.find(c => c._id === activeId)?.title || 'Chat'}
            </span>
          )}
          <div className="mobile-header-actions">
            <button className="btn-icon" onClick={cycleMode} title={`Theme: ${theme}`}>
              {theme === 'system' ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                  <path d="M3.5 3.5l1.5 1.5M11 11l1.5 1.5M3.5 12.5l1.5-1.5M11 5l1.5-1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                </svg>
              ) : isDark ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13 10.5A6 6 0 015.5 3a6 6 0 107.5 7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                  <path d="M3.5 3.5l1.5 1.5M11 11l1.5 1.5M3.5 12.5l1.5-1.5M11 5l1.5-1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                </svg>
              )}
            </button>
            {isAuthenticated && (
              <span className="header-user" title={user?.email}>
                {user?.name || user?.email?.split('@')[0]}
                {isAdmin && <span className="admin-badge">Admin</span>}
              </span>
            )}
            {isAdmin && (
              <button className="btn-icon" onClick={() => setDevPanelVisible(v => !v)} title="Toggle Dev Console">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12l-4-3 4-3M10 4l4 3-4 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
        {isAuthenticated ? (
          <div className="chat-and-dev">
            <ChatWindow
              activeId={activeId}
              messages={messages}
              onAddMessage={addMessage}
              onUpdateLastMessage={updateLastMessage}
              onSetMessages={setMessages}
              onConversationUpdate={loadConversations}
              onLoadConversation={loadConversation}
              onNewConversation={newConversation}
            />
            {isAdmin && (
              <DevPanel
                visible={devPanelVisible}
                onToggle={() => setDevPanelVisible(v => !v)}
              />
            )}
          </div>
        ) : (
          <div className="chat-empty">
            <div className="chat-empty-content">
              <svg width="40" height="40" viewBox="0 0 32 32" fill="none" style={{ margin: '0 auto 12px', display: 'block' }}>
                <rect width="32" height="32" rx="8" fill="#cc785c"/>
                <text x="16" y="22" textAnchor="middle" fill="#fff" fontFamily="system-ui" fontWeight="700" fontSize="18">M</text>
              </svg>
              <h1 className="chat-empty-title">Mofa Chat</h1>
              <p className="chat-empty-subtitle">Sign in to start chatting</p>
              <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => setAuthOpen(true)}>
                Sign in
              </button>
              <p className="chat-empty-hint">
                Don't have an account?{' '}
                <button className="auth-switch" onClick={() => setAuthOpen(true)}>Create one</button>
              </p>
            </div>
          </div>
        )}
      </div>
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
      {authOpen && <AuthPage onClose={() => { setAuthOpen(false); loadConversations(); }} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
