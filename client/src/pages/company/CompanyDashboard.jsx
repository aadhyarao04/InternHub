import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Video
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Badge from '../../components/common/Badge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const formatDate = (val) => {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const CompanyDashboard = () => {
  const { user, company: authCompany } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [recentInternships, setRecentInternships] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompanyData = async () => {
      setLoading(true);
      try {
        const [dashRes, internRes, appRes] = await Promise.all([
          api.get('/company/dashboard').catch(() => ({ data: {} })),
          api.get('/company/internships?limit=4').catch(() => ({ data: { internships: [] } })),
          api.get('/company/applications?limit=4').catch(() => ({ data: { applications: [] } }))
        ]);

        setDashboard(dashRes.data || {});
        setRecentInternships(internRes.data?.internships || []);
        setRecentApplications(appRes.data?.applications || []);
      } catch (err) {
        console.error('Failed to load company dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Loading recruiter dashboard..." />;

  const company = dashboard.company || authCompany || {};
  const metrics = dashboard.metrics || {};
  const isVerified = company.verificationStatus === 'VERIFIED';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                Recruitment Portal
              </span>
              <Badge variant={company.verificationStatus || 'PENDING'}>
                {company.verificationStatus || 'PENDING'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {company.name || 'Company Dashboard'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {company.location ? `${company.location} • ` : ''}Manage campus listings, screen talent, and schedule interviews.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/company/internships/new"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all"
            >
              <PlusCircle className="h-4 w-4" /> Post Internship
            </Link>
            <Link
              to="/company/applications"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all"
            >
              <Users className="h-4 w-4" /> Review Candidates
            </Link>
          </div>
        </div>
      </div>

      {/* Verification Warning Notice if Pending */}
      {!isVerified && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 flex items-start gap-3.5 text-amber-900">
          <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm text-amber-900">Organization Verification Status: PENDING</p>
            <p className="text-amber-800 leading-relaxed">
              Your company profile has been submitted and is currently queued for platform administration verification.
              You may draft internship positions now; once approved by an administrator, they will automatically be eligible for live publication.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Listings</span>
            <Briefcase className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {metrics.internships?.total || recentInternships.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {metrics.internships?.published || 0} currently published
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Applicants</span>
            <Users className="h-4 w-4 text-cyan-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {metrics.applications?.total || recentApplications.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Student applications received</p>
        </div>

        <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Interviews</span>
            <Video className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {metrics.applications?.interviews || 0}
          </div>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">
            Scheduled student rounds
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Verification</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1 truncate">
            {company.verificationStatus || 'PENDING'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Account credentials</p>
        </div>
      </div>

      {/* Grid: Recent Postings & Recent Applicants */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Internships */}
        <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Your Internship Postings</h2>
            <Link
              to="/company/internships"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Manage all →
            </Link>
          </div>

          {recentInternships.length > 0 ? (
            <div className="space-y-3">
              {recentInternships.map((internship) => (
                <div
                  key={internship._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{internship.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {internship.workMode} • Deadline {formatDate(internship.applicationDeadline)}
                    </p>
                  </div>
                  <Badge variant={internship.status}>{internship.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-2xl border-slate-200">
              No internship listings created yet.
              <div className="mt-3">
                <Link
                  to="/company/internships/new"
                  className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Create First Posting
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recent Applicants */}
        <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Candidates</h2>
            <Link
              to="/company/applications"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Review all →
            </Link>
          </div>

          {recentApplications.length > 0 ? (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div
                  key={app._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {app.studentId?.name || 'Candidate'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Applied for {app.internshipId?.title || 'Internship'}
                    </p>
                  </div>
                  <Badge variant={app.status}>{app.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-2xl border-slate-200">
              No applications received yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
