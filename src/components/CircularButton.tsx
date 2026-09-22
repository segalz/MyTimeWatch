import React from 'react';
import { motion } from 'motion/react';

interface CircularButtonProps {
  type: 'clockIn' | 'clockOut';
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export const CircularButton: React.FC<CircularButtonProps> = ({
  type,
  label,
  disabled = false,
  onClick,
}) => {
  const isClockIn = type === 'clockIn';

  // Styling based on type
  const activeColorClasses = isClockIn
    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-emerald-500 border-4 border-emerald-400/80'
    : 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:from-rose-400 hover:to-red-500 border-4 border-red-400/80';

  const disabledColorClasses =
    'bg-slate-200 text-slate-400 shadow-none border-4 border-slate-300/60 cursor-not-allowed opacity-70';

  const ringColorClasses = isClockIn
    ? 'border-2 border-emerald-500/40'
    : 'border-2 border-red-500/40';

  return (
    <div className="relative p-1 flex items-center justify-center">
      {/* Outer subtle decorative ring matching reference image */}
      <div
        className={`w-26 h-26 sm:w-28 sm:h-28 rounded-full flex items-center justify-center p-1 transition-colors ${
          disabled ? 'border-2 border-slate-200' : ringColorClasses
        }`}
      >
        {/* Inner ring */}
        <div className="w-full h-full rounded-full border border-white/60 p-0.5 flex items-center justify-center">
          <motion.button
            whileTap={disabled ? undefined : { scale: 0.94 }}
            whileHover={disabled ? undefined : { scale: 1.03 }}
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-200 select-none ${
              disabled ? disabledColorClasses : activeColorClasses
            }`}
          >
            <span className="text-xl font-extrabold tracking-wide drop-shadow-xs">
              {label}
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
