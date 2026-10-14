import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import {
  LayoutDashboard,
  Sparkles,
  Search,
  FileText,
  UserCheck,
  Send,
  Briefcase,
  Users,
  Building2,
  CheckCircle2,
  Settings,
  Bell,
  Cpu,
  Compass,
  PlusCircle,
  ShieldAlert
} from 'lucide-react';

export const Sidebar = () => {
  const { role, company } = useAuth();
  const { unreadCount } = useNotifications();

  const getLinks = () => {
    if (role === 'STUDENT') {
      return [
        { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { header: 'AI Career Suite' },
        { to: '/student/copilot', label: 'Career Copilot', icon: Sparkles, badge: 'AI' },
        { to: '/student/skill-gap', label: 'Skill Gap Analyzer', icon: Cpu, badge: 'AI' },
        { to: '/student/simulator', label: 'Mock Interviewer', icon: UserCheck, badge: 'AI' },
        { to: '/student/roadmap', label: 'Career Roadmap', icon: Compass, badge: 'AI' },
        { header: 'Internships & Applications' },
        { to: '/internships', label: 'Discover Internships', icon: Search },
        { to: '/student/applications', label: 'My Applications', icon: Send },
        { to: '/student/resumes', label: 'Resumes & ATS', icon: FileText },
        { header: 'Account' },
        { to: '/student/profile', label: 'Profile & Skills', icon: Settings },
        { to: '/student/notifications', label: 'Notifications', icon: Bell, count: unreadCount }
      ];
    }

    if (role === 'COMPANY') {
      return [
        { to: '/company', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { header: 'Recruitment' },
        { to: '/company/internships/new', label: 'Post Internship', icon: PlusCircle },
        { to: '/company/internships', label: 'Manage Postings', icon: Briefcase },
        { to: '/company/applications', label: 'Review Applicants', icon: Users },
        { header: 'Company' },
        { to: '/company/profile', label: 'Company Profile', icon: Building2 },
        { to: '/company/notifications', label: 'Notifications', icon: Bell, count: unreadCount }
      ];
    }

    if (role === 'ADMIN') {
      return [
        { to: '/admin', label: 'Platform Overview', icon: LayoutDashboard, end: true },
        { header: 'Moderation & Governance' },
        { to: '/admin/companies', label: 'Company Approvals', icon: CheckCircle2 },
        { to: '/admin/internships', label: 'Moderate Internships', icon: Briefcase },
        { to: '/admin/users', label: 'Manage Users', icon: Users },
        { to: '/admin/applications', label: 'Application Monitor', icon: Send },
        { to: '/admin/notifications', label: 'System Alerts', icon: Bell, count: unreadCount }
      ];
    }

    return [];
  };

  const links = getLinks();

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1">
        {role === 'COMPANY' && company && (
          <div className="p-3 mb-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</p>
            <p className="text-sm font-bold text-slate-800 truncate">{company.name}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
              company.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {company.verificationStatus}
            </span>
          </div>
        )}

        {links.map((item, idx) => {
          if (item.header) {
            return (
              <div key={idx} className="pt-4 pb-1 px-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {item.header}
                </span>
              </div>
            );
          }

          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 bg-indigo-100/80 rounded-md">
                    {item.badge}
                  </span>
                )}
                {item.count > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-rose-500 rounded-full">
                    {item.count}
                  </span>
                )}
              </div>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
