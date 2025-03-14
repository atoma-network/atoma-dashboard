"use client";
import { createContext, useContext, useRef } from "react";
import { Toast } from "primereact/toast";

const ToastContext = createContext<{
  showToast: (message: string, severity?: "info" | "success" | "warn" | "error" | "secondary") => void;
} | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const toastRef = useRef<Toast>(null);

  const showToast = (message: string, severity: "info" | "success" | "warn" | "error" | "secondary" = "info") => {
    toastRef.current?.show({ severity, summary: severity.toUpperCase(), detail: message, life: 3000 });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast ref={toastRef} />
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
