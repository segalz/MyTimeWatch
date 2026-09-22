import React from 'react';

interface Time24InputProps {
  value: string; // "HH:mm" e.g. "14:30"
  onChange: (val: string) => void;
  disabled?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export const Time24Input: React.FC<Time24InputProps> = ({ value, onChange, disabled }) => {
  const parts = (value || '08:00').split(':');
  const currentHour = parts[0] && HOURS.includes(parts[0]) ? parts[0] : '08';
  const currentMinute = parts[1] && MINUTES.includes(parts[1]) ? parts[1] : '00';

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(`${e.target.value}:${currentMinute}`);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(`${currentHour}:${e.target.value}`);
  };

  return (
    <div
      dir="ltr"
      className={`flex items-center justify-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono ${
        disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'hover:border-slate-300'
      }`}
    >
      <select
        value={currentHour}
        onChange={handleHourChange}
        disabled={disabled}
        className="bg-slate-100 border border-slate-200 font-mono font-bold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer py-1 px-2 rounded-md transition-colors"
        aria-label="שעה (24 שעות)"
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="font-bold text-slate-600 text-lg select-none px-0.5">:</span>
      <select
        value={currentMinute}
        onChange={handleMinuteChange}
        disabled={disabled}
        className="bg-slate-100 border border-slate-200 font-mono font-bold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer py-1 px-2 rounded-md transition-colors"
        aria-label="דקות"
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
};
