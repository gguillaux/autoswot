import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState } from '../App';

export default function AnalyzePage({ appState, setAppState }: { appState: AppState, setAppState: any }) {
  const [ticker, setTicker] = useState(appState.ticker);
  const [style, setStyle] = useState(appState.style);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker) return;
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: ticker.toUpperCase(), style }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      setAppState({
        ...appState,
        ticker: ticker.toUpperCase(),
        style,
        analysisData: data.analysis,
        infographicUrls: {
          jpeg: data.infographicJpegUrl,
          png: data.infographicPngUrl,
        }
      });
      
      navigate('/infographic');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Generate Security Analysis</h2>
      
      <form onSubmit={handleAnalyze} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Security Ticker</label>
          <input
            type="text"
            className="input"
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            placeholder="e.g. AAPL, MSFT, TSLA"
            required
            style={{ fontSize: '1.25rem', textTransform: 'uppercase' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Design Style</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['dark_gradient', 'clean_corporate', 'bold_editorial'].map(s => (
              <label key={s} style={{ 
                flex: 1, 
                padding: '1rem', 
                border: `2px solid ${style === s ? 'var(--accent-primary)' : 'var(--border)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'center',
                background: style === s ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
              }}>
                <input
                  type="radio"
                  name="style"
                  value={s}
                  checked={style === s}
                  onChange={e => setStyle(e.target.value)}
                  style={{ display: 'none' }}
                />
                {s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </label>
            ))}
          </div>
        </div>

        {error && <div style={{ color: 'var(--error)', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}

        <button type="submit" className="btn btn-primary" disabled={loading || !ticker}>
          {loading ? <div className="spinner" /> : 'Analyze & Generate Infographic'}
        </button>
      </form>
    </div>
  );
}
