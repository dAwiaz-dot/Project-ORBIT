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
          description="Gerencie acessos, papeis e responsaveis pelas campanhas de prospeccao."
          actions={
            <Button variant="premium">
              <UserPlus className="mr-2 h-4 w-4" />
              Convidar
            </Button>
          }
        />
        <TeamManagement />
      </div>
    </AppShell>
  );
}
