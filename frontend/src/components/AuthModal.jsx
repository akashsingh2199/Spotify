import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('artist');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        mode === 'login'
          ? { email: email.includes('@') ? email : undefined, username: !email.includes('@') ? email : undefined, password }
          : { username, email, password, role };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed');
      }

      onAuthSuccess(data.user, `${mode === 'login' ? 'Welcome back' : 'Account created'}!`);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'login' ? 'Log in to Spotify' : 'Sign up to start listening'}
          </h2>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Log in
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Sign up
          </button>
        </div>

        {error && (
          <div style={{ color: '#ff5555', fontSize: '13px', marginBottom: '16px', background: 'rgba(255,85,85,0.1)', padding: '10px 14px', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">{mode === 'login' ? 'Email or Username' : 'Email address'}</label>
            <input
              type="text"
              className="form-input"
              placeholder={mode === 'login' ? 'Enter email or username' : 'name@example.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <div className="role-selector">
                <div
                  className={`role-option ${role === 'artist' ? 'selected' : ''}`}
                  onClick={() => setRole('artist')}
                >
                  Artist / Creator
                </div>
                <div
                  className={`role-option ${role === 'user' ? 'selected' : ''}`}
                  onClick={() => setRole('user')}
                >
                  Listener
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <div className="spinner" /> : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
