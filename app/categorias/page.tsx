import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { CategoryManager } from "@/components/forms/category-manager";

export default function CategoriasPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Segmentacao"
          title="Categorias"
          description="Gerencie os nichos usados nas buscas, campanhas, filtros e exportacoes por aba."
        />
        <CategoryManager />
      </div>
    </AppShell>
  );
}
