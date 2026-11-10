import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LayoutDashboard, ListTodo, LogOut, Tags, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { initials } from '../utils/format';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/categories', label: 'Categories', icon: Tags },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onClose }) {
  const { admin, logout } = useAuth();
  const location = useLocation();

  const isActive = (item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 animate-fade-in bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/5 bg-[#0b1220] text-slate-300 transition-[width,transform] duration-300 ${
          collapsed ? 'lg:w-[84px]' : 'lg:w-[264px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.18),transparent_60%)]" />

        <div className={`relative flex h-16 items-center border-b border-white/5 px-4 ${collapsed ? 'lg:justify-center lg:px-2' : 'gap-3'}`}>
          <Link to="/" onClick={onClose} className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-900/40">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className={`min-w-0 transition-opacity ${collapsed ? 'lg:hidden' : ''}`}>
              <span className="block font-display text-base font-bold tracking-tight text-white">TaskFlow</span>
              <span className="block text-[11px] font-medium text-slate-500">Admin workspace</span>
            </span>
          </Link>
          <button type="button" onClick={onClose} className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600 ${collapsed ? 'lg:hidden' : ''}`}>
            Workspace
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-white/[0.08] text-white shadow-sm ring-1 ring-inset ring-white/10'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                } ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}
              >
                {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-indigo-400" />}
                <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-indigo-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative border-t border-white/5 p-3">
          <div className={`mb-2 flex items-center gap-3 rounded-xl bg-white/[0.04] p-2.5 ${collapsed ? 'lg:justify-center lg:p-2' : ''}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-bold text-white">
              {initials(admin?.name)}
            </span>
            <span className={`min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
              <span className="block truncate text-xs font-semibold text-white">{admin?.name || 'Administrator'}</span>
              <span className="block truncate text-[11px] text-slate-500">{admin?.email}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={logout}
            title={collapsed ? 'Log out' : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300 ${
              collapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>Log out</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-indigo-600 lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </aside>
    </>
  );
}
