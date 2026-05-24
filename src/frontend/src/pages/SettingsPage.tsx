import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [status, setStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [geminiKey, setGeminiKey] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/social-status');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (platform: string) => {
    // Open OAuth window
    const url = `http://localhost:3001/api/oauth/${platform}/login`;
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      url, 
      `Connect ${platform}`, 
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Poll to see when popup closes to refresh status
    const timer = setInterval(() => {
      if (popup?.closed) {
        clearInterval(timer);
        fetchStatus();
      }
    }, 1000);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner" /></div>;
  }

  const platforms = [
    { id: 'x', name: 'X (Twitter)', icon: '𝕏' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'in' },
    { id: 'facebook', name: 'Facebook', icon: 'f' },
  ];

  const handleGeminiSave = async () => {
    try {
      await fetch('http://localhost:3001/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'gemini', data: { apiKey: geminiKey } })
      });
      fetchStatus();
      setGeminiKey('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', paddingBottom: '4rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>AI Configuration</h2>
      <div className="card" style={{ marginBottom: '3rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Google Gemini API Key</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Enter your Gemini API key to enable the AI Analysis pipeline. Status: {status.gemini ? <span style={{color:'var(--success)'}}>Configured</span> : <span style={{color:'var(--error)'}}>Missing</span>}
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="password" 
            className="input" 
            placeholder="AIzaSy..." 
            value={geminiKey}
            onChange={e => setGeminiKey(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={handleGeminiSave} disabled={!geminiKey}>Save</button>
        </div>
      </div>

      <h2 style={{ marginBottom: '2rem' }}>Social Media Accounts</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
        Connect your social media accounts via OAuth to enable one-click publishing. Access tokens are stored securely in your local filesystem.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {platforms.map(platform => {
          const isConnected = status[platform.id];
          return (
            <div key={platform.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '40px', height: '40px', 
                  borderRadius: '50%', 
                  background: 'var(--surface-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', fontSize: '1.2rem'
                }}>
                  {platform.icon}
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{platform.name}</h3>
                  <span style={{ fontSize: '0.9rem', color: isConnected ? 'var(--success)' : 'var(--text-secondary)' }}>
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
              </div>

              <button 
                className={`btn ${isConnected ? '' : 'btn-primary'}`}
                style={{ 
                  background: isConnected ? 'var(--surface-light)' : undefined,
                  color: isConnected ? 'var(--text-primary)' : undefined,
                }}
                onClick={() => handleConnect(platform.id)}
              >
                {isConnected ? 'Reconnect' : 'Connect'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
