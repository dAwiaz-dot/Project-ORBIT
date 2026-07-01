"use client";

import { CreditCard, DollarSign, Percent, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const sales: Array<{ client: string; value: number; method: string; commission: number; profit: number }> = [];

export function FinanceOverview() {
  const revenue = sales.reduce((sum, sale) => sum + sale.value, 0);
  const commission = sales.reduce((sum, sale) => sum + sale.commission, 0);
  const profit = sales.reduce((sum, sale) => sum + sale.profit, 0);
  const metrics = [
    { label: "Receita mensal", value: revenue, icon: DollarSign },
    { label: "Comissao", value: commission, icon: Percent },
    { label: "Lucro", value: profit, icon: TrendingUp },
    { label: "Ticket medio", value: sales.length ? Math.round(revenue / sales.length) : 0, icon: CreditCard }
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
                <p className="mt-3 text-3xl font-bold">
                  {metric.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.client}>
                  <TableCell className="font-medium">{sale.client}</TableCell>
                  <TableCell>{sale.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                  <TableCell>{sale.method}</TableCell>
                  <TableCell>{sale.commission.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                  <TableCell>{sale.profit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                </TableRow>
              ))}
              {!sales.length && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Nenhuma venda cadastrada. Financeiro zerado para apresentacao.
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
