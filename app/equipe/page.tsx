import { UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { TeamManagement } from "@/components/team/team-management";

export default function EquipePage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Colaboracao"
          title="Equipe"
          description="Cadastre pessoas, crie perfis de login e controle permissoes de administradores, vendedores e financeiro."
          actions={
            <Button variant="premium" asChild>
              <a href="#novo-perfil">
                <UserPlus className="mr-2 h-4 w-4" />
                Novo perfil
              </a>
            </Button>
          }
        />
        <TeamManagement />
      </div>
    </AppShell>
  );
}
