import React, { useState } from 'react';
import {
  calculateMonth,
  formatAgorot,
  formatDateDisplay,
  formatDecimalHours,
  formatSeconds,
  getDayStatusInfo,
  HEBREW_WEEKDAYS_SHORT,
  toLocalTimeString,
} from '../domain/attendance';
import { AppSettings, DayRecord, WorkSession } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  DollarSign,
  TrendingUp,
  Clock,
  Edit3,
  Award,
  CalendarCheck,
} from 'lucide-react';

interface MonthlyReportViewProps {
  settings: AppSettings;
  sessions: WorkSession[];
  dayRecords: Record<string, DayRecord>;
  onSelectDayForEdit: (dateStr: string) => void;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  settings,
  sessions,
  dayRecords,
  onSelectDayForEdit,
}) => {
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const yearMonthStr = `${selectedMonthDate.getFullYear()}-${String(
    selectedMonthDate.getMonth() + 1
  ).padStart(2, '0')}`;

  const monthCalc = calculateMonth(
    yearMonthStr,
    sessions,
    dayRecords,
    settings,
    new Date()
  );

  const monthNamesHebrew = [
    'ינואר',
    'פברואר',
    'מרץ',
    'אפריל',
    'מאי',
    'יוני',
    'יולי',
    'אוגוסט',
    'ספטמבר',
    'אוקטובר',
    'נובמבר',
    'דצמבר',
  ];

  const currentMonthTitle = `${monthNamesHebrew[selectedMonthDate.getMonth()]} ${selectedMonthDate.getFullYear()}`;

  // Leave & Absence stats for vacation balance tracking
  const fullVacationDays = monthCalc.days.filter((d) => d.dayRecord?.status === 'VACATION').length;
  const erevChagDays = monthCalc.days.filter((d) => d.dayRecord?.status === 'EVE_OF_HOLIDAY').length;
  const holidayDays = monthCalc.days.filter((d) => d.dayRecord?.status === 'HOLIDAY').length;
  const sickDays = monthCalc.days.filter((d) => d.dayRecord?.status === 'SICK').length;
  const totalVacationDaysDeducted = fullVacationDays + erevChagDays * 0.5;
  const hasLeaveOrSpecialDays = fullVacationDays > 0 || erevChagDays > 0 || holidayDays > 0 || sickDays > 0;

  const handlePrevMonth = () => {
    setSelectedMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setSelectedMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const handleResetCurrentMonth = () => {
    const today = new Date();
    setSelectedMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full space-y-4 pb-20 select-none">
      {/* Month Selector Bar */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
          aria-label="חודש הבא"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={handleResetCurrentMonth}
          className="flex items-center space-x-2 space-x-reverse text-slate-800 hover:text-blue-600 transition-colors"
        >
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          <span className="text-lg font-bold">{currentMonthTitle}</span>
        </button>

        <button
          onClick={handlePrevMonth}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
          aria-label="חודש קודם"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Employee / Report Info Header Card */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
        <div>
          <div className="font-bold text-slate-900 text-sm">סגל צבי (30000241)</div>
          <div className="text-slate-500 text-2xs mt-0.5">חברת נמלי ישראל • מתכנת (עובד חוץ)</div>
        </div>
        <div className="text-left font-mono">
          <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
            {monthCalc.days.filter((d) => d.workedSeconds > 0).length} ימי נוכחות
          </span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Worked Hours */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-500">שעות עבודה בפועל</div>
          <div className="flex items-baseline space-x-1.5 space-x-reverse mt-1">
            <span className="text-xl font-bold font-mono text-slate-800">
              {formatSeconds(monthCalc.workedSeconds + monthCalc.creditedSeconds, false)}
            </span>
            <span className="text-xs font-mono font-semibold text-slate-500">
              ({formatDecimalHours(monthCalc.workedSeconds + monthCalc.creditedSeconds)} שעות)
            </span>
          </div>
          <div className="text-2xs text-slate-400 mt-0.5">
            {monthCalc.requiredSecondsToDate < monthCalc.requiredSeconds ? (
              <span>
                תקן עד כה: {formatSeconds(monthCalc.requiredSecondsToDate, false)} (מלא:{' '}
                {formatSeconds(monthCalc.requiredSeconds, false)})
              </span>
            ) : (
              <span>תקן: {formatSeconds(monthCalc.requiredSeconds, false)}</span>
            )}
          </div>
        </div>

        {/* Monthly Balance */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-500">מאזן נוכחות חודשי</div>
          <div className="flex items-baseline space-x-1.5 space-x-reverse mt-1">
            <span
              className={`text-xl font-bold font-mono ${
                monthCalc.balanceSeconds >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatSeconds(monthCalc.balanceSeconds, false, true)}
            </span>
            <span
              className={`text-xs font-mono font-semibold ${
                monthCalc.balanceSeconds >= 0 ? 'text-emerald-700/80' : 'text-rose-700/80'
              }`}
            >
              ({monthCalc.balanceSeconds >= 0 ? '+' : ''}{formatDecimalHours(monthCalc.balanceSeconds)})
            </span>
          </div>
          <div className="text-2xs text-slate-400 mt-0.5">
            {monthCalc.balanceSeconds >= 0 ? 'עודף שעות' : 'חוסר בשעות'}
          </div>
        </div>

        {/* Overtime Payment */}
        <div className="col-span-2 bg-gradient-to-r from-blue-900 to-slate-900 text-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-blue-200 font-medium">תשלום שעות נוספות</div>
              <div className="text-2xl font-black font-mono text-white mt-0.5">
                {formatAgorot(monthCalc.positivePaymentAgorot)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-800/80 flex items-center justify-center text-blue-200">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="text-2xs text-blue-300/80 mt-2 border-t border-blue-800/80 pt-1.5 flex justify-between">
            <span>תעריף בסיס: {settings.hourlyRate.toFixed(2)} ₪/שעה</span>
            <span>תוספת שעות נוספות, סופי שבוע וחגים</span>
          </div>
        </div>
      </div>

      {/* Detailed Overtime Breakdown Accordion/Box */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5 space-x-reverse">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>פירוט רכיבי תשלום נוספים</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="p-2 bg-slate-50 rounded-lg flex justify-between">
            <span className="text-slate-600">נוספות 125%:</span>
            <span className="font-bold font-mono text-slate-800 text-left">
              {formatSeconds(monthCalc.dailyOvertime125Seconds, false)} ({formatDecimalHours(monthCalc.dailyOvertime125Seconds)}) • {formatAgorot(monthCalc.overtime125Agorot)}
            </span>
          </div>

          <div className="p-2 bg-slate-50 rounded-lg flex justify-between">
            <span className="text-slate-600">נוספות 150%:</span>
            <span className="font-bold font-mono text-slate-800 text-left">
              {formatSeconds(monthCalc.dailyOvertime150Seconds, false)} ({formatDecimalHours(monthCalc.dailyOvertime150Seconds)}) • {formatAgorot(monthCalc.overtime150Agorot)}
            </span>
          </div>

          <div className="p-2 bg-slate-50 rounded-lg flex justify-between">
            <span className="text-slate-600">שישי (100%):</span>
            <span className="font-bold font-mono text-slate-800">
              {formatSeconds(monthCalc.fridayRegularSeconds, false)} ({formatAgorot(monthCalc.fridayAgorot)})
            </span>
          </div>

          <div className="p-2 bg-slate-50 rounded-lg flex justify-between">
            <span className="text-slate-600">שבת (150%):</span>
            <span className="font-bold font-mono text-slate-800">
              {formatSeconds(monthCalc.saturday150Seconds, false)} ({formatAgorot(monthCalc.saturday150Agorot)})
            </span>
          </div>

          {settings.weeklyOvertimeEnabled && (
            <div className="p-2 bg-slate-50 rounded-lg flex justify-between col-span-2">
              <span className="text-slate-600">נוספות שבועיות:</span>
              <span className="font-bold font-mono text-slate-800">
                {formatSeconds(monthCalc.weeklyOvertime125Seconds + monthCalc.weeklyOvertime150Seconds, false)} ({formatAgorot(monthCalc.weeklyOvertimeAgorot)})
              </span>
            </div>
          )}

          <div
            className={`p-2 rounded-lg flex justify-between col-span-2 ${
              monthCalc.deficitSeconds > 0
                ? 'bg-rose-50/80 text-rose-800'
                : 'bg-slate-50 text-slate-600'
            }`}
          >
            <span className="font-semibold">ניכוי חוסר בשעות:</span>
            <span
              className={`font-bold font-mono ${
                monthCalc.deficitSeconds > 0 ? 'text-rose-700' : 'text-slate-700'
              }`}
            >
              {monthCalc.deficitSeconds > 0
                ? `-${formatSeconds(monthCalc.deficitSeconds, false)} (-${formatAgorot(monthCalc.deficitDeductionAgorot)})`
                : '00:00 (0.00 ₪)'}
            </span>
          </div>
        </div>
      </div>

      {/* Leave & Vacation Days Summary (Vacation, Eve of Holiday, Holiday, Sick) */}
      {hasLeaveOrSpecialDays && (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5 space-x-reverse">
            <CalendarCheck className="w-4 h-4 text-teal-600" />
            <span>סיכום ימי חופשה והיעדרויות בחודש</span>
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            {(fullVacationDays > 0 || erevChagDays > 0) && (
              <div className="p-2.5 bg-teal-50 border border-teal-100 rounded-lg col-span-2 flex items-center justify-between">
                <div>
                  <span className="font-bold text-teal-900 block text-xs">
                    סה״כ ניצול ימי חופשה:
                  </span>
                  <span className="text-2xs text-teal-700">
                    {fullVacationDays > 0 ? `${fullVacationDays} ימי חופש מלאים` : ''}
                    {fullVacationDays > 0 && erevChagDays > 0 ? ' + ' : ''}
                    {erevChagDays > 0 ? `${erevChagDays} ערב חג (0.5 יום)` : ''}
                  </span>
                </div>
                <span className="text-sm font-extrabold font-mono text-teal-800 bg-teal-100/70 px-2 py-1 rounded-md">
                  {totalVacationDaysDeducted} ימי חופש
                </span>
              </div>
            )}

            {erevChagDays > 0 && (
              <div className="p-2 bg-teal-50/60 rounded-lg flex justify-between text-teal-900 border border-teal-100/60">
                <span className="text-teal-700">ערבי חג (ללא תקן):</span>
                <span className="font-bold font-mono">{erevChagDays} ימים (0.5 חופש עלי)</span>
              </div>
            )}

            {holidayDays > 0 && (
              <div className="p-2 bg-purple-50 rounded-lg flex justify-between text-purple-900">
                <span className="text-purple-700">ימי חג (ללא תקן):</span>
                <span className="font-bold font-mono">{holidayDays} ימים</span>
              </div>
            )}

            {sickDays > 0 && (
              <div className="p-2 bg-amber-50 rounded-lg flex justify-between text-amber-900">
                <span className="text-amber-700">ימי מחלה:</span>
                <span className="font-bold font-mono">{sickDays} ימים</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Daily Breakdown List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-800 flex items-center space-x-2 space-x-reverse">
            <Clock className="w-4 h-4 text-slate-600" />
            <span>פירוט יומאי חודשי</span>
          </div>
          <span className="text-2xs text-slate-500">לחץ על יום לעריכה רטרואקטיבית</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {monthCalc.days.map((day) => {
            const isWeekend = day.dayOfWeek === 5 || day.dayOfWeek === 6;
            const hasSessions = day.sessions.length > 0;
            const statusInfo = getDayStatusInfo(day);

            let firstIn = '';
            let lastOut = '';

            if (hasSessions) {
              const firstS = day.sessions[0];
              const lastS = day.sessions[day.sessions.length - 1];
              firstIn = toLocalTimeString(new Date(firstS.startAtUtc), false);
              lastOut = lastS.endAtUtc
                ? toLocalTimeString(new Date(lastS.endAtUtc), false)
                : 'פעיל';
            }

            return (
              <div
                key={day.date}
                onClick={() => onSelectDayForEdit(day.date)}
                className={`p-2.5 flex items-center justify-between hover:bg-blue-50/60 cursor-pointer transition-colors ${
                  isWeekend ? 'bg-amber-50/30' : ''
                }`}
              >
                {/* Date & Weekday */}
                <div className="w-24">
                  <div className="font-bold text-slate-800 flex items-center space-x-1 space-x-reverse">
                    <span>{formatDateDisplay(day.date).substring(0, 5)}</span>
                    <span className="text-slate-500 font-normal">
                      {HEBREW_WEEKDAYS_SHORT[day.dayOfWeek]}
                    </span>
                  </div>

                  {(statusInfo.status !== 'WORK' || statusInfo.isMissingReport) && (
                    <span className={`inline-block mt-0.5 px-1.5 py-0.2 text-3xs font-extrabold rounded ${statusInfo.badgeClass}`}>
                      {statusInfo.label}
                    </span>
                  )}
                </div>

                {/* Clock In / Out times */}
                <div className="w-28 text-center font-mono text-slate-600">
                  {hasSessions ? (
                    <div>
                      {firstIn} - {lastOut}
                    </div>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </div>

                {/* Worked vs Standard */}
                <div className="w-20 text-left font-mono">
                  <div className="font-bold text-slate-800">
                    {formatSeconds(day.workedSeconds + day.creditedSeconds, false)}
                  </div>
                  {(day.workedSeconds > 0 || day.creditedSeconds > 0) && (
                    <div className="text-3xs text-slate-400">
                      {formatDecimalHours(day.workedSeconds + day.creditedSeconds)} שעות
                    </div>
                  )}
                  {day.attendanceDifferenceSeconds !== 0 && (
                    <div
                      className={`text-3xs font-semibold ${
                        day.attendanceDifferenceSeconds > 0
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {formatSeconds(day.attendanceDifferenceSeconds, false, true)}
                    </div>
                  )}
                </div>

                {/* Edit Icon indicator */}
                <div className="w-6 flex justify-end text-slate-400">
                  <Edit3 className="w-3.5 h-3.5 hover:text-blue-600" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
