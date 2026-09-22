/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { MonthlyReportView } from './components/MonthlyReportView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { BottomNavigation } from './components/BottomNavigation';
import { SidebarDrawer } from './components/SidebarDrawer';
import { DayEditorModal } from './components/DayEditorModal';
import { StorageService } from './services/storage';
import { toLocalDateString } from './domain/attendance';
import { ActiveTab, AppSettings, DayRecord, WorkSession } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [sessions, setSessions] = useState<WorkSession[]>(() => StorageService.getWorkSessions());
  const [dayRecords, setDayRecords] = useState<Record<string, DayRecord>>(() =>
    StorageService.getDayRecords()
  );

  const [selectedDateForReports, setSelectedDateForReports] = useState<string>(() =>
    toLocalDateString(new Date())
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<WorkSession | undefined>(undefined);

  // Auto seed demo data if completely empty on first run
  useEffect(() => {
    const existing = StorageService.getWorkSessions();
    if (existing.length === 0) {
      StorageService.generateDemoData();
      refreshData();
    }
  }, []);

  const refreshData = () => {
    setSettings(StorageService.getSettings());
    setSessions(StorageService.getWorkSessions());
    setDayRecords(StorageService.getDayRecords());
  };

  const handleOpenSessionModal = (session?: WorkSession, defaultDate?: string) => {
    setSessionToEdit(session);
    if (defaultDate) setSelectedDateForReports(defaultDate);
    setIsSessionModalOpen(true);
  };

  const handleSelectDayFromMonthly = (dateStr: string) => {
    setSelectedDateForReports(dateStr);
    setActiveTab('reports');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-200/80 flex flex-col items-center justify-center font-sans antialiased text-slate-800">
      {/* Outer Mobile Frame Container */}
      <div className="w-full max-w-md h-[100dvh] sm:h-[880px] sm:my-4 sm:rounded-3xl bg-slate-50 shadow-2xl overflow-hidden flex flex-col relative border border-slate-300/80">
        
        {/* Top App Header */}
        <Header onOpenDrawer={() => setIsDrawerOpen(true)} />

        {/* Dynamic Tab Views */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          {activeTab === 'home' && (
            <HomeView
              settings={settings}
              sessions={sessions}
              dayRecords={dayRecords}
              onRefreshData={refreshData}
              onNavigateToReports={() => setActiveTab('reports')}
            />
          )}

          {activeTab === 'monthly' && (
            <MonthlyReportView
              settings={settings}
              sessions={sessions}
              dayRecords={dayRecords}
              onSelectDayForEdit={handleSelectDayFromMonthly}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              settings={settings}
              sessions={sessions}
              dayRecords={dayRecords}
              selectedDate={selectedDateForReports}
              onSelectDate={setSelectedDateForReports}
              onRefreshData={refreshData}
              onOpenSessionModal={handleOpenSessionModal}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView settings={settings} onRefreshData={refreshData} />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        />

        {/* Sidebar Drawer */}
        <SidebarDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onDataChanged={refreshData}
        />

        {/* Add/Edit Work Session Modal */}
        <DayEditorModal
          isOpen={isSessionModalOpen}
          sessionToEdit={sessionToEdit}
          defaultDate={selectedDateForReports}
          onClose={() => setIsSessionModalOpen(false)}
          onSaved={refreshData}
        />
      </div>
    </div>
  );
}
