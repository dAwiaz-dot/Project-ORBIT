"use client";

import { useMemo, useState } from "react";
import { Loader2, MapPin, Rocket, SlidersHorizontal, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { initialCategories } from "@/data/categories";
import { mockLeads } from "@/data/mock-data";
import { sulMinasCities } from "@/data/sul-minas-cities";
import { filterLeads } from "@/services/lead-filter.service";
import type { LeadSearchFilters } from "@/types/lead";
import { formatPhone, formatRating } from "@/utils/formatters";

const defaultFilters: LeadSearchFilters = {
  state: "MG",
  city: "Pouso Alegre",
  category: "Dentistas",
  maxResults: 80,
  minRating: 4,
  minReviews: 20,
  onlyWithoutWebsite: true,
  onlyWithPhone: true,
  onlyWithWhatsApp: true,
  ignoreDuplicates: true
};

export function SearchLeadsForm() {
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(mockLeads.slice(0, 3));

  const estimated = useMemo(() => filterLeads(mockLeads, filters), [filters]);

  function update<K extends keyof LeadSearchFilters>(key: K, value: LeadSearchFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setGenerated(estimated.length ? estimated : mockLeads.slice(0, 4));
    setLoading(false);
    toast.success("Busca preparada", {
      description: "A integracao Apify esta pronta. Configure o token para rodar a coleta real."
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,520px)_1fr]">
      <Card className="glass-panel">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              Parametros da busca
            </CardTitle>
            <Badge variant="info">Google Maps</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={filters.state} onValueChange={(value) => update("state", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    <SelectItem value="SP">Sao Paulo</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                    <SelectItem value="PR">Parana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Select value={filters.city} onValueChange={(value) => update("city", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {sulMinasCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={filters.category} onValueChange={(value) => update("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {initialCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Quantidade maxima</Label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={filters.maxResults}
                  onChange={(event) => update("maxResults", Number(event.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Nota minima</Label>
                <Input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={filters.minRating}
                  onChange={(event) => update("minRating", Number(event.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Min. avaliacoes</Label>
                <Input
                  type="number"
                  min={0}
                  value={filters.minReviews}
                  onChange={(event) => update("minReviews", Number(event.target.value))}
                />
              </div>
            </div>

            <div className="grid gap-3 rounded-lg border bg-background/70 p-4">
              {[
                ["onlyWithoutWebsite", "Somente empresas sem site"],
                ["onlyWithPhone", "Somente empresas com telefone"],
                ["onlyWithWhatsApp", "Somente empresas com WhatsApp"],
                ["ignoreDuplicates", "Ignorar duplicados"]
              ].map(([key, label]) => (
                <label key={key} className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                  <Checkbox
                    checked={Boolean(filters[key as keyof LeadSearchFilters])}
                    onCheckedChange={(checked) => update(key as keyof LeadSearchFilters, Boolean(checked) as never)}
                  />
                  {label}
                </label>
              ))}
            </div>

            <Button size="lg" variant="premium" className="h-14 w-full text-base" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Rocket className="mr-2 h-5 w-5" />}
              GERAR LEADS
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="glass-panel">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Previsao da coleta
              </CardTitle>
              <Badge variant="success">{generated.length} leads na amostra</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs text-muted-foreground">Potencial</p>
                <p className="mt-1 text-2xl font-bold">{filters.maxResults}</p>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs text-muted-foreground">Sem site</p>
                <p className="mt-1 text-2xl font-bold">{generated.filter((lead) => !lead.website).length}</p>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs text-muted-foreground">Com WhatsApp</p>
                <p className="mt-1 text-2xl font-bold">{generated.filter((lead) => lead.hasWhatsApp).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Leads encontrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Site</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generated.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.company}</TableCell>
                    <TableCell>{lead.city}</TableCell>
                    <TableCell>{formatPhone(lead.phone)}</TableCell>
                    <TableCell>{formatRating(lead.rating)}</TableCell>
                    <TableCell>{lead.website ? "Sim" : <Badge variant="warning">Sem site</Badge>}</TableCell>
                  </TableRow>
                ))}
                {!generated.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                      Nenhum lead gerado ainda. A primeira busca preenchera esta area.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
