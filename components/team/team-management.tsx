"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TeamRole = "ADMIN" | "SELLER" | "FINANCE";

type TeamUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: TeamRole;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

const roleLabels: Record<TeamRole, string> = {
  ADMIN: "Administrador",
  SELLER: "Vendedor",
  FINANCE: "Financeiro"
};

export function TeamManagement() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "SELLER" as TeamRole });

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

    const data = (await response.json()) as { users: TeamUser[] };
    setUsers(data.users);
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

    setSaving(false);
    if (!response.ok) {
      toast.error("Nao foi possivel criar o usuario");
      return;
    }

    setForm({ name: "", email: "", password: "", role: "SELLER" });
    toast.success("Usuario criado");
    await loadUsers();
  }

  async function updateRole(userId: string, role: TeamRole) {
    setUsers((current) => current.map((user) => (user.id === userId ? { ...user, role } : user)));
    const response = await fetch(`/api/team/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });

    if (!response.ok) {
      toast.error("Nao foi possivel atualizar o papel");
      await loadUsers();
      return;
    }

    toast.success("Permissao atualizada");
  }

  async function removeUser(userId: string) {
    const response = await fetch(`/api/team/${userId}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Nao foi possivel remover o usuario");
      return;
    }

    setUsers((current) => current.filter((user) => user.id !== userId));
    toast.success("Acesso removido");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Usuarios e permissoes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid min-h-[260px] place-items-center text-sm text-muted-foreground">
              <Loader2 className="mb-3 h-5 w-5 animate-spin" />
              Carregando equipe
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="grid gap-3 rounded-lg border bg-background p-4 sm:grid-cols-[1fr_180px_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.name ?? "Sem nome"}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email ?? "Email nao informado"}</p>
                  </div>
                  <Select value={user.role} onValueChange={(value) => updateRole(user.id, value as TeamRole)}>
                    <SelectTrigger>
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
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={user.role === "ADMIN" ? "success" : "secondary"}>{roleLabels[user.role]}</Badge>
                    <Button type="button" variant="outline" size="icon-sm" title="Remover acesso" aria-label="Remover acesso" onClick={() => removeUser(user.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!users.length && (
                <div className="rounded-lg border border-dashed bg-background/70 p-8 text-center text-sm text-muted-foreground">
                  Nenhum usuario encontrado.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Novo usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createUser} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Senha inicial</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Papel</Label>
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
            </div>
            <Button type="submit" variant="premium" className="w-full" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Criar usuario
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
