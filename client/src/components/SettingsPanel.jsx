import { useState, useEffect } from 'react';
import { updateProfile } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function SettingsPanel({ onClose }) {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(user?.name || '');
  }, [user?.name]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updateProfile({ name: name.trim() });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const initial = (user?.name?.charAt(0) || user?.email?.charAt(0) || 'M').toUpperCase();

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2 className="settings-title">Profile</h2>
          <button className="btn-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="settings-body">
          <div className="settings-profile-avatar">
            <div className="profile-avatar">{initial}</div>
            <div className="profile-email">{user?.email}</div>
          </div>

          <div className="settings-field">
            <label className="settings-label">Display Name</label>
            <input
              className="settings-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          {error && <p className="settings-error">{error}</p>}
          {saved && <p className="settings-success">Profile updated</p>}
        </div>

        <div className="settings-footer">
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || !name.trim()}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
