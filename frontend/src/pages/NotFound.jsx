import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Compass className="h-7 w-7" />
        </div>
        <p className="mt-5 font-display text-5xl font-bold tracking-tight text-slate-900">404</p>
        <h1 className="mt-2 font-display text-lg font-bold text-slate-900">Page not found</h1>
        <p className="mt-1.5 text-sm text-slate-500">The page you are looking for does not exist or has moved.</p>
        <Link to="/" className="btn-primary mt-6">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
      </div>
    </div>
  );
}
