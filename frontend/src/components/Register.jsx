import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import AuthIntro from './AuthIntro.jsx';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const { signup, loginWithGoogle, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Clear errors when component mounts or when user starts typing
  useEffect(() => {
    clearError();
    setLocalError('');
  }, [clearError]);

  useEffect(() => {
    if (email || password || confirmPassword || displayName) {
      clearError();
      setLocalError('');
    }
  }, [email, password, confirmPassword, displayName, clearError]);

  const validateForm = () => {
    if (!email || !password || !displayName) {
      setLocalError('All fields are required');
      return false;
    }
    
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Register form submitted');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setLocalError('');
    
    try {
      console.log('Attempting to create account for:', email);
      await signup(email, password, displayName);
      console.log('Account created successfully, navigating to dashboard');
      navigate('/');
    } catch (error) {
      console.error('Registration error in component:', error);
      // Error is already handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async (e) => {
    e.preventDefault(); // Prevent form submission
    console.log('Google signup button clicked');
    setIsLoading(true);
    setLocalError('');
    
    try {
      await loginWithGoogle();
      console.log('Google signup successful, navigating to dashboard');
      navigate('/');
    } catch (error) {
      console.error('Google signup error in component:', error);
      // Error is already handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = error || localError;

  return (
    <div className="auth-container">
      <AuthIntro />
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <Link to="/login" className="auth-link-top">
              Login
            </Link>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Create an account</h2>
            <p className="auth-subtitle">Enter your details to get started with NextStep</p>
            
            {displayError && (
              <div className="error-message" style={{ 
                backgroundColor: '#fee', 
                color: '#c33', 
                padding: '10px', 
                borderRadius: '4px', 
                marginBottom: '15px',
                border: '1px solid #fcc'
              }}>
                {displayError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="displayName">Full Name</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={isLoading}
                autoComplete="name"
              />
            </div>

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
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min 6 characters)"
                required
                disabled={isLoading}
                autoComplete="new-password"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
                autoComplete="new-password"
                minLength="6"
              />
            </div>

            <button 
              type="submit" 
              className="auth-button primary"
              disabled={isLoading || !email || !password || !confirmPassword || !displayName}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button 
              type="button"
              onClick={handleGoogleSignup}
              className="auth-button google"
              disabled={isLoading}
            >
              {isLoading ? 'Signing up...' : (
                <>
                  <img src="/google-icon.svg" alt="Google" width="20" height="20" />
                  Continue with Google
                </>
              )}
            </button>

            <div className="auth-links">
              <Link to="/login">Already have an account? Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 