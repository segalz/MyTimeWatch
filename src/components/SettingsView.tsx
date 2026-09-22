import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { AppSettings } from '../types';
import {
  Save,
  DollarSign,
  Clock,
  Calendar,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Share2,
  Copy,
  FileText,
  X,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onRefreshData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onRefreshData,
}) => {
  const [formState, setFormState] = useState<AppSettings>(settings);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showConfirmRestoreBackup, setShowConfirmRestoreBackup] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmDemo, setShowConfirmDemo] = useState(false);
  const [showTextBackupModal, setShowTextBackupModal] = useState(false);
  const [backupText, setBackupText] = useState('');
  const [restoreInputText, setRestoreInputText] = useState('');
  const [textModalTab, setTextModalTab] = useState<'export' | 'import'>('export');

  const showToast = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(formState);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
    onRefreshData();
  };

  const handleRestoreUserBackup = () => {
    const res = StorageService.restoreEmbeddedBackup();
    if (res.success) {
      showToast(`הנתונים שוחזרו בהצלחה! (${res.sessionsCount} משמרות + שכר ${StorageService.getSettings().hourlyRate} ₪)`);
      onRefreshData();
      setShowConfirmRestoreBackup(false);
    } else {
      showToast('שגיאה בשחזור הנתונים');
    }
  };

  const handleExportJson = async () => {
    const jsonStr = StorageService.exportJson();
    const dateStr = new Date().toISOString().substring(0, 10);
    const fileName = `attendance_backup_${dateStr}.json`;

    // 1. Try native Web Share API with File (Supported in newer WebViews and Mobile Browsers)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        let fileObj: File | null = null;
        try {
          fileObj = new File([jsonStr], fileName, { type: 'application/json' });
        } catch {
          fileObj = null;
        }

        if (fileObj && navigator.canShare && navigator.canShare({ files: [fileObj] })) {
          await navigator.share({
            title: 'גיבוי דיווחי נוכחות',
            files: [fileObj],
          });
          showToast('קובץ הגיבוי שותף בהצלחה!');
          return;
        } else {
          // If file sharing is not supported by the WebView share target, share as structured text
          await navigator.share({
            title: 'גיבוי דיווחי נוכחות',
            text: jsonStr,
          });
          showToast('טקסט הגיבוי שותף בהצלחה! (ניתן לשלוח לוואטסאפ או למייל)');
          return;
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return; // User closed sheet
      }
    }

    // 2. Android WebView Blob / Data-URI download trigger
    try {
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 500);
      showToast('הורדת קובץ הגיבוי הופעלה');
      return;
    } catch {
      // Fallback below
    }

    // 3. If WebView restricts local blob downloads, automatically copy and open modal
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonStr);
      }
    } catch {
      // ignore
    }
    setBackupText(jsonStr);
    setTextModalTab('export');
    setShowTextBackupModal(true);
    showToast('חלון הגיבוי נפתח (הטקסט הועתק גם ללוח)');
  };

  const handleCopyBackupToClipboard = async () => {
    const jsonStr = StorageService.exportJson();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonStr);
        showToast('כל נתוני הגיבוי הועתקו ללוח בהצלחה! ניתן להדביק בוואטסאפ או בפתקים.');
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch {
      setBackupText(jsonStr);
      setTextModalTab('export');
      setShowTextBackupModal(true);
    }
  };

  const handleOpenTextModal = (tab: 'export' | 'import') => {
    setBackupText(StorageService.exportJson());
    setRestoreInputText('');
    setTextModalTab(tab);
    setImportError(null);
    setShowTextBackupModal(true);
  };

  const handleRestoreFromText = () => {
    if (!restoreInputText.trim()) {
      setImportError('נא להדביק טקסט גיבוי תקין בתיבה');
      return;
    }
    const res = StorageService.importJson(restoreInputText.trim());
    if (res.success) {
      showToast('כל הנתונים שוחזרו בהצלחה!');
      onRefreshData();
      setShowTextBackupModal(false);
      setRestoreInputText('');
      setImportError(null);
    } else {
      setImportError(res.error || 'שגיאה בשחזור הנתונים');
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = StorageService.importJson(content);
      if (res.success) {
        showToast('הנתונים יובאו בהצלחה!');
        onRefreshData();
      } else {
        setImportError(res.error || 'שגיאה בייבוא הקובץ');
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateDemoData = () => {
    StorageService.generateDemoData();
    onRefreshData();
    setShowConfirmDemo(false);
    showToast('נתוני הדגמה נטענו בהצלחה!');
  };

  const handleClearAllData = () => {
    StorageService.clearAllData();
    onRefreshData();
    setShowConfirmClear(false);
    showToast('כל הנתונים נמחקו מהמכשיר');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full space-y-4 pb-20 select-none">
      <form onSubmit={handleSave} className="space-y-4">
        {/* Save Bar */}
        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center space-x-2 space-x-reverse text-slate-800 font-bold">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>הגדרות אפליקציה</span>
          </div>

          <button
            type="submit"
            className="flex items-center space-x-1 space-x-reverse bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-2xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>שמור שינויים</span>
          </button>
        </div>

        {savedFeedback && (
          <div className="p-2.5 bg-emerald-100 text-emerald-800 text-xs rounded-lg font-semibold flex items-center justify-center space-x-1 space-x-reverse">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>ההגדרות נשמרו בהצלחה</span>
          </div>
        )}

        {/* Salary Settings Card */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5 space-x-reverse">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>הגדרות שכר ותעריפים</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                תעריף שעתי בסיסי (₪ לשעה):
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formState.hourlyRate}
                onChange={(e) =>
                  setFormState({ ...formState, hourlyRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-slate-600 mb-1">מכפיל שעות נוספות (125%):</label>
                <input
                  type="number"
                  step="0.05"
                  value={formState.overtime125Multiplier}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      overtime125Multiplier: parseFloat(e.target.value) || 1.25,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">מכפיל שעות נוספות (150%):</label>
                <input
                  type="number"
                  step="0.05"
                  value={formState.overtime150Multiplier}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      overtime150Multiplier: parseFloat(e.target.value) || 1.5,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">מכפיל עבודת שישי:</label>
                <input
                  type="number"
                  step="0.05"
                  value={formState.fridayMultiplier}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      fridayMultiplier: parseFloat(e.target.value) || 1.0,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">מכפיל עבודת שבת:</label>
                <input
                  type="number"
                  step="0.05"
                  value={formState.saturdayMultiplier}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      saturdayMultiplier: parseFloat(e.target.value) || 1.5,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Daily Schedule Standards */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5 space-x-reverse">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>תקן שעות יומי לפי ימי השבוע</span>
          </h3>

          <div className="space-y-2 text-xs">
            {[
              { day: 0, label: 'ראשון (תקן default 09:00)' },
              { day: 1, label: 'שני (תקן default 09:00)' },
              { day: 2, label: 'שלישי (תקן default 09:00)' },
              { day: 3, label: 'רביעי (תקן default 09:00)' },
              { day: 4, label: 'חמישי (תקן default 08:30)' },
              { day: 5, label: 'שישי (ללא תקן)' },
              { day: 6, label: 'שבת (מנוחה שבועית)' },
            ].map(({ day, label }) => {
              const currentSec = formState.schedule[day]?.requiredSeconds || 0;
              const currentHours = (currentSec / 3600).toFixed(1);

              return (
                <div key={day} className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-700 font-medium">{label}</span>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={currentHours}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormState({
                          ...formState,
                          schedule: {
                            ...formState.schedule,
                            [day]: { requiredSeconds: val * 3600 },
                          },
                        });
                      }}
                      className="w-16 bg-slate-50 border border-slate-200 rounded p-1 text-center font-mono font-bold text-slate-800"
                    />
                    <span className="text-2xs text-slate-500">שעות</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Overtime Section */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              חישוב שעות נוספות שבועיות
            </h3>
            <input
              type="checkbox"
              checked={formState.weeklyOvertimeEnabled}
              onChange={(e) =>
                setFormState({ ...formState, weeklyOvertimeEnabled: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 rounded"
            />
          </div>

          {formState.weeklyOvertimeEnabled && (
            <div className="text-xs space-y-2 pt-1 border-t border-slate-100">
              <p className="text-2xs text-slate-500">
                מחשב שעות נוספות שבועיות במידה והשעות הרגילות בשבוע עוברות סף מוגדר.
              </p>
              <div className="flex items-center justify-between">
                <label className="text-slate-700 font-medium">סף שעות שבועי (שעות):</label>
                <input
                  type="number"
                  step="1"
                  value={
                    formState.weeklyOvertimeThresholdSeconds
                      ? formState.weeklyOvertimeThresholdSeconds / 3600
                      : 42
                  }
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setFormState({
                      ...formState,
                      weeklyOvertimeThresholdSeconds: isNaN(val) ? null : val * 3600,
                    });
                  }}
                  className="w-20 bg-slate-50 border border-slate-200 rounded p-1 font-mono text-center font-bold text-slate-800"
                />
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Data Backup & Maintenance */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5 space-x-reverse">
            <Database className="w-4 h-4 text-slate-600" />
            <span>גיבוי ושחזור נתונים</span>
          </h3>
          <span className="text-3xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
            בטוח במכשיר
          </span>
        </div>

        {/* APK Safety Info Card */}
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-lg p-2.5 text-3xs text-emerald-900 space-y-1">
          <div className="font-bold flex items-center space-x-1 space-x-reverse">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>שמירת נתונים בעדכון גרסה (APK):</span>
          </div>
          <p className="leading-relaxed text-emerald-800">
            התקנת גרסה חדשה ישירות על האפליקציה הקיימת (לחיצה על "עדכן" / Update) שומרת על כל השעות וההגדרות במכשיר.
            הנתונים נמחקים <strong>רק</strong> אם מבצעים "הסר התקנה" (Uninstall).
          </p>
        </div>

        {importError && (
          <div className="p-2 bg-rose-100 text-rose-800 text-xs rounded-lg flex items-center space-x-1 space-x-reverse">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center justify-center space-x-1.5 space-x-reverse bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl font-bold shadow-xs transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>שתף / שמור גיבוי</span>
          </button>

          <label className="flex items-center justify-center space-x-1.5 space-x-reverse bg-slate-100 hover:bg-slate-200 text-slate-800 p-2.5 rounded-xl font-semibold cursor-pointer transition-colors border border-slate-200">
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>ייבא מקובץ JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>
        </div>

        {/* Quick Clipboard Backup / Restore */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <button
            type="button"
            onClick={handleCopyBackupToClipboard}
            className="flex items-center justify-center space-x-1 space-x-reverse bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 p-2 rounded-lg font-semibold transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>העתק גיבוי ללוח</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenTextModal('export')}
            className="flex items-center justify-center space-x-1 space-x-reverse bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 p-2 rounded-lg font-semibold transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>צפייה בטקסט הגיבוי</span>
          </button>
        </div>

        {/* Embedded Safe Backup Restore Button */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowConfirmRestoreBackup(true)}
            className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-xl font-bold transition-all shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>שחזר גיבוי אחרון (43 משמרות + הגדרות)</span>
          </button>
          <p className="text-3xs text-slate-400 text-center mt-1">
            משחזר ישירות את הנתונים שלך (כולל תעריף 159.3 ₪ והדיווחים עד ספטמבר)
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
          <button
            type="button"
            onClick={() => setShowConfirmDemo(true)}
            className="text-slate-600 hover:text-slate-800 font-semibold bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
          >
            טען נתוני הדגמה
          </button>

          <button
            type="button"
            onClick={() => setShowConfirmClear(true)}
            className="text-rose-600 hover:text-rose-800 font-bold flex items-center space-x-1 space-x-reverse"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>אפס את כל הנתונים</span>
          </button>
        </div>
      </div>

      {/* App Version Info Footer */}
      <div className="text-center py-2 text-2xs text-slate-400 select-none">
        דיווח נוכחות • גרסה 1.4.0
      </div>

      {/* Action Toast Feedback */}
      {actionFeedback && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-4 py-2 rounded-full shadow-lg z-50 flex items-center space-x-2 space-x-reverse">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Confirm Modals */}
      {showConfirmRestoreBackup && (
        <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-base text-slate-800">שחזור נתונים מגיבוי</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                האם לשחזר את הגיבוי האחרון שנשמר במערכת?
                <br />
                <span className="font-semibold text-slate-800">43 משמרות עבודה, הגדרות שכר (159.3 ₪ לשעה) ותקן מלא.</span>
              </p>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse pt-2">
              <button
                onClick={handleRestoreUserBackup}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                שחזר עכשיו
              </button>
              <button
                onClick={() => setShowConfirmRestoreBackup(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDemo && (
        <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Database className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-base text-slate-800">טעינת נתוני הדגמה</h4>
              <p className="text-xs text-slate-500">האם להטעין נתוני דיווחים לדוגמה? (נתונים קיימים יישמרו)</p>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse pt-2">
              <button
                onClick={handleGenerateDemoData}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                טען נתונים
              </button>
              <button
                onClick={() => setShowConfirmDemo(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmClear && (
        <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-base text-slate-800">איפוס מלא של הנתונים</h4>
              <p className="text-xs text-slate-500">אזהרה: פעולה זו תמחק את כל הדיווחים וההגדרות מהמכשיר!</p>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse pt-2">
              <button
                onClick={handleClearAllData}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                אפס הכל
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Text Backup & Restore Modal */}
      {showTextBackupModal && (
        <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-4 w-full max-w-sm shadow-2xl border border-slate-200 space-y-3 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-sm text-slate-800 flex items-center space-x-1.5 space-x-reverse">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>גיבוי ושחזור נתונים (טקסט)</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowTextBackupModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setTextModalTab('export');
                  setBackupText(StorageService.exportJson());
                  setImportError(null);
                }}
                className={`flex-1 py-1.5 rounded-md transition-colors ${
                  textModalTab === 'export'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                העתקת גיבוי
              </button>
              <button
                type="button"
                onClick={() => {
                  setTextModalTab('import');
                  setImportError(null);
                }}
                className={`flex-1 py-1.5 rounded-md transition-colors ${
                  textModalTab === 'import'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                שחזור מהדבקה
              </button>
            </div>

            {importError && (
              <div className="p-2 bg-rose-100 text-rose-800 text-xs rounded-lg flex items-center space-x-1 space-x-reverse">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {textModalTab === 'export' ? (
              <div className="space-y-2 flex-1 flex flex-col min-h-0">
                <p className="text-3xs text-slate-500">
                  כל הדיווחים וההגדרות שלך מופיעים כאן. ניתן להעתיק ולשמור אותם בפתקים או לשלוח בוואטסאפ:
                </p>
                <textarea
                  readOnly
                  dir="ltr"
                  value={backupText}
                  className="w-full flex-1 min-h-[140px] max-h-[220px] p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-3xs text-slate-700 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyBackupToClipboard}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1.5 space-x-reverse shadow-xs"
                >
                  <Copy className="w-4 h-4" />
                  <span>העתק את כל הטקסט ללוח</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 flex-1 flex flex-col min-h-0">
                <p className="text-3xs text-slate-500">
                  הדבק כאן את טקסט הגיבוי ששמרת בעבר ולחץ על שחזור:
                </p>
                <textarea
                  dir="ltr"
                  placeholder='{"version": 1, "sessions": [...] }'
                  value={restoreInputText}
                  onChange={(e) => setRestoreInputText(e.target.value)}
                  className="w-full flex-1 min-h-[140px] max-h-[220px] p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-3xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleRestoreFromText}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1.5 space-x-reverse shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>שחזר את הנתונים עכשיו</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
