"use client";

import { signOut } from "next-auth/react";
import { Eye, EyeOff, KeyRound, Loader2, LogOut, RefreshCw, Save, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfileUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "ADMIN" | "SELLER" | "FINANCE";
  persisted: boolean;
};

const roleLabels: Record<ProfileUser["role"], string> = {
  ADMIN: "Administrador",
  SELLER: "Vendedor",
  FINANCE: "Financeiro"
};

export function ProfileSettings() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    const response = await fetch("/api/profile");
    setLoading(false);

    if (!response.ok) {
      toast.error("Nao foi possivel carregar o perfil");
      return;
    }

    const data = (await response.json()) as { user: ProfileUser };
    setUser(data.user);
    setName(data.user.name ?? "");
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        password: password.trim() || undefined
      })
    });
    setSaving(false);

    const data = (await response.json().catch(() => ({}))) as { user?: ProfileUser; error?: string };
    if (!response.ok || !data.user) {
      toast.error(data.error ?? "Nao foi possivel salvar o perfil");
      return;
    }

    setUser(data.user);
    setName(data.user.name ?? "");
    setPassword("");
    setShowPassword(false);
    toast.success(data.user.persisted ? "Perfil atualizado" : "Perfil atualizado para esta sessao demo");
  }

  if (loading) {
    return (
      <Card className="glass-panel">
        <CardContent className="grid min-h-[300px] place-items-center text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando perfil
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-primary" />
            Dados do perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Nome</Label>
                <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} required />
              </div>
              <div className="space-y-2">
                <Label>Email de login</Label>
                <Input value={user?.email ?? ""} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-password">Nova senha</Label>
              <div className="relative">
                <Input
                  id="profile-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Deixe vazio para manter a senha atual"
                  minLength={6}
                  className="pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="focus-ring absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="premium" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar perfil
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Sessao
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs text-muted-foreground">Perfil atual</p>
              <p className="mt-1 truncate text-sm font-semibold">{user?.name ?? "Orbit"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email ?? "Sem email"}</p>
              {user && (
                <Badge variant={user.role === "ADMIN" ? "success" : "secondary"} className="mt-3">
                  {roleLabels[user.role]}
                </Badge>
              )}
            </div>

            {!user?.persisted && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:border-white/15 dark:bg-white/[0.06] dark:text-zinc-200">
                Modo demo sem banco real. Alteracoes sensiveis ficam limitadas ate configurar PostgreSQL na Vercel.
              </div>
            )}

            <Button variant="outline" className="w-full justify-start" onClick={() => signOut({ callbackUrl: "/login?callbackUrl=/dashboard" })}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Trocar perfil
            </Button>
            <Button variant="outline" className="w-full justify-start text-rose-600 dark:text-zinc-200" onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="p-5">
            <div className="flex gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary">
                <KeyRound className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Acesso de equipe</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Novos logins sao cadastrados em Equipe. Cada pessoa entra com email e senha proprios.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
