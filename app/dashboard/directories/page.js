"use client";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, ExternalLink } from "lucide-react";
import { Btn, Card, Field, inputCls, Modal, Badge } from "../../../components/ui";
import { COUNTRIES, getDirectories, save, getCustomDirectories, uid } from "../../../lib/store";

export default function DirectoriesPage() {
  const [country, setCountry] = useState("USA");
  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  const [minDa, setMinDa] = useState(0);
  const [type, setType] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", website_url: "", add_url: "", country: "USA", da: "" });

  useEffect(() => { setAll(getDirectories()); }, []);
  const counts = useMemo(() => {
    const c = {};
    all.forEach((d) => { c[d.country] = (c[d.country] || 0) + 1; });
    return c;
  }, [all]);

  const rows = all.filter((d) => {
    if (country !== "Custom" && d.country !== country) return false;
    if (country === "Custom" && !d.is_custom) return false;
    if (q && !d.name.toLowerCase().includes(q.toLowerCase()) && !(d.website_url || "").toLowerCase().includes(q.toLowerCase())) return false;
    if (minDa && (d.da || 0) < minDa) return false;
    if (type !== "All" && d.type !== type) return false;
    return true;
  });

  function addCustom(e) {
    e.preventDefault();
    if (!form.name || !form.website_url || !form.add_url) return;
    const rec = { id: "custom-" + uid(), name: form.name, website_url: form.website_url, add_url: form.add_url, country: form.country, da: form.da ? Number(form.da) : null, type: "Free", is_custom: true, category: "Custom" };
    save("cb_custom_directories", [...getCustomDirectories(), rec]);
    setAll(getDirectories());
    setShowAdd(false);
    setForm({ name: "", website_url: "", add_url: "", country: "USA", da: "" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Directory Library (Global Library)</h1>
        <Btn onClick={() => setShowAdd(true)}><Plus size={18} /> Add Custom Directory</Btn>
      </div>
      <p className="text-sm text-gray-500">
        Tab counts are real loaded rows. USA (1,045) comes from a verified seed file; UK (22) from a verified UK seed file; other countries are starter lists — grow any country with “Add Custom Directory”.
        Target library sizes from the original spec: USA 1000 · UK 500 · Australia 300 · Canada 300 · UAE 100 · Saudi 100 · Pakistan 200 · India 200.
      </p>

      <div className="flex flex-wrap gap-2">
        {[...COUNTRIES, "Custom"].map((c) => (
          <button key={c} onClick={() => setCountry(c)} className={`rounded-full px-4 py-2 text-sm font-semibold ${country === c ? "bg-[#0F6FFF] text-white" : "bg-white border border-gray-300"}`}>
            {c} ({c === "Custom" ? (counts.Custom || 0) : (counts[c] || 0)})
          </button>
        ))}
      </div>

      <Card className="flex flex-wrap gap-3 p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input className={`${inputCls} pl-9`} placeholder="Search directories…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className={inputCls} style={{ width: 180 }} value={minDa} onChange={(e) => setMinDa(Number(e.target.value))}>
          <option value={0}>Any DA</option><option value={30}>DA 30+</option><option value={50}>DA 50+</option><option value={70}>DA 70+</option><option value={90}>DA 90+</option>
        </select>
        <select className={inputCls} style={{ width: 160 }} value={type} onChange={(e) => setType(e.target.value)}>
          <option>All</option><option>Free</option><option>Paid</option>
        </select>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
              <th className="px-4 py-3">Name</th><th className="px-4 py-3">Website URL</th><th className="px-4 py-3">Add Business URL</th><th className="px-4 py-3">DA</th><th className="px-4 py-3">Type</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 200).map((d) => (
              <tr key={d.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium">{d.name} {d.is_custom && <Badge tone="purple">Custom</Badge>}</td>
                <td className="px-4 py-2.5"><a href={d.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">{d.website_url?.replace(/^https?:\/\//, "")} <ExternalLink size={12} /></a></td>
                <td className="px-4 py-2.5"><a href={d.add_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">Open add page <ExternalLink size={12} /></a></td>
                <td className="px-4 py-2.5">{d.da ?? "—"}</td>
                <td className="px-4 py-2.5"><Badge tone={d.type === "Free" ? "green" : "yellow"}>{d.type}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-sm text-gray-500">No directories match these filters.</p>}
        {rows.length > 200 && <p className="p-4 text-xs text-gray-400">Showing the first 200 of {rows.length} matches. Narrow the search to see more.</p>}
        <p className="border-t p-4 text-xs text-gray-400">USA/UK DA values come from the seed files. “Type: Free” on seed rows is the demo-seed default — verify a directory&apos;s pricing on its own site before paying anything.</p>
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Custom Directory">
        <form onSubmit={addCustom} className="space-y-3">
          <Field label="Directory Name"><input className={inputCls} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Website URL"><input className={inputCls} required placeholder="https://example.com" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} /></Field>
          <Field label="Add Listing URL"><input className={inputCls} required placeholder="https://example.com/add-business" value={form.add_url} onChange={(e) => setForm({ ...form, add_url: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Country">
              <select className={inputCls} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="DA (optional)"><input className={inputCls} type="number" min="0" max="100" value={form.da} onChange={(e) => setForm({ ...form, da: e.target.value })} /></Field>
          </div>
          <Btn type="submit" className="w-full">Save custom directory</Btn>
        </form>
      </Modal>
    </div>
  );
}
