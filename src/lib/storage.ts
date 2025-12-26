// Simulates a database using LocalStorage for the prototype
import { v4 as uuidv4 } from 'uuid';

const KEYS = {
  USER: 'namaz_user',
  PROFILE: 'namaz_profile',
  QAZA: 'namaz_qaza',
  DAILY: 'namaz_daily',
};

// --- Types ---
export type User = {
  id: string;
  email: string;
};

export type Profile = {
  user_id: string;
  date_of_birth: string; // YYYY-MM-DD
  puberty_age: number;
  gender: 'male' | 'female';
  period_duration?: number; // Days (5, 6, 7)
  safe_mode?: boolean; // Extra precaution
  calculated_start_date?: string;
};

export type QazaLog = {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  witr: number;
  // New: Track performed counts
  performed: {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
    witr: number;
  };
};

export type DailyLog = {
  [date: string]: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
    witr: boolean;
    tahajjud?: boolean;
    ishraq?: boolean;
    chasht?: boolean;
  };
};

// --- Services ---

export const mockAuth = {
  login: (email: string) => {
    // Simple mock login - just creates a user if not exists or returns existing
    let userString = localStorage.getItem(KEYS.USER);
    let user: User;
    
    if (userString) {
      user = JSON.parse(userString);
      if (user.email !== email) {
        // Overwrite if different email for this simple demo
        user = { id: 'user_' + Math.random().toString(36).substr(2, 9), email };
        localStorage.setItem(KEYS.USER, JSON.stringify(user));
      }
    } else {
      user = { id: 'user_' + Math.random().toString(36).substr(2, 9), email };
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    }
    return user;
  },
  
  logout: () => {
    localStorage.removeItem(KEYS.USER);
    // Optional: clear other data? For now keep it to simulate persistence
    window.location.reload();
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const u = localStorage.getItem(KEYS.USER);
    return u ? JSON.parse(u) : null;
  }
};

export const mockDB = {
  getProfile: () => {
    const p = localStorage.getItem(KEYS.PROFILE);
    return p ? JSON.parse(p) : null;
  },

  saveProfile: (profile: Profile) => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    return profile;
  },

  getQaza: (): QazaLog => {
    const q = localStorage.getItem(KEYS.QAZA);
    if (q) return JSON.parse(q);
    
    // Default
    return { 
      fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0,
      performed: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 }
    };
  },

  saveQaza: (qaza: QazaLog) => {
    localStorage.setItem(KEYS.QAZA, JSON.stringify(qaza));
    return qaza;
  },

  getDailyLogs: (): DailyLog => {
    const d = localStorage.getItem(KEYS.DAILY);
    return d ? JSON.parse(d) : {};
  },

  toggleDaily: (date: string, prayer: string) => {
     // Note: 'prayer' needs to be cast to the specific keys
     const logs = mockDB.getDailyLogs();
     if (!logs[date]) {
       logs[date] = { 
         fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false, witr: false,
         tahajjud: false, ishraq: false, chasht: false
       };
     }
     // @ts-ignore
     logs[date][prayer] = !logs[date][prayer];
     localStorage.setItem(KEYS.DAILY, JSON.stringify(logs));
     return logs;
  }
};
