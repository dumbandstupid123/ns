import React, { useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const FirebaseTest = () => {
  const [firebaseStatus, setFirebaseStatus] = useState({});
  const { currentUser, error } = useAuth();

  useEffect(() => {
    const checkFirebaseStatus = () => {
      const status = {
        authInitialized: !!auth,
        authConfig: auth?.config,
        currentUser: currentUser ? {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName
        } : null,
        error: error
      };
      
      console.log('Firebase Status Check:', status);
      setFirebaseStatus(status);
    };

    checkFirebaseStatus();
  }, [currentUser, error]);

  const testGoogleSignIn = async () => {
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      console.log('Testing Google sign-in...');
      
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in test successful:', result.user);
    } catch (error) {
      console.error('Google sign-in test failed:', error);
    }
  };

  const testEmailSignIn = async () => {
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      console.log('Testing email sign-in with test credentials...');
      
      // Try with test credentials - replace with actual test account
      const result = await signInWithEmailAndPassword(auth, 'test@example.com', 'password');
      console.log('Email sign-in test successful:', result.user);
    } catch (error) {
      console.error('Email sign-in test failed:', error);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', margin: '20px', borderRadius: '8px' }}>
      <h3>🔥 Firebase Debug Panel</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <h4>Firebase Status:</h4>
        <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
          {JSON.stringify(firebaseStatus, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4>Quick Tests:</h4>
        <button onClick={testGoogleSignIn} style={{ marginRight: '10px', padding: '8px 16px' }}>
          Test Google Sign-In
        </button>
        <button onClick={testEmailSignIn} style={{ padding: '8px 16px' }}>
          Test Email Sign-In
        </button>
      </div>

      <div>
        <h4>Console Log Instructions:</h4>
        <p>1. Open browser developer tools (F12)</p>
        <p>2. Check the Console tab for Firebase logs</p>
        <p>3. Look for any red error messages</p>
        <p>4. Check Network tab for failed requests</p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee', padding: '10px', borderRadius: '4px', marginTop: '15px' }}>
          <strong>Current Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default FirebaseTest; 