export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export function PageLoader({ label = 'Loading workspace…' }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-slate-500">
      <Spinner className="h-8 w-8 text-indigo-600" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function FullPageLoader({ label = 'Preparing your workspace…' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
          <Spinner className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}
