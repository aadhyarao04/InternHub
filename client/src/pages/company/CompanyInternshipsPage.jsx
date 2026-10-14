import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Users,
  Trash2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Eye,
  Building2
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

export const CompanyInternshipsPage = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const fetchInternships = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/company/internships');
      if (res.success && res.data) {
        setInternships(res.data.internships || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load company internships.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const handleStatusChange = async (internshipId, newStatus) => {
    try {
      const res = await api.patch(`/company/internships/${internshipId}/status`, {
        status: newStatus
      });
      if (res.success) {
        setInternships(prev =>
          prev.map(i => (i._id === internshipId ? { ...i, status: newStatus } : i))
        );
        setStatusMessage({ type: 'success', text: `Status changed to ${newStatus}.` });
      }
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (internshipId) => {
    if (!window.confirm('Delete this internship posting? Applications associated with it will also be purged.')) return;
    try {
      const res = await api.delete(`/company/internships/${internshipId}`);
      if (res.success) {
        setInternships(prev => prev.filter(i => i._id !== internshipId));
        setStatusMessage({ type: 'success', text: 'Internship posting removed.' });
      }
    } catch (err) {
      alert(err.message || 'Could not delete internship.');
    }
  };

  const filteredInternships = internships.filter(i => {
    if (activeTab === 'ALL') return true;
    return i.status === activeTab;
  });

  if (loading) return <LoadingSpinner fullPage text="Loading your internship postings..." />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title & Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Recruitment Hub</p>
          <h1 className="text-3xl font-black text-slate-900 mt-1">Manage Internship Postings</h1>
          <p className="text-sm text-slate-500">
            Publish listings, update statuses, monitor candidate volume, and maintain openings.
          </p>
        </div>
        <Link
          to="/company/internships/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" /> Create New Posting
        </Link>
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

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'ALL', label: `All (${internships.length})` },
          { key: 'PUBLISHED', label: `Published (${internships.filter(i => i.status === 'PUBLISHED').length})` },
          { key: 'DRAFT', label: `Drafts (${internships.filter(i => i.status === 'DRAFT').length})` },
          { key: 'CLOSED', label: `Closed (${internships.filter(i => i.status === 'CLOSED').length})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === tab.key
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

      {/* Internships List */}
      {filteredInternships.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No internship postings found"
          description="Create a new internship position to start attracting campus applicants."
          action={
            <Link
              to="/company/internships/new"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
            >
              Post New Internship
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredInternships.map((internship) => (
            <div
              key={internship._id}
              className="glass-card rounded-3xl p-6 bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={internship.status}>{internship.status}</Badge>
                    <Badge variant={internship.workMode}>{internship.workMode}</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">
                    {internship.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                    <span>{internship.location}</span>
                    <span>•</span>
                    <span>Deadline {formatDate(internship.applicationDeadline)}</span>
                    <span>•</span>
                    <span>Stipend: {internship.stipend?.amount ? `₹${internship.stipend.amount.toLocaleString()} / mo` : 'Unpaid'}</span>
                  </div>
                </div>

                {/* Status selector & Actions */}
                <div className="flex items-center gap-2 sm:self-center">
                  <select
                    value={internship.status}
                    onChange={(e) => handleStatusChange(internship._id, e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 focus:bg-white focus:border-indigo-500 outline-none"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="CLOSED">Closed</option>
                  </select>

                  <Link
                    to="/company/applications"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 text-xs font-bold transition-colors"
                  >
                    <Users className="h-3.5 w-3.5" /> Applicants
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(internship._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete internship"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Skills and details */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {(internship.requiredSkills || []).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-slate-400">
                  Openings: <span className="font-bold text-slate-700">{internship.openings || 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyInternshipsPage;
