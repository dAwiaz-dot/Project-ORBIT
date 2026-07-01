import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { AutomationCenter } from "@/components/automation/automation-center";

export default function AutomacoesPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Motor operacional"
          title="Automacoes"
          description="Crie gatilhos para follow-up, propostas, contratos, orcamentos e notificacoes internas."
        />
        <AutomationCenter />
      </div>
    </AppShell>
  );
}
