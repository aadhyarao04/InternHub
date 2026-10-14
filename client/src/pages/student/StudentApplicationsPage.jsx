import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  Building2,
  Calendar,
  Clock,
  Video,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  XCircle,
  Briefcase
} from 'lucide-react';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const formatDate = (val) => {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatDateTime = (val) => {
  if (!val) return '—';
  return new Date(val).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const StudentApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/students/me/applications');
      if (res.success && res.data) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      const res = await api.patch(`/students/me/applications/${applicationId}/withdraw`);
      if (res.success) {
        setApplications(prev =>
          prev.map(app => (app._id === applicationId ? { ...app, status: 'WITHDRAWN' } : app))
        );
      }
    } catch (err) {
      alert(err.message || 'Could not withdraw application.');
    }
  };

  const filteredApplications = applications.filter(app => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ACTIVE') return ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED'].includes(app.status);
    if (activeFilter === 'INTERVIEW') return app.status === 'INTERVIEW';
    if (activeFilter === 'DECIDED') return ['SELECTED', 'REJECTED', 'WITHDRAWN'].includes(app.status);
    return true;
  });

  if (loading) return <LoadingSpinner fullPage text="Loading your application tracker..." />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Application Pipeline</p>
          <h1 className="text-3xl font-black text-slate-900 mt-1">My Internship Applications</h1>
          <p className="text-sm text-slate-500">
            Track stage updates, review interview links, or manage active applications.
          </p>
        </div>
        <Link
          to="/internships"
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs self-start sm:self-auto"
        >
          Discover New Roles
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'ALL', label: `All (${applications.length})` },
          { key: 'ACTIVE', label: `In Review (${applications.filter(a => ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED'].includes(a.status)).length})` },
          { key: 'INTERVIEW', label: `Interviews (${applications.filter(a => a.status === 'INTERVIEW').length})` },
          { key: 'DECIDED', label: `Decided / Closed (${applications.filter(a => ['SELECTED', 'REJECTED', 'WITHDRAWN'].includes(a.status)).length})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeFilter === tab.key
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications match this filter"
          description="Browse open internships and apply using your uploaded resume."
          action={
            <Link
              to="/internships"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
            >
              Browse Open Positions
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const internship = app.internshipId || {};
            const company = internship.companyId || {};
            const isExpanded = expandedId === app._id;
            const canWithdraw = ['APPLIED', 'UNDER_REVIEW'].includes(app.status);

            return (
              <div
                key={app._id}
                className="glass-card rounded-3xl p-6 bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={app.status}>{app.status}</Badge>
                      {internship.workMode && <Badge variant={internship.workMode}>{internship.workMode}</Badge>}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mt-2">
                      <Link
                        to={`/internships/${internship._id || ''}`}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        {internship.title || 'Internship Position'}
                      </Link>
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span>{company.name || 'Verified Organization'}</span>
                      <span>•</span>
                      <span>{internship.location || 'Location upon review'}</span>
                      <span>•</span>
                      <span>Applied {formatDate(app.appliedAt || app.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : app._id)}
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors"
                    >
                      <span>{isExpanded ? 'Less Details' : 'View Details'}</span>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    {canWithdraw && (
                      <button
                        type="button"
                        onClick={() => handleWithdraw(app._id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 text-xs font-bold transition-colors"
                        title="Withdraw application"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Withdraw</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Interview Notification Banner if Scheduled */}
                {app.interviewDetails && app.interviewDetails.scheduledAt && (
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
                      <Video className="h-4 w-4 text-indigo-600" /> Scheduled Interview Call
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-700">
                      <div>
                        <span className="font-semibold">Date & Time:</span>{' '}
                        {formatDateTime(app.interviewDetails.scheduledAt)}
                      </div>
                      <div>
                        <span className="font-semibold">Duration:</span>{' '}
                        {app.interviewDetails.durationMinutes || 45} Minutes
                      </div>
                      <div className="sm:col-span-2">
                        <span className="font-semibold">Meeting Link / Location:</span>{' '}
                        {app.interviewDetails.locationOrLink ? (
                          <a
                            href={app.interviewDetails.locationOrLink.startsWith('http') ? app.interviewDetails.locationOrLink : `https://${app.interviewDetails.locationOrLink}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 font-bold underline inline-flex items-center gap-1 ml-1"
                          >
                            Join Meeting <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          'Will be sent via email'
                        )}
                      </div>
                      {app.interviewDetails.notes && (
                        <div className="sm:col-span-2 text-slate-600 mt-1">
                          <span className="font-semibold">Notes from recruiter:</span> {app.interviewDetails.notes}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-600">
                    {app.coverLetter && (
                      <div>
                        <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                          Submitted Cover Note
                        </span>
                        <p className="mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 whitespace-pre-line leading-relaxed">
                          {app.coverLetter}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-400">
                      <span>Application Reference ID: {app._id}</span>
                      <Link
                        to={`/internships/${internship._id || ''}`}
                        className="text-indigo-600 font-bold hover:underline"
                      >
                        Inspect Full Internship Requirements →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentApplicationsPage;
