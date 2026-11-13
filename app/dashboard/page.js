"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Globe2, Rocket, BarChart3 } from "lucide-react";
import { Card, Badge } from "../../components/ui";
import { getBusinesses, getDirectories, getSubmissions, getSubscription, planLimit } from "../../lib/store";
import { getUser } from "../../lib/auth";

export default function DashboardHome() {
  const [stats, setStats] = useState({ businesses: 0, directories: 0, submissions: 0, live: 0 });
  const [sub, setSub] = useState(null);
  const [user, setUser] = useState(null);
  useEffect(() => {
    setUser(getUser());
    const subs = getSubmissions();
    setStats({
      businesses: getBusinesses().length,
      directories: getDirectories().length,
      submissions: subs.length,
      live: subs.filter((s) => s.status === "live").length,
    });
    setSub(getSubscription());
  }, []);
  const limit = sub ? planLimit(sub.plan) : 10000;
  const cards = [
    { label: "My Businesses", value: stats.businesses, icon: <Building2 size={20} />, href: "/dashboard/businesses" },
    { label: "Directories in library", value: stats.directories.toLocaleString(), icon: <Globe2 size={20} />, href: "/dashboard/directories" },
    { label: "Submissions", value: stats.submissions, icon: <Rocket size={20} />, href: "/dashboard/reports" },
    { label: "Live listings", value: stats.live, icon: <BarChart3 size={20} />, href: "/dashboard/reports" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back{user ? `, ${user.full_name.split(" ")[0]}` : ""} 👋</h1>
        <p className="text-sm text-gray-500">Add one business, pick directories country-wise, and blast it everywhere.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}><Card className="p-4 hover:shadow-md">
            <div className="flex items-center gap-2 text-[#0F6FFF]">{c.icon}<span className="text-xs font-semibold uppercase text-gray-500">{c.label}</span></div>
            <p className="mt-2 text-3xl font-extrabold">{c.value}</p>
          </Card></Link>
        ))}
      </div>
      {sub && (
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold">Your plan: {sub.plan}</p>
              <p className="text-sm text-gray-500">You have used {sub.listings_used || 0}/{limit} listings · Auto renewal {sub.auto_renew ? "ON" : "OFF"}</p>
            </div>
            <Badge tone="blue">{sub.status}</Badge>
            <Link href="/dashboard/subscription" className="rounded-lg bg-[#0F6FFF] px-4 py-2 text-sm font-semibold text-white">Upgrade plan</Link>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full bg-[#0F6FFF]" style={{ width: `${Math.min(100, ((sub.listings_used || 0) / limit) * 100)}%` }} />
          </div>
        </Card>
      )}
      <Card className="p-5">
        <h2 className="font-bold">How it works (3 steps)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-700">
          <li><b>Add a business:</b> paste a website URL and click “Auto Fetch Data with AI” — name, phone, email, description, services and logo are pulled from the site via the allorigins proxy.</li>
          <li><b>Pick directories:</b> choose a country in the Directory Library, tick the directories you want, or add your own.</li>
          <li><b>Blast:</b> open the Auto Blaster, select the business and directories, and start. Tabs open in batches; the auto-fill bookmarklet fills each directory form, and you review + submit each form yourself.</li>
        </ol>
        <p className="mt-3 text-xs text-gray-400">Honest limit: no tool can submit a form on another website without that site&apos;s cooperation or your own click. This MVP opens the real add-listing pages and auto-fills them for you — it never claims a listing is live until you (or the directory) confirm it.</p>
      </Card>
    </div>
  );
}
