import { cn } from "@/lib/utils";

export function RankList({
  items,
  labelKey,
  valueKey,
  tone = "blue"
}: {
  items: Record<string, string | number>[];
  labelKey: string;
  valueKey: string;
  tone?: "blue" | "green" | "amber";
}) {
  const max = Math.max(1, ...items.map((item) => Number(item[valueKey])));
  const barClass = {
    blue: "bg-primary",
    green: "bg-accent",
    amber: "bg-amber-500"
  }[tone];

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const value = Number(item[valueKey]);
        return (
          <div key={String(item[labelKey])} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium">{item[labelKey]}</span>
              <span className="font-semibold text-muted-foreground">{value.toLocaleString("pt-BR")}</span>
            </div>
            <div className="h-2 rounded-full bg-secondary">
              <div className={cn("h-2 rounded-full", barClass)} style={{ width: `${Math.max(8, (value / max) * 100)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
