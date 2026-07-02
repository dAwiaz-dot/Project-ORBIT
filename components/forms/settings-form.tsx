"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, Database, KeyRound, Loader2, Mail, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type SettingsState = {
  companyName: string;
  logoUrl: string;
  apifyToken: string;
  openAiApiKey: string;
  smtpHost: string;
  smtpUser: string;
  smtpPassword: string;
  databaseNote: string;
  defaultMessage: string;
  theme: "light" | "dark" | "system";
};

const defaultSettings: SettingsState = {
  companyName: "Orbit",
  logoUrl: "",
  apifyToken: "",
  openAiApiKey: "",
  smtpHost: "",
  smtpUser: "",
  smtpPassword: "",
  databaseNote: "",
  defaultMessage: "Ola {empresa}, tudo bem? Vi o trabalho de voces em {cidade}...",
  theme: "light"
};

export function SettingsForm() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const response = await fetch("/api/settings");
      if (!response.ok) {
        setLoading(false);
        toast.error(response.status === 401 ? "Faca login para editar configuracoes" : "Nao foi possivel carregar configuracoes");
        return;
      }

      const data = (await response.json()) as Partial<Record<keyof SettingsState, string | null>>;
      setSettings({
        companyName: data.companyName ?? defaultSettings.companyName,
        logoUrl: data.logoUrl ?? "",
        apifyToken: data.apifyToken ?? "",
        openAiApiKey: data.openAiApiKey ?? "",
        smtpHost: data.smtpHost ?? "",
        smtpUser: data.smtpUser ?? "",
        smtpPassword: data.smtpPassword ?? "",
        databaseNote: data.databaseNote ?? "",
        defaultMessage: data.defaultMessage ?? defaultSettings.defaultMessage,
        theme: data.theme === "dark" || data.theme === "system" ? data.theme : "light"
      });
      setLoading(false);
    }

    void loadSettings();
  }, []);

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });

    setSaving(false);
    if (!response.ok) {
      toast.error("Nao foi possivel salvar configuracoes");
      return;
    }

    toast.success("Configuracoes salvas");
  }

  async function uploadLogo() {
    if (!logoFile) {
      toast.error("Selecione uma imagem para enviar");
      return;
    }

    const formData = new FormData();
    formData.append("logo", logoFile);
    setUploading(true);
    const response = await fetch("/api/settings/logo", { method: "POST", body: formData });
    setUploading(false);

    const payload = (await response.json().catch(() => ({}))) as { error?: string; settings?: { logoUrl?: string | null } };
    if (!response.ok) {
      toast.error(payload.error ?? "Nao foi possivel enviar a logo");
      return;
    }

    update("logoUrl", payload.settings?.logoUrl ?? "");
    setLogoFile(null);
    toast.success("Logo enviada para o storage externo");
  }

  return (
    <form onSubmit={save} className="grid gap-6 xl:grid-cols-[1fr_460px]">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Identidade da agencia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome da empresa</Label>
            <Input value={settings.companyName} onChange={(event) => update("companyName", event.target.value)} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label>Logo publica</Label>
            <Input value={settings.logoUrl} onChange={(event) => update("logoUrl", event.target.value)} placeholder="https://..." disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label>Upload em storage externo</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input type="file" accept="image/*" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} disabled={uploading || loading} />
              <Button type="button" variant="outline" onClick={uploadLogo} disabled={uploading || loading}>
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Enviar
              </Button>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Use as variaveis LOGO_STORAGE_* no .env para Cloudinary, S3/R2 ou outro endpoint externo.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Tema padrao</Label>
            <Select value={settings.theme} onValueChange={(value) => update("theme", value as SettingsState["theme"])} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Apify
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Apify Token</Label>
              <Input
                type="password"
                value={settings.apifyToken}
                onChange={(event) => update("apifyToken", event.target.value)}
                placeholder="apify_api_..."
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Mensagem padrao</Label>
              <Textarea value={settings.defaultMessage} onChange={(event) => update("defaultMessage", event.target.value)} disabled={loading} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              OpenAI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>OpenAI API Key</Label>
              <Input
                type="password"
                value={settings.openAiApiKey}
                onChange={(event) => update("openAiApiKey", event.target.value)}
                placeholder="sk-..."
                disabled={loading}
              />
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              A IA local por regras ja funciona. Com a chave configurada, o provider pode ser trocado para LLM sem alterar as telas.
            </p>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" variant="premium" className="w-full" disabled={saving || loading}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar configuracoes
        </Button>
      </div>

      <Card className="glass-panel xl:col-span-2">
        <CardHeader>
          <CardTitle>Infraestrutura</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              SMTP
            </Label>
            <div className="grid gap-2 sm:grid-cols-3">
              <Input value={settings.smtpHost} onChange={(event) => update("smtpHost", event.target.value)} placeholder="Host" disabled={loading} />
              <Input value={settings.smtpUser} onChange={(event) => update("smtpUser", event.target.value)} placeholder="Usuario" disabled={loading} />
              <Input
                type="password"
                value={settings.smtpPassword}
                onChange={(event) => update("smtpPassword", event.target.value)}
                placeholder="Senha"
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Banco
            </Label>
            <Input
              value={settings.databaseNote}
              onChange={(event) => update("databaseNote", event.target.value)}
              placeholder="Observacao operacional do banco PostgreSQL"
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
