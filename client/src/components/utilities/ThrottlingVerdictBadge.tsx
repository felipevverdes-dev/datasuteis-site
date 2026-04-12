import type { ThrottlingVerdict } from "@shared/connection-tools";
import { cn } from "@/lib/utils";
import { getVerdictLabel } from "@/lib/network-diagnostics";

interface ThrottlingVerdictBadgeProps {
  verdict: ThrottlingVerdict;
  className?: string;
}

const VERDICT_CLASSNAME: Record<ThrottlingVerdict, string> = {
  no_relevant_evidence:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
  moderate_indication:
    "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  strong_indication:
    "bg-rose-100 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
  inconclusive:
    "bg-secondary text-foreground",
};

export default function ThrottlingVerdictBadge({
  verdict,
  className,
}: ThrottlingVerdictBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-9 items-center rounded-full px-4 py-2 text-sm font-semibold",
        VERDICT_CLASSNAME[verdict],
        className
      )}
    >
      {getVerdictLabel(verdict)}
    </span>
  );
}
