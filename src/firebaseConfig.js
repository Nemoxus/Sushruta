import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyD2f-5Xv3FVR3dfe1r6cZouRQL7eHZqNc8",
    authDomain: "sushruta-44c70.firebaseapp.com",
    projectId: "sushruta-44c70",
    storageBucket: "sushruta-44c70.firebasestorage.app",
    messagingSenderId: "2025494477",
    appId: "1:2025494477:web:27714e00dafac198841684",
    measurementId: "G-HGLBHCM8FJ"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("User signed in:", result.user);
  } catch (error) {
    console.error("Error signing in:", error);
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

export { auth, signInWithGoogle, logout };
