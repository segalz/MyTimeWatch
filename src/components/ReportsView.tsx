import React, { useState } from 'react';
import {
  calculateDay,
  formatDateDisplay,
  formatDecimalHours,
  formatSeconds,
  getDayStatusInfo,
  HEBREW_WEEKDAYS,
  toLocalDateString,
  toLocalTimeString,
} from '../domain/attendance';
import { StorageService } from '../services/storage';
import { AppSettings, DayRecord, DayStatus, WorkSession } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface ReportsViewProps {
  settings: AppSettings;
  sessions: WorkSession[];
  dayRecords: Record<string, DayRecord>;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onRefreshData: () => void;
  onOpenSessionModal: (session?: WorkSession, dateStr?: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  settings,
  sessions,
  dayRecords,
  selectedDate,
  onSelectDate,
  onRefreshData,
  onOpenSessionModal,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedDateObj = new Date(`${selectedDate}T12:00:00`);
  const dayOfWeek = selectedDateObj.getDay();

  const dayRecord = dayRecords[selectedDate];
  const dayCalc = calculateDay(
    selectedDate,
    sessions,
    dayRecord,
    settings,
    new Date()
  );

  const handlePrevDay = () => {
    const d = new Date(`${selectedDate}T12:00:00`);
    d.setDate(d.getDate() - 1);
    onSelectDate(toLocalDateString(d));
  };

  const handleNextDay = () => {
    const d = new Date(`${selectedDate}T12:00:00`);
    d.setDate(d.getDate() + 1);
    onSelectDate(toLocalDateString(d));
  };

  const handleToday = () => {
    onSelectDate(toLocalDateString(new Date()));
  };

  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const confirmDeleteSession = () => {
    if (sessionToDelete) {
      StorageService.deleteSession(sessionToDelete);
      setSessionToDelete(null);
      setFeedback('המשמרת נמחקה בהצלחה');
      setTimeout(() => setFeedback(null), 2500);
      onRefreshData();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full space-y-4 pb-20 select-none">
      {/* Date Navigation Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={handleNextDay}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
            aria-label="יום הבא"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="text-center space-y-0.5">
            <div className="flex items-center justify-center space-x-1.5 space-x-reverse">
              <span className="text-sm font-extrabold text-slate-800">
                {HEBREW_WEEKDAYS[dayOfWeek]}
              </span>
              {(() => {
                const statusInfo = getDayStatusInfo(dayCalc);
                return (
                  <span className={`px-2 py-0.5 text-3xs font-extrabold rounded-full ${statusInfo.badgeClass}`}>
                    {statusInfo.label}
                  </span>
                );
              })()}
            </div>
            <div className="text-xs font-mono text-slate-500 font-bold">
              {formatDateDisplay(selectedDate)}
            </div>
          </div>

          <button
            onClick={handlePrevDay}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
            aria-label="יום קודם"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center pt-1 border-t border-slate-100">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && onSelectDate(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-mono text-slate-700"
          />
          <button
            onClick={handleToday}
            className="mr-2 text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded bg-blue-50"
          >
            היום
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-2 bg-emerald-100 text-emerald-800 text-xs rounded-lg font-semibold flex items-center justify-center space-x-1 space-x-reverse">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Day Overview Stats */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-2xs text-slate-500 font-medium">שעות עבודה</div>
          <div className="text-base font-bold font-mono text-slate-800 mt-0.5">
            {formatSeconds(dayCalc.workedSeconds + dayCalc.creditedSeconds, false)}
          </div>
          {(dayCalc.workedSeconds > 0 || dayCalc.creditedSeconds > 0) && (
            <div className="text-3xs text-slate-500 font-mono mt-0.5">
              ({formatDecimalHours(dayCalc.workedSeconds + dayCalc.creditedSeconds)})
            </div>
          )}
        </div>

        <div>
          <div className="text-2xs text-slate-500 font-medium">תקן יומי</div>
          <div className="text-base font-bold font-mono text-slate-800 mt-0.5">
            {formatSeconds(dayCalc.requiredSeconds, false)}
          </div>
          {dayCalc.requiredSeconds > 0 && (
            <div className="text-3xs text-slate-500 font-mono mt-0.5">
              ({formatDecimalHours(dayCalc.requiredSeconds)})
            </div>
          )}
        </div>

        <div>
          <div className="text-2xs text-slate-500 font-medium">מאזן היום</div>
          <div
            className={`text-base font-bold font-mono mt-0.5 ${
              dayCalc.attendanceDifferenceSeconds >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatSeconds(dayCalc.attendanceDifferenceSeconds, false, true)}
          </div>
          {dayCalc.attendanceDifferenceSeconds !== 0 && (
            <div
              className={`text-3xs font-mono mt-0.5 ${
                dayCalc.attendanceDifferenceSeconds > 0 ? 'text-emerald-700/80' : 'text-rose-700/80'
              }`}
            >
              ({dayCalc.attendanceDifferenceSeconds > 0 ? '+' : ''}{formatDecimalHours(dayCalc.attendanceDifferenceSeconds)})
            </div>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-800 flex items-center space-x-2 space-x-reverse">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>דיווחי משמרות ({dayCalc.sessions.length})</span>
          </div>

          <button
            onClick={() => onOpenSessionModal(undefined, selectedDate)}
            className="flex items-center space-x-1 space-x-reverse text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>הוסף משמרת</span>
          </button>
        </div>

        {dayCalc.sessions.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            לא נרשמו משמרות עבודה ביום זה.
            <br />
            לחץ על "הוסף משמרת" לדיווח ידני.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {dayCalc.sessions.map((session, idx) => {
              const startTime = toLocalTimeString(new Date(session.startAtUtc), false);
              const endTime = session.endAtUtc
                ? toLocalTimeString(new Date(session.endAtUtc), false)
                : 'פעיל כרגע...';

              const durationSec = Math.max(
                0,
                Math.floor(
                  ((session.endAtUtc ? new Date(session.endAtUtc) : new Date()).getTime() -
                    new Date(session.startAtUtc).getTime()) /
                    1000
                )
              );

              return (
                <div key={session.id} className="p-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 flex items-center space-x-2 space-x-reverse">
                      <span>משמרת #{idx + 1}</span>
                      {session.isManuallyEdited && (
                        <span className="text-3xs bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium">
                          נערך ידנית
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-mono font-bold text-slate-700 dir-ltr mt-0.5">
                      {startTime} - {endTime}
                    </div>

                    {session.note && (
                      <div className="text-2xs text-slate-500 mt-0.5">
                        הערה: {session.note}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="text-left font-mono font-bold text-slate-800 text-sm">
                      <div>{formatSeconds(durationSec, false)}</div>
                      <div className="text-3xs text-slate-500 font-normal">
                        ({formatDecimalHours(durationSec)})
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 space-x-reverse">
                      <button
                        onClick={() => onOpenSessionModal(session, selectedDate)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                        title="ערוך משמרת"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setSessionToDelete(session.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
                        title="מחק משמרת"
                        aria-label="מחק משמרת"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs dir-rtl">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-base text-slate-800">מחיקת דיווח משמרת</h4>
              <p className="text-xs text-slate-500">האם אתה בטוח שברצונך למחוק משמרת זו?</p>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse pt-2">
              <button
                onClick={confirmDeleteSession}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                מחק משמרת
              </button>
              <button
                onClick={() => setSessionToDelete(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
