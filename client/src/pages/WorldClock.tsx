import { useEffect, useMemo, useState } from "react";
import { Globe2, Landmark, Search } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import ModalDialog from "@/components/ui/ModalDialog";
import WorldClockCountryCard from "@/components/world-clock/WorldClockCountryCard";
import WorldClockContinentNav from "@/components/world-clock/WorldClockContinentNav";
import WorldClockCountryModalContent from "@/components/world-clock/WorldClockCountryModalContent";
import WorldClockToolSwitcher from "@/components/world-clock/WorldClockToolSwitcher";
import { useI18n } from "@/contexts/LanguageContext";
import { trackAnalyticsEvent } from "@/lib/analytics";
import {
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  getNavigationLabels,
} from "@/lib/navigation";
import { getBackToTopLabel, getToolPageNavItems } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";
import {
  COUNTRIES_BY_CONTINENT,
  getCountryById,
  type Continent,
  type CountryTimezoneOption,
  type WorldCountryDefinition,
} from "@/lib/world-clock-countries";
import {
  getLocalizedCountryMeta,
  getWorldClockPageCopy,
} from "@/lib/world-clock-copy";
import type { CountryProfileContent } from "@/lib/world-clock-country-details";

const PAGE_PATH = "/utilitarios/horario-mundial/";

function getStatusNotice(message: string) {
  return (
    <div className="rounded-xl bg-secondary px-3 py-2.5 text-sm leading-6 text-muted-foreground">
      {message}
    </div>
  );
}

function getTimezoneLabel(
  timezone: CountryTimezoneOption,
  localizedCapital: string
) {
  if (timezone.id !== "capital") {
    return timezone.label;
  }

  const zoneCode = /\(([^)]+)\)$/.exec(timezone.label)?.[1];
  return zoneCode ? `${localizedCapital} (${zoneCode})` : localizedCapital;
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function redirectLegacyMarketsTab() {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  if (url.searchParams.get("tab") !== "mercados") {
    return;
  }

  url.pathname = "/utilitarios/horario-mercados/";
  url.searchParams.delete("tab");
  window.location.replace(`${url.pathname}${url.search}${url.hash}`);
}

