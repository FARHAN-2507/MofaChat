import { useState, useEffect } from 'react';

export default function DevPanel({ visible, onToggle }) {
  const [status, setStatus] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState('');
  const [tab, setTab] = useState('status');

  useEffect(() => {
    if (visible) fetchStatus();
  }, [visible]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/health/status');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setStatus({ error: err.message });
    }
  };

  const runTest = async () => {
    setTestLoading(true);
    setTestError('');
    setTestResult(null);
    try {
      const res = await fetch('/api/health/test', { method: 'POST' });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestError(err.message);
    } finally {
      setTestLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="dev-panel">
      <div className="dev-panel-header">
        <span className="dev-panel-title">Dev Console</span>
        <button className="dev-panel-close" onClick={onToggle}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="dev-tabs">
        <button className={`dev-tab ${tab === 'status' ? 'active' : ''}`} onClick={() => setTab('status')}>Status</button>
        <button className={`dev-tab ${tab === 'test' ? 'active' : ''}`} onClick={() => setTab('test')}>API Test</button>
        <button className={`dev-tab ${tab === 'raw' ? 'active' : ''}`} onClick={() => setTab('raw')}>Raw</button>
      </div>

      <div className="dev-panel-body">
        {tab === 'status' && (
          <div className="dev-section">
            <div className="dev-row">
              <span className="dev-label">DB</span>
              <span className={`dev-badge ${status?.db?.readyState === 1 ? 'ok' : 'err'}`}>
                {status?.db?.status || '...'}
              </span>
            </div>
            <div className="dev-row">
              <span className="dev-label">API Key (.env)</span>
              <span className={`dev-badge ${status?.apiKey?.configured ? 'ok' : 'err'}`}>
                {status?.apiKey?.configured ? 'Configured' : 'Missing'}
              </span>
            </div>
            <div className="dev-row">
              <span className="dev-label">Key Override</span>
              <span className={`dev-badge ${status?.apiKey?.hasOverride ? 'ok' : 'muted'}`}>
                {status?.apiKey?.hasOverride ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="dev-row">
              <span className="dev-label">Model</span>
              <span className="dev-value">{status?.model || '...'}</span>
            </div>
            <div className="dev-row">
              <span className="dev-label">Node</span>
              <span className="dev-value">{status?.environment?.node || '...'}</span>
            </div>
            <button className="dev-refresh-btn" onClick={fetchStatus}>Refresh</button>
          </div>
        )}

        {tab === 'test' && (
          <div className="dev-section">
            <p className="dev-hint">Sends a short test prompt to OpenRouter to verify the API key and model work.</p>
            <button
              className="dev-test-btn"
              onClick={runTest}
              disabled={testLoading}
            >
              {testLoading ? 'Testing...' : 'Test API Connection'}
            </button>
            {testError && <p className="dev-error">{testError}</p>}
            {testResult && (
              <div className="dev-result">
                <div className="dev-row">
                  <span className="dev-label">Status</span>
                  <span className={`dev-badge ${testResult.success ? 'ok' : 'err'}`}>
                    {testResult.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                {testResult.status && (
                  <div className="dev-row">
                    <span className="dev-label">HTTP</span>
                    <span className="dev-value">{testResult.status}</span>
                  </div>
                )}
                {testResult.model && (
                  <div className="dev-row">
                    <span className="dev-label">Model</span>
                    <span className="dev-value">{testResult.model}</span>
                  </div>
                )}
                {testResult.data?.choices?.[0]?.message?.content && (
                  <div className="dev-row">
                    <span className="dev-label">Response</span>
                    <span className="dev-value dev-response-text">{testResult.data.choices[0].message.content}</span>
                  </div>
                )}
                {testResult.error && (
                  <div className="dev-row">
                    <span className="dev-label">Error</span>
                    <span className="dev-value dev-error-text">{testResult.error}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'raw' && (
          <div className="dev-section">
            <p className="dev-hint">Raw diagnostic data (status + last test result).</p>
            <pre className="dev-raw">{JSON.stringify({ status, testResult }, null, 2)}</pre>
            <button className="dev-refresh-btn" onClick={() => { fetchStatus(); }}>Refresh</button>
          </div>
        )}
      </div>
    </div>
  );
}
