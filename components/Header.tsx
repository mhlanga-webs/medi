import React from 'react';
import { Logo } from './Logo';

interface HeaderProps {
  onLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  return (
    <header className="bg-slate-900 shadow-lg w-full sticky top-0 z-10">
      <div className="container mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
        <Logo onClick={onLogoClick} />
        <p className="text-sm italic text-slate-400">
          turning emotions into insights
        </p>
      </div>
    </header>
  );
};
