import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileSettings } from "@/components/user/profile-settings";

export default function PerfilPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Conta"
          title="Meu perfil"
          description="Veja o perfil logado, troque de usuario, saia da sessao e atualize seus dados de acesso."
        />
        <ProfileSettings />
      </div>
    </AppShell>
  );
}
