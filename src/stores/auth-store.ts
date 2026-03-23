import { create } from "zustand";

type AuthState = {
  userId: string | null;
  role: "USER" | "ADMIN" | null;
  name: string | null;
  setUser: (payload: { userId: string; role: "USER" | "ADMIN"; name: string | null }) => void;
  clearUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  role: null,
  name: null,
  setUser: ({ userId, role, name }) => set({ userId, role, name }),
  clearUser: () => set({ userId: null, role: null, name: null }),
}));
