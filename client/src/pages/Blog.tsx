import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import AdSlot from "@/components/AdSlot";
import CoreNavigationBlock from "@/components/layout/CoreNavigationBlock";
import CtaFinalBlock from "@/components/layout/CtaFinalBlock";
import FloatingSectionNav from "@/components/layout/FloatingSectionNav";
import PageIntroNavigation from "@/components/layout/PageIntroNavigation";
import { useI18n } from "@/contexts/LanguageContext";
import { getLocalizedBlogPosts } from "@/lib/blog";
import { buildBreadcrumbSchema, getNavigationLabels } from "@/lib/navigation";
import { getBackToTopLabel } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";

export default function Blog() {
  const { language, t, formatDate } = useI18n();
  const navigationLabels = getNavigationLabels(language);
  const posts = getLocalizedBlogPosts(language);
  const topLabel = getBackToTopLabel(language);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.blog },
  ];
  const navItems = [
    {
      id: "artigos",
      label:
        language === "en"
          ? "Articles"
          : language === "es"
            ? "Articulos"
            : "Artigos",
    },
    {
      id: "apoio",
      label:
        language === "en"
          ? "Support"
          : language === "es"
            ? "Apoyo"
            : "Apoio",
    },
  ];

  usePageSeo({
    title: t("pages.blog.seoTitle"),
    description: t("pages.blog.seoDescription"),
    path: "/blog/",
    keywords: ["blog datas úteis", "escalas de trabalho", "dias úteis", "CLT"],
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Blog",
          name: t("pages.blog.heroTitle"),
          url: "https://datasuteis.com.br/blog/",
          description: t("pages.blog.heroSubtitle"),
          publisher: {
            "@type": "Organization",
            name: "Datas Úteis",
            url: "https://datasuteis.com.br/",
          },
        },
        {
          ...buildBreadcrumbSchema([
            { label: navigationLabels.home, href: "/" },
            { label: navigationLabels.blog, href: "/blog/" },
          ]),
        },
      ],
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" role="main">
        <section className="hero border-b border-border bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="hero-title text-primary">
                {t("pages.blog.heroTitle")}
              </h1>
              <p className="hero-subtitle mt-6">
                {t("pages.blog.heroSubtitle")}
              </p>
            </div>
          </div>
        </section>

        <FloatingSectionNav items={navItems} topLabel={topLabel} />

        <section className="section-md">
          <div className="container mx-auto page-stack">
            <PageIntroNavigation
              breadcrumbs={breadcrumbs}
              breadcrumbAriaLabel={navigationLabels.breadcrumb}
              backLabel={navigationLabels.back}
              backAriaLabel={navigationLabels.backAria}
            />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div id="artigos" className="section-anchor grid gap-6">
                {posts.map(post => (
                  <article key={post.slug} className="card-base card-hover p-6">
                    <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="badge badge-primary">
                        {post.category}
                      </span>
                      <span>{formatDate(post.publishedAt)}</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h2 className="text-2xl font-bold leading-tight">
                      {post.title}
                    </h2>
                    <p className="mt-3 text-muted-foreground">{post.excerpt}</p>

                    <Link
                      href={`/blog/${post.slug}/`}
                      className="mt-5 inline-flex items-center gap-2 font-semibold text-primary transition-transform hover:translate-x-1"
                    >
                      {t("pages.blog.readArticle")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
                ))}
              </div>

              <aside id="apoio" className="section-anchor space-y-6">
                <div className="card-base p-6">
                  <h2 className="text-lg font-bold">
                    {t("pages.blog.relatedToolsTitle")}
                  </h2>
                  <div className="mt-4 space-y-3 text-sm">
                    <Link
                      href="/calcular/"
                      className="block rounded-xl bg-secondary px-4 py-3 hover:bg-secondary/80"
                    >
                      {t("pages.blog.businessDaysBetweenDates")}
                    </Link>
                    <Link
                      href="/calendario/"
                      className="block rounded-xl bg-secondary px-4 py-3 hover:bg-secondary/80"
                    >
                      {t("pages.blog.holidayCalendar")}
                    </Link>
                    <Link
                      href="/escala/"
                      className="block rounded-xl bg-secondary px-4 py-3 hover:bg-secondary/80"
                    >
                      {t("pages.blog.scheduleSimulator")}
                    </Link>
                  </div>
                </div>

                <AdSlot id="ads-blog-sidebar" minHeight={250} format="rectangle" />
              </aside>
            </div>

            <CoreNavigationBlock />

            <AdSlot id="ads-blog-bottom" className="my-4" minHeight={100} format="auto" />

            <CtaFinalBlock
              language={language}
              title={language === "en" ? "Ready to calculate business days?" : language === "es" ? "¿Listo para calcular días hábiles?" : "Pronto para calcular dias úteis?"}
              buttonLabel={language === "en" ? "Open calculator" : language === "es" ? "Abrir calculadora" : "Abrir calculadora"}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

