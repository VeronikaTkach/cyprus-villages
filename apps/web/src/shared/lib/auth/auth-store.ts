import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IAuthState {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
}

export const useAuthStore = create<IAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      setAuthenticated: (value) => set({ isAuthenticated: value }),
    }),
    { name: 'cv-auth-ui' },
  ),
);
