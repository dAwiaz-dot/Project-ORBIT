import Image from "next/image";
import { cn } from "@/lib/utils";

export function OrbitLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-black shadow-soft ring-1 ring-white/10">
        <Image src="/icon-192.png" alt="Orbit" width={40} height={40} className="h-full w-full object-cover" priority />
      </div>
      {!compact && (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-4">Orbit Leads</p>
          <p className="truncate text-xs text-muted-foreground">Prospeccao inteligente</p>
        </div>
      )}
    </div>
  );
}