export default function WorldClock() {
  const { language, dateLocale } = useI18n();
  const copy = getWorldClockPageCopy(language);
  const navigationLabels = getNavigationLabels(language);
  const navItems = getToolPageNavItems(language);
  const topLabel = getBackToTopLabel(language);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.utilities, href: "/utilitarios/" },
    { label: copy.title },
  ];

  const [activeContinent, setActiveContinent] = useState<Continent>("america");
  const [searchQuery, setSearchQuery] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [modalCountryId, setModalCountryId] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    data?: CountryProfileContent | null;
  }>({ status: "idle" });

  const activeContinentLabel = copy.continents[activeContinent];

  const localizedCountries = useMemo(() => {
    const uniqueCountries = new Map<
      WorldCountryDefinition["id"],
      {
        country: WorldCountryDefinition;
        localized: ReturnType<typeof getLocalizedCountryMeta>;
      }
    >();

    COUNTRIES_BY_CONTINENT[activeContinent].forEach(country => {
      if (!uniqueCountries.has(country.id)) {
        uniqueCountries.set(country.id, {
          country,
          localized: getLocalizedCountryMeta(country.id, language),
        });
      }
    });

    return Array.from(uniqueCountries.values());
  }, [activeContinent, language]);

  const filteredCountries = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);
    if (!normalizedQuery) {
      return localizedCountries;
    }

    return localizedCountries.filter(({ country, localized }) => {
      const searchableText = [
        localized.name,
        localized.capital,
        country.name,
        country.capital,
        ...(country.aliases ?? []),
        ...country.timezones.map(option =>
          getTimezoneLabel(option, localized.capital)
        ),
        ...country.timezones.map(option => option.timezone),
      ]
        .join(" ")
        .trim();

      return normalizeSearchText(searchableText).includes(normalizedQuery);
    });
  }, [localizedCountries, searchQuery]);

  const modalCountry = modalCountryId ? getCountryById(modalCountryId) : null;
  const modalCountryMeta = modalCountryId
    ? getLocalizedCountryMeta(modalCountryId, language)
    : null;

  usePageSeo({
    title: copy.seoTitle,
    description: copy.seoDescription,
    path: PAGE_PATH,
    keywords: [
      "world clock",
      "horario mundial",
      "fusos horarios",
      "timezones",
      "hora de outros paises",
    ],
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: copy.title,
        url: `https://datasuteis.com.br${PAGE_PATH}`,
        description: copy.description,
      },
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: copy.title,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        url: `https://datasuteis.com.br${PAGE_PATH}`,
        description: copy.description,
      },
      buildBreadcrumbSchema([
        { label: navigationLabels.home, href: "/" },
        { label: navigationLabels.utilities, href: "/utilitarios/" },
        { label: copy.title, href: PAGE_PATH },
      ]),
      buildFaqPageSchema(copy.content.faqItems),
    ],
  });

  useEffect(() => {
    redirectLegacyMarketsTab();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!modalCountryId) {
      setModalState({ status: "idle" });
      return undefined;
    }

    let cancelled = false;
    setModalState({ status: "loading" });
    void import("@/lib/world-clock-country-details")
      .then(module => module.loadCountryDetailContent(modalCountryId, language))
      .then(detail => {
        if (!cancelled) {
          setModalState({ status: "success", data: detail });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setModalState({ status: "error" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [language, modalCountryId]);

  function changeContinent(continent: Continent) {
    setActiveContinent(continent);
    trackAnalyticsEvent("utility_world_clock_continent_changed", {
      continent,
    });
  }

  function openCountryModal(countryId: string) {
    setModalCountryId(countryId);
    trackAnalyticsEvent("utility_world_clock_country_modal_opened", {
      country_code: countryId,
    });
  }

  return (
    <>
      <PageShell
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        navItems={navItems}
        topLabel={topLabel}
        breadcrumbs={breadcrumbs}
        breadcrumbAriaLabel={navigationLabels.breadcrumb}
        backButtonLabel={navigationLabels.back}
        backButtonAriaLabel={navigationLabels.backAria}
        language={language}
        ctaTitle={copy.ctaTitle}
        ctaButtonLabel={copy.ctaButton}
      >
        <div id="ferramenta" className="section-anchor">
          <div className="section-card world-clock-section-card">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                <Landmark className="h-4 w-4" />
                {copy.toolLabel}
              </div>
              <WorldClockToolSwitcher
                activePage="world"
                worldLabel={copy.tabs.world}
                marketsLabel={copy.tabs.markets}
              />
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {copy.controls.searchLabel}
                </span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="input-base min-h-10 w-full px-3 py-2.5 pl-9 text-sm"
                    value={searchQuery}
                    onChange={event => setSearchQuery(event.target.value)}
                    placeholder={copy.controls.searchPlaceholder}
                  />
                </div>
                <p className="text-[11px] leading-5 text-muted-foreground">
                  {copy.controls.searchHint}
                </p>
              </label>

              <div className="rounded-xl bg-secondary px-3 py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {activeContinentLabel}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {filteredCountries.length} {copy.controls.countriesCountLabel}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  {copy.controls.worldGridDescription}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <WorldClockContinentNav
                language={language}
                activeContinent={activeContinent}
                onChange={changeContinent}
              />

              <div className="flex items-start gap-2.5">
                <Globe2 className="mt-0.5 h-3.5 w-3.5 text-primary" />
                <div>
                  <h2 className="text-lg font-bold leading-6">
                    {copy.controls.worldGridTitle}
                  </h2>
                  <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                    {activeContinentLabel}
                  </p>
                </div>
              </div>

              <div
                className="continent-watermark"
                data-continent={activeContinent}
              >
                {filteredCountries.length ? (
                  <div
                    id="world-clock-country-grid"
                    role="tabpanel"
                    aria-labelledby={`continent-tab-${activeContinent}`}
                    className="continent-watermark-grid grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                  >
                    {filteredCountries.map(({ country, localized }) => {
                      const timezone = country.timezones[0];

                      return (
                        <WorldClockCountryCard
                          key={country.id}
                          country={country}
                          displayName={localized.name}
                          displayCapital={localized.capital}
                          flag={localized.flag}
                          timezone={timezone}
                          timezoneLabel={getTimezoneLabel(
                            timezone,
                            localized.capital
                          )}
                          dateLocale={dateLocale}
                          now={now}
                          detailsLabel={copy.modal.titlePrefix}
                          onClick={() => openCountryModal(country.id)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  getStatusNotice(
                    `${copy.controls.noSearchResults} ${copy.controls.noSearchResultsHint}`
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <section id="explicacao" className="section-anchor">
          <div className="section-card world-clock-section-card">
            <h2 className="text-2xl font-bold">
              {copy.content.timezonesTitle}
            </h2>
            <div className="mt-4 page-grid gap-4">
              {copy.content.timezonesItems.map(item => (
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
            <h2 className="text-2xl font-bold">{copy.content.marketsTitle}</h2>
            <div className="mt-4 page-grid gap-4">
              {copy.content.marketsItems.map(item => (
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
            <h2 className="text-2xl font-bold">{copy.content.faqTitle}</h2>
            <div className="mt-4 space-y-2.5">
              {copy.content.faqItems.map(item => (
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

      <ModalDialog
        open={Boolean(modalCountryId)}
        onOpenChange={open => {
          if (!open) {
            setModalCountryId(null);
          }
        }}
        title={
          modalCountryMeta
            ? `${copy.modal.titlePrefix} ${modalCountryMeta.name}`
            : copy.modal.titlePrefix
        }
        description={
          modalCountryMeta
            ? `${copy.modal.descriptionPrefix} ${modalCountryMeta.name}.`
            : undefined
        }
        closeLabel={copy.modal.close}
      >
        {modalCountry ? (
          <WorldClockCountryModalContent
            language={language}
            status={modalState.status}
            detail={modalState.data}
          />
        ) : null}
      </ModalDialog>
    </>
  );
}
