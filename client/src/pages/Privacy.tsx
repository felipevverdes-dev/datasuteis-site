import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CoreNavigationBlock from "@/components/layout/CoreNavigationBlock";
import PageIntroNavigation from "@/components/layout/PageIntroNavigation";
import { useI18n } from "@/contexts/LanguageContext";
import type { PrivacySection } from "@/lib/i18n";
import { buildBreadcrumbSchema, getNavigationLabels } from "@/lib/navigation";
import { usePageSeo } from "@/lib/seo";

export default function Privacy() {
  const { language, t, tm } = useI18n();
  const navigationLabels = getNavigationLabels(language);
  const sections = tm<PrivacySection[]>("pages.privacy.sections");
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.about, href: "/sobre/" },
    { label: navigationLabels.privacy },
  ];
  usePageSeo({
    title: t("pages.privacy.seoTitle"),
    description: t("pages.privacy.seoDescription"),
    path: "/privacidade/",
    keywords: ["privacidade", "cookies", "analytics", "adsense"],
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Política de Privacidade",
        url: "https://datasuteis.com.br/privacidade/",
      },
      buildBreadcrumbSchema([
        { label: navigationLabels.home, href: "/" },
        { label: navigationLabels.about, href: "/sobre/" },
        { label: navigationLabels.privacy, href: "/privacidade/" },
      ]),
    ],
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main id="main-content" role="main" className="flex-1">
        {/* Hero */}
        <section className="hero bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto px-4">
            <PageIntroNavigation
              breadcrumbs={breadcrumbs}
              breadcrumbAriaLabel={navigationLabels.breadcrumb}
              backLabel={navigationLabels.back}
              backAriaLabel={navigationLabels.backAria}
            />
            <h1 className="hero-title text-primary mb-4 text-center">
              {t("components.footer.privacy")}
            </h1>
            <p className="hero-subtitle text-center max-w-2xl mx-auto">
              {t("pages.privacy.heroSubtitle")}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="section-md">
          <div className="container mx-auto px-4 max-w-5xl page-stack">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="card-base p-8 space-y-6">
                {sections.map(section => (
                  <div key={section.title}>
                    <h2 className="mb-3 text-2xl font-bold">{section.title}</h2>
                    {section.paragraphs?.map(paragraph => (
                      <p key={paragraph} className="mt-2 text-muted-foreground">
                        {paragraph.startsWith("Email:") ? (
                          <>
                            Email:{" "}
                            <a
                              href="mailto:privacidade@datasuteis.com.br"
                              className="text-primary hover:underline"
                            >
                              privacidade@datasuteis.com.br
                            </a>
                          </>
                        ) : (
                          paragraph
                        )}
                      </p>
                    ))}
                    {section.bullets?.length ? (
                      <ul className="mt-2 list-inside list-disc space-y-2 text-muted-foreground">
                        {section.bullets.map(bullet => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {t("pages.privacy.lastUpdated")}
                  </p>
                </div>
              </div>
            </div>

            <CoreNavigationBlock />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
