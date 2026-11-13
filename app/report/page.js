"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, CheckCircle2, Clock, XCircle, ExternalLink, Download, Printer } from "lucide-react";
import { Card, Badge, Btn, Skeleton } from "../../components/ui";
import { LogoIcon } from "../../components/BrandLogo";
import { getBusinesses, getSubmissions, getAgencyBranding } from "../../lib/store";

function ReportViewer() {
  const searchParams = useSearchParams();
  const [biz, setBiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [agency, setAgency] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const bizId = searchParams.get("id");
    const allBiz = getBusinesses();
    const current = (bizId ? allBiz.find((b) => b.id === bizId) : null) || allBiz[0];
    setBiz(current);

    const allSubs = getSubmissions();
    const bizSubs = current ? allSubs.filter((s) => s.business_name === current.name) : allSubs;
    setSubmissions(bizSubs);

    setAgency(getAgencyBranding());
  }, [searchParams]);

  const liveCount = submissions.filter((s) => s.status === "live").length;
  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const healthPercent = submissions.length > 0 ? Math.round((liveCount / submissions.length) * 100) : 0;

  const displayed = submissions.filter((s) => {
    if (filter === "live") return s.status === "live";
    if (filter === "pending") return s.status === "pending";
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      {/* Agency White-Label Header */}
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            {agency?.agency_logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agency.agency_logo} alt={agency.agency_name} className="h-9 max-w-[160px] object-contain" />
            ) : (
              <LogoIcon size={36} />
            )}
            <div>
              <p className="font-extrabold text-sm sm:text-base leading-none">
                {agency?.agency_name || "Citation & Local SEO Report"}
              </p>
              <p className="text-[11px] text-gray-500">Live Client Performance Dashboard</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 pt-8 space-y-6 sm:px-6">
        {/* Business Title Card */}
        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F6FFF]">Client Report</span>
              <h1 className="text-2xl font-black text-gray-900 sm:text-3xl mt-0.5">{biz?.name || "Business Citations"}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {biz?.address ? `${biz.address}, ${biz.city}, ${biz.state} ${biz.zip}` : "Verified Local Listings"} · {biz?.phone}
              </p>
            </div>

            <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l sm:pl-6 pt-4 sm:pt-0">
              <div className="text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase">Citation Score</p>
                <p className="text-3xl font-black text-emerald-600">{healthPercent}%</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-gray-500 font-bold">Total Citations</p>
              <p className="text-2xl font-black">{submissions.length}</p>
            </div>
            <ShieldCheck size={32} className="text-[#0F6FFF]" />
          </Card>
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-gray-500 font-bold">Live Verified</p>
              <p className="text-2xl font-black text-emerald-600">{liveCount}</p>
            </div>
            <CheckCircle2 size={32} className="text-emerald-500" />
          </Card>
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-gray-500 font-bold">Pending Review</p>
              <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
            </div>
            <Clock size={32} className="text-amber-500" />
          </Card>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${filter === "all" ? "bg-[#0F6FFF] text-white" : "bg-white border text-gray-700"}`}
          >
            All Citations ({submissions.length})
          </button>
          <button
            onClick={() => setFilter("live")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${filter === "live" ? "bg-emerald-600 text-white" : "bg-white border text-gray-700"}`}
          >
            Live ({liveCount})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${filter === "pending" ? "bg-amber-500 text-white" : "bg-white border text-gray-700"}`}
          >
            Pending ({pendingCount})
          </button>
        </div>

        {/* Submissions Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Directory</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Submission Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Live Listing URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayed.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/70">
                    <td className="px-4 py-3 font-semibold text-gray-900">{s.directory_name}</td>
                    <td className="px-4 py-3 text-gray-600">{s.country}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Badge tone={s.status === "live" ? "emerald" : s.status === "failed" ? "red" : "amber"}>
                        {s.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.live_url ? (
                        <a
                          href={s.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-xs text-[#0F6FFF] hover:underline"
                        >
                          View Live Listing <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">Processing by directory</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {displayed.length === 0 && (
            <p className="p-8 text-center text-sm text-gray-500">No citations found under this status.</p>
          )}
        </Card>

        {/* Agency Footer */}
        <footer className="text-center text-xs text-gray-400 pt-6">
          <p>{agency?.footer_text || "Prepared by your Local SEO Citation Team"}</p>
          {agency?.contact_email && <p className="mt-1">Questions? Contact: {agency.contact_email}</p>}
        </footer>
      </main>
    </div>
  );
}

export default function PublicClientReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center text-sm text-gray-500">Loading report…</div>}>
      <ReportViewer />
    </Suspense>
  );
}
