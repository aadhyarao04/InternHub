import React, { useEffect, useState } from 'react';
import {
  Send,
  Building2,
  Calendar,
  Users,
  Search,
  Filter
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

export const AdminApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/applications');
        if (res.success && res.data) {
          setApplications(res.data.applications || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load applications.');
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, []);

  const filtered = applications.filter(a => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchCandidate = a.studentId?.name?.toLowerCase().includes(q);
      const matchRole = a.internshipId?.title?.toLowerCase().includes(q);
      const matchCompany = a.internshipId?.companyId?.name?.toLowerCase().includes(q);
      return matchCandidate || matchRole || matchCompany;
    }
    return true;
  });

  if (loading) return <LoadingSpinner fullPage text="Scanning global application telemetry..." />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Governance</p>
        <h1 className="text-3xl font-black text-slate-900 mt-1">Application Pipeline Monitor</h1>
        <p className="text-sm text-slate-500">
          Supervise campus application velocity, employer review response rates, and placement conversions.
        </p>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'ALL', label: `All (${applications.length})` },
            { key: 'APPLIED', label: `Applied (${applications.filter(a => a.status === 'APPLIED').length})` },
            { key: 'SHORTLISTED', label: `Shortlisted (${applications.filter(a => a.status === 'SHORTLISTED').length})` },
            { key: 'INTERVIEW', label: `Interviews (${applications.filter(a => a.status === 'INTERVIEW').length})` },
            { key: 'SELECTED', label: `Selected (${applications.filter(a => a.status === 'SELECTED').length})` }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                statusFilter === tab.key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-indigo-500 outline-none w-full sm:w-64"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 font-medium">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No applications match this filter"
          description="Adjust your search query or filter options."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div
              key={app._id}
              className="glass-card rounded-2xl p-5 bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900">
                    {app.studentId?.name || 'Candidate'}
                  </h4>
                  <Badge variant={app.status}>{app.status}</Badge>
                </div>

                <p className="text-xs font-semibold text-indigo-600">
                  {app.internshipId?.title || 'Internship Position'}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>Candidate: {app.studentId?.email || 'Confidential'}</span>
                  <span>•</span>
                  <span>Applied on {formatDate(app.appliedAt || app.createdAt)}</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                Ref: {app._id.slice(-8)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApplicationsPage;
