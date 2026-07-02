"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { MobileGuards } from "@/components/pwa/mobile-guards";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { PwaThemeMode } from "@/components/pwa/pwa-theme-mode";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <MobileGuards />
        <PwaRegister />
        <PwaThemeMode />
        {children}
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </SessionProvider>
  );
}
