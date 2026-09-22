import {
  AppSettings,
  DayCalculation,
  DayRecord,
  DayStatus,
  MonthCalculation,
  WeekCalculation,
  WorkSession,
} from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  hourlyRate: 50.0,
  overtime125Multiplier: 1.25,
  overtime150Multiplier: 1.50,
  fridayMultiplier: 1.0,
  saturdayMultiplier: 1.50,
  weeklyOvertimeEnabled: false,
  weeklyOvertimeThresholdSeconds: 42 * 3600, // 42 hours
  weeklyFirstTierSeconds: 2 * 3600, // 2 hours
  showSecondsInLiveTimer: true,
  schedule: {
    0: { requiredSeconds: 9 * 3600 }, // Sun
    1: { requiredSeconds: 9 * 3600 }, // Mon
    2: { requiredSeconds: 9 * 3600 }, // Tue
    3: { requiredSeconds: 9 * 3600 }, // Wed
    4: { requiredSeconds: 8.5 * 3600 }, // Thu
    5: { requiredSeconds: 0 }, // Fri
    6: { requiredSeconds: 0, isRestDay: true }, // Sat
  },
};

export const HEBREW_WEEKDAYS = [
  'יום ראשון',
  'יום שני',
  'יום שלישי',
  'יום רביעי',
  'יום חמישי',
  'יום שישי',
  'יום שבת',
];

export const HEBREW_WEEKDAYS_SHORT = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

/**
 * Formats seconds into HH:MM or HH:MM:SS
 */
export function formatSeconds(
  totalSeconds: number,
  includeSeconds = false,
  showSign = false
): string {
  const isNegative = totalSeconds < 0;
  const absSec = Math.abs(Math.round(totalSeconds));
  
  const hours = Math.floor(absSec / 3600);
  const minutes = Math.floor((absSec % 3600) / 60);
  const seconds = absSec % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  const base = includeSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
  
  if (showSign) {
    if (isNegative) return `-${base}`;
    if (totalSeconds > 0) return `+${base}`;
  } else if (isNegative) {
    return `-${base}`;
  }

  return base;
}

/**
 * Converts seconds to decimal hours string formatted with 2 decimal places (e.g. 121.78)
 */
export function formatDecimalHours(totalSeconds: number): string {
  const hours = totalSeconds / 3600;
  return hours.toFixed(2);
}

/**
 * Converts Agorot integer to Shekels formatted string e.g. "900.75 ₪"
 */
export function formatAgorot(
  agorot: number,
  showCurrency = true
): string {
  const shekels = agorot / 100;
  const formatted = shekels.toLocaleString('he-IL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return showCurrency ? `${formatted} ₪` : formatted;
}

/**
 * Format ISO or YYYY-MM-DD date string to DD-MM-YYYY
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

/**
 * Returns YYYY-MM-DD for a Date object in local time
 */
export function toLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns HH:mm:ss string for a Date
 */
export function toLocalTimeString(date: Date = new Date(), includeSeconds = true): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return includeSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
}

/**
 * Calculates duration in seconds between two ISO timestamps
 */
export function getSessionDurationSeconds(session: WorkSession, now: Date = new Date()): number {
  const start = new Date(session.startAtUtc).getTime();
  const end = session.endAtUtc ? new Date(session.endAtUtc).getTime() : now.getTime();
  if (isNaN(start) || end < start) return 0;
  return Math.floor((end - start) / 1000);
}

/**
 * Calculates a single day's attendance & overtime classifications
 */
