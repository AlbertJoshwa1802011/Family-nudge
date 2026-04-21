import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { apiFetch, setAuthToken } from './api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarColor: string;
}

interface Family {
  id: string;
  name: string;
  members: FamilyMember[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  currentFamily: Family | null;
  families: Family[];
  isLoggedIn: boolean;
  isHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  setFamilies: (families: Family[]) => void;
  setCurrentFamily: (family: Family) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

const AVATAR_COLORS = [
  '#3B82F6', '#EC4899', '#8B5CF6', '#10B981',
  '#F59E0B', '#EF4444', '#06B6D4', '#F97316',
];

export function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

const TOKEN_KEY = 'fn_auth_token';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  currentFamily: null,
  families: [],
  isLoggedIn: false,
  isHydrated: false,

  setAuth: (user, token) => {
    SecureStore.setItemAsync(TOKEN_KEY, token).catch(() => {});
    setAuthToken(token);
    set({ user, token, isLoggedIn: true });
  },

  setFamilies: (families) => set({ families }),
  setCurrentFamily: (family) => set({ currentFamily: family }),

  logout: () => {
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    setAuthToken(null);
    set({ user: null, token: null, currentFamily: null, families: [], isLoggedIn: false });
  },

  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        set({ isHydrated: true });
        return;
      }

      setAuthToken(token);
      const res = await apiFetch<{ success: boolean; data: User }>('/auth/me');
      set({ user: res.data, token, isLoggedIn: true, isHydrated: true });
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
      setAuthToken(null);
      set({ isHydrated: true });
    }
  },
}));
