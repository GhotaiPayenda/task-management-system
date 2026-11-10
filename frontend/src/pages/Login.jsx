import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LayoutDashboard,
  ListTodo,
  Lock,
  Mail,
  ShieldCheck,
  Tags,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../services/api';
import { Spinner } from '../components/Loader';

const FEATURES = [
  { icon: ListTodo, title: 'One source of truth', text: 'Tasks, deadlines, and priorities in a single focused workspace.' },
  { icon: LayoutDashboard, title: 'Live insights', text: 'Real-time dashboard metrics powered by your MySQL data.' },
  { icon: Tags, title: 'Organized by default', text: 'Group work into categories and filter in seconds.' },
];

const EMPTY_VALUES = { name: '', email: '', password: '', confirmPassword: '' };

export default function Login() {
  const { login, register, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [values, setValues] = useState(EMPTY_VALUES);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner className="h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/" replace />;

  const from = location.state?.from?.pathname || '/';
  const isRegistering = mode === 'register';

  const setField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setApiError('');
  };

  const switchMode = (nextMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setValues((current) => ({ ...EMPTY_VALUES, email: current.email }));
    setErrors({});
    setApiError('');
    setShowPassword(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (isRegistering && !values.name.trim()) nextErrors.name = 'Name is required.';
    else if (isRegistering && values.name.trim().length < 2) nextErrors.name = 'Name must be at least 2 characters.';

    if (!values.email.trim()) nextErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) nextErrors.email = 'Enter a valid email address.';

    if (!values.password) nextErrors.password = 'Password is required.';
    else if (values.password.length < (isRegistering ? 8 : 6)) {
      nextErrors.password = `Password must be at least ${isRegistering ? 8 : 6} characters.`;
    }

    if (isRegistering) {
      if (!values.confirmPassword) nextErrors.confirmPassword = 'Confirm your password.';
      else if (values.confirmPassword !== values.password) nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setApiError('');
    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      };

      if (isRegistering) {
        payload.confirmPassword = values.confirmPassword;
        await register(payload);
        navigate('/', { replace: true });
      } else {
        await login({ email: payload.email, password: payload.password });
        navigate(from, { replace: true });
      }
    } catch (error) {
      setApiError(getErrorMessage(error, isRegistering ? 'Unable to create your account. Please try again.' : 'Unable to sign in. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#0b1220] p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.28),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.18),transparent_55%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
          }}
        />

        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-900/40">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <p className="font-display text-lg font-bold tracking-tight">TaskFlow</p>
            <p className="text-[11px] font-medium text-slate-500">Your workspace</p>
          </div>
        </div>

        <div className="relative my-auto max-w-lg py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-indigo-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure, private access
          </span>
          <h2 className="mt-6 font-display text-4xl font-bold leading-[1.15] tracking-tight xl:text-5xl">
            Clarity for every task.
            <span className="mt-2 block bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
              Momentum for every day.
            </span>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
            A focused command center to plan work, track progress, and never miss a deadline.
          </p>

          <div className="mt-10 space-y-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-indigo-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{feature.title}</p>
                    <p className="text-xs leading-5 text-slate-500">{feature.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-[11px] text-slate-500">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          JWT authentication · bcrypt password hashing · MySQL persistence
        </div>
      </aside>

      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="font-display text-lg font-bold tracking-tight text-slate-900">TaskFlow</p>
              <p className="text-[11px] text-slate-500">Your workspace</p>
            </div>
          </div>

          <div className="card p-6 sm:p-8">
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  !isRegistering ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  isRegistering ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Create account
              </button>
            </div>

            <div className="mb-7">
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                {isRegistering ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                {isRegistering
                  ? 'Register with your email to start managing your tasks.'
                  : 'Sign in to your workspace to continue.'}
              </p>
            </div>

            {apiError && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700" role="alert">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {isRegistering && (
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-slate-700">Full name</label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      value={values.name}
                      onChange={(event) => setField('name', event.target.value)}
                      placeholder="Your name"
                      className={`input-base pl-10 ${errors.name ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10' : ''}`}
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs font-medium text-rose-600">{errors.name}</p>}
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700">Email address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={(event) => setField('email', event.target.value)}
                    placeholder="you@example.com"
                    className={`input-base pl-10 ${errors.email ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10' : ''}`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs font-medium text-rose-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isRegistering ? 'new-password' : 'current-password'}
                    value={values.password}
                    onChange={(event) => setField('password', event.target.value)}
                    placeholder={isRegistering ? 'At least 8 characters' : 'Enter your password'}
                    className={`input-base pl-10 pr-11 ${errors.password ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs font-medium text-rose-600">{errors.password}</p>}
              </div>

              {isRegistering && (
                <div>
                  <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-semibold text-slate-700">Confirm password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={values.confirmPassword}
                      onChange={(event) => setField('confirmPassword', event.target.value)}
                      placeholder="Re-enter your password"
                      className={`input-base pl-10 ${errors.confirmPassword ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10' : ''}`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs font-medium text-rose-600">{errors.confirmPassword}</p>}
                </div>
              )}

              <button type="submit" className="btn-primary w-full py-3" disabled={submitting}>
                {submitting ? <Spinner className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                {submitting
                  ? (isRegistering ? 'Creating account…' : 'Signing in…')
                  : (isRegistering ? 'Create account' : 'Sign in to dashboard')}
              </button>
            </form>

            <div className="mt-6 flex items-start gap-2 rounded-xl bg-slate-50 px-3.5 py-3 text-[11px] leading-5 text-slate-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
              <span>
                {isRegistering
                  ? 'Your password is hashed with bcrypt before it is stored. You can sign in immediately after registering.'
                  : 'Use the email and password you registered with. Your session is protected with JWT.'}
              </span>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-slate-400">
            TaskFlow · Secure task management system
          </p>
        </div>
      </main>
    </div>
  );
}
