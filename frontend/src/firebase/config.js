// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAstpe1l2_-teDbI4TU303AE2HfFMuuKS4",
  authDomain: "next-step-299e3.firebaseapp.com",
  projectId: "next-step-299e3",
  storageBucket: "next-step-299e3.firebasestorage.app",
  messagingSenderId: "571730993568",
  appId: "1:571730993568:web:0d92b22ecd5d18fc49c4c5",
  measurementId: "G-XNV1D6SBS3"
};

// Initialize Firebase
let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized successfully");
  
  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);
  console.log("Firebase auth initialized successfully");
  
  // For development - uncomment the next lines if using Firebase Auth emulator
  // if (import.meta.env.DEV && !auth._delegate._config.emulator) {
  //   connectAuthEmulator(auth, "http://localhost:9099");
  // }
  
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw error;
}

export { auth };
export default app; 