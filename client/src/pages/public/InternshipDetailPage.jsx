import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowLeft,
  Send,
  ExternalLink,
  Target
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Badge from '../../components/common/Badge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const formatDate = (val) => {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const InternshipDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const [internship, setInternship] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [existingApplication, setExistingApplication] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/internships/${id}`);
        if (res.success && res.data) {
          setInternship(res.data);
        }

        // If authenticated student, load their resumes and check if they already applied
        if (isAuthenticated && role === 'STUDENT') {
          const [resumeRes, appRes] = await Promise.all([
            api.get('/students/me/resumes').catch(() => ({ data: { resumes: [] } })),
            api.get('/students/me/applications').catch(() => ({ data: { applications: [] } }))
          ]);

          const resumeList = resumeRes.data?.resumes || [];
          setResumes(resumeList);
          const primary = resumeList.find((r) => r.isPrimary) || resumeList[0];
          if (primary) setResumeId(primary._id);

          const studentApps = appRes.data?.applications || [];
          const matchedApp = studentApps.find(
            (a) => a.internshipId?._id === id || a.internshipId === id
          );
          if (matchedApp) {
            setExistingApplication(matchedApp);
          }
        }
      } catch (err) {
        setStatusMessage({ type: 'error', text: err.message || 'Unable to load internship details.' });
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id, isAuthenticated, role]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (role !== 'STUDENT') {
      setStatusMessage({ type: 'error', text: 'Only student accounts can submit internship applications.' });
      return;
    }

    if (!resumeId) {
      setStatusMessage({ type: 'error', text: 'Please select or upload a resume before applying.' });
      return;
    }

    setSubmitting(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const res = await api.post(`/internships/${id}/apply`, {
        resumeId,
        coverLetter: coverLetter.trim() || undefined
      });

      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: 'Application submitted successfully! You can track its progress in your dashboard.'
        });
        setExistingApplication(res.data?.application || { status: 'APPLIED', appliedAt: new Date() });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to submit application.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading internship details..." />;

  if (!internship) {
    return (
      <div className="page-shell px-6 py-16 text-center max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-slate-800">Internship Listing Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">
          This position may have been closed or is no longer accepting submissions.
        </p>
        <Link
          to="/internships"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Internships
        </Link>
      </div>
    );
  }

  const company = internship.companyId || {};

  return (
    <div className="page-shell px-4 py-10 md:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/internships"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all internships
        </Link>
      </div>

      {/* Hero Overview Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant={internship.workMode}>{internship.workMode}</Badge>
              {company.verificationStatus && (
                <Badge variant={company.verificationStatus}>{company.verificationStatus}</Badge>
              )}
              <span className="text-xs text-slate-500 font-medium">
                Posted {formatDate(internship.createdAt)}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
              {internship.title}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-base font-bold text-indigo-600">
              <Building2 className="h-5 w-5 text-indigo-500 flex-shrink-0" />
              <span>{company.name || 'Verified Partner Organization'}</span>
            </div>
          </div>

          <div className="text-right sm:self-center">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Stipend</span>
            <p className="text-2xl font-black text-slate-900">
              {internship.stipend?.amount
                ? `₹${internship.stipend.amount.toLocaleString()} / mo`
                : 'Unpaid / Certificate'}
            </p>
          </div>
        </div>

        {/* Quick Meta Grid */}
        <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-4 pt-6 border-t border-slate-100">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <MapPin className="h-3.5 w-3.5" /> Location
            </div>
            <p className="text-sm font-bold text-slate-800 truncate">{internship.location}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <Clock className="h-3.5 w-3.5" /> Duration
            </div>
            <p className="text-sm font-bold text-slate-800">
              {internship.duration?.durationValue || 3} {internship.duration?.durationUnit || 'MONTHS'}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <Calendar className="h-3.5 w-3.5" /> Deadline
            </div>
            <p className="text-sm font-bold text-slate-800">{formatDate(internship.applicationDeadline)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <Briefcase className="h-3.5 w-3.5" /> Openings
            </div>
            <p className="text-sm font-bold text-slate-800">{internship.openings || 1} Available</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Left Column: Description, Responsibilities, Skills */}
        <div className="space-y-6">
          {/* Description */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Role Overview</h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {internship.description}
            </p>

            {/* Responsibilities */}
            {internship.responsibilities && internship.responsibilities.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-900 mb-3">Key Responsibilities</h3>
                <ul className="space-y-2.5">
                  {internship.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Skills */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-3">Required Technical Competencies</h3>
              <div className="flex flex-wrap gap-2">
                {(internship.requiredSkills || []).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-xl bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Skills */}
            {internship.preferredSkills && internship.preferredSkills.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-900 mb-3">Good-to-Have Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {internship.preferredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Skill Gap Tool Callout for Students */}
          {isAuthenticated && role === 'STUDENT' && (
            <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-cyan-50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
                  <Sparkles className="h-4 w-4" /> AI Skill Gap Analysis
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Compare your profile against this role's requirements
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Inspect missing topics, readiness score, and targeted study recommendations.
                </p>
              </div>
              <Link
                to={`/student/skill-gap?internshipId=${internship._id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm flex-shrink-0"
              >
                <Target className="h-4 w-4" /> Analyze Skill Gap
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Application Form & Company Snapshot */}
        <div className="space-y-6">
          {/* Application Box */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Apply for this Role</h2>

            {statusMessage.text && (
              <div
                className={`mb-4 rounded-2xl p-4 text-xs font-semibold ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            {existingApplication ? (
              <div className="space-y-4 rounded-2xl bg-slate-50 border border-slate-200/80 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Application Status
                  </span>
                  <Badge variant={existingApplication.status}>{existingApplication.status}</Badge>
                </div>
                <p className="text-xs text-slate-600">
                  You submitted your application on{' '}
                  <span className="font-semibold text-slate-900">
                    {formatDate(existingApplication.appliedAt || existingApplication.createdAt)}
                  </span>
                  . The hiring team will update your progress.
                </p>
                <Link
                  to="/student/applications"
                  className="block text-center rounded-xl bg-white border border-slate-200 py-2.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  Track in My Applications
                </Link>
              </div>
            ) : isAuthenticated && role === 'STUDENT' ? (
              <form onSubmit={handleApply} className="space-y-4">
                {/* Resume Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Select Resume
                    </label>
                    <Link
                      to="/student/resumes"
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Manage Resumes
                    </Link>
                  </div>

                  {resumes.length > 0 ? (
                    <select
                      value={resumeId}
                      onChange={(e) => setResumeId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    >
                      {resumes.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.fileName} {r.isPrimary ? '★ (Primary)' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 space-y-2">
                      <p>You haven't uploaded a resume yet.</p>
                      <Link
                        to="/student/resumes"
                        className="inline-block font-bold text-amber-900 underline"
                      >
                        Upload Resume now →
                      </Link>
                    </div>
                  )}
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Cover Note / Elevator Pitch (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Briefly explain why your skills and background make you a strong candidate for this internship..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || resumes.length === 0}
                  className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? 'Submitting Application...' : 'Submit Application'}</span>
                </button>
              </form>
            ) : !isAuthenticated ? (
              <div className="space-y-4 rounded-2xl bg-slate-50 p-5 text-center">
                <p className="text-xs text-slate-600">
                  Please log in with your student account to apply and submit your verified resume.
                </p>
                <Link
                  to="/login"
                  className="block w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
                >
                  Log In to Apply
                </Link>
                <Link
                  to="/register"
                  className="block text-xs font-semibold text-slate-600 hover:text-indigo-600"
                >
                  Create free student account →
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
                You are currently signed in as <span className="font-bold text-slate-900">{role}</span>. Only student accounts can apply for open positions.
              </div>
            )}
          </div>

          {/* Company Details Card */}
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">About the Employer</h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-800">Industry:</span>{' '}
                {company.industry || 'Software & Technology'}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Organization Size:</span>{' '}
                {company.companySize || 'Medium'}
              </div>
              {company.website && (
                <div>
                  <span className="font-semibold text-slate-800">Website:</span>{' '}
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                  >
                    {company.website} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
            {company.description && (
              <p className="text-xs text-slate-500 pt-3 border-t border-slate-100 leading-relaxed">
                {company.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetailPage;
