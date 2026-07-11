import { CheckCircle2, FileSpreadsheet, ListChecks, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const requiredColumns = ["Empresa", "Cidade", "Estado", "Categoria"];
const recommendedColumns = ["Telefone", "Instagram", "Site", "Google Maps", "Nota", "Avaliacoes", "Endereco", "Latitude", "Longitude"];
const statusValues = ["Novo", "Mensagem enviada", "Respondeu", "Interessado", "Reuniao", "Proposta", "Cliente", "Perdido"];

export default function ImportacaoPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Operacao"
          title="Manual de importacao"
          description="Padrao operacional para preparar planilhas de leads antes de importar no Ryze CRM."
        />

        <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Estrutura da planilha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="mb-3 text-sm font-semibold">Colunas obrigatorias</p>
                <div className="flex flex-wrap gap-2">
                  {requiredColumns.map((column) => (
                    <Badge key={column} variant="success">{column}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-semibold">Colunas recomendadas</p>
                <div className="flex flex-wrap gap-2">
                  {recommendedColumns.map((column) => (
                    <Badge key={column} variant="secondary">{column}</Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border bg-background p-4 text-sm leading-6 text-muted-foreground">
                Formatos aceitos: XLSX e CSV em UTF-8. Telefones devem ser enviados preferencialmente apenas com numeros.
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Deduplicacao
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>O Ryze CRM considera duplicados quando Empresa, Telefone e Cidade indicam o mesmo contato.</p>
              <p>Se o telefone estiver vazio, revise manualmente nomes muito parecidos na mesma cidade.</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                Checklist antes de importar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Conferir cabecalhos das colunas.",
                "Validar Cidade e Estado em todas as linhas.",
                "Conferir notas de 0 a 5.",
                "Conferir avaliacoes como numero inteiro.",
                "Remover linhas vazias e duplicados obvios."
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border bg-background p-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Status validos</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {statusValues.map((status) => (
                <Badge key={status} variant="info">{status}</Badge>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
