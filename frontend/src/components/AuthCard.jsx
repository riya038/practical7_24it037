import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  KeyRound,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthCard({ onAuthSuccess }) {
  const { login, register, authError, setAuthError } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setAuthError(null);

    if (mode === 'register' && !name.trim()) {
      setLocalError('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      if (mode === 'login') {
        await login({ email: email.trim(), password });
      } else {
        await register({ name: name.trim(), email: email.trim(), password });
      }
      if (onAuthSuccess) onAuthSuccess(mode);
    } catch (err) {
      setLocalError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setName('Demo Student (24IT037)');
    setEmail('student@charusat.edu.in');
    setPassword('Charusat@123');
    setLocalError('');
  };

  return (
    <div className="auth-card-container">
      <div className="auth-card">
        {/* Card Header */}
        <div className="auth-card-header">
          <div className="auth-badge-icon">
            <KeyRound size={26} />
          </div>
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create an Account'}</h2>
          <p className="auth-card-desc">
            {mode === 'login'
              ? 'Sign in with your email & password to access your JWT-protected tasks.'
              : 'Register your account to experience hashed passwords and JWT token generation.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setLocalError('');
              setAuthError(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register');
              setLocalError('');
              setAuthError(null);
            }}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {(localError || authError) && (
          <div className="auth-error-banner">
            <span>{localError || authError}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">
                Full Name <span className="required-star">*</span>
              </label>
              <div className="input-icon-wrap">
                <User size={16} className="input-icon" />
                <input
                  id="auth-name"
                  type="text"
                  className="form-input with-icon"
                  placeholder="e.g., Riya Kalariya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">
              Email Address <span className="required-star">*</span>
            </label>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon" />
              <input
                id="auth-email"
                type="email"
                className="form-input with-icon"
                placeholder="e.g., student@charusat.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">
              Password <span className="required-star">*</span>
            </label>
            <div className="input-icon-wrap">
              <Lock size={16} className="input-icon" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input with-icon with-action"
                placeholder="Min 6 characters (hashed with bcrypt)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="btn-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spinner" />
                <span>{mode === 'login' ? 'Authenticating...' : 'Registering User...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Quick Demo Helper */}
          <div className="demo-helper-row">
            <button
              type="button"
              className="btn-demo-fill"
              onClick={handleDemoFill}
              title="Auto-fill sample credentials for rapid testing"
            >
              <Sparkles size={14} />
              <span>Fill Demo Credentials</span>
            </button>
          </div>
        </form>

        
      </div>
    </div>
  );
}
