import { Link } from "wouter";
import PageShell from "@/components/layout/PageShell";
import { useI18n } from "@/contexts/LanguageContext";
import {
  getBusinessDayYearSummary,
  getFifthBusinessDay,
} from "@/lib/business-days";
import {
  MAX_SUPPORTED_YEAR,
  MIN_SUPPORTED_YEAR,
  getMonthLabel,
  getMonthNumberFromSlug,
  getMonthSlug,
  parseRouteYear,
  shiftMonth,
} from "@/lib/date-utils";
import {
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  getNavigationLabels,
} from "@/lib/navigation";
import { getBackToTopLabel, getToolPageNavItems } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";
import NotFound from "@/pages/NotFound";

interface FifthBusinessDayProps {
  params?: { year?: string; month?: string };
}

export default function FifthBusinessDay({ params }: FifthBusinessDayProps) {
  const { language, formatDate } = useI18n();
  const navigationLabels = getNavigationLabels(language);
  const currentYear = new Date().getFullYear();
  const routeYear = parseRouteYear(params?.year);
  const year = routeYear ?? currentYear;
  const month = params?.month ? getMonthNumberFromSlug(params.month) : null;
  const navItems = getToolPageNavItems(language);
  const topLabel = getBackToTopLabel(language);
  const monthWord =
    language === "en" ? "Month" : language === "es" ? "Mes" : "Mês";
  const fifthWord =
    language === "en"
      ? "Fifth business day"
      : language === "es"
        ? "Quinto día hábil"
        : "5º dia útil";

  if ((params?.year && routeYear === null) || (params?.month && !month)) {
    return <NotFound />;
  }

  const yearSummary = getBusinessDayYearSummary(year);
  const fifth = month ? getFifthBusinessDay(year, month) : null;
  const title = month
    ? language === "en"
      ? `Fifth business day of ${getMonthLabel(year, month, language, { includeYear: true })}`
      : language === "es"
        ? `Quinto día hábil de ${getMonthLabel(year, month, language, { includeYear: true })}`
        : `5º dia útil de ${getMonthLabel(year, month, language, { includeYear: true })}`
    : params?.year
      ? language === "en"
        ? `Fifth business day of each month in ${year}`
        : language === "es"
          ? `Quinto día hábil de cada mes en ${year}`
          : `5º dia útil de cada mês em ${year}`
      : language === "en"
        ? "Fifth business day by month and year"
        : language === "es"
          ? "Quinto día hábil por mes y año"
          : "5º dia útil por mês e ano";
  const description = month
    ? language === "en"
      ? `See the fifth business day of ${getMonthLabel(year, month, language, { includeYear: true })} and compare it with nearby months.`
      : language === "es"
        ? `Vea el quinto día hábil de ${getMonthLabel(year, month, language, { includeYear: true })} y compárelo con meses cercanos.`
        : `Veja o 5º dia útil de ${getMonthLabel(year, month, language, { includeYear: true })} e compare com meses próximos.`
    : params?.year
      ? language === "en"
        ? `Open the annual table with the fifth business day of each month in ${year}.`
        : language === "es"
          ? `Abra la tabla anual con el quinto día hábil de cada mes de ${year}.`
          : `Abra a tabela anual com o 5º dia útil de cada mês de ${year}.`
      : language === "en"
        ? "Explore fifth-business-day pages by year and month."
        : language === "es"
          ? "Explore páginas de quinto día hábil por año y mes."
          : "Explore páginas de 5º dia útil por ano e mês.";
  const path = month
    ? `/quinto-dia-util/${year}/${getMonthSlug(month)}/`
    : params?.year
      ? `/quinto-dia-util/${year}/`
      : "/quinto-dia-util/";
  const nearbyYears = Array.from(
    { length: 5 },
    (_, index) => year - 2 + index
  ).filter(item => item >= MIN_SUPPORTED_YEAR && item <= MAX_SUPPORTED_YEAR);
  const previous = month ? shiftMonth(year, month, -1) : null;
  const next = month ? shiftMonth(year, month, 1) : null;
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.simulators },
    { label: navigationLabels.businessDays, href: "/dias-uteis/" },
    ...(month || params?.year
      ? [{ label: fifthWord, href: "/quinto-dia-util/" }, { label: title }]
      : [{ label: fifthWord }]),
  ];
  const faqItems = [
    {
      question:
        language === "en"
          ? "Does the fifth business day change every month?"
          : language === "es"
            ? "¿El quinto día hábil cambia cada mes?"
            : "O 5º dia útil muda todo mês?",
      answer:
        language === "en"
          ? "Yes. Weekends and holidays change the count from one month to another."
          : language === "es"
            ? "Sí. Fines de semana y feriados cambian la cuenta de un mes a otro."
            : "Sim. Finais de semana e feriados mudam a contagem de um mês para outro.",
    },
    {
      question:
        language === "en"
          ? "Can I compare years?"
          : language === "es"
            ? "¿Puedo comparar años?"
            : "Posso comparar anos?",
      answer:
        language === "en"
          ? "Yes. Use the monthly navigation to open the same month in nearby years."
          : language === "es"
            ? "Sí. Use la navegación mensual para abrir el mismo mes en años cercanos."
            : "Sim. Use a navegação mensal para abrir o mesmo mês em anos próximos.",
    },
    {
      question:
        language === "en"
          ? "Can I use this with the business-day calculator?"
          : language === "es"
            ? "¿Puedo usar esto con la calculadora?"
            : "Posso usar isso com a calculadora?",
      answer:
        language === "en"
          ? "Yes. The page works well as a quick reference before opening the full date-interval tool."
          : language === "es"
            ? "Sí. La página funciona como referencia rápida antes de abrir la herramienta completa."
            : "Sim. A página funciona como referência rápida antes de abrir a ferramenta completa.",
    },
  ];

  usePageSeo({
    title: `${title} | Datas Úteis`,
    description,
    path,
    keywords: [
      language === "en"
        ? "fifth business day"
        : language === "es"
          ? "quinto día hábil"
          : "quinto dia útil",
      language === "en"
        ? "business day by month"
        : language === "es"
          ? "día hábil por mes"
          : "dia útil por mês",
    ],
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          name: title,
          url: `https://datasuteis.com.br${path}`,
          description,
        },
        {
          ...buildBreadcrumbSchema(
            month || params?.year
              ? [
                  { label: navigationLabels.home, href: "/" },
                  { label: navigationLabels.simulators },
                  {
                    label: navigationLabels.businessDays,
                    href: "/dias-uteis/",
                  },
                  { label: fifthWord, href: "/quinto-dia-util/" },
                  { label: title, href: path },
                ]
              : [
                  { label: navigationLabels.home, href: "/" },
                  { label: navigationLabels.simulators },
                  {
                    label: navigationLabels.businessDays,
                    href: "/dias-uteis/",
                  },
                  { label: fifthWord, href: "/quinto-dia-util/" },
                ]
          ),
        },
        {
          "@type": "SoftwareApplication",
          name: title,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: `https://datasuteis.com.br${path}`,
        },
        buildFaqPageSchema(faqItems),
      ],
    },
  });

  return (
    <PageShell
      eyebrow={
        language === "en"
          ? "Fifth business day"
          : language === "es"
            ? "Quinto día hábil"
            : "5º dia útil"
      }
      title={title}
      description={description}
      navItems={navItems}
      topLabel={topLabel}
      breadcrumbs={breadcrumbs}
      breadcrumbAriaLabel={navigationLabels.breadcrumb}
      backButtonLabel={navigationLabels.back}
      backButtonAriaLabel={navigationLabels.backAria}
      language={language}
      ctaTitle={
        language === "en"
          ? "Calculate business days between any dates"
          : language === "es"
            ? "Calcule días hábiles entre cualquier fecha"
            : "Calcule dias úteis entre quaisquer datas"
      }
      ctaButtonLabel={
        language === "en"
          ? "Open calculator"
          : language === "es"
            ? "Abrir calculadora"
            : "Abrir calculadora"
      }
    >
      <div id="ferramenta" className="section-anchor page-stack">
        {month ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_320px]">
            <div className="section-card">
              <div className="rounded-3xl bg-primary/10 p-6">
                <p className="text-sm text-muted-foreground">{fifthWord}</p>
                <p className="mt-3 text-3xl font-bold text-primary">
                  {fifth ? formatDate(fifth) : "-"}
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Link
                  href={`/dias-uteis/${year}/${getMonthSlug(month)}/`}
                  className="rounded-2xl bg-secondary px-4 py-4 font-semibold transition-colors hover:bg-secondary/80"
                >
                  {language === "en"
                    ? "Open the month page"
                    : language === "es"
                      ? "Abrir la página del mes"
                      : "Abrir a página do mês"}
                </Link>
                <Link
                  href="/calcular/"
                  className="rounded-2xl bg-secondary px-4 py-4 font-semibold transition-colors hover:bg-secondary/80"
                >
                  {language === "en"
                    ? "Calculate date intervals"
                    : language === "es"
                      ? "Calcular intervalos"
                      : "Calcular intervalos de datas"}
                </Link>
              </div>
            </div>

            <aside className="section-card">
              <h2 className="text-2xl font-bold">
                {language === "en"
                  ? "Month navigation"
                  : language === "es"
                    ? "Navegación del mes"
                    : "Navegação do mês"}
              </h2>
              <div className="mt-5 space-y-3">
                {previous ? (
                  <Link
                    href={`/quinto-dia-util/${previous.year}/${getMonthSlug(previous.month)}/`}
                    className="block rounded-2xl bg-secondary px-4 py-4 transition-colors hover:bg-secondary/80"
                  >
                    {language === "en"
                      ? "Previous month"
                      : language === "es"
                        ? "Mes anterior"
                        : "Mês anterior"}
                  </Link>
                ) : null}
                {next ? (
                  <Link
                    href={`/quinto-dia-util/${next.year}/${getMonthSlug(next.month)}/`}
                    className="block rounded-2xl bg-secondary px-4 py-4 transition-colors hover:bg-secondary/80"
                  >
                    {language === "en"
                      ? "Next month"
                      : language === "es"
                        ? "Mes siguiente"
                        : "Próximo mês"}
                  </Link>
                ) : null}
                {[-1, 1]
                  .map(offset => year + offset)
                  .filter(
                    item =>
                      item >= MIN_SUPPORTED_YEAR && item <= MAX_SUPPORTED_YEAR
                  )
                  .map(item => (
                    <Link
                      key={item}
                      href={`/quinto-dia-util/${item}/${getMonthSlug(month)}/`}
                      className="block rounded-2xl bg-secondary px-4 py-4 transition-colors hover:bg-secondary/80"
                    >
                      {getMonthLabel(item, month, language, {
                        includeYear: true,
                      })}
                    </Link>
                  ))}
              </div>
            </aside>
          </div>
        ) : (
          <div className="section-card">
            <div className="mb-6 flex flex-wrap gap-3">
              {nearbyYears.map(item => (
                <Link
                  key={item}
                  href={`/quinto-dia-util/${item}/`}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${item === year ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}
                >
                  {item}
                </Link>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="px-3 py-3">{monthWord}</th>
                    <th className="px-3 py-3">{fifthWord}</th>
                    <th className="px-3 py-3">
                      {language === "en"
                        ? "Month page"
                        : language === "es"
                          ? "Página del mes"
                          : "Página do mês"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {yearSummary.months.map(item => (
                    <tr key={item.month} className="border-b border-border/70">
                      <td className="px-3 py-3">
                        {getMonthLabel(year, item.month, language)}
                      </td>
                      <td className="px-3 py-3">
                        {item.fifthBusinessDay
                          ? formatDate(item.fifthBusinessDay)
                          : "-"}
                      </td>
                      <td className="px-3 py-3">
                        <Link
                          href={`/quinto-dia-util/${year}/${getMonthSlug(item.month)}/`}
                          className="font-semibold text-primary"
                        >
                          {language === "en"
                            ? "Open"
                            : language === "es"
                              ? "Abrir"
                              : "Abrir"}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <section id="explicacao" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">
            {language === "en"
              ? "How this page helps"
              : language === "es"
                ? "Cómo ayuda esta página"
                : "Como esta página ajuda"}
          </h2>
          <div className="mt-5 page-grid">
            <article className="rounded-3xl bg-secondary p-5 text-sm leading-6 text-muted-foreground">
              {language === "en"
                ? "The annual table shows the fifth business day month by month for the selected year."
                : language === "es"
                  ? "La tabla anual muestra el quinto día hábil mes a mes para el año seleccionado."
                  : "A tabela anual mostra o 5º dia útil mês a mês para o ano selecionado."}
            </article>
            <article className="rounded-3xl bg-secondary p-5 text-sm leading-6 text-muted-foreground">
              {language === "en"
                ? "Monthly pages help compare the same month across different years."
                : language === "es"
                  ? "Las páginas mensuales ayudan a comparar el mismo mes en años distintos."
                  : "As páginas mensais ajudam a comparar o mesmo mês em anos diferentes."}
            </article>
            <article className="rounded-3xl bg-secondary p-5 text-sm leading-6 text-muted-foreground">
              {language === "en"
                ? "Open past years, the current year and future years whenever you need to compare the same month."
                : language === "es"
                  ? "Abra años pasados, el actual y años futuros siempre que necesite comparar el mismo mes."
                  : "Abra anos passados, o ano atual e anos futuros sempre que precisar comparar o mesmo mês."}
            </article>
          </div>
        </div>
      </section>

      <section id="exemplos" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">
            {language === "en"
              ? "Examples"
              : language === "es"
                ? "Ejemplos"
                : "Exemplos"}
          </h2>
          <div className="mt-5 page-grid">
            <article className="rounded-3xl bg-secondary p-5 text-sm leading-6 text-muted-foreground">
              {language === "en"
                ? `What is the fifth business day of ${getMonthLabel(year, month ?? 1, language, { includeYear: true })}?`
                : language === "es"
                  ? `¿Cuál es el quinto día hábil de ${getMonthLabel(year, month ?? 1, language, { includeYear: true })}?`
                  : `Qual é o 5º dia útil de ${getMonthLabel(year, month ?? 1, language, { includeYear: true })}?`}
            </article>
            <article className="rounded-3xl bg-secondary p-5 text-sm leading-6 text-muted-foreground">
              {language === "en"
                ? "How does the fifth business day change from one year to another?"
                : language === "es"
                  ? "¿Cómo cambia el quinto día hábil de un año a otro?"
                  : "Como o 5º dia útil muda de um ano para outro?"}
            </article>
            <article className="rounded-3xl bg-secondary p-5 text-sm leading-6 text-muted-foreground">
              {language === "en"
                ? "Which month should I compare with the business-day calculator?"
                : language === "es"
                  ? "¿Qué mes debo comparar con la calculadora?"
                  : "Qual mês devo comparar com a calculadora de dias úteis?"}
            </article>
          </div>
        </div>
      </section>

      <section id="faq" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">FAQ</h2>
          <div className="mt-5 space-y-3">
            {faqItems.map(item => (
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
