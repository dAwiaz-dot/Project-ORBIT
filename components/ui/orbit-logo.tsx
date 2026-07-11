import { cn } from "@/lib/utils";

export function OrbitLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-[linear-gradient(135deg,#7B61FF_0%,#5B8CFF_50%,#00E5FF_100%)] shadow-soft ring-1 ring-white/10">
        <span className="font-display text-lg font-bold text-white">R</span>
      </div>
      {!compact && (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-4">
            Ryze<span className="text-[#00E5FF]">.</span>CRM
          </p>
          <p className="truncate text-xs text-muted-foreground">Prospeccao inteligente</p>
        </div>
      )}
    </div>
  );
}
