import React from 'react';
import { Home, Calendar, ClipboardList, Settings } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'בית', icon: Home },
    { id: 'monthly', label: 'דוח חודשי', icon: Calendar },
    { id: 'reports', label: 'דיווחים', icon: ClipboardList },
    { id: 'settings', label: 'הגדרות', icon: Settings },
  ];

  return (
    <nav className="w-full bg-slate-50 border-t border-slate-200/80 py-3 px-2 sticky bottom-0 z-20">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1 text-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center justify-center group focus:outline-hidden"
            >
              {/* Double ring circular button matching reference design */}
              <div
                className={`w-13 h-13 rounded-full flex items-center justify-center p-0.5 transition-all duration-200 ${
                  isActive
                    ? 'border-2 border-blue-600 bg-blue-50/50 shadow-xs scale-105'
                    : 'border-2 border-slate-300 hover:border-slate-400 bg-white'
                }`}
              >
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>
              </div>

              {/* Label */}
              <span
                className={`text-xs font-semibold mt-1.5 transition-colors ${
                  isActive ? 'text-blue-700 font-bold' : 'text-slate-600 group-hover:text-slate-900'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
