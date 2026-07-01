"use client";

import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockLeads } from "@/data/mock-data";
import { leadStatusLabels } from "@/models/lead-status";

const statusColor = {
  NEW: "bg-blue-500 dark:bg-white dark:text-black",
  SENT: "bg-slate-500 dark:bg-zinc-500 dark:text-white",
  REPLIED: "bg-emerald-500 dark:bg-zinc-200 dark:text-black",
  INTERESTED: "bg-amber-500 dark:bg-zinc-300 dark:text-black",
  MEETING: "bg-cyan-500 dark:bg-zinc-100 dark:text-black",
  PROPOSAL: "bg-violet-500 dark:bg-zinc-400 dark:text-black",
  CLIENT: "bg-emerald-700 dark:bg-white dark:text-black",
  LOST: "bg-rose-500 dark:bg-zinc-700 dark:text-white"
};

export function LeadsMap() {
  const [query, setQuery] = useState("");
  const leads = useMemo(() => {
    const q = query.toLowerCase();
    return mockLeads.filter((lead) => !q || [lead.company, lead.city, lead.category].some((field) => field.toLowerCase().includes(q)));
  }, [query]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card className="glass-panel overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Mapa comercial
            </CardTitle>
            <div className="relative w-full md:w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar no mapa" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-[620px] overflow-hidden rounded-lg border bg-[linear-gradient(135deg,#F8FAFC,#EEF4FF_45%,#ECFDF5)] dark:bg-[linear-gradient(135deg,#050505,#111111_45%,#020202)]">
            <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] [background-size:52px_52px]" />
            {leads.map((lead, index) => (
              <div
                key={lead.id}
                className="absolute"
                style={{
                  left: `${16 + ((index * 17) % 70)}%`,
                  top: `${18 + ((index * 23) % 62)}%`
                }}
              >
                <div className={`grid h-9 w-9 place-items-center rounded-full text-white shadow-soft ring-1 ring-black/5 dark:ring-white/30 ${statusColor[lead.status]}`}>
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="mt-2 w-[180px] rounded-lg border bg-card/95 p-3 text-xs shadow-panel backdrop-blur">
                  <p className="font-semibold">{lead.company}</p>
                  <p className="mt-1 text-muted-foreground">{lead.city}</p>
                  <Badge className="mt-2" variant="secondary">
                    {leadStatusLabels[lead.status]}
                  </Badge>
                </div>
              </div>
            ))}
            {!leads.length && (
              <div className="absolute inset-0 grid place-items-center p-6 text-center">
                <p className="max-w-sm text-sm text-muted-foreground">Nenhum marcador ainda. Os leads aparecerao aqui depois da primeira busca.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Leads no mapa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="rounded-lg border bg-background p-3">
              <p className="text-sm font-semibold">{lead.company}</p>
              <p className="mt-1 text-xs text-muted-foreground">{lead.city} - {lead.category}</p>
            </div>
          ))}
          {!leads.length && <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">Base limpa para apresentacao.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
