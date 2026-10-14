import React, { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  Calendar,
  Clock,
  Video,
  FileText,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Send,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
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

export const CompanyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Interview Scheduling Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetAppId, setTargetAppId] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    scheduledAt: '',
    durationMinutes: 45,
    locationOrLink: 'https://meet.google.com/abc-defg-hij',
    notes: 'Please be prepared to discuss your React projects and data structures.'
  });
  const [scheduling, setScheduling] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/company/applications');
      if (res.success && res.data) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load applicants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await api.patch(`/company/applications/${appId}/status`, {
        status: newStatus
      });
      if (res.success) {
        setApplications(prev =>
          prev.map(a => (a._id === appId ? { ...a, status: newStatus } : a))
        );
        setStatusMessage({ type: 'success', text: `Applicant status marked as ${newStatus}.` });
      }
    } catch (err) {
      alert(err.message || 'Could not update applicant status.');
    }
  };

  const openInterviewModal = (appId) => {
    setTargetAppId(appId);
    // default date 2 days from now at 11:00 AM
    const nextDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    nextDate.setHours(11, 0, 0, 0);
    const localIso = new Date(nextDate.getTime() - nextDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setInterviewForm(prev => ({ ...prev, scheduledAt: localIso }));
    setIsModalOpen(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!targetAppId || !interviewForm.scheduledAt) return;

    setScheduling(true);
    try {
      const res = await api.post(`/company/applications/${targetAppId}/interview`, {
        scheduledAt: new Date(interviewForm.scheduledAt).toISOString(),
        durationMinutes: Number(interviewForm.durationMinutes) || 45,
        locationOrLink: interviewForm.locationOrLink,
        notes: interviewForm.notes
      });

      if (res.success) {
        setIsModalOpen(false);
        setApplications(prev =>
          prev.map(a => (a._id === targetAppId ? { ...a, status: 'INTERVIEW', interviewDetails: res.data.interview } : a))
        );
        setStatusMessage({
          type: 'success',
          text: 'Interview successfully scheduled! Candidate has been notified.'
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to schedule interview round.');
    } finally {
      setScheduling(false);
    }
  };

  const filteredApps = applications.filter(app => {
    if (statusFilter === 'ALL') return true;
    return app.status === statusFilter;
  });

  if (loading) return <LoadingSpinner fullPage text="Scanning candidate applications..." />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Recruitment Hub</p>
        <h1 className="text-3xl font-black text-slate-900 mt-1">Review Candidate Applications</h1>
        <p className="text-sm text-slate-500">
          Screen student profiles, advance candidate pipeline stages, and schedule video interview rounds.
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

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'ALL', label: `All (${applications.length})` },
          { key: 'APPLIED', label: `Applied (${applications.filter(a => a.status === 'APPLIED').length})` },
          { key: 'SHORTLISTED', label: `Shortlisted (${applications.filter(a => a.status === 'SHORTLISTED').length})` },
          { key: 'INTERVIEW', label: `Interview (${applications.filter(a => a.status === 'INTERVIEW').length})` },
          { key: 'SELECTED', label: `Selected (${applications.filter(a => a.status === 'SELECTED').length})` },
          { key: 'REJECTED', label: `Rejected (${applications.filter(a => a.status === 'REJECTED').length})` }
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

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description="Candidates who apply to your posted internships will appear here."
        />
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const student = app.studentId || {};
            const internship = app.internshipId || {};
            const resume = app.resumeId || {};
            const isExpanded = expandedId === app._id;

            return (
              <div
                key={app._id}
                className="glass-card rounded-3xl p-6 bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={app.status}>{app.status}</Badge>
                      <span className="text-xs text-slate-400">
                        Applied {formatDate(app.appliedAt || app.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mt-2">
                      {student.name || 'Student Candidate'}
                    </h3>

                    <p className="text-xs font-semibold text-indigo-600">
                      Applied for: {internship.title || 'Internship Role'}
                    </p>

                    <p className="text-xs text-slate-500">
                      Email: {student.email || 'Confidential'}
                    </p>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex flex-wrap items-center gap-2 sm:self-center">
                    <select
                      value={app.status}
                      onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 focus:bg-white focus:border-indigo-500 outline-none"
                    >
                      <option value="APPLIED">Applied</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="SHORTLISTED">Shortlisted</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="SELECTED">Selected</option>
                      <option value="REJECTED">Rejected</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => openInterviewModal(app._id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 text-xs font-bold transition-colors"
                    >
                      <Video className="h-3.5 w-3.5" /> Schedule Round
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : app._id)}
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-xs font-bold transition-colors"
                    >
                      <span>{isExpanded ? 'Less' : 'Review'}</span>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Cover Note & Resume details */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-100 space-y-4 text-xs">
                    {app.coverLetter && (
                      <div>
                        <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                          Candidate Cover Letter
                        </span>
                        <p className="mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 whitespace-pre-line leading-relaxed">
                          {app.coverLetter}
                        </p>
                      </div>
                    )}

                    {resume && resume.fileName && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-indigo-600" />
                          <div>
                            <span className="font-bold text-slate-900">{resume.fileName}</span>
                            {resume.parsedContent?.atsScore && (
                              <span className="ml-2 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                                ATS Score: {resume.parsedContent.atsScore}/100
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Candidate Interview Round"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Scheduled Date & Time *
            </label>
            <input
              required
              type="datetime-local"
              value={interviewForm.scheduledAt}
              onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Duration (Minutes)
            </label>
            <select
              value={interviewForm.durationMinutes}
              onChange={(e) => setInterviewForm({ ...interviewForm, durationMinutes: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 outline-none"
            >
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes (Standard)</option>
              <option value={60}>60 Minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Meeting Video Link or Office Location *
            </label>
            <input
              required
              type="text"
              value={interviewForm.locationOrLink}
              onChange={(e) => setInterviewForm({ ...interviewForm, locationOrLink: e.target.value })}
              placeholder="e.g. https://meet.google.com/xyz or Bangalore HQ"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Instructions or Notes for Candidate
            </label>
            <textarea
              rows={3}
              value={interviewForm.notes}
              onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
              placeholder="Topics to discuss, preparation instructions, etc..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={scheduling}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Video className="h-4 w-4" />
              <span>{scheduling ? 'Scheduling...' : 'Confirm Interview'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CompanyApplicationsPage;
