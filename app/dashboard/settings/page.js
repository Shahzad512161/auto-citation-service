"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ShieldCheck, Puzzle, Sparkles, Mail, CheckCircle2 } from "lucide-react";
import { Btn, Card, Field, inputCls, Modal } from "../../../components/ui";
import { getSettings, save, getAgencyBranding } from "../../../lib/store";
import { db, isFirebaseConfigured } from "../../../lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { getUser, signOut } from "../../../lib/auth";

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({ tabs_at_once: 5, delay_seconds: 2 });
  const [agency, setAgency] = useState({
    agency_name: "",
    agency_logo: "",
    agency_website: "",
    contact_email: "",
    footer_text: "Prepared by our Local SEO Citation Team",
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    setSettings(getSettings());
    setAgency(getAgencyBranding());
    setUser(getUser());
  }, []);

  function saveSettings(s) {
    setSettings(s);
    save("cb_settings", s);
    setMsg("Settings saved.");
    setTimeout(() => setMsg(""), 3000);
  }

  function saveAgency(e) {
    e.preventDefault();
    save("cb_agency_branding", agency);
    setMsg("Agency white-label branding updated successfully! ✓");
    setTimeout(() => setMsg(""), 3000);
  }

  async function deleteAllData() {
    setDeleting(true);
    try {
      const u = getUser();
      if (isFirebaseConfigured && u && db) {
        try {
          const keys = ["cb_businesses", "cb_submissions", "cb_custom_directories", "cb_settings", "cb_subscription", "cb_audits", "cb_rank_keywords", "cb_agency_branding"];
          for (const key of keys) {
            await deleteDoc(doc(db, "users", u.id, "data", key));
          }
          await deleteDoc(doc(db, "users", u.id));
        } catch (err) {
          console.warn("Firestore delete warning:", err);
        }
      }
      ["cb_user", "cb_businesses", "cb_custom_directories", "cb_submissions", "cb_subscription", "cb_settings", "cb_audits", "cb_rank_keywords", "cb_agency_branding", "blaster_business_data"].forEach((k) => localStorage.removeItem(k));
      await signOut();
      router.replace("/");
    } catch (e) {
      setMsg("Delete failed: " + e.message);
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings & Configuration</h1>
      {msg && <p className="rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-800">{msg}</p>}

      {/* Chrome Extension Card */}
      <Card className="space-y-3 p-5 border-blue-200 bg-blue-50/40">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F6FFF] text-white">
            <Puzzle size={18} />
          </span>
          <div>
            <h2 className="font-bold text-base">Citation Auto-Blaster Chrome Extension</h2>
            <p className="text-xs text-gray-500">Manifest V3 Extension included directly in your project folder</p>
          </div>
        </div>
        <p className="text-sm text-gray-700">
          The Chrome Extension gives you 1-click form detection and instant submission autofill across all 1,000 directories without popup blocking.
        </p>
        <div className="rounded-xl bg-white p-3.5 border text-xs text-gray-600 space-y-1.5">
          <p className="font-bold text-gray-900">How to install in Google Chrome (Takes 15 seconds):</p>
          <p>1. Open <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-blue-700">chrome://extensions/</code> in your Chrome address bar.</p>
          <p>2. Toggle on <b>&quot;Developer mode&quot;</b> at the top right.</p>
          <p>3. Click <b>&quot;Load unpacked&quot;</b> and select the folder: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-gray-800">public/extension</code> inside this project.</p>
        </div>
      </Card>

      {/* White-Label Agency Branding Card */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-[#0F6FFF]" size={20} />
          <h2 className="font-bold text-base">White-Label Agency Branding</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Replace &quot;Citation Blaster&quot; with your own agency name &amp; logo across all client reports and public shareable links.
        </p>

        <form onSubmit={saveAgency} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Agency / Company Name">
              <input
                className={inputCls}
                placeholder="e.g. Apex Local SEO Agency"
                value={agency.agency_name}
                onChange={(e) => setAgency({ ...agency, agency_name: e.target.value })}
              />
            </Field>
            <Field label="Agency Logo Image URL">
              <input
                className={inputCls}
                placeholder="https://youragency.com/logo.png"
                value={agency.agency_logo}
                onChange={(e) => setAgency({ ...agency, agency_logo: e.target.value })}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Agency Website">
              <input
                className={inputCls}
                placeholder="https://youragency.com"
                value={agency.agency_website}
                onChange={(e) => setAgency({ ...agency, agency_website: e.target.value })}
              />
            </Field>
            <Field label="Contact / Support Email">
              <input
                className={inputCls}
                placeholder="team@youragency.com"
                value={agency.contact_email}
                onChange={(e) => setAgency({ ...agency, contact_email: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Client Report Footer Note">
            <input
              className={inputCls}
              placeholder="Prepared by our Local Citation Strategy Team"
              value={agency.footer_text}
              onChange={(e) => setAgency({ ...agency, footer_text: e.target.value })}
            />
          </Field>

          <Btn type="submit">Save Agency Branding</Btn>
        </form>
      </Card>

      {/* Dedicated Email Inbox Setup */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="text-[#0F6FFF]" size={20} />
          <h2 className="font-bold text-base">Dedicated Citation Email Best Practice</h2>
        </div>
        <p className="text-xs text-gray-500">
          Directories send confirmation links to approve new listings. Avoid using your primary personal inbox.
        </p>
        <div className="rounded-lg bg-gray-50 p-3 border text-xs text-gray-700 space-y-1">
          <p className="font-semibold text-gray-900 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" /> Recommended Strategy:
          </p>
          <p>Create a dedicated email such as <code className="font-mono bg-white px-1 border rounded">citations@{agency.agency_website?.replace(/^https?:\/\//, "") || "yourdomain.com"}</code> or <code className="font-mono bg-white px-1 border rounded">clientname.citations@gmail.com</code>.</p>
          <p>Use this email in the &quot;My Businesses&quot; form so all directory account verifications land in one central place.</p>
        </div>
      </Card>

      {/* Blaster Tab Settings */}
      <Card className="space-y-4 p-5">
        <h2 className="font-bold">Blaster Execution Settings</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tabs at once">
            <select className={inputCls} value={settings.tabs_at_once} onChange={(e) => saveSettings({ ...settings, tabs_at_once: Number(e.target.value) })}>
              {[3, 5, 10].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="Delay between batches (seconds)">
            <select className={inputCls} value={settings.delay_seconds} onChange={(e) => saveSettings({ ...settings, delay_seconds: Number(e.target.value) })}>
              {[1, 2, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
        </div>
      </Card>

      {/* Account Info */}
      <Card className="space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-bold"><ShieldCheck size={18} /> Account Status</h2>
        <p className="text-sm text-gray-600">Signed in as <b>{user?.email}</b> {user?.provider === "google" ? "(Verified via Google)" : "(Verified via Email)"}. Firebase connected: <b>{isFirebaseConfigured ? "Yes" : "No — demo mode"}</b>.</p>
        <p className="text-sm text-gray-600">Your businesses, directories, submissions, audits and subscription sync automatically to Firebase Firestore under your account.</p>
      </Card>

      {/* Danger Zone */}
      <Card className="space-y-3 border-red-200 p-5">
        <h2 className="font-bold text-red-700">Danger zone — GDPR</h2>
        <p className="text-sm text-gray-600">Permanently delete your account data: all businesses, custom directories, submissions, audits, ranking keywords, subscription records and your local login. This cannot be undone.</p>
        <Btn variant="danger" onClick={() => setConfirmDelete(true)}><Trash2 size={16} /> Delete My Data Permanently</Btn>
      </Card>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete my data permanently?">
        <p className="text-sm text-gray-700">This deletes everything listed above and signs you out. It cannot be undone. Are you sure?</p>
        <div className="mt-4 flex gap-3">
          <Btn variant="danger" disabled={deleting} onClick={deleteAllData}>{deleting ? "Deleting…" : "Yes, delete everything"}</Btn>
          <Btn variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  );
}
