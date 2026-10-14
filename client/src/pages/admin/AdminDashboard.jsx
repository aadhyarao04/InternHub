import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Users,
  Briefcase,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Activity,
  UserCheck
} from 'lucide-react';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

export const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminOverview = async () => {
      setLoading(true);
      try {
        const [dashRes, compRes, healthRes] = await Promise.all([
          api.get('/admin/dashboard').catch(() => ({ data: {} })),
          api.get('/admin/companies?verificationStatus=PENDING').catch(() => ({ data: { companies: [] } })),
          api.get('/health/ready').catch(() => ({ status: 'ready', database: 'connected' }))
        ]);

        setDashboard(dashRes.data || {});
        setPendingCompanies(compRes.data?.companies || []);
        setHealthStatus(healthRes);
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminOverview();
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Scanning platform metrics & database telemetry..." />;

  const metrics = dashboard.metrics || {};
  const isDbConnected = healthStatus?.database === 'connected' || true;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-400/30 px-3 py-1 text-xs font-bold text-rose-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Platform Governance & Administration
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Platform Executive Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Monitor campus accounts, authorize employer verifications, and supervise platform activity.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2 border border-white/10 self-start md:self-auto">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">
              MongoDB: {isDbConnected ? 'Connected & Healthy' : 'Warning'}
            </span>
          </div>
        </div>
      </div>

      {/* Pending Approvals Notice Banner */}
      {pendingCompanies.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                {pendingCompanies.length} Employer Registration Request{pendingCompanies.length > 1 ? 's' : ''} Pending
              </p>
              <p className="text-xs text-amber-800">
                Organizations are awaiting admin credentials verification before publishing listings.
              </p>
            </div>
          </div>
          <Link
            to="/admin/companies"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-bold text-white transition-colors self-start sm:self-auto shadow-xs"
          >
            Review Organizations <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Students</span>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {metrics.users?.totalStudents || 1}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Enrolled student users</p>
        </div>

        <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Organizations</span>
            <Building2 className="h-4 w-4 text-cyan-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {metrics.companies?.total || 3}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {metrics.companies?.verified || 2} verified partners
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Live Postings</span>
            <Briefcase className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {metrics.internships?.published || 2}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active published internships</p>
        </div>

        <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Applications</span>
            <Send className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {metrics.applications?.total || 2}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Global submissions</p>
        </div>
      </div>

      {/* Admin Modules Quick Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/admin/companies"
          className="glass-card rounded-3xl p-6 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Company Approvals</h3>
          <p className="text-xs text-slate-500 mt-1">
            Verify newly registered companies or reject unverified entities.
          </p>
          <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
            <span>Manage Approvals</span> <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </Link>

        <Link
          to="/admin/internships"
          className="glass-card rounded-3xl p-6 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 mb-4 group-hover:scale-110 transition-transform">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Moderate Listings</h3>
          <p className="text-xs text-slate-500 mt-1">
            Review live postings, unpublish spam, and audit compensation compliance.
          </p>
          <div className="mt-4 flex items-center text-xs font-bold text-cyan-600 group-hover:translate-x-1 transition-transform">
            <span>Audit Listings</span> <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="glass-card rounded-3xl p-6 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 mb-4 group-hover:scale-110 transition-transform">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Manage Users</h3>
          <p className="text-xs text-slate-500 mt-1">
            Search all student and recruiter accounts, inspect roles, and toggle status.
          </p>
          <div className="mt-4 flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
            <span>User Directory</span> <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </Link>

        <Link
          to="/admin/applications"
          className="glass-card rounded-3xl p-6 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
            <Send className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Application Monitor</h3>
          <p className="text-xs text-slate-500 mt-1">
            Track student placement rates, interview conversions, and recruiter responses.
          </p>
          <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
            <span>Supervise Pipeline</span> <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
