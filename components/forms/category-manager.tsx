"use client";

import { useState } from "react";
import { Plus, Tags } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { initialCategories } from "@/data/categories";

export function CategoryManager() {
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");

  function addCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = name.trim();
    if (!normalized) return;
    if (categories.some((category) => category.toLowerCase() === normalized.toLowerCase())) {
      toast.warning("Categoria ja cadastrada");
      return;
    }
    setCategories((current) => [...current, normalized].sort((a, b) => a.localeCompare(b)));
    setName("");
    toast.success("Categoria adicionada");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[390px_1fr]">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Nova categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addCategory} className="flex flex-col gap-3">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Psicologos" />
            <Button type="submit" variant="premium">
              Adicionar categoria
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5 text-accent" />
            Categorias ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <div key={category} className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3">
                <span className="truncate text-sm font-medium">{category}</span>
                <Badge variant="secondary">Ativa</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
