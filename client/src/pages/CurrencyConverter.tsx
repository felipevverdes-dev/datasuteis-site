import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Coins, RefreshCw } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import { useI18n } from "@/contexts/LanguageContext";
import {
  convertCurrency,
  CurrencyCode,
  fetchMarketOverviewSnapshot,
  formatCurrency,
  getBrlPairRate,
  type MarketOverviewResponse,
} from "@/lib/home-widgets";
import { scheduleWhenIdle } from "@/lib/idle";
import { buildBreadcrumbSchema, getNavigationLabels } from "@/lib/navigation";
import { getBackToTopLabel, getToolPageNavItems } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";
import type { SupportedLanguage } from "@/lib/site";

const CURRENCY_OPTIONS: CurrencyCode[] = ["BRL", "USD", "EUR", "GBP"];

const COPY: Record<
  SupportedLanguage,
  {
    eyebrow: string;
    title: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
    sectionLabel: string;
    refresh: string;
    amount: string;
    from: string;
    to: string;
    invert: string;
    result: string;
    loading: string;
    errorLoad: string;
    errorRefresh: string;
    explanationTitle: string;
    explanationItems: string[];
    examplesTitle: string;
    exampleItems: string[];
    faqTitle: string;
    faqItems: Array<{ question: string; answer: string }>;
  }
