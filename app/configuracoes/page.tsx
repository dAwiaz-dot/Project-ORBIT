import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/components/forms/settings-form";

export default function ConfiguracoesPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Sistema"
          title="Configuracoes"
          description="Configure token da Apify, mensagem padrao, logo, nome da empresa e comportamento visual."
        />
        <SettingsForm />
      </div>
    </AppShell>
  );
}
