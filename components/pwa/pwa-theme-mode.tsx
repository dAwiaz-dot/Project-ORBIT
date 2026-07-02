"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

export function PwaThemeMode() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((window.navigator as NavigatorWithStandalone).standalone);

    if (!isStandalone) return;

    setTheme("dark");
    document.documentElement.style.backgroundColor = "#050505";
    document.body.style.backgroundColor = "#050505";
  }, [setTheme]);

  return null;
}
