'use client';

import { useApp } from './providers';
import { format } from 'date-fns';
import { Check, Circle } from 'lucide-react';
import { QazaLog } from '@/lib/storage';

const PRAYERS: (keyof QazaLog)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'witr'];

export default function DailyTracker() {
  const { dailyLogs, toggleDailyPrayer } = useApp();
  const today = format(new Date(), 'yyyy-MM-dd');
  const logs = dailyLogs[today] || { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false, witr: false };

  const getLabel = (p: string) => p.charAt(0).toUpperCase() + p.slice(1);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
        Today's Prayers
        <span className="text-sm font-normal text-slate-400 ml-auto">{format(new Date(), 'MMM dd, yyyy')}</span>
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {PRAYERS.map((prayer) => {
           // @ts-ignore
           const isDone = logs[prayer];
           return (
             <button
               key={prayer}
               onClick={() => toggleDailyPrayer(today, prayer)}
               className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                 isDone 
                   ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                   : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-emerald-200'
               }`}
             >
               <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors ${
                 isDone ? 'bg-emerald-500 text-white' : 'bg-slate-200'
               }`}>
                 {isDone ? <Check className="w-5 h-5" /> : <Circle className="w-5 h-5 text-slate-400" />}
               </div>
               <span className="font-semibold text-sm">{getLabel(prayer)}</span>
             </button>
           );
        })}
      </div>
    </div>
  );
}
