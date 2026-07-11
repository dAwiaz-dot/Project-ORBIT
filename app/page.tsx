import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Building2,
  FileSpreadsheet,
  KanbanSquare,
  MapPinned,
  MessageSquareText,
  Repeat,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
  Workflow
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrbitLogo } from "@/components/ui/orbit-logo";

const WHATSAPP_URL = "https://wa.me/5535988431028?text=Ola!%20Quero%20conhecer%20o%20Orbit%20Leads.";

const NAV_LINKS = [
  { href: "#servicos", label: "Servicos" },
  { href: "#processo", label: "Como funciona" },
  { href: "#diferenciais", label: "Diferenciais" },
  { href: "#contato", label: "Contato" }
];

const SERVICES = [
  { icon: MapPinned, title: "Busca no Google Maps", description: "Encontre empresas por estado, cidade e categoria em minutos." },
  { icon: Sparkles, title: "Filtros inteligentes", description: "Nota minima, quantidade de avaliacoes e presenca digital." },
  { icon: KanbanSquare, title: "CRM em Kanban", description: "Organize oportunidades por etapa do funil comercial." },
  { icon: MessageSquareText, title: "Mensagens personalizadas", description: "Templates com variaveis de empresa, cidade e categoria." },
  { icon: FileSpreadsheet, title: "Exportacao pronta", description: "Planilhas por categoria, prontas para a equipe comercial." },
  { icon: Bot, title: "IA de qualificacao", description: "Score de potencial calculado automaticamente por lead." },
  { icon: Workflow, title: "Automacoes", description: "Regras de cadencia e follow-up sem esforco manual." },
  { icon: BarChart3, title: "Relatorios e metricas", description: "Visao clara de performance de prospeccao e conversao." }
];

const PROCESS = [
  { step: "01", title: "Buscar", description: "Defina estado, cidade e categoria e inicie a busca no Google Maps." },
  { step: "02", title: "Filtrar", description: "Aplique filtros de nota, avaliacoes e presenca digital." },
  { step: "03", title: "Organizar", description: "Leads chegam classificados por categoria e cidade." },
  { step: "04", title: "Personalizar", description: "Gere mensagens unicas para cada lead com variaveis automaticas." },
  { step: "05", title: "Negociar", description: "Acompanhe o funil comercial direto no CRM em Kanban." },
  { step: "06", title: "Exportar", description: "Baixe listas prontas para a operacao comercial em XLSX ou CSV." }
];

const DIFFERENTIATORS = [
  { icon: Building2, text: "Feito para agencias de marketing que vendem para negocios locais" },
  { icon: ShieldCheck, text: "Sem leads ficticios: dados reais direto da Apify" },
  { icon: Timer, text: "Prospeccao que levava dias, feita em minutos" },
  { icon: Repeat, text: "Automacoes de cadencia e follow-up embutidas" },
  { icon: Users, text: "Times com controle de acesso e auditoria" },
  { icon: MessageSquareText, text: "Links de WhatsApp seguros, sem envio automatico" }
];

const COMMITMENTS = [
  "Dados salvos com seguranca no seu proprio banco PostgreSQL",
  "Sem cobranca por lead ficticio ou dado inventado",
  "Transparencia total: voce escolhe o provedor de busca (Apify)",
  "Suporte direto pelo WhatsApp para duvidas de implantacao"
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_10%,rgba(255,255,255,.06),transparent_35%),linear-gradient(180deg,#050505_0%,#090909_48%,#020202_100%)] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 sm:px-6">
          <OrbitLogo />
          <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden text-white hover:bg-white/10 sm:inline-flex">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild variant="premium" size="sm">
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                Solicitar demonstracao
              </a>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1200px] px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <div className="mb-6 inline-flex items-center rounded-md border border-white/20 px-3 py-1 text-sm text-white/80">
            <Sparkles className="mr-2 h-4 w-4" />
            SaaS premium de prospeccao para agencias
          </div>
          <h1 className="text-4xl font-bold tracking-normal sm:text-6xl">
            Criamos previsibilidade comercial que transforma agencias
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
            O Orbit Leads encontra empresas no Google Maps, filtra oportunidades reais, organiza tudo por
            categoria e cidade e entrega listas prontas para sua equipe comercial fechar negocio.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="premium" size="lg">
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                Chamar no WhatsApp
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/20 bg-transparent text-white hover:bg-white/10">
              <Link href="/login">Entrar na plataforma</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="servicos" className="border-t border-white/10 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">O que o Orbit Leads entrega</h2>
            <p className="mt-3 text-white/60">Tudo que uma operacao de prospeccao precisa, em um so lugar.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-white/10 bg-white/[0.03] text-white">
                <CardContent className="pt-5">
                  <div className="mb-4 grid h-10 w-10 place-items-center rounded-md bg-white/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-white/60">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="processo" className="py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Como funciona</h2>
            <p className="mt-3 text-white/60">Da busca ao fechamento, em seis etapas.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROCESS.map(({ step, title, description }) => (
              <div key={step} className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
                <span className="text-sm font-semibold text-white/40">{step}</span>
                <h3 className="mt-2 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-white/60">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="diferenciais" className="border-t border-white/10 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Por que agencias escolhem o Orbit</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DIFFERENTIATORS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-5">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-white/70" />
                <p className="text-sm text-white/80">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 sm:p-12">
            <h2 className="text-2xl font-bold sm:text-3xl">Nossos compromissos</h2>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {COMMITMENTS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/70">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="contato" className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-[1200px] px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">Pronto para prospectar com previsibilidade?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Fale com a gente pelo WhatsApp e veja o Orbit Leads funcionando na sua operacao.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="premium" size="lg">
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                Chamar no WhatsApp
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/20 bg-transparent text-white hover:bg-white/10">
              <Link href="/login">Entrar na plataforma</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <OrbitLogo compact />
          <p className="text-xs text-white/40">© {new Date().getFullYear()} Orbit Leads. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
