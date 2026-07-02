import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, CalendarClock, ExternalLink, FileText, Globe2, Instagram, MessageCircle, Star, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { leadStatusLabels, leadStatusTone } from "@/models/lead-status";
import { buildWhatsAppUrl } from "@/services/whatsapp.service";
import type { LeadDetail } from "@/types/lead";
import { formatPhone, formatRating } from "@/utils/formatters";

export function LeadDetailView({ lead }: { lead: LeadDetail }) {
  const whatsappMessage = `Ola ${lead.company}, tudo bem? Vi o trabalho de voces em ${lead.city} e queria te mostrar uma oportunidade rapida.`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/leads">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <Button asChild variant="premium" size="sm">
          <a href={buildWhatsAppUrl(lead.phone, whatsappMessage)} target="_blank">
            <MessageCircle className="mr-2 h-4 w-4" />
            Abrir WhatsApp
          </a>
        </Button>
        {lead.website && (
          <Button asChild variant="outline" size="sm">
            <a href={lead.website} target="_blank">
              <Globe2 className="mr-2 h-4 w-4" />
              Site
            </a>
          </Button>
        )}
        {lead.googleMapsUrl && (
          <Button asChild variant="outline" size="sm">
            <a href={lead.googleMapsUrl} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Google Maps
            </a>
          </Button>
        )}
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card className="glass-panel">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-2xl">{lead.company}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{lead.address || `${lead.city}/${lead.state}`}</p>
              </div>
              <Badge variant={leadStatusTone[lead.status]}>{leadStatusLabels[lead.status]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Info label="Categoria" value={lead.category} />
            <Info label="Cidade" value={`${lead.city}/${lead.state}`} />
            <Info label="Telefone" value={formatPhone(lead.phone)} />
            <Info label="Nota" value={formatRating(lead.rating)} />
            <Info label="Avaliacoes" value={lead.reviewCount?.toLocaleString("pt-BR") ?? "-"} />
            <Info label="WhatsApp" value={lead.hasWhatsApp ? "Sim" : "Nao"} />
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" />
              Responsavel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Info label="Dono do lead" value={lead.owner?.name ?? "Nao atribuido"} />
            <Info label="Email" value={lead.owner?.email ?? "-"} />
            <Info label="Criado em" value={new Date(lead.createdAt).toLocaleString("pt-BR")} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <ChannelCard icon={<Globe2 className="h-5 w-5 text-primary" />} title="Site" value={lead.website ?? "Sem site"} tone={lead.website ? "secondary" : "warning"} />
        <ChannelCard icon={<Instagram className="h-5 w-5 text-primary" />} title="Instagram" value={lead.instagram ?? "Nao encontrado"} tone={lead.instagram ? "secondary" : "warning"} />
        <ChannelCard icon={<Star className="h-5 w-5 text-primary" />} title="Score IA" value={lead.analysis ? `${lead.analysis.potentialScore}/100` : "Sem analise"} tone={lead.analysis ? "success" : "secondary"} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Analise inteligente</CardTitle>
          </CardHeader>
          <CardContent>
            {lead.analysis ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-4">
                  <Info label="Probabilidade" value={`${lead.analysis.closeProbability}%`} />
                  <Info label="Google Maps" value={`${lead.analysis.googleMapsScore}/100`} />
                  <Info label="Site" value={`${lead.analysis.siteScore}/100`} />
                  <Info label="Instagram" value={`${lead.analysis.instagramScore}/100`} />
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <p className="text-sm font-semibold">Motivos</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {lead.analysis.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border bg-background p-4 text-sm leading-6 text-muted-foreground">{lead.analysis.generatedMessage}</div>
              </div>
            ) : (
              <EmptyState text="Nenhuma analise de IA foi executada para este lead ainda." />
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Follow-ups
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lead.followUps.map((followUp) => (
              <div key={followUp.id} className="rounded-lg border bg-background p-3">
                <p className="text-sm font-semibold">{followUp.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(followUp.dueAt).toLocaleString("pt-BR")}</p>
              </div>
            ))}
            {!lead.followUps.length && <EmptyState text="Nenhum follow-up cadastrado." />}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lead.documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3">
                <div>
                  <p className="text-sm font-semibold">{document.title}</p>
                  <p className="text-xs text-muted-foreground">{document.kind} - {document.status}</p>
                </div>
                {document.value !== null && <Badge variant="secondary">{document.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</Badge>}
              </div>
            ))}
            {!lead.documents.length && <EmptyState text="Nenhuma proposta, contrato ou orcamento gerado." />}
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Vendas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lead.sales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3">
                <div>
                  <p className="text-sm font-semibold">{sale.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                  <p className="text-xs text-muted-foreground">{sale.paymentMethod}</p>
                </div>
                <Badge variant="success">{new Date(sale.closedAt).toLocaleDateString("pt-BR")}</Badge>
              </div>
            ))}
            {!lead.sales.length && <EmptyState text="Nenhuma venda registrada para este lead." />}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function ChannelCard({
  icon,
  title,
  value,
  tone
}: {
  icon: ReactNode;
  title: string;
  value: string;
  tone: "secondary" | "success" | "warning";
}) {
  return (
    <Card className="glass-panel">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="flex min-w-0 items-center gap-3">
          {icon}
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="truncate text-sm font-semibold">{value}</p>
          </div>
        </div>
        <Badge variant={tone}>{title}</Badge>
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed bg-background/70 p-4 text-center text-sm text-muted-foreground">{text}</div>;
}
