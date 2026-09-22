import React, { useEffect, useState } from 'react';
import { formatDateDisplay, toLocalDateString, toLocalTimeString } from '../domain/attendance';

export const LiveClock: React.FC = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = formatDateDisplay(toLocalDateString(now));
  const timeStr = toLocalTimeString(now, true);

  return (
    <div className="w-full py-2.5 border-y border-slate-200/80 my-2">
      <div className="max-w-md mx-auto grid grid-cols-2 text-center items-center px-4">
        {/* Date Column */}
        <div className="border-l border-slate-200/80 pl-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            תאריך
          </div>
          <div className="text-xl font-bold text-slate-800 dir-ltr font-mono mt-0.5">
            {dateStr}
          </div>
        </div>

        {/* Time Column */}
        <div className="pr-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            זמן
          </div>
          <div className="text-xl font-bold text-slate-800 dir-ltr font-mono mt-0.5">
            {timeStr}
          </div>
        </div>
      </div>
    </div>
  );
};
