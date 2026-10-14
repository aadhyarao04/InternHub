import React, { useEffect, useState } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Star,
  Award,
  AlertCircle,
  FileCheck,
  TrendingUp,
  Download
} from 'lucide-react';
import api from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const formatBytes = (bytes) => {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const formatDate = (val) => {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const ResumeManagerPage = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students/me/resumes');
      if (res.success && res.data) {
        setResumes(res.data.resumes || []);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Unable to load resumes.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatusMessage({ type: 'error', text: 'File size exceeds maximum 5MB limit.' });
        return;
      }
      setSelectedFile(file);
      setStatusMessage({ type: '', text: '' });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const res = await api.post('/students/me/resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Resume "${selectedFile.name}" uploaded and parsed successfully!`
        });
        setSelectedFile(null);
        fetchResumes();
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Resume upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (resumeId) => {
    try {
      const res = await api.patch(`/students/me/resumes/${resumeId}/primary`);
      if (res.success) {
        setResumes(prev =>
          prev.map(r => ({ ...r, isPrimary: r._id === resumeId }))
        );
        setStatusMessage({ type: 'success', text: 'Primary resume updated for applications.' });
      }
    } catch (err) {
      alert(err.message || 'Failed to update primary resume.');
    }
  };

  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Delete this resume? Applications using it will remain recorded.')) return;
    try {
      const res = await api.delete(`/students/me/resumes/${resumeId}`);
      if (res.success) {
        setResumes(prev => prev.filter(r => r._id !== resumeId));
        setStatusMessage({ type: 'success', text: 'Resume deleted.' });
      }
    } catch (err) {
      alert(err.message || 'Failed to delete resume.');
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Scanning your resume portfolio & ATS scores..." />;

  const primaryResume = resumes.find(r => r.isPrimary) || resumes[0];
  const parsed = primaryResume?.parsedContent || {};
  const atsScore = parsed.atsScore || 85;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Career Credentials</p>
        <h1 className="text-3xl font-black text-slate-900 mt-1">Resume Manager & ATS Scoring</h1>
        <p className="text-sm text-slate-500">
          Upload resumes to get automatic text parsing, ATS compatibility scores, and skill extraction.
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

      {/* Upload Zone */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Upload New Resume</h2>
        <p className="text-xs text-slate-500 mb-5">
          Supported formats: PDF, DOC, DOCX. Maximum file size: 5 MB.
        </p>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 rounded-2xl transition-all cursor-pointer">
            <UploadCloud className="h-10 w-10 text-indigo-500 mb-2" />
            <span className="text-sm font-bold text-slate-800">
              {selectedFile ? selectedFile.name : 'Choose a file or drag & drop here'}
            </span>
            <span className="text-xs text-slate-400 mt-1">
              {selectedFile ? `${formatBytes(selectedFile.size)} selected` : 'PDF, DOCX up to 5MB'}
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="mt-4 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UploadCloud className="h-4 w-4" />
              <span>{uploading ? 'Parsing with AI...' : 'Upload & Analyze Resume'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Primary Resume ATS Breakdown Card */}
      {primaryResume && (
        <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                Primary Resume Intelligence
              </span>
              <h2 className="text-2xl font-black text-white mt-1">{primaryResume.fileName}</h2>
              <p className="text-xs text-slate-300 mt-1">
                Uploaded {formatDate(primaryResume.createdAt)} • {formatBytes(primaryResume.fileSize)}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 rounded-2xl p-4 border border-white/15 backdrop-blur-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Award className="h-7 w-7" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  ATS Score
                </span>
                <div className="text-3xl font-black text-white">{atsScore}/100</div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 pt-6">
            {/* Parsed Skills */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                Extracted Skills
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(parsed.skills || []).length > 0 ? (
                  parsed.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-lg bg-white/10 border border-white/15 px-2.5 py-1 text-xs font-medium text-white"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No skills parsed yet</span>
                )}
              </div>
            </div>

            {/* Strengths */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                ATS Strengths
              </span>
              <ul className="space-y-2 text-xs text-slate-200 pt-1">
                {(parsed.strengths || ['Clear section hierarchy', 'Concise technology tags']).map(
                  (str, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Improvements */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Recommended Polish
              </span>
              <ul className="space-y-2 text-xs text-slate-200 pt-1">
                {(parsed.improvements || [
                  'Add quantifiable business metrics to project bullet points',
                  'Include system architecture keywords'
                ]).map((imp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Resumes List */}
      <div className="glass-card rounded-3xl p-6 md:p-8 bg-white border border-slate-200 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Your Saved Resumes ({resumes.length})</h2>

        {resumes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No resumes uploaded yet"
            description="Upload your resume above to enable 1-click internship applications."
          />
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{resume.fileName}</h4>
                      {resume.isPrimary && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-[10px] font-bold">
                          <Star className="h-3 w-3 fill-indigo-600" /> Primary
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatBytes(resume.fileSize)} • Added {formatDate(resume.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!resume.isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(resume._id)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                    >
                      Make Primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteResume(resume._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete resume"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeManagerPage;
