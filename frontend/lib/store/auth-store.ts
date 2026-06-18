import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name_en: string;
  name_ar?: string;
  role: string;
  tenant_id: string;
  locale: string;
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('glamora_user') : null;
  const initialUser = stored ? JSON.parse(stored) : null;

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    isLoading: !initialUser,
    setUser: (user) => {
      if (typeof window !== 'undefined') {
        if (user) localStorage.setItem('glamora_user', JSON.stringify(user));
        else localStorage.removeItem('glamora_user');
      }
      set({ user, isAuthenticated: !!user, isLoading: false });
    },
    setLoading: (loading) => set({ isLoading: loading }),
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('glamora_user');
        localStorage.removeItem('glamora_access_token');
        localStorage.removeItem('glamora_refresh_token');
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
    },
  };
});
