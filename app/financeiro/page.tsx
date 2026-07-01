import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { FinanceOverview } from "@/components/finance/finance-overview";

export default function FinanceiroPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Receita"
          title="Financeiro"
          description="Cadastre vendas, comissoes, formas de pagamento, receita mensal e lucro estimado."
        />
        <FinanceOverview />
      </div>
    </AppShell>
  );
}
