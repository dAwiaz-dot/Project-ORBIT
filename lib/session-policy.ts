export const SESSION_MAX_AGE_SECONDS = 30 * 60;
export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;

export function createSessionExpiresAt(now = Date.now()) {
  return now + SESSION_MAX_AGE_MS;
}

export function getSessionExpiresAt(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function isSessionExpired(value: unknown, now = Date.now()) {
  const expiresAt = getSessionExpiresAt(value);
  return !expiresAt || expiresAt <= now;
}
