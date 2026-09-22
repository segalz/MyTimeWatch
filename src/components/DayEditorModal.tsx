import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, AlertCircle } from 'lucide-react';
import { StorageService } from '../services/storage';
import { DayStatus, WorkSession } from '../types';
import { toLocalDateString } from '../domain/attendance';
import { Time24Input } from './Time24Input';

interface DayEditorModalProps {
  isOpen: boolean;
  sessionToEdit?: WorkSession;
  defaultDate?: string;
  onClose: () => void;
  onSaved: () => void;
}

export const DayEditorModal: React.FC<DayEditorModalProps> = ({
  isOpen,
  sessionToEdit,
  defaultDate,
  onClose,
  onSaved,
}) => {
  const isEditing = !!sessionToEdit;

  const getHHMM = (isoStr?: string | null) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const [dateStr, setDateStr] = useState('');
  const [reportType, setReportType] = useState<DayStatus>('WORK');
  const [startTimeStr, setStartTimeStr] = useState('08:00');
  const [endTimeStr, setEndTimeStr] = useState('17:00');
  const [isOpenSession, setIsOpenSession] = useState(false);
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      const targetDate = sessionToEdit
        ? sessionToEdit.localWorkDate
        : defaultDate || toLocalDateString(new Date());

      setDateStr(targetDate);

      const dayRecords = StorageService.getDayRecords();
      const dayRecord = dayRecords[targetDate];

      if (sessionToEdit) {
        setReportType('WORK');
        const start = getHHMM(sessionToEdit.startAtUtc) || '08:00';
        const end = getHHMM(sessionToEdit.endAtUtc) || '17:00';
        setStartTimeStr(start);
        setEndTimeStr(end);
        setIsOpenSession(!sessionToEdit.endAtUtc);
        setNote(sessionToEdit.note || '');
      } else if (dayRecord && dayRecord.status !== 'WORK') {
        setReportType(dayRecord.status);
        setStartTimeStr('08:00');
        setEndTimeStr('17:00');
        setIsOpenSession(false);
        setNote(dayRecord.note || '');
      } else {
        setReportType('WORK');
        setStartTimeStr('08:00');
        setEndTimeStr('17:00');
        setIsOpenSession(false);
        setNote('');
      }

      setErrorMsg(null);
    }
  }, [isOpen, sessionToEdit, defaultDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // If non-WORK status selected (Vacation, Sick, Holiday, Missing Report)
    if (reportType !== 'WORK') {
      const dateObj = new Date(`${dateStr}T12:00:00`);
      const dayOfWeek = dateObj.getDay();
      const settings = StorageService.getSettings();
      const reqSec = settings.schedule[dayOfWeek]?.requiredSeconds || 9 * 3600;

      let creditedSeconds = 0;
      let vacationDaysDeducted = 0;
      if (reportType === 'VACATION') {
        creditedSeconds = reqSec > 0 ? reqSec : 9 * 3600;
        vacationDaysDeducted = 1;
      } else if (reportType === 'EVE_OF_HOLIDAY') {
        creditedSeconds = reqSec > 0 ? reqSec : 9 * 3600;
        vacationDaysDeducted = 0.5;
      } else if (reportType === 'SICK' || reportType === 'HOLIDAY') {
        creditedSeconds = reqSec > 0 ? reqSec : 9 * 3600;
      }

      StorageService.upsertDayRecord({
        localDate: dateStr,
        status: reportType,
        creditedSeconds,
        vacationDaysDeducted,
        note: note.trim() || undefined,
        isManuallyEdited: true,
        createdAtUtc: new Date().toISOString(),
        updatedAtUtc: new Date().toISOString(),
      });

      onSaved();
      onClose();
      return;
    }

    // WORK (hours entry) status
    if (!startTimeStr) {
      setErrorMsg('יש להזין שעת כניסה');
      return;
    }

    const startObj = new Date(`${dateStr}T${startTimeStr}:00`);
    if (isNaN(startObj.getTime())) {
      setErrorMsg('שעת כניסה אינה תקינה');
      return;
    }

    let endUtc: string | null = null;
    if (!isOpenSession) {
      if (!endTimeStr) {
        setErrorMsg('יש להזין שעת יציאה או לסמן כמשמרת פעילה');
        return;
      }
      const endObj = new Date(`${dateStr}T${endTimeStr}:00`);
      if (isNaN(endObj.getTime())) {
        setErrorMsg('שעת יציאה אינה תקינה');
        return;
      }

      if (endObj.getTime() <= startObj.getTime()) {
        setErrorMsg('שעת יציאה חייבת להיות מאוחרת משעת כניסה');
        return;
      }

      endUtc = endObj.toISOString();
    }

    const sessionData: WorkSession = {
      id: sessionToEdit ? sessionToEdit.id : 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      localWorkDate: dateStr,
      startAtUtc: startObj.toISOString(),
      endAtUtc: endUtc,
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
      source: sessionToEdit ? sessionToEdit.source : 'MANUAL',
      isManuallyEdited: true,
      createdAtUtc: sessionToEdit ? sessionToEdit.createdAtUtc : new Date().toISOString(),
      updatedAtUtc: new Date().toISOString(),
      note: note.trim() || undefined,
    };

    const res = StorageService.upsertSession(sessionData);
    if (res.success) {
      // Clear any conflicting non-WORK day record if previously set
      const dayRecords = StorageService.getDayRecords();
      if (dayRecords[dateStr] && dayRecords[dateStr].status !== 'WORK') {
        StorageService.upsertDayRecord({
          ...dayRecords[dateStr],
          status: 'WORK',
          creditedSeconds: 0,
        });
      }

      onSaved();
      onClose();
    } else {
      setErrorMsg(res.error || 'שגיאה בשמירת הדיווח');
    }
  };

  return (
    <AnimatePresence>
      <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 z-10 border border-slate-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-2 space-x-reverse font-extrabold text-slate-800 text-base">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>{isEditing ? 'עריכת דיווח משמרת' : 'דיווח משמרת / יום'}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="mb-3 p-2.5 bg-rose-100 text-rose-800 text-xs rounded-lg font-semibold flex items-center space-x-1.5 space-x-reverse">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Date Field */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">תאריך הדיווח:</label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800"
              />
            </div>

            {/* Report Type Selector */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">סוג הדיווח:</label>
              <div className="grid grid-cols-3 gap-1.5 text-2xs">
                {[
                  { id: 'WORK', label: 'שעות עבודה' },
                  { id: 'VACATION', label: 'חופשה' },
                  { id: 'EVE_OF_HOLIDAY', label: 'ערב חג' },
                  { id: 'HOLIDAY', label: 'חג' },
                  { id: 'SICK', label: 'מחלה' },
                  { id: 'MISSING', label: 'חוסר דיווח' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setReportType(st.id as DayStatus)}
                    className={`py-2 px-1 rounded-lg font-bold transition-all text-center ${
                      reportType === st.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Non-work status helpful information box */}
            {reportType !== 'WORK' && (
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-2xs text-slate-600 leading-relaxed">
                {reportType === 'EVE_OF_HOLIDAY' && (
                  <span className="text-teal-800 font-medium">
                    ערב חג: ללא תקן עבודה (בדומה לחג). נספר כ-0.5 יום חופש על חשבון העובד (ו-0.5 על המעסיק) לצורך צבירת/ניצול חופשה.
                  </span>
                )}
                {reportType === 'VACATION' && (
                  <span>יום חופשה: מזוכה בתקן מלא ללא חוסר, נספר כ-1 יום חופש.</span>
                )}
                {reportType === 'HOLIDAY' && (
                  <span>יום חג: מזוכה בתקן מלא ללא חוסר (ללא ניכוי ימי חופשה).</span>
                )}
                {reportType === 'SICK' && (
                  <span>יום מחלה: מזוכה בתקן מלא לפי חוק דמי מחלה.</span>
                )}
                {reportType === 'MISSING' && (
                  <span className="text-rose-700">חוסר דיווח: יום שלא דווחו בו שעות או סיבת היעדרות.</span>
                )}
              </div>
            )}

            {/* Conditional Fields based on Report Type */}
            {reportType === 'WORK' ? (
              <>
                {/* Start & End Times */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">שעת כניסה:</label>
                    <Time24Input
                      value={startTimeStr}
                      onChange={setStartTimeStr}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">שעת יציאה:</label>
                    <Time24Input
                      value={endTimeStr}
                      onChange={setEndTimeStr}
                      disabled={isOpenSession}
                    />
                  </div>
                </div>

                {/* Checkbox Open Session */}
                <div className="flex items-center space-x-2 space-x-reverse pt-0.5">
                  <input
                    type="checkbox"
                    id="isOpenSession"
                    checked={isOpenSession}
                    onChange={(e) => setIsOpenSession(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="isOpenSession" className="text-slate-700 font-semibold cursor-pointer">
                    משמרת פעילה כרגע (ללא שעת יציאה)
                  </label>
                </div>
              </>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-xs text-center space-y-1">
                {reportType === 'VACATION' && <p className="font-bold text-blue-700">דיווח חופשה</p>}
                {reportType === 'SICK' && <p className="font-bold text-amber-700">דיווח יום מחלה</p>}
                {reportType === 'HOLIDAY' && <p className="font-bold text-purple-700">דיווח יום חג</p>}
                {reportType === 'MISSING' && <p className="font-bold text-rose-700">סימון חוסר דיווח</p>}
                <p className="text-2xs text-slate-500">
                  {reportType === 'MISSING'
                    ? 'ביום זה לא יירשמו שעות עבודה או זיכוי.'
                    : 'יירשם זיכוי שעות תקן אוטומטי ליום זה.'}
                </p>
              </div>
            )}

            {/* Note Field */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">הערה לדיווח (אופציונלי):</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="הזן הערה קצרה..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2 space-x-reverse pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                ביטול
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
              >
                שמור דיווח
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
