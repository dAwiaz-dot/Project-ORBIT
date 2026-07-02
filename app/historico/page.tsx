import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { AuditLogTable } from "@/components/audit/audit-log-table";

export default function HistoricoPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Auditoria"
          title="Historico"
          description="Acompanhe buscas, filtros aplicados, duplicados removidos e leads gravados."
        />
        <AuditLogTable />
      </div>
    </AppShell>
  );
}
