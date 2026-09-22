import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Database, RefreshCw, FileText, Info, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { StorageService } from '../services/storage';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmDemo, setShowConfirmDemo] = useState(false);

  const handleRestoreUserBackup = () => {
    StorageService.restoreEmbeddedBackup();
    onDataChanged();
    setShowConfirmRestore(false);
    onClose();
  };

  const handleGenerateDemoData = () => {
    StorageService.generateDemoData();
    onDataChanged();
    setShowConfirmDemo(false);
    onClose();
  };

  const handleClearAllData = () => {
    StorageService.clearAllData();
    onDataChanged();
    setShowConfirmClear(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900 z-40"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            dir="rtl"
            className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-4 bg-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-sm">
                  סצ
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">סגל צבי (30000241)</h3>
                  <p className="text-xs text-slate-300">חברת נמלי ישראל • מתכנת</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
                  פעולות מהירות
                </h4>
                
                <button
                  onClick={() => setShowConfirmRestore(true)}
                  className="w-full flex items-center space-x-3 space-x-reverse px-3 py-2.5 rounded-lg text-slate-800 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 transition-colors text-right border border-emerald-200/80"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="flex flex-col text-right">
                    <span className="font-bold text-sm text-emerald-900">שחזר דוח נוכחות מקורי</span>
                    <span className="text-xs text-emerald-700">121.78 שעות (נמלי ישראל) + שכר 159.3 ₪</span>
                  </div>
                </button>

                <button
                  onClick={() => setShowConfirmDemo(true)}
                  className="w-full flex items-center space-x-3 space-x-reverse px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors text-right"
                >
                  <Database className="w-5 h-5 text-slate-500" />
                  <div className="flex flex-col text-right">
                    <span className="font-semibold text-sm">טען נתוני הדגמה</span>
                    <span className="text-xs text-slate-500">טעינת דיווחים לדוגמה לבדיקת דוח חודשי</span>
                  </div>
                </button>

                <button
                  onClick={() => setShowConfirmClear(true)}
                  className="w-full flex items-center space-x-3 space-x-reverse px-3 py-2.5 rounded-lg text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors text-right"
                >
                  <RefreshCw className="w-5 h-5 text-rose-600" />
                  <div className="flex flex-col text-right">
                    <span className="font-semibold text-sm">איפוס נתונים</span>
                    <span className="text-xs text-slate-500">מחיקת כל הדיווחים מהמכשיר</span>
                  </div>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
                  כללי תקן שעות (ישראל)
                </h4>
                
                <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1.5 text-slate-600 border border-slate-200/60">
                  <div className="flex justify-between">
                    <span>א׳ - ד׳:</span>
                    <span className="font-bold text-slate-800">09:00 שעות</span>
                  </div>
                  <div className="flex justify-between">
                    <span>חמישי:</span>
                    <span className="font-bold text-slate-800">08:30 שעות</span>
                  </div>
                  <div className="flex justify-between">
                    <span>שישי:</span>
                    <span className="font-bold text-slate-800">ללא תקן (100%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>שבת:</span>
                    <span className="font-bold text-slate-800">מנוחה (150%)</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse text-slate-600 text-xs px-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>אפליקציה פרטית - נתונים שמורים מקומית</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 font-semibold">
              WorkLog Pro • גרסה 2.0.0
            </div>
          </motion.div>

          {/* Confirmation Modals */}
          {showConfirmRestore && (
            <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
              <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-2xl border border-slate-200 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-slate-800">שחזור דוח נוכחות מקורי</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    פעולה זו תשחזר במדויק את כל 12 ימי העבודה מחברת נמלי ישראל (121.78 שעות), ימי חג, היעדרות ותעריף 159.3 ₪ לשעה.
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
                    onClick={() => setShowConfirmRestore(false)}
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
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-slate-800">איפוס מלא של כל הנתונים</h4>
                  <p className="text-xs text-slate-500">אזהרה: פעולה זו תמחק את כל הדיווחים וההגדרות באפליקציה ולא ניתן לשחזרם!</p>
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
        </>
      )}
    </AnimatePresence>
  );
};
