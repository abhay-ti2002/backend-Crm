import { create } from "zustand";

// Simulates an authenticated user (customer) session.
// Backend integration: replace setCurrentUser with a POST /api/auth/user-login call
// that returns a JWT, then decode it here or store the user profile from the response.

interface UserSessionStore {
  currentUserId: string | null;
  setCurrentUser: (id: string) => void;
  logout: () => void;
}

export const useUserSessionStore = create<UserSessionStore>((set) => ({
  currentUserId: null,
  setCurrentUser: (id) => set({ currentUserId: id }),
  logout: () => set({ currentUserId: null }),
}));
