"use client";

import { useMemo, useState } from "react";
import { Bot, Copy, FileText, Globe2, Instagram, MapPinned, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockLeads } from "@/data/mock-data";
import { LeadIntelligenceService } from "@/services/ai/lead-intelligence.service";

export function LeadIntelligencePanel() {
  const [leadId, setLeadId] = useState(mockLeads[0]?.id ?? "");
  const lead = mockLeads.find((item) => item.id === leadId) ?? mockLeads[0];
  const report = useMemo(() => (lead ? new LeadIntelligenceService().analyze(lead) : null), [lead]);
  const channelCards = report
    ? [
        { label: "Google Maps", score: report.googleMaps.score, description: report.googleMaps.label, icon: MapPinned },
        { label: "Site", score: report.site.score, description: report.site.label, icon: Globe2 },
        { label: "Instagram", score: report.instagram.score, description: report.instagram.label, icon: Instagram }
      ]
    : [];

  function copyMessage() {
    if (!report) return;
    navigator.clipboard.writeText(report.generatedMessage);
    toast.success("Mensagem gerada pela IA copiada");
  }

  if (!lead || !report) {
    return (
      <Card className="glass-panel">
        <CardContent className="grid min-h-[420px] place-items-center p-8 text-center">
          <div className="max-w-md">
            <Bot className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-xl font-bold">Nenhum lead para analisar</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              A base esta zerada para apresentacao. Assim que a primeira busca for executada, a IA podera gerar score, motivos e mensagem unica.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Analisar empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Select value={leadId} onValueChange={setLeadId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um lead" />
            </SelectTrigger>
            <SelectContent>
              {mockLeads.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="rounded-lg border bg-background p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score de potencial</p>
                <p className="mt-1 text-4xl font-bold">{report.potentialScore}</p>
              </div>
              <Badge variant={report.grade === "A" ? "success" : "info"}>Grade {report.grade}</Badge>
            </div>
            <div className="mt-4 flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className={`h-5 w-5 ${index < report.stars ? "fill-current" : "opacity-25"}`} />
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Probabilidade de fechar</p>
            <p className="text-2xl font-bold text-primary">{report.closeProbability}%</p>
          </div>

          <Button variant="premium" className="w-full" onClick={copyMessage}>
            <Copy className="mr-2 h-4 w-4" />
            Copiar mensagem unica
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {channelCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="glass-panel">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{card.score}</span>
                  </div>
                  <p className="mt-4 font-semibold">{card.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Motivos e oportunidades
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-semibold">Motivos</p>
              {report.reasons.map((reason) => (
                <div key={reason} className="rounded-lg border bg-background px-3 py-2 text-sm">
                  {reason}
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold">Oportunidades</p>
              {report.opportunities.map((opportunity) => (
                <div key={opportunity} className="rounded-lg border bg-background px-3 py-2 text-sm">
                  {opportunity}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Mensagem com IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap rounded-lg border bg-background p-4 text-sm leading-6">{report.generatedMessage}</div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Relatorio automatico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {report.siteAudit.report.map((item) => (
                <div key={item} className="rounded-lg border bg-background px-3 py-2">
                  {item}
                </div>
              ))}
              <div className="flex flex-wrap gap-2 pt-2">
                {report.siteAudit.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
