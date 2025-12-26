'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers';
import { Calendar, UserCircle } from 'lucide-react';

export default function OnboardingPage() {
  const { user, saveProfile } = useApp();
  const router = useRouter();
  
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [pubertyAge, setPubertyAge] = useState(15);
  const [periodDuration, setPeriodDuration] = useState(7);
  const [safeMode, setSafeMode] = useState(false);

  const handleGenderChange = (g: 'male' | 'female') => {
    setGender(g);
    // Auto-suggest puberty age
    if (g === 'male') setPubertyAge(15);
    else setPubertyAge(12);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !dob) return;
    
    saveProfile({
      user_id: user.id,
      date_of_birth: dob,
      gender,
      puberty_age: pubertyAge,
      period_duration: periodDuration,
      safe_mode: safeMode
    });
    
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center gap-3 mb-6 border-b pb-4 border-slate-100">
          <UserCircle className="w-8 h-8 text-emerald-600" />
          <h1 className="text-2xl font-bold text-slate-800">Setup Profile</h1>
        </div>
        
        <p className="text-slate-600 mb-6">
          To calculate your Qaza-e-Umri (missed prayers), we need a few details to estimate when your obligation began.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gender Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleGenderChange('male')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  gender === 'male' 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold' 
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => handleGenderChange('female')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  gender === 'female' 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold' 
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-slate-700 mb-1">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="date"
                id="dob"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-black"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
          </div>

          {/* Puberty Age */}
          <div>
            <label htmlFor="puberty" className="block text-sm font-medium text-slate-700 mb-1">
              Age of Puberty (Baligh)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              The age you became obligated to pray. (Default: 12 for girls, 15 for boys)
            </p>
            <input
              type="number"
              id="puberty"
              required
              min="9"
              max="18"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-black"
              value={pubertyAge}
              onChange={(e) => setPubertyAge(parseInt(e.target.value))}
            />
          </div>

          {/* Female Specific Options */}
          {gender === 'female' && (
            <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
              <h3 className="font-semibold text-slate-700">Period Settings</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Average Days per Month</label>
                <div className="flex gap-3">
                  {[5, 6, 7].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setPeriodDuration(days)}
                      className={`flex-1 py-2 px-3 rounded-lg border transition-all ${
                        periodDuration === days
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold ring-2 ring-emerald-500 ring-offset-1'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 bg-orange-50 p-4 rounded-lg border border-orange-100">
                <div className="flex-1">
                  <label htmlFor="safemode" className="font-semibold text-orange-800 block text-sm">Safe Mode (Extra Qaza)</label>
                  <p className="text-xs text-orange-700 mt-0.5">Calculates with minimal deduction (3 days) for precaution.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="safemode" 
                    className="sr-only peer"
                    checked={safeMode}
                    onChange={(e) => setSafeMode(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-orange-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-lg shadow-lg shadow-emerald-200 transition-all mt-4"
          >
            Calculate & Start
          </button>
        </form>
      </div>
    </div>
  );
}
