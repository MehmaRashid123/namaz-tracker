'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Profile, QazaLog, DailyLog, mockAuth, mockDB } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

interface AppContextType {
  user: User | null;
  profile: Profile | null;
  qaza: QazaLog;
  dailyLogs: DailyLog;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => void;
  saveProfile: (p: Profile) => Promise<void>;
  updateQaza: (q: QazaLog) => Promise<void>;
  toggleDailyPrayer: (date: string, prayer: keyof QazaLog) => void;
  decrementQaza: (prayer: keyof QazaLog) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [qaza, setQaza] = useState<QazaLog>({ 
    fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0,
    performed: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 }
  });
  const [dailyLogs, setDailyLogs] = useState<DailyLog>({});
  const [loading, setLoading] = useState(true);

  // Initialize Auth
  useEffect(() => {
    if (supabase) {
        // --- REAL SUPABASE MODE ---
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                // @ts-ignore
                setUser({ id: session.user.id, email: session.user.email! });
                fetchRealData(session.user.id);
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                // @ts-ignore
                setUser({ id: session.user.id, email: session.user.email! });
                fetchRealData(session.user.id);
            } else {
                setUser(null);
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();

    } else {
        // --- LOCAL STORAGE FALLBACK ---
        const loadedUser = mockAuth.getUser();
        setUser(loadedUser);
        if (loadedUser) refreshLocalData();
        else setLoading(false);
    }
  }, []);

  // --- HELPERS FOR LOCAL DATA ---
  const refreshLocalData = () => {
    const p = mockDB.getProfile();
    const q = mockDB.getQaza();
    // ensure structure
    if (!q.performed) q.performed = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 };
    setProfile(p);
    setQaza(q);
    setDailyLogs(mockDB.getDailyLogs());
    setLoading(false);
  };

  // --- HELPERS FOR REAL DATA ---
  const fetchRealData = async (userId: string) => {
    if (!supabase) return;
    setLoading(true);

    try {
        // 1. Profile
        const { data: p } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (p) setProfile(p);

        // 2. Qaza Logs
        const { data: q } = await supabase.from('qaza_logs').select('*').eq('user_id', userId).single();
        if (q) {
            // Map flat SQL structure to nested JS object
            setQaza({
                fajr: q.fajr, dhuhr: q.dhuhr, asr: q.asr, maghrib: q.maghrib, isha: q.isha, witr: q.witr,
                performed: {
                    fajr: q.perf_fajr || 0,
                    dhuhr: q.perf_dhuhr || 0,
                    asr: q.perf_asr || 0,
                    maghrib: q.perf_maghrib || 0,
                    isha: q.perf_isha || 0,
                    witr: q.perf_witr || 0,
                }
            });
        }

        // 3. Daily Logs (Fetch last 30 days usually, but here we fetch all for simple prototype)
        const { data: logs } = await supabase.from('daily_logs').select('*').eq('user_id', userId);
        if (logs) {
            const logMap: DailyLog = {};
            logs.forEach((l: any) => {
                logMap[l.date] = { 
                    fajr: l.fajr, dhuhr: l.dhuhr, asr: l.asr, maghrib: l.maghrib, isha: l.isha, witr: l.witr 
                };
            });
            setDailyLogs(logMap);
        }

    } catch (e) {
        console.error('Error fetching data:', e);
    } finally {
        setLoading(false);
    }
  };

  // --- ACTIONS ---

  const login = async (email: string, password: string) => {
    if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    } else {
        // Mock
        const u = mockAuth.login(email);
        setUser(u);
        refreshLocalData();
        return { user: u };
    }
  };

  const signup = async (email: string, password: string) => {
    if (supabase) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data;
    } else {
         // Mock
        const u = mockAuth.login(email);
        setUser(u);
        refreshLocalData();
        return { user: u };
    }
  }

  const logout = () => {
    if (supabase) {
        supabase.auth.signOut();
    } else {
        mockAuth.logout();
        setUser(null);
        setProfile(null);
    }
  };

  const saveProfile = async (p: Profile) => {
    // Optimistic Update
    setProfile(p);

    if (supabase && user) {
        // Upsert Profile
        await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            date_of_birth: p.date_of_birth,
            gender: p.gender,
            puberty_age: p.puberty_age
        });

        // Calculate Initial Qaza if needed
        const { data: existingQaza } = await supabase.from('qaza_logs').select('id').eq('user_id', user.id).single();
        
        if (!existingQaza) {
             // Logic to calc days
            const dob = new Date(p.date_of_birth);
            const pubertyDate = new Date(dob);
            pubertyDate.setFullYear(dob.getFullYear() + p.puberty_age);
            const now = new Date();
            let totalDays = (pubertyDate > now) ? 0 : Math.ceil(Math.abs(now.getTime() - pubertyDate.getTime()) / (1000 * 60 * 60 * 24));
            
            // --- FEMALE ADJUSTMENT ---
            // Deduct days for menstruation (Approx 7 days per month = ~23% reduction)
            if (p.gender === 'female' && totalDays > 0) {
                // Deducting 7 days out of every 30 days roughly
                const adjustmentFactor = 1 - (7 / 30); 
                totalDays = Math.floor(totalDays * adjustmentFactor);
            }

            const newQaza = {
                user_id: user.id,
                fajr: totalDays, dhuhr: totalDays, asr: totalDays, maghrib: totalDays, isha: totalDays, witr: totalDays,
                perf_fajr: 0, perf_dhuhr: 0, perf_asr: 0, perf_maghrib: 0, perf_isha: 0, perf_witr: 0
            };
            
            await supabase.from('qaza_logs').insert(newQaza);
            // Refetch to ensure state sync
            fetchRealData(user.id);
        }
    } else {
        mockDB.saveProfile(p);
        
        // Re-trigger auto-calc logic for Mock
        const currentQaza = mockDB.getQaza();
        const total = Object.values(currentQaza).filter(v => typeof v === 'number').reduce((a, b) => (a as number) + (b as number), 0);
        if (total === 0) {
            // Calc logic again for mock...
             const dob = new Date(p.date_of_birth);
             const pubertyDate = new Date(dob);
             pubertyDate.setFullYear(dob.getFullYear() + p.puberty_age);
             const now = new Date();
             let totalDays = (pubertyDate > now) ? 0 : Math.ceil(Math.abs(now.getTime() - pubertyDate.getTime()) / (1000 * 60 * 60 * 24));
             
             // --- FEMALE ADJUSTMENT (Mock) ---
             if (p.gender === 'female' && totalDays > 0) {
                const adjustmentFactor = 1 - (7 / 30); 
                totalDays = Math.floor(totalDays * adjustmentFactor);
             }

             const newQaza = {
                 fajr: totalDays, dhuhr: totalDays, asr: totalDays, maghrib: totalDays, isha: totalDays, witr: totalDays,
                 performed: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 }
             };
             mockDB.saveQaza(newQaza);
             setQaza(newQaza);
        }
    }
  };

  const updateQaza = async (newQaza: QazaLog) => {
    // Optimistic
    setQaza(newQaza);

    if (supabase && user) {
        // Convert nested object to flat SQL columns
        const updatePayload = {
            fajr: newQaza.fajr,
            dhuhr: newQaza.dhuhr,
            asr: newQaza.asr,
            maghrib: newQaza.maghrib,
            isha: newQaza.isha,
            witr: newQaza.witr,
            perf_fajr: newQaza.performed.fajr,
            perf_dhuhr: newQaza.performed.dhuhr,
            perf_asr: newQaza.performed.asr,
            perf_maghrib: newQaza.performed.maghrib,
            perf_isha: newQaza.performed.isha,
            perf_witr: newQaza.performed.witr,
        };
        await supabase.from('qaza_logs').update(updatePayload).eq('user_id', user.id);
    } else {
        mockDB.saveQaza(newQaza);
    }
  };

  const decrementQaza = (prayer: keyof QazaLog) => {
    if (prayer === 'performed') return;
    const newQaza = { ...qaza };
    if (!newQaza.performed) newQaza.performed = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 };

    // @ts-ignore
    if (newQaza[prayer] > 0) {
      // @ts-ignore
      newQaza[prayer] = (newQaza[prayer] as number) - 1;
      // @ts-ignore
      newQaza.performed[prayer] = (newQaza.performed[prayer] || 0) + 1;
      
      updateQaza(newQaza);
    }
  };

  const toggleDailyPrayer = async (date: string, prayer: keyof QazaLog) => {
    if (prayer === 'performed') return;
    
    // Optimistic
    const newLogs = { ...dailyLogs };
    if (!newLogs[date]) newLogs[date] = { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false, witr: false };
    // @ts-ignore
    newLogs[date][prayer] = !newLogs[date][prayer];
    setDailyLogs(newLogs);

    if (supabase && user) {
        // Upsert Daily Log
        // We need to fetch the existing row first or assume upsert logic with all fields? 
        // Supabase upsert needs all fields to avoid nulling others if row exists? 
        // Actually upsert merges if we don't specify all. Wait, standard SQL upsert REPLACES.
        // Supabase upsert MERGES if you assume jsonb, but for columns it replaces row.
        // So we should send the FULL state of that day.
        
        const dayPayload = {
            user_id: user.id,
            date: date,
            ...newLogs[date] // spread current state (fajr: true, etc)
        };
        await supabase.from('daily_logs').upsert(dayPayload, { onConflict: 'user_id, date' });

    } else {
        mockDB.toggleDaily(date, prayer);
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, profile, qaza, dailyLogs, loading, 
      login, signup, logout, saveProfile, updateQaza, toggleDailyPrayer, decrementQaza 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}