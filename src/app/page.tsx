'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers';
import DashboardHeader from '@/components/dashboard-header';
import DailyTracker from '@/components/daily-tracker';
import QazaTracker from '@/components/qaza-tracker';
import ProgressSummary from '@/components/progress-summary';

export default function Home() {
  const { user, profile, loading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!profile) {
        router.push('/onboarding');
      }
    }
  }, [user, profile, loading, router]);

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-emerald-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <DashboardHeader />
      
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <ProgressSummary />
        <DailyTracker />
        <QazaTracker />
      </main>
    </div>
  );
}