
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-primary"></div>
        <p className="mt-4 text-slate-600 font-medium">Analyzing sentiment...</p>
        <p className="mt-2 text-sm text-slate-500">The AI is thinking. This might take a moment.</p>
    </div>
  );
};
