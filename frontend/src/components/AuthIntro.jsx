import React from 'react';
import './AuthIntro.css';

const AuthIntro = () => {
  return (
    <div className="auth-intro-container">
      <div className="auth-intro-header">
        <i className="fas fa-step-forward auth-intro-logo"></i>
        <span>NextStep</span>
      </div>
      <div className="auth-intro-content">
        <h1>Streamline Your Casework. Amplify Your Impact.</h1>
        <p>
          The essential platform for social workers to manage cases, connect with clients, and access critical resources efficiently.
        </p>
      </div>
      <div className="auth-intro-footer">
        <p>© 2024 NextStep. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AuthIntro; 