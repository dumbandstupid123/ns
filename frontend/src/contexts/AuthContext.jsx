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

  // Helper function to handle Firebase errors
  const handleFirebaseError = (error) => {
    console.error('Firebase Error:', error);
    let userFriendlyMessage = 'An error occurred. Please try again.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        userFriendlyMessage = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        userFriendlyMessage = 'Incorrect password. Please try again.';
        break;
      case 'auth/email-already-in-use':
        userFriendlyMessage = 'An account with this email already exists.';
        break;
      case 'auth/weak-password':
        userFriendlyMessage = 'Password should be at least 6 characters.';
        break;
      case 'auth/invalid-email':
        userFriendlyMessage = 'Please enter a valid email address.';
        break;
      case 'auth/too-many-requests':
        userFriendlyMessage = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        userFriendlyMessage = 'Network error. Please check your connection.';
        break;
      case 'auth/popup-closed-by-user':
        userFriendlyMessage = 'Sign-in was cancelled.';
        break;
      default:
        userFriendlyMessage = error.message;
    }
    
    setError(userFriendlyMessage);
    return userFriendlyMessage;
  };

  // Clear error function
  const clearError = () => setError(null);

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    try {
      clearError();
      console.log('Attempting to sign up with email:', email);
      
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }
      
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', user.uid);
      
      // Update user profile with display name
      if (displayName) {
        await updateProfile(user, { displayName });
        console.log('User profile updated with display name:', displayName);
      }
      
      return user;
    } catch (error) {
      handleFirebaseError(error);
      throw error;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      clearError();
      console.log('Attempting to login with email:', email);
      
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }
      
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully:', user.uid);
      return user;
    } catch (error) {
      handleFirebaseError(error);
      throw error;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      clearError();
      console.log('Attempting Google sign-in');
      
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }
      
      const provider = new GoogleAuthProvider();
      
      // Configure the provider to avoid popup issues
      provider.setCustomParameters({ 
        prompt: 'select_account',
        login_hint: 'user@example.com'
      });
      
      // Add additional scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      console.log('Starting Google popup...');
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful:', result.user.uid);
      
      return result.user;
    } catch (error) {
      console.error('Google sign-in error details:', {
        code: error.code,
        message: error.message,
        customData: error.customData
      });
      
      // Handle specific Google sign-in errors
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('User closed the popup');
        // Don't treat this as an error, just return
        return null;
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by browser. Please allow popups for this site.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('Popup request was cancelled');
        return null;
      }
      
      handleFirebaseError(error);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      clearError();
      console.log('Attempting to sign out');
      
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }
      
      await signOut(auth);
      console.log('User signed out successfully');
    } catch (error) {
      handleFirebaseError(error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      clearError();
      console.log('Attempting password reset for email:', email);
      
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }
      
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent successfully');
    } catch (error) {
      handleFirebaseError(error);
      throw error;
    }
  };

  // Get current user's ID token
  const getIdToken = async () => {
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    return null;
  };

  useEffect(() => {
    console.log('Setting up Firebase auth state listener');
    
    if (!auth) {
      console.error('Firebase auth not available');
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? `User: ${user.uid}` : 'No user');
      setCurrentUser(user);
      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      handleFirebaseError(error);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    clearError,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    getIdToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 