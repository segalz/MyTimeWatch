import React, { useEffect, useState } from 'react';
import {
  calculateDay,
  calculateMonth,
  formatAgorot,
  formatDecimalHours,
  formatSeconds,
  getSessionDurationSeconds,
  toLocalDateString,
  toLocalTimeString,
} from '../domain/attendance';
import { StorageService } from '../services/storage';
import { AppSettings, AutoClockOutConfig, DayRecord, WorkSession } from '../types';
import { CircularButton } from './CircularButton';
import { LiveClock } from './LiveClock';
import { AutoClockOutModal } from './AutoClockOutModal';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Target,
  ShieldAlert,
  Hourglass,
  Sparkles,
} from 'lucide-react';

interface HomeViewProps {
  settings: AppSettings;
  sessions: WorkSession[];
  dayRecords: Record<string, DayRecord>;
  onRefreshData: () => void;
  onNavigateToReports: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  settings,
  sessions,
  dayRecords,
  onRefreshData,
  onNavigateToReports,
}) => {
  const [now, setNow] = useState(new Date());
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(
    null
  );
  const [showAutoClockOutModal, setShowAutoClockOutModal] = useState(false);
  const [autoClockOutConfig, setAutoClockOutConfigState] = useState<AutoClockOutConfig | null>(() =>
    StorageService.getAutoClockOutConfig()
  );

  // Live ticker interval every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = toLocalDateString(now);
  const currentMonthStr = todayStr.substring(0, 7);

  // Active session check
  const activeSession = sessions.find((s) => s.endAtUtc === null);
  const isClockedIn = !!activeSession;

  // Today sessions
  const todaySessions = sessions.filter((s) => s.localWorkDate === todayStr);
  const lastSessionToday = todaySessions[todaySessions.length - 1];

  let lastClockInTimeString = '';
  let activeSessionDurationSeconds = 0;

  if (activeSession) {
    const startObj = new Date(activeSession.startAtUtc);
    lastClockInTimeString = toLocalTimeString(startObj, false);
    activeSessionDurationSeconds = Math.max(
      0,
      Math.floor((now.getTime() - startObj.getTime()) / 1000)
    );
  } else if (lastSessionToday) {
    const startObj = new Date(lastSessionToday.startAtUtc);
    lastClockInTimeString = toLocalTimeString(startObj, false);
  }

  // Calculate prior worked seconds today from completed shifts
  const priorWorkedSecondsToday = todaySessions
    .filter((s) => s.endAtUtc !== null)
    .reduce((acc, s) => acc + getSessionDurationSeconds(s, now), 0);

  // Auto Clock Out ETA calculation
  let autoClockOutEta = '';
  if (autoClockOutConfig?.targetHours && activeSession) {
    const targetSeconds = autoClockOutConfig.targetHours * 3600;
    const remainingSeconds = Math.max(0, targetSeconds - priorWorkedSecondsToday);
    if (remainingSeconds > 0) {
      const activeStartMs = new Date(activeSession.startAtUtc).getTime();
      const targetExitMs = activeStartMs + remainingSeconds * 1000;
      autoClockOutEta = toLocalTimeString(new Date(targetExitMs), false);
    }
  }

  // Trigger auto clock-out when cumulative hours in day reach selected target
  useEffect(() => {
    if (!activeSession || !autoClockOutConfig?.targetHours) return;

    const targetSeconds = autoClockOutConfig.targetHours * 3600;
    const remainingSeconds = Math.max(0, targetSeconds - priorWorkedSecondsToday);
    const activeStartMs = new Date(activeSession.startAtUtc).getTime();
    const targetExitMs = activeStartMs + remainingSeconds * 1000;

    if (now.getTime() >= targetExitMs) {
      // Calculate exact exit timestamp to perfectly match target hours
      const exactEndAtUtc = new Date(targetExitMs).toISOString();
      const note = `יציאה אוטומטית בהשלמת ${autoClockOutConfig.targetHours} שעות ביממה`;

      const result = StorageService.clockOut(note, exactEndAtUtc);
      if (result.success) {
        StorageService.clearAutoClockOut();
        setAutoClockOutConfigState(null);
        setToastMessage({
          text: `בוצעה יציאה אוטומטית בדיוק בהשלמת ${autoClockOutConfig.targetHours} שעות ביממה!`,
        });
        onRefreshData();
      }
    }
  }, [now, activeSession, autoClockOutConfig, priorWorkedSecondsToday, onRefreshData]);

  // Calculate today metrics (cumulative for the 24h calendar day)
  const dayRecordToday = dayRecords[todayStr];
  const todayCalc = calculateDay(todayStr, sessions, dayRecordToday, settings, now);

  // Calculate current month metrics
  const monthCalc = calculateMonth(currentMonthStr, sessions, dayRecords, settings, now);

  // Handle Clock In
  const handleClockIn = () => {
    const result = StorageService.clockIn();
    if (result.success) {
      setToastMessage({ text: 'כניסה נרשמה בהצלחה!' });
      onRefreshData();
    } else {
      setToastMessage({ text: result.error || 'שגיאה בביצוע כניסה', isError: true });
    }
  };

  // Handle Clock Out
  const handleClockOut = () => {
    const result = StorageService.clockOut();
    if (result.success) {
      // Clear auto clock-out when manually clocking out
      StorageService.clearAutoClockOut();
      setAutoClockOutConfigState(null);
      setToastMessage({ text: 'יציאה נרשמה בהצלחה!' });
      onRefreshData();
    } else {
      setToastMessage({ text: result.error || 'שגיאה בביצוע יציאה', isError: true });
    }
  };

  // Handle auto clock-out target selection
  const handleSelectAutoClockOut = (hours: number | null) => {
    if (hours === null) {
      StorageService.clearAutoClockOut();
      setAutoClockOutConfigState(null);
      setToastMessage({ text: 'יציאה אוטומטית בוטלה' });
    } else {
      const config: AutoClockOutConfig = {
        targetHours: hours,
        localDate: todayStr,
      };
      StorageService.setAutoClockOutConfig(config);
      setAutoClockOutConfigState(config);
      setToastMessage({
        text: `הוגדרה יציאה אוטומטית בהשלמת ${hours} שעות ביממה`,
      });
    }
  };

  // Auto clear toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Day calculations and target times
  const dayOfWeek = now.getDay();
  const totalWorkedTodaySoFar = todayCalc.workedSeconds + todayCalc.creditedSeconds;
  const requiredSeconds = todayCalc.requiredSeconds;
  const elevenHoursSeconds = 11 * 3600; // 39,600s

  const isStandardCompleted = requiredSeconds > 0 && totalWorkedTodaySoFar >= requiredSeconds;
  const isElevenHoursReached = totalWorkedTodaySoFar >= elevenHoursSeconds;

  // Remaining seconds to complete standard
  const remainingToStandardSeconds = Math.max(0, requiredSeconds - totalWorkedTodaySoFar);
  const standardEtaDate = new Date(now.getTime() + remainingToStandardSeconds * 1000);
  const standardEtaIsTomorrow = standardEtaDate.getDate() !== now.getDate();
  const standardEtaTimeStr = `${toLocalTimeString(standardEtaDate, false)}${
    standardEtaIsTomorrow ? ' (מחר)' : ''
  }`;

  // Remaining seconds to reach 11 hours maximum daily cap
  const remainingTo11HoursSeconds = Math.max(0, elevenHoursSeconds - totalWorkedTodaySoFar);
  const elevenHoursEtaDate = new Date(now.getTime() + remainingTo11HoursSeconds * 1000);
  const elevenEtaIsTomorrow = elevenHoursEtaDate.getDate() !== now.getDate();
  const elevenHoursEtaTimeStr = `${toLocalTimeString(elevenHoursEtaDate, false)}${
    eleEtaTomorrow(elevenHoursEtaDate, now) ? ' (מחר)' : ''
  }`;

  function eleEtaTomorrow(target: Date, current: Date) {
    return target.getDate() !== current.getDate();
  }

  // Format daily standard text
  let dayStandardText = '';
  if (dayOfWeek === 6) {
    dayStandardText = 'שבת (מנוחה שבועית)';
  } else if (dayOfWeek === 5) {
    dayStandardText = 'שישי (ללא תקן חובה)';
  } else {
    dayStandardText = `תקן יומי: ${formatSeconds(todayCalc.requiredSeconds, false)}`;
  }

  // Format daily deficit or surplus text (ALWAYS strictly per 24h day/יממה)
  let dailyDiffText = '';
  if (dayOfWeek === 6) {
    dailyDiffText = `עבודה ביממה: ${formatSeconds(todayCalc.workedSeconds, true)} ב־150%`;
  } else if (dayOfWeek === 5) {
    dailyDiffText = `עבודה ביממה: ${formatSeconds(todayCalc.workedSeconds, true)}`;
  } else {
    if (todayCalc.attendanceDifferenceSeconds < 0) {
      dailyDiffText = `חסר לתקן ביממה: ${formatSeconds(
        Math.abs(todayCalc.attendanceDifferenceSeconds),
        true
      )}`;
    } else {
      dailyDiffText = `שעות נוספות ביממה: +${formatSeconds(
        todayCalc.attendanceDifferenceSeconds,
        true
      )}`;
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-4 max-w-md mx-auto w-full select-none">
      {/* Top Clock Row */}
      <LiveClock />

      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`my-2 p-2.5 rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 space-x-reverse transition-all ${
            toastMessage.isError
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          }`}
        >
          {toastMessage.isError ? (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Live Information Area - Single unified card without duplicate text */}
      <div className="my-2.5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
        {/* Row 1: Session Status & Total Work Today */}
        {isClockedIn ? (
          <div className="text-center space-y-1">
            <div className="text-sm font-medium text-slate-700 flex items-center justify-center space-x-2 space-x-reverse flex-wrap">
              <span>כניסה אחרונה: {lastClockInTimeString}</span>
              <span className="text-slate-300">|</span>
              <span className="font-semibold text-slate-800">
                במשמרת:{' '}
                <span className="font-mono text-blue-700 font-bold">
                  {formatSeconds(activeSessionDurationSeconds, true)}
                </span>
              </span>
            </div>
            {todaySessions.length > 1 && (
              <div className="text-xs font-semibold text-slate-600 bg-white/90 py-0.5 px-2.5 rounded-md border border-slate-200/60 inline-block">
                סה״כ עבודה מצטבר ביממה:{' '}
                <span className="font-mono font-bold text-slate-900">
                  {formatSeconds(todayCalc.workedSeconds, true)}
                </span>{' '}
                ({todaySessions.length} משמרות היום)
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-sm font-medium text-slate-600">
            {todaySessions.length > 0 ? (
              <div>
                <span>
                  סה״כ עבודה היום ביממה:{' '}
                  <span className="font-mono font-bold text-slate-900">
                    {formatSeconds(todayCalc.workedSeconds, true)}
                  </span>
                  <span className="font-mono text-xs text-slate-500 font-semibold mr-1">
                    ({formatDecimalHours(todayCalc.workedSeconds)} שעות)
                  </span>
                </span>
                {todaySessions.length > 1 && (
                  <span className="text-xs text-slate-400 block mt-0.5">
                    ({todaySessions.length} משמרות נרשמו היום)
                  </span>
                )}
              </div>
            ) : (
              <span>טרם בוצעה כניסה היום</span>
            )}
          </div>
        )}

        {/* Row 2: Standard target or overtime status (No duplication!) */}
        <div className="pt-2 border-t border-slate-200/70">
          {isClockedIn ? (
            requiredSeconds > 0 ? (
              !isStandardCompleted ? (
                /* Clocked in & standard not yet reached: show standard completion ETA directly */
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between bg-blue-50/90 py-1.5 px-3 rounded-lg border border-blue-200/80">
                    <div className="flex items-center space-x-1.5 space-x-reverse text-blue-950 font-bold text-xs">
                      <Target className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>שעת סיום התקן ({formatSeconds(requiredSeconds, false)}):</span>
                    </div>
                    <div className="text-left flex items-baseline space-x-1.5 space-x-reverse">
                      <span className="font-mono text-base font-black text-blue-700 dir-ltr">
                        {standardEtaTimeStr}
                      </span>
                      <span className="text-3xs text-blue-800 font-medium">
                        (נותרו {formatSeconds(remainingToStandardSeconds, false)})
                      </span>
                    </div>
                  </div>

                  {/* 11 hours cap line */}
                  <div className="flex items-center justify-between px-2 text-2xs text-slate-600">
                    <div className="flex items-center space-x-1.5 space-x-reverse font-medium">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>הגעה ל-11 שעות:</span>
                    </div>
                    <span className="font-mono font-bold text-amber-800 dir-ltr">
                      {elevenHoursEtaTimeStr}
                    </span>
                  </div>
                </div>
              ) : (
                /* Clocked in & standard completed: show overtime & 11h cap */
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between bg-emerald-50/90 py-1.5 px-3 rounded-lg border border-emerald-200">
                    <div className="flex items-center space-x-1.5 space-x-reverse text-emerald-900 font-bold text-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>שעות נוספות ביממה:</span>
                    </div>
                    <span className="font-mono text-base font-black text-emerald-700 dir-ltr">
                      +{formatSeconds(todayCalc.surplusSeconds, true)}
                    </span>
                  </div>

                  {/* 11 hours cap line */}
                  <div
                    className={`flex items-center justify-between px-2 text-2xs rounded-md py-0.5 ${
                      isElevenHoursReached
                        ? 'bg-rose-100 text-rose-800 font-bold'
                        : 'text-amber-900 bg-amber-50/60 font-medium'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 space-x-reverse">
                      <ShieldAlert
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isElevenHoursReached ? 'text-rose-600' : 'text-amber-600'
                        }`}
                      />
                      <span>
                        {isElevenHoursReached ? 'הגעת לתקרת 11 שעות היום!' : 'תקרת 11 שעות עבודה:'}
                      </span>
                    </div>
                    {!isElevenHoursReached && (
                      <span className="font-mono font-bold text-amber-800 dir-ltr">
                        {elevenHoursEtaTimeStr} (בעוד {formatSeconds(remainingTo11HoursSeconds, false)})
                      </span>
                    )}
                  </div>
                </div>
              )
            ) : (
              /* Weekend / No standard */
              <div className="flex items-center justify-between bg-amber-50/80 py-1.5 px-3 rounded-lg border border-amber-200 text-xs">
                <span className="font-semibold text-amber-950">{dayStandardText}</span>
                <span className="font-mono font-bold text-amber-900">
                  {dailyDiffText} | 11 שעות: {elevenHoursEtaTimeStr}
                </span>
              </div>
            )
          ) : (
            /* Not clocked in */
            <div className="text-center">
              <div className="text-sm font-bold text-slate-900 flex items-center justify-center space-x-2 space-x-reverse flex-wrap">
                <span>{dayStandardText}</span>
                <span className="text-slate-300 font-normal">|</span>
                <span
                  className={
                    todayCalc.attendanceDifferenceSeconds >= 0 ? 'text-emerald-700' : 'text-slate-700'
                  }
                >
                  {dailyDiffText}
                </span>
              </div>
              {todaySessions.length === 0 && requiredSeconds > 0 && (
                <div className="text-3xs text-slate-400 mt-0.5">
                  שעת סיום התקן והגעה ל-11 שעות יחושבו אוטומטית עם הכניסה
                </div>
              )}
            </div>
          )}
        </div>

        {/* Row 3: Monthly balance & Expected payment adjustment */}
        <div className="text-sm font-extrabold text-slate-800 flex items-center justify-center space-x-4 space-x-reverse pt-2 border-t border-slate-200/80">
          <div className="text-center">
            <span className="text-xs text-slate-600 block mb-0.5">מאזן החודש נכון להיום:</span>
            <div className="flex items-baseline justify-center space-x-1 space-x-reverse">
              <span
                className={`font-mono text-base ${
                  monthCalc.balanceSeconds >= 0 ? 'text-emerald-600' : 'text-rose-600 font-bold'
                }`}
              >
                {formatSeconds(monthCalc.balanceSeconds, false, true)}
              </span>
              <span
                className={`font-mono text-2xs ${
                  monthCalc.balanceSeconds >= 0 ? 'text-emerald-700/80' : 'text-rose-700/80'
                }`}
              >
                ({monthCalc.balanceSeconds >= 0 ? '+' : ''}{formatDecimalHours(monthCalc.balanceSeconds)})
              </span>
            </div>
          </div>

          <span className="text-slate-300 font-normal self-center">|</span>

          <div className="text-center">
            <span className="text-xs text-slate-600 block mb-0.5">תשלום שעות נוספות:</span>
            <span
              className={`font-mono text-base block whitespace-nowrap ${
                monthCalc.positivePaymentAgorot > 0 ? 'text-emerald-700 font-bold' : 'text-slate-900'
              }`}
            >
              {formatAgorot(monthCalc.positivePaymentAgorot)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Section (Clock Out on Left, Clock In on Right for RTL) */}
      <div className="my-3 flex flex-col items-center justify-center">
        <div className="flex items-center justify-center space-x-5 space-x-reverse">
          {/* Red Clock Out button */}
          <CircularButton
            type="clockOut"
            label="יציאה"
            disabled={!isClockedIn}
            onClick={handleClockOut}
          />

          {/* Green Clock In button */}
          <CircularButton
            type="clockIn"
            label="כניסה"
            disabled={isClockedIn}
            onClick={handleClockIn}
          />
        </div>

        {/* Helper Button (Auto Clock Out) placed right at the yellow marking */}
        <div className="mt-2 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setShowAutoClockOutModal(true)}
            className={`flex items-center space-x-2 space-x-reverse py-1.5 px-3.5 rounded-full border transition-all shadow-xs ${
              autoClockOutConfig?.targetHours
                ? 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-400/20'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
            }`}
            title="סגירת שעון אוטומטית לפי סך שעות ביממה"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                autoClockOutConfig?.targetHours
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-blue-600'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold">
              {autoClockOutConfig?.targetHours
                ? `יציאה אוטומטית: ${autoClockOutConfig.targetHours} שעות${autoClockOutEta ? ` (${autoClockOutEta})` : ''}`
                : 'יציאה אוטומטית'}
            </span>
            {autoClockOutConfig?.targetHours && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Today's Shifts Summary Box */}
      <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
          <div className="flex items-center space-x-2 space-x-reverse text-sm font-bold text-slate-800">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>משמרות היום ({todaySessions.length})</span>
          </div>
          <button
            onClick={onNavigateToReports}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1 space-x-reverse"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>עריכת משמרות</span>
          </button>
        </div>

        {todaySessions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-2">אין דיווחי שעות שנרשמו היום</p>
        ) : (
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {todaySessions.map((s, idx) => {
              const startTime = toLocalTimeString(new Date(s.startAtUtc), false);
              const endTime = s.endAtUtc
                ? toLocalTimeString(new Date(s.endAtUtc), false)
                : 'פעיל...';

              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between text-xs p-1.5 bg-slate-50 rounded-md border border-slate-100"
                >
                  <span className="font-semibold text-slate-700">משמרת #{idx + 1}</span>
                  <span className="font-mono text-slate-800 font-bold dir-ltr">
                    {startTime} - {endTime}
                  </span>
                  <span className="text-slate-500 font-mono text-xs">
                    {formatSeconds(
                      getSessionDurationSeconds(s, now),
                      false
                    )}{' '}
                    ({formatDecimalHours(getSessionDurationSeconds(s, now))})
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Auto Clock Out Modal */}
      <AutoClockOutModal
        isOpen={showAutoClockOutModal}
        onClose={() => setShowAutoClockOutModal(false)}
        currentTargetHours={autoClockOutConfig?.targetHours ?? null}
        onSelectTargetHours={handleSelectAutoClockOut}
        isClockedIn={isClockedIn}
        activeSession={activeSession ?? null}
        priorWorkedSecondsToday={priorWorkedSecondsToday}
      />
    </div>
  );
};
