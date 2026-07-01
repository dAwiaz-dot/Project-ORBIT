import { SearchCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

const history: Array<[string, string, string, string]> = [];

export default function HistoricoPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Auditoria"
          title="Historico"
          description="Acompanhe buscas, filtros aplicados, duplicados removidos e leads gravados."
        />
        {history.length ? null : (
          <Card className="glass-panel">
            <CardContent className="grid min-h-[320px] place-items-center p-8 text-center">
              <div className="max-w-md">
                <SearchCheck className="mx-auto h-10 w-10 text-primary" />
                <h2 className="mt-4 text-xl font-bold">Historico limpo</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Nenhuma busca foi executada ainda. O historico sera preenchido automaticamente quando a operacao comecar.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
