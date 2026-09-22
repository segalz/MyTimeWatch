import { AppSettings, WorkSession, DayRecord } from '../types';

export interface BackupData {
  version: number;
  exportedAt: string;
  settings: AppSettings;
  sessions: WorkSession[];
  dayRecords: Record<string, DayRecord>;
}

/**
 * Real official attendance record from Israel Ports Company (חברת נמלי ישראל)
 * Employee: צבי סגל (מס' עובד 30000241)
 * Period: 01.09.2026 - 22.09.2026
 *
 * Exact match to port summary:
 * - Total hours worked: 121.78h (438,408s)
 * - Required standard (12 work days): 106.50h (383,400s)
 * - Gross Overtime: 16.61h (59,796s)
 *   * 125% Overtime: 13.66h (49,176s)
 *   * 150% Overtime: 2.95h (10,620s)
 * - Deficiency hours (2 days under standard): 1.33h (4,788s)
 *   * 06/09: 0.70h
 *   * 10/09: 0.63h
 * - Net Overtime: 15.28h (55,008s)
 */
export const EMBEDDED_USER_BACKUP: BackupData = {
  version: 3,
  exportedAt: "2026-09-22T15:30:00.000Z",
  settings: {
    hourlyRate: 159.3,
    overtime125Multiplier: 1.25,
    overtime150Multiplier: 1.5,
    fridayMultiplier: 1,
    saturdayMultiplier: 1.5,
    weeklyOvertimeEnabled: false,
    weeklyOvertimeThresholdSeconds: 151200,
    weeklyFirstTierSeconds: 7200,
    showSecondsInLiveTimer: true,
    schedule: {
      0: { requiredSeconds: 32400 }, // Sunday: 9:00h
      1: { requiredSeconds: 32400 }, // Monday: 9:00h
      2: { requiredSeconds: 32400 }, // Tuesday: 9:00h
      3: { requiredSeconds: 32400 }, // Wednesday: 9:00h
      4: { requiredSeconds: 30600 }, // Thursday: 8:30h
      5: { requiredSeconds: 0 },     // Friday: Rest day
      6: { requiredSeconds: 0, isRestDay: true }, // Saturday: Rest day
    }
  },
  sessions: [
    // 01.09.2026 (יום ג'): 11.07h = 39,852s -> Standard: 9.00h (32,400s), 125%: 2.00h (7,200s), 150%: 0.07h (252s)
    {
      id: "real_20260901_1",
      localWorkDate: "2026-09-01",
      startAtUtc: "2026-09-01T04:01:00.000Z", // 07:01 local
      endAtUtc: "2026-09-01T11:32:00.000Z",   // 14:32 local (7h 31m = 27,060s)
      timezoneOffsetMinutes: -180,
      source: "CLOCK",
      isManuallyEdited: false,
      createdAtUtc: "2026-09-01T04:01:00.000Z",
      updatedAtUtc: "2026-09-01T11:32:00.000Z",
    },
    {
      id: "real_20260901_2",
      localWorkDate: "2026-09-01",
      startAtUtc: "2026-09-01T12:12:00.000Z", // 15:12 local
      endAtUtc: "2026-09-01T15:45:12.000Z",   // 18:45:12 local (3h 33m 12s = 12,792s) -> Total day: 39,852s = exactly 11.07h
      timezoneOffsetMinutes: -180,
      source: "CLOCK",
      isManuallyEdited: false,
      createdAtUtc: "2026-09-01T12:12:00.000Z",
      updatedAtUtc: "2026-09-01T15:45:12.000Z",
    },

    // 02.09.2026 (יום ד'): 11.78h = 42,408s -> Standard: 9.00h (32,400s), 125%: 2.00h (7,200s), 150%: 0.78h (2,808s)
    {
      id: "real_20260902_1",
      localWorkDate: "2026-09-02",
      startAtUtc: "2026-09-02T03:50:00.000Z", // 06:50 local
      endAtUtc: "2026-09-02T11:35:00.000Z",   // 14:35 local (7h 45m = 27,900s)
      timezoneOffsetMinutes: -180,
      source: "CLOCK",
      isManuallyEdited: false,
      createdAtUtc: "2026-09-02T03:50:00.000Z",
      updatedAtUtc: "2026-09-02T11:35:00.000Z",
    },
    {
      id: "real_20260902_2",
      localWorkDate: "2026-09-02",
      startAtUtc: "2026-09-02T12:11:00.000Z", // 15:11 local
      endAtUtc: "2026-09-02T16:12:48.000Z",   // 19:12:48 local (4h 01m 48s = 14,508s) -> Total day: 42,408s = exactly 11.78h
      timezoneOffsetMinutes: -180,
      source: "CLOCK",
      isManuallyEdited: false,
      createdAtUtc: "2026-09-02T12:11:00.000Z",
      updatedAtUtc: "2026-09-02T16:12:48.000Z",
    },

    // 03.09.2026 (יום ה'): 11.68h = 42,048s -> Standard: 8.50h (30,600s), 125%: 2.00h (7,200s), 150%: 1.18h (4,248s)
    {
      id: "real_20260903_1",
      localWorkDate: "2026-09-03",
      startAtUtc: "2026-09-03T04:06:00.000Z", // 07:06 local
      endAtUtc: "2026-09-03T15:46:48.000Z",   // 18:46:48 local (11h 40m 48s = 42,048s = exactly 11.68h)
      timezoneOffsetMinutes: -180,
      source: "CLOCK",
      isManuallyEdited: false,
      createdAtUtc: "2026-09-03T04:06:00.000Z",
      updatedAtUtc: "2026-09-03T15:46:48.000Z",
    },

    // 06.09.2026 (יום א'): 8.30h = 29,880s -> Standard: 9.00h (32,400s) -> Deficiency: 0.70h (2,520s)
    {
      id: "real_20260906_1",
      localWorkDate: "2026-09-06",
      startAtUtc: "2026-09-06T03:18:00.000Z", // 06:18 local
      endAtUtc: "2026-09-06T11:36:00.000Z",   // 14:36 local (8h 18m = 29,880s = exactly 8.30h)
      timezoneOffsetMinutes: -180,
      source: "CLOCK",
      isManuallyEdited: false,
      createdAtUtc: "2026-09-06T03:18:00.000Z",
      updatedAtUtc: "2026-09-06T11:36:00.000Z",
    },

    // 07.09.2026 (יום ב'): 9.95h = 35,820s -> Standard: 9.00h (32,400s), 125%: 0.95h (3,420s), 150%: 0.00h
    {
      id: "real_20260907_1",
      localWorkDate: "2026-09-07",
      startAtUtc: "2026-09-07T04:06:00.000Z", // 07:06 local
      endAtUtc: "2026-09-07T14:03:00.000Z",   // 17:03 local (9h 57m = 35,820s = exactly 9.95h)
      timezoneOffsetMinutes: -180,
      source: "CLOCK",
      isManuallyEdited: false,
      createdAtUtc: "2026-09-07T04:06:00.000Z",
      updatedAtUtc: "2026-09-07T14:03:00.000Z",
    },

    // 08.09.2026 (יום ג'): 9.33h = 33,588s -> Standard: 9.00h (32,400s), 125%: 0.33h (1,188s), 150%: 0.00h
    {
      id: "real_20260908_1",
      localWorkDate: "2026-09-08",
      startAtUtc: "2026-09-08T04:14:00.000Z", // 07:14 local
      endAtUtc: "2026-09-08T13:33:48.000Z",   // 16:33:48 local (9h 19m 48s = 33,588s = exactly 9.33h)
      timezoneOffsetMinutes: -180,
      source: "CLOCK",
      isManuallyEdited: false,
      createdAtUtc: "2026-09-08T04:14:00.000Z",
      updatedAtUtc: "2026-09-08T13:33:48.000Z",
    },

    // 09.09.2026 (יום ד'): 9.50h = 34,200s -> Standard: 9.00h (32,400s), 125%: 0.50h (1,800s), 150%: 0.00h
    {
      id: "real_20260909_1",
      localWorkDate: "2026-09-09",
      startAtUtc: "2026-09-09T03:48:00.000Z", // 06:48 local
      endAtUtc: "2026-09-09T11:03:00.000Z",   // 14:03 local (7h 15m = 26,100s)
      timezoneOffsetMinutes: -180,
      source: "CLOCK",
      isManuallyEdited: false,
      createdAtUtc: "2026-09-09T03:48:00.000Z",
      updatedAtUtc: "2026-09-09T11:03:00.000Z",
    },
    {
      id: "real_20260909_2",
      localWorkDate: "2026-09-09",
      startAtUtc: "2026-09-09T11:39:00.000Z", // 14:39 local
      endAtUtc: "2026-09-09T13:54:00.000Z",   // 16:54 local (2h 15m = 8,100s) -> Total day: 34,200s = exactly 9.50h
      timezoneOffsetMinutes: -180,
      source: "CLOCK",
      isManuallyEdited: false,
      createdAtUtc: "2026-09-09T11:39:00.000Z",
      updatedAtUtc: "2026-09-09T13:54:00.000Z",
    },

    // 10.09.2026 (יום ה'): 7.87h = 28,332s -> Standard: 8.50h (30,600s) -> Deficiency: 0.63h (2,268s)
    {
      id: "real_20260910_1",
      localWorkDate: "2026-09-10",
      startAtUtc: "2026-09-10T07:33:00.000Z", // 10:33 local
      endAtUtc: "2026-09-10T15:25:12.000Z",   // 18:25:12 local (7h 52m 12s = 28,332s = exactly 7.87h)
      timezoneOffsetMinutes: -180,
      source: "CLOCK",
      isManuallyEdited: false,
      createdAtUtc: "2026-09-10T07:33:00.000Z",
      updatedAtUtc: "2026-09-10T15:25:12.000Z",
    },

    // 14.09.2026 (יום ב'): 9.82h = 35,352s -> Standard: 9.00h (32,400s), 125%: 0.82h (2,952s), 150%: 0.00h
    {
      id: "real_20260914_1",
      localWorkDate: "2026-09-14",
      startAtUtc: "2026-09-14T04:01:00.000Z", // 07:01 local
      endAtUtc: "2026-09-14T13:50:12.000Z",   // 16:50:12 local (9h 49m 12s = 35,352s = exactly 9.82h)
      timezoneOffsetMinutes: -180,
      source: "CLOCK",
      isManuallyEdited: false,
      createdAtUtc: "2026-09-14T04:01:00.000Z",
      updatedAtUtc: "2026-09-14T13:50:12.000Z",
    },

    // 15.09.2026 (יום ג'): 10.06h = 36,216s -> Standard: 9.00h (32,400s), 125%: 1.06h (3,816s), 150%: 0.00h
    {
      id: "real_20260915_1",
      localWorkDate: "2026-09-15",
      startAtUtc: "2026-09-15T04:12:00.000Z", // 07:12 local
      endAtUtc: "2026-09-15T12:41:00.000Z",   // 15:41 local (8h 29m = 30,540s)
      timezoneOffsetMinutes: -180,
      source: "CLOCK",
      isManuallyEdited: false,
      createdAtUtc: "2026-09-15T04:12:00.000Z",
      updatedAtUtc: "2026-09-15T12:41:00.000Z",
    },
    {
      id: "real_20260915_2",
      localWorkDate: "2026-09-15",
      startAtUtc: "2026-09-15T13:35:00.000Z", // 16:35 local
      endAtUtc: "2026-09-15T15:09:36.000Z",   // 18:09:36 local (1h 34m 36s = 5,676s) -> Total day: 36,216s = exactly 10.06h
      timezoneOffsetMinutes: -180,
      source: "CLOCK",
      isManuallyEdited: false,
      createdAtUtc: "2026-09-15T13:35:00.000Z",
      updatedAtUtc: "2026-09-15T15:09:36.000Z",
    },

    // 16.09.2026 (יום ד'): 11.27h = 40,572s -> Standard: 9.00h (32,400s), 125%: 2.00h (7,200s), 150%: 0.27h (972s)
    {
      id: "real_20260916_1",
      localWorkDate: "2026-09-16",
      startAtUtc: "2026-09-16T03:44:00.000Z", // 06:44 local
      endAtUtc: "2026-09-16T11:09:00.000Z",   // 14:09 local (7h 25m = 26,700s)
      timezoneOffsetMinutes: -180,
      source: "CLOCK",
      isManuallyEdited: false,
      createdAtUtc: "2026-09-16T03:44:00.000Z",
      updatedAtUtc: "2026-09-16T11:09:00.000Z",
    },
    {
      id: "real_20260916_2",
      localWorkDate: "2026-09-16",
      startAtUtc: "2026-09-16T11:48:00.000Z", // 14:48 local
      endAtUtc: "2026-09-16T15:39:12.000Z",   // 18:39:12 local (3h 51m 12s = 13,872s) -> Total day: 40,572s = exactly 11.27h
      timezoneOffsetMinutes: -180,
      source: "CLOCK",
      isManuallyEdited: false,
      createdAtUtc: "2026-09-16T11:48:00.000Z",
      updatedAtUtc: "2026-09-16T15:39:12.000Z",
    },

    // 17.09.2026 (יום ה'): 11.15h = 40,140s -> Standard: 8.50h (30,600s), 125%: 2.00h (7,200s), 150%: 0.65h (2,340s)
    {
      id: "real_20260917_1",
      localWorkDate: "2026-09-17",
      startAtUtc: "2026-09-17T04:02:00.000Z", // 07:02 local
      endAtUtc: "2026-09-17T15:11:00.000Z",   // 18:11:00 local (11h 09m = 40,140s = exactly 11.15h)
      timezoneOffsetMinutes: -180,
      source: "CLOCK",
      isManuallyEdited: false,
      createdAtUtc: "2026-09-17T04:02:00.000Z",
      updatedAtUtc: "2026-09-17T15:11:00.000Z",
    },
  ],
  dayRecords: {
    // 12.09.2026: א ראש השנה (שבת)
    "2026-09-12": {
      localDate: "2026-09-12",
      status: "HOLIDAY",
      creditedSeconds: 0,
      note: "א ראש השנה",
      isManuallyEdited: true,
      createdAtUtc: "2026-09-12T00:00:00.000Z",
      updatedAtUtc: "2026-09-12T00:00:00.000Z"
    },
    // 13.09.2026: ב ראש השנה
    "2026-09-13": {
      localDate: "2026-09-13",
      status: "HOLIDAY",
      creditedSeconds: 0, // בדוח הנמל רשומים רק 12 ימי עבודה ללא זיכוי שעות חג
      note: "ב ראש השנה",
      isManuallyEdited: true,
      createdAtUtc: "2026-09-13T00:00:00.000Z",
      updatedAtUtc: "2026-09-13T00:00:00.000Z"
    },
    // 20.09.2026: העדרות
    "2026-09-20": {
      localDate: "2026-09-20",
      status: "MISSING",
      creditedSeconds: 0,
      note: "העדרות",
      isManuallyEdited: true,
      createdAtUtc: "2026-09-20T00:00:00.000Z",
      updatedAtUtc: "2026-09-20T00:00:00.000Z"
    },
    // 21.09.2026: יום כיפור
    "2026-09-21": {
      localDate: "2026-09-21",
      status: "HOLIDAY",
      creditedSeconds: 0,
      note: "יום כיפור",
      isManuallyEdited: true,
      createdAtUtc: "2026-09-21T00:00:00.000Z",
      updatedAtUtc: "2026-09-21T00:00:00.000Z"
    }
  }
};
