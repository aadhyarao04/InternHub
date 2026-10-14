import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
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

export const AdminInternshipsPage = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const fetchInternships = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/internships');
      if (res.success && res.data) {
        setInternships(res.data.internships || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load internships.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const handleUpdateStatus = async (internshipId, newStatus) => {
    try {
      const res = await api.patch(`/admin/internships/${internshipId}/status`, {
        status: newStatus
      });
      if (res.success) {
        setInternships(prev =>
          prev.map(i => (i._id === internshipId ? { ...i, status: newStatus } : i))
        );
        setStatusMessage({
          type: 'success',
          text: `Internship status updated to ${newStatus}.`
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to update internship status.');
    }
  };

  const filtered = internships.filter(i => {
    if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = i.title?.toLowerCase().includes(q);
      const matchComp = i.companyId?.name?.toLowerCase().includes(q);
      const matchLoc = i.location?.toLowerCase().includes(q);
      return matchTitle || matchComp || matchLoc;
    }
    return true;
  });

  if (loading) return <LoadingSpinner fullPage text="Retrieving platform internship listings..." />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Governance</p>
        <h1 className="text-3xl font-black text-slate-900 mt-1">Moderate Internship Listings</h1>
        <p className="text-sm text-slate-500">
          Supervise listings published across all organizations, audit policy compliance, or toggle visibility.
        </p>
      </div>

      {statusMessage.text && (
        <div
          className={`rounded-2xl p-4 text-sm font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'ALL', label: `All (${internships.length})` },
            { key: 'PUBLISHED', label: `Published (${internships.filter(i => i.status === 'PUBLISHED').length})` },
            { key: 'DRAFT', label: `Draft (${internships.filter(i => i.status === 'DRAFT').length})` },
            { key: 'CLOSED', label: `Closed (${internships.filter(i => i.status === 'CLOSED').length})` }
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
            placeholder="Search role or employer..."
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
          icon={Briefcase}
          title="No internships match this filter"
          description="Adjust your search query or filter options."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="glass-card rounded-3xl p-6 bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <Badge variant={item.status}>{item.status}</Badge>
                  <Badge variant={item.workMode}>{item.workMode}</Badge>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mt-1">{item.title}</h3>

                <p className="text-xs font-bold text-indigo-600">
                  {item.companyId?.name || 'Partner Organization'}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>{item.location}</span>
                  <span>•</span>
                  <span>Deadline: {formatDate(item.applicationDeadline)}</span>
                  <span>•</span>
                  <span>Stipend: {item.stipend?.amount ? `₹${item.stipend.amount.toLocaleString()} / mo` : 'Unpaid'}</span>
                </div>
              </div>

              {/* Status control */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <select
                  value={item.status}
                  onChange={(e) => handleUpdateStatus(item._id, e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 focus:bg-white focus:border-indigo-500 outline-none"
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminInternshipsPage;
