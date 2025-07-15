import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import AuthIntro from './AuthIntro.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle, bypassLogin, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }
    setIsLoading(true);
    try {
      console.log('Form submitted with:', { email, password });
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Google login error:', error);
      alert('Google login failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // TEMPORARY: Bypass login for testing
  const handleBypassLogin = () => {
    console.log('Using bypass login');
    bypassLogin();
    navigate('/');
  };

  return (
    <div className="auth-container">
      <AuthIntro />
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <Link to="/register" className="auth-link-top">
              Create account
            </Link>
          </div>
          
          <div className="auth-form-content">
            <h2>Welcome back</h2>
            <p>Sign in to your account</p>

            {error && (
              <div className="error-message" style={{
                background: '#fee', 
                color: '#c33', 
                padding: '10px', 
                borderRadius: '4px', 
                marginBottom: '15px'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <button 
                type="submit" 
                className="auth-button primary"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button 
              onClick={handleGoogleLogin}
              className="auth-button google"
              disabled={isLoading}
            >
              Continue with Google
            </button>

            {/* TEMPORARY BYPASS BUTTON - Remove in production */}
            <div style={{ marginTop: '20px', padding: '10px', background: '#fff3cd', borderRadius: '4px' }}>
              <p style={{ fontSize: '12px', color: '#856404', margin: '0 0 10px 0' }}>
                🚧 TESTING MODE: Skip authentication
              </p>
              <button 
                onClick={handleBypassLogin}
                style={{
                  background: '#ffc107',
                  color: '#212529',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Skip Login (Testing)
              </button>
            </div>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="auth-link">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 