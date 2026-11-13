"use client";
import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import { Btn, Card, inputCls, Badge } from "../../../components/ui";
import { getSubmissions, save } from "../../../lib/store";

const TONE = { pending: "yellow", live: "green", failed: "red", needs_update: "purple" };

export default function ReportsPage() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");

  useEffect(() => { setRows(getSubmissions()); }, []);
  const update = (next) => { setRows(next); save("cb_submissions", next); };

  const filtered = rows.filter((r) => {
    if (filter !== "All" && r.status !== filter) return false;
    if (q && !`${r.business_name} ${r.directory_name}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  function exportCsv() {
    const head = ["Business", "Directory", "Country", "Date", "Status", "Live URL"];
    const body = filtered.map((r) => [r.business_name, r.directory_name, r.country, new Date(r.date).toLocaleString(), r.status, r.live_url || ""]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[head.join(","), ...body].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "citation-blaster-report.csv"; a.click();
  }

  function exportPdf() {
    const w = window.open("", "_blank");
    if (!w) { alert("Allow pop-ups to export the PDF."); return; }
    w.document.write(`<html><head><title>Citation Blaster Report</title><style>table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:6px;font:12px sans-serif}</style></head><body><h1>Citation Blaster — Reports</h1><table><tr><th>Business</th><th>Directory</th><th>Country</th><th>Date</th><th>Status</th><th>Live URL</th></tr>${filtered.map((r) => `<tr><td>${r.business_name}</td><td>${r.directory_name}</td><td>${r.country}</td><td>${new Date(r.date).toLocaleString()}</td><td>${r.status}</td><td>${r.live_url || ""}</td></tr>`).join("")}</table><script>window.print()</script></body></html>`);
    w.document.close();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-2">
          <Btn variant="secondary" onClick={exportCsv}><Download size={16} /> Export Excel (CSV)</Btn>
          <Btn variant="secondary" onClick={exportPdf}><Printer size={16} /> Export PDF</Btn>
        </div>
      </div>

      <Card className="flex flex-wrap gap-3 p-4">
        <input className={inputCls} style={{ minWidth: 220, flex: 1 }} placeholder="Search business or directory…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inputCls} style={{ width: 180 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option><option value="pending">Pending</option><option value="live">Live</option><option value="failed">Failed</option><option value="needs_update">Needs update</option>
        </select>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
              <th className="px-4 py-3">Business</th><th className="px-4 py-3">Directory</th><th className="px-4 py-3">Country</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Live URL</th><th className="px-4 py-3">Screenshot / note</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium">{r.business_name}</td>
                <td className="px-4 py-2.5">{r.directory_name}</td>
                <td className="px-4 py-2.5">{r.country}</td>
                <td className="px-4 py-2.5">{new Date(r.date).toLocaleDateString()}</td>
                <td className="px-4 py-2.5">
                  <select
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs"
                    value={r.status}
                    onChange={(e) => update(rows.map((x) => x.id === r.id ? { ...x, status: e.target.value } : x))}
                  >
                    <option value="pending">Pending</option><option value="live">Live</option><option value="failed">Failed</option><option value="needs_update">Needs update</option>
                  </select>
                </td>
                <td className="px-4 py-2.5">
                  <input
                    className="w-44 rounded-lg border border-gray-300 px-2 py-1 text-xs"
                    placeholder="Paste live URL…"
                    value={r.live_url || ""}
                    onChange={(e) => update(rows.map((x) => x.id === r.id ? { ...x, live_url: e.target.value } : x))}
                  />
                </td>
                <td className="px-4 py-2.5"><Badge tone={TONE[r.status] || "gray"}>{r.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-sm text-gray-500">No submissions yet. Run a blast first — rows appear here as “Pending”.</p>}
        <p className="border-t p-4 text-xs text-gray-400">
          Screenshots: directories don&apos;t offer a screenshot API, so this MVP records the live URL you paste and the status you set. Use your browser&apos;s screenshot tool on a live listing page if you need a capture for a client.
        </p>
      </Card>
    </div>
  );
}
