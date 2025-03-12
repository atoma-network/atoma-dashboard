"use client";

import { ToastProvider } from "./toast-provider";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
