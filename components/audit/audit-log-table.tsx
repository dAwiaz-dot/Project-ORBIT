"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: unknown;
  ipAddress: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  } | null;
};

type AuditResponse = {
  logs: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
};

export function AuditLogTable() {
  const [data, setData] = useState<AuditResponse>({ logs: [], total: 0, page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      const response = await fetch(`/api/audit-logs?page=${page}`, { signal: controller.signal });
      if (!response.ok) {
        setLoading(false);
        toast.error(response.status === 401 ? "Faca login para ver a auditoria" : "Nao foi possivel carregar o historico");
        return;
      }

      const payload = (await response.json()) as AuditResponse;
      setData(payload);
      setLoading(false);
    }

    void load();
    return () => controller.abort();
  }, [page]);

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Registros de auditoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Acao</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Quando</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Dados</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Badge variant="info">{log.action}</Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{log.user?.name ?? "Sistema"}</div>
                  <div className="text-xs text-muted-foreground">{log.user?.email ?? "sem usuario"}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{log.entity}</div>
                  <div className="max-w-[180px] truncate text-xs text-muted-foreground">{log.entityId ?? "-"}</div>
                </TableCell>
                <TableCell>{new Date(log.createdAt).toLocaleString("pt-BR")}</TableCell>
                <TableCell>{log.ipAddress ?? "-"}</TableCell>
                <TableCell className="max-w-[260px] truncate text-xs text-muted-foreground">{formatMetadata(log.metadata)}</TableCell>
              </TableRow>
            ))}
            {!data.logs.length && (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center text-muted-foreground">
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando historico
                    </span>
                  ) : (
                    "Nenhum registro de auditoria ainda."
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>{data.total} registros</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={page >= data.totalPages || loading} onClick={() => setPage((current) => current + 1)}>
              Proxima
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatMetadata(metadata: unknown) {
  if (!metadata) return "-";
  try {
    return JSON.stringify(metadata);
  } catch {
    return String(metadata);
  }
}
