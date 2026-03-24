import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IAuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const useAuthStore = create<IAuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
    }),
    { name: 'cv-auth' },
  ),
);
