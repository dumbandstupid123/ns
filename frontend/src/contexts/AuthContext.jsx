import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug: Log Firebase auth state
  useEffect(() => {
    console.log('Firebase Auth initialized:', auth);
    console.log('Firebase Auth currentUser:', auth.currentUser);
  }, []);

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    try {
      setError(null);
      console.log('Attempting signup with:', email);
      
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Signup successful:', user);
      
      // Update user profile with display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      return user;
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      setError(null);
      console.log('Attempting login with:', email);
      
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', user);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      console.log('Attempting Google login');
      
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      console.log('Google login successful:', user);
      
      return user;
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent');
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message);
      throw error;
    }
  };

  // TEMPORARY BYPASS FOR TESTING - Remove this in production
  const bypassLogin = () => {
    console.log('BYPASS: Setting fake user for testing');
    setCurrentUser({
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User'
    });
    setLoading(false);
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user);
      setCurrentUser(user);
      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      setError(error.message);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    bypassLogin, // TEMPORARY - Remove in production
    error,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 