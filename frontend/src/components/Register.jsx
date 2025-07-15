import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import AuthIntro from './AuthIntro.jsx';


const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup, loginWithGoogle, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      // Basic validation
      return;
    }
    setIsLoading(true);
    try {
      await signup(email, password, 'New User');
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
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
            <Link to="/login" className="auth-link-top">
              Login
            </Link>
          </div>
          <div className="auth-form-content">
            <h1>Create an account</h1>
            <p>Enter your email below to create your account</p>
            {error && <p className="auth-error">{error}</p>}
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="auth-input"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.targe.value)}
                placeholder="Password"
                required
                className="auth-input"
              />
              <button type="submit" disabled={isLoading} className="auth-btn-primary">
                {isLoading ? 'Creating Account...' : 'Sign In with Email'}
              </button>
            </form>
            <div className="auth-divider">
              <span>OR CONTINUE WITH</span>
            </div>
            <button onClick={handleGoogleLogin} disabled={isLoading} className="auth-btn-secondary">
              <i className="fab fa-google"></i>
              Google
            </button>
            <p className="auth-legal">
              By clicking continue, you agree to our{' '}
              <Link to="/terms" className="auth-link">Terms of Service</Link> and{' '}
              <Link to="/privacy" className="auth-link">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 