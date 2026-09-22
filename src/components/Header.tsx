import React from 'react';
import { User, Menu, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onOpenDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDrawer }) => {
  return (
    <header className="w-full bg-slate-50 pt-3 pb-2 px-4 border-b border-slate-200/60 sticky top-0 z-20">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Profile Button (Left) */}
        <button
          onClick={onOpenDrawer}
          className="p-2 text-slate-700 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-200/50"
          aria-label="פרופיל"
        >
          <User className="w-6 h-6 stroke-[1.8]" />
        </button>

        {/* Center Checkmark Logo */}
        <div className="flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-500/40 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 stroke-[2.2]" />
          </div>
        </div>

        {/* Hamburger Menu (Right) */}
        <button
          onClick={onOpenDrawer}
          className="p-2 text-slate-700 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-200/50"
          aria-label="תפריט"
        >
          <Menu className="w-6 h-6 stroke-[1.8]" />
        </button>
      </div>

      {/* Main Titles */}
      <div className="max-w-md mx-auto text-center mt-2 mb-1">
        <div className="flex items-center justify-center space-x-2 space-x-reverse">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            WorkLog Pro
          </h1>
          <span className="text-3xs bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full shadow-xs">
            v2.0
          </span>
        </div>
        <p className="text-sm font-semibold text-emerald-700 mt-0.5">
          דיווח נוכחות ומעקב שעות אישי
        </p>
      </div>
    </header>
  );
};
