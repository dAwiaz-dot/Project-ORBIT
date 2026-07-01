import { Target } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const campaigns: Array<[string, string, string, string]> = [];

export default function CampanhasPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Operacao comercial"
          title="Campanhas"
          description="Organize listas de abordagem, acompanhe envio manual e priorize quem respondeu."
          actions={
            <Button variant="premium">
              <Target className="mr-2 h-4 w-4" />
              Nova campanha
            </Button>
          }
        />
        {campaigns.length ? null : (
          <Card className="glass-panel">
            <CardContent className="grid min-h-[320px] place-items-center p-8 text-center">
              <div className="max-w-md">
                <Target className="mx-auto h-10 w-10 text-primary" />
                <h2 className="mt-4 text-xl font-bold">Nenhuma campanha criada</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  A area esta limpa para apresentacao. Depois, campanhas serao criadas a partir de listas de leads segmentadas.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
