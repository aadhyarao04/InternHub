import React from 'react';

const BADGE_VARIANTS = {
  // Statuses
  APPLIED: 'bg-blue-50 text-blue-700 border-blue-200',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  SHORTLISTED: 'bg-purple-50 text-purple-700 border-purple-200',
  INTERVIEW: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  SELECTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  WITHDRAWN: 'bg-slate-100 text-slate-600 border-slate-200',

  // Verification
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',

  // Work Mode
  REMOTE: 'bg-teal-50 text-teal-700 border-teal-200',
  HYBRID: 'bg-sky-50 text-sky-700 border-sky-200',
  ONSITE: 'bg-orange-50 text-orange-700 border-orange-200',

  // Roles
  STUDENT: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPANY: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  ADMIN: 'bg-rose-50 text-rose-700 border-rose-200',

  // Default
  default: 'bg-slate-100 text-slate-700 border-slate-200'
};

export const Badge = ({ children, variant, size = 'sm', className = '' }) => {
  const normalizedKey = variant ? String(variant).toUpperCase() : 'DEFAULT';
  const colorClass = BADGE_VARIANTS[normalizedKey] || BADGE_VARIANTS.default;
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${colorClass} ${sizeClass} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
