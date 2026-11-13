import { Skeleton } from "../components/ui";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-6 w-36 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-48 mx-auto rounded-lg" />
        <Skeleton className="h-4 w-64 mx-auto rounded" />
        <div className="space-y-3 pt-4">
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
