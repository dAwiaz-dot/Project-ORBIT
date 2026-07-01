import { ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { LeadMetric } from "@/types/lead";
import { cn } from "@/lib/utils";

const toneClass: Record<LeadMetric["tone"], string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100 dark:bg-white/10 dark:text-white dark:ring-white/15",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-white/[0.085] dark:text-zinc-100 dark:ring-white/15",
  amber: "bg-amber-50 text-amber-700 ring-amber-100 dark:bg-white/[0.075] dark:text-zinc-200 dark:ring-white/15",
  rose: "bg-rose-50 text-rose-700 ring-rose-100 dark:bg-white/[0.065] dark:text-zinc-300 dark:ring-white/15",
  slate: "bg-slate-50 text-slate-700 ring-slate-100 dark:bg-white/[0.055] dark:text-zinc-300 dark:ring-white/15"
};

export function MetricCard({ metric }: { metric: LeadMetric }) {
  const positive = metric.trend.includes("+");

  return (
    <Card className="glass-panel overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-3xl font-bold tracking-normal">{metric.value}</p>
          </div>
          <div className={cn("grid h-9 w-9 place-items-center rounded-md ring-1", toneClass[metric.tone])}>
            {positive ? <ArrowUpRight className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          </div>
        </div>
        <p className="mt-4 text-xs font-medium text-muted-foreground">{metric.trend}</p>
      </CardContent>
    </Card>
  );
}
