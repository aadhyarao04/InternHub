import React from 'react';

export const LoadingSpinner = ({ text = 'Loading...', fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-100 animate-spin border-t-indigo-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-indigo-600 rounded-full animate-ping"></div>
        </div>
      </div>
      {text && <p className="text-sm font-medium text-slate-500 animate-pulse">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
