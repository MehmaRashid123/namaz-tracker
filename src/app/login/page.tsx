'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers';
import { Moon, Loader2, LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { login, signup } = useApp();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      if (activeTab === 'signup') {
        const data = await signup(email, password);
        // If auto-confirm is enabled in Supabase, session will be present
        if (data?.session) {
           router.push('/');
        } else if (data?.user) {
           // Case where confirm email is NOT disabled yet
           alert('Account created! If you have disabled Email Confirm in Supabase, try logging in now. If not, check your email.');
           setActiveTab('login');
        }
      } else {
        await login(email, password);
        router.push('/');
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes('Invalid login')) {
         setError('Incorrect email or password.');
      } else if (err.message.includes('already registered')) {
         setError('User already exists. Please login.');
         setActiveTab('login');
      } else {
         setError(err.message || 'Authentication failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-emerald-600 p-6 text-center">
            <div className="flex justify-center mb-4">
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                    <Moon className="w-8 h-8 text-white" />
                </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Namaz Tracker</h1>
            <p className="text-emerald-100 text-sm">Track your prayers & Qaza</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
            <button 
                onClick={() => { setActiveTab('login'); setError(''); }}
                className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'login' 
                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
                <LogIn className="w-4 h-4" /> Login
            </button>
            <button 
                onClick={() => { setActiveTab('signup'); setError(''); }}
                className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'signup' 
                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
                <UserPlus className="w-4 h-4" /> Sign Up
            </button>
        </div>

        {/* Form Body */}
        <div className="p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6">
                {activeTab === 'login' ? 'Welcome Back!' : 'Create Account'}
            </h2>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100 animate-pulse">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
                </label>
                <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-black"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
                </label>
                <input
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-black"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                />
                {activeTab === 'signup' && (
                    <p className="text-xs text-slate-400 mt-1">Must be at least 6 characters</p>
                )}
            </div>
            
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold py-3 rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 mt-2"
            >
                {isSubmitting ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Please wait...
                </>
                ) : (
                activeTab === 'login' ? 'Login to Account' : 'Create Free Account'
                )}
            </button>
            </form>
        </div>

      </div>
    </div>
  );
}
