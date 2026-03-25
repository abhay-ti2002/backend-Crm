import { create } from "zustand";

interface AdminSessionStore {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

export const useAdminSessionStore = create<AdminSessionStore>((set) => ({
  isLoggedIn: false,
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false }),
}));