> = {
  pt: {
    eyebrow: "Utilitários",
    title: "Conversor de moeda para consulta rápida",
    description:
      "Compare valores entre real, dólar, euro e libra em uma interface simples para rotina de compras, viagens, orçamento e conferência.",
    seoTitle:
      "Conversor de Moeda Online | Real, Dólar, Euro e Libra | Datas Úteis",
    seoDescription:
      "Converta valores entre real, dólar, euro e libra em uma página enxuta para comparação rápida de câmbio.",
    sectionLabel: "Conversão direta",
    refresh: "Atualizar",
    amount: "Valor",
    from: "De",
    to: "Para",
    invert: "Inverter moedas",
    result: "Resultado",
    loading: "Carregando...",
    errorLoad: "Não foi possível carregar as cotações agora.",
    errorRefresh: "Não foi possível atualizar as cotações agora.",
    explanationTitle: "Como usar o conversor",
    explanationItems: [
      "Informe o valor, escolha a moeda de origem e a moeda de destino. A conversão usa as cotações carregadas nesta página.",
      "O botão de atualização recarrega a visão de mercado sem bloquear a renderização inicial da página.",
      "A leitura é pensada para comparação rápida, não para fechamento cambial formal ou operação financeira contratada.",
    ],
    examplesTitle: "Exemplos práticos",
    exampleItems: [
      "Compare o valor em real de uma assinatura cobrada em dólar antes de aprovar o pagamento.",
      "Converta euro para real para revisar orçamento de viagem, curso ou software internacional.",
      "Use a leitura rápida de USD, EUR e GBP para checar exposição básica antes de uma decisão diária.",
    ],
    faqTitle: "Perguntas frequentes",
    faqItems: [
      {
        question: "Quais moedas estão disponíveis?",
        answer:
          "Real, dólar, euro e libra. A página foi montada para comparação rápida entre moedas frequentes no uso diário.",
      },
      {
        question: "A cotação fica salva?",
        answer:
          "Não. As cotações são carregadas quando a página é aberta ou atualizada.",
      },
      {
        question: "Isso serve para câmbio comercial ou contrato?",
        answer:
          "Não. A página serve para consulta e comparação rápida. Operações formais dependem da taxa aplicada pela instituição usada.",
      },
    ],
  },
  en: {
    eyebrow: "Utilities",
    title: "Currency converter for quick checks",
    description:
      "Compare BRL, USD, EUR and GBP in a simple interface for purchases, travel, budgeting and quick validation.",
    seoTitle: "Currency Converter | BRL, USD, EUR and GBP | Datas Úteis",
    seoDescription:
      "Convert values between BRL, USD, EUR and GBP in a compact page for quick exchange comparison.",
    sectionLabel: "Direct conversion",
    refresh: "Refresh",
    amount: "Amount",
    from: "From",
    to: "To",
    invert: "Invert currencies",
    result: "Result",
    loading: "Loading...",
    errorLoad: "It was not possible to load exchange data right now.",
    errorRefresh: "It was not possible to refresh exchange data right now.",
    explanationTitle: "How to use the converter",
    explanationItems: [
      "Enter a value, choose the source currency and the destination currency. The conversion uses the rates loaded on this page.",
      "The refresh button reloads the market view without blocking the initial page rendering.",
      "This page is built for quick comparison, not for formal exchange settlement or contracted financial operations.",
    ],
    examplesTitle: "Practical examples",
    exampleItems: [
      "Compare the BRL value of a subscription charged in USD before approving payment.",
      "Convert EUR to BRL to review a travel, course or software budget.",
      "Use the quick USD, EUR and GBP view to check basic exposure before a daily decision.",
    ],
    faqTitle: "Frequently asked questions",
    faqItems: [
      {
        question: "Which currencies are available?",
        answer:
          "BRL, USD, EUR and GBP. The page is focused on quick comparison between common daily currencies.",
      },
      {
        question: "Are exchange rates stored?",
        answer:
          "No. Rates are loaded when the page opens or when you refresh it.",
      },
      {
        question: "Can I use this for formal exchange contracts?",
        answer:
          "No. The page is meant for quick consultation and comparison. Formal operations depend on the institution's applied rate.",
      },
    ],
  },
  es: {
    eyebrow: "Utilidades",
    title: "Conversor de moneda para consulta rápida",
    description:
      "Compare valores entre real, dólar, euro y libra en una interfaz simple para compras, viajes, presupuesto y revisión.",
    seoTitle: "Conversor de Moneda | Real, Dólar, Euro y Libra | Datas Úteis",
    seoDescription:
      "Convierta valores entre real, dólar, euro y libra en una página compacta para comparación rápida del cambio.",
    sectionLabel: "Conversión directa",
    refresh: "Actualizar",
    amount: "Valor",
    from: "De",
    to: "Para",
    invert: "Invertir monedas",
    result: "Resultado",
    loading: "Cargando...",
    errorLoad: "No fue posible cargar las cotizaciones ahora.",
    errorRefresh: "No fue posible actualizar las cotizaciones ahora.",
    explanationTitle: "Cómo usar el conversor",
    explanationItems: [
      "Informe el valor, elija la moneda de origen y la de destino. La conversión usa las cotizaciones cargadas en esta página.",
      "El botón de actualización recarga la visión de mercado sin bloquear la renderización inicial.",
      "La lectura está pensada para comparación rápida, no para cierre cambiario formal u operación financiera contratada.",
    ],
    examplesTitle: "Ejemplos prácticos",
    exampleItems: [
      "Compare el valor en reales de una suscripción cobrada en dólares antes de aprobar el pago.",
      "Convierta euro a real para revisar presupuesto de viaje, curso o software internacional.",
      "Use la lectura rápida de USD, EUR y GBP para revisar exposición básica antes de una decisión diaria.",
    ],
    faqTitle: "Preguntas frecuentes",
    faqItems: [
      {
        question: "¿Qué monedas están disponibles?",
        answer:
          "Real, dólar, euro y libra. La página fue pensada para comparación rápida entre monedas frecuentes.",
      },
      {
        question: "¿La cotización queda guardada?",
        answer:
          "No. Las cotizaciones se cargan cuando la página se abre o se actualiza.",
      },
      {
        question: "¿Esto sirve para cambio comercial o contrato?",
        answer:
          "No. La página sirve para consulta y comparación rápida. Las operaciones formales dependen de la tasa aplicada por la institución.",
      },
    ],
  },
};

