import { useEffect, useMemo, useState } from "react";
import { Clock3, Landmark, RefreshCw } from "lucide-react";
import AdSlot from "@/components/AdSlot";
import PageShell from "@/components/layout/PageShell";
import WorldClockMarketsTable from "@/components/world-clock/WorldClockMarketsTable";
import WorldClockToolSwitcher from "@/components/world-clock/WorldClockToolSwitcher";
import { useI18n } from "@/contexts/LanguageContext";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { getMarketHoursPageCopy } from "@/lib/market-hours-copy";
import {
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  getNavigationLabels,
} from "@/lib/navigation";
import { getBackToTopLabel, getToolPageNavItems } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";
import {
  buildFallbackGlobalMarketsSnapshot,
  fetchGlobalMarketsSnapshot,
} from "@/lib/world-clock-api";
import {
  type GlobalMarketQuote,
  type GlobalMarketsSnapshotResponse,
} from "@/lib/world-clock-data";
import { getWorldClockPageCopy } from "@/lib/world-clock-copy";

type AsyncStatus = "idle" | "loading" | "success";

const PAGE_PATH = "/utilitarios/horario-mercados/";

function getStatusNotice(message: string) {
  return (
    <div className="rounded-xl bg-secondary px-3 py-2.5 text-sm leading-6 text-muted-foreground">
      {message}
    </div>
  );
}

