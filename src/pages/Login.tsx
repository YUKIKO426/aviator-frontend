import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './auth.scss';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      localStorage.setItem('aviator_token', data.token);
      localStorage.setItem('aviator_user', JSON.stringify(data.user));
      navigate(`/?cert=${data.token}`);
    } catch {
      setError('Connection failed. Make sure backend is running.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert('Google login coming soon!');
  };

  return (
    <div className="auth-page">
      <div className="auth-modal">
        <Link to="/register" className="auth-modal-close">×</Link>

        <h2 className="auth-modal-title">Log In</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <span className="auth-field-icon">👤</span>
            <input
              type="text"
              placeholder="Phone number or Email"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div className="auth-field">
            <span className="auth-field-icon">🔒</span>
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div className="auth-forgot">
            <a href="#">Forgot password?</a>
          </div>

          <button type="submit" className="auth-btn-red" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <div className="auth-social-row">
          <button className="auth-social-btn google" onClick={handleGoogleLogin}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </button>
          <button className="auth-social-btn telegram" onClick={() => window.open('https://t.me/yourbotusername', '_blank')}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#2AABEE">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.674l-2.95-.924c-.642-.204-.654-.642.136-.953l11.538-4.45c.535-.194 1.003.13.858.9z"/>
            </svg>
          </button>
        </div>

        <div className="auth-login-link">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}
