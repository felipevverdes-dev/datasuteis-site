import { Link } from "wouter";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import AdSlot from "@/components/AdSlot";
import CoreNavigationBlock from "@/components/layout/CoreNavigationBlock";
import CtaFinalBlock from "@/components/layout/CtaFinalBlock";
import PageIntroNavigation from "@/components/layout/PageIntroNavigation";
import { useI18n } from "@/contexts/LanguageContext";
import { getLocalizedBlogPostBySlug } from "@/lib/blog";
import { buildBreadcrumbSchema, getNavigationLabels } from "@/lib/navigation";
import { usePageSeo } from "@/lib/seo";
import NotFound from "@/pages/NotFound";

interface BlogPostPageProps {
  params: { slug: string };
}

export default function BlogPost({ params }: BlogPostPageProps) {
  const { language, t, formatDate } = useI18n();
  const navigationLabels = getNavigationLabels(language);
  const post = getLocalizedBlogPostBySlug(params.slug, language);

  if (!post) {
    return <NotFound />;
  }

  const relatedPosts = post.relatedSlugs
    .map(slug => getLocalizedBlogPostBySlug(slug, language))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.blog, href: "/blog/" },
    { label: post.title },
  ];

  usePageSeo({
    title: `${post.title} | Datas Úteis`,
    description: post.description,
    path: `/blog/${post.slug}/`,
    type: "article",
    keywords: post.keywords,
    publishedTime: `${post.publishedAt}T00:00:00-03:00`,
    modifiedTime: `${post.modifiedAt}T00:00:00-03:00`,
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          headline: post.title,
          description: post.description,
          url: `https://datasuteis.com.br/blog/${post.slug}/`,
          mainEntityOfPage: `https://datasuteis.com.br/blog/${post.slug}/`,
          datePublished: post.publishedAt,
          dateModified: post.modifiedAt,
          author: {
            "@type": "Organization",
            name: "Datas Úteis",
            url: "https://datasuteis.com.br/",
          },
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
            { label: post.title, href: `/blog/${post.slug}/` },
          ]),
        },
      ],
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content">
        <div className="section-md">
          <div className="container mx-auto max-w-5xl page-stack">
            <PageIntroNavigation
              breadcrumbs={breadcrumbs}
              breadcrumbAriaLabel={navigationLabels.breadcrumb}
              backLabel={navigationLabels.back}
              backAriaLabel={navigationLabels.backAria}
            />

            <article className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-8">
                <header className="card-base p-8">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="badge badge-primary">{post.category}</span>
                    <span>{formatDate(post.publishedAt)}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h1 className="mt-5 text-3xl font-bold leading-tight md:text-4xl">
                    {post.title}
                  </h1>
                  <p className="mt-4 text-lg text-muted-foreground">
                    {post.description}
                  </p>
                </header>

                <section className="card-base p-8">
                  <div
                    className="blog-article prose prose-sm max-w-none text-foreground dark:prose-invert md:prose-base"
                    dangerouslySetInnerHTML={{ __html: post.articleHtml }}
                  />
                </section>

                <AdSlot
                  id="ads-blogpost-content"
                  minHeight={100}
                  format="auto"
                />
              </div>

              <aside className="space-y-6">
                <div className="card-base p-6">
                  <h2 className="text-lg font-bold">
                    {t("pages.blogPost.relatedToolsTitle")}
                  </h2>
                  <div className="mt-4 space-y-3 text-sm">
                    <Link
                      href="/calcular/"
                      className="block rounded-xl bg-secondary px-4 py-3 hover:bg-secondary/80"
                    >
                      {t("pages.blogPost.relatedBusinessDays")}
                    </Link>
                    <Link
                      href="/calendario/"
                      className="block rounded-xl bg-secondary px-4 py-3 hover:bg-secondary/80"
                    >
                      {t("pages.blogPost.relatedCalendar")}
                    </Link>
                    <Link
                      href="/escala/"
                      className="block rounded-xl bg-secondary px-4 py-3 hover:bg-secondary/80"
                    >
                      {t("pages.blogPost.relatedSchedule")}
                    </Link>
                  </div>
                </div>

                <div className="card-base p-6">
                  <h2 className="text-lg font-bold">
                    {t("pages.blogPost.readAlso")}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {relatedPosts.map(related => (
                      <Link
                        key={related.slug}
                        href={`/blog/${related.slug}/`}
                        className="block rounded-2xl border border-border p-4 transition-colors hover:bg-secondary"
                      >
                        <p className="text-sm font-semibold">{related.title}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {related.excerpt}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </aside>
            </article>

            <CoreNavigationBlock />

            <AdSlot
              id="ads-blogpost-bottom"
              className="my-4"
              minHeight={100}
              format="auto"
            />

            <CtaFinalBlock
              language={language}
              title={
                language === "en"
                  ? "Calculate business days now"
                  : language === "es"
                    ? "Calcule días hábiles ahora"
                    : "Calcule dias úteis agora"
              }
              buttonLabel={
                language === "en"
                  ? "Open calculator"
                  : language === "es"
                    ? "Abrir calculadora"
                    : "Abrir calculadora"
              }
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
