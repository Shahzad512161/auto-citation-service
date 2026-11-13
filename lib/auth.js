import { auth, googleProvider, db, isFirebaseConfigured } from "./firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// The logged-in user, stored locally for instantaneous UI loading.
// Shape: { id, email, full_name, avatar_url, provider: 'google' | 'email' }
export function getUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("cb_user") || "null");
  } catch {
    return null;
  }
}

export function setUser(u) {
  if (typeof window === "undefined") return;
  if (!u) {
    localStorage.removeItem("cb_user");
  } else {
    localStorage.setItem("cb_user", JSON.stringify(u));
  }
  window.dispatchEvent(new Event("cb-user-changed"));
}

export function demoGoogleLogin(email, name) {
  const clean = (email || "").trim().toLowerCase();
  if (!clean || !clean.includes("@")) throw new Error("Please enter a valid Gmail address.");
  const user = {
    id: "demo-" + clean,
    email: clean,
    full_name: (name || "").trim() || clean.split("@")[0],
    avatar_url: "",
    provider: "google",
  };
  setUser(user);
  return user;
}

// REAL Google OAuth with Firebase Popup (1-click, no complex redirects)
export async function loginWithGoogle() {
  if (!isFirebaseConfigured || !auth) {
    return { demo: true };
  }
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const u = cred.user;
    const userData = {
      id: u.uid,
      email: u.email || "",
      full_name: u.displayName || (u.email ? u.email.split("@")[0] : "User"),
      avatar_url: u.photoURL || "",
      provider: "google",
      updated_at: new Date().toISOString(),
    };
    setUser(userData);

    // Save to Firestore users collection
    if (db) {
      try {
        await setDoc(doc(db, "users", u.uid), userData, { merge: true });
      } catch (e) {
        console.warn("Firestore sync warning:", e.message);
      }
    }
    return { demo: false, user: userData };
  } catch (err) {
    // If popup is closed by user or blocked, fallback or surface error
    if (err.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in popup was closed before completing.");
    }
    throw err;
  }
}

export async function emailSignUp(email, password) {
  if (!isFirebaseConfigured || !auth) {
    const demoUser = { id: "demo-" + email, email, full_name: email.split("@")[0], avatar_url: "", provider: "email" };
    setUser(demoUser);
    return { demo: true, user: demoUser };
  }
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const u = cred.user;
  const userData = {
    id: u.uid,
    email: u.email || email,
    full_name: email.split("@")[0],
    avatar_url: "",
    provider: "email",
    created_at: new Date().toISOString(),
  };
  setUser(userData);
  if (db) {
    try {
      await setDoc(doc(db, "users", u.uid), userData, { merge: true });
    } catch (e) {
      console.warn("Firestore sync warning:", e.message);
    }
  }
  return { demo: false, user: userData };
}

export async function emailSignIn(email, password) {
  if (!isFirebaseConfigured || !auth) {
    const demoUser = { id: "demo-" + email, email, full_name: email.split("@")[0], avatar_url: "", provider: "email" };
    setUser(demoUser);
    return { demo: true, user: demoUser };
  }
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const u = cred.user;
  let fullName = u.displayName || email.split("@")[0];
  let avatarUrl = u.photoURL || "";

  if (db) {
    try {
      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) {
        const d = snap.data();
        if (d.full_name) fullName = d.full_name;
        if (d.avatar_url) avatarUrl = d.avatar_url;
      }
    } catch (e) {
      console.warn("Firestore read warning:", e.message);
    }
  }

  const userData = {
    id: u.uid,
    email: u.email || email,
    full_name: fullName,
    avatar_url: avatarUrl,
    provider: "email",
  };
  setUser(userData);
  return { demo: false, user: userData };
}

// OTP / Simple code verification
export async function sendOtp(email) {
  // In Firebase web, email OTP without backend uses passwordless action codes.
  // For standard user convenience, OTP provides demo mode code 123456
  return { demo: true, code: "123456" };
}

export async function verifyOtp(email, code) {
  if (code.trim() !== "123456") throw new Error("Verification code is 123456.");
  const userData = { id: "otp-" + email, email, full_name: email.split("@")[0], avatar_url: "", provider: "email" };
  setUser(userData);
  return { demo: true, user: userData };
}

export async function signOut() {
  try {
    if (auth) await fbSignOut(auth);
  } catch (e) {
    console.warn("Sign out warning:", e.message);
  }
  localStorage.removeItem("cb_user");
  window.dispatchEvent(new Event("cb-user-changed"));
}

export function initials(name, email) {
  const base = (name || email || "?").trim();
  return base.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
