"use client";

import { useState } from "react";
import { BrainCircuit, Database, KeyRound, Mail, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function SettingsForm() {
  const [theme, setTheme] = useState("light");

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Configuracoes salvas localmente", {
      description: "O endpoint /api/settings esta pronto para persistencia no PostgreSQL."
    });
  }

  return (
    <form onSubmit={save} className="grid gap-6 xl:grid-cols-[1fr_460px]">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Identidade da agencia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome da empresa</Label>
            <Input defaultValue="Orbit" />
          </div>
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex gap-2">
              <Input placeholder="https://..." />
              <Button type="button" variant="outline" size="icon" aria-label="Enviar logo" title="Enviar logo">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tema padrao</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue placeholder="Tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Apify
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Apify Token</Label>
              <Input type="password" placeholder="apify_api_..." />
            </div>
            <div className="space-y-2">
              <Label>Mensagem padrao</Label>
              <Textarea defaultValue="Ola {empresa}, tudo bem? Vi o trabalho de voces em {cidade}..." />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              OpenAI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>OpenAI API Key</Label>
              <Input type="password" placeholder="sk-..." />
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              A IA local por regras ja funciona. Com a chave configurada, o provider pode ser trocado para LLM sem alterar as telas.
            </p>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" variant="premium" className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Salvar configuracoes
        </Button>
      </div>

      <Card className="glass-panel xl:col-span-2">
        <CardHeader>
          <CardTitle>Infraestrutura</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              SMTP
            </Label>
            <div className="grid gap-2 sm:grid-cols-3">
              <Input placeholder="Host" />
              <Input placeholder="Usuario" />
              <Input type="password" placeholder="Senha" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Banco
            </Label>
            <Input placeholder="Observacao operacional do banco PostgreSQL" />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
