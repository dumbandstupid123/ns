import { auth } from './firebase/config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Test Firebase connection
console.log('Firebase Auth:', auth);
console.log('Firebase Auth Config:', auth.config);

// Test function to create a user
export const testCreateUser = async () => {
  try {
    const result = await createUserWithEmailAndPassword(auth, 'test@example.com', 'password123');
    console.log('User created successfully:', result.user);
    return result.user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Test function to login
export const testLogin = async () => {
  try {
    const result = await signInWithEmailAndPassword(auth, 'test@example.com', 'password123');
    console.log('Login successful:', result.user);
    return result.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}; 