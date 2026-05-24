import { useNavigate } from 'react-router-dom';
import { AppState } from '../App';

export default function InfographicPage({ appState }: { appState: AppState, setAppState: any }) {
  const navigate = useNavigate();

  if (!appState.infographicUrls.jpeg) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>No infographic generated yet.</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Infographic Preview</h2>
        <button className="btn btn-primary" onClick={() => navigate('/publish')}>
          Proceed to Publish →
        </button>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            width: '400px', 
            borderRadius: '20px', 
            overflow: 'hidden', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '8px solid #333'
          }}>
            <img 
              src={appState.infographicUrls.jpeg} 
              alt="Generated Infographic" 
              style={{ width: '100%', height: 'auto', display: 'block' }} 
            />
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Analysis Summary</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {appState.analysisData?.overview}
            </p>
            
            <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Strengths</h4>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              {appState.analysisData?.swot?.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ul>
            
            <h4 style={{ color: 'var(--error)', marginBottom: '0.5rem' }}>Risks</h4>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
              {appState.analysisData?.swot?.threats.map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
