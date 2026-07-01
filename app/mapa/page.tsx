import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { LeadsMap } from "@/components/maps/leads-map";

export default function MapaPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Territorio comercial"
          title="Mapa de leads"
          description="Visualize oportunidades por cidade e status. Cada marcador representa uma empresa no pipeline."
        />
        <LeadsMap />
      </div>
    </AppShell>
  );
}
