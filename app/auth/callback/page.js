"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  useEffect(() => {
    // With Firebase popup login, auth is handled in-place.
    // If a redirect flow is ever triggered, redirect straight to dashboard.
    router.replace("/dashboard");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <p className="text-sm text-gray-600">Signing you in…</p>
    </main>
  );
}
