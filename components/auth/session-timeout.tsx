"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

const LOGIN_CALLBACK = "/login?callbackUrl=/dashboard";
const MAX_TIMEOUT_MS = 2_147_483_647;

export function SessionTimeout() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    const expiresAt = Date.parse(session.expires);
    if (!Number.isFinite(expiresAt)) return;

    const delay = expiresAt - Date.now();
    if (delay <= 0) {
      void signOut({ callbackUrl: LOGIN_CALLBACK });
      return;
    }

    const timer = window.setTimeout(() => {
      void signOut({ callbackUrl: LOGIN_CALLBACK });
    }, Math.min(delay, MAX_TIMEOUT_MS));

    return () => window.clearTimeout(timer);
  }, [session?.expires, status]);

  return null;
}
