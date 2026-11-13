"use client";
import { useEffect, useState } from "react";
import { Wand2, Save, Pencil, Trash2, RefreshCw, Upload, X } from "lucide-react";
import { Btn, Card, Field, inputCls, Modal, Badge } from "../../../components/ui";
import { COUNTRIES, getBusinesses, save, getSubmissions, getSubscription, uid } from "../../../lib/store";
import { getUser } from "../../../lib/auth";
import { fetchBusinessData } from "../../../lib/scraper";

const EMPTY = {
  name: "", phone: "", email: "", address: "", city: "", state: "", zip: "", country: "USA",
  website_url: "", category: "", description: "", services: [], hours: "", logo_url: "", photos: [],
};

export default function BusinessesPage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [url, setUrl] = useState("");
  const [fetchStatus, setFetchStatus] = useState("");
  const [fetching, setFetching] = useState(false);
  const [serviceInput, setServiceInput] = useState("");
  const [bulk, setBulk] = useState(null); // business being bulk-updated
  const [msg, setMsg] = useState("");

  useEffect(() => { setList(getBusinesses()); }, []);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const refresh = () => setList(getBusinesses());

  async function autoFetch() {
    setFetching(true); setFetchStatus(""); setMsg("");
    try {
      const data = await fetchBusinessData(url, setFetchStatus);
      setForm((f) => ({
        ...f,
        website_url: data.url,
        name: data.title || f.name,
        description: data.description || f.description,
        phone: data.phones[0] || f.phone,
        email: data.emails[0] || f.email,
        address: data.address || f.address,
        logo_url: data.logo || f.logo_url,
        services: data.services.length ? data.services : f.services,
      }));
      setFetchStatus(`Mil gaya! Title: “${data.title}” · ${data.phones.length} phone(s) · ${data.emails.length} email(s) · ${data.services.length} services (h2/h3) · Logo ${data.logo ? "found" : "not found"}. Review the form below, then Save.`);
    } catch (e) {
      setFetchStatus("Fetch failed: " + e.message);
    } finally { setFetching(false); }
  }

  function fileToDataUrl(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  function saveBusiness(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city || !form.state || !form.zip || !form.country || !form.website_url) {
      setMsg("Please fill all * fields: Business Name, Phone, Address, City, State, Zip, Country, Website URL.");
      return;
    }
    const user = getUser();
    const all = getBusinesses();
    if (editingId) {
      const updated = all.map((b) => b.id === editingId ? { ...b, ...form, last_edited_at: new Date().toISOString() } : b);
      save("cb_businesses", updated);
      setMsg("Business updated.");
    } else {
      const rec = { ...form, id: uid(), user_id: user?.id || "demo", version: 1, last_edited_at: new Date().toISOString(), created_at: new Date().toISOString() };
      save("cb_businesses", [...all, rec]);
      setMsg("Business saved. Now pick directories and blast it from the Auto Blaster page.");
    }
    setEditingId(null); setForm(EMPTY); refresh();
  }

  function edit(b) { setEditingId(b.id); setForm({ ...EMPTY, ...b }); window.scrollTo({ top: 0, behavior: "smooth" }); }

  function remove(id) {
    if (!confirm("Delete this business? Its submissions stay in Reports unless you delete them there.")) return;
    save("cb_businesses", getBusinesses().filter((b) => b.id !== id));
    refresh();
  }

  function openBulk(b) {
    const subs = getSubmissions().filter((s) => s.business_id === b.id);
    const sub = getSubscription();
    const freeLeft = sub.plan === "Pay As You Go" ? 0 : Math.max(0, 50 - (sub.edits_used_this_month || 0));
    const payable = sub.plan === "Pay As You Go" ? subs.length : Math.max(0, subs.length - freeLeft);
    setBulk({ business: b, count: subs.length, freeLeft, cost: +(payable * 0.1).toFixed(2), payable });
  }

  function confirmBulk(useFree) {
    const { business, count, payable } = bulk;
    const subs = getSubmissions().map((s) => s.business_id === business.id ? { ...s, status: "needs_update" } : s);
    save("cb_submissions", subs);
    const sub = getSubscription();
    if (!useFree && sub.plan !== "Pay As You Go") {
      sub.edits_used_this_month = (sub.edits_used_this_month || 0) + Math.min(count, 50);
    }
    save("cb_subscription", sub);
    const all = getBusinesses().map((b) => b.id === business.id ? { ...b, version: (b.version || 1) + 1, last_edited_at: new Date().toISOString() } : b);
    save("cb_businesses", all);
    setBulk(null); refresh();
    setMsg(`Bulk update queued: ${count} listings set to “needs_update” (version ${business.version + 1}). ${useFree ? "Free credits used." : `Charged $${(payable * 0.1).toFixed(2)} in this demo (no real payment).`}`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Businesses / Add Business</h1>

      <Card className="p-5">
        <h2 className="font-bold">Step 1 — Auto-fetch from a website</h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input className={inputCls} placeholder="Enter your website URL (e.g., airheatdispatch.com)" value={url} onChange={(e) => setUrl(e.target.value)} />
          <Btn onClick={autoFetch} disabled={fetching || !url} className="shrink-0"><Wand2 size={18} /> {fetching ? "Fetching…" : "Auto Fetch Data with AI"}</Btn>
        </div>
        {fetchStatus && <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900">{fetchStatus}</p>}
        {fetching && <p className="mt-2 text-sm text-gray-500">Aapki website se data nikal rahe hain…</p>}
        <p className="mt-2 text-xs text-gray-400">Fetch uses https://api.allorigins.win/get?url= and parses title, meta description, og:image, phone/email regex, h2/h3 services and the contact page. Always review before saving — scraped data can be wrong.</p>
      </Card>

      {msg && <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">{msg}</p>}

      <form onSubmit={saveBusiness}>
        <Card className="space-y-4 p-5">
          <h2 className="font-bold">Step 2 — Business details {editingId && <Badge tone="yellow">Editing</Badge>}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Business Name *"><input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Phone *"><input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="Email"><input className={inputCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Address *"><input className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
            <Field label="City *"><input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
            <Field label="State *"><input className={inputCls} value={form.state} onChange={(e) => set("state", e.target.value)} /></Field>
            <Field label="Zip Code *"><input className={inputCls} value={form.zip} onChange={(e) => set("zip", e.target.value)} /></Field>
            <Field label="Country *">
              <select className={inputCls} value={form.country} onChange={(e) => set("country", e.target.value)}>
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Website URL *"><input className={inputCls} value={form.website_url} onChange={(e) => set("website_url", e.target.value)} /></Field>
            <Field label="Category (Plumber, HVAC, etc)"><input className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)} /></Field>
            <Field label="Hours"><input className={inputCls} placeholder="Mon–Fri 9am–6pm" value={form.hours} onChange={(e) => set("hours", e.target.value)} /></Field>
            <Field label="Logo URL (auto-filled, editable)"><input className={inputCls} value={form.logo_url} onChange={(e) => set("logo_url", e.target.value)} /></Field>
          </div>
          <Field label="Description (up to ~500 words)">
            <textarea className={inputCls} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Services (type + Enter, or comma-separated)" hint="From h2/h3 tags after auto-fetch. Click × to remove one.">
            <div className="flex flex-wrap gap-2 rounded-lg border border-gray-300 px-3 py-2">
              {form.services.map((s, i) => (
                <span key={i} className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  {s} <button type="button" onClick={() => set("services", form.services.filter((_, j) => j !== i))}><X size={12} /></button>
                </span>
              ))}
              <input
                className="min-w-[160px] flex-1 border-none text-sm outline-none"
                value={serviceInput}
                placeholder="Add a service…"
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    const v = serviceInput.trim().replace(/,$/, "");
                    if (v) set("services", [...form.services, v]);
                    setServiceInput("");
                  }
                }}
              />
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Logo upload">
              <input type="file" accept="image/*" className={inputCls} onChange={async (e) => { const f = e.target.files?.[0]; if (f) set("logo_url", await fileToDataUrl(f)); }} />
              {form.logo_url && <p className="mt-1 truncate text-xs text-gray-400">{form.logo_url.slice(0, 80)}</p>}
            </Field>
            <Field label="5 Photos upload (demo: stored on this device)">
              <input type="file" accept="image/*" multiple className={inputCls} onChange={async (e) => {
                const files = [...(e.target.files || [])].slice(0, 5);
                const urls = await Promise.all(files.map(fileToDataUrl));
                set("photos", [...form.photos, ...urls].slice(0, 5));
              }} />
              <p className="mt-1 text-xs text-gray-400">{form.photos.length}/5 photos</p>
            </Field>
          </div>
          <div className="flex gap-3">
            <Btn type="submit"><Save size={18} /> Save Business</Btn>
            {editingId && <Btn type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(EMPTY); }}>Cancel edit</Btn>}
          </div>
        </Card>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((b) => (
          <Card key={b.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">{b.name}</p>
                <p className="text-sm text-gray-500">{b.category} · {b.city}, {b.state} {b.zip} · {b.country}</p>
                <p className="mt-1 text-sm">{b.phone} · {b.email}</p>
                <p className="mt-1 truncate text-sm text-blue-600">{b.website_url}</p>
                <p className="mt-2 text-xs text-gray-400">Version {b.version || 1} · Last edited {b.last_edited_at ? new Date(b.last_edited_at).toLocaleString() : "—"} · {b.services?.length || 0} services</p>
              </div>
              {b.logo_url && <img src={b.logo_url} alt="" className="h-14 w-14 rounded-lg border object-cover" onError={(e) => { e.target.style.display = "none"; }} />}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Btn variant="secondary" onClick={() => edit(b)}><Pencil size={15} /> Edit</Btn>
              <Btn variant="secondary" onClick={() => openBulk(b)}><RefreshCw size={15} /> Update All Listings</Btn>
              <Btn variant="ghost" onClick={() => remove(b.id)}><Trash2 size={15} /> Delete</Btn>
            </div>
          </Card>
        ))}
        {list.length === 0 && <p className="text-sm text-gray-500">No businesses yet. Fetch one from a website above, or fill the form manually.</p>}
      </div>

      <Modal open={!!bulk} onClose={() => setBulk(null)} title="Update All Listings — bulk edit">
        {bulk && (
          <div className="space-y-4 text-sm">
            <p>Aapki <b>{bulk.count}</b> listings update hongi (business: {bulk.business.name}).</p>
            <p>Cost: <b>${bulk.cost.toFixed(2)}</b> ({bulk.payable} payable listings × $0.10). Monthly users get 50 free edits per month — you have <b>{bulk.freeLeft}</b> free left this month.</p>
            <p className="text-xs text-gray-500">This sets every submission for this business to “needs_update” and bumps the business version, so Reports shows what still needs re-submitting. Demo mode charges nothing for real.</p>
            <div className="flex flex-wrap gap-3">
              <Btn onClick={() => confirmBulk(false)}>Pay &amp; Update Now (${bulk.cost.toFixed(2)})</Btn>
              {bulk.freeLeft > 0 && <Btn variant="secondary" onClick={() => confirmBulk(true)}>Use Free Credits</Btn>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
