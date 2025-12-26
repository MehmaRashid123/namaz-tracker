'use client';

import { useState } from 'react';
import { useApp } from './providers';
import { format, subDays, eachDayOfInterval, isToday } from 'date-fns';
import { Check, X, Filter, Calendar as CalendarIcon } from 'lucide-react';

const FARZ = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'witr'];
const NAWAFIL = ['tahajjud', 'ishraq', 'chasht'];

export default function HistoryCalendar() {
  const { dailyLogs } = useApp();
  const [filter, setFilter] = useState<'all' | 'farz' | 'nawafil'>('all');

  // Generate last 30 days
  const today = new Date();
  const days = eachDayOfInterval({
    start: subDays(today, 29),
    end: today,
  }).reverse(); // Latest first

  const getPrayerStatus = (dateStr: string, prayer: string) => {
    const log = dailyLogs[dateStr];
    // @ts-ignore
    return log ? log[prayer] : false;
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-emerald-600" />
              Prayer History (Last 30 Days)
            </h2>
            <p className="text-sm text-slate-400 mt-1">Detailed record of your daily prayers</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['all', 'farz', 'nawafil'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  filter === f 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          
          return (
            <div 
              key={dateStr}
              className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${
                isToday(day) ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-slate-100'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Date Side */}
                <div className="min-w-[120px]">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {format(day, 'EEEE')}
                  </p>
                  <p className={`text-lg font-bold ${isToday(day) ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {format(day, 'MMM dd')}
                  </p>
                </div>

                {/* Prayers Grid */}
                <div className="flex-1 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                  {/* Farz */}
                  {(filter === 'all' || filter === 'farz') && FARZ.map(p => {
                    const done = getPrayerStatus(dateStr, p);
                    return (
                      <div key={p} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${
                          done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'
                        }`}>
                          {done ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">{p.slice(0, 3)}</span>
                      </div>
                    );
                  })}

                  {/* Nawafil */}
                  {(filter === 'all' || filter === 'nawafil') && NAWAFIL.map(p => {
                    const done = getPrayerStatus(dateStr, p);
                    return (
                      <div key={p} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${
                          done ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-300'
                        }`}>
                          {done ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">{p.slice(0, 3)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}