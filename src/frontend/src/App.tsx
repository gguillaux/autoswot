import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import AnalyzePage from './pages/AnalyzePage';
import InfographicPage from './pages/InfographicPage';
import PublishPage from './pages/PublishPage';
import SettingsPage from './pages/SettingsPage';

export interface AppState {
  ticker: string;
  style: string;
  analysisData: any | null;
  infographicUrls: { jpeg?: string; png?: string };
}

function App() {
  const [appState, setAppState] = useState<AppState>({
    ticker: '',
    style: 'dark_gradient',
    analysisData: null,
    infographicUrls: {},
  });

  return (
    <>
      <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>AutoSWOT</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Analysis</Link>
          <Link to="/settings" style={{ color: 'white', textDecoration: 'none' }}>Settings</Link>
        </div>
      </nav>
      <main className="container">
        <Routes>
          <Route path="/" element={<AnalyzePage appState={appState} setAppState={setAppState} />} />
          <Route path="/infographic" element={<InfographicPage appState={appState} setAppState={setAppState} />} />
          <Route path="/publish" element={<PublishPage appState={appState} />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
