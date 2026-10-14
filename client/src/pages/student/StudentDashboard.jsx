import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  FileText,
  UserCheck,
  Cpu,
  Target,
  Send,
  CheckCircle2,
  Clock,
  Compass,
  AlertCircle
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

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [recommendedInternships, setRecommendedInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [profRes, appRes, resumeRes, recRes] = await Promise.all([
          api.get('/students/me/profile').catch(() => ({ data: {} })),
          api.get('/students/me/applications').catch(() => ({ data: { applications: [] } })),
          api.get('/students/me/resumes').catch(() => ({ data: { resumes: [] } })),
          api.get('/ai/recommendations').catch(() => ({ data: [] }))
        ]);

        setProfile(profRes.data);
        setApplications(appRes.data?.applications || []);
        setResumes(resumeRes.data?.resumes || []);
        setRecommendedInternships(recRes.data || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Assembling your personalized dashboard..." />;

  const stats = profile?.stats || {};
  const studentProfile = profile?.user?.profile || user?.profile || {};
  const primaryResume = resumes.find(r => r.isPrimary) || resumes[0];
  const atsScore = primaryResume?.parsedContent?.atsScore || 85;

  const interviewsCount = applications.filter(a => a.status === 'INTERVIEW').length;
  const shortlistedCount = applications.filter(a => a.status === 'SHORTLISTED' || a.status === 'SELECTED').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> Student Career Intelligence
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p className="max-w-xl text-xs md:text-sm text-indigo-100">
              {studentProfile.headline || 'Ready to discover internship opportunities and level up your skills.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/student/copilot"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-700 shadow-md hover:bg-indigo-50 transition-all"
            >
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Ask Career Copilot
            </Link>
            <Link
              to="/internships"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600/60 border border-white/20 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-600 transition-all"
            >
              Discover Roles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Applications</span>
            <Send className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{applications.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Submitted applications</p>
        </div>

        <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Interviews & Shortlists</span>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{interviewsCount + shortlistedCount}</div>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">
            {interviewsCount} Interview, {shortlistedCount} Shortlisted
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">ATS Resume Fit</span>
            <FileText className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{atsScore}/100</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {primaryResume ? 'Primary resume active' : 'Upload resume'}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Skill Verified</span>
            <Target className="h-4 w-4 text-cyan-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {(studentProfile.skills || []).length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Key competencies added</p>
        </div>
      </div>

      {/* AI Intelligence Shortcuts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/student/copilot"
          className="glass-card rounded-2xl p-5 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Career Copilot</h3>
          <p className="text-xs text-slate-500 mt-1">Chat with our AI advisor for customized placement guidance.</p>
        </Link>

        <Link
          to="/student/skill-gap"
          className="glass-card rounded-2xl p-5 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 mb-3 group-hover:scale-110 transition-transform">
            <Cpu className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Skill Gap Analyzer</h3>
          <p className="text-xs text-slate-500 mt-1">Benchmark yourself against specific employer postings.</p>
        </Link>

        <Link
          to="/student/simulator"
          className="glass-card rounded-2xl p-5 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 mb-3 group-hover:scale-110 transition-transform">
            <UserCheck className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Mock Interviewer</h3>
          <p className="text-xs text-slate-500 mt-1">Practice interview questions with AI scoring and feedback.</p>
        </Link>

        <Link
          to="/student/resumes"
          className="glass-card rounded-2xl p-5 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
            <FileText className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Resume & ATS Score</h3>
          <p className="text-xs text-slate-500 mt-1">Upload resumes, view parsing metrics, and set primary copy.</p>
        </Link>
      </div>

      {/* Main Grid: Recent Applications & Recommended Roles */}
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: Recent Applications */}
        <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Applications</h2>
              <p className="text-xs text-slate-500">Track active recruitment pipelines</p>
            </div>
            <Link
              to="/student/applications"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              View all ({applications.length}) →
            </Link>
          </div>

          {applications.length > 0 ? (
            <div className="space-y-3">
              {applications.slice(0, 4).map((app) => {
                const internship = app.internshipId || {};
                const company = internship.companyId || {};

                return (
                  <div
                    key={app._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 hover:border-slate-200 transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {internship.title || 'Internship Position'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {company.name || 'Hiring Team'} • Applied {formatDate(app.appliedAt || app.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant={app.status}>{app.status}</Badge>
                      <Link
                        to={`/internships/${internship._id || ''}`}
                        className="text-xs font-semibold text-slate-600 hover:text-indigo-600"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 border border-dashed rounded-2xl border-slate-200">
              You haven't submitted any applications yet.
              <div className="mt-3">
                <Link
                  to="/internships"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Discover Internships
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right: Profile & Skills Snapshot */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Profile Snapshot</h3>
              <Link
                to="/student/profile"
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Edit
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                  Headline
                </span>
                <p className="text-slate-800 font-medium mt-0.5">
                  {studentProfile.headline || 'Add a professional headline in your profile'}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                  Location
                </span>
                <p className="text-slate-800 font-medium mt-0.5">
                  {studentProfile.location || 'Location not specified'}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                  Declared Skills
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(studentProfile.skills || []).length > 0 ? (
                    studentProfile.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-lg bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">No skills added yet</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                to="/student/roadmap"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                <Compass className="h-3.5 w-3.5" /> View Career Roadmap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
