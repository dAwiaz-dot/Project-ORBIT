"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MessageCircle, Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Campaign = {
  id: string;
  name: string;
  category: string | null;
  city: string | null;
  status: string;
  totalLeads: number;
  sentCount: number;
  replyCount: number;
  createdAt: string;
};

export function CampaignsCenter() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", city: "" });

  async function loadCampaigns() {
    const response = await fetch("/api/campaigns");
    if (!response.ok) {
      setLoading(false);
      toast.error(response.status === 401 ? "Faca login para ver as campanhas" : "Nao foi possivel carregar campanhas");
      return;
    }
    const data = (await response.json()) as { campaigns: Campaign[] };
    setCampaigns(data.campaigns ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadCampaigns();
  }, []);

  async function createCampaign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("De um nome para a campanha");
      return;
    }

    setCreating(true);
    const response = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        category: form.category.trim() || undefined,
        city: form.city.trim() || undefined
      })
    });
    setCreating(false);

    if (!response.ok) {
      toast.error("Nao foi possivel criar a campanha");
      return;
    }

    setForm({ name: "", category: "", city: "" });
    toast.success("Campanha criada");
    void loadCampaigns();
  }

  async function markSent(campaign: Campaign) {
    const response = await fetch(`/api/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentCount: campaign.sentCount + 1 })
    });
    if (!response.ok) {
      toast.error("Nao foi possivel atualizar a campanha");
      return;
    }
    void loadCampaigns();
  }

  async function markReplied(campaign: Campaign) {
    const response = await fetch(`/api/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ replyCount: campaign.replyCount + 1 })
    });
    if (!response.ok) {
      toast.error("Nao foi possivel atualizar a campanha");
      return;
    }
    void loadCampaigns();
  }

  async function removeCampaign(id: string) {
    const response = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Nao foi possivel remover a campanha");
      return;
    }
    setCampaigns((current) => current.filter((campaign) => campaign.id !== id));
  }

  return (
    <div className="space-y-6">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Nova campanha</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createCampaign} className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Ex.: Dentistas Pouso Alegre"
                disabled={creating}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria (opcional)</Label>
              <Input
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                placeholder="Ex.: Dentistas"
                disabled={creating}
              />
            </div>
            <div className="space-y-2">
              <Label>Cidade (opcional)</Label>
              <Input
                value={form.city}
                onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                placeholder="Ex.: Pouso Alegre"
                disabled={creating}
              />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit" variant="premium" disabled={creating}>
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Criar campanha
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                A campanha calcula quantos leads da base ja se encaixam na categoria/cidade informada no momento da criacao.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {!loading && !campaigns.length && (
        <Card className="glass-panel">
          <CardContent className="grid min-h-[220px] place-items-center p-8 text-center">
            <div className="max-w-md">
              <Target className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 text-xl font-bold">Nenhuma campanha criada</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Crie a primeira campanha acima a partir de uma categoria e cidade de leads.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {campaigns.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="glass-panel">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{campaign.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[campaign.category, campaign.city].filter(Boolean).join(" - ") || "Todos os leads"}
                    </p>
                  </div>
                  <Badge variant={campaign.status === "ATIVA" ? "success" : "info"}>{campaign.status}</Badge>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md border bg-secondary/30 p-2">
                    <p className="text-lg font-bold">{campaign.totalLeads}</p>
                    <p className="text-[11px] text-muted-foreground">Leads</p>
                  </div>
                  <div className="rounded-md border bg-secondary/30 p-2">
                    <p className="text-lg font-bold">{campaign.sentCount}</p>
                    <p className="text-[11px] text-muted-foreground">Enviados</p>
                  </div>
                  <div className="rounded-md border bg-secondary/30 p-2">
                    <p className="text-lg font-bold">{campaign.replyCount}</p>
                    <p className="text-[11px] text-muted-foreground">Responderam</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => markSent(campaign)}>
                      <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                      +1 enviado
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => markReplied(campaign)}>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      +1 respondeu
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => removeCampaign(campaign.id)} title="Remover campanha" aria-label="Remover campanha">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
