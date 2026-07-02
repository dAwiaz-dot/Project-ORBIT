import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { authSecret } from "@/lib/auth-secret";

export const DEMO_SETTINGS_COOKIE_NAME = "orbit_demo_settings";
export const DEMO_SETTINGS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type DemoSecretSettings = {
  apifyToken?: string;
  openAiApiKey?: string;
  smtpPassword?: string;
};

const algorithm = "aes-256-gcm";

export function getDemoSecretSettings(cookieHeader: string | null | undefined): DemoSecretSettings {
  return decodeDemoSettingsCookie(getCookieValue(cookieHeader, DEMO_SETTINGS_COOKIE_NAME));
}

export function mergeDemoSecretSettings(cookieHeader: string | null | undefined, input: DemoSecretSettings) {
  const current = getDemoSecretSettings(cookieHeader);
  return {
    ...current,
    ...compactSecrets(input)
  };
}

export function encodeDemoSettingsCookie(settings: DemoSecretSettings) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(compactSecrets(settings)), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv, tag, encrypted].map((part) => part.toString("base64url")).join(".");
}

function decodeDemoSettingsCookie(value: string | null | undefined): DemoSecretSettings {
  if (!value) return {};

  const [ivValue, tagValue, encryptedValue] = value.split(".");
  if (!ivValue || !tagValue || !encryptedValue) return {};

  try {
    const decipher = createDecipheriv(algorithm, getEncryptionKey(), Buffer.from(ivValue, "base64url"));
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, "base64url")),
      decipher.final()
    ]).toString("utf8");
    const parsed = JSON.parse(decrypted) as DemoSecretSettings;

    return compactSecrets({
      apifyToken: parsed.apifyToken,
      openAiApiKey: parsed.openAiApiKey,
      smtpPassword: parsed.smtpPassword
    });
  } catch {
    return {};
  }
}

function compactSecrets(settings: DemoSecretSettings) {
  return Object.fromEntries(
    Object.entries(settings).flatMap(([key, value]) => {
      const trimmed = typeof value === "string" ? value.trim() : "";
      return trimmed ? [[key, trimmed]] : [];
    })
  ) as DemoSecretSettings;
}

function getEncryptionKey() {
  return createHash("sha256").update(authSecret).digest();
}

function getCookieValue(header: string | null | undefined, name: string) {
  return header
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}
