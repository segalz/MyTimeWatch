import { DEFAULT_SETTINGS, toLocalDateString } from '../domain/attendance';
import { AppSettings, AutoClockOutConfig, DayRecord, WorkSession } from '../types';
import { EMBEDDED_USER_BACKUP } from '../data/userBackup';

const SETTINGS_KEY = 'worklog_pro_settings_v2';
const SESSIONS_KEY = 'worklog_pro_sessions_v2';
const DAY_RECORDS_KEY = 'worklog_pro_day_records_v2';
const AUTO_CLOCK_OUT_KEY = 'worklog_pro_auto_clock_out_v2';

export class StorageService {
  /**
   * Retrieves AppSettings from localStorage or returns defaults
   */
  static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) return EMBEDDED_USER_BACKUP.settings || DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      return { ...DEFAULT_SETTINGS, ...(EMBEDDED_USER_BACKUP.settings || {}), ...parsed };
    } catch (e) {
      console.error('Failed to parse settings from storage', e);
      return EMBEDDED_USER_BACKUP.settings || DEFAULT_SETTINGS;
    }
  }

  /**
   * Saves AppSettings
   */
  static saveSettings(settings: AppSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  /**
   * Retrieves all WorkSessions
   */
  static getWorkSessions(): WorkSession[] {
    try {
      const data = localStorage.getItem(SESSIONS_KEY);
      if (!data) {
        // Fresh install / first launch: immediately populate with user's embedded backup
        StorageService.restoreEmbeddedBackup();
        const freshData = localStorage.getItem(SESSIONS_KEY);
        return freshData ? JSON.parse(freshData) : EMBEDDED_USER_BACKUP.sessions;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse sessions from storage', e);
      return [];
    }
  }

  /**
   * Saves all WorkSessions
   */
  static saveWorkSessions(sessions: WorkSession[]): void {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }

  /**
   * Retrieves all DayRecords indexed by YYYY-MM-DD
   */
  static getDayRecords(): Record<string, DayRecord> {
    try {
      const data = localStorage.getItem(DAY_RECORDS_KEY);
      if (!data) return EMBEDDED_USER_BACKUP.dayRecords || {};
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse day records from storage', e);
      return EMBEDDED_USER_BACKUP.dayRecords || {};
    }
  }

  /**
   * Saves DayRecords
   */
  static saveDayRecords(records: Record<string, DayRecord>): void {
    localStorage.setItem(DAY_RECORDS_KEY, JSON.stringify(records));
  }

  /**
   * Returns active session if exists
   */
  static getActiveSession(): WorkSession | null {
    const sessions = StorageService.getWorkSessions();
    return sessions.find((s) => s.endAtUtc === null) || null;
  }

  /**
   * Clocks in a new session
   */
  static clockIn(note?: string): { success: boolean; session?: WorkSession; error?: string } {
    const sessions = StorageService.getWorkSessions();
    const active = sessions.find((s) => s.endAtUtc === null);

    if (active) {
      return { success: false, error: 'קיימת כניסה פעילה. יש לבצע יציאה לפני כניסה חדשה.' };
    }

    const now = new Date();
    const localWorkDate = toLocalDateString(now);

    const newSession: WorkSession = {
      id: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      localWorkDate,
      startAtUtc: now.toISOString(),
      endAtUtc: null,
      timezoneOffsetMinutes: now.getTimezoneOffset(),
      source: 'CLOCK',
      isManuallyEdited: false,
      createdAtUtc: now.toISOString(),
      updatedAtUtc: now.toISOString(),
      note,
    };

    sessions.push(newSession);
    StorageService.saveWorkSessions(sessions);
    return { success: true, session: newSession };
  }

  /**
   * Clocks out current active session
   */
  static clockOut(note?: string, customEndAtUtc?: string): { success: boolean; session?: WorkSession; error?: string } {
    const sessions = StorageService.getWorkSessions();
    const activeIndex = sessions.findIndex((s) => s.endAtUtc === null);

    if (activeIndex === -1) {
      return { success: false, error: 'לא נמצאה כניסה פעילה.' };
    }

    const activeSession = sessions[activeIndex];
    const endTime = customEndAtUtc ? new Date(customEndAtUtc) : new Date();
    
    // Ensure end time is after start time
    if (endTime.getTime() <= new Date(activeSession.startAtUtc).getTime()) {
      return { success: false, error: 'זמן יציאה אינו יכול להיות לפני זמן כניסה.' };
    }

    activeSession.endAtUtc = endTime.toISOString();
    activeSession.updatedAtUtc = new Date().toISOString();
    if (note) activeSession.note = note;

    sessions[activeIndex] = activeSession;
    StorageService.saveWorkSessions(sessions);
    return { success: true, session: activeSession };
  }

  /**
   * Retrieves AutoClockOutConfig from storage
   */
  static getAutoClockOutConfig(): AutoClockOutConfig | null {
    try {
      const data = localStorage.getItem(AUTO_CLOCK_OUT_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Sets AutoClockOutConfig
   */
  static setAutoClockOutConfig(config: AutoClockOutConfig): void {
    localStorage.setItem(AUTO_CLOCK_OUT_KEY, JSON.stringify(config));
  }

  /**
   * Clears AutoClockOutConfig
   */
  static clearAutoClockOut(): void {
    localStorage.removeItem(AUTO_CLOCK_OUT_KEY);
  }

  /**
   * Adds or updates a session
   */
  static upsertSession(session: WorkSession): { success: boolean; error?: string } {
    const sessions = StorageService.getWorkSessions();

    // Check end > start if endAtUtc exists
    if (session.endAtUtc) {
      const start = new Date(session.startAtUtc).getTime();
      const end = new Date(session.endAtUtc).getTime();
      if (end <= start) {
        return { success: false, error: 'זמן היציאה חייב להיות מאוחר מזמן הכניסה' };
      }
    }

    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      sessions[index] = {
        ...session,
        isManuallyEdited: true,
        updatedAtUtc: new Date().toISOString(),
      };
    } else {
      sessions.push({
        ...session,
        isManuallyEdited: true,
        createdAtUtc: new Date().toISOString(),
        updatedAtUtc: new Date().toISOString(),
      });
    }

    StorageService.saveWorkSessions(sessions);
    return { success: true };
  }

  /**
   * Deletes a session
   */
  static deleteSession(sessionId: string): void {
    const sessions = StorageService.getWorkSessions();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    StorageService.saveWorkSessions(filtered);
  }

  /**
   * Sets or updates a DayRecord status
   */
  static upsertDayRecord(dayRecord: DayRecord): void {
    const records = StorageService.getDayRecords();
    records[dayRecord.localDate] = {
      ...dayRecord,
      isManuallyEdited: true,
      updatedAtUtc: new Date().toISOString(),
    };
    StorageService.saveDayRecords(records);
  }

  /**
   * Clears all storage
   */
  static clearAllData(): void {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(DAY_RECORDS_KEY);
  }

  /**
   * Export database as JSON string
   */
  static exportJson(): string {
    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        settings: StorageService.getSettings(),
        sessions: StorageService.getWorkSessions(),
        dayRecords: StorageService.getDayRecords(),
      },
      null,
      2
    );
  }

  /**
   * Import database from JSON string
   */
  static importJson(jsonStr: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonStr);
      if (data.settings) StorageService.saveSettings(data.settings);
      if (Array.isArray(data.sessions)) StorageService.saveWorkSessions(data.sessions);
      if (data.dayRecords && typeof data.dayRecords === 'object') {
        StorageService.saveDayRecords(data.dayRecords);
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: 'קובץ לא תקין או פגום: ' + e.message };
    }
  }

  /**
   * Restores embedded user backup (saved from user export)
   */
  static restoreEmbeddedBackup(): { success: boolean; sessionsCount: number } {
    try {
      if (EMBEDDED_USER_BACKUP.settings) {
        StorageService.saveSettings(EMBEDDED_USER_BACKUP.settings);
      }
      if (Array.isArray(EMBEDDED_USER_BACKUP.sessions)) {
        StorageService.saveWorkSessions(EMBEDDED_USER_BACKUP.sessions);
      }
      if (EMBEDDED_USER_BACKUP.dayRecords) {
        StorageService.saveDayRecords(EMBEDDED_USER_BACKUP.dayRecords);
      }
      return { success: true, sessionsCount: EMBEDDED_USER_BACKUP.sessions.length };
    } catch (e) {
      console.error('Failed to restore embedded backup', e);
      return { success: false, sessionsCount: 0 };
    }
  }

  static getEmbeddedBackupInfo() {
    return {
      exportedAt: EMBEDDED_USER_BACKUP.exportedAt,
      sessionsCount: EMBEDDED_USER_BACKUP.sessions.length,
      hourlyRate: EMBEDDED_USER_BACKUP.settings.hourlyRate,
    };
  }

  /**
   * Populates demo data matching real Israel work shifts (06:57 - 10:00, 10:30 - 18:15)
   */
  static generateDemoData(): void {
    const today = new Date();
    const sessions: WorkSession[] = [];
    const dayRecords: Record<string, DayRecord> = {};

    // Generate for the current month and last month
    for (let dayOffset = 0; dayOffset < 45; dayOffset++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - dayOffset);
      
      const dateStr = toLocalDateString(targetDate);
      const dayOfWeek = targetDate.getDay();

      if (dayOfWeek === 6) {
        // Occasionally worked on Saturday
        if (dayOffset % 14 === 2) {
          const start = new Date(targetDate);
          start.setHours(9, 0, 0, 0);
          const end = new Date(targetDate);
          end.setHours(12, 30, 0, 0);

          sessions.push({
            id: 'demo_sat_' + dayOffset,
            localWorkDate: dateStr,
            startAtUtc: start.toISOString(),
            endAtUtc: end.toISOString(),
            timezoneOffsetMinutes: targetDate.getTimezoneOffset(),
            source: 'CLOCK',
            isManuallyEdited: false,
            createdAtUtc: start.toISOString(),
            updatedAtUtc: end.toISOString(),
            note: 'משמרת כפונטנלית שבת',
          });
        }
        continue;
      }

      if (dayOfWeek === 5) {
        // Occasionally worked on Friday
        if (dayOffset % 7 === 5) {
          const start = new Date(targetDate);
          start.setHours(8, 0, 0, 0);
          const end = new Date(targetDate);
          end.setHours(12, 0, 0, 0);

          sessions.push({
            id: 'demo_fri_' + dayOffset,
            localWorkDate: dateStr,
            startAtUtc: start.toISOString(),
            endAtUtc: end.toISOString(),
            timezoneOffsetMinutes: targetDate.getTimezoneOffset(),
            source: 'CLOCK',
            isManuallyEdited: false,
            createdAtUtc: start.toISOString(),
            updatedAtUtc: end.toISOString(),
            note: 'עבודת שישי',
          });
        }
        continue;
      }

      // Vacation day demo
      if (dayOffset === 10) {
        dayRecords[dateStr] = {
          localDate: dateStr,
          status: 'VACATION',
          creditedSeconds: 9 * 3600,
          note: 'חופשה שנתי',
          isManuallyEdited: true,
          createdAtUtc: new Date().toISOString(),
          updatedAtUtc: new Date().toISOString(),
        };
        continue;
      }

      // Sick day demo
      if (dayOffset === 18) {
        dayRecords[dateStr] = {
          localDate: dateStr,
          status: 'SICK',
          creditedSeconds: 9 * 3600,
          note: 'יום מחלה',
          isManuallyEdited: true,
          createdAtUtc: new Date().toISOString(),
          updatedAtUtc: new Date().toISOString(),
        };
        continue;
      }

      // Don't generate future sessions today
      if (dayOffset === 0) {
        // Generate shift starting at 06:57 as in screenshot!
        const shift1Start = new Date(targetDate);
        shift1Start.setHours(6, 57, 0, 0);

        // Keep session active for today demo
        sessions.push({
          id: 'demo_today_1',
          localWorkDate: dateStr,
          startAtUtc: shift1Start.toISOString(),
          endAtUtc: null, // active!
          timezoneOffsetMinutes: targetDate.getTimezoneOffset(),
          source: 'CLOCK',
          isManuallyEdited: false,
          createdAtUtc: shift1Start.toISOString(),
          updatedAtUtc: shift1Start.toISOString(),
          note: 'כניסה ראשית',
        });
        continue;
      }

      // Standard weekday shifts with break:
      // Session 1: 06:57 - 10:00
      // Break: 10:00 - 10:30
      // Session 2: 10:30 - 18:15 (or 17:30 depending on day)
      const endHour = dayOfWeek === 4 ? 17 : 18; // Thursday ends earlier or later
      const endMin = dayOffset % 2 === 0 ? 15 : 45;

      const s1Start = new Date(targetDate);
      s1Start.setHours(6, 57, 0, 0);
      const s1End = new Date(targetDate);
      s1End.setHours(10, 0, 0, 0);

      const s2Start = new Date(targetDate);
      s2Start.setHours(10, 30, 0, 0);
      const s2End = new Date(targetDate);
      s2End.setHours(endHour, endMin, 0, 0);

      sessions.push({
        id: `demo_${dayOffset}_1`,
        localWorkDate: dateStr,
        startAtUtc: s1Start.toISOString(),
        endAtUtc: s1End.toISOString(),
        timezoneOffsetMinutes: targetDate.getTimezoneOffset(),
        source: 'CLOCK',
        isManuallyEdited: false,
        createdAtUtc: s1Start.toISOString(),
        updatedAtUtc: s1End.toISOString(),
      });

      sessions.push({
        id: `demo_${dayOffset}_2`,
        localWorkDate: dateStr,
        startAtUtc: s2Start.toISOString(),
        endAtUtc: s2End.toISOString(),
        timezoneOffsetMinutes: targetDate.getTimezoneOffset(),
        source: 'CLOCK',
        isManuallyEdited: false,
        createdAtUtc: s2Start.toISOString(),
        updatedAtUtc: s2End.toISOString(),
      });
    }

    StorageService.saveWorkSessions(sessions);
    StorageService.saveDayRecords(dayRecords);
  }
}
