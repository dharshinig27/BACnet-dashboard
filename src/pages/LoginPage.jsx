import React, { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [email,    setEmail]    = useState('admin@building.io');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    // Simulate auth — replace with real API call later
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1000);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8faf9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ width: 400 }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
          <div style={{
            width: 36, height: 36, background: '#1a5c3e',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 20, color: '#0f2d1e', letterSpacing: '-0.3px' }}>
            BACnet BMS
          </span>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #e2ede8',
          padding: '36px 32px',
        }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#0f2d1e' }}>Sign in</h2>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: '#5a7d6b' }}>
            Building Automation &amp; Control Network
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1a3d2b', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@building.io"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1a3d2b', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={inputStyle}
              />
            </div>

            {error && (
              <p style={{ color: '#c0392b', fontSize: 13, margin: '-12px 0 16px' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                background: loading ? '#5a7d6b' : '#1a5c3e',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.2px',
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#8aab9b', marginTop: 20, marginBottom: 0 }}>
            Demo: use any password
          </p>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24 }}>
          {['Network: Main Site', 'BACnet/IP · UDP 47808', 'v2.4.1'].map(t => (
            <span key={t} style={{ fontSize: 12, color: '#8aab9b' }}>{t}</span>
          ))}
        </div>

      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #c8ddd2',
  borderRadius: 8,
  fontSize: 14,
  outline: 'none',
  color: '#0f2d1e',
  background: '#fafcfb',
};
