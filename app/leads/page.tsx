import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { LeadTable } from "@/components/leads/lead-table";

export default function LeadsPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Pipeline comercial"
          title="Leads"
          description="Tabela moderna com pesquisa em tempo real, filtros, ordenacao, paginacao e acao segura para abrir WhatsApp."
        />
        <LeadTable />
      </div>
    </AppShell>
  );
}
