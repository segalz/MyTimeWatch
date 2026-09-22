import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Check, X, Timer, AlertCircle } from 'lucide-react';
import { WorkSession } from '../types';
import { formatSeconds, toLocalTimeString } from '../domain/attendance';

interface AutoClockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTargetHours: number | null;
  onSelectTargetHours: (hours: number | null) => void;
  isClockedIn: boolean;
  activeSession: WorkSession | null;
  priorWorkedSecondsToday: number;
}

const TARGET_OPTIONS: { hours: number; title: string; subtitle?: string }[] = [
  { hours: 8.5, title: '8.5 שעות', subtitle: '08:30 עבודה יומית' },
  { hours: 9, title: '9.0 שעות', subtitle: '09:00 - השלמת תקן מלא' },
  { hours: 10, title: '10.0 שעות', subtitle: '10:00 - שעה נוספת' },
  { hours: 11, title: '11.0 שעות', subtitle: '11:00 - סף 11 שעות' },
  { hours: 12, title: '12.0 שעות', subtitle: '12:00 - מקסימום שעות ביממה' },
];

export const AutoClockOutModal: React.FC<AutoClockOutModalProps> = ({
  isOpen,
  onClose,
  currentTargetHours,
  onSelectTargetHours,
  isClockedIn,
  activeSession,
  priorWorkedSecondsToday,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.16 }}
          className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">יציאה אוטומטית</h3>
                <p className="text-2xs text-slate-500">
                  סגירת שעון בדיוק בהשלמת שעות ביממה
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info note */}
          <div className="p-3.5 bg-blue-50/70 border-b border-blue-100 text-2xs text-blue-900 flex items-start space-x-2 space-x-reverse">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              השעון ייסגר אוטומטית ברגע שסך כל שעות העבודה ביממה (בכל המשמרות יחד) יגיע
              ליעד הנבחר. <span className="font-bold">שעת היציאה תיקבע בדיוק מושלם.</span>
            </div>
          </div>

          {/* Status badge if clocked in */}
          {isClockedIn && activeSession && (
            <div className="px-4 pt-3 text-xs text-slate-600 flex items-center justify-between">
              <span>בוצע ביממה לפני משמרת זו:</span>
              <span className="font-mono font-bold text-slate-800">
                {formatSeconds(priorWorkedSecondsToday, false)}
              </span>
            </div>
          )}

          {/* Options List */}
          <div className="p-4 space-y-2">
            {TARGET_OPTIONS.map((opt) => {
              const isSelected = currentTargetHours === opt.hours;
              const targetSeconds = opt.hours * 3600;
              const secondsNeeded = Math.max(0, targetSeconds - priorWorkedSecondsToday);

              let etaTimeStr = '';
              let isAlreadyCompleted = false;

              if (isClockedIn && activeSession) {
                if (secondsNeeded <= 0) {
                  isAlreadyCompleted = true;
                } else {
                  const activeStartMs = new Date(activeSession.startAtUtc).getTime();
                  const targetExitMs = activeStartMs + secondsNeeded * 1000;
                  etaTimeStr = toLocalTimeString(new Date(targetExitMs), false);
                }
              }

              return (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => {
                    onSelectTargetHours(opt.hours);
                    onClose();
                  }}
                  disabled={isAlreadyCompleted}
                  className={`w-full p-2.5 rounded-xl border text-right transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : isAlreadyCompleted
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 space-x-reverse">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-extrabold text-xs ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span className="font-bold text-sm">{opt.title}</span>
                        {opt.subtitle && (
                          <span
                            className={`text-2xs ${
                              isSelected ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            ({opt.subtitle})
                          </span>
                        )}
                      </div>
                      {isAlreadyCompleted ? (
                        <span className="text-3xs text-slate-400 block">
                          היעד כבר הושג ביממה זו
                        </span>
                      ) : etaTimeStr ? (
                        <span
                          className={`text-2xs font-mono font-bold block ${
                            isSelected ? 'text-blue-100' : 'text-blue-600'
                          }`}
                        >
                          יציאה מתוכננת בדיוק ב: {etaTimeStr}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="shrink-0 mr-2">
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-white text-blue-600 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {currentTargetHours !== null ? (
              <button
                type="button"
                onClick={() => {
                  onSelectTargetHours(null);
                  onClose();
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 py-1.5 px-3 rounded-lg hover:bg-rose-50 transition-colors"
              >
                בטל יציאה אוטומטית
              </button>
            ) : (
              <span className="text-2xs text-slate-400">לא הוגדרה יציאה אוטומטית</span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 py-1.5 px-4 rounded-lg transition-colors"
            >
              סגור
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
