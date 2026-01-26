// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "FIREBASE_API_KEY_PLACEHOLDER",
    authDomain: "popcorniq-d2872.firebaseapp.com",
    projectId: "popcorniq-d2872",
    storageBucket: "popcorniq-d2872.firebasestorage.app",
    messagingSenderId: "786438812791",
    appId: "1:786438812791:web:bddd78c1e4d4ab32d7c272",
    measurementId: "G-BHYKZQFZMK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Authentication exports
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
