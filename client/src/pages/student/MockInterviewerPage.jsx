import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  Sparkles,
  Send,
  Award,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import api from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const TOPIC_OPTIONS = [
  { role: 'Full-Stack Software Engineer', topic: 'React, Node.js, System Architecture & REST APIs' },
  { role: 'Frontend Engineer', topic: 'React, CSS Layouts, State Management & Web Performance' },
  { role: 'Backend & Cloud Engineer', topic: 'Node.js, MongoDB Data Modeling, Indexing & Authentication' },
  { role: 'Behavioral & Leadership', topic: 'STAR Method, Conflict Resolution & Project Ownership' }
];

export const MockInterviewerPage = () => {
  const [selectedTopic, setSelectedTopic] = useState(TOPIC_OPTIONS[0]);
  const [session, setSession] = useState(null);
  const [answerInput, setAnswerInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [pastSessions, setPastSessions] = useState([]);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const loadPastSessions = async () => {
    try {
      const res = await api.get('/ai/interview/sessions');
      if (res.success && res.data) {
        setPastSessions(res.data);
      }
    } catch (err) {
      // non-blocking
    }
  };

  useEffect(() => {
    loadPastSessions();
  }, []);

  const handleStartInterview = async () => {
    setStarting(true);
    setStatusMessage({ type: '', text: '' });
    setEvaluation(null);
    setAnswerInput('');

    try {
      const res = await api.post('/ai/interview/start', {
        targetRole: selectedTopic.role,
        difficulty: 'INTERMEDIATE'
      });

      if (res.success && res.data) {
        setSession(res.data);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to start interview.' });
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerInput.trim() || submitting || !session) return;

    const currentQ = session.questions?.[session.answers?.length || 0];
    if (!currentQ) return;

    setSubmitting(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const res = await api.post('/ai/interview/answer', {
        sessionId: session._id,
        questionId: currentQ.questionId,
        answerText: answerInput.trim()
      });

      if (res.success && res.data) {
        const updatedSession = res.data;
        setSession(updatedSession);
        const lastAnswer = updatedSession.answers?.[updatedSession.answers.length - 1];
        if (lastAnswer?.feedback) {
          setEvaluation(lastAnswer.feedback);
        }
        setAnswerInput('');
        loadPastSessions();
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not submit answer.' });
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion = session?.questions?.[session?.currentQuestionIndex] || session?.questions?.[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">AI Intelligence</p>
        <h1 className="text-3xl font-black text-slate-900 mt-1 flex items-center gap-2">
          Mock Interview Simulator <UserCheck className="h-6 w-6 text-purple-600" />
        </h1>
        <p className="text-sm text-slate-500">
          Simulate realistic technical and behavioral interviews with instant AI evaluation, scoring, and ideal response structures.
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

      {/* Setup / Start Card */}
      {!session ? (
        <div className="glass-card rounded-3xl p-6 md:p-8 bg-white border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Choose an Interview Track</h2>
            <p className="text-xs text-slate-500">Select the domain role you want to practice for:</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {TOPIC_OPTIONS.map((opt) => {
              const isSelected = selectedTopic.role === opt.role;

              return (
                <div
                  key={opt.role}
                  onClick={() => setSelectedTopic(opt)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{opt.role}</h3>
                    <p className="text-xs text-slate-600 mt-1">{opt.topic}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-bold">
                    <span className={isSelected ? 'text-indigo-600' : 'text-slate-400'}>
                      {isSelected ? '✓ Selected Track' : 'Click to Select'}
                    </span>
                    <Play className={`h-4 w-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleStartInterview}
              disabled={starting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-all disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <span>{starting ? 'Starting Simulation...' : 'Start Interview Session'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Interview Session Card */
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 md:p-8 bg-white border border-slate-200 shadow-md space-y-6">
            {/* Top Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Active Session • {session.role}
                </span>
                <h3 className="text-base font-bold text-slate-800 mt-0.5">{session.topic}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSession(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 self-start sm:self-auto"
              >
                <RotateCcw className="h-3.5 w-3.5" /> End Session
              </button>
            </div>

            {/* Question Display */}
            {currentQuestion ? (
              <div className="rounded-2xl bg-indigo-50/80 border border-indigo-100 p-6 space-y-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-indigo-700">
                  Interview Question ({session?.answers?.length || 0} of {session?.questions?.length || 3})
                </span>
                <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  "{currentQuestion.questionText || currentQuestion.text || currentQuestion.question}"
                </p>
              </div>
            ) : null}

            {/* Evaluation from last answered question */}
            {evaluation && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 text-sm font-bold">
                    <Award className="h-5 w-5 text-emerald-600" /> AI Evaluation Feedback
                  </div>
                  <span className="rounded-full bg-emerald-600 text-white px-3 py-1 text-xs font-black">
                    Score: {evaluation.score || 85} / 100
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-emerald-900 uppercase text-[10px]">What You Did Well:</span>
                    <p className="text-slate-700">
                      {Array.isArray(evaluation.strengths)
                        ? evaluation.strengths.join(' ')
                        : (evaluation.strengths || 'Clear articulation and relevance to core concept.')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-amber-900 uppercase text-[10px]">Areas to Polish:</span>
                    <p className="text-slate-700">
                      {Array.isArray(evaluation.improvements)
                        ? evaluation.improvements.join(' ')
                        : (evaluation.improvements || 'Consider incorporating concrete performance tradeoffs or metrics.')}
                    </p>
                  </div>
                </div>

                {(evaluation.modelAnswer || evaluation.idealAnswer) && (
                  <div className="pt-2 border-t border-emerald-200/60 text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Recommended Model Response:</span>
                    <p className="mt-1 text-slate-600 leading-relaxed">{evaluation.modelAnswer || evaluation.idealAnswer}</p>
                  </div>
                )}
              </div>
            )}

            {/* Answer Input */}
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Your Response
                </label>
                <textarea
                  required
                  rows={5}
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder="Type your structured answer here. Include concepts, practical project examples, and reasons..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  Tip: Use the STAR method (Situation, Task, Action, Result) for behavioral answers.
                </span>
                <button
                  type="submit"
                  disabled={submitting || !answerInput.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? 'Analyzing Response...' : 'Submit Answer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Past Sessions History */}
      {pastSessions.length > 0 && (
        <div className="glass-card rounded-3xl p-6 md:p-8 bg-white border border-slate-200 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Past Practice Sessions ({pastSessions.length})</h2>
          <div className="space-y-3">
            {pastSessions.slice(0, 5).map((s) => (
              <div
                key={s._id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{s.role}</h4>
                  <p className="text-slate-500 mt-0.5">{s.topic}</p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-purple-100 text-purple-700 px-2.5 py-0.5 font-bold text-[11px]">
                    Avg Score: {s.averageScore || 8} / 10
                  </span>
                  <p className="text-slate-400 text-[10px] mt-1">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterviewerPage;