export default function CurrencyConverter() {
  const { language } = useI18n();
  const copy = COPY[language] ?? COPY.pt;
  const navigationLabels = getNavigationLabels(language);
  const navItems = getToolPageNavItems(language);
  const topLabel = getBackToTopLabel(language);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.utilities, href: "/utilitarios/" },
    { label: copy.title },
  ];
  const [overview, setOverview] = useState<MarketOverviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("100");
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>("USD");
  const [toCurrency, setToCurrency] = useState<CurrencyCode>("BRL");

  usePageSeo({
    title: copy.seoTitle,
    description: copy.seoDescription,
    path: "/utilitarios/conversor-de-moeda/",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Conversor de Moeda",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        url: "https://datasuteis.com.br/utilitarios/conversor-de-moeda/",
      },
      buildBreadcrumbSchema([
        { label: navigationLabels.home, href: "/" },
        { label: navigationLabels.utilities, href: "/utilitarios/" },
        { label: copy.title, href: "/utilitarios/conversor-de-moeda/" },
      ]),
    ],
  });

  useEffect(() => {
    let cancelled = false;

    const cleanup = scheduleWhenIdle(
      () => {
        void (async () => {
          setLoading(true);
          setError("");
          try {
            const payload = await fetchMarketOverviewSnapshot();
            if (!cancelled) {
              setOverview(payload);
            }
          } catch {
            if (!cancelled) {
              setOverview(null);
              setError(copy.errorLoad);
            }
          } finally {
            if (!cancelled) {
              setLoading(false);
            }
          }
        })();
      },
      { timeout: 1500, fallbackDelay: 250 }
    );

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [copy.errorLoad]);

  const conversion = useMemo(() => {
    const numericAmount = Number(amount.replace(",", "."));
    if (!overview?.currencies) {
      return null;
    }

    return convertCurrency(
      numericAmount,
      fromCurrency,
      toCurrency,
      overview.currencies.rates
    );
  }, [amount, fromCurrency, overview?.currencies, toCurrency]);

  const rateCards = useMemo(() => {
    if (!overview?.currencies) {
      return [];
    }

    return [
      {
        label: "USD/BRL",
        value: getBrlPairRate(overview.currencies.rates, "USD"),
      },
      {
        label: "EUR/BRL",
        value: getBrlPairRate(overview.currencies.rates, "EUR"),
      },
      {
        label: "GBP/BRL",
        value: getBrlPairRate(overview.currencies.rates, "GBP"),
      },
    ];
  }, [overview?.currencies]);

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const payload = await fetchMarketOverviewSnapshot();
      setOverview(payload);
    } catch {
      setOverview(null);
      setError(copy.errorRefresh);
    } finally {
      setLoading(false);
    }
  }

  return (
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
    >
      <div id="ferramenta" className="section-anchor">
        <div className="section-card">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <Coins className="h-4 w-4" />
              {copy.sectionLabel}
            </div>
            <button type="button" onClick={reload} className="btn-secondary">
              <span className="inline-flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                {copy.refresh}
              </span>
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_180px]">
            <label className="space-y-2">
              <span className="text-sm font-semibold">{copy.amount}</span>
              <input
                className="input-base w-full"
                value={amount}
                onChange={event =>
                  setAmount(
                    event.target.value.replace(/[^0-9,.-]/g, "").slice(0, 14)
                  )
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">{copy.from}</span>
              <select
                className="input-base w-full"
                value={fromCurrency}
                onChange={event =>
                  setFromCurrency(event.target.value as CurrencyCode)
                }
              >
                {CURRENCY_OPTIONS.map(currency => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">{copy.to}</span>
              <select
                className="input-base w-full"
                value={toCurrency}
                onChange={event =>
                  setToCurrency(event.target.value as CurrencyCode)
                }
              >
                {CURRENCY_OPTIONS.map(currency => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setFromCurrency(toCurrency);
                setToCurrency(fromCurrency);
              }}
            >
              <span className="inline-flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                {copy.invert}
              </span>
            </button>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="mt-6 page-grid">
            <article className="rounded-2xl bg-primary/10 p-5">
              <p className="text-sm text-muted-foreground">{copy.result}</p>
              <p className="mt-3 text-3xl font-bold text-primary">
                {loading && !overview
                  ? copy.loading
                  : conversion === null
                    ? "--"
                    : formatCurrency(
                        conversion,
                        toCurrency,
                        toCurrency === "BRL" ? 2 : 4
                      )}
              </p>
            </article>

            {rateCards.map(card => (
              <article
                key={card.label}
                className="rounded-2xl bg-secondary p-5"
              >
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-3 text-2xl font-bold">
                  {formatCurrency(card.value, "BRL", 4)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <section id="explicacao" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">{copy.explanationTitle}</h2>
          <div className="mt-5 page-grid">
            {copy.explanationItems.map(item => (
              <article
                key={item}
                className="rounded-2xl bg-secondary p-5 text-sm leading-6 text-muted-foreground"
              >
                {item}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="exemplos" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">{copy.examplesTitle}</h2>
          <div className="mt-5 page-grid">
            {copy.exampleItems.map(item => (
              <article
                key={item}
                className="rounded-2xl bg-secondary p-5 text-sm leading-6 text-muted-foreground"
              >
                {item}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">{copy.faqTitle}</h2>
          <div className="mt-5 space-y-3">
            {copy.faqItems.map(item => (
              <details
                key={item.question}
                className="rounded-2xl bg-secondary px-5 py-4"
              >
                <summary className="font-semibold">{item.question}</summary>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
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
