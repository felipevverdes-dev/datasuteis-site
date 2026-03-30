import type { ReactNode } from "react";
import CoreNavigationBlock from "@/components/layout/CoreNavigationBlock";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FloatingSectionNav from "@/components/layout/FloatingSectionNav";
import PageIntroNavigation from "@/components/layout/PageIntroNavigation";
import type { BreadcrumbItem } from "@/lib/navigation";
import type { PageSectionNavItem } from "@/lib/page-sections";

interface PageShellProps {
  eyebrow?: string;
  title: string;
  description: string;
  navItems?: PageSectionNavItem[];
  topLabel?: string;
  breadcrumbs?: BreadcrumbItem[];
  breadcrumbAriaLabel?: string;
  backButtonLabel?: string;
  backButtonAriaLabel?: string;
  children: ReactNode;
}

export default function PageShell({
  eyebrow,
  title,
  description,
  navItems,
  topLabel = "Topo",
  breadcrumbs,
  breadcrumbAriaLabel,
  backButtonLabel,
  backButtonAriaLabel,
  children,
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" role="main" className="relative">
        <section className="hero border-b border-border bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto">
            <div className="max-w-4xl">
              {eyebrow ? (
                <span className="badge badge-primary">{eyebrow}</span>
              ) : null}
              <h1 className="hero-title mt-4 text-primary">{title}</h1>
              <p className="hero-subtitle mt-6 max-w-3xl">{description}</p>
            </div>
          </div>
        </section>

        {navItems?.length ? (
          <FloatingSectionNav items={navItems} topLabel={topLabel} />
        ) : null}

        <section className="section-md">
          <div className="container mx-auto page-stack">
            {breadcrumbs?.length &&
            breadcrumbAriaLabel &&
            backButtonLabel &&
            backButtonAriaLabel ? (
              <PageIntroNavigation
                breadcrumbs={breadcrumbs}
                breadcrumbAriaLabel={breadcrumbAriaLabel}
                backLabel={backButtonLabel}
                backAriaLabel={backButtonAriaLabel}
              />
            ) : null}
            {children}
            <CoreNavigationBlock />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
