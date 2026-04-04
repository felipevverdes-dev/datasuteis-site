import { Link } from "wouter";

type ActiveWorldClockPage = "world" | "markets";

interface WorldClockToolSwitcherProps {
  activePage: ActiveWorldClockPage;
  worldLabel: string;
  marketsLabel: string;
}

export default function WorldClockToolSwitcher({
  activePage,
  worldLabel,
  marketsLabel,
}: WorldClockToolSwitcherProps) {
  return (
    <nav
      aria-label={worldLabel === marketsLabel ? worldLabel : `${worldLabel} / ${marketsLabel}`}
      className="flex flex-wrap gap-2"
    >
      <Link
        href="/utilitarios/horario-mundial/"
        className={`inline-flex min-h-9 items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
          activePage === "world"
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
        aria-current={activePage === "world" ? "page" : undefined}
      >
        {worldLabel}
      </Link>
      <Link
        href="/utilitarios/horario-mercados/"
        className={`inline-flex min-h-9 items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
          activePage === "markets"
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
        aria-current={activePage === "markets" ? "page" : undefined}
      >
        {marketsLabel}
      </Link>
    </nav>
  );
}
