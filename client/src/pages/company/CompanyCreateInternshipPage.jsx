import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  ArrowLeft,
  Save,
  Sparkles,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const CompanyCreateInternshipPage = () => {
  const navigate = useNavigate();
  const { company } = useAuth();

  const [form, setForm] = useState({
    title: '',
    description: '',
    responsibilities: '',
    requiredSkills: '',
    preferredSkills: '',
    location: company?.location || 'Bangalore, India',
    workMode: 'REMOTE',
    durationValue: 3,
    durationUnit: 'MONTHS',
    stipendAmount: 25000,
    stipendPeriod: 'MONTHLY',
    applicationDeadline: '',
    openings: 2,
    status: company?.verificationStatus === 'VERIFIED' ? 'PUBLISHED' : 'DRAFT'
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const parsedReqSkills = form.requiredSkills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const parsedPrefSkills = form.preferredSkills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const parsedResp = form.responsibilities
        .split('\n')
        .map(r => r.trim())
        .filter(Boolean);

      if (parsedReqSkills.length === 0) {
        throw new Error('Please enter at least one required skill.');
      }

      if (!form.applicationDeadline) {
        throw new Error('Application deadline is required.');
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        responsibilities: parsedResp,
        requiredSkills: parsedReqSkills,
        preferredSkills: parsedPrefSkills,
        location: form.location.trim(),
        workMode: form.workMode,
        duration: {
          durationValue: Number(form.durationValue),
          durationUnit: form.durationUnit
        },
        stipend: {
          amount: Number(form.stipendAmount) || 0,
          currency: 'INR',
          period: form.stipendPeriod
        },
        applicationDeadline: new Date(form.applicationDeadline).toISOString(),
        openings: Number(form.openings) || 1,
        status: form.status
      };

      const res = await api.post('/company/internships', payload);
      if (res.success) {
        navigate('/company/internships');
      }
    } catch (err) {
      setError(err.message || 'Failed to create internship listing.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top back navigation */}
      <div>
        <Link
          to="/company/internships"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Recruitment Hub</p>
        <h1 className="text-3xl font-black text-slate-900 mt-1">Post New Internship Position</h1>
        <p className="text-sm text-slate-500">
          Provide complete details, skills, and stipend to attract qualified student candidates.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 md:p-8 bg-white border border-slate-200 shadow-sm space-y-6">
        {/* Core Details */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">1. Position Overview</h2>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Internship Title *
            </label>
            <input
              required
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Frontend Engineering Intern (React & TypeScript)"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Role Description *
            </label>
            <textarea
              required
              rows={4}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the mission, technical stack, team context, and learning outcomes..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Key Responsibilities (One item per line)
            </label>
            <textarea
              rows={3}
              name="responsibilities"
              value={form.responsibilities}
              onChange={handleChange}
              placeholder="Design and construct reusable UI components in React&#10;Write unit tests for REST endpoints&#10;Collaborate in agile sprint reviews"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>
        </div>

        {/* Skill Requirements */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900">2. Technical Competencies</h2>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Required Skills * (comma-separated)
            </label>
            <input
              required
              type="text"
              name="requiredSkills"
              value={form.requiredSkills}
              onChange={handleChange}
              placeholder="React, JavaScript, Node.js, REST APIs"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Preferred / Good-to-Have Skills (comma-separated)
            </label>
            <input
              type="text"
              name="preferredSkills"
              value={form.preferredSkills}
              onChange={handleChange}
              placeholder="TypeScript, Docker, Tailwind CSS, Redux"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>
        </div>

        {/* Work Terms & Stipend */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900">3. Work Mode & Compensation</h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Work Mode
              </label>
              <select
                name="workMode"
                value={form.workMode}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 outline-none"
              >
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Location
              </label>
              <input
                required
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Openings Count
              </label>
              <input
                type="number"
                min={1}
                name="openings"
                value={form.openings}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Duration Value
              </label>
              <input
                type="number"
                min={1}
                name="durationValue"
                value={form.durationValue}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Duration Unit
              </label>
              <select
                name="durationUnit"
                value={form.durationUnit}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 outline-none"
              >
                <option value="MONTHS">Months</option>
                <option value="WEEKS">Weeks</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Monthly Stipend (₹)
              </label>
              <input
                type="number"
                min={0}
                name="stipendAmount"
                value={form.stipendAmount}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Application Deadline *
              </label>
              <input
                required
                type="date"
                name="applicationDeadline"
                value={form.applicationDeadline}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Publication Status */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Publication Mode:
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-indigo-500 outline-none"
            >
              <option value="PUBLISHED">Published (Live for applications)</option>
              <option value="DRAFT">Draft (Save for review)</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/company/internships"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-all disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Creating Posting...' : 'Publish Internship'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanyCreateInternshipPage;
