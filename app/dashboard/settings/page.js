"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ShieldCheck } from "lucide-react";
import { Btn, Card, Field, inputCls, Modal } from "../../../components/ui";
import { getSettings, save } from "../../../lib/store";
import { db, isFirebaseConfigured } from "../../../lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { getUser, signOut } from "../../../lib/auth";

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({ tabs_at_once: 5, delay_seconds: 2 });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => { setSettings(getSettings()); setUser(getUser()); }, []);

  function saveSettings(s) { setSettings(s); save("cb_settings", s); setMsg("Settings saved."); }

  async function deleteAllData() {
    setDeleting(true);
    try {
      const u = getUser();
      if (isFirebaseConfigured && u && db) {
        try {
          const keys = ["cb_businesses", "cb_submissions", "cb_custom_directories", "cb_settings", "cb_subscription"];
          for (const key of keys) {
            await deleteDoc(doc(db, "users", u.id, "data", key));
          }
          await deleteDoc(doc(db, "users", u.id));
        } catch (err) {
          console.warn("Firestore delete warning:", err);
        }
      }
      ["cb_user", "cb_businesses", "cb_custom_directories", "cb_submissions", "cb_subscription", "cb_settings", "blaster_business_data"].forEach((k) => localStorage.removeItem(k));
      await signOut();
      router.replace("/");
    } catch (e) {
      setMsg("Delete failed: " + e.message);
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      {msg && <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">{msg}</p>}

      <Card className="space-y-4 p-5">
        <h2 className="font-bold">Blaster settings</h2>
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
        <p className="text-xs text-gray-400">These are the same settings shown on the Auto Blaster page.</p>
      </Card>

      <Card className="space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-bold"><ShieldCheck size={18} /> Account</h2>
        <p className="text-sm text-gray-600">Signed in as <b>{user?.email}</b> {user?.provider === "google" ? "(Verified via Google)" : "(Verified via Email)"}. Supabase connected: <b>{isSupabaseConfigured ? "Yes" : "No — demo mode"}</b>.</p>
        <p className="text-sm text-gray-600">In demo mode your businesses, directories, submissions and subscription live only in this browser&apos;s localStorage. With Supabase connected, run supabase/schema.sql and the same tables hold them under your Gmail user id.</p>
      </Card>

      <Card className="space-y-3 border-red-200 p-5">
        <h2 className="font-bold text-red-700">Danger zone — GDPR</h2>
        <p className="text-sm text-gray-600">Permanently delete your account data: all businesses, custom directories, submissions, subscription records and your local login. This cannot be undone.</p>
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
