'use client';

import { useApp } from './providers';

export default function ProgressSummary() {
  const { qaza, profile } = useApp();

  if (!profile) return null;

  // Re-calculate the original total to show progress
  // Ideally, we'd store the "Initial Total" in the DB, but for this MVP we can approximate 
  // or just show "Remaining" vs "0". 
  // Better UX: Show a simple "Total Pending" card.
  
  const totalPending = Object.values(qaza)
    .filter(val => typeof val === 'number')
    .reduce((a, b) => (a as number) + (b as number), 0);
  
  // Let's estimate years remaining at 5/day pace just for motivation
  const daysToClear = Math.ceil(totalPending / 6); // Assuming they do one full set of qaza per day
  const yearsToClear = (daysToClear / 365).toFixed(1);

  return (
    <div className="bg-emerald-900 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800 rounded-full -mr-10 -mt-10 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-800 rounded-full -ml-10 -mb-10 opacity-50"></div>
      
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
        <div>
          <p className="text-emerald-200 text-sm font-medium mb-1">Total Prayers Pending</p>
          <h3 className="text-4xl font-bold">{totalPending.toLocaleString()}</h3>
        </div>
        
        <div className="hidden md:block w-px bg-emerald-800"></div>
        
        <div>
           <p className="text-emerald-200 text-sm font-medium mb-1">Estimated Time to Finish</p>
           <h3 className="text-2xl font-bold">{yearsToClear} Years</h3>
           <p className="text-xs text-emerald-300">If you offer 1 full Qaza set daily</p>
        </div>
        
        <div className="hidden md:block w-px bg-emerald-800"></div>
        
        <div className="flex items-center justify-center md:justify-start">
           <div>
             <p className="text-emerald-200 text-sm font-medium mb-2">Keep going!</p>
             <div className="h-2 w-full md:w-32 bg-emerald-800 rounded-full overflow-hidden">
               {/* 
                  Since we don't have the "original max", we can't show a true percentage bar easily 
                  without storing "initial_qaza". For now, we just show a visual indicator. 
               */}
               <div className="h-full bg-emerald-400 w-full animate-pulse"></div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
