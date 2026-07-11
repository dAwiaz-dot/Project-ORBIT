"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrbitLogo } from "@/components/ui/orbit-logo";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const callbackUrl = getSafeCallbackUrl(new URLSearchParams(window.location.search).get("callbackUrl"));
    const result = await signIn("credentials", {
      login: String(form.get("login")),
      password: String(form.get("password")),
      redirect: false,
      callbackUrl
    });
    setLoading(false);

    if (result?.error) {
      toast.error("Nao foi possivel entrar", { description: "Confira login e senha." });
      return;
    }

    window.location.assign(callbackUrl);
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
      <section className="hidden border-r border-white/10 bg-[radial-gradient(circle_at_24%_14%,rgba(123,97,255,.22),transparent_31%),linear-gradient(145deg,#0b1020,#050816_62%,#05050f)] text-white lg:flex lg:flex-col lg:justify-between lg:p-10">
        <OrbitLogo />
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center rounded-md border border-white/20 px-3 py-1 text-sm text-white/80">
            <Sparkles className="mr-2 h-4 w-4 text-white" />
            SaaS de prospeccao para agencias que querem escala
          </div>
          <h1 className="font-display text-5xl font-bold tracking-tight">
            Encontre empresas prontas para virar clientes da Ryze.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
            Leads do Google Maps, filtros inteligentes, mensagens com variaveis, WhatsApp seguro e exportacao por categoria.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            ["12.8k", "leads mapeados"],
            ["36%", "sem site"],
            ["74%", "com WhatsApp"]
          ].map(([value, label]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-bold">{value}</p>
              <p className="mt-1 text-xs text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md border bg-card shadow-panel">
          <CardContent className="p-7">
            <div className="mb-8 flex items-center justify-between">
              <OrbitLogo />
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold">Entrar na Ryze</h2>
              <p className="mt-2 text-sm text-muted-foreground">Acesse seu cockpit de prospeccao.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login">Email ou login</Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="login" name="login" type="text" autoComplete="username" className="pl-9" placeholder="seu@email.com" required />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link href="#" className="text-xs font-semibold text-primary hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="px-9"
                    placeholder="Sua senha"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    aria-pressed={showPassword}
                    title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="focus-ring absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" size="lg" variant="premium" className="w-full" disabled={loading}>
                Entrar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function getSafeCallbackUrl(value: string | null) {
  if (!value) return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  if (value.startsWith("/api") || value.startsWith("/_next") || value.includes(".")) return "/dashboard";
  return value;
}
