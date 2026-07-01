"use client";

import { CalendarClock, PlayCircle, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { defaultAutomationRules, defaultFollowUpCadence } from "@/services/automation/automation.service";

export function AutomationCenter() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            Regras de automacao
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {defaultAutomationRules.map((rule) => (
            <div key={rule.id} className="flex flex-col gap-3 rounded-lg border bg-background p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{rule.name}</p>
                  <Badge variant={rule.active ? "success" : "secondary"}>{rule.active ? "Ativa" : "Pausada"}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Quando: {rule.trigger} {"->"} {rule.action}
                </p>
              </div>
              <Switch checked={rule.active} aria-label={`Ativar ${rule.name}`} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-accent" />
            Follow-up automatico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {defaultFollowUpCadence.map((step) => (
            <div key={step.label} className="flex items-center justify-between rounded-lg border bg-background p-3">
              <div>
                <p className="text-sm font-semibold">{step.label}</p>
                <p className="text-xs text-muted-foreground">Depois de {step.daysAfterContact} dias</p>
              </div>
              <PlayCircle className="h-5 w-5 text-primary" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
