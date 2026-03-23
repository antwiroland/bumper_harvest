"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { Toaster, toast } from "sonner";

type ToastContextValue = {
  notify: (message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ToastContextValue>(
    () => ({
      notify: (message: string) => toast(message),
      success: (message: string) => toast.success(message),
      error: (message: string) => toast.error(message),
      info: (message: string) => toast.info(message),
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster richColors position="top-right" />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
