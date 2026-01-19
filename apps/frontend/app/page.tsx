// Server-side call to backend
async function getBackendData() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    const res = await fetch(`${backendUrl}/api/info`, {
      cache: 'no-store',
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Backend call failed:', error);
    return null;
  }
}

export default async function Home() {
  const data = await getBackendData();

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '500px',
        width: '90%'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1a202c' }}>
          🚀 Demo Domain App
        </h1>
        
        <p style={{ color: '#4a5568', marginBottom: '2rem' }}>
          Next.js Frontend + NestJS Backend on Kubernetes
        </p>

        {data ? (
          <div style={{
            background: '#f0fdf4',
            border: '2px solid #86efac',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <p style={{ color: '#166534', fontWeight: '600', marginBottom: '0.5rem' }}>
              ✅ Backend Connected
            </p>
            <div style={{ fontSize: '0.875rem', color: '#15803d' }}>
              <p><strong>App:</strong> {data.app}</p>
              <p><strong>Version:</strong> {data.version}</p>
              <p><strong>Environment:</strong> {data.environment}</p>
              <p><strong>Time:</strong> {new Date(data.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <div style={{
            background: '#fef2f2',
            border: '2px solid #fca5a5',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <p style={{ color: '#991b1b' }}>❌ Backend Unavailable</p>
          </div>
        )}
      </div>
    </main>
  );
}
