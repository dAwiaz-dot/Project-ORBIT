"use client";

import { useEffect } from "react";

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

export function PwaThemeMode() {
  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((window.navigator as NavigatorWithStandalone).standalone);

    if (!isStandalone) return;

    document.documentElement.style.backgroundColor = "#050816";
    document.body.style.backgroundColor = "#050816";
  }, []);

  return null;
}
