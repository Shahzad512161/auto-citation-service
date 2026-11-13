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
