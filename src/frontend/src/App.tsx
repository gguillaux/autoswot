import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AnalyzePage from './pages/AnalyzePage';
import InfographicPage from './pages/InfographicPage';
import PublishPage from './pages/PublishPage';

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
      <nav className="navbar">
        <h1>AutoSWOT</h1>
      </nav>
      <main className="container">
        <Routes>
          <Route path="/" element={<AnalyzePage appState={appState} setAppState={setAppState} />} />
          <Route path="/infographic" element={<InfographicPage appState={appState} setAppState={setAppState} />} />
          <Route path="/publish" element={<PublishPage appState={appState} />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
