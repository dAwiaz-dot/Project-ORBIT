import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SearchLeadsForm } from "@/components/forms/search-leads-form";

export default function BuscarLeadsPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Google Maps + Apify"
          title="Buscar Leads"
          description="Monte uma busca precisa por cidade, categoria, nota e sinais digitais para priorizar empresas com maior potencial comercial."
        />
        <SearchLeadsForm />
      </div>
    </AppShell>
  );
}
