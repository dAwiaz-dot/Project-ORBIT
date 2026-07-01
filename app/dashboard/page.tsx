import { Download, MapPinned, Search } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { GrowthChart } from "@/components/charts/growth-chart";
import { RankList } from "@/components/charts/rank-list";
import { MetricCard } from "@/components/leads/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryData, cityData, mockLeads, recentSearches } from "@/data/mock-data";
import { buildDashboardMetrics } from "@/services/crm/dashboard-metrics.service";

export default function DashboardPage() {
  const metrics = buildDashboardMetrics(mockLeads);
  const leadMetrics = [
    { label: "Total de Leads", value: metrics.totalLeads.toLocaleString("pt-BR"), trend: "Base limpa", tone: "blue" as const },
    { label: "Leads Hoje", value: metrics.leadsToday.toLocaleString("pt-BR"), trend: "Nenhuma busca ainda", tone: "slate" as const },
    { label: "Leads Semana", value: metrics.leadsWeek.toLocaleString("pt-BR"), trend: "Pronto para operar", tone: "green" as const },
    { label: "Leads Mes", value: metrics.leadsMonth.toLocaleString("pt-BR"), trend: "Base zerada", tone: "blue" as const },
    { label: "Taxa de Conversao", value: `${metrics.conversionRate}%`, trend: "Sem vendas ainda", tone: "amber" as const },
    { label: "Clientes Fechados", value: metrics.closedClients.toLocaleString("pt-BR"), trend: "Aguardando pipeline", tone: "green" as const },
    { label: "Receita", value: metrics.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }), trend: "Sem receita registrada", tone: "rose" as const }
  ];

  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Orbit Leads"
          title="Dashboard de prospeccao"
          description="Visao executiva dos leads capturados, oportunidades sem site, canais disponiveis e crescimento da base."
          actions={
            <>
              <Button asChild variant="outline">
                <Link href="/api/leads/export?format=xlsx">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Link>
              </Button>
              <Button asChild variant="premium">
                <Link href="/buscar-leads">
                  <Search className="mr-2 h-4 w-4" />
                  Buscar leads
                </Link>
              </Button>
            </>
          }
        />

        <section className="grid metric-grid gap-4">
          {leadMetrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.45fr_.75fr]">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Grafico de crescimento</CardTitle>
            </CardHeader>
            <CardContent>
              <GrowthChart />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Leads por cidade</CardTitle>
              </CardHeader>
            <CardContent>
                {cityData.length ? (
                  <RankList items={cityData} labelKey="city" valueKey="leads" tone="blue" />
                ) : (
                  <p className="rounded-lg border bg-background px-3 py-4 text-sm text-muted-foreground">Nenhuma cidade ranqueada ainda.</p>
                )}
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Buscas recentes</CardTitle>
              </CardHeader>
            <CardContent className="space-y-3">
                {recentSearches.length ? recentSearches.map((search) => (
                  <div key={search} className="rounded-lg border bg-background px-3 py-2 text-sm font-medium">
                    {search}
                  </div>
                )) : <p className="rounded-lg border bg-background px-3 py-4 text-sm text-muted-foreground">Nenhuma busca executada ainda.</p>}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Ranking de categorias</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length ? (
                <RankList items={categoryData} labelKey="category" valueKey="value" tone="green" />
              ) : (
                <p className="rounded-lg border bg-background px-3 py-4 text-sm text-muted-foreground">Ranking sera preenchido apos gerar leads.</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPinned className="h-5 w-5 text-primary" />
                Mapa das cidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-[260px] overflow-hidden rounded-lg border bg-[linear-gradient(135deg,#F8FAFC,#EEF4FF_45%,#ECFDF5)] dark:bg-[linear-gradient(135deg,#050505,#111111_45%,#020202)]">
                <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] [background-size:42px_42px]" />
                {cityData.length ? cityData.map((city, index) => (
                  <div
                    key={city.city}
                    className="absolute rounded-lg border bg-card/95 px-3 py-2 text-xs shadow-sm"
                    style={{ left: `${12 + index * 15}%`, top: `${18 + (index % 3) * 22}%` }}
                  >
                    <p className="font-semibold">{city.city}</p>
                    <p className="text-muted-foreground">{city.leads.toLocaleString("pt-BR")} leads</p>
                  </div>
                )) : (
                  <div className="absolute inset-0 grid place-items-center p-6 text-center">
                    <p className="max-w-sm text-sm text-muted-foreground">O mapa comercial sera preenchido quando a primeira busca for executada.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
