import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t bg-white border-slate-200">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-7 h-7 text-white rounded-lg bg-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800">InternHub AI</span>
            <span className="text-xs text-slate-400">| Discover opportunities. Build skills. Launch your career.</span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-slate-500">
            <Link to="/internships" className="hover:text-indigo-600 transition-colors">Internships</Link>
            <Link to="/login" className="hover:text-indigo-600 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-indigo-600 transition-colors">Register</Link>
          </div>
          <div className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} InternHub AI Platform.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
