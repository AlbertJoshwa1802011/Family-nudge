import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
}

interface Family {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  currentFamily: Family | null;
  families: Family[];
  setAuth: (user: User, token: string) => void;
  setFamilies: (families: Family[]) => void;
  setCurrentFamily: (family: Family) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  currentFamily: null,
  families: [],
  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fn_token', token);
    }
    set({ user, token });
  },
  setFamilies: (families) => set({ families }),
  setCurrentFamily: (family) => set({ currentFamily: family }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fn_token');
    }
    set({ user: null, token: null, currentFamily: null, families: [] });
  },
}));
