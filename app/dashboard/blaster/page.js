"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Rocket, Copy, Check, Bookmark } from "lucide-react";
import { Btn, Card, Field, inputCls, Progress, Badge } from "../../../components/ui";
import { COUNTRIES, getBusinesses, getDirectories, getSubmissions, save, getSubscription, getSettings, uid } from "../../../lib/store";
import { getUser } from "../../../lib/auth";
import { buildBookmarklet } from "../../../lib/bookmarklet";

export default function BlasterPage() {
  const [businesses, setBusinesses] = useState([]);
  const [businessId, setBusinessId] = useState("");
  const [country, setCountry] = useState("USA");
  const [selected, setSelected] = useState([]);
  const [settings, setSettings] = useState({ tabs_at_once: 5, delay_seconds: 2 });
  const [running, setRunning] = useState(false);
  const [opened, setOpened] = useState(0);
  const [log, setLog] = useState([]);
  const [copied, setCopied] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const stopRef = useRef(false);

  useEffect(() => {
    setBusinesses(getBusinesses());
    setSettings(getSettings());
  }, []);

  const dirs = useMemo(() => getDirectories().filter((d) => d.country === country), [country]);
  const business = businesses.find((b) => b.id === businessId);
  const bookmarklet = business ? buildBookmarklet(business) : "";

  const toggle = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const selectAll = () => setSelected(dirs.map((d) => d.id));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function startBlast() {
    if (!business) { alert("Select a business first."); return; }
    if (selected.length === 0) { alert("Select at least one directory."); return; }
    const user = getUser();
    // Spec: business data saved to localStorage under this exact key.
    localStorage.setItem("blaster_business_data", JSON.stringify(business));
    stopRef.current = false;
    setPopupBlocked(false);
    setRunning(true); setOpened(0); setLog([]);
    const chosen = dirs.filter((d) => selected.includes(d.id));
    const batch = settings.tabs_at_once;
    const delay = settings.delay_seconds * 1000;
    let done = 0;
    let blockedDetected = false;
    const subs = getSubmissions();
    for (let i = 0; i < chosen.length; i += batch) {
      if (stopRef.current) break;
      const chunk = chosen.slice(i, i + batch);
      chunk.forEach((d) => {
        try {
          const win = window.open(d.add_url, "_blank", "noopener");
          if (!win || win.closed || typeof win.closed === "undefined") {
            blockedDetected = true;
          }
        } catch {
          blockedDetected = true;
        }
        subs.push({ id: uid(), user_id: user?.id || "demo", business_id: business.id, business_name: business.name, directory_id: d.id, directory_name: d.name, country, date: new Date().toISOString(), status: "pending", live_url: "" });
        setLog((l) => [...l, `Opened: ${d.name} → ${d.add_url}`]);
      });
      done += chunk.length;
      setOpened(done);
      save("cb_submissions", subs);
      const sub = getSubscription();
      sub.listings_used = (sub.listings_used || 0) + chunk.length;
      save("cb_subscription", sub);
      if (blockedDetected) {
        setPopupBlocked(true);
      }
      if (i + batch < chosen.length) await sleep(delay);
    }
    setRunning(false);
    if (blockedDetected) setPopupBlocked(true);
    setLog((l) => [...l, stopRef.current ? "Blast stopped by you." : `Done: ${done} tabs requested. Check if your browser blocked additional tabs.`]);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Auto Blaster</h1>

      <Card className="grid gap-4 p-5 md:grid-cols-3">
        <Field label="Step 1 — Select Business">
          <select className={inputCls} value={businessId} onChange={(e) => setBusinessId(e.target.value)}>
            <option value="">Choose a business…</option>
            {businesses.map((b) => <option key={b.id} value={b.id}>{b.name} — {b.city}, {b.country}</option>)}
          </select>
        </Field>
        <Field label="Step 2 — Select Country">
          <select className={inputCls} value={country} onChange={(e) => { setCountry(e.target.value); setSelected([]); }}>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <div>
          <Field label="Settings — Tabs at once">
            <select className={inputCls} value={settings.tabs_at_once} onChange={(e) => { const s = { ...settings, tabs_at_once: Number(e.target.value) }; setSettings(s); save("cb_settings", s); }}>
              {[3, 5, 10].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <div className="mt-3">
            <Field label="Delay between batches">
              <select className={inputCls} value={settings.delay_seconds} onChange={(e) => { const s = { ...settings, delay_seconds: Number(e.target.value) }; setSettings(s); save("cb_settings", s); }}>
                {[1, 2, 5].map((n) => <option key={n} value={n}>{n} seconds</option>)}
              </select>
            </Field>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold">Step 3 — Select Directories <Badge tone="blue">{selected.length} selected</Badge> <span className="text-sm font-normal text-gray-500">({dirs.length} in {country})</span></h2>
          <div className="flex gap-2">
            <Btn variant="secondary" onClick={selectAll}>Select All</Btn>
            <Btn variant="secondary" onClick={() => setSelected([])}>Clear</Btn>
          </div>
        </div>
        <div className="mt-4 grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
          {dirs.slice(0, 300).map((d) => (
            <label key={d.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${selected.includes(d.id) ? "border-[#0F6FFF] bg-blue-50" : "border-gray-200"}`}>
              <input type="checkbox" checked={selected.includes(d.id)} onChange={() => toggle(d.id)} />
              <span className="min-w-0 flex-1 truncate">{d.name}</span>
              <span className="text-xs text-gray-400">DA {d.da ?? "—"}</span>
            </label>
          ))}
        </div>
        {dirs.length > 300 && <p className="mt-2 text-xs text-gray-400">Showing 300 of {dirs.length} — use “Select All” to include every directory in {country}.</p>}
      </Card>

      <Card className="p-5">
        <h2 className="font-bold">Step 4 — Blast</h2>

        <div className="mt-2 mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <p className="font-semibold flex items-center gap-1">⚠️ Seeing &ldquo;Blocked By TLC&rdquo; or ISP Connection Blocks?</p>
          <p className="mt-1">
            <strong>TLC</strong> stands for your local ISP (Transworld Associates / TLC in Pakistan). Local ISP firewalls routinely block foreign directory domains, and international directories (USA, UK, etc.) often require a matching regional IP.
          </p>
          <p className="mt-1">
            <strong>Solution:</strong> Turn on a VPN (set to USA, UK, or your target citation country) or enable <strong>Cloudflare WARP (1.1.1.1)</strong> before blasting.
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Btn onClick={startBlast} disabled={running || !business || selected.length === 0} className="!px-6 !py-3 text-base">
            <Rocket size={18} /> START AUTO BLAST — Open {settings.tabs_at_once} Tabs at Once
          </Btn>
          {running && <Btn variant="danger" onClick={() => { stopRef.current = true; }}>Stop</Btn>}
        </div>

        {popupBlocked && (
          <div className="mt-4 rounded-xl border-2 border-red-500 bg-red-50 p-4 text-sm text-red-900 shadow-md">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🚫</span>
              <div className="space-y-2">
                <h3 className="font-bold text-base text-red-800">
                  Chrome Blocked Multiple Tabs from Opening!
                </h3>
                <p className="text-sm text-red-700">
                  By default, browsers only permit 1 pop-up tab per click to prevent spam. That is why only 1 tab opened.
                </p>
                <div className="rounded-lg bg-white p-3 border border-red-200">
                  <p className="font-semibold text-xs text-gray-900 mb-1">To allow all {selected.length} tabs to open automatically:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-xs text-gray-700">
                    <li>Look at the <strong>far-right end of your Chrome address bar (URL bar)</strong> at the top of the browser.</li>
                    <li>Click the <strong>Pop-up Blocked icon</strong> (a tiny window with a red &times; mark).</li>
                    <li>Select <strong>&ldquo;Always allow pop-ups and redirects from http://localhost:3000&rdquo;</strong>.</li>
                    <li>Click <strong>Done</strong>, then click the blue <strong>START AUTO BLAST</strong> button again!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {(running || opened > 0) && (
          <div className="mt-4">
            <Progress value={opened} total={selected.length} />
            <p className="mt-1 text-sm text-gray-500">Opening {opened}/{selected.length}… (batches of {settings.tabs_at_once}, {settings.delay_seconds}s apart)</p>
          </div>
        )}
        {log.length > 0 && (
          <div className="mt-4 max-h-48 space-y-1 overflow-y-auto rounded-lg bg-gray-50 p-3 font-mono text-xs">
            {log.map((l, i) => <p key={i}>{l}</p>)}
          </div>
        )}

        {selected.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 mb-2">
              Selected Directories Queue ({selected.length}) — Click to open individually anytime:
            </h3>
            <div className="max-h-52 overflow-y-auto divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
              {dirs.filter((d) => selected.includes(d.id)).map((d, idx) => (
                <div key={d.id} className="flex items-center justify-between px-3 py-2 text-xs hover:bg-gray-50">
                  <span className="font-medium text-gray-800 truncate mr-2">{idx + 1}. {d.name} <span className="text-gray-400 font-normal">({d.country})</span></span>
                  <a
                    href={d.add_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded bg-blue-50 px-2.5 py-1 font-semibold text-[#0F6FFF] hover:bg-blue-100 transition"
                  >
                    Open Tab &rarr;
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mt-3 text-xs text-gray-400">
          Browsers block silent pop-ups: allow pop-ups for this site, or the tabs will be blocked. Submissions are created as “Pending” in Reports — mark one “Live” there once the directory publishes it, and paste its live URL.
        </p>
      </Card>

      <Card className="p-5 border-blue-200 bg-blue-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-gray-900">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#0F6FFF] text-white text-xs">EXT</span>
              Prefer a Browser Extension over Bookmarklets?
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              Your project includes a complete Manifest V3 Chrome Extension in <code className="bg-white border px-1 rounded font-mono">public/extension</code> for 1-click form autofill.
            </p>
          </div>
          <Btn variant="secondary" onClick={() => window.location.href = "/dashboard/settings"}>
            View Extension Setup &rarr;
          </Btn>
        </div>
      </Card>

      <Card className="p-5">
        <p className="mt-2 text-sm text-gray-600">
          A page on another website cannot be filled from this app — browsers forbid it, which is why a bookmarklet is the honest mechanism.
          Pick a business above, then drag the button below to your bookmarks bar. On any directory form, click it and it fills name, phone, email, address, city, state, zip, country, website, description and category, then shows how many fields it filled. You always review and submit the form yourself.
        </p>
        {business ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a href={bookmarklet} className="rounded-lg bg-[#0F6FFF] px-4 py-2.5 text-sm font-semibold text-white" onClick={(e) => e.preventDefault()} title="Drag me to your bookmarks bar">
              ⚡ Auto Fill This Form — {business.name}
            </a>
            <Btn variant="secondary" onClick={async () => { await navigator.clipboard.writeText(bookmarklet); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
              {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy bookmarklet code</>}
            </Btn>
          </div>
        ) : (
          <p className="mt-3 text-sm text-amber-700">Select a business in Step 1 to generate its bookmarklet.</p>
        )}
      </Card>
    </div>
  );
}
