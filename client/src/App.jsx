import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Shells
import PublicLayout from './layouts/PublicLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import Navbar from './components/common/Navbar.jsx';
import Sidebar from './components/common/Sidebar.jsx';
import Footer from './components/common/Footer.jsx';

// Public Pages
import LandingPage from './pages/public/LandingPage.jsx';
import AuthPage from './pages/public/AuthPage.jsx';
import InternshipBrowser from './pages/public/InternshipBrowser.jsx';
import InternshipDetailPage from './pages/public/InternshipDetailPage.jsx';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import StudentProfilePage from './pages/student/StudentProfilePage.jsx';
import StudentApplicationsPage from './pages/student/StudentApplicationsPage.jsx';
import ResumeManagerPage from './pages/student/ResumeManagerPage.jsx';
import CareerCopilotPage from './pages/student/CareerCopilotPage.jsx';
import SkillGapPage from './pages/student/SkillGapPage.jsx';
import MockInterviewerPage from './pages/student/MockInterviewerPage.jsx';
import CareerRoadmapPage from './pages/student/CareerRoadmapPage.jsx';

// Company Pages
import CompanyDashboard from './pages/company/CompanyDashboard.jsx';
import CompanyInternshipsPage from './pages/company/CompanyInternshipsPage.jsx';
import CompanyCreateInternshipPage from './pages/company/CompanyCreateInternshipPage.jsx';
import CompanyApplicationsPage from './pages/company/CompanyApplicationsPage.jsx';
import CompanyProfilePage from './pages/company/CompanyProfilePage.jsx';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminCompaniesPage from './pages/admin/AdminCompaniesPage.jsx';
import AdminInternshipsPage from './pages/admin/AdminInternshipsPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage.jsx';

// Common Activity
import NotificationPage from './pages/common/NotificationPage.jsx';

import './App.css';

const DashboardShell = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-50/80">
    <Navbar />
    <div className="flex-1 flex mx-auto w-full max-w-7xl">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
    <Footer />
  </div>
);

export function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage initialMode="login" />} />
        <Route path="/register" element={<AuthPage initialMode="register" />} />
        <Route path="/internships" element={<InternshipBrowser />} />
        <Route path="/internships/:id" element={<InternshipDetailPage />} />
      </Route>

      {/* Protected Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route path="/student" element={<DashboardShell><StudentDashboard /></DashboardShell>} />
        <Route path="/student/profile" element={<DashboardShell><StudentProfilePage /></DashboardShell>} />
        <Route path="/student/applications" element={<DashboardShell><StudentApplicationsPage /></DashboardShell>} />
        <Route path="/student/resumes" element={<DashboardShell><ResumeManagerPage /></DashboardShell>} />
        <Route path="/student/copilot" element={<DashboardShell><CareerCopilotPage /></DashboardShell>} />
        <Route path="/student/skill-gap" element={<DashboardShell><SkillGapPage /></DashboardShell>} />
        <Route path="/student/simulator" element={<DashboardShell><MockInterviewerPage /></DashboardShell>} />
        <Route path="/student/roadmap" element={<DashboardShell><CareerRoadmapPage /></DashboardShell>} />
        <Route path="/student/notifications" element={<DashboardShell><NotificationPage /></DashboardShell>} />
      </Route>

      {/* Protected Company / Recruiter Routes */}
      <Route element={<ProtectedRoute allowedRoles={['COMPANY']} />}>
        <Route path="/company" element={<DashboardShell><CompanyDashboard /></DashboardShell>} />
        <Route path="/company/internships" element={<DashboardShell><CompanyInternshipsPage /></DashboardShell>} />
        <Route path="/company/internships/new" element={<DashboardShell><CompanyCreateInternshipPage /></DashboardShell>} />
        <Route path="/company/applications" element={<DashboardShell><CompanyApplicationsPage /></DashboardShell>} />
        <Route path="/company/profile" element={<DashboardShell><CompanyProfilePage /></DashboardShell>} />
        <Route path="/company/notifications" element={<DashboardShell><NotificationPage /></DashboardShell>} />
      </Route>

      {/* Protected Platform Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<DashboardShell><AdminDashboard /></DashboardShell>} />
        <Route path="/admin/companies" element={<DashboardShell><AdminCompaniesPage /></DashboardShell>} />
        <Route path="/admin/internships" element={<DashboardShell><AdminInternshipsPage /></DashboardShell>} />
        <Route path="/admin/users" element={<DashboardShell><AdminUsersPage /></DashboardShell>} />
        <Route path="/admin/applications" element={<DashboardShell><AdminApplicationsPage /></DashboardShell>} />
        <Route path="/admin/notifications" element={<DashboardShell><NotificationPage /></DashboardShell>} />
      </Route>

      {/* Wildcard Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
