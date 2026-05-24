import { useState } from 'react';

export function useAnalyze() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async (ticker: string, style: string) => {
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

      return data;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { analyze, loading, error };
}
