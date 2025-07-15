import React, { useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

const FirebaseTest = () => {
  const [firebaseStatus, setFirebaseStatus] = useState({});
  const [testResults, setTestResults] = useState({});
  const [testEmail] = useState('test@example.com');
  const [testPassword] = useState('test123456');
  const { currentUser, error } = useAuth();

  useEffect(() => {
    const checkFirebaseStatus = () => {
      const status = {
        authInitialized: !!auth,
        authConfig: auth?.config || 'Not available',
        currentUser: currentUser ? {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          emailVerified: currentUser.emailVerified
        } : null,
        error: error,
        authDomain: auth?.config?.authDomain || 'Not available',
        projectId: auth?.config?.projectId || 'Not available'
      };
      
      console.log('Firebase Status Check:', status);
      setFirebaseStatus(status);
    };

    checkFirebaseStatus();
  }, [currentUser, error]);

  const testDirectSignIn = async () => {
    try {
      console.log('Testing direct email sign-in...');
      setTestResults(prev => ({ ...prev, directSignIn: 'Testing...' }));
      
      const result = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('Direct sign-in successful:', result.user);
      setTestResults(prev => ({ 
        ...prev, 
        directSignIn: `✅ Success: ${result.user.email}` 
      }));
    } catch (error) {
      console.error('Direct sign-in failed:', error);
      setTestResults(prev => ({ 
        ...prev, 
        directSignIn: `❌ Failed: ${error.code} - ${error.message}` 
      }));
    }
  };

  const testDirectSignUp = async () => {
    try {
      console.log('Testing direct email sign-up...');
      setTestResults(prev => ({ ...prev, directSignUp: 'Testing...' }));
      
      const randomEmail = `test${Date.now()}@example.com`;
      const result = await createUserWithEmailAndPassword(auth, randomEmail, testPassword);
      console.log('Direct sign-up successful:', result.user);
      setTestResults(prev => ({ 
        ...prev, 
        directSignUp: `✅ Success: ${result.user.email}` 
      }));
    } catch (error) {
      console.error('Direct sign-up failed:', error);
      setTestResults(prev => ({ 
        ...prev, 
        directSignUp: `❌ Failed: ${error.code} - ${error.message}` 
      }));
    }
  };

  const testDirectGoogleSignIn = async () => {
    try {
      console.log('Testing direct Google sign-in...');
      setTestResults(prev => ({ ...prev, directGoogle: 'Testing...' }));
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      console.log('Direct Google sign-in successful:', result.user);
      setTestResults(prev => ({ 
        ...prev, 
        directGoogle: `✅ Success: ${result.user.email}` 
      }));
    } catch (error) {
      console.error('Direct Google sign-in failed:', error);
      setTestResults(prev => ({ 
        ...prev, 
        directGoogle: `❌ Failed: ${error.code} - ${error.message}` 
      }));
    }
  };

  const testAuthContextSignIn = async () => {
    try {
      console.log('Testing AuthContext sign-in...');
      setTestResults(prev => ({ ...prev, contextSignIn: 'Testing...' }));
      
      const { login } = useAuth();
      await login(testEmail, testPassword);
      setTestResults(prev => ({ 
        ...prev, 
        contextSignIn: '✅ Success via AuthContext' 
      }));
    } catch (error) {
      console.error('AuthContext sign-in failed:', error);
      setTestResults(prev => ({ 
        ...prev, 
        contextSignIn: `❌ Failed: ${error.message}` 
      }));
    }
  };

  const checkFirebaseProjectSettings = () => {
    const settings = {
      expectedAuthDomain: 'next-step-299e3.firebaseapp.com',
      actualAuthDomain: firebaseStatus.authDomain,
      expectedProjectId: 'next-step-299e3',
      actualProjectId: firebaseStatus.projectId,
      authDomainMatch: firebaseStatus.authDomain === 'next-step-299e3.firebaseapp.com',
      projectIdMatch: firebaseStatus.projectId === 'next-step-299e3'
    };
    
    console.log('Firebase Project Settings Check:', settings);
    return settings;
  };

  const projectSettings = checkFirebaseProjectSettings();

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', margin: '20px', borderRadius: '8px', fontFamily: 'monospace' }}>
      <h2>🔥 Firebase Comprehensive Diagnostic</h2>
      
      {/* Firebase Status */}
      <div style={{ marginBottom: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '6px' }}>
        <h3>📊 Firebase Status</h3>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(firebaseStatus, null, 2)}
        </pre>
      </div>

      {/* Project Settings Check */}
      <div style={{ marginBottom: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '6px' }}>
        <h3>⚙️ Project Settings Check</h3>
        <div>
          <p>Auth Domain: {projectSettings.authDomainMatch ? '✅' : '❌'} {projectSettings.actualAuthDomain}</p>
          <p>Project ID: {projectSettings.projectIdMatch ? '✅' : '❌'} {projectSettings.actualProjectId}</p>
        </div>
      </div>

      {/* Test Results */}
      <div style={{ marginBottom: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '6px' }}>
        <h3>🧪 Test Results</h3>
        {Object.entries(testResults).map(([test, result]) => (
          <p key={test}><strong>{test}:</strong> {result}</p>
        ))}
      </div>

      {/* Test Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <h3>🔬 Run Tests</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={testDirectSignUp} style={{ padding: '8px 16px' }}>
            Test Direct Sign-Up
          </button>
          <button onClick={testDirectSignIn} style={{ padding: '8px 16px' }}>
            Test Direct Sign-In
          </button>
          <button onClick={testDirectGoogleSignIn} style={{ padding: '8px 16px' }}>
            Test Direct Google
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '6px' }}>
        <h3>📋 Debugging Steps</h3>
        <ol>
          <li><strong>Check Firebase Console:</strong>
            <ul>
              <li>Go to <a href="https://console.firebase.google.com/project/next-step-299e3/authentication/providers" target="_blank" rel="noopener noreferrer">Firebase Console Authentication</a></li>
              <li>Ensure Email/Password is enabled</li>
              <li>Ensure Google sign-in is enabled</li>
            </ul>
          </li>
          <li><strong>Check Authorized Domains:</strong>
            <ul>
              <li>Go to Authentication → Settings → Authorized domains</li>
              <li>Add: localhost, 127.0.0.1, and your Vercel domain</li>
            </ul>
          </li>
          <li><strong>Browser Console:</strong>
            <ul>
              <li>Open Developer Tools (F12)</li>
              <li>Check Console tab for errors</li>
              <li>Check Network tab for failed requests</li>
            </ul>
          </li>
          <li><strong>Test Account:</strong>
            <ul>
              <li>Try creating a test account manually in Firebase Console</li>
              <li>Email: {testEmail}</li>
              <li>Password: {testPassword}</li>
            </ul>
          </li>
        </ol>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee', padding: '15px', borderRadius: '6px', marginTop: '20px' }}>
          <h3>❌ Current Error</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default FirebaseTest; 