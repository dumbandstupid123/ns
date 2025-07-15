import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import AuthIntro from './AuthIntro.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Clear errors when component mounts or when user starts typing
  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (email || password) {
      clearError();
    }
  }, [email, password, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    console.log('Login form submitted');
    setIsLoading(true);
    
    try {
      await login(email, password);
      console.log('Login successful, navigating to dashboard');
      navigate('/');
    } catch (error) {
      console.error('Login error in component:', error);
      // Error is already handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log('Google login button clicked');
    setIsLoading(true);
    
    try {
      await loginWithGoogle();
      console.log('Google login successful, navigating to dashboard');
      navigate('/');
    } catch (error) {
      console.error('Google login error in component:', error);
      // Error is already handled in AuthContext
    } finally {
      setIsLoading(false);
    }
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

          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Welcome back</h2>
            <p className="auth-subtitle">Sign in to continue to NextStep</p>
            
            {error && (
              <div className="error-message" style={{ 
                backgroundColor: '#fee', 
                color: '#c33', 
                padding: '10px', 
                borderRadius: '4px', 
                marginBottom: '15px',
                border: '1px solid #fcc'
              }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit" 
              className="auth-button primary"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleLogin}
              className="auth-button google"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : (
                <>
                  <img src="/google-icon.svg" alt="Google" width="20" height="20" />
                  Continue with Google
                </>
              )}
            </button>

            <div className="auth-links">
              <Link to="/register">Don't have an account? Sign up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 