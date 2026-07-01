"use client";

import { useMemo, useState } from "react";
import { Copy, MessageSquareText, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { applyMessageVariables } from "@/services/whatsapp.service";

const defaultTemplate = `Ola {empresa}, tudo bem?

Vi o trabalho de voces em {cidade} e gostei bastante.

Sou da Orbit e percebi algumas oportunidades para atrair mais clientes em {categoria} usando trafego, posicionamento local e WhatsApp.

Posso te mandar uma analise rapida sem compromisso?`;

export function MessageEditor() {
  const [name, setName] = useState("Abordagem consultiva");
  const [template, setTemplate] = useState(defaultTemplate);
  const preview = useMemo(
    () => applyMessageVariables(template, { company: "Clinica Vila Sorriso", city: "Pouso Alegre", category: "Dentistas" }),
    [template]
  );

  function copyPreview() {
    navigator.clipboard.writeText(preview);
    toast.success("Mensagem copiada");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-primary" />
            Editor de mensagem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome da mensagem</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Conteudo</Label>
            <Textarea className="min-h-[320px]" value={template} onChange={(event) => setTemplate(event.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">{"{empresa}"}</Badge>
            <Badge variant="success">{"{cidade}"}</Badge>
            <Badge variant="warning">{"{categoria}"}</Badge>
          </div>
          <Button variant="premium">
            <WandSparkles className="mr-2 h-4 w-4" />
            Salvar mensagem
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Previa personalizada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-background p-4 text-sm leading-6 whitespace-pre-wrap">{preview}</div>
          <Button onClick={copyPreview} variant="outline" className="mt-4 w-full">
            <Copy className="mr-2 h-4 w-4" />
            Copiar previa
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
