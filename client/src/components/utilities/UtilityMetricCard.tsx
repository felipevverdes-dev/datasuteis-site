import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface UtilityMetricCardProps {
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
  tone?: "default" | "primary" | "success" | "warning" | "danger";
  compact?: boolean;
  className?: string;
}

const TONE_CLASSNAME: Record<
  NonNullable<UtilityMetricCardProps["tone"]>,
  string
> = {
  default: "bg-card",
  primary: "bg-primary/10 border-primary/15",
  success: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900",
  warning: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900",
  danger: "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900",
};

export default function UtilityMetricCard({
  label,
  value,
  helper,
  icon,
  tone = "default",
  compact = false,
  className,
}: UtilityMetricCardProps) {
  return (
    <article
      className={cn(
        "utility-copy-safe border shadow-sm",
        compact ? "rounded-2xl p-3" : "rounded-3xl p-5",
        TONE_CLASSNAME[tone],
        className
      )}
    >
      <div className={cn("flex min-w-0 items-start justify-between", compact ? "gap-3" : "gap-4")}>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "min-w-0 break-words font-bold tracking-tight [overflow-wrap:anywhere]",
              compact ? "mt-1.5 text-base sm:text-lg" : "mt-3 text-2xl sm:text-3xl"
            )}
          >
            {value}
          </p>
        </div>
        {icon ? (
          <div
            className={cn(
              "inline-flex shrink-0 items-center justify-center bg-background/70 text-primary",
              compact ? "h-8 w-8 rounded-xl" : "h-11 w-11 rounded-2xl"
            )}
          >
            {icon}
          </div>
        ) : null}
      </div>
      {helper ? (
        <p
          className={cn(
            "break-words text-sm leading-5 text-muted-foreground [overflow-wrap:anywhere]",
            compact ? "mt-1.5" : "mt-3"
          )}
        >
          {helper}
        </p>
      ) : null}
    </article>
  );
}
