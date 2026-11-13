"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Zap, LayoutDashboard, Building2, Globe2, Rocket, BarChart3, CreditCard, Settings, LogOut, BadgeCheck, ScanSearch, TrendingUp, Menu, X } from "lucide-react";
import { NavLink, Badge, DashboardSkeleton } from "../../components/ui";
import BrandLogo from "../../components/BrandLogo";
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
  const [user, setUser] = useState(getUser);
  const [ready, setReady] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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

  if (!ready && !user) return <DashboardSkeleton />;
  if (!user) return <DashboardSkeleton />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white p-4 md:flex sticky top-0 h-screen overflow-y-auto z-30">
        <div className="mb-6 px-2">
          <BrandLogo size="md" />
        </div>
        <nav className="space-y-1">
          {NAV.map((n) => (
            <NavLink key={n.href} href={n.href} active={pathname === n.href}>{n.icon}{n.label}</NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-4 rounded-xl bg-blue-50 p-3 text-xs text-blue-900">
          <p className="font-bold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Cloud Sync Active
          </p>
          <p className="mt-1 text-[11px] text-blue-700">Google Auth & Firestore cloud sync active.</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Mobile Menu Trigger + Brand Logo on Mobile / Breadcrumb on Desktop */}
            <div className="flex items-center gap-2.5 md:gap-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((o) => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 md:hidden transition"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div className="md:hidden">
                <BrandLogo size="sm" showSubtitle={false} />
              </div>

              <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-gray-400 font-medium">Dashboard</span>
                <span className="text-gray-300">/</span>
                <span className="font-bold text-gray-800">
                  {NAV.find((n) => n.href === pathname)?.label || "Overview"}
                </span>
              </div>
            </div>

            {/* Right: User Profile & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden text-right lg:block">
                <p className="flex items-center justify-end gap-1 text-sm font-bold text-gray-900 leading-tight">
                  {user.full_name} {user.provider === "google" && <BadgeCheck size={15} className="text-[#0F6FFF]" />}
                </p>
                <p className="text-[11px] text-gray-500 truncate max-w-[180px]">{user.email}</p>
              </div>

              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt="" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover ring-2 ring-gray-100" />
              ) : (
                <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#0F6FFF] text-xs font-bold text-white shadow-xs">
                  {initials(user.full_name, user.email)}
                </span>
              )}

              <div className="hidden sm:block">
                <Badge tone={user.provider === "google" ? "blue" : "gray"}>
                  {user.provider === "google" ? "Google" : "Email"}
                </Badge>
              </div>

              <button
                onClick={async () => { await signOut(); router.replace("/"); }}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-red-600 transition"
                title="Sign out"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu Drawer */}
          {mobileMenuOpen && (
            <div className="mt-3 border-t border-gray-100 pt-3 md:hidden space-y-1">
              <div className="mb-2 px-3 py-2 rounded-lg bg-gray-50 flex items-center justify-between text-xs text-gray-600">
                <span className="font-semibold text-gray-800 truncate mr-2">{user.full_name || user.email}</span>
                <Badge tone={user.provider === "google" ? "blue" : "gray"}>
                  {user.provider === "google" ? "Google Verified" : "Email"}
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {NAV.map((n) => {
                  const active = pathname === n.href;
                  return (
                    <a
                      key={n.href}
                      href={n.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        active ? "bg-[#0F6FFF] text-white shadow-xs" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className={active ? "text-white" : "text-gray-500"}>{n.icon}</span>
                      {n.label}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-4 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
