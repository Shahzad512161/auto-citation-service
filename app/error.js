"use client";
import { useEffect } from "react";
import { Btn } from "../components/ui";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-gray-500 max-w-md">
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="mt-4 flex gap-3">
        <Btn onClick={() => reset()}>Try Again</Btn>
        <Btn variant="secondary" onClick={() => window.location.href = "/dashboard"}>Go to Dashboard</Btn>
      </div>
    </div>
  );
}
