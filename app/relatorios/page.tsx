import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ReportsCenter } from "@/components/reports/reports-center";

export default function RelatoriosPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Business intelligence"
          title="Relatorios"
          description="Gere PDF, Excel e CSV para lideranca, vendas, financeiro e auditoria da operacao."
        />
        <ReportsCenter />
      </div>
    </AppShell>
  );
}
