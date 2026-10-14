import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Cpu,
  Target,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  Briefcase,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import api from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

export const SkillGapPage = () => {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('internshipId') || '';

  const [internships, setInternships] = useState([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState(preselectedId);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  // Load published internships for the selector
  useEffect(() => {
    const loadList = async () => {
      try {
        const res = await api.get('/internships');
        if (res.success && res.data) {
          const list = res.data.internships || [];
          setInternships(list);
          if (!selectedInternshipId && list.length > 0) {
            setSelectedInternshipId(list[0]._id);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load internships.');
      } finally {
        setInitialLoading(false);
      }
    };
    loadList();
  }, []);

  // Run analysis when an internship is selected or changed
  const runAnalysis = async (targetId) => {
    const idToAnalyze = targetId || selectedInternshipId;
    if (!idToAnalyze) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/skill-gap', { internshipId: idToAnalyze });
      if (res.success && res.data) {
        setAnalysis(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze skill gap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedInternshipId) {
      runAnalysis(selectedInternshipId);
    }
  }, [selectedInternshipId]);

  if (initialLoading) return <LoadingSpinner fullPage text="Loading skill gap analyzer..." />;

  const selectedInternship = internships.find(i => i._id === selectedInternshipId);
  const matchScore = analysis?.matchPercentage ?? analysis?.matchScore ?? 0;
  const learningItems = analysis?.recommendations || analysis?.learningPlan || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">AI Intelligence</p>
        <h1 className="text-3xl font-black text-slate-900 mt-1 flex items-center gap-2">
          Skill Gap Radar <Cpu className="h-6 w-6 text-indigo-600" />
        </h1>
        <p className="text-sm text-slate-500">
          Compare your declared skills against live employer requirements and generate a targeted learning roadmap.
        </p>
      </div>

      {/* Role Selection Dropdown */}
      <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200 shadow-xs space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Select Target Internship Position
        </label>
        <select
          value={selectedInternshipId}
          onChange={(e) => setSelectedInternshipId(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-semibold"
        >
          {internships.map((item) => (
            <option key={item._id} value={item._id}>
              {item.title} — {item.companyId?.name || 'Company'} ({item.location})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Computing skill compatibility and learning paths..." />
      ) : analysis ? (
        <div className="space-y-6">
          {/* Match Score Banner */}
          <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-6 md:p-8 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                  Target Role Compatibility
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {selectedInternship?.title}
                </h2>
                <p className="text-xs text-indigo-200 mt-1">
                  {selectedInternship?.companyId?.name} • {selectedInternship?.workMode} • {selectedInternship?.location}
                </p>
              </div>

              <div className="flex items-center gap-4 bg-white/10 rounded-2xl p-4 border border-white/15 backdrop-blur-md self-start sm:self-auto">
                <div className="text-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Match Fit
                  </span>
                  <div className="text-4xl font-black text-emerald-400 mt-0.5">
                    {matchScore}%
                  </div>
                </div>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Skill Match Progress</span>
                <span>{matchScore}% Qualified</span>
              </div>
              <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, matchScore)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Side-by-side Skills Breakdown */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Matched Skills */}
            <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Matched Skills ({analysis.matchedSkills?.length || 0})
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Skills found both on your student profile and this internship's requirements.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {(analysis.matchedSkills || []).length > 0 ? (
                  analysis.matchedSkills.map((s) => (
                    <span
                      key={s}
                      className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800"
                    >
                      ✓ {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No overlapping skills detected yet.</span>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Missing Skills ({analysis.missingSkills?.length || 0})
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Skills required by the employer that are not currently declared on your profile.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {(analysis.missingSkills || []).length > 0 ? (
                  analysis.missingSkills.map((s) => (
                    <span
                      key={s}
                      className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-800"
                    >
                      + {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-600 font-bold">
                    Awesome! You meet 100% of declared required skills.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* AI Coaching Tip */}
          {analysis.aiCoachingTip && (
            <div className="rounded-3xl border border-indigo-200 bg-indigo-50/80 p-6 flex items-start gap-4">
              <Sparkles className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-indigo-950">AI Career Coach Assessment</h4>
                <p className="text-xs text-indigo-900 mt-1 leading-relaxed">{analysis.aiCoachingTip}</p>
              </div>
            </div>
          )}

          {/* AI Targeted Learning Plan */}
          {learningItems.length > 0 && (
            <div className="glass-card rounded-3xl p-6 md:p-8 bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-indigo-700">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Recommended Accelerated Study Plan</h3>
              </div>
              <p className="text-xs text-slate-500">
                Key modules and topics to master to close this role's specific skill gap:
              </p>

              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                {learningItems.map((planItem, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black">
                      {i + 1}
                    </div>
                    <div className="text-xs text-slate-700 font-medium leading-relaxed">
                      {typeof planItem === 'object' ? (
                        <>
                          <div className="font-bold text-slate-900 mb-0.5">{planItem.skill} ({planItem.priority} Priority)</div>
                          <div>{planItem.recommendedAction}</div>
                        </>
                      ) : (
                        planItem
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-slate-100 border border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Ready to take the next step?</h4>
              <p className="text-xs text-slate-500">Practice your interview answers or apply directly.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/student/simulator"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <UserCheck className="h-4 w-4 text-purple-600" /> Practice Mock Interview
              </Link>
              <Link
                to={`/internships/${selectedInternship?._id || ''}`}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs"
              >
                Apply for this Internship <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SkillGapPage;
