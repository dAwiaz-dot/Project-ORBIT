"use client";

import Link from "next/link";
import { Download, FileBarChart, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const reports = [
  {
    title: "Relatorio executivo",
    description: "Resumo de leads, conversao, cidades, categorias e receita.",
    icon: FileBarChart,
    action: "Gerar PDF"
  },
  {
    title: "Base comercial",
    description: "Exportacao Excel com abas por categoria e colunas completas.",
    icon: FileSpreadsheet,
    action: "Baixar Excel",
    href: "/api/leads/export?format=xlsx"
  },
  {
    title: "Historico operacional",
    description: "CSV para auditoria de buscas, filtros e movimentacoes.",
    icon: FileText,
    action: "Baixar CSV",
    href: "/api/leads/export?format=csv"
  }
];

export function ReportsCenter() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {reports.map((report) => {
        const Icon = report.icon;
        return (
          <Card key={report.title} className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                {report.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-5 text-sm leading-6 text-muted-foreground">{report.description}</p>
              {report.href ? (
                <Button asChild variant="premium">
                  <Link href={report.href}>
                    <Download className="mr-2 h-4 w-4" />
                    {report.action}
                  </Link>
                </Button>
              ) : (
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  {report.action}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
