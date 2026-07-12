import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

function groupByDate(conversations) {
  const groups = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const thisWeek = new Date(today.getTime() - 6 * 86400000);

  for (const conv of conversations) {
    const date = new Date(conv.updatedAt || conv.createdAt);
    let key;
    if (date >= today) key = 'Today';
    else if (date >= yesterday) key = 'Yesterday';
    else if (date >= thisWeek) key = 'Previous 7 days';
    else key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(conv);
  }
  return groups;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
  onSettings,
  onAuth,
  isOpen,
  onClose,
}) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cycleMode, isDark, theme } = useTheme();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? conversations.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    : conversations;

  const grouped = groupByDate(filtered);

  const handleRename = (id) => {
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#cc785c"/>
            <text x="16" y="22" textAnchor="middle" fill="#fff" fontFamily="system-ui" fontWeight="700" fontSize="18">M</text>
          </svg>
          <span className="sidebar-brand-text">Mofa</span>
        </div>
        {isAuthenticated && (
          <div className="sidebar-header">
            <button className="btn-new-chat" onClick={onNew}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              New conversation
            </button>
          </div>
        )}
        {isAuthenticated && (
          <div className="sidebar-search">
            <div className="sidebar-search-wrap">
              <input
                className="sidebar-search-input"
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="sidebar-search-clear" onClick={() => setSearch('')} title="Clear search">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        <div className="sidebar-conversations">
          {!isAuthenticated && (
            <div className="sidebar-auth-prompt">
              <p className="sidebar-auth-title">Mofa Chat</p>
              <p className="sidebar-auth-sub">Sign in to start chatting</p>
            </div>
          )}
          {isAuthenticated && conversations.length === 0 && (
            <p className="sidebar-empty">No conversations yet</p>
          )}
          {isAuthenticated && Object.entries(grouped).map(([group, convs]) => (
            <div key={group} className="sidebar-group">
              <p className="sidebar-group-label">{group}</p>
              {convs.map(conv => (
                <div
                  key={conv._id}
                  className={`sidebar-item ${activeId === conv._id ? 'active' : ''}`}
                >
                  {editingId === conv._id ? (
                    <input
                      className="sidebar-rename-input"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onBlur={() => handleRename(conv._id)}
                      onKeyDown={e => e.key === 'Enter' && handleRename(conv._id)}
                      autoFocus
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <button
                      className="sidebar-item-btn"
                      onClick={() => { onSelect(conv._id); onClose(); }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingId(conv._id);
                        setEditTitle(conv.title);
                      }}
                    >
                      <span className="sidebar-item-title">{conv.title}</span>
                    </button>
                  )}
                  <button
                    className="sidebar-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv._id);
                    }}
                    title="Delete conversation"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <div className="sidebar-footer-row">
            <button className="btn-ghost btn-theme-toggle" onClick={cycleMode} title={`Theme: ${theme}`}>
              {theme === 'system' ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                  <path d="M3.5 3.5l1.5 1.5M11 11l1.5 1.5M3.5 12.5l1.5-1.5M11 5l1.5-1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                </svg>
              ) : isDark ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M13 10.5A6 6 0 015.5 3a6 6 0 107.5 7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                  <path d="M3.5 3.5l1.5 1.5M11 11l1.5 1.5M3.5 12.5l1.5-1.5M11 5l1.5-1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                </svg>
              )}
              <span className="btn-theme-label">{theme === 'system' ? 'Auto' : isDark ? 'Dark' : 'Light'}</span>
            </button>
          </div>
          {isAuthenticated && (
            <div className="sidebar-user">
              <span className="sidebar-user-email" title={user?.email}>
                {user?.name || user?.email}
                {isAdmin && <span className="admin-badge-sm">Admin</span>}
              </span>
              <button className="sidebar-logout" onClick={logout}>Sign out</button>
            </div>
          )}
          {isAuthenticated && (
            <button className="btn-settings" onClick={() => { onSettings(); onClose(); }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Settings
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
