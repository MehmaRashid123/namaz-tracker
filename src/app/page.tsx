'use client';

import { useState } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import DailyTracker from '@/components/daily-tracker';
import QazaTracker from '@/components/qaza-tracker';
import ProgressSummary from '@/components/progress-summary';
import HistoryCalendar from '@/components/history-calendar';
import VoiceCommand from '@/components/voice-command';
import { useApp } from '@/components/providers';
import { LayoutDashboard, Calendar } from 'lucide-react';

export default function Home() {
  const { user, profile, loading } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
        Loading your progress...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'dashboard' ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <DailyTracker />
                <QazaTracker />
              </div>
              <div className="space-y-8">
                <ProgressSummary />
              </div>
            </div>
          </>
        ) : (
          <HistoryCalendar />
        )}
      </div>

      <VoiceCommand />

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-slate-200 shadow-2xl rounded-full px-6 py-3 flex items-center gap-8 z-50">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
        </button>
      </div>
    </main>
  );
}