"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Mail, ShieldCheck, Trash2, UserCog, UserPlus, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type TeamRole = "ADMIN" | "SELLER" | "FINANCE";

type TeamUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: TeamRole;
  image: string | null;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
};

type TeamPayload = {
  user?: TeamUser;
  users?: TeamUser[];
  error?: string;
};

const roleLabels: Record<TeamRole, string> = {
  ADMIN: "Administrador",
  SELLER: "Vendedor",
  FINANCE: "Financeiro"
};

const roleDescriptions: Record<TeamRole, string> = {
  ADMIN: "Acesso total ao sistema, usuarios, configuracoes e auditoria.",
  SELLER: "Pode buscar leads, atualizar CRM e exportar listas.",
  FINANCE: "Acompanha receitas, relatorios, auditoria e configuracoes."
};

const roleBadgeVariant: Record<TeamRole, "success" | "info" | "warning"> = {
  ADMIN: "success",
  SELLER: "info",
  FINANCE: "warning"
};

const defaultForm = {
  name: "",
  email: "",
  password: "",
  role: "SELLER" as TeamRole
};

export function TeamManagement() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const activeLogins = useMemo(() => users.filter((user) => user.email && user.hasPassword).length, [users]);
  const admins = useMemo(() => users.filter((user) => user.role === "ADMIN").length, [users]);

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const response = await fetch("/api/team");
    if (!response.ok) {
      setLoading(false);
      toast.error(response.status === 401 ? "Faca login para gerenciar a equipe" : "Nao foi possivel carregar a equipe");
      return;
    }

    const data = (await response.json()) as TeamPayload;
    setUsers(data.users ?? []);
    setLoading(false);
  }

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = (await response.json().catch(() => ({}))) as TeamPayload;
    setSaving(false);

    if (!response.ok) {
      toast.error(data.error ?? "Nao foi possivel criar o perfil de acesso");
      return;
    }

    setForm(defaultForm);
    setShowNewPassword(false);
    toast.success("Perfil de login criado");
    await loadUsers();
  }

  async function updateRole(userId: string, role: TeamRole) {
    const previousUsers = users;
    setBusyUserId(userId);
    setUsers((current) => current.map((user) => (user.id === userId ? { ...user, role } : user)));

    const response = await fetch(`/api/team/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });

    const data = (await response.json().catch(() => ({}))) as TeamPayload;
    setBusyUserId(null);

    if (!response.ok) {
      setUsers(previousUsers);
      toast.error(data.error ?? "Nao foi possivel atualizar a permissao");
      return;
    }

    if (data.user) {
      setUsers((current) => current.map((user) => (user.id === userId ? data.user! : user)));
    }
    toast.success("Permissao atualizada");
  }

  async function updatePassword(userId: string) {
    const password = passwordDrafts[userId]?.trim();
    if (!password || password.length < 6) {
      toast.error("Use uma senha com pelo menos 6 caracteres");
      return;
    }

    setBusyUserId(userId);
    const response = await fetch(`/api/team/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    const data = (await response.json().catch(() => ({}))) as TeamPayload;
    setBusyUserId(null);

    if (!response.ok) {
      toast.error(data.error ?? "Nao foi possivel alterar a senha");
      return;
    }

    setPasswordDrafts((current) => ({ ...current, [userId]: "" }));
    setVisiblePasswords((current) => ({ ...current, [userId]: false }));
    if (data.user) {
      setUsers((current) => current.map((user) => (user.id === userId ? data.user! : user)));
    }
    toast.success("Senha de acesso atualizada");
  }

  async function removeUser(userId: string) {
    setBusyUserId(userId);
    const response = await fetch(`/api/team/${userId}`, { method: "DELETE" });
    const data = (await response.json().catch(() => ({}))) as TeamPayload;
    setBusyUserId(null);

    if (!response.ok) {
      toast.error(data.error ?? "Nao foi possivel remover o usuario");
      return;
    }

    setUsers((current) => current.filter((user) => user.id !== userId));
    toast.success("Acesso removido");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
      <Card className="glass-panel">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Perfis de acesso
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{users.length} pessoas</Badge>
              <Badge variant="info">{activeLogins} logins ativos</Badge>
              <Badge variant="success">{admins} admins</Badge>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {(["ADMIN", "SELLER", "FINANCE"] as TeamRole[]).map((role) => (
              <div key={role} className="rounded-lg border bg-background/70 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{roleLabels[role]}</p>
                  <Badge variant={roleBadgeVariant[role]}>{users.filter((user) => user.role === role).length}</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{roleDescriptions[role]}</p>
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid min-h-[300px] place-items-center text-sm text-muted-foreground">
              <div className="text-center">
                <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
                Carregando perfis
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="rounded-lg border bg-background/80 p-4">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-start">
                    <div className="flex min-w-0 gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border bg-secondary text-sm font-bold">
                        {getInitials(user)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold">{user.name ?? "Sem nome"}</p>
                          <Badge variant={roleBadgeVariant[user.role]}>{roleLabels[user.role]}</Badge>
                          <Badge variant={user.email && user.hasPassword ? "success" : "warning"}>
                            {user.email && user.hasPassword ? "Login ativo" : "Completar acesso"}
                          </Badge>
                        </div>
                        <p className="mt-1 flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          {user.email ?? "Email nao informado"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">Criado em {formatDate(user.createdAt)}</p>
                      </div>
                    </div>

                    <Select value={user.role} onValueChange={(value) => updateRole(user.id, value as TeamRole)} disabled={busyUserId === user.id}>
                      <SelectTrigger aria-label="Alterar permissao">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleLabels).map(([role, label]) => (
                          <SelectItem key={role} value={role}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
                    <div className="relative">
                      <Input
                        type={visiblePasswords[user.id] ? "text" : "password"}
                        value={passwordDrafts[user.id] ?? ""}
                        onChange={(event) => setPasswordDrafts((current) => ({ ...current, [user.id]: event.target.value }))}
                        placeholder="Nova senha para este perfil"
                        minLength={6}
                        className="pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        aria-label={visiblePasswords[user.id] ? "Ocultar senha" : "Mostrar senha"}
                        title={visiblePasswords[user.id] ? "Ocultar senha" : "Mostrar senha"}
                        className="focus-ring absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                        onClick={() => setVisiblePasswords((current) => ({ ...current, [user.id]: !current[user.id] }))}
                      >
                        {visiblePasswords[user.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button type="button" variant="outline" onClick={() => updatePassword(user.id)} disabled={busyUserId === user.id}>
                      {busyUserId === user.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                      Salvar senha
                    </Button>
                    <Button type="button" variant="outline" size="icon" title="Remover acesso" aria-label="Remover acesso" onClick={() => removeUser(user.id)} disabled={busyUserId === user.id}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!users.length && (
                <div className="rounded-lg border border-dashed bg-background/70 p-8 text-center">
                  <UsersRound className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
                  <p className="text-sm font-semibold">Nenhum perfil cadastrado</p>
                  <p className="mt-1 text-sm text-muted-foreground">Crie o primeiro acesso da equipe no formulario ao lado.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card id="novo-perfil" className="glass-panel scroll-mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Novo perfil de login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createUser} className="space-y-4">
            <div className="rounded-lg border bg-background/70 p-3">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary">
                  <UserCog className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Acesso individual</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Cada pessoa entra no Orbit Leads usando o proprio email e senha cadastrados aqui.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-name">Nome</Label>
              <Input
                id="team-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Nome da pessoa"
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-email">Email de login</Label>
              <Input
                id="team-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="pessoa@empresa.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-password">Senha inicial</Label>
              <div className="relative">
                <Input
                  id="team-password"
                  type={showNewPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  minLength={6}
                  placeholder="Minimo 6 caracteres"
                  className="pr-10"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  aria-label={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                  title={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="focus-ring absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                  onClick={() => setShowNewPassword((current) => !current)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Papel do perfil</Label>
              <Select value={form.role} onValueChange={(value) => setForm((current) => ({ ...current, role: value as TeamRole }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="SELLER">Vendedor</SelectItem>
                  <SelectItem value="FINANCE">Financeiro</SelectItem>
                </SelectContent>
              </Select>
              <p className={cn("text-xs leading-5 text-muted-foreground", form.role === "ADMIN" && "text-emerald-600 dark:text-zinc-200")}>
                {roleDescriptions[form.role]}
              </p>
            </div>
            <Button type="submit" variant="premium" className="w-full" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Criar perfil de login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function getInitials(user: TeamUser) {
  const source = user.name || user.email || "OL";
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}
