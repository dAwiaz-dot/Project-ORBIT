export type StoredLogo = {
  provider: string;
  publicUrl: string;
  storageKey: string | null;
};

export async function uploadLogoToExternalStorage(file: File): Promise<StoredLogo> {
  const uploadUrl = process.env.LOGO_STORAGE_UPLOAD_URL;
  if (!uploadUrl) {
    throw new Error("LOGO_STORAGE_UPLOAD_URL nao configurada.");
  }

  const fieldName = process.env.LOGO_STORAGE_FILE_FIELD || "file";
  const provider = process.env.LOGO_STORAGE_PROVIDER || "external";
  const formData = new FormData();
  formData.append(fieldName, file, file.name);

  const presetField = process.env.LOGO_STORAGE_PRESET_FIELD;
  const presetValue = process.env.LOGO_STORAGE_PRESET_VALUE;
  if (presetField && presetValue) {
    formData.append(presetField, presetValue);
  }

  const headers: HeadersInit = {};
  const token = process.env.LOGO_STORAGE_AUTH_TOKEN;
  if (token) {
    headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers,
    body: formData
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Falha no upload da logo: ${response.status}`);
  }

  const payload = parseUploadResponse(text);
  const publicUrl = findFirstString(payload, ["secure_url", "url", "publicUrl", "location"]) ?? (text.startsWith("http") ? text : null);
  const storageKey = findFirstString(payload, ["public_id", "key", "id", "storageKey"]);

  if (!publicUrl) {
    throw new Error("Storage externo nao retornou uma URL publica.");
  }

  return { provider, publicUrl, storageKey };
}

function parseUploadResponse(text: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(text) as unknown;
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function findFirstString(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
