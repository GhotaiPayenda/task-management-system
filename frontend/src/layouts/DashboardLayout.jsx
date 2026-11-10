import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('tms_sidebar_collapsed') === '1');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('tms_sidebar_collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className={`flex min-h-screen flex-col transition-[padding] duration-300 ${collapsed ? 'lg:pl-[84px]' : 'lg:pl-[264px]'}`}>
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <footer className="border-t border-slate-200/70 px-6 py-4 text-center text-xs text-slate-400">
          TaskFlow · Secure task management
        </footer>
      </div>
    </div>
  );
}
