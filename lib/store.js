import seedUsaUk from "./seed-usa-uk.json";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getUser } from "./auth";

export const COUNTRIES = ["USA", "UK", "Australia", "Canada", "UAE", "Saudi Arabia", "Pakistan", "India"];
export const NICHE_CATEGORIES = [
  "All Niches",
  "Home Services & Contractors",
  "Legal & Attorneys",
  "Healthcare & Dental",
  "Real Estate",
  "Automotive",
  "Restaurants & Food",
  "Finance & Insurance",
  "B2B & Technology",
  "Retail & Shopping",
  "General",
];

// Curated starter lists for countries beyond the USA/UK seed files.
// DA is left null where it is not from a verified seed file, so the UI shows "—"
// instead of an invented number. Add rows with "+ Add Custom Directory".
const CURATED = [
  // Australia
  { name: "Yellow Pages Australia", website_url: "https://www.yellowpages.com.au", add_url: "https://www.yellowpages.com.au", country: "Australia" },
  { name: "TrueLocal", website_url: "https://www.truelocal.com.au", add_url: "https://www.truelocal.com.au", country: "Australia" },
  { name: "Yelp Australia", website_url: "https://www.yelp.com.au", add_url: "https://biz.yelp.com.au", country: "Australia" },
  { name: "Bing Places", website_url: "https://www.bingplaces.com", add_url: "https://www.bingplaces.com", country: "Australia" },
  { name: "Apple Business Connect", website_url: "https://businessconnect.apple.com", add_url: "https://businessconnect.apple.com", country: "Australia" },
  { name: "Facebook Business", website_url: "https://business.facebook.com", add_url: "https://www.facebook.com/pages/create", country: "Australia" },
  { name: "Hotfrog Australia", website_url: "https://www.hotfrog.com.au", add_url: "https://www.hotfrog.com.au", country: "Australia" },
  { name: "LocalSearch", website_url: "https://www.localsearch.com.au", add_url: "https://www.localsearch.com.au", country: "Australia" },
  { name: "White Pages Australia", website_url: "https://www.whitepages.com.au", add_url: "https://www.whitepages.com.au", country: "Australia" },
  { name: "StartLocal", website_url: "https://www.startlocal.com.au", add_url: "https://www.startlocal.com.au", country: "Australia" },
  { name: "AussieWeb", website_url: "https://www.aussieweb.com.au", add_url: "https://www.aussieweb.com.au", country: "Australia" },
  { name: "dLook", website_url: "https://www.dlook.com.au", add_url: "https://www.dlook.com.au", country: "Australia" },
  // Canada
  { name: "YellowPages.ca", website_url: "https://www.yellowpages.ca", add_url: "https://www.yellowpages.ca", country: "Canada" },
  { name: "411.ca", website_url: "https://www.411.ca", add_url: "https://www.411.ca", country: "Canada" },
  { name: "Canpages", website_url: "https://www.canpages.ca", add_url: "https://www.canpages.ca", country: "Canada" },
  { name: "Yelp Canada", website_url: "https://www.yelp.ca", add_url: "https://biz.yelp.ca", country: "Canada" },
  { name: "Bing Places", website_url: "https://www.bingplaces.com", add_url: "https://www.bingplaces.com", country: "Canada" },
  { name: "Apple Business Connect", website_url: "https://businessconnect.apple.com", add_url: "https://businessconnect.apple.com", country: "Canada" },
  { name: "Facebook Business", website_url: "https://business.facebook.com", add_url: "https://www.facebook.com/pages/create", country: "Canada" },
  { name: "Hotfrog Canada", website_url: "https://www.hotfrog.ca", add_url: "https://www.hotfrog.ca", country: "Canada" },
  { name: "Cylex Canada", website_url: "https://www.cylex-canada.ca", add_url: "https://www.cylex-canada.ca", country: "Canada" },
  { name: "Brownbook Canada", website_url: "https://www.brownbook.net", add_url: "https://www.brownbook.net", country: "Canada" },
  { name: "MapQuest", website_url: "https://www.mapquest.com", add_url: "https://www.mapquest.com", country: "Canada" },
  { name: "Foursquare", website_url: "https://foursquare.com", add_url: "https://foursquare.com", country: "Canada" },
  // UAE
  { name: "Yellow Pages UAE", website_url: "https://www.yellowpages.ae", add_url: "https://www.yellowpages.ae", country: "UAE" },
  { name: "Yelp UAE", website_url: "https://www.yelp.ae", add_url: "https://biz.yelp.ae", country: "UAE" },
  { name: "Bing Places", website_url: "https://www.bingplaces.com", add_url: "https://www.bingplaces.com", country: "UAE" },
  { name: "Apple Business Connect", website_url: "https://businessconnect.apple.com", add_url: "https://businessconnect.apple.com", country: "UAE" },
  { name: "Facebook Business", website_url: "https://business.facebook.com", add_url: "https://www.facebook.com/pages/create", country: "UAE" },
  { name: "Hotfrog UAE", website_url: "https://www.hotfrog.ae", add_url: "https://www.hotfrog.ae", country: "UAE" },
  { name: "Connect.ae", website_url: "https://connect.ae", add_url: "https://connect.ae", country: "UAE" },
  { name: "Yalwa UAE", website_url: "https://uae.yalwa.com", add_url: "https://uae.yalwa.com", country: "UAE" },
  // Saudi Arabia
  { name: "Bing Places", website_url: "https://www.bingplaces.com", add_url: "https://www.bingplaces.com", country: "Saudi Arabia" },
  { name: "Apple Business Connect", website_url: "https://businessconnect.apple.com", add_url: "https://businessconnect.apple.com", country: "Saudi Arabia" },
  { name: "Facebook Business", website_url: "https://business.facebook.com", add_url: "https://www.facebook.com/pages/create", country: "Saudi Arabia" },
  { name: "Google Business Profile", website_url: "https://business.google.com", add_url: "https://business.google.com/create", country: "Saudi Arabia" },
  { name: "Daleeli", website_url: "https://www.daleeli.com", add_url: "https://www.daleeli.com", country: "Saudi Arabia" },
  { name: "Saudi Yellow Pages", website_url: "https://www.saudiyellowpages.com", add_url: "https://www.saudiyellowpages.com", country: "Saudi Arabia" },
  // Pakistan
  { name: "Bing Places", website_url: "https://www.bingplaces.com", add_url: "https://www.bingplaces.com", country: "Pakistan" },
  { name: "Apple Business Connect", website_url: "https://businessconnect.apple.com", add_url: "https://businessconnect.apple.com", country: "Pakistan" },
  { name: "Facebook Business", website_url: "https://business.facebook.com", add_url: "https://www.facebook.com/pages/create", country: "Pakistan" },
  { name: "Google Business Profile", website_url: "https://business.google.com", add_url: "https://business.google.com/create", country: "Pakistan" },
  { name: "Pakistan Yellow Pages", website_url: "https://www.yellowpages.com.pk", add_url: "https://www.yellowpages.com.pk", country: "Pakistan" },
  { name: "BusinessList Pakistan", website_url: "https://www.businesslist.pk", add_url: "https://www.businesslist.pk", country: "Pakistan" },
  // India
  { name: "JustDial", website_url: "https://www.justdial.com", add_url: "https://www.justdial.com", country: "India" },
  { name: "IndiaMART", website_url: "https://www.indiamart.com", add_url: "https://www.indiamart.com", country: "India" },
  { name: "Sulekha", website_url: "https://www.sulekha.com", add_url: "https://www.sulekha.com", country: "India" },
  { name: "Yellow Pages India", website_url: "https://www.yellowpages.co.in", add_url: "https://www.yellowpages.co.in", country: "India" },
  { name: "Yelp India", website_url: "https://www.yelp.in", add_url: "https://biz.yelp.in", country: "India" },
  { name: "Bing Places", website_url: "https://www.bingplaces.com", add_url: "https://www.bingplaces.com", country: "India" },
  { name: "Apple Business Connect", website_url: "https://businessconnect.apple.com", add_url: "https://businessconnect.apple.com", country: "India" },
  { name: "Facebook Business", website_url: "https://business.facebook.com", add_url: "https://www.facebook.com/pages/create", country: "India" },
  { name: "Hotfrog India", website_url: "https://www.hotfrog.in", add_url: "https://www.hotfrog.in", country: "India" },
  { name: "Grotal", website_url: "https://www.grotal.com", add_url: "https://www.grotal.com", country: "India" },
];

export const SEED_DIRECTORIES = [
  ...seedUsaUk.map((d) => ({ ...d, type: d.type || "Free", is_custom: false })),
  ...CURATED.map((d, i) => ({ id: `cur-${d.country}-${i}`, ...d, da: null, type: "Free", category: "", is_custom: false })),
];

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
  // Sync to Firestore in the background
  try {
    const u = getUser();
    if (db && u?.id) {
      setDoc(doc(db, "users", u.id, "data", key), {
        data: value,
        updated_at: new Date().toISOString()
      }, { merge: true }).catch((err) => {
        console.warn("Firestore sync error:", err.message);
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
