import { UserPlus, UsersRound } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const people: Array<[string, string, string]> = [];

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
        {people.length ? null : (
          <Card className="glass-panel">
            <CardContent className="grid min-h-[320px] place-items-center p-8 text-center">
              <div className="max-w-md">
                <UsersRound className="mx-auto h-10 w-10 text-primary" />
                <h2 className="mt-4 text-xl font-bold">Equipe pronta para configurar</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Nenhum usuario demonstrativo foi mantido. Depois voce adiciona administrador, vendedor e financeiro.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
