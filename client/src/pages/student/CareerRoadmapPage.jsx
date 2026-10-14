import React, { useEffect, useState } from 'react';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Layers,
  Award,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

export const CareerRoadmapPage = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [targetRole, setTargetRole] = useState('Full-Stack Software Engineer');
  const [timeframeMonths, setTimeframeMonths] = useState(3);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/roadmap/plans');
      if (res.success && res.data) {
        setPlans(res.data);
        if (res.data.length > 0) {
          setActivePlan(res.data[0]);
        }
      }
    } catch (err) {
      // non-blocking
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const res = await api.post('/ai/roadmap/generate', {
        targetRole,
        timelineWeeks: Number(timeframeMonths) * 4
      });

      if (res.success && res.data) {
        const newPlan = res.data.plan || res.data;
        setActivePlan(newPlan);
        setPlans(prev => [newPlan, ...prev]);
        setStatusMessage({ type: 'success', text: 'New custom career roadmap created!' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to generate roadmap.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleMilestone = async (milestoneId) => {
    if (!activePlan) return;
    try {
      const res = await api.patch(
        `/ai/roadmap/plans/${activePlan._id}/milestones/${milestoneId}/toggle`
      );

      if (res.success && res.data) {
        const updated = res.data.plan || res.data;
        setActivePlan(updated);
        setPlans(prev => prev.map(p => (p._id === activePlan._id ? updated : p)));
      }
    } catch (err) {
      alert(err.message || 'Could not update milestone.');
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Retrieving your career roadmaps..." />;

  const milestones = activePlan?.milestones || [];
  const completedCount = milestones.filter(m => m.completed).length;
  const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">AI Intelligence</p>
        <h1 className="text-3xl font-black text-slate-900 mt-1 flex items-center gap-2">
          Career Roadmap Planner <Compass className="h-6 w-6 text-indigo-600" />
        </h1>
        <p className="text-sm text-slate-500">
          Personalized step-by-step milestone plans designed to prepare you for targeted internship opportunities.
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

      {/* Generator Form */}
      <div className="glass-card rounded-3xl p-6 md:p-8 bg-white border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Generate or Update Career Roadmap</h2>
        <form onSubmit={handleGenerateRoadmap} className="grid gap-4 sm:grid-cols-12 items-end">
          <div className="sm:col-span-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Desired Target Role
            </label>
            <input
              type="text"
              required
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full-Stack Developer, AI Engineer, Cloud Specialist"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Duration Timeframe
            </label>
            <select
              value={timeframeMonths}
              onChange={(e) => setTimeframeMonths(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            >
              <option value={3}>3 Months (Fast Track)</option>
              <option value={6}>6 Months (Comprehensive)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={generating}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-all disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <span>{generating ? 'Synthesizing...' : 'Generate Roadmap'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Roadmap Display */}
      {activePlan ? (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-6 md:p-8 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                  Target Career Blueprint
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {activePlan.targetRole}
                </h2>
                <p className="text-xs text-indigo-200 mt-1">
                  {activePlan.timeframeMonths} Months Structured Milestone Plan
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 border border-white/15 backdrop-blur-md text-right self-start sm:self-auto">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Progress
                </span>
                <div className="text-2xl font-black text-emerald-400">
                  {completedCount} / {milestones.length} Completed
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Completion Status</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Milestones Timeline */}
          <div className="glass-card rounded-3xl p-6 md:p-8 bg-white border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" /> Milestone Phases & Checkpoints
            </h3>
            <p className="text-xs text-slate-500">
              Click the checkbox next to any milestone once you have completed the topic or project.
            </p>

            <div className="space-y-3 pt-3">
              {milestones.map((m, idx) => (
                <div
                  key={m._id || idx}
                  onClick={() => handleToggleMilestone(m._id)}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                    m.completed
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0 text-emerald-600">
                    {m.completed ? (
                      <CheckCircle2 className="h-5 w-5 fill-emerald-100" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-sm font-bold ${
                          m.completed ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {m.title}
                      </h4>
                      {m.targetWeek && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                          Week {m.targetWeek}
                        </span>
                      )}
                    </div>
                    {m.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center bg-white">
          <Compass className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No career roadmap generated yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Choose your target role above and click "Generate Roadmap" to construct an AI-powered curriculum.
          </p>
        </div>
      )}
    </div>
  );
};

export default CareerRoadmapPage;
