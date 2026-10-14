import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Briefcase,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
  Building2,
  Clock
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

export const InternshipBrowser = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchInternships = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (workMode) params.append('workMode', workMode);
      if (location.trim()) params.append('location', location.trim());
      if (sort) params.append('sort', sort);

      const res = await api.get(`/internships?${params.toString()}`);
      if (res.success && res.data) {
        setInternships(res.data.internships || []);
      }
    } catch (err) {
      setError(err.message || 'Unable to load internships right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInternships();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, workMode, location, sort]);

  return (
    <div className="page-shell px-4 py-8 md:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 mb-1">
            <Sparkles className="h-3.5 w-3.5" /> Campus Recruitment & Internships
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
            Explore Opportunities
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse verified internships, inspect requirements, and discover roles matched to your skills.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-2 text-xs font-bold text-indigo-700 shadow-xs">
            {internships.length} Active Positions
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card mb-8 rounded-3xl p-4 sm:p-6 bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="grid gap-3 md:grid-cols-12">
          {/* Keyword Search */}
          <div className="relative md:col-span-5">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, technology, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>

          {/* Location Filter */}
          <div className="relative md:col-span-3">
            <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="City or Location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>

          {/* Work Mode Select */}
          <div className="relative md:col-span-2">
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            >
              <option value="">All Work Modes</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">On-site</option>
            </select>
          </div>

          {/* Sort By Select */}
          <div className="relative md:col-span-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="deadline">Expiring Soon</option>
              <option value="stipend">Highest Stipend</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-500">Quick Filters:</span>
          {['React', 'Node.js', 'Python', 'Machine Learning', 'Remote'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                if (tag === 'Remote') {
                  setWorkMode(workMode === 'REMOTE' ? '' : 'REMOTE');
                } else {
                  setSearch(search === tag ? '' : tag);
                }
              }}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                search === tag || (tag === 'Remote' && workMode === 'REMOTE')
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
          {(search || workMode || location) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setWorkMode('');
                setLocation('');
              }}
              className="ml-auto text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* Internships Grid */}
      {loading ? (
        <LoadingSpinner text="Searching active listings..." />
      ) : internships.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No internships found"
          description="Try adjusting your keywords, work mode, or location filters."
          action={
            <button
              onClick={() => { setSearch(''); setWorkMode(''); setLocation(''); }}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {internships.map((internship) => {
            const company = internship.companyId || {};
            const isClosingSoon =
              internship.applicationDeadline &&
              new Date(internship.applicationDeadline).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

            return (
              <div
                key={internship._id}
                className="glass-card rounded-3xl p-6 bg-white border border-slate-200/90 hover:border-indigo-300 transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant={internship.workMode}>{internship.workMode}</Badge>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(internship.applicationDeadline)}</span>
                    </div>
                  </div>

                  {/* Title & Company */}
                  <h3 className="text-xl font-bold text-slate-900 line-clamp-1 hover:text-indigo-600 transition-colors">
                    <Link to={`/internships/${internship._id}`}>{internship.title}</Link>
                  </h3>

                  <div className="flex items-center gap-1.5 mt-1 text-sm font-semibold text-slate-600">
                    <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{company.name || 'Verified Hiring Partner'}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{internship.location || 'Location upon review'}</span>
                  </div>

                  {/* Description snippet */}
                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {internship.description}
                  </p>

                  {/* Required Skills tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(internship.requiredSkills || []).slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                    {(internship.requiredSkills || []).length > 4 && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                        +{(internship.requiredSkills || []).length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stipend</span>
                    <p className="text-base font-black text-slate-900">
                      {internship.stipend?.amount
                        ? `₹${internship.stipend.amount.toLocaleString()} / mo`
                        : 'Unpaid / Certificate'}
                    </p>
                  </div>
                  <Link
                    to={`/internships/${internship._id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white px-4 py-2 text-xs font-bold transition-all shadow-xs"
                  >
                    View Role <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InternshipBrowser;
