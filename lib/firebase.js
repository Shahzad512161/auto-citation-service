import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBr0ayIaE9z5qbnZ_yEG-dBjBke1GWq_n0",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "auto-citation-3cb9f.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "auto-citation-3cb9f",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "auto-citation-3cb9f.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "551138714425",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:551138714425:web:36a69034034c076462fee8",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-KDH46RH4N9",
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export const app = typeof window !== "undefined"
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig));

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Enable select_account prompt so user can easily switch/pick Google account
googleProvider.setCustomParameters({ prompt: "select_account" });

export const db = getFirestore(app);
