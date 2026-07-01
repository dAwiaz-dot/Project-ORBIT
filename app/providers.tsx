"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { MobileGuards } from "@/components/pwa/mobile-guards";
import { PwaRegister } from "@/components/pwa/pwa-register";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <MobileGuards />
      <PwaRegister />
      {children}
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
