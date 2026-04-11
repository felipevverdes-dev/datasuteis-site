import type { ReactNode } from "react";
import PageIntroNavigation from "@/components/layout/PageIntroNavigation";
import type { BreadcrumbItem } from "@/lib/navigation";

interface GamePageHeroProps {
  breadcrumbs: BreadcrumbItem[];
  breadcrumbAriaLabel: string;
  backLabel: string;
  backAriaLabel: string;
  title: string;
  mobileSummary: ReactNode;
}

export default function GamePageHero({
  breadcrumbs,
  breadcrumbAriaLabel,
  backLabel,
  backAriaLabel,
  title,
  mobileSummary,
}: GamePageHeroProps) {
  return (
    <section className="hero-game border-b border-border bg-gradient-to-br from-primary/10 via-background to-background">
      <div className="container mx-auto">
        <div className="max-w-3xl">
          <PageIntroNavigation
            breadcrumbs={breadcrumbs}
            breadcrumbAriaLabel={breadcrumbAriaLabel}
            backLabel={backLabel}
            backAriaLabel={backAriaLabel}
          />
          <h1 className="mt-2 text-3xl font-bold text-primary md:text-[2.2rem] lg:text-[1.875rem] xl:text-[2.05rem]">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground lg:hidden">
            {mobileSummary}
          </p>
        </div>
      </div>
    </section>
  );
}
