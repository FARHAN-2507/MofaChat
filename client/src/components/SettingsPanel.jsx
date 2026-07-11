import { useState, useEffect } from 'react';
import { fetchModels, fetchSettings, updateSettings } from '../lib/api';

export default function SettingsPanel({ onClose }) {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchModels(), fetchSettings()])
      .then(([modelsData, settingsData]) => {
        setModels(modelsData);
        setSelectedModel(settingsData.selectedModel || modelsData[0]?.id || '');
      })
      .catch(err => setError(err.message));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updateSettings({ selectedModel });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button className="btn-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="settings-body">
          <div className="settings-field">
            <label className="settings-label">Model</label>
            <select
              className="settings-select"
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.label} ({m.id})</option>
              ))}
            </select>
          </div>

          <div className="settings-field">
            <p className="settings-note">
              All models are <strong>free</strong> on Groq. Get an API key at{' '}
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="settings-link">
                console.groq.com/keys
              </a>
              {' '}(no credit card required). Add it to your <code>.env</code> file as <code>GROQ_API_KEY</code>.
            </p>
          </div>

          {error && <p className="settings-error">{error}</p>}
          {saved && <p className="settings-success">Settings saved</p>}
        </div>

        <div className="settings-footer">
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
