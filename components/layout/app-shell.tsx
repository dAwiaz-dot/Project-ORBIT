"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Download,
  FileSpreadsheet,
  FileBarChart,
  Landmark,
  History,
  LayoutDashboard,
  MapPinned,
  MessagesSquare,
  Search,
  Settings,
  Sparkles,
  Tags,
  Workflow,
  UsersRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrbitLogo } from "@/components/ui/orbit-logo";
import { Separator } from "@/components/ui/separator";
import { ProfileMenu } from "@/components/user/profile-menu";
import { hasPermission, type Permission } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const navigation: { label: string; href: string; icon: typeof LayoutDashboard; permission?: Permission }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inteligencia", href: "/inteligencia", icon: Bot },
  { label: "Buscar Leads", href: "/buscar-leads", icon: Search, permission: "searchJobs:create" },
  { label: "Leads", href: "/leads", icon: Building2 },
  { label: "CRM", href: "/crm", icon: BriefcaseBusiness },
  { label: "Mapa", href: "/mapa", icon: MapPinned },
  { label: "Categorias", href: "/categorias", icon: Tags },
  { label: "Cidades", href: "/cidades", icon: MapPinned },
  { label: "Mensagens", href: "/mensagens", icon: MessagesSquare },
  { label: "Campanhas", href: "/campanhas", icon: BriefcaseBusiness },
  { label: "Automacoes", href: "/automacoes", icon: Workflow },
  { label: "Financeiro", href: "/financeiro", icon: Landmark, permission: "finance:read" },
  { label: "Relatorios", href: "/relatorios", icon: FileBarChart },
  { label: "Exportacoes", href: "/exportacoes", icon: Download },
  { label: "Importacao", href: "/importacao", icon: FileSpreadsheet },
  { label: "Historico", href: "/historico", icon: History, permission: "audit:read" },
  { label: "Equipe", href: "/equipe", icon: UsersRound, permission: "team:read" },
  { label: "Configuracoes", href: "/configuracoes", icon: Settings, permission: "settings:read" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const visibleNavigation = navigation.filter((item) => !item.permission || (role && hasPermission(role, item.permission)));

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] border-r bg-card/90 px-4 py-4 shadow-sm backdrop-blur-xl dark:bg-black/88 lg:flex lg:flex-col">
        <Link href="/dashboard" className="mb-5 block">
          <OrbitLogo />
        </Link>

        <div className="mb-4 rounded-lg border bg-secondary/40 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            Ryze Intelligence
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Ambiente limpo para apresentacao. Pronto para gerar os primeiros leads.
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
          {visibleNavigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  active && "bg-primary/10 text-primary"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Separator className="my-4" />

        <div className="rounded-lg border bg-background p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Plano Ryze</p>
            <BarChart3 className="h-4 w-4 text-accent" />
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-0 bg-[linear-gradient(90deg,#7B61FF,#00E5FF)]" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">0% da meta mensal. Base zerada.</p>
        </div>
      </aside>

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl dark:bg-black/72">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Link href="/dashboard" className="lg:hidden">
              <OrbitLogo compact />
            </Link>

            <div className="relative hidden w-full max-w-xl md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-10 bg-card pl-9" placeholder="Pesquisar leads, cidades, categorias..." />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button asChild variant="premium" className="hidden sm:inline-flex">
                <Link href="/buscar-leads">
                  <Search className="mr-2 h-4 w-4" />
                  Gerar leads
                </Link>
              </Button>
              <Button variant="outline" size="icon" title="Agenda de campanhas" aria-label="Agenda de campanhas">
                <CalendarClock className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" title="Notificacoes" aria-label="Notificacoes">
                <Bell className="h-4 w-4" />
              </Button>
              <ProfileMenu />
            </div>
          </div>
        </header>

        <main>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="pb-20 lg:pb-0"
          >
            {children}
          </motion.div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-panel backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {visibleNavigation.slice(0, 5).map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-semibold text-muted-foreground",
                  active && "bg-primary/10 text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="max-w-full truncate">{item.label.replace("Inteligencia", "IA")}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
