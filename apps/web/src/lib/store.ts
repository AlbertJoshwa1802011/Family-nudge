import { create } from 'zustand';
import { apiFetch } from './api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
}

interface FamilyMember {
  id: string;
  userId: string;
  role: string;
  nickname?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

interface Family {
  id: string;
  name: string;
  avatarUrl?: string;
  inviteCode: string;
  members: FamilyMember[];
  _count?: { reminders: number; documents: number; policies: number };
}

interface Reminder {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  frequency: string;
  channels: string[];
  dueDate: string;
  isCompleted: boolean;
  isSnoozed: boolean;
  createdBy: { id: string; firstName: string; lastName: string };
  assignees: Array<{
    user: { id: string; firstName: string; lastName: string };
  }>;
}

interface Policy {
  id: string;
  name: string;
  type: string;
  provider: string;
  policyNumber?: string;
  startDate: string;
  endDate: string;
  premiumAmount?: number;
  premiumFrequency?: string;
  status: string;
}

interface Document {
  id: string;
  name: string;
  category: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  currentFamily: Family | null;
  families: Family[];
  reminders: Reminder[];
  policies: Policy[];
  documents: Document[];
  isHydrated: boolean;
  isLoading: boolean;

  setAuth: (user: User, token: string) => void;
  setFamilies: (families: Family[]) => void;
  setCurrentFamily: (family: Family) => void;
  setReminders: (reminders: Reminder[]) => void;
  setPolicies: (policies: Policy[]) => void;
  setDocuments: (documents: Document[]) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
  fetchFamilies: () => Promise<void>;
  fetchReminders: (familyId: string) => Promise<void>;
  fetchPolicies: (familyId: string) => Promise<void>;
  fetchDocuments: (familyId: string) => Promise<void>;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fn_token');
}

function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fn_token', token);
    document.cookie = `fn_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }
}

function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fn_token');
    document.cookie = 'fn_token=; path=/; max-age=0';
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  currentFamily: null,
  families: [],
  reminders: [],
  policies: [],
  documents: [],
  isHydrated: false,
  isLoading: false,

  setAuth: (user, token) => {
    setToken(token);
    set({ user, token });
  },

  setFamilies: (families) => {
    const current = get().currentFamily;
    const updated: Partial<AuthState> = { families };
    if (!current && families.length > 0) {
      updated.currentFamily = families[0];
    }
    set(updated);
  },

  setCurrentFamily: (family) => set({ currentFamily: family }),
  setReminders: (reminders) => set({ reminders }),
  setPolicies: (policies) => set({ policies }),
  setDocuments: (documents) => set({ documents }),

  logout: () => {
    const token = get().token;
    if (token) {
      apiFetch('/auth/logout', { method: 'POST', token }).catch(() => {});
    }
    clearToken();
    set({
      user: null,
      token: null,
      currentFamily: null,
      families: [],
      reminders: [],
      policies: [],
      documents: [],
    });
  },

  hydrate: async () => {
    const token = getToken();
    if (!token) {
      set({ isHydrated: true });
      return;
    }

    try {
      set({ isLoading: true });
      const res = await apiFetch<{ success: boolean; data: User & { familyMembers: Array<{ family: Family }> } }>(
        '/auth/me',
        { token },
      );
      const { familyMembers, ...user } = res.data;
      set({ user, token, isHydrated: true, isLoading: false });
    } catch {
      clearToken();
      set({ isHydrated: true, isLoading: false });
    }
  },

  fetchFamilies: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await apiFetch<{ success: boolean; data: Family[] }>('/families', { token });
      get().setFamilies(res.data);
    } catch {
      /* silently fail */
    }
  },

  fetchReminders: async (familyId: string) => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await apiFetch<{ success: boolean; data: Reminder[] }>(
        `/reminders/family/${familyId}`,
        { token },
      );
      set({ reminders: res.data });
    } catch {
      /* silently fail */
    }
  },

  fetchPolicies: async (familyId: string) => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await apiFetch<{ success: boolean; data: Policy[] }>(
        `/policies/family/${familyId}`,
        { token },
      );
      set({ policies: res.data });
    } catch {
      /* silently fail */
    }
  },

  fetchDocuments: async (familyId: string) => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await apiFetch<{ success: boolean; data: Document[] }>(
        `/documents/family/${familyId}`,
        { token },
      );
      set({ documents: res.data });
    } catch {
      /* silently fail */
    }
  },
}));
