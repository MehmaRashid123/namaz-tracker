'use client';

import { useApp } from './providers';
import { LogOut, User } from 'lucide-react';

export default function DashboardHeader() {
  const { user, logout } = useApp();

  return (
    <header className="bg-white border-b border-emerald-100 py-4 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
          N
        </div>
        <span className="font-bold text-slate-800 text-lg hidden sm:block">Namaz Tracker</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">{user?.email}</span>
        </div>
        <button 
          onClick={logout}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
