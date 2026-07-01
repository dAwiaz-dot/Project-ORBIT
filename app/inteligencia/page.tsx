import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { LeadIntelligencePanel } from "@/components/intelligence/lead-intelligence-panel";

export default function InteligenciaPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="IA comercial"
          title="Inteligencia de leads"
          description="Analise empresas, score de potencial, Google Maps, site, Instagram e gere mensagens unicas para cada oportunidade."
        />
        <LeadIntelligencePanel />
      </div>
    </AppShell>
  );
}
