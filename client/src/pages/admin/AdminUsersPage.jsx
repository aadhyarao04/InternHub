import React, { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  ShieldCheck,
  Mail,
  Calendar
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

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users');
      if (res.success && res.data) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId, currentActive) => {
    try {
      const nextActive = !currentActive;
      const res = await api.patch(`/admin/users/${userId}/status`, {
        isActive: nextActive
      });

      if (res.success) {
        setUsers(prev =>
          prev.map(u => (u._id === userId ? { ...u, isActive: nextActive } : u))
        );
        setStatusMessage({
          type: 'success',
          text: `User account ${nextActive ? 'activated' : 'suspended'}.`
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      return matchName || matchEmail;
    }
    return true;
  });

  if (loading) return <LoadingSpinner fullPage text="Retrieving registered user accounts..." />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Governance</p>
        <h1 className="text-3xl font-black text-slate-900 mt-1">Manage Platform Accounts</h1>
        <p className="text-sm text-slate-500">
          User directory of enrolled candidates, recruiters, and administrative operators.
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
            { key: 'ALL', label: `All (${users.length})` },
            { key: 'STUDENT', label: `Students (${users.filter(u => u.role === 'STUDENT').length})` },
            { key: 'COMPANY', label: `Companies (${users.filter(u => u.role === 'COMPANY').length})` },
            { key: 'ADMIN', label: `Admins (${users.filter(u => u.role === 'ADMIN').length})` }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                roleFilter === tab.key
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
            placeholder="Search name or email..."
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

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users match this filter"
          description="Adjust your search or role filter."
        />
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((u) => (
            <div
              key={u._id}
              className="glass-card rounded-2xl p-4 sm:p-5 bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900">{u.name}</h4>
                  <Badge variant={u.role}>{u.role}</Badge>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {u.isActive ? 'Active' : 'Suspended'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {u.email}
                  </span>
                  <span>•</span>
                  <span>Joined {formatDate(u.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(u._id, u.isActive)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    u.isActive
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {u.isActive ? 'Suspend User' : 'Activate User'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
