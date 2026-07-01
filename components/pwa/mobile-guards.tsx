"use client";

import { useEffect } from "react";

export function MobileGuards() {
  useEffect(() => {
    const isMobile = window.matchMedia("(pointer: coarse), (max-width: 768px)").matches;
    if (!isMobile) return;

    const block = (event: Event) => event.preventDefault();
    const options = { passive: false } as AddEventListenerOptions;

    document.addEventListener("gesturestart", block, options);
    document.addEventListener("gesturechange", block, options);
    document.addEventListener("copy", block, options);
    document.addEventListener("cut", block, options);
    document.addEventListener("contextmenu", block, options);
    document.addEventListener("selectstart", block, options);

    return () => {
      document.removeEventListener("gesturestart", block);
      document.removeEventListener("gesturechange", block);
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("selectstart", block);
    };
  }, []);

  return null;
}
