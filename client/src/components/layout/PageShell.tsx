import type { ReactNode } from "react";
import AdSlot from "@/components/AdSlot";
import CoreNavigationBlock from "@/components/layout/CoreNavigationBlock";
import CtaFinalBlock from "@/components/layout/CtaFinalBlock";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FloatingSectionNav from "@/components/layout/FloatingSectionNav";
import PageIntroNavigation from "@/components/layout/PageIntroNavigation";
import type { BreadcrumbItem } from "@/lib/navigation";
import type { PageSectionNavItem } from "@/lib/page-sections";
import type { SupportedLanguage } from "@/lib/site";

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
  /** Language for CTA final block — required for i18n CTA text */
  language?: SupportedLanguage;
  /** Custom CTA final title override */
  ctaTitle?: string;
  /** Custom CTA final button label override */
  ctaButtonLabel?: string;
  /** Custom CTA final href override (defaults to /calcular/) */
  ctaHref?: string;
  /** Set to true to hide CTA final block */
  hideCtaFinal?: boolean;
  /** Show an AdSlot before the CTA final */
  showBottomAd?: boolean;
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
  language = "pt",
  ctaTitle,
  ctaButtonLabel,
  ctaHref,
  hideCtaFinal = false,
  showBottomAd = true,
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="relative">
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

        <div className="section-md">
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

            {showBottomAd && (
              <AdSlot
                id="ads-page-bottom-shell"
                className="my-4"
                minHeight={100}
                format="auto"
              />
            )}

            {!hideCtaFinal && (
              <CtaFinalBlock
                language={language}
                title={ctaTitle}
                buttonLabel={ctaButtonLabel}
                href={ctaHref}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