export function calculateDay(
  dateStr: string,
  sessions: WorkSession[],
  dayRecord?: DayRecord,
  settings: AppSettings = DEFAULT_SETTINGS,
  now: Date = new Date()
): DayCalculation {
  const dateObj = new Date(`${dateStr}T12:00:00`);
  const dayOfWeek = dateObj.getDay(); // 0=Sun..6=Sat
  
  const scheduleSetting = settings.schedule[dayOfWeek] || { requiredSeconds: 0 };
  const requiredSeconds = scheduleSetting.requiredSeconds;

  // Filter sessions for this date
  const daySessions = sessions.filter((s) => s.localWorkDate === dateStr);
  
  let workedSeconds = 0;
  let hasActiveSession = false;

  for (const s of daySessions) {
    if (!s.endAtUtc) hasActiveSession = true;
    workedSeconds += getSessionDurationSeconds(s, now);
  }

  const creditedSeconds = dayRecord ? dayRecord.creditedSeconds : 0;
  const totalTimeSeconds = workedSeconds + creditedSeconds;

  let deficitSeconds = 0;
  let surplusSeconds = 0;
  let attendanceDifferenceSeconds = 0;

  let regularSeconds = 0;
  let dailyOvertime125Seconds = 0;
  let dailyOvertime150Seconds = 0;
  let fridayRegularSeconds = 0;
  let saturday150Seconds = 0;

  if (dayOfWeek === 6) {
    // Saturday: Rest Day
    saturday150Seconds = workedSeconds;
    attendanceDifferenceSeconds = totalTimeSeconds;
    surplusSeconds = totalTimeSeconds;
  } else if (dayOfWeek === 5) {
    // Friday: No required standard
    fridayRegularSeconds = workedSeconds;
    attendanceDifferenceSeconds = totalTimeSeconds;
    surplusSeconds = totalTimeSeconds;
  } else {
    const todayStr = toLocalDateString(now);
    const isFutureDay = dateStr > todayStr;
    const isToday = dateStr === todayStr;

    if (isFutureDay) {
      // Future day: has not arrived yet! No deficit.
      if (totalTimeSeconds > 0) {
        if (totalTimeSeconds >= requiredSeconds) {
          surplusSeconds = totalTimeSeconds - requiredSeconds;
          attendanceDifferenceSeconds = surplusSeconds;
        } else {
          // Advance partial hours on a future day do not incur a deficit today
          surplusSeconds = 0;
          attendanceDifferenceSeconds = 0;
        }
      } else {
        attendanceDifferenceSeconds = 0;
        surplusSeconds = 0;
      }
      deficitSeconds = 0;
    } else if (isToday) {
      // Today: in progress!
      attendanceDifferenceSeconds = totalTimeSeconds - requiredSeconds;
      if (attendanceDifferenceSeconds >= 0) {
        surplusSeconds = attendanceDifferenceSeconds;
        deficitSeconds = 0;
      } else {
        surplusSeconds = 0;
        // If user is actively working or hasn't started today yet, no deficit incurred yet.
        if (hasActiveSession || totalTimeSeconds === 0) {
          deficitSeconds = 0;
        } else {
          // Clocked out after partial shift
          deficitSeconds = Math.abs(attendanceDifferenceSeconds);
        }
      }
    } else {
      // Past day: Sunday through Thursday that has elapsed
      attendanceDifferenceSeconds = totalTimeSeconds - requiredSeconds;

      if (attendanceDifferenceSeconds < 0) {
        deficitSeconds = Math.abs(attendanceDifferenceSeconds);
      } else {
        surplusSeconds = attendanceDifferenceSeconds;
      }
    }

    // Overtime tier logic based on worked seconds
    const firstTierCap = requiredSeconds;
    const secondTierCap = firstTierCap + 2 * 3600; // 2 hours tier at 125%

    if (workedSeconds <= firstTierCap) {
      regularSeconds = workedSeconds;
    } else if (workedSeconds <= secondTierCap) {
      regularSeconds = firstTierCap;
      dailyOvertime125Seconds = workedSeconds - firstTierCap;
    } else {
      regularSeconds = firstTierCap;
      dailyOvertime125Seconds = secondTierCap - firstTierCap;
      dailyOvertime150Seconds = workedSeconds - secondTierCap;
    }
  }

  return {
    date: dateStr,
    dayOfWeek,
    requiredSeconds,
    workedSeconds,
    creditedSeconds,
    totalTimeSeconds,
    attendanceDifferenceSeconds,
    deficitSeconds,
    surplusSeconds,
    regularSeconds,
    dailyOvertime125Seconds,
    dailyOvertime150Seconds,
    fridayRegularSeconds,
    saturday150Seconds,
    sessions: daySessions,
    dayRecord,
    hasActiveSession,
  };
}

/**
 * Calculates a week's overtime without double counting daily overtime
 */
export function calculateWeek(
  weekDays: DayCalculation[],
  settings: AppSettings = DEFAULT_SETTINGS
): WeekCalculation {
  const weekStartDate = weekDays[0]?.date || '';
  const weekEndDate = weekDays[weekDays.length - 1]?.date || '';

  // Pool of regular minutes from Sun-Thu + Fri
  let regularPoolSeconds = 0;
  for (const d of weekDays) {
    regularPoolSeconds += d.regularSeconds + d.fridayRegularSeconds;
  }

  let weeklyOvertime125Seconds = 0;
  let weeklyOvertime150Seconds = 0;

  if (settings.weeklyOvertimeEnabled && settings.weeklyOvertimeThresholdSeconds !== null) {
    const threshold = settings.weeklyOvertimeThresholdSeconds;
    if (regularPoolSeconds > threshold) {
      const excess = regularPoolSeconds - threshold;
      const tier1 = settings.weeklyFirstTierSeconds || 2 * 3600;

      if (excess <= tier1) {
        weeklyOvertime125Seconds = excess;
      } else {
        weeklyOvertime125Seconds = tier1;
        weeklyOvertime150Seconds = excess - tier1;
      }
    }
  }

  return {
    weekStartDate,
    weekEndDate,
    regularPoolSeconds,
    thresholdSeconds: settings.weeklyOvertimeThresholdSeconds,
    weeklyOvertime125Seconds,
    weeklyOvertime150Seconds,
    days: weekDays,
  };
}

