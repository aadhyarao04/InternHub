import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  BarChart3,
  Cpu,
  Target,
  Star,
  Users,
  Building2,
  ChevronRight,
  ShieldCheck,
  Search,
  Award
} from 'lucide-react';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';

export const LandingPage = () => {
  const [featuredInternships, setFeaturedInternships] = useState([]);
  const [stats, setStats] = useState({
    activeRoles: 12,
    students: 2500,
    companies: 420
  });

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await api.get('/internships?limit=3');
        if (res.success && res.data?.internships) {
          setFeaturedInternships(res.data.internships);
          if (res.data.pagination?.total) {
            setStats(prev => ({ ...prev, activeRoles: res.data.pagination.total }));
          }
        }
      } catch (err) {
        // graceful fallback to initial stats
      }
    };
    loadFeatured();
  }, []);

  return (
    <div className="page-shell text-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-cyan-300 animate-spin-slow" />
              <span>AI-Powered Internship & Career Intelligence Platform</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight">
                Discover Opportunities. <br />
                <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                  Build Skills. Launch Career.
                </span>
              </h1>
              <p className="max-w-xl text-lg text-slate-300 leading-relaxed">
                InternHub AI connects ambitious students with verified employers through intelligent skill-gap analysis, ATS resume evaluation, AI mock interviews, and career roadmap planning.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2.5 rounded-xl bg-indigo-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:shadow-indigo-600/50 transition-all duration-200"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/internships"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 font-semibold text-white hover:bg-white/10 hover:border-white/40 transition-all duration-200 backdrop-blur-sm"
              >
                <Search className="h-4 w-4 text-indigo-300" />
                Browse Internships
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-white/10 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white">{stats.students}+</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider leading-tight">Students<br />Guided</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white">{stats.companies}+</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider leading-tight">Employers<br />Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white">93%</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider leading-tight">Interview<br />Readiness</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card / Interactive Preview */}
          <div className="relative">
            <div className="relative mx-auto w-full max-w-lg space-y-4">
              {/* Glass Card 1: AI Career Match */}
              <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl shadow-2xl shadow-black/40">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-widest">
                    <Sparkles className="h-4 w-4" /> AI Smart Match
                  </div>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300">
                    94% Compatibility
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Featured Role</span>
                  <h3 className="text-2xl font-bold text-white mt-0.5">Full-Stack Developer Intern</h3>
                  <p className="text-xs text-indigo-200 mt-1">TechCorp Solutions • Bangalore (Hybrid)</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-lg bg-white/15 px-2.5 py-1 text-white font-medium">React</span>
                  <span className="rounded-lg bg-white/15 px-2.5 py-1 text-white font-medium">Node.js</span>
                  <span className="rounded-lg bg-white/15 px-2.5 py-1 text-white font-medium">MongoDB</span>
                  <span className="rounded-lg bg-white/15 px-2.5 py-1 text-white font-medium">REST APIs</span>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <div>
                    <span className="text-[11px] text-slate-400">Stipend</span>
                    <p className="text-base font-bold text-white">₹35,000 / month</p>
                  </div>
                  <Link
                    to="/internships"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white text-slate-900 px-3.5 py-1.5 text-xs font-bold hover:bg-slate-100 transition-colors"
                  >
                    View Role <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Grid of Micro AI Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex items-center justify-between text-indigo-300 mb-2">
                    <span className="text-xs font-medium">ATS Resume Score</span>
                    <Award className="h-4 w-4" />
                  </div>
                  <div className="text-3xl font-black text-white">88/100</div>
                  <p className="text-[11px] text-emerald-400 mt-1">✓ Strong project evidence</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex items-center justify-between text-cyan-300 mb-2">
                    <span className="text-xs font-medium">Skill Gap</span>
                    <Target className="h-4 w-4" />
                  </div>
                  <div className="text-3xl font-black text-white">12%</div>
                  <p className="text-[11px] text-indigo-200 mt-1">1 learning module left</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-600 mb-2">Complete Student Journey</p>
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">Everything You Need To Secure Your Dream Internship</h2>
          <p className="mt-3 text-slate-600">From discovery to interview simulation, InternHub AI bridges the gap between academics and professional requirements.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: BriefcaseBusiness,
              title: 'Discover Roles',
              text: 'Find verified internships matching your desired location, work mode, and stipend preferences.',
              tag: 'Browse'
            },
            {
              icon: Cpu,
              title: 'Skill Gap Radar',
              text: 'Compare your skills against employer requirements in real time and see exact missing topics.',
              tag: 'Analyze'
            },
            {
              icon: GraduationCap,
              title: 'Mock Interviewer',
              text: 'Practice role-specific interview questions with AI scoring and immediate constructive feedback.',
              tag: 'Practice'
            },
            {
              icon: BarChart3,
              title: 'Career Copilot',
              text: 'Interact with our conversational advisor for resume tips, study roadmaps, and career planning.',
              tag: 'Elevate'
            }
          ].map(({ icon: Icon, title, text, tag }) => (
            <div key={title} className="glass-card rounded-3xl p-6 border border-slate-200/80 hover:border-indigo-300 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Live Internships Section */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-600">Live Postings</p>
              <h2 className="text-2xl font-black text-slate-900 sm:text-3xl mt-1">Explore Open Positions</h2>
            </div>
            <Link
              to="/internships"
              className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              View all listings ({stats.activeRoles}) <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredInternships.length > 0 ? (
              featuredInternships.map(internship => (
                <div key={internship._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={internship.workMode}>{internship.workMode}</Badge>
                      <span className="text-xs text-slate-400 font-medium">
                        {internship.location}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{internship.title}</h3>
                    <p className="text-sm font-semibold text-indigo-600 mt-0.5">
                      {internship.companyId?.name || 'Verified Partner'}
                    </p>
                    <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                      {internship.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {(internship.requiredSkills || []).slice(0, 4).map(skill => (
                        <span key={skill} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stipend</span>
                      <p className="text-base font-bold text-slate-900">
                        {internship.stipend?.amount ? `₹${internship.stipend.amount.toLocaleString()} / mo` : 'Competitive'}
                      </p>
                    </div>
                    <Link
                      to={`/internships/${internship._id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white px-3.5 py-2 text-xs font-semibold transition-colors"
                    >
                      Details <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 p-8">
                Explore our full catalogue of internship postings.
                <div className="mt-4">
                  <Link to="/internships" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white">
                    Explore Internships
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dual CTA: For Students & Employers */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Student Box */}
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-8 md:p-10 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 mb-4">
                <GraduationCap className="h-4 w-4" /> For Students
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">Accelerate Your Placement Prep</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Upload your resume to get instant ATS scoring, personalized skill recommendations, interactive mock interviews, and direct application tracking.
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Sign Up As Student <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Employer Box */}
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 md:p-10 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-200/80 px-3 py-1 text-xs font-bold text-slate-700 mb-4">
                <Building2 className="h-4 w-4" /> For Employers & Recruiters
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">Hire Pre-Vetted Campus Talent</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Post internship listings, review applicants with AI skill-match insights, schedule interviews, and streamline your entire campus hiring pipeline.
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              Register As Company <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
