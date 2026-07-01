"use client";

import { useMemo, useState } from "react";
import { MapPinned, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sulMinasCities } from "@/data/sul-minas-cities";

const states = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export function CityManager() {
  const [cities, setCities] = useState(sulMinasCities.map((name) => ({ name, state: "MG", region: "Sul de Minas" })));
  const [name, setName] = useState("");
  const [state, setState] = useState("MG");

  const grouped = useMemo(() => {
    return cities.reduce<Record<string, typeof cities>>((acc, city) => {
      acc[city.state] = acc[city.state] ?? [];
      acc[city.state].push(city);
      return acc;
    }, {});
  }, [cities]);

  function addCity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = name.trim();
    if (!normalized) return;
    if (cities.some((city) => city.name.toLowerCase() === normalized.toLowerCase() && city.state === state)) {
      toast.warning("Cidade ja cadastrada");
      return;
    }
    setCities((current) => [...current, { name: normalized, state, region: state === "MG" ? "Sul de Minas" : "Brasil" }]);
    setName("");
    toast.success("Cidade adicionada");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[390px_1fr]">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Nova cidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addCity} className="space-y-3">
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Campinas" />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      {uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" variant="premium" className="w-full">
              Adicionar cidade
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinned className="h-5 w-5 text-accent" />
            Cidades cadastradas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {Object.entries(grouped).map(([uf, items]) => (
            <div key={uf} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="info">{uf}</Badge>
                <span className="text-sm text-muted-foreground">{items.length} cidades</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((city) => (
                  <div key={`${city.name}-${city.state}`} className="flex items-center justify-between rounded-lg border bg-background px-3 py-2">
                    <span className="truncate text-sm font-medium">{city.name}</span>
                    <span className="text-xs text-muted-foreground">{city.region}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
