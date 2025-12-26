'use client';

import { useApp } from './providers';
import { Minus } from 'lucide-react';
import { QazaLog } from '@/lib/storage';

const PRAYERS: (keyof QazaLog)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'witr'];

export default function QazaTracker() {
  const { qaza, decrementQaza } = useApp();

  const getLabel = (p: string) => p.charAt(0).toUpperCase() + p.slice(1);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
        Qaza-e-Umri (Pending vs Performed)
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRAYERS.map((prayer) => {
          if (prayer === 'performed') return null;
          // @ts-ignore
          const remaining = qaza[prayer] as number;
          // @ts-ignore
          const performed = qaza.performed ? qaza.performed[prayer] || 0 : 0;

          return (
          <div key={prayer} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 relative overflow-hidden">
             {/* Progress Background Hint - optional, kept simple for now */}
             
            <div className="z-10">
              <h3 className="font-semibold text-slate-700 mb-1">{getLabel(prayer)}</h3>
              <div className="flex gap-4">
                  <div>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Remaining</p>
                      <p className="text-xl font-bold text-slate-900">{remaining.toLocaleString()}</p>
                  </div>
                  <div className="w-px bg-slate-200"></div>
                  <div>
                      <p className="text-xs text-emerald-600 uppercase font-bold tracking-wider">Offered</p>
                      <p className="text-xl font-bold text-emerald-600">+{performed.toLocaleString()}</p>
                  </div>
              </div>
            </div>
            
            <button
              onClick={() => decrementQaza(prayer)}
              disabled={remaining <= 0}
              className="z-10 w-12 h-12 flex items-center justify-center bg-white border-2 border-orange-100 text-orange-600 rounded-full hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 active:bg-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm group"
              title="Mark one Qaza as performed"
            >
              <Minus className="w-6 h-6 group-hover:hidden" />
              <span className="hidden group-hover:block text-xl font-bold">+1</span>
            </button>
          </div>
        )})}
      </div>
    </div>
  );
}
