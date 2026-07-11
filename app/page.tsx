import Link from "next/link";
import { Sora } from "next/font/google";
import {
  AppWindow,
  ArrowRight,
  Code2,
  Gauge,
  Github,
  Instagram,
  Layers,
  LineChart,
  Linkedin,
  Mail,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  MousePointerClick,
  Plug,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Workflow,
  Zap,
  type LucideIcon
} from "lucide-react";

const sora = Sora({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-sora" });

const SITE = {
  name: "Ryze Agency",
  tagline: "Sua marca sobe.",
  description:
    "Criamos experiencias digitais que transformam empresas em referencias. Sites premium, sistemas, trafego pago e branding para marcas que querem estar em outro nivel.",
  email: "contato@ryzeagency.com.br",
  whatsapp: "https://wa.me/5535988431028",
  social: {
    instagram: "https://instagram.com/ryze.agency.br",
    linkedin: "https://linkedin.com/company/ryze-agency",
    github: "https://github.com/ryze-agency"
  }
};

const NAV_LINKS = [
  { label: "Servicos", href: "#servicos" },
  { label: "Processo", href: "#processo" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Contato", href: "#contato" }
];

const STATS = [
  { value: "2", label: "Especialistas dedicados ao seu projeto" },
  { value: "100%", label: "De atencao — sem carteira de 40 clientes" },
  { value: "<24h", label: "Tempo medio de primeira resposta" },
  { value: "2026", label: "Ano em que a Ryze nasceu" }
];

const SERVICES: { icon: LucideIcon; title: string; description: string; details: string }[] = [
  {
    icon: Code2,
    title: "Desenvolvimento de Sites",
    description: "Sites institucionais rapidos, responsivos e construidos pra converter — nao so pra existir.",
    details: "Inclui: design sob medida, integracao com WhatsApp/formulario, otimizacao de velocidade e SEO tecnico desde o dia um."
  },
  {
    icon: AppWindow,
    title: "Landing Pages",
    description: "Paginas de alta conversao para campanhas, lancamentos e captacao — foco total em performance.",
    details: "Ideal pra anuncio pago, lancamento de produto ou captacao de leads — pagina unica com um objetivo claro."
  },
  {
    icon: Layers,
    title: "Sistemas Web",
    description: "Plataformas e paineis sob medida para automatizar processos e escalar operacoes.",
    details: "Ex.: painel de controle interno, area de cliente, ferramenta sob medida pra um processo especifico do seu negocio."
  },
  {
    icon: Target,
    title: "Google Ads",
    description: "Campanhas de busca e display estruturadas pra gerar demanda qualificada, nao so clique.",
    details: "Estruturacao de campanha, palavras-chave, segmentacao e acompanhamento — sem enrolacao de agencia de midia."
  },
  {
    icon: Megaphone,
    title: "Meta Ads",
    description: "Trafego pago em Instagram e Facebook com criativos e segmentacao orientados a resultado.",
    details: "Criativo, copy, segmentacao de publico e otimizacao continua com base em resultado real, nao so alcance."
  },
  {
    icon: Search,
    title: "SEO",
    description: "Estrutura tecnica, conteudo e autoridade pra sua marca aparecer onde o cliente ja esta procurando.",
    details: "Auditoria tecnica, otimizacao on-page, estrategia de conteudo e Google Meu Negocio pra quem depende de busca local."
  },
  {
    icon: Gauge,
    title: "Otimizacao",
    description: "Performance, Core Web Vitals e experiencia — sites rapidos convertem mais e rankeiam melhor.",
    details: "Diagnostico de performance, correcao de gargalos e ajuste fino pra carregar rapido em qualquer conexao."
  },
  {
    icon: Users,
    title: "Consultoria",
    description: "Diagnostico direto sobre o que esta travando seu digital e o plano pra destravar.",
    details: "Conversa de diagnostico + plano de acao priorizado — sem pacote fechado, sem venda casada."
  },
  {
    icon: Workflow,
    title: "Automacao",
    description: "Fluxos automatizados de atendimento, captacao e follow-up — menos trabalho manual, mais escala.",
    details: "Ex.: resposta automatica de WhatsApp, follow-up de lead esquecido, integracao entre formulario e CRM."
  }
];

const PROCESS_STEPS = [
  { number: "01", title: "Descoberta", description: "Entendemos seu negocio, objetivo e onde esta o gargalo. Sem enrolacao, sem proposta generica." },
  { number: "02", title: "Estrategia", description: "Tracamos o plano — site, conteudo, trafego, ou os tres juntos — priorizado pelo que gera resultado primeiro." },
  { number: "03", title: "Design", description: "Construimos a experiencia visual: identidade, hierarquia e interface pensadas pra sua marca, nao um template generico." },
  { number: "04", title: "Desenvolvimento", description: "Codigo limpo, performatico e responsivo. Cada detalhe testado antes de ir ao ar." },
  { number: "05", title: "Lancamento", description: "Publicacao acompanhada de perto, com checklist tecnico e de conteudo validado ponta a ponta." },
  { number: "06", title: "Crescimento", description: "Acompanhamento continuo — metricas, ajustes e otimizacoes pra marca seguir subindo depois do lancamento." }
];

const PORTFOLIO = [
  {
    title: "Ryze Agency",
    category: "Institucional",
    description: "O proprio site da Ryze, no ar hoje: identidade visual, secoes institucionais e captacao via WhatsApp.",
    gradient: "from-[#5B8CFF] to-[#00E5FF]",
    href: "https://web-eight-fawn-24.vercel.app"
  },
  {
    title: "Dra. Jessica Daniela",
    category: "Odontologia Estetica",
    description: "Site pra clinica odontologica em Varginha — galeria de casos, credenciais e agendamento via WhatsApp.",
    gradient: "from-[#7B61FF] to-[#00E5FF]",
    href: "https://drajessicadaniela.com.br/"
  },
  {
    title: "Dra. Bianca Pietrosante",
    category: "Endodontia",
    description: "Site institucional pra clinica de endodontia em Sao Bernardo do Campo — depoimentos, FAQ e agendamento direto.",
    gradient: "from-[#00E5FF] to-[#00FFA3]",
    href: "https://www.drabiancapietrosante.com.br/"
  },
  {
    title: "Atelier Barba Negra",
    category: "Barbearia Premium",
    description: "Site pra barbearia em Sao Paulo — tabela de servicos, agendamento online e portfolio visual.",
    gradient: "from-[#00FFA3] to-[#5B8CFF]",
    href: "https://barbearia-theta-ten.vercel.app/"
  },
  {
    title: "Glosshouse",
    category: "Estetica Automotiva",
    description: "Site pra studio de estetica automotiva em Alfenas — processo em etapas e captacao via Instagram.",
    gradient: "from-[#5B8CFF] to-[#7B61FF]",
    href: "https://glosshouse.vercel.app/"
  },
  {
    title: "Andrea Malta Nutricionista",
    category: "Nutricao Clinica",
    description: "Site institucional pra nutricionista em Campinas — credenciais, abordagem e agendamento via WhatsApp.",
    gradient: "from-[#7B61FF] to-[#5B8CFF]",
    href: "https://www.draandreamaltanutri.com.br/"
  }
];

const DIFFERENTIATORS: { icon: LucideIcon; title: string; description: string; large?: boolean }[] = [
  { icon: Zap, title: "Velocidade", description: "Carregamento otimizado do primeiro pixel ao ultimo.", large: true },
  { icon: ShieldCheck, title: "Seguranca", description: "Boas praticas aplicadas desde a arquitetura." },
  { icon: TrendingUp, title: "SEO", description: "Estrutura pensada pra ranquear desde o dia um." },
  { icon: Code2, title: "Codigo Limpo", description: "Componentizado, sem duplicacao, facil de evoluir." },
  { icon: MousePointerClick, title: "UX Premium", description: "Cada interacao pensada pra reduzir friccao.", large: true },
  { icon: Sparkles, title: "Design Exclusivo", description: "Zero template generico — identidade construida pra sua marca." },
  { icon: Plug, title: "Integracoes", description: "CRM, pagamento, automacao — conectado ao seu ecossistema." },
  { icon: LineChart, title: "Escalabilidade", description: "Arquitetura preparada pra crescer junto com o negocio." },
  { icon: MessagesSquare, title: "Suporte", description: "Time pequeno, resposta rapida — direto com quem constroi." },
  { icon: Wallet, title: "Preco Justo", description: "Investimento compativel com quem ta comecando ou testando o digital." }
];

const COMMITMENTS = [
  {
    title: "Comunicacao direta",
    description: "Voce fala com quem executa, nao com um atendimento terceirizado. Sem burocracia entre a ideia e a entrega."
  },
  {
    title: "Transparencia no processo",
    description: "Cronograma claro, decisoes explicadas, sem letra miuda. Voce acompanha cada etapa do projeto."
  },
  {
    title: "Atencao exclusiva",
    description: "Poucos projetos em paralelo, por escolha — pra cada cliente ter o nivel de atencao que merece."
  }
];

export default function LandingPage() {
  return (
    <main className={`${sora.variable} min-h-screen bg-[#050816] font-sans text-white`}>
      <header className="sticky top-0 z-40 border-b border-white/5 ryze-glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#" className="font-display text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-sora)" }}>
            Ryze<span className="text-[#00E5FF]">.</span>Agency
          </a>
          <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href={SITE.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-[#7B61FF] via-[#5B8CFF] to-[#00E5FF] px-5 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(91,140,255,.35)] transition hover:brightness-110"
          >
            Solicitar Projeto
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden py-24 sm:py-32">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 15%, rgba(123,97,255,.16), transparent 40%), radial-gradient(circle at 82% 8%, rgba(0,229,255,.12), transparent 38%)"
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_2px_rgba(0,229,255,0.7)]" />
              Marketing digital + desenvolvimento web
            </span>
            <h1
              className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl"
              style={{ fontFamily: "var(--font-sora)" }}
            >
              Criamos experiencias digitais que transformam empresas em referencias.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
              Desenvolvemos <strong className="font-semibold text-white">Sites Premium, Landing Pages, Sistemas, Trafego Pago</strong> e{" "}
              <strong className="font-semibold text-white">Branding</strong> — tudo desenhado pra colocar sua marca em outro nivel de
              percepcao e resultado.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={SITE.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full bg-gradient-to-r from-[#7B61FF] via-[#5B8CFF] to-[#00E5FF] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(91,140,255,.4)] transition hover:brightness-110"
              >
                Solicitar Projeto
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a
                href="#portfolio"
                className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.02] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
              >
                Ver Portfolio
              </a>
            </div>
          </div>

          <div className="relative mx-auto mt-20 hidden h-64 max-w-xl md:block">
            <div className="ryze-glass ryze-gradient-border absolute left-1/2 top-1/2 h-40 w-64 -translate-x-1/2 -translate-y-1/2 rounded-2xl p-5 animate-ryze-float">
              <Layers className="h-5 w-5 text-[#00E5FF]" />
              <div className="mt-4 h-2 w-3/4 rounded-full bg-white/15" />
              <div className="mt-2 h-2 w-1/2 rounded-full bg-white/10" />
              <div className="mt-6 flex gap-2">
                <span className="h-6 w-6 rounded-full bg-[#7B61FF]/60" />
                <span className="h-6 w-6 rounded-full bg-[#5B8CFF]/60" />
                <span className="h-6 w-6 rounded-full bg-[#00E5FF]/60" />
              </div>
            </div>
            <div
              className="ryze-glass ryze-gradient-border absolute -right-2 top-2 h-24 w-40 rounded-xl p-4 animate-ryze-float"
              style={{ animationDelay: "-2s" }}
            >
              <span className="text-xs font-semibold text-[#00FFA3]">+ Performance</span>
              <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
                <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-[#00FFA3] to-[#00E5FF]" />
              </div>
            </div>
            <div
              className="ryze-glass ryze-gradient-border absolute bottom-2 left-4 h-24 w-32 rounded-xl p-4 animate-ryze-float"
              style={{ animationDelay: "-4s" }}
            >
              <span className="text-xs font-semibold text-white/50">Conversao</span>
              <span className="mt-1 block text-lg font-bold text-white" style={{ fontFamily: "var(--font-sora)" }}>
                +3.4x
              </span>
            </div>
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7B61FF]/20 animate-ryze-spin-slow" />
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <span className="text-3xl font-bold text-white sm:text-4xl" style={{ fontFamily: "var(--font-sora)" }}>
                  {stat.value}
                </span>
                <p className="mt-2 text-sm text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="servicos" className="py-28">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading eyebrow="O que fazemos" title="Um time, todas as frentes do seu digital">
            Da primeira linha de codigo a campanha que traz o cliente — cada servico pensado pra funcionar junto, nao isolado.
          </SectionHeading>
          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ icon: Icon, title, description, details }) => (
              <div key={title} className="ryze-glass ryze-gradient-border rounded-2xl p-8">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#7B61FF]/25 to-[#00E5FF]/25">
                  <Icon className="h-5 w-5 text-[#00E5FF]" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white" style={{ fontFamily: "var(--font-sora)" }}>
                  {title}
                </h3>
                <p className="mt-2 text-sm text-white/60">{description}</p>
                <p className="mt-3 text-xs leading-5 text-white/40">{details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="processo" className="border-t border-white/5 bg-white/[0.02] py-28">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading eyebrow="Como funciona" title="Processo claro, do inicio ao crescimento" />
          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PROCESS_STEPS.map((step) => (
              <div key={step.number} className="ryze-glass ryze-gradient-border rounded-2xl p-7">
                <span className="text-sm font-semibold text-white/30">{step.number}</span>
                <h3 className="mt-3 text-lg font-semibold text-white" style={{ fontFamily: "var(--font-sora)" }}>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-white/60">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="portfolio" className="py-28">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading eyebrow="Portfolio" title="Projetos que ja colocamos no ar">
            De clinicas a barbearia, cada projeto abaixo e um cliente real que ja esta usando o site pra atender e captar gente nova.
          </SectionHeading>
          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PORTFOLIO.map((item) => (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="group ryze-glass ryze-gradient-border block overflow-hidden rounded-2xl"
              >
                <div className={`h-32 bg-gradient-to-br ${item.gradient} opacity-80 transition group-hover:opacity-100`} />
                <div className="p-6">
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/40">Case real</span>
                  <h3 className="mt-2 text-base font-semibold text-white" style={{ fontFamily: "var(--font-sora)" }}>
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-[#00E5FF]">{item.category}</p>
                  <p className="mt-3 text-sm text-white/50">{item.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="diferenciais" className="border-t border-white/5 bg-white/[0.02] py-28">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading eyebrow="Diferenciais" title="Por que a Ryze entrega em outro nivel" />
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {DIFFERENTIATORS.map(({ icon: Icon, title, description, large }) => (
              <div
                key={title}
                className={`ryze-glass ryze-gradient-border rounded-2xl p-6 ${large ? "sm:col-span-2" : ""}`}
              >
                <Icon className="h-5 w-5 text-[#7B61FF]" />
                <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
                <p className="mt-1 text-xs text-white/50">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading eyebrow="Compromissos" title="O que voce pode esperar da gente">
            A Ryze esta comecando — preferimos ser diretos sobre isso a inventar depoimento de cliente que nao existe. Em troca, voce
            trabalha direto com quem executa e ganha atencao que agencia grande nao consegue dar.
          </SectionHeading>
          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {COMMITMENTS.map((item) => (
              <div key={item.title} className="ryze-glass ryze-gradient-border rounded-2xl p-7">
                <h3 className="text-base font-semibold text-white" style={{ fontFamily: "var(--font-sora)" }}>
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-white/60">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contato" className="border-t border-white/5 bg-white/[0.02] py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <SectionHeading eyebrow="Vamos conversar" title="Pronto pra colocar sua marca em outro nivel?">
            Preencha o formulario ou chame direto no WhatsApp. Sem compromisso — so uma conversa pra entender onde a Ryze pode agregar.
          </SectionHeading>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={SITE.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-[#7B61FF] via-[#5B8CFF] to-[#00E5FF] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(91,140,255,.4)] transition hover:brightness-110"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Chamar no WhatsApp
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.02] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
            >
              <Mail className="mr-2 h-4 w-4" />
              {SITE.email}
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-14">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 sm:grid-cols-3">
          <div>
            <span className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-sora)" }}>
              Ryze<span className="text-[#00E5FF]">.</span>Agency
            </span>
            <p className="mt-3 max-w-xs text-sm text-white/50">{SITE.description}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Contato</h4>
            <p className="mt-3 text-sm text-white/50">{SITE.email}</p>
            <p className="mt-1 text-sm text-white/50">WhatsApp</p>
            <p className="mt-1 text-sm text-white/50">Brasil · Atendimento remoto</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Redes</h4>
            <div className="mt-3 flex gap-3">
              <a href={SITE.social.instagram} target="_blank" rel="noreferrer" className="text-white/50 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href={SITE.social.linkedin} target="_blank" rel="noreferrer" className="text-white/50 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href={SITE.social.github} target="_blank" rel="noreferrer" className="text-white/50 hover:text-white">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl border-t border-white/5 px-6 pt-6 text-xs text-white/30">
          © 2026 Ryze Agency. Todos os direitos reservados. Feito com atencao a cada detalhe.
        </div>
      </footer>
    </main>
  );
}

function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
        <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_2px_rgba(0,229,255,0.7)]" />
        {eyebrow}
      </span>
      <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl" style={{ fontFamily: "var(--font-sora)" }}>
        {title}
      </h2>
      {children && <p className="mt-4 text-white/60">{children}</p>}
    </div>
  );
}
