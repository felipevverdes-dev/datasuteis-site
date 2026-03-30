import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PageIntroNavigation from "@/components/layout/PageIntroNavigation";
import { useI18n } from "@/contexts/LanguageContext";
import { buildBreadcrumbSchema, getNavigationLabels } from "@/lib/navigation";
import { usePageSeo } from "@/lib/seo";

export default function NotFound() {
  const { language, t } = useI18n();
  const navigationLabels = getNavigationLabels(language);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: "404" },
  ];
  usePageSeo({
    title: t("pages.notFound.seoTitle"),
    description: t("pages.notFound.seoDescription"),
    path: "/404/",
    robots: "noindex, nofollow",
    schema: buildBreadcrumbSchema([
      { label: navigationLabels.home, href: "/" },
      { label: "404", href: "/404/" },
    ]),
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main
        id="main-content"
        role="main"
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
          <h1 className="mb-4 text-6xl font-bold text-primary md:text-8xl">404</h1>
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
      </main>

      <Footer />
    </div>
  );
}
