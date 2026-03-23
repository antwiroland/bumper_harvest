import { create } from "zustand";

type WalletState = {
  balance: number;
  setBalance: (value: number) => void;
  increment: (value: number) => void;
  decrement: (value: number) => void;
};

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  setBalance: (value) => set({ balance: value }),
  increment: (value) => set((state) => ({ balance: state.balance + value })),
  decrement: (value) => set((state) => ({ balance: Math.max(0, state.balance - value) })),
}));
