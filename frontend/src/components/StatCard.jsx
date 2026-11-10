const TONES = {
  indigo: { icon: 'bg-indigo-50 text-indigo-600', bar: 'bg-indigo-500', value: 'text-slate-900' },
  amber: { icon: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500', value: 'text-slate-900' },
  blue: { icon: 'bg-blue-50 text-blue-600', bar: 'bg-blue-500', value: 'text-slate-900' },
  emerald: { icon: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500', value: 'text-slate-900' },
  rose: { icon: 'bg-rose-50 text-rose-600', bar: 'bg-rose-500', value: 'text-rose-600' },
  violet: { icon: 'bg-violet-50 text-violet-600', bar: 'bg-violet-500', value: 'text-slate-900' },
};

export default function StatCard({ title, value, icon: Icon, tone = 'indigo', hint, progress, loading = false }) {
  const styles = TONES[tone] || TONES.indigo;

  if (loading) {
    return (
      <div className="card animate-pulse p-4">
        <div className="mb-4 h-9 w-9 rounded-xl bg-slate-100" />
        <div className="h-7 w-16 rounded bg-slate-100" />
        <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="card group p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_18px_40px_-24px_rgba(15,23,42,0.25)]">
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles.icon}`}>
          <Icon className="h-4.5 w-4.5" />
        </span>
        {typeof progress === 'number' && (
          <span className="text-xs font-bold text-slate-500">{Math.round(progress)}%</span>
        )}
      </div>
      <p className={`mt-3 font-display text-2xl font-bold tracking-tight ${styles.value}`}>{value}</p>
      <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{title}</p>
      {hint && <p className="mt-1 truncate text-[10px] text-slate-400">{hint}</p>}
      {typeof progress === 'number' && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full transition-all duration-500 ${styles.bar}`} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
        </div>
      )}
    </div>
  );
}
