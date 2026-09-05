import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="text-6xl font-bold text-pitch-200 mb-4">404</div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Page not found</h1>
        <p className="text-slate-500 mb-6">
          This page doesn't exist. Head back to the dashboard.
        </p>
        <Link href="/dashboard" className="btn-primary inline-block">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

