// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app; 