import React, { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Filter,
  Search
} from 'lucide-react';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export const AdminCompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const fetchCompanies = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/companies');
      if (res.success && res.data) {
        setCompanies(res.data.companies || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load companies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleUpdateVerification = async (companyId, newStatus) => {
    try {
      const res = await api.patch(`/admin/companies/${companyId}/verification`, {
        status: newStatus
      });

      if (res.success) {
        setCompanies(prev =>
          prev.map(c => (c._id === companyId ? { ...c, verificationStatus: newStatus } : c))
        );
        setStatusMessage({
          type: 'success',
          text: `Organization status successfully updated to ${newStatus}.`
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to update verification status.');
    }
  };

  const filteredCompanies = companies.filter(c => {
    if (statusFilter !== 'ALL' && c.verificationStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchInd = c.industry?.toLowerCase().includes(q);
      const matchLoc = c.location?.toLowerCase().includes(q);
      return matchName || matchInd || matchLoc;
    }
    return true;
  });

  if (loading) return <LoadingSpinner fullPage text="Loading registered companies..." />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Governance</p>
        <h1 className="text-3xl font-black text-slate-900 mt-1">Company Verification & Approvals</h1>
        <p className="text-sm text-slate-500">
          Authorize employer organizations to post internships and connect with campus candidates.
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
            { key: 'ALL', label: `All (${companies.length})` },
            { key: 'PENDING', label: `Pending (${companies.filter(c => c.verificationStatus === 'PENDING').length})` },
            { key: 'VERIFIED', label: `Verified (${companies.filter(c => c.verificationStatus === 'VERIFIED').length})` },
            { key: 'REJECTED', label: `Rejected (${companies.filter(c => c.verificationStatus === 'REJECTED').length})` }
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
            placeholder="Search company or location..."
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

      {/* Companies List */}
      {filteredCompanies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies match this filter"
          description="Try changing the verification status tab or search query."
        />
      ) : (
        <div className="space-y-4">
          {filteredCompanies.map((company) => (
            <div
              key={company._id}
              className="glass-card rounded-3xl p-6 bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{company.name}</h3>
                  <Badge variant={company.verificationStatus}>{company.verificationStatus}</Badge>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>{company.industry || 'Industry not specified'}</span>
                  <span>•</span>
                  <span>{company.location || 'Location not specified'}</span>
                  <span>•</span>
                  <span>Size: {company.companySize || 'Medium'}</span>
                </div>

                {company.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {company.description}
                  </p>
                )}

                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline pt-1"
                  >
                    {company.website} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                {company.verificationStatus !== 'VERIFIED' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateVerification(company._id, 'VERIFIED')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-xs"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Approve / Verify</span>
                  </button>
                )}

                {company.verificationStatus !== 'REJECTED' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateVerification(company._id, 'REJECTED')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-2 text-xs font-bold transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                )}

                {company.verificationStatus !== 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateVerification(company._id, 'PENDING')}
                    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-3 py-2 text-xs font-semibold transition-colors"
                  >
                    Reset Pending
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCompaniesPage;
