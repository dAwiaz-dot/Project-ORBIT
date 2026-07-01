"use client";

import { useMemo, useState } from "react";
import { CalendarClock, GripVertical, MessageCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockLeads } from "@/data/mock-data";
import { leadStatusLabels } from "@/models/lead-status";
import { buildKanbanColumns, estimateDealValue } from "@/services/crm/kanban.service";
import type { Lead, LeadStatus } from "@/types/lead";

export function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const columns = useMemo(() => buildKanbanColumns(leads), [leads]);

  function moveLead(leadId: string, status: LeadStatus) {
    setLeads((current) => current.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)));
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[1180px] grid-cols-8 gap-4">
        {columns.map((column) => (
          <Card
            key={column.status}
            className="glass-panel min-h-[540px]"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => moveLead(event.dataTransfer.getData("leadId"), column.status)}
          >
            <CardHeader className="p-4">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm">{column.label}</CardTitle>
                <Badge variant="secondary">{column.leads.length}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {column.totalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </CardHeader>
            <CardContent className="space-y-3 p-3 pt-0">
              {column.leads.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData("leadId", lead.id)}
                  className="cursor-grab rounded-lg border bg-background p-3 shadow-sm active:cursor-grabbing"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold leading-5">{lead.company}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{lead.city}</p>
                    </div>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant={lead.website ? "secondary" : "warning"}>{lead.website ? "Site" : "Sem site"}</Badge>
                    {lead.hasWhatsApp && <Badge variant="success">WhatsApp</Badge>}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{estimateDealValue(lead).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                    <span>{leadStatusLabels[lead.status]}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="icon-sm" variant="outline" aria-label="Mensagem" title="Mensagem">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button size="icon-sm" variant="outline" aria-label="Follow-up" title="Follow-up">
                      <CalendarClock className="h-4 w-4" />
                    </Button>
                    <Button size="icon-sm" variant="outline" aria-label="IA" title="IA">
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!column.leads.length && (
                <div className="rounded-lg border border-dashed bg-background/60 p-3 text-center text-xs text-muted-foreground">
                  Sem leads nesta etapa
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
