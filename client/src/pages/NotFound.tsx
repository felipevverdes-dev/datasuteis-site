import { useLocation } from "wouter";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CtaFinalBlock from "@/components/layout/CtaFinalBlock";
import PageIntroNavigation from "@/components/layout/PageIntroNavigation";
import { useI18n } from "@/contexts/LanguageContext";
import { buildBreadcrumbSchema, getNavigationLabels } from "@/lib/navigation";
import { usePageSeo } from "@/lib/seo";
import { normalizeSitePath } from "@/lib/site";

interface NotFoundProps {
  seoPath?: string;
  params?: Record<string, string | undefined>;
}

export default function NotFound({ seoPath }: NotFoundProps) {
  const [location] = useLocation();
  const { language, t } = useI18n();
  const navigationLabels = getNavigationLabels(language);
  const effectiveSeoPath = normalizeSitePath(seoPath ?? location);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: "404" },
  ];

  usePageSeo({
    title: t("pages.notFound.seoTitle"),
    description: t("pages.notFound.seoDescription"),
    path: effectiveSeoPath,
    robots: "noindex, nofollow",
    schema: buildBreadcrumbSchema(
      [
        { label: navigationLabels.home, href: "/" },
        ...(effectiveSeoPath === "/404/"
          ? [{ label: "404", href: "/404/" }]
          : [{ label: "404" }]),
      ],
      effectiveSeoPath
    ),
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main
        id="main-content"
        className="flex flex-1 items-center justify-center"
      >
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="mb-8 text-left">
            <PageIntroNavigation
              breadcrumbs={breadcrumbs}
              breadcrumbAriaLabel={navigationLabels.breadcrumb}
              backLabel={navigationLabels.back}
              backAriaLabel={navigationLabels.backAria}
            />
          </div>
          <h1 className="mb-4 text-6xl font-bold text-primary md:text-8xl">
            404
          </h1>
          <h2 className="mb-4 text-2xl font-bold md:text-4xl">
            {t("pages.notFound.title")}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            {t("pages.notFound.description")}
          </p>
          <a href="/" className="btn-primary inline-block">
            {t("pages.notFound.backHome")}
          </a>
        </div>

        <div className="container mx-auto px-4 pb-12">
          <CtaFinalBlock
            language={language}
            title={
              language === "en"
                ? "Find what you need"
                : language === "es"
                  ? "Encuentre lo que necesita"
                  : "Encontre o que você precisa"
            }
            buttonLabel={
              language === "en"
                ? "Go to calculator"
                : language === "es"
                  ? "Ir a la calculadora"
                  : "Ir para a calculadora"
            }
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
