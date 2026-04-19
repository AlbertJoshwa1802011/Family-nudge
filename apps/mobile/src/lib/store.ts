import { create } from 'zustand';

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
  setAuth: (user: User, token: string) => void;
  setFamilies: (families: Family[]) => void;
  setCurrentFamily: (family: Family) => void;
  logout: () => void;
}

const AVATAR_COLORS = [
  '#3B82F6', '#EC4899', '#8B5CF6', '#10B981',
  '#F59E0B', '#EF4444', '#06B6D4', '#F97316',
];

export function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  currentFamily: null,
  families: [],
  isLoggedIn: false,
  setAuth: (user, token) => set({ user, token, isLoggedIn: true }),
  setFamilies: (families) => set({ families }),
  setCurrentFamily: (family) => set({ currentFamily: family }),
  logout: () => set({ user: null, token: null, currentFamily: null, families: [], isLoggedIn: false }),
}));
