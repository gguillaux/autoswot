import { useState, useEffect } from 'react';

export function usePublish() {
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [configured, setConfigured] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('http://localhost:3001/api/social-status')
      .then(res => res.json())
      .then(data => setConfigured(data))
      .catch(err => console.error('Failed to fetch social status:', err));
  }, []);

  const publish = async (platforms: string[], imagePath: string, caption: string) => {
    setPublishing(true);
    setStatus(null);

    try {
      // Simplification for prototype: Extract filename to load from local output
      const filename = imagePath.split('/').pop();
      // Using generic dot-slash or absolute path depending on backend handling
      // The backend expects a local server-side path, in a real app this is handled differently
      const localPath = `./output/${filename}`; 

      const res = await fetch('http://localhost:3001/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms,
          imagePath: localPath,
          caption
        }),
      });

      const data = await res.json();
      setStatus(data.results);
      return data.results;
    } catch (err) {
      console.error(err);
      setStatus({ error: 'Publish failed' });
      return null;
    } finally {
      setPublishing(false);
    }
  };

  return { publish, publishing, status, configured };
}
