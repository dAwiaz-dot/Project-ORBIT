import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { KanbanBoard } from "@/components/crm/kanban-board";

export default function CrmPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="CRM"
          title="Pipeline Kanban"
          description="Arraste leads entre as etapas comerciais, acompanhe valor potencial e mantenha o time alinhado."
        />
        <KanbanBoard />
      </div>
    </AppShell>
  );
}
