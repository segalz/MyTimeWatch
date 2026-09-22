/**
 * Types and Interfaces for Personal Time Attendance Application
 */

export type DayStatus = 'WORK' | 'VACATION' | 'SICK' | 'HOLIDAY' | 'EVE_OF_HOLIDAY' | 'MISSING' | 'OTHER';

export interface WorkSession {
  id: string;
  localWorkDate: string; // YYYY-MM-DD
  startAtUtc: string; // ISO string
  endAtUtc: string | null; // null if session is currently active
  timezoneOffsetMinutes: number;
  source: 'CLOCK' | 'MANUAL' | 'CORRECTION';
  isManuallyEdited: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
  note?: string;
}

export interface DayRecord {
  localDate: string; // YYYY-MM-DD
  status: DayStatus;
  creditedSeconds: number;
  vacationDaysDeducted?: number; // e.g. 1 for full vacation, 0.5 for eve of holiday
  note?: string;
  isManuallyEdited: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface AutoClockOutConfig {
  targetHours: number; // 8.5 | 9 | 10 | 11 | 12
  localDate: string; // YYYY-MM-DD
}

export interface WorkScheduleSetting {
  requiredSeconds: number; // e.g. 9:00 = 32400, 8:30 = 30600, 0 = 0
  isRestDay?: boolean;
}

export interface AppSettings {
  hourlyRate: number; // Shekels, e.g. 50.00
  overtime125Multiplier: number; // 1.25
  overtime150Multiplier: number; // 1.50
  fridayMultiplier: number; // 1.00
  saturdayMultiplier: number; // 1.50
  weeklyOvertimeEnabled: boolean;
  weeklyOvertimeThresholdSeconds: number | null; // e.g., 42 * 3600 = 151200 or null
  weeklyFirstTierSeconds: number; // default 2 hours = 7200
  showSecondsInLiveTimer: boolean;
  schedule: Record<number, WorkScheduleSetting>; // 0=Sun, 1=Mon, ..., 6=Sat
}

export interface DayCalculation {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0=Sun..6=Sat
  requiredSeconds: number;
  workedSeconds: number;
  creditedSeconds: number;
  totalTimeSeconds: number; // worked + credited
  attendanceDifferenceSeconds: number; // totalTime - required
  deficitSeconds: number; // max(0, -attendanceDifferenceSeconds) for Sun-Thu
  surplusSeconds: number; // max(0, attendanceDifferenceSeconds)
  regularSeconds: number;
  dailyOvertime125Seconds: number;
  dailyOvertime150Seconds: number;
  fridayRegularSeconds: number;
  saturday150Seconds: number;
  sessions: WorkSession[];
  dayRecord?: DayRecord;
  hasActiveSession: boolean;
}

export interface WeekCalculation {
  weekStartDate: string; // YYYY-MM-DD (Sunday)
  weekEndDate: string; // YYYY-MM-DD (Saturday)
  regularPoolSeconds: number;
  thresholdSeconds: number | null;
  weeklyOvertime125Seconds: number;
  weeklyOvertime150Seconds: number;
  days: DayCalculation[];
}

export interface MonthCalculation {
  month: string; // YYYY-MM
  workedSeconds: number;
  creditedSeconds: number;
  requiredSeconds: number;
  requiredSecondsToDate: number;
  balanceSeconds: number; // (worked + credited) - requiredSecondsToDate
  deficitSeconds: number;
  dailyOvertime125Seconds: number;
  dailyOvertime150Seconds: number;
  weeklyOvertime125Seconds: number;
  weeklyOvertime150Seconds: number;
  fridayRegularSeconds: number;
  saturday150Seconds: number;
  
  // Financial agorot
  overtime125Agorot: number;
  overtime150Agorot: number;
  fridayAgorot: number;
  saturday150Agorot: number;
  weeklyOvertimeAgorot: number;
  positivePaymentAgorot: number;
  deficitDeductionAgorot: number;
  expectedPaymentAdjustmentAgorot: number;
  
  days: DayCalculation[];
}

export type ActiveTab = 'home' | 'monthly' | 'reports' | 'settings';
