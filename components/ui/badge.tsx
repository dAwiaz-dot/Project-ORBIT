import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-white/15 dark:bg-white/[0.09] dark:text-zinc-100",
        warning: "border-amber-200 bg-amber-50 text-amber-700 dark:border-white/15 dark:bg-white/[0.08] dark:text-zinc-200",
        danger: "border-rose-200 bg-rose-50 text-rose-700 dark:border-white/15 dark:bg-white/[0.07] dark:text-zinc-300",
        info: "border-blue-200 bg-blue-50 text-blue-700 dark:border-white/15 dark:bg-white/[0.08] dark:text-zinc-200"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
