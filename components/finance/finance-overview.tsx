"use client";

import { useEffect, useState } from "react";
import { CreditCard, DollarSign, Loader2, Percent, Plus, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type PaymentMethod = "PIX" | "CREDIT_CARD" | "BOLETO" | "BANK_TRANSFER" | "CASH";

const paymentLabels: Record<PaymentMethod, string> = {
  PIX: "Pix",
  CREDIT_CARD: "Cartao de credito",
  BOLETO: "Boleto",
  BANK_TRANSFER: "Transferencia",
  CASH: "Dinheiro"
};

type Sale = {
  id: string;
  clientName: string;
  value: string | number;
  paymentMethod: PaymentMethod;
  commission: string | number | null;
  profit: string | number | null;
  closedAt: string;
};

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number.parseFloat(value);
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function FinanceOverview() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ clientName: "", value: "", paymentMethod: "PIX" as PaymentMethod, commissionPercent: "10" });

  async function loadSales() {
    const response = await fetch("/api/finance/sales");
    if (!response.ok) {
      setLoading(false);
      toast.error(response.status === 401 ? "Faca login para ver o financeiro" : "Nao foi possivel carregar as vendas");
      return;
    }
    const data = (await response.json()) as { sales: Sale[] };
    setSales(data.sales ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadSales();
  }, []);

  async function createSale(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.clientName.trim() || !form.value.trim()) {
      toast.error("Preencha cliente e valor");
      return;
    }

    setSaving(true);
    const response = await fetch("/api/finance/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: form.clientName.trim(),
        value: form.value,
        paymentMethod: form.paymentMethod,
        commissionPercent: form.commissionPercent
      })
    });
    setSaving(false);

    if (!response.ok) {
      toast.error("Nao foi possivel registrar a venda");
      return;
    }

    setForm({ clientName: "", value: "", paymentMethod: "PIX", commissionPercent: "10" });
    toast.success("Venda registrada");
    void loadSales();
  }

  async function removeSale(id: string) {
    const response = await fetch(`/api/finance/sales/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Nao foi possivel remover a venda");
      return;
    }
    setSales((current) => current.filter((sale) => sale.id !== id));
  }

  const revenue = sales.reduce((sum, sale) => sum + toNumber(sale.value), 0);
  const commission = sales.reduce((sum, sale) => sum + toNumber(sale.commission), 0);
  const profit = sales.reduce((sum, sale) => sum + toNumber(sale.profit), 0);
  const metrics = [
    { label: "Receita mensal", value: revenue, icon: DollarSign },
    { label: "Comissao", value: commission, icon: Percent },
    { label: "Lucro", value: profit, icon: TrendingUp },
    { label: "Ticket medio", value: sales.length ? revenue / sales.length : 0, icon: CreditCard }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="glass-panel">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-3 text-3xl font-bold">{formatCurrency(metric.value)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Registrar venda</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createSale} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2 lg:col-span-2">
              <Label>Cliente</Label>
              <Input
                value={form.clientName}
                onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))}
                placeholder="Nome do cliente"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
                placeholder="0,00"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label>Pagamento</Label>
              <Select
                value={form.paymentMethod}
                onValueChange={(value) => setForm((current) => ({ ...current, paymentMethod: value as PaymentMethod }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(paymentLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Comissao (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.commissionPercent}
                onChange={(event) => setForm((current) => ({ ...current, commissionPercent: event.target.value }))}
                disabled={saving}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-5">
              <Button type="submit" variant="premium" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Registrar venda
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Vendas cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Comissao</TableHead>
                <TableHead>Lucro</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.clientName}</TableCell>
                  <TableCell>{formatCurrency(toNumber(sale.value))}</TableCell>
                  <TableCell>{paymentLabels[sale.paymentMethod]}</TableCell>
                  <TableCell>{formatCurrency(toNumber(sale.commission))}</TableCell>
                  <TableCell>{formatCurrency(toNumber(sale.profit))}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon-sm" onClick={() => removeSale(sale.id)} title="Remover venda" aria-label="Remover venda">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && !sales.length && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Nenhuma venda cadastrada ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
