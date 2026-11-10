import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Plus, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { initials } from '../utils/format';

const PAGE_META = {
  '/': { title: 'Dashboard', subtitle: 'A clear view of everything on your plate.' },
  '/tasks': { title: 'Tasks', subtitle: 'Create, prioritize, and track your work.' },
  '/categories': { title: 'Categories', subtitle: 'Keep your work organized and easy to find.' },
};

export default function Navbar({ onMenuClick }) {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const meta = PAGE_META[location.pathname] || PAGE_META['/'];

  useEffect(() => {
    const handleClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/tasks?search=${encodeURIComponent(query)}` : '/tasks');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={onMenuClick} className="icon-btn -ml-1 lg:hidden" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-bold tracking-tight text-slate-900">{meta.title}</h1>
          <p className="hidden truncate text-xs text-slate-500 sm:block">{meta.subtitle}</p>
        </div>

        <form onSubmit={handleSearch} className="hidden w-full max-w-xs items-center md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks…"
              aria-label="Search tasks"
              className="input-base h-9 rounded-lg py-1.5 pl-9 pr-3 text-xs"
            />
          </div>
        </form>

        <button
          type="button"
          onClick={() => navigate('/tasks?new=1')}
          className="btn-primary h-9 px-3 text-xs sm:px-4"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New task</span>
        </button>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            className="flex items-center gap-2 rounded-xl border border-transparent p-1.5 transition hover:bg-slate-100"
            aria-haspopup="menu"
            aria-expanded={profileOpen}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[11px] font-bold text-white">
              {initials(admin?.name)}
            </span>
            <span className="hidden text-left xl:block">
              <span className="block max-w-[140px] truncate text-xs font-semibold text-slate-800">{admin?.name}</span>
              <span className="block text-[10px] text-slate-500">Administrator</span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 xl:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 animate-modal-in overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10" role="menu">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="truncate text-sm font-semibold text-slate-800">{admin?.name}</p>
                <p className="truncate text-xs text-slate-500">{admin?.email}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Secure session
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
                role="menuitem"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
