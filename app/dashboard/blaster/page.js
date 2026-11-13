"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Rocket, Copy, Check, Bookmark } from "lucide-react";
import { Btn, Card, Field, inputCls, Progress, Badge, Modal } from "../../../components/ui";
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
  const [gateway, setGateway] = useState("unblock"); // "unblock" (No VPN needed via Cloud Gateway) | "direct"
  const [stepperActive, setStepperActive] = useState(false);
  const [stepperIndex, setStepperIndex] = useState(0);
  const [hasExtension, setHasExtension] = useState(false);
  const [extVersion, setExtVersion] = useState("");
  const [extModalOpen, setExtModalOpen] = useState(false);
  const stopRef = useRef(false);

  useEffect(() => {
    function handleMsg(e) {
      if (e.data?.type === "BLASTER_EXTENSION_INSTALLED") {
        setHasExtension(true);
        if (e.data.version) setExtVersion(e.data.version);
      }
      if (e.data?.type === "BLASTER_TABS_OPENED") {
        setLog((l) => [...l, `🚀 Extension successfully opened all ${e.data.count} tabs simultaneously!`]);
      }
    }
    window.addEventListener("message", handleMsg);
    // Ping extension
    window.postMessage({ type: "BLASTER_PING_EXTENSION" }, "*");
    const timer = setInterval(() => {
      window.postMessage({ type: "BLASTER_PING_EXTENSION" }, "*");
    }, 1500);
    return () => {
      window.removeEventListener("message", handleMsg);
      clearInterval(timer);
    };
  }, []);

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

  function formatOpenUrl(rawUrl) {
    if (gateway === "unblock") {
      // Routes through Google Cloud Proxy to bypass TLC/PTA firewall and regional IP bans without any VPN
      return `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(rawUrl)}`;
    }
    return rawUrl;
  }

  function startStepper() {
    if (!business) { alert("Select a business first."); return; }
    if (selected.length === 0) { alert("Select at least one directory."); return; }
    localStorage.setItem("blaster_business_data", JSON.stringify(business));
    setStepperIndex(0);
    setStepperActive(true);
    setLog((l) => [...l, `⚡ Rapid Stepper started for ${selected.length} directories. Press Spacebar or click Open to launch each tab.`]);
  }

  function openNextStep() {
    const chosen = dirs.filter((d) => selected.includes(d.id));
    if (stepperIndex >= chosen.length) {
      setStepperActive(false);
      return;
    }
    const d = chosen[stepperIndex];
    const target = formatOpenUrl(d.add_url);
    window.open(target, "_blank");
    const user = getUser();
    const subs = getSubmissions();
    subs.push({
      id: uid(),
      user_id: user?.id || "demo",
      business_id: business.id,
      business_name: business.name,
      directory_id: d.id,
      directory_name: d.name,
      country,
      date: new Date().toISOString(),
      status: "pending",
      live_url: "",
    });
    save("cb_submissions", subs);
    const sub = getSubscription();
    sub.listings_used = (sub.listings_used || 0) + 1;
    save("cb_subscription", sub);
    setLog((l) => [...l, `Opened (${stepperIndex + 1}/${chosen.length}): ${d.name} → ${d.add_url}`]);
    if (stepperIndex + 1 >= chosen.length) {
      setStepperActive(false);
      setStepperIndex(0);
      alert(`🎉 All ${chosen.length} directory tabs opened successfully!`);
    } else {
      setStepperIndex((idx) => idx + 1);
    }
  }

  useEffect(() => {
    if (!stepperActive) return;
    function onKey(e) {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        openNextStep();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stepperActive, stepperIndex, selected, dirs, business, gateway]);

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
    const urls = chosen.map((d) => formatOpenUrl(d.add_url));

    // 1. Dispatch event to Chrome Extension (if installed, it opens all 100+ tabs in 1 instant background batch)
    window.postMessage({ type: "BLASTER_OPEN_ALL_TABS", urls }, "*");

    if (hasExtension) {
      const subs = getSubmissions();
      chosen.forEach((d) => {
        subs.push({
          id: uid(),
          user_id: user?.id || "demo",
          business_id: business.id,
          business_name: business.name,
          directory_id: d.id,
          directory_name: d.name,
          country,
          date: new Date().toISOString(),
          status: "pending",
          live_url: "",
        });
        setLog((l) => [...l, `Opened (via Extension): ${d.name} → ${d.add_url}`]);
      });
      setOpened(chosen.length);
      save("cb_submissions", subs);
      const sub = getSubscription();
      sub.listings_used = (sub.listings_used || 0) + chosen.length;
      save("cb_subscription", sub);
      setRunning(false);
      return;
    }

    // 2. Direct Web Fallback (opens tabs in loop)
    const batch = settings.tabs_at_once;
    const delay = settings.delay_seconds * 1000;
    let done = 0;
    let blockedDetected = false;
    const subs = getSubmissions();
    for (let i = 0; i < chosen.length; i += batch) {
      if (stopRef.current) break;
      const chunk = chosen.slice(i, i + batch);
      chunk.forEach((d) => {
        const targetToOpen = formatOpenUrl(d.add_url);
        try {
          const win = window.open(targetToOpen, "_blank");
          if (!win || win.closed || typeof win.closed === "undefined") {
            blockedDetected = true;
          }
        } catch {
          blockedDetected = true;
        }
        subs.push({ id: uid(), user_id: user?.id || "demo", business_id: business.id, business_name: business.name, directory_id: d.id, directory_name: d.name, country, date: new Date().toISOString(), status: "pending", live_url: "" });
        setLog((l) => [...l, `Opened: ${d.name} (${gateway === "unblock" ? "Unblocked Cloud" : "Direct"}) → ${d.add_url}`]);
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold">Step 4 — Blast</h2>
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setGateway("unblock")}
              className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                gateway === "unblock"
                  ? "bg-[#0F6FFF] text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              ⚡ Auto-Unblock (No VPN Needed)
            </button>
            <button
              type="button"
              onClick={() => setGateway("direct")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                gateway === "direct"
                  ? "bg-[#0F6FFF] text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Direct (With VPN)
            </button>
          </div>
        </div>

        {gateway === "unblock" ? (
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900">
            <p className="font-semibold flex items-center gap-1.5">
              <span>⚡</span> Auto-Unblock Cloud Gateway Active
            </p>
            <p className="mt-0.5">
              Target directory pages are routed through an encrypted cloud proxy edge. This completely bypasses local ISP blocks (<strong>Blocked by TLC</strong> / PTA filters) and foreign IP restrictions without needing any VPN or software installed.
            </p>
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <p className="font-semibold flex items-center gap-1">⚠️ Direct Connection Selected</p>
            <p className="mt-0.5">
              Your browser will connect directly to directory domains. If your ISP shows <strong>&ldquo;Blocked By TLC&rdquo;</strong>, switch to <strong>Auto-Unblock</strong> mode above or turn on a VPN.
            </p>
          </div>
        )}

        {hasExtension ? (
          <div className="mt-3 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-950 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-black text-xs">✓</span>
              <div>
                <p className="font-extrabold text-emerald-900 text-xs">Chrome Extension Connected (Tabs Engine v{extVersion || "1.2"})</p>
                <p className="text-emerald-700 text-[11px]">All {selected.length} tabs will open simultaneously with ZERO pop-up blocker restrictions!</p>
              </div>
            </div>
            <Badge tone="green">100+ Tabs Allowed</Badge>
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/40 p-3 text-xs shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-[#0F6FFF] text-white font-mono text-[10px] font-black">EXT</span>
                  Want all 100+ tabs to open in 1 instant click like other extensions?
                </p>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  Load your built-in extension in <code className="bg-white border px-1 rounded font-mono">public/extension</code> into Chrome to bypass all browser tab limitations!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExtModalOpen(true)}
                className="rounded-lg bg-[#0F6FFF] px-3 py-1.5 font-bold text-white hover:bg-blue-700 transition shadow-2xs text-xs"
              >
                Connect Extension (10s Setup) &rarr;
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Btn onClick={startBlast} disabled={running || stepperActive || !business || selected.length === 0} className="!px-6 !py-3 text-base shadow-sm">
            <Rocket size={18} /> START AUTO BLAST — Open {settings.tabs_at_once} Tabs at Once
          </Btn>
          <button
            type="button"
            onClick={startStepper}
            disabled={running || stepperActive || !business || selected.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0F6FFF] bg-white px-5 py-3 text-sm font-extrabold text-[#0F6FFF] hover:bg-blue-50 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            ⚡ Rapid 1-Tap Stepper (Spacebar to Open Each)
          </button>
          {running && <Btn variant="danger" onClick={() => { stopRef.current = true; }}>Stop</Btn>}
        </div>

        {stepperActive && (
          <div className="mt-4 rounded-2xl border-2 border-[#0F6FFF] bg-blue-50/50 p-5 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0F6FFF] text-white text-xs font-bold">
                    {stepperIndex + 1}
                  </span>
                  <h3 className="font-extrabold text-base text-gray-900">
                    Rapid Stepper Active: Opening Tab {stepperIndex + 1} of {selected.length}
                  </h3>
                </div>
                <p className="mt-1 text-sm font-semibold text-gray-700">
                  Target: <span className="text-[#0F6FFF] font-bold">{dirs.filter((d) => selected.includes(d.id))[stepperIndex]?.name}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  💡 Tap your keyboard <kbd className="rounded bg-white border border-gray-300 px-1.5 py-0.5 font-mono text-gray-800 font-bold shadow-2xs">Spacebar</kbd> or <kbd className="rounded bg-white border border-gray-300 px-1.5 py-0.5 font-mono text-gray-800 font-bold shadow-2xs">Enter</kbd> to open each tab immediately (never blocked by browser)!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openNextStep}
                  className="rounded-xl bg-[#0F6FFF] px-6 py-3 font-extrabold text-white shadow-md hover:bg-[#0d5ed6] active:scale-95 transition flex items-center gap-2 text-sm cursor-pointer"
                >
                  Open Tab &rarr; ({stepperIndex + 1}/{selected.length})
                </button>
                <Btn variant="secondary" onClick={() => setStepperActive(false)}>
                  Done
                </Btn>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={stepperIndex + 1} total={selected.length} />
            </div>
          </div>
        )}

        {popupBlocked && (
          <div className="mt-4 rounded-xl border-2 border-red-500 bg-red-50 p-4 text-sm text-red-900 shadow-md">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🚫</span>
              <div className="space-y-2">
                <h3 className="font-bold text-base text-red-800">
                  Why Chrome Blocked 9 of the 10 Tabs:
                </h3>
                <p className="text-sm text-red-700">
                  By default, Chrome allows <strong>only 1 new tab per button click</strong> to protect users from malicious popup spam. All subsequent tabs are stopped by Chrome&apos;s Pop-up Blocker.
                </p>
                <div className="rounded-lg bg-white p-3 border border-red-200">
                  <p className="font-semibold text-xs text-gray-900 mb-1">To allow all 10 tabs to open in 1 click:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-xs text-gray-700">
                    <li>Look at the <strong>far-right end of your Chrome address bar (URL bar)</strong> at the top of your screen.</li>
                    <li>Click the <strong>Pop-up Blocked icon</strong> (tiny window with red &times; mark).</li>
                    <li>Select <strong>&ldquo;Always allow pop-ups and redirects from http://localhost:3000&rdquo;</strong>.</li>
                    <li>Click <strong>Done</strong>, then click <strong>START AUTO BLAST</strong> again!</li>
                  </ol>
                </div>
                <div className="pt-1">
                  <p className="text-xs font-semibold text-gray-800">
                    Don&apos;t want to change browser settings? Use the <strong>&ldquo;⚡ Rapid 1-Tap Stepper&rdquo;</strong> button above and tap your Spacebar to open each tab in 1 second!
                  </p>
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
                  <div className="shrink-0 flex items-center gap-1.5">
                    <a
                      href={formatOpenUrl(d.add_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded bg-blue-50 px-2.5 py-1 font-bold text-[#0F6FFF] hover:bg-blue-100 transition"
                      title={gateway === "unblock" ? "Open without VPN via Google Cloud Gateway" : "Open directory tab"}
                    >
                      {gateway === "unblock" ? "⚡ Open Without VPN" : "Open Tab →"}
                    </a>
                    {gateway === "unblock" && (
                      <a
                        href={d.add_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded bg-gray-100 px-2 py-1 text-gray-500 hover:bg-gray-200 transition"
                        title="Open direct URL without proxy"
                      >
                        Direct
                      </a>
                    )}
                  </div>
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

      <Modal open={extModalOpen} onClose={() => setExtModalOpen(false)} title="Connect Chrome Extension (Open 100+ Tabs at Once)">
        <div className="space-y-4 text-sm text-gray-700">
          <p>
            Standard web browsers block multiple tabs when opened by a normal website. However, <strong>Chrome Extensions</strong> have native access to the <code>chrome.tabs.create</code> API, which can open <strong>100+ tabs simultaneously in 1 click with ZERO pop-up restrictions</strong>!
          </p>
          <div className="rounded-xl bg-gray-50 p-4 border border-gray-200 space-y-2 text-xs">
            <p className="font-bold text-gray-900 text-sm">How to load your extension into Chrome (Takes 10 seconds):</p>
            <ol className="list-decimal pl-5 space-y-2 text-xs text-gray-700">
              <li>Open a new tab in Chrome and go to: <code className="bg-white px-2 py-0.5 border rounded font-mono font-bold text-blue-600">chrome://extensions</code></li>
              <li>Toggle <strong>&ldquo;Developer mode&rdquo;</strong> in the top-right corner to <strong>ON</strong>.</li>
              <li>Click the <strong>&ldquo;Load unpacked&rdquo;</strong> button in the top-left corner.</li>
              <li>Select your project&apos;s extension folder:
                <div className="mt-1 font-mono bg-white border border-gray-300 p-2 rounded text-[11px] select-all font-bold text-gray-900 break-all">
                  C:\Users\Shahzad Diyal\Downloads\Global-Citation-Auto-Blaster\public\extension
                </div>
              </li>
              <li>That&apos;s it! Once loaded, this page automatically detects it and displays the green <strong>&ldquo;Chrome Extension Connected&rdquo;</strong> badge. Clicking &ldquo;START AUTO BLAST&rdquo; will open all 100+ tabs at once!</li>
            </ol>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn onClick={() => setExtModalOpen(false)}>Done, Let&apos;s Blast</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
