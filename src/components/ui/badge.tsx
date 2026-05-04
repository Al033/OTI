import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-muted-foreground)]",
        accent:
          "border-[var(--color-accent-subtle)] bg-[color-mix(in_oklch,var(--color-accent)_15%,transparent)] text-[var(--color-accent)]",
        positive:
          "border-[var(--color-positive-subtle)] bg-[color-mix(in_oklch,var(--color-positive)_15%,transparent)] text-[var(--color-positive)]",
        negative:
          "border-[var(--color-negative-subtle)] bg-[color-mix(in_oklch,var(--color-negative)_15%,transparent)] text-[var(--color-negative)]",
        warning:
          "border-[var(--color-warning-subtle)] bg-[color-mix(in_oklch,var(--color-warning)_15%,transparent)] text-[var(--color-warning)]",
        outline:
          "border-[var(--color-border)] bg-transparent text-[var(--color-muted-foreground)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