/**
 * Calculates entire month totals and exact agorot financial adjustment
 */
export function calculateMonth(
  yearMonth: string, // YYYY-MM
  sessions: WorkSession[],
  dayRecordsMap: Record<string, DayRecord>,
  settings: AppSettings = DEFAULT_SETTINGS,
  now: Date = new Date()
): MonthCalculation {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const daysInMonth = new Date(year, month, 0).getDate();
  const days: DayCalculation[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayPadded = String(d).padStart(2, '0');
    const dateStr = `${yearStr}-${monthStr}-${dayPadded}`;
    const dayRecord = dayRecordsMap[dateStr];
    
    const dayCalc = calculateDay(dateStr, sessions, dayRecord, settings, now);
    days.push(dayCalc);
  }

  // Calculate weeks for weekly overtime
  const weeks: DayCalculation[][] = [];
  let currentWeek: DayCalculation[] = [];

  for (const day of days) {
    if (day.dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  let weeklyOvertime125Seconds = 0;
  let weeklyOvertime150Seconds = 0;

  for (const weekDays of weeks) {
    const wCalc = calculateWeek(weekDays, settings);
    weeklyOvertime125Seconds += wCalc.weeklyOvertime125Seconds;
    weeklyOvertime150Seconds += wCalc.weeklyOvertime150Seconds;
  }

  // Aggregate monthly values
  let workedSeconds = 0;
  let creditedSeconds = 0;
  let requiredSeconds = 0; // Total standard for full calendar month
  let requiredSecondsToDate = 0; // Standard for work days that have occurred up to now
  let dailyOvertime125Seconds = 0;
  let dailyOvertime150Seconds = 0;
  let fridayRegularSeconds = 0;
  let saturday150Seconds = 0;

  const todayStr = toLocalDateString(now);

  for (const day of days) {
    workedSeconds += day.workedSeconds;
    creditedSeconds += day.creditedSeconds;
    requiredSeconds += day.requiredSeconds;

    if (day.date < todayStr) {
      requiredSecondsToDate += day.requiredSeconds;
    } else if (day.date === todayStr) {
      if (day.hasActiveSession) {
        // While actively working today, standard to date matches what was worked (capped at required)
        requiredSecondsToDate += Math.min(
          day.workedSeconds + day.creditedSeconds,
          day.requiredSeconds
        );
      } else if (day.totalTimeSeconds === 0) {
        // Day hasn't started yet: 0 required to-date so far
        requiredSecondsToDate += 0;
      } else {
        // Shift concluded: standard applies
        requiredSecondsToDate += day.requiredSeconds;
      }
    }

    dailyOvertime125Seconds += day.dailyOvertime125Seconds;
    dailyOvertime150Seconds += day.dailyOvertime150Seconds;
    fridayRegularSeconds += day.fridayRegularSeconds;
    saturday150Seconds += day.saturday150Seconds;
  }

  // Monthly balance is overtime done minus deficit of standard from work days that took place!
  // Future work days that were not done are excluded from requiredSecondsToDate and have 0 deficit.
  const balanceSeconds = workedSeconds + creditedSeconds - requiredSecondsToDate;

  // Monthly net deficit follows the exact same logic as monthly balance:
  // If monthly balance is positive or zero (surplus), there is NO monthly deficit (0).
  // If monthly balance is negative, the net shortfall to be deducted is Math.abs(balanceSeconds).
  const deficitSeconds = balanceSeconds < 0 ? Math.abs(balanceSeconds) : 0;

  // Financial Agorot Calculations
  const hourlyRateAgorot = Math.round(settings.hourlyRate * 100);
  
  const rate125 = hourlyRateAgorot * settings.overtime125Multiplier;
  const rate150 = hourlyRateAgorot * settings.overtime150Multiplier;
  const rateFri = hourlyRateAgorot * settings.fridayMultiplier;
  const rateSat = hourlyRateAgorot * settings.saturdayMultiplier;

  const overtime125Agorot = Math.round((dailyOvertime125Seconds * rate125) / 3600);
  const overtime150Agorot = Math.round((dailyOvertime150Seconds * rate150) / 3600);
  const fridayAgorot = Math.round((fridayRegularSeconds * rateFri) / 3600);
  const saturday150Agorot = Math.round((saturday150Seconds * rateSat) / 3600);

  const weeklyOvertime125Agorot = Math.round((weeklyOvertime125Seconds * rate125) / 3600);
  const weeklyOvertime150Agorot = Math.round((weeklyOvertime150Seconds * rate150) / 3600);
  const weeklyOvertimeAgorot = weeklyOvertime125Agorot + weeklyOvertime150Agorot;

  const positivePaymentAgorot =
    overtime125Agorot +
    overtime150Agorot +
    fridayAgorot +
    saturday150Agorot +
    weeklyOvertimeAgorot;

  const deficitDeductionAgorot = Math.round((deficitSeconds * hourlyRateAgorot) / 3600);

  const expectedPaymentAdjustmentAgorot = positivePaymentAgorot - deficitDeductionAgorot;

  return {
    month: yearMonth,
    workedSeconds,
    creditedSeconds,
    requiredSeconds,
    requiredSecondsToDate,
    balanceSeconds,
    deficitSeconds,
    dailyOvertime125Seconds,
    dailyOvertime150Seconds,
    weeklyOvertime125Seconds,
    weeklyOvertime150Seconds,
    fridayRegularSeconds,
    saturday150Seconds,
    overtime125Agorot,
    overtime150Agorot,
    fridayAgorot,
    saturday150Agorot,
    weeklyOvertimeAgorot,
    positivePaymentAgorot,
    deficitDeductionAgorot,
    expectedPaymentAdjustmentAgorot,
    days,
  };
}

export interface DayStatusInfo {
  status: DayStatus;
  label: string;
  badgeClass: string;
  isMissingReport: boolean;
}

export function getDayStatusInfo(dayCalc: DayCalculation, now: Date = new Date()): DayStatusInfo {
  const status = dayCalc.dayRecord?.status || 'WORK';

  if (status === 'VACATION') {
    return {
      status: 'VACATION',
      label: 'חופשה',
      badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200',
      isMissingReport: false,
    };
  }
  if (status === 'SICK') {
    return {
      status: 'SICK',
      label: 'מחלה',
      badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200',
      isMissingReport: false,
    };
  }
  if (status === 'HOLIDAY') {
    return {
      status: 'HOLIDAY',
      label: 'חג',
      badgeClass: 'bg-purple-100 text-purple-800 border border-purple-200',
      isMissingReport: false,
    };
  }
  if (status === 'EVE_OF_HOLIDAY') {
    return {
      status: 'EVE_OF_HOLIDAY',
      label: 'ערב חג (0.5)',
      badgeClass: 'bg-teal-100 text-teal-800 border border-teal-200',
      isMissingReport: false,
    };
  }
  if (status === 'MISSING') {
    return {
      status: 'MISSING',
      label: 'חוסר דיווח',
      badgeClass: 'bg-rose-100 text-rose-800 border border-rose-200',
      isMissingReport: true,
    };
  }

  // If worked hours exist
  if (dayCalc.workedSeconds > 0) {
    return {
      status: 'WORK',
      label: dayCalc.hasActiveSession ? 'במשמרת' : 'עבודה',
      badgeClass: dayCalc.hasActiveSession
        ? 'bg-blue-100 text-blue-800 border border-blue-200 animate-pulse'
        : 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      isMissingReport: false,
    };
  }

  const todayStr = toLocalDateString(now);
  const isFuture = dayCalc.date > todayStr;
  const isToday = dayCalc.date === todayStr;

  if (isFuture) {
    return {
      status: 'WORK',
      label: dayCalc.dayOfWeek === 6 ? 'שבת' : dayCalc.dayOfWeek === 5 ? 'שישי' : 'טרם בוצע',
      badgeClass: 'bg-slate-100 text-slate-500 border border-slate-200',
      isMissingReport: false,
    };
  }

  if (isToday) {
    return {
      status: 'WORK',
      label: 'היום',
      badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
      isMissingReport: false,
    };
  }

  // Past day (dayCalc.date < todayStr):
  // If it's a required work day (Sun-Thu) and 0 hours worked and 0 credited hours
  if (dayCalc.requiredSeconds > 0 && dayCalc.totalTimeSeconds === 0) {
    return {
      status: 'MISSING',
      label: 'חוסר דיווח',
      badgeClass: 'bg-rose-100 text-rose-800 border border-rose-200',
      isMissingReport: true,
    };
  }

  // Weekend or non-required day with 0 hours
  return {
    status: 'WORK',
    label: dayCalc.dayOfWeek === 6 ? 'שבת' : dayCalc.dayOfWeek === 5 ? 'שישי' : 'ללא שעות',
    badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200',
    isMissingReport: false,
  };
}
