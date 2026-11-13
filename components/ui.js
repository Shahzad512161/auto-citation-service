"use client";
import Link from "next/link";

export function Btn({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50";
  const styles = {
    primary: "bg-[#0F6FFF] text-white hover:bg-[#0d5ed6]",
    secondary: "bg-white text-black border border-gray-300 hover:bg-gray-50",
    dark: "bg-black text-white hover:bg-gray-800",
    ghost: "text-gray-600 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props}>{children}</button>;
}

export function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
    </label>
  );
}

export const inputCls = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-gray-400";

export function Badge({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-700", green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-800", red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700", purple: "bg-purple-100 text-purple-700",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Progress({ value, total }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-[#0F6FFF] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-gray-500">{value}/{total} ({pct}%)</p>
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function NavLink({ href, active, children }) {
  return (
    <Link href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${active ? "bg-[#0F6FFF] text-white" : "text-gray-700 hover:bg-gray-100"}`}>
      {children}
    </Link>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded bg-gray-200/80 ${className}`} />;
}

export function ContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Skeleton */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white p-4 md:flex">
        <div className="mb-6 flex items-center gap-3 px-2">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
        <div className="mt-auto">
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </aside>

      {/* Main Skeleton */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <div className="flex gap-2 md:hidden">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="space-y-1 text-right">
              <Skeleton className="h-4 w-24 ml-auto" />
              <Skeleton className="h-3 w-32 ml-auto" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </header>

        {/* Content Skeleton */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-48 rounded-lg" />
              <Skeleton className="h-4 w-72 rounded" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="space-y-3 pt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
