import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import {
  Sparkles,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Briefcase,
  Cpu,
  UserCheck,
  Building2,
  ShieldCheck,
  Search
} from 'lucide-react';

export const Navbar = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (role === 'ADMIN') return '/admin';
    if (role === 'COMPANY') return '/company';
    return '/student';
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav">
      <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center space-x-2.5 flex-shrink-0"
        >
          <div className="flex items-center justify-center w-10 h-10 text-white shadow-md rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              InternHub <span className="text-indigo-600">AI</span>
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="items-center hidden space-x-6 md:flex">
          <Link
            to="/internships"
            className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Explore Internships
          </Link>

          {isAuthenticated && role === 'STUDENT' && (
            <>
              <Link
                to="/student/copilot"
                className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                Career Copilot
              </Link>
              <Link
                to="/student/skill-gap"
                className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                Skill Gap Radar
              </Link>
              <Link
                to="/student/simulator"
                className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                Mock Interview
              </Link>
            </>
          )}

          {isAuthenticated && role === 'COMPANY' && (
            <>
              <Link
                to="/company/internships"
                className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                Postings
              </Link>
              <Link
                to="/company/applications"
                className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                Candidates
              </Link>
            </>
          )}

          {isAuthenticated && role === 'ADMIN' && (
            <>
              <Link
                to="/admin/companies"
                className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                Approvals
              </Link>
              <Link
                to="/admin/internships"
                className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                Moderation
              </Link>
              <Link
                to="/admin/users"
                className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                Users
              </Link>
            </>
          )}
        </nav>

        {/* Right Action Area */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Link
                to={
                  role === 'STUDENT'
                    ? '/student/notifications'
                    : role === 'COMPANY'
                    ? '/company/notifications'
                    : '/admin/notifications'
                }
                className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Dashboard Link */}
              <Link
                to={getDashboardPath()}
                className="inline-flex items-center px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all"
              >
                Dashboard
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Link>

              {/* User Avatar / Name / Logout */}
              <div className="flex items-center pl-2 space-x-2 border-l border-slate-200">
                <div className="flex flex-col text-right hidden sm:block">
                  <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                    {user?.name}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 uppercase">{role}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            title="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 py-4 space-y-2 shadow-lg">
          <Link
            to="/internships"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <Search className="w-4 h-4 text-indigo-600" /> Explore Internships
          </Link>

          {isAuthenticated && role === 'STUDENT' && (
            <>
              <Link
                to="/student"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Student Dashboard
              </Link>
              <Link
                to="/student/copilot"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                <Sparkles className="w-4 h-4" /> Career Copilot
              </Link>
              <Link
                to="/student/skill-gap"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Cpu className="w-4 h-4 text-cyan-600" /> Skill Gap Radar
              </Link>
              <Link
                to="/student/simulator"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <UserCheck className="w-4 h-4 text-purple-600" /> Mock Interviewer
              </Link>
              <Link
                to="/student/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                My Applications
              </Link>
            </>
          )}

          {isAuthenticated && role === 'COMPANY' && (
            <>
              <Link
                to="/company"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Company Dashboard
              </Link>
              <Link
                to="/company/internships"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Manage Postings
              </Link>
              <Link
                to="/company/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Review Candidates
              </Link>
            </>
          )}

          {isAuthenticated && role === 'ADMIN' && (
            <>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Platform Dashboard
              </Link>
              <Link
                to="/admin/companies"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Company Approvals
              </Link>
              <Link
                to="/admin/internships"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Moderate Listings
              </Link>
            </>
          )}

          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 p-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
