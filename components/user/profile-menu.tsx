"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut, RefreshCw, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  SELLER: "Vendedor",
  FINANCE: "Financeiro"
};

export function ProfileMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const user = session?.user;

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = getInitials(user?.name ?? user?.email ?? "OR");

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="focus-ring grid h-9 w-9 place-items-center rounded-lg bg-foreground text-xs font-bold text-background"
        aria-label="Abrir perfil"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {status === "loading" ? "..." : initials}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-[290px] rounded-lg border bg-card p-2 shadow-panel dark:bg-black">
          <div className="rounded-md bg-secondary/60 p-3">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-foreground text-xs font-bold text-background">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.name ?? "Perfil Ryze"}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email ?? "Sessao ativa"}</p>
                <Badge variant={user?.role === "ADMIN" ? "success" : "secondary"} className="mt-2">
                  {roleLabels[user?.role ?? "SELLER"] ?? "Usuario"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-2 grid gap-1">
            <Button asChild variant="ghost" className="justify-start">
              <Link href="/perfil" onClick={() => setOpen(false)}>
                <UserRound className="mr-2 h-4 w-4" />
                Meu perfil
              </Link>
            </Button>
            {user?.role === "ADMIN" && (
              <Button asChild variant="ghost" className="justify-start">
                <Link href="/equipe" onClick={() => setOpen(false)}>
                  <UsersRound className="mr-2 h-4 w-4" />
                  Gerenciar equipe
                </Link>
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              className="justify-start"
              onClick={() => signOut({ callbackUrl: "/login?callbackUrl=/dashboard" })}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Trocar perfil
            </Button>
            <Button type="button" variant="ghost" className="justify-start text-rose-600 dark:text-zinc-200" onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>

          <div className="mt-2 flex items-center gap-2 rounded-md border bg-background p-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Sessao protegida pelo Ryze CRM
          </div>
        </div>
      )}
    </div>
  );
}

function getInitials(value: string) {
  return value
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
