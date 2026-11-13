import { COUNTRIES, COUNTRY_TARGETS, NICHE_CATEGORIES, SEED_DIRECTORIES } from "./directories-data";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getUser } from "./auth";

export { COUNTRIES, COUNTRY_TARGETS, NICHE_CATEGORIES, SEED_DIRECTORIES };

export function load(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const v = JSON.parse(localStorage.getItem(key) || "null");
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
  // Sync to Firestore asynchronously in background
  try {
    const u = getUser();
    if (db && u?.id) {
      setDoc(doc(db, "users", u.id, "data", key), {
        data: value,
        updated_at: new Date().toISOString()
      }, { merge: true }).catch((err) => {
        console.warn("Firestore sync warning:", err.message);
      });
    }
  } catch (e) {
    // Non-blocking
  }
}

export async function syncFromFirestore() {
  try {
    const u = getUser();
    if (!db || !u?.id) return;
    const keys = ["cb_businesses", "cb_submissions", "cb_custom_directories", "cb_settings", "cb_subscription", "cb_audits", "cb_rank_keywords", "cb_agency_branding"];
    for (const key of keys) {
      const snap = await getDoc(doc(db, "users", u.id, "data", key));
      if (snap.exists() && snap.data()?.data) {
        localStorage.setItem(key, JSON.stringify(snap.data().data));
      }
    }
  } catch (e) {
    console.warn("Sync from Firestore failed:", e.message);
  }
}

export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export function getBusinesses() { return load("cb_businesses", []); }
export function getCustomDirectories() { return load("cb_custom_directories", []); }
export function getDirectories() { return [...SEED_DIRECTORIES, ...getCustomDirectories()]; }
export function getSubmissions() { return load("cb_submissions", []); }
export function getAudits() { return load("cb_audits", []); }
export function getRankKeywords() { return load("cb_rank_keywords", []); }
export function getAgencyBranding() {
  return load("cb_agency_branding", {
    agency_name: "",
    agency_logo: "",
    agency_website: "",
    contact_email: "",
    accent_color: "#0F6FFF",
    footer_text: "Prepared by our Local SEO Citation Team",
  });
}
export function getSubscription() {
  return load("cb_subscription", { plan: "Free Trial", auto_renew: true, listings_used: 0, listings_limit: 5, status: "active", edits_used_this_month: 0, region: "USA" });
}
export function getSettings() { return load("cb_settings", { tabs_at_once: 5, delay_seconds: 2 }); }

export function planLimit(plan) {
  return { "Free Trial": 5, Starter: 50, Growth: 200, Agency: 1000, "Pay As You Go": 100000 }[plan] ?? 5;
}
