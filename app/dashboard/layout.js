"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Zap, LayoutDashboard, Building2, Globe2, Rocket, BarChart3, CreditCard, Settings, LogOut, BadgeCheck, ScanSearch, TrendingUp } from "lucide-react";
import { NavLink, Badge } from "../../components/ui";
import { getUser, signOut, initials } from "../../lib/auth";
import { syncFromFirestore } from "../../lib/store";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/dashboard/businesses", label: "My Businesses", icon: <Building2 size={18} /> },
  { href: "/dashboard/directories", label: "Directory Library", icon: <Globe2 size={18} /> },
  { href: "/dashboard/blaster", label: "Auto Blaster", icon: <Rocket size={18} /> },
  { href: "/dashboard/audit", label: "Citation Audit (NAP)", icon: <ScanSearch size={18} /> },
  { href: "/dashboard/rank-tracker", label: "3-Pack Rank Tracker", icon: <TrendingUp size={18} /> },
  { href: "/dashboard/reports", label: "Reports & White-Label", icon: <BarChart3 size={18} /> },
  { href: "/dashboard/subscription", label: "Subscription", icon: <CreditCard size={18} /> },
  { href: "/dashboard/settings", label: "Settings", icon: <Settings size={18} /> },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/");
    } else {
      setUser(u);
      syncFromFirestore();
    }
    setReady(true);
    const onChange = () => setUser(getUser());
    window.addEventListener("cb-user-changed", onChange);
    return () => window.removeEventListener("cb-user-changed", onChange);
  }, [router]);

  if (!ready) return <main className="flex min-h-screen items-center justify-center text-sm text-gray-500">Loading…</main>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F6FFF] text-white"><Zap size={20} /></span>
          <div>
            <p className="font-extrabold leading-none">Citation Blaster</p>
            <p className="text-[11px] text-gray-500">One Business, 1000 Directories</p>
          </div>
        </div>
        <nav className="space-y-1">
          {NAV.map((n) => (
            <NavLink key={n.href} href={n.href} active={pathname === n.href}>{n.icon}{n.label}</NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-xl bg-blue-50 p-3 text-xs text-blue-900">
          <p className="font-bold">Firebase Connected</p>
          <p className="mt-1">Google Auth & Firestore cloud sync active.</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
          <nav className="flex flex-wrap gap-1 md:hidden">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className={`rounded-lg px-2 py-1.5 text-xs font-medium ${pathname === n.href ? "bg-[#0F6FFF] text-white" : "bg-gray-100"}`}>{n.label}</a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="flex items-center justify-end gap-1 text-sm font-semibold">{user.full_name} {user.provider === "google" && <BadgeCheck size={16} className="text-[#0F6FFF]" />}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F6FFF] text-sm font-bold text-white">{initials(user.full_name, user.email)}</span>
            )}
            <Badge tone={user.provider === "google" ? "blue" : "gray"}>
              {user.provider === "google" ? "Verified via Google" : "Verified via Email"}
            </Badge>
            <button
              onClick={async () => { await signOut(); router.replace("/"); }}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
              title="Sign out"
            >
              <LogOut size={16} /><span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
