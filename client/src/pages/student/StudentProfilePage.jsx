import React, { useEffect, useState } from 'react';
import {
  User,
  GraduationCap,
  FolderGit2,
  Sliders,
  CheckCircle2,
  Trash2,
  Plus,
  Save,
  MapPin,
  Phone,
  Briefcase
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

export const StudentProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Basic profile info
  const [basic, setBasic] = useState({
    name: '',
    headline: '',
    bio: '',
    phone: '',
    location: ''
  });

  // Skills
  const [skillsInput, setSkillsInput] = useState('');

  // Education list & new form
  const [educationList, setEducationList] = useState([]);
  const [showEduModal, setShowEduModal] = useState(false);
  const [newEdu, setNewEdu] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    current: true,
    gpa: ''
  });

  // Projects list & new form
  const [projectList, setProjectList] = useState([]);
  const [showProjModal, setShowProjModal] = useState(false);
  const [newProj, setNewProj] = useState({
    title: '',
    description: '',
    technologies: '',
    link: '',
    githubUrl: ''
  });

  // Career Preferences
  const [preferences, setPreferences] = useState({
    targetRoles: '',
    preferredLocations: '',
    workModes: ['REMOTE', 'HYBRID'],
    minimumStipend: 0
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students/me/profile');
      if (res.success && res.data?.user) {
        const u = res.data.user;
        const p = u.profile || {};

        setBasic({
          name: u.name || '',
          headline: p.headline || '',
          bio: p.bio || '',
          phone: p.phone || '',
          location: p.location || ''
        });

        setSkillsInput((p.skills || []).join(', '));
        setEducationList(p.education || []);
        setProjectList(p.projects || []);

        const cp = p.careerPreferences || {};
        setPreferences({
          targetRoles: (cp.targetRoles || []).join(', '),
          preferredLocations: (cp.preferredLocations || []).join(', '),
          workModes: cp.workModes || ['REMOTE'],
          minimumStipend: cp.minimumStipend || 0
        });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to load profile details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveBasicAndSkills = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      // 1. Update basic profile
      await api.patch('/students/me/profile', {
        name: basic.name,
        headline: basic.headline,
        bio: basic.bio,
        phone: basic.phone,
        location: basic.location
      });

      // 2. Update skills using correct { skills: array } format (BUG FIX)
      const parsedSkills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.patch('/students/me/skills', { skills: parsedSkills });

      // 3. Update career preferences
      const parsedRoles = preferences.targetRoles
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const parsedLocs = preferences.preferredLocations
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.patch('/students/me/career-preferences', {
        targetRoles: parsedRoles,
        preferredLocations: parsedLocs,
        workModes: preferences.workModes,
        minimumStipend: Number(preferences.minimumStipend) || 0
      });

      await refreshUser();
      setStatusMessage({ type: 'success', text: 'Profile and preferences updated successfully!' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    try {
      await api.post('/students/me/education', newEdu);
      setShowEduModal(false);
      setNewEdu({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        current: true,
        gpa: ''
      });
      loadProfile();
      setStatusMessage({ type: 'success', text: 'Education entry added.' });
    } catch (err) {
      alert(err.message || 'Failed to add education.');
    }
  };

  const handleDeleteEducation = async (id) => {
    if (!window.confirm('Delete this education entry?')) return;
    try {
      await api.delete(`/students/me/education/${id}`);
      loadProfile();
      setStatusMessage({ type: 'success', text: 'Education entry removed.' });
    } catch (err) {
      alert(err.message || 'Failed to remove entry.');
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const techArray = newProj.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await api.post('/students/me/projects', {
        ...newProj,
        technologies: techArray
      });
      setShowProjModal(false);
      setNewProj({ title: '', description: '', technologies: '', link: '', githubUrl: '' });
      loadProfile();
      setStatusMessage({ type: 'success', text: 'Project added.' });
    } catch (err) {
      alert(err.message || 'Failed to add project.');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/students/me/projects/${id}`);
      loadProfile();
      setStatusMessage({ type: 'success', text: 'Project removed.' });
    } catch (err) {
      alert(err.message || 'Failed to remove project.');
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading your profile..." />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Account & Profile</p>
        <h1 className="text-3xl font-black text-slate-900 mt-1">Student Profile & Career Preferences</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Keep your profile and verified skill tags updated so AI matching and recruiters can find you.
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

      {/* Main Profile Form */}
      <form onSubmit={handleSaveBasicAndSkills} className="glass-card rounded-3xl p-6 md:p-8 bg-white border border-slate-200 space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <User className="h-5 w-5 text-indigo-600" /> Personal & Contact Details
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={basic.name}
              onChange={(e) => setBasic({ ...basic, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Professional Headline
            </label>
            <input
              type="text"
              value={basic.headline}
              placeholder="e.g. Aspiring Full-Stack Developer & AI Enthusiast"
              onChange={(e) => setBasic({ ...basic, headline: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Phone Number
            </label>
            <input
              type="text"
              value={basic.phone}
              placeholder="+91 98765 43210"
              onChange={(e) => setBasic({ ...basic, phone: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Location / City
            </label>
            <input
              type="text"
              value={basic.location}
              placeholder="e.g. Bangalore, India"
              onChange={(e) => setBasic({ ...basic, location: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Biography / Professional Summary
            </label>
            <textarea
              rows={4}
              value={basic.bio}
              placeholder="Brief summary of your educational background, core competencies, and career objectives..."
              onChange={(e) => setBasic({ ...basic, bio: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>
        </div>

        {/* Skills Section */}
        <div className="pt-6 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Technical & Professional Skills (comma-separated)
          </label>
          <input
            type="text"
            value={skillsInput}
            placeholder="React, Node.js, MongoDB, JavaScript, Python, REST APIs, Git"
            onChange={(e) => setSkillsInput(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Separate each skill with a comma. These are used for AI Skill-Gap matching and recruiter discovery.
          </p>
        </div>

        {/* Career Preferences Section */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-indigo-600" /> Career Preferences
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Roles (comma-separated)
              </label>
              <input
                type="text"
                value={preferences.targetRoles}
                placeholder="Full-Stack Developer, Frontend Engineer, AI Intern"
                onChange={(e) => setPreferences({ ...preferences, targetRoles: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Preferred Locations (comma-separated)
              </label>
              <input
                type="text"
                value={preferences.preferredLocations}
                placeholder="Bangalore, Hyderabad, Remote"
                onChange={(e) => setPreferences({ ...preferences, preferredLocations: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Minimum Monthly Stipend (₹)
              </label>
              <input
                type="number"
                min={0}
                value={preferences.minimumStipend}
                onChange={(e) => setPreferences({ ...preferences, minimumStipend: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-all disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving Profile...' : 'Save Profile & Preferences'}</span>
          </button>
        </div>
      </form>

      {/* Education Management Section */}
      <div className="glass-card rounded-3xl p-6 md:p-8 bg-white border border-slate-200 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600" /> Education & Academic Background
            </h2>
            <p className="text-xs text-slate-500">Degree, college, and grades</p>
          </div>
          <button
            type="button"
            onClick={() => setShowEduModal(!showEduModal)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Education
          </button>
        </div>

        {showEduModal && (
          <form onSubmit={handleAddEducation} className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add Academic Record</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                required
                type="text"
                placeholder="College / University Name *"
                value={newEdu.institution}
                onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
              />
              <input
                required
                type="text"
                placeholder="Degree (e.g. B.Tech, B.S.) *"
                value={newEdu.degree}
                onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
              />
              <input
                type="text"
                placeholder="Field of Study (e.g. Computer Science)"
                value={newEdu.fieldOfStudy}
                onChange={(e) => setNewEdu({ ...newEdu, fieldOfStudy: e.target.value })}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
              />
              <input
                type="text"
                placeholder="GPA / Score (e.g. 8.8 / 10)"
                value={newEdu.gpa}
                onChange={(e) => setNewEdu({ ...newEdu, gpa: e.target.value })}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEduModal(false)}
                className="rounded-xl bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
              >
                Add Record
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {educationList.length > 0 ? (
            educationList.map((edu, idx) => (
              <div key={edu._id || idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{edu.institution}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                    {edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteEducation(edu._id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Remove education"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No education entries added yet.</p>
          )}
        </div>
      </div>

      {/* Projects Management Section */}
      <div className="glass-card rounded-3xl p-6 md:p-8 bg-white border border-slate-200 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-indigo-600" /> Technical Projects & Portfolio
            </h2>
            <p className="text-xs text-slate-500">Showcase your coding projects and links</p>
          </div>
          <button
            type="button"
            onClick={() => setShowProjModal(!showProjModal)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Project
          </button>
        </div>

        {showProjModal && (
          <form onSubmit={handleAddProject} className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add Project</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                required
                type="text"
                placeholder="Project Title *"
                value={newProj.title}
                onChange={(e) => setNewProj({ ...newProj, title: e.target.value })}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 md:col-span-2"
              />
              <textarea
                rows={3}
                placeholder="Brief description of what you built and outcomes..."
                value={newProj.description}
                onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 md:col-span-2"
              />
              <input
                type="text"
                placeholder="Technologies used (e.g. React, Node.js, MongoDB)"
                value={newProj.technologies}
                onChange={(e) => setNewProj({ ...newProj, technologies: e.target.value })}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
              />
              <input
                type="url"
                placeholder="Live Project URL (optional)"
                value={newProj.link}
                onChange={(e) => setNewProj({ ...newProj, link: e.target.value })}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
              />
              <input
                type="url"
                placeholder="GitHub Repository URL (optional)"
                value={newProj.githubUrl}
                onChange={(e) => setNewProj({ ...newProj, githubUrl: e.target.value })}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 md:col-span-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowProjModal(false)}
                className="rounded-xl bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
              >
                Add Project
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {projectList.length > 0 ? (
            projectList.map((proj, idx) => (
              <div key={proj._id || idx} className="flex items-start justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">{proj.title}</h4>
                  {proj.description && <p className="text-xs text-slate-600">{proj.description}</p>}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(proj.technologies || []).map((t) => (
                      <span key={t} className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteProject(proj._id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Remove project"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No project portfolio entries added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
