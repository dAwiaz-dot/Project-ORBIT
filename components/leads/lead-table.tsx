"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, ExternalLink, FileText, MessageCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockLeads } from "@/data/mock-data";
import { initialCategories } from "@/data/categories";
import { useDebounce } from "@/hooks/use-debounce";
import { leadStatusLabels, leadStatusTone } from "@/models/lead-status";
import { buildWhatsAppUrl } from "@/services/whatsapp.service";
import { formatPhone, formatRating } from "@/utils/formatters";

export function LeadTable() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("rating-desc");
  const debouncedQuery = useDebounce(query, 200);

  const leads = useMemo(() => {
    const search = debouncedQuery.trim().toLowerCase();
    const filtered = mockLeads.filter((lead) => {
      const matchesQuery =
        !search ||
        [lead.company, lead.city, lead.category, lead.phone, lead.instagram].some((field) =>
          String(field ?? "").toLowerCase().includes(search)
        );
      const matchesCategory = category === "all" || lead.category === category;
      return matchesQuery && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "rating-desc") return Number(b.rating ?? 0) - Number(a.rating ?? 0);
      if (sort === "reviews-desc") return Number(b.reviewCount ?? 0) - Number(a.reviewCount ?? 0);
      if (sort === "company-asc") return a.company.localeCompare(b.company);
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
  }, [category, debouncedQuery, sort]);

  async function downloadProposal(leadId: string) {
    const response = await fetch("/api/documents/proposal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId })
    });

    if (!response.ok) {
      toast.error("Nao foi possivel gerar a proposta");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "proposta-orbit.pdf";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Proposta gerada");
  }

  return (
    <Card className="glass-panel">
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle>Leads qualificados</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="min-w-[260px] pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pesquisar em tempo real"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[210px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {initialCategories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating-desc">Maior nota</SelectItem>
                <SelectItem value="reviews-desc">Mais avaliacoes</SelectItem>
                <SelectItem value="company-asc">Empresa A-Z</SelectItem>
                <SelectItem value="recent-desc">Mais recentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Instagram</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Nota</TableHead>
              <TableHead>Avaliacoes</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div className="font-semibold">{lead.company}</div>
                  <div className="text-xs text-muted-foreground">{lead.address}</div>
                </TableCell>
                <TableCell>{lead.category}</TableCell>
                <TableCell>{lead.city}</TableCell>
                <TableCell>{formatPhone(lead.phone)}</TableCell>
                <TableCell>{lead.instagram ?? "-"}</TableCell>
                <TableCell>
                  {lead.website ? (
                    <a className="inline-flex items-center gap-1 text-primary hover:underline" href={lead.website} target="_blank">
                      Site
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <Badge variant="warning">Sem site</Badge>
                  )}
                </TableCell>
                <TableCell>{formatRating(lead.rating)}</TableCell>
                <TableCell>{lead.reviewCount ?? "-"}</TableCell>
                <TableCell>
                  {lead.hasWhatsApp ? <Badge variant="success">Sim</Badge> : <Badge variant="outline">Nao</Badge>}
                </TableCell>
                <TableCell>
                  <Badge variant={leadStatusTone[lead.status]}>{leadStatusLabels[lead.status]}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => downloadProposal(lead.id)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Proposta
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={buildWhatsAppUrl(lead.phone, "Ola {empresa}, tudo bem?".replace("{empresa}", lead.company))}
                        target="_blank"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Abrir
                      </a>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!leads.length && (
              <TableRow>
                <TableCell colSpan={11} className="h-36 text-center text-muted-foreground">
                  Nenhum lead cadastrado. Use Buscar Leads para iniciar a primeira prospeccao.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Mostrando {leads.length} de {mockLeads.length} leads</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="outline" size="sm">
              Proxima
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
