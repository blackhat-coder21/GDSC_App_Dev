// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-GsWAvy250MsEZiAST5XWBpNvn7GNdZ8",
  authDomain: "fir-auth-53a83.firebaseapp.com",
  projectId: "fir-auth-53a83",
  storageBucket: "fir-auth-53a83.appspot.com",
  messagingSenderId: "598544226113",
  appId: "1:598544226113:web:938dc9d00ddef2909933c0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // Memory persistence (no AsyncStorage in Expo Go)

export { auth };
