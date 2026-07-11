"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { SessionTimeout } from "@/components/auth/session-timeout";
import { MobileGuards } from "@/components/pwa/mobile-guards";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { PwaThemeMode } from "@/components/pwa/pwa-theme-mode";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionTimeout />
      <MobileGuards />
      <PwaRegister />
      <PwaThemeMode />
      {children}
      <Toaster richColors position="top-right" theme="dark" />
    </SessionProvider>
  );
}
