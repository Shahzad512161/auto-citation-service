import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
      <p className="mt-2 text-sm text-gray-500">The page you are looking for does not exist.</p>
      <Link href="/dashboard" className="mt-4 rounded-lg bg-[#0F6FFF] px-4 py-2 text-sm font-semibold text-white">
        Return to Dashboard
      </Link>
    </div>
  );
}
