import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState } from '../App';

export default function PublishPage({ appState }: { appState: AppState }) {
  const navigate = useNavigate();
  const [caption, setCaption] = useState(`Check out this AI-generated SWOT analysis for ${appState.ticker}! #investing #stocks #${appState.ticker}`);
  const [platforms, setPlatforms] = useState<Record<string, boolean>>({
    x: true,
    linkedin: true,
    facebook: false,
    tiktok: false,
  });
  const [status, setStatus] = useState<any>(null);
  const [publishing, setPublishing] = useState(false);
  const [configured, setConfigured] = useState<any>({});

  useEffect(() => {
    fetch('http://localhost:3001/api/social-status')
      .then(res => res.json())
      .then(data => {
        setConfigured(data);
        // Deselect unconfigured platforms
        setPlatforms(prev => {
          const next = { ...prev };
          Object.keys(next).forEach(k => {
            if (!data[k]) next[k] = false;
          });
          return next;
        });
      });
  }, []);

  if (!appState.infographicUrls.jpeg) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>No infographic generated yet.</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>Go Back</button>
      </div>
    );
  }

  const handlePublish = async () => {
    const selected = Object.entries(platforms).filter(([_, v]) => v).map(([k]) => k);
    if (selected.length === 0) return;

    setPublishing(true);
    setStatus(null);

    try {
      // Need local path, extract from URL
      const filename = appState.infographicUrls.jpeg!.split('/').pop();
      const localPath = `${process.cwd() ? process.cwd() : '.'}/output/${filename}`; // Simplification for demo

      const res = await fetch('http://localhost:3001/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: selected,
          imagePath: localPath,
          caption
        }),
      });

      const data = await res.json();
      setStatus(data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Publish to Social Media</h2>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Caption</h3>
            <textarea
              className="input"
              rows={4}
              value={caption}
              onChange={e => setCaption(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Platforms</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {['x', 'linkedin', 'facebook', 'tiktok'].map(p => (
                <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: configured[p] ? 1 : 0.5 }}>
                  <input
                    type="checkbox"
                    checked={platforms[p]}
                    disabled={!configured[p]}
                    onChange={e => setPlatforms({ ...platforms, [p]: e.target.checked })}
                    style={{ width: '1.2rem', height: '1.2rem' }}
                  />
                  <span style={{ fontSize: '1.2rem', textTransform: 'capitalize' }}>
                    {p === 'x' ? 'X (Twitter)' : p}
                  </span>
                  {!configured[p] && <span style={{ fontSize: '0.8rem', color: 'var(--warning)' }}>(Not Configured)</span>}
                </label>
              ))}
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={handlePublish}
                disabled={publishing || Object.values(platforms).every(v => !v)}
              >
                {publishing ? <div className="spinner" /> : 'Publish Now'}
              </button>
            </div>
          </div>

          {status && (
            <div className="card" style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Results</h3>
              {Object.entries(status).map(([platform, result]: [string, any]) => (
                <div key={platform} style={{ 
                  padding: '1rem', 
                  background: result.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <strong style={{ textTransform: 'capitalize' }}>{platform}</strong>
                  {result.success ? (
                    <a href={result.postUrl || '#'} target="_blank" rel="noreferrer" style={{ color: 'var(--success)' }}>View Post ↗</a>
                  ) : (
                    <span style={{ color: 'var(--error)' }}>Failed: {result.error}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: '300px' }}>
          <div style={{ borderRadius: '12px', overflow: 'hidden', border: '4px solid var(--border)' }}>
            <img 
              src={appState.infographicUrls.jpeg} 
              alt="Preview" 
              style={{ width: '100%', height: 'auto', display: 'block' }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
