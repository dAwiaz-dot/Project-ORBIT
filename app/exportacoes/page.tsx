import Link from "next/link";
import { Download, FileSpreadsheet, TableProperties } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExportacoesPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Dados portaveis"
          title="Exportacoes"
          description="Gere planilhas em Excel ou CSV. No Excel, cada categoria e organizada em uma aba propria."
        />
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Excel por categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-5 text-sm leading-6 text-muted-foreground">
                Arquivo XLSX com uma aba para cada segmento e uma aba consolidada com todos os leads.
              </p>
              <Button asChild variant="premium">
                <Link href="/api/leads/export?format=xlsx">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Excel
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TableProperties className="h-5 w-5 text-accent" />
                CSV rapido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-5 text-sm leading-6 text-muted-foreground">
                Exportacao leve para importar em CRMs, planilhas online e ferramentas de automacao.
              </p>
              <Button asChild variant="outline">
                <Link href="/api/leads/export?format=csv">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar CSV
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
