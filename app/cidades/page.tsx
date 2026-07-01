import { AppShell } from "@/components/layout/app-shell";
import { CityManager } from "@/components/forms/city-manager";
import { PageHeader } from "@/components/layout/page-header";

export default function CidadesPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Territorios"
          title="Cidades"
          description="Cadastre cidades do Sul de Minas e adicione qualquer cidade do Brasil para expandir a prospeccao."
        />
        <CityManager />
      </div>
    </AppShell>
  );
}
