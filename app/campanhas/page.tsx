import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { CampaignsCenter } from "@/components/campaigns/campaigns-center";

export default function CampanhasPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Operacao comercial"
          title="Campanhas"
          description="Organize listas de abordagem, acompanhe envio manual e priorize quem respondeu."
        />
        <CampaignsCenter />
      </div>
    </AppShell>
  );
}
