import React, { useState } from 'react';
import { Navigate, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, UserCheck, Briefcase, Lock, Mail, Building, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const roleDashboard = (role) => {
  if (role === 'ADMIN') return '/admin';
  if (role === 'COMPANY') return '/company';
  return '/student';
};

export const AuthPage = ({ initialMode = 'login' }) => {
  const { login, register, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    companyName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to appropriate role dashboard
  if (isAuthenticated && role) {
    return <Navigate to={roleDashboard(role)} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const data = await login(form.email, form.password);
        const targetRole = data?.user?.role || 'STUDENT';
        navigate(roleDashboard(targetRole));
      } else {
        const data = await register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          companyName: form.role === 'COMPANY' ? form.companyName : undefined
        });
        const targetRole = data?.user?.role || form.role;
        navigate(roleDashboard(targetRole));
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoRole) => {
    setLoading(true);
    setError('');
    setForm(prev => ({ ...prev, email: demoEmail, password: 'Password123!' }));
    try {
      const data = await login(demoEmail, 'Password123!');
      const targetRole = data?.user?.role || demoRole;
      navigate(roleDashboard(targetRole));
    } catch (err) {
      setError(err.message || 'Quick login failed. Verify backend and database are running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-100/60 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Main Card */}
        <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">InternHub AI</span>
              <h1 className="text-2xl font-black text-slate-900 mt-1">
                {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
              </h1>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="my-6 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1.5 text-sm font-semibold">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`rounded-xl py-2.5 transition-all ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`rounded-xl py-2.5 transition-all ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    placeholder="e.g. Aaditya Sharma"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  I Want To Join As
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                >
                  <option value="STUDENT">Student / Candidate</option>
                  <option value="COMPANY">Company / Employer</option>
                </select>
              </div>
            )}

            {mode === 'register' && form.role === 'COMPANY' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Company / Organization Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="text"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    placeholder="e.g. NextGen Innovations Ltd."
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  required
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons for Seminar Presentation */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                1-Click Demo Logins (Seminar / Testing)
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                Pre-seeded
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('student@internhub.ai', 'STUDENT')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-center group"
                title="Login as Aaditya Sharma (Student)"
              >
                <UserCheck className="h-4 w-4 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800">Student</span>
                <span className="text-[10px] text-slate-500">Aaditya</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('recruiter@techcorp.io', 'COMPANY')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-center group"
                title="Login as Sarah Connor (TechCorp)"
              >
                <Briefcase className="h-4 w-4 text-cyan-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800">Company</span>
                <span className="text-[10px] text-slate-500">TechCorp</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@internhub.ai', 'ADMIN')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 transition-all text-center group"
                title="Login as System Admin"
              >
                <ShieldCheck className="h-4 w-4 text-rose-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800">Admin</span>
                <span className="text-[10px] text-slate-500">Governance</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <p className="text-center text-xs text-slate-500">
          Protected by role-based authorization and encrypted sessions.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