export default function WorldClockMarkets() {
  const { language, dateLocale } = useI18n();
  const pageCopy = getMarketHoursPageCopy(language);
  const worldClockCopy = getWorldClockPageCopy(language);
  const marketLabels = worldClockCopy.markets;
  const navigationLabels = getNavigationLabels(language);
  const navItems = getToolPageNavItems(language);
  const topLabel = getBackToTopLabel(language);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.utilities, href: "/utilitarios/" },
    { label: pageCopy.title },
  ];

  const [isClientReady, setIsClientReady] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [marketsState, setMarketsState] = useState<{
    status: AsyncStatus;
    data?: GlobalMarketsSnapshotResponse;
  }>({ status: "idle" });

  const marketQuotesById = useMemo(
    () =>
      Object.fromEntries(
        (marketsState.data?.items ?? []).map(item => [item.marketId, item])
      ) as Record<string, GlobalMarketQuote | undefined>,
    [marketsState.data?.items]
  );

  const hasAnyFinancialSnapshot = useMemo(
    () =>
      (marketsState.data?.items ?? []).some(
        item =>
          item.price !== null ||
          item.previousClose !== null ||
          item.changeAbsolute !== null
      ),
    [marketsState.data?.items]
  );

  const statusNotice =
    marketsState.status === "loading"
      ? marketLabels.updating
      : marketsState.data?.snapshotStatus === "stale"
        ? pageCopy.staleNotice
        : marketsState.data?.snapshotStatus === "fallback"
          ? pageCopy.fallbackNotice
          : null;

  usePageSeo({
    title: pageCopy.seoTitle,
    description: pageCopy.seoDescription,
    path: PAGE_PATH,
    keywords: [
      "horario da bolsa",
      "horario da nasdaq",
      "horario da nyse",
      "horario da b3",
      "global market hours",
      "stock exchange hours",
    ],
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: pageCopy.title,
        url: `https://datasuteis.com.br${PAGE_PATH}`,
        description: pageCopy.description,
      },
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: pageCopy.title,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        url: `https://datasuteis.com.br${PAGE_PATH}`,
        description: pageCopy.description,
      },
      buildBreadcrumbSchema([
        { label: navigationLabels.home, href: "/" },
        { label: navigationLabels.utilities, href: "/utilitarios/" },
        { label: pageCopy.title, href: PAGE_PATH },
      ]),
      buildFaqPageSchema(pageCopy.content.faqItems),
    ],
  });

  useEffect(() => {
    setIsClientReady(true);

    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isClientReady || marketsState.status !== "idle") {
      return;
    }

    void refreshMarkets(false);
  }, [isClientReady, marketsState.status]);

  async function refreshMarkets(forceRefresh: boolean) {
    setMarketsState(previous => ({
      ...previous,
      status: "loading",
    }));

    try {
      const payload = await fetchGlobalMarketsSnapshot({
        force: forceRefresh,
      });
      setMarketsState({
        status: "success",
        data: payload,
      });
      trackAnalyticsEvent("utility_global_markets_refreshed", {
        force_refresh: forceRefresh,
        snapshot_status: payload.snapshotStatus,
      });
    } catch {
      setMarketsState({
        status: "success",
        data: buildFallbackGlobalMarketsSnapshot(),
      });
    }
  }

  return (
    <PageShell
      eyebrow={pageCopy.eyebrow}
      title={pageCopy.title}
      description={pageCopy.description}
      navItems={navItems}
      topLabel={topLabel}
      breadcrumbs={breadcrumbs}
      breadcrumbAriaLabel={navigationLabels.breadcrumb}
      backButtonLabel={navigationLabels.back}
      backButtonAriaLabel={navigationLabels.backAria}
      language={language}
      ctaTitle={pageCopy.ctaTitle}
      ctaButtonLabel={pageCopy.ctaButton}
      ctaHref="/utilitarios/horario-mundial/"
    >
      <div id="ferramenta" className="section-anchor">
        <div className="section-card world-clock-section-card">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <Landmark className="h-4 w-4" />
              {marketLabels.title}
            </div>
            <WorldClockToolSwitcher
              activePage="markets"
              worldLabel={worldClockCopy.tabs.world}
              marketsLabel={worldClockCopy.tabs.markets}
            />
          </div>

          <div className="mt-4 rounded-xl bg-secondary px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {pageCopy.content.introTitle}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {pageCopy.refreshHelp}
            </p>
          </div>

          <div className="mt-4">
            <AdSlot
              id="ads-markets-top"
              minHeight={120}
              format="horizontal"
              className="rounded-xl"
            />
            <span className="sr-only">{pageCopy.adLabel}</span>
          </div>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-3 rounded-xl bg-secondary px-3 py-2.5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {marketLabels.title}
              </p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                {marketLabels.description}
              </p>
              {marketsState.data?.updatedAt ? (
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {marketLabels.updatedAt}{" "}
                  {new Intl.DateTimeFormat(dateLocale, {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(marketsState.data.updatedAt))}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => void refreshMarkets(true)}
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-70"
              disabled={!isClientReady || marketsState.status === "loading"}
              aria-label={marketLabels.refresh}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  marketsState.status === "loading" ? "animate-spin" : ""
                }`}
              />
              {marketLabels.refresh}
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {!isClientReady ? getStatusNotice(pageCopy.liveLoadNotice) : null}
            {statusNotice ? getStatusNotice(statusNotice) : null}

            {isClientReady && marketsState.status !== "idle" ? (
              <WorldClockMarketsTable
                language={language}
                dateLocale={dateLocale}
                now={now}
                quotesById={marketQuotesById}
                hideQuoteColumns={!hasAnyFinancialSnapshot}
                compactFallbackNote={
                  !hasAnyFinancialSnapshot ? pageCopy.fallbackNotice : null
                }
                onMarketClick={marketId =>
                  trackAnalyticsEvent("utility_global_market_clicked", {
                    market_id: marketId,
                  })
                }
              />
            ) : null}
          </div>
        </div>
      </div>

      <section id="explicacao" className="section-anchor">
        <div className="section-card world-clock-section-card">
          <h2 className="text-2xl font-bold">{pageCopy.content.introTitle}</h2>
          <div className="mt-4 page-grid gap-4">
            {pageCopy.content.introItems.map(item => (
              <article
                key={item}
                className="rounded-xl bg-secondary p-4 text-sm leading-6 text-muted-foreground"
              >
                {item}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="exemplos" className="section-anchor">
        <div className="section-card world-clock-section-card">
          <h2 className="text-2xl font-bold">
            {pageCopy.content.examplesTitle}
          </h2>
          <div className="mt-4 page-grid gap-4">
            {pageCopy.content.examplesItems.map(item => (
              <article
                key={item}
                className="rounded-xl bg-secondary p-4 text-sm leading-6 text-muted-foreground"
              >
                {item}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section-anchor">
        <div className="section-card world-clock-section-card">
          <h2 className="text-2xl font-bold">{pageCopy.content.faqTitle}</h2>
          <div className="mt-4 space-y-2.5">
            {pageCopy.content.faqItems.map(item => (
              <details
                key={item.question}
                className="rounded-xl bg-secondary px-4 py-3.5"
              >
                <summary className="text-sm font-semibold leading-6">
                  {item.question}
                </summary>
                <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
