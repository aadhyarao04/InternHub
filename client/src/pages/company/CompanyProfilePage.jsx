import React, { useEffect, useState } from 'react';
import {
  Building2,
  Save,
  Globe,
  MapPin,
  Users,
  ShieldCheck,
  ShieldAlert,
  ExternalLink
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Badge from '../../components/common/Badge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

export const CompanyProfilePage = () => {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    name: '',
    description: '',
    website: '',
    industry: '',
    location: '',
    companySize: 'MEDIUM',
    logoUrl: '',
    verificationStatus: 'PENDING'
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/company/profile');
      if (res.success && res.data?.company) {
        const c = res.data.company;
        setForm({
          name: c.name || '',
          description: c.description || '',
          website: c.website || '',
          industry: c.industry || '',
          location: c.location || '',
          companySize: c.companySize || 'MEDIUM',
          logoUrl: c.logoUrl || '',
          verificationStatus: c.verificationStatus || 'PENDING'
        });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to load company profile.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const res = await api.patch('/company/profile', {
        name: form.name.trim(),
        description: form.description.trim(),
        website: form.website.trim(),
        industry: form.industry.trim(),
        location: form.location.trim(),
        companySize: form.companySize,
        logoUrl: form.logoUrl.trim()
      });

      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Company profile details updated successfully!' });
        await refreshUser();
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Retrieving company profile..." />;

  const isVerified = form.verificationStatus === 'VERIFIED';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Company Settings</p>
        <h1 className="text-3xl font-black text-slate-900 mt-1">Company Profile & Verification</h1>
        <p className="text-sm text-slate-500">
          Maintain your organization identity, location, and credentials displayed to campus applicants.
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

      {/* Verification Card */}
      <div className={`rounded-3xl border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isVerified ? 'border-emerald-200 bg-emerald-50/60' : 'border-amber-200 bg-amber-50/60'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {isVerified ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Account Status: {form.verificationStatus}
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isVerified
                ? 'Your organization is verified. You can publish live internship opportunities anytime.'
                : 'Account verification is pending review by the platform administrator.'}
            </p>
          </div>
        </div>
        <Badge variant={form.verificationStatus}>{form.verificationStatus}</Badge>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 md:p-8 bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Company Name *
            </label>
            <input
              required
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Official Website URL
            </label>
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Industry Domain
            </label>
            <input
              type="text"
              name="industry"
              value={form.industry}
              onChange={handleChange}
              placeholder="e.g. Software & Cloud Infrastructure"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Headquarters / Location
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Bangalore, India"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Company Size
            </label>
            <select
              name="companySize"
              value={form.companySize}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 outline-none"
            >
              <option value="STARTUP">Startup (1-50 employees)</option>
              <option value="MEDIUM">Medium Enterprise (51-500)</option>
              <option value="LARGE">Large Enterprise (500+)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Logo Image URL (Optional)
            </label>
            <input
              type="url"
              name="logoUrl"
              value={form.logoUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Organization Overview & Description
            </label>
            <textarea
              rows={4}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Summarize your organization's mission, engineering culture, and internship growth opportunities..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-all disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Updating...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfilePage;
