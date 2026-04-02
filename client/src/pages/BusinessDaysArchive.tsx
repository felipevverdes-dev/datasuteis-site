import { Link } from "wouter";
import PageShell from "@/components/layout/PageShell";
import { useI18n } from "@/contexts/LanguageContext";
import {
  getBusinessDayMonthSummary,
  getBusinessDayYearSummary,
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
import { getHolidayName } from "@/lib/holidays";
import { buildBreadcrumbSchema, getNavigationLabels } from "@/lib/navigation";
import { getBackToTopLabel, getToolPageNavItems } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";
import NotFound from "@/pages/NotFound";

interface BusinessDaysArchiveProps {
  params?: { year?: string; month?: string };
}

export default function BusinessDaysArchive({
  params,
}: BusinessDaysArchiveProps) {
  const { language, formatDate } = useI18n();
  const navigationLabels = getNavigationLabels(language);
  const currentYear = new Date().getFullYear();
  const routeYear = parseRouteYear(params?.year);
  const year = routeYear ?? currentYear;
  const month = params?.month ? getMonthNumberFromSlug(params.month) : null;
  const navItems = getToolPageNavItems(language);
  const topLabel = getBackToTopLabel(language);
  const hasMonth = Boolean(params?.month);

  if ((params?.year && routeYear === null) || (hasMonth && !month)) {
    return <NotFound />;
  }

  const yearSummary = getBusinessDayYearSummary(year);
  const monthSummary = month ? getBusinessDayMonthSummary(year, month) : null;
  const activeMonth = monthSummary?.month ?? month ?? 1;
  const monthWord = language === "en" ? "Month" : language === "es" ? "Mes" : "Mês";
  const businessWord = language === "en" ? "Business days" : language === "es" ? "Días hábiles" : "Dias úteis";
  const holidayWord = language === "en" ? "Holidays" : language === "es" ? "Feriados" : "Feriados";
  const fifthWord = language === "en" ? "Fifth business day" : language === "es" ? "Quinto día hábil" : "5º dia útil";
  const title = monthSummary
    ? language === "en"
      ? `How many business days are in ${getMonthLabel(year, activeMonth, language, { includeYear: true })}`
      : language === "es"
        ? `Cuántos días hábiles tiene ${getMonthLabel(year, activeMonth, language, { includeYear: true })}`
        : `Quantos dias úteis tem ${getMonthLabel(year, activeMonth, language, { includeYear: true })}`
    : params?.year
      ? language === "en"
        ? `Business days in each month of ${year}`
        : language === "es"
          ? `Días hábiles de cada mes de ${year}`
          : `Dias úteis de cada mês em ${year}`
      : language === "en"
        ? "Business days by year and month"
        : language === "es"
          ? "Días hábiles por año y mes"
          : "Dias úteis por ano e mês";
  const description = monthSummary
    ? language === "en"
      ? `Check business days, weekends, holidays and the fifth business day for ${getMonthLabel(year, month!, language, { includeYear: true })}.`
      : language === "es"
        ? `Consulte días hábiles, fines de semana, feriados y el quinto día hábil de ${getMonthLabel(year, month!, language, { includeYear: true })}.`
        : `Consulte dias úteis, finais de semana, feriados e o 5º dia útil de ${getMonthLabel(year, month!, language, { includeYear: true })}.`
    : params?.year
      ? language === "en"
        ? `Open the monthly table with business days, weekends and holidays for ${year}.`
        : language === "es"
          ? `Abra la tabla mensual de días hábiles, fines de semana y feriados de ${year}.`
          : `Abra a tabela mensal de dias úteis, finais de semana e feriados de ${year}.`
      : language === "en"
        ? "Explore business-day pages by year and month to compare periods with more context."
        : language === "es"
          ? "Explore páginas de días hábiles por año y mes para comparar períodos con más contexto."
          : "Explore páginas de dias úteis por ano e mês para comparar períodos com mais contexto.";
  const path = monthSummary
    ? `/dias-uteis/${year}/${getMonthSlug(month!)}/`
    : params?.year
      ? `/dias-uteis/${year}/`
      : "/dias-uteis/";
  const nearbyYears = Array.from({ length: 5 }, (_, index) => year - 2 + index).filter(
    item => item >= MIN_SUPPORTED_YEAR && item <= MAX_SUPPORTED_YEAR
  );
  const monthLinks = yearSummary.months.map(item => ({
    ...item,
    href: `/dias-uteis/${year}/${getMonthSlug(item.month)}/`,
  }));
  const shifted = month ? shiftMonth(year, month, -1) : null;
  const shiftedNext = month ? shiftMonth(year, month, 1) : null;
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.simulators },
    {
      label: navigationLabels.businessDays,
      ...((monthSummary || params?.year) ? { href: "/dias-uteis/" } : {}),
    },
    ...(monthSummary || params?.year ? [{ label: title }] : []),
  ];
  const faqItems = [
    {
      question:
        language === "en"
          ? "Does Saturday count as a business day?"
          : language === "es"
            ? "¿El sábado cuenta como día hábil?"
            : "Sábado conta como dia útil?",
      answer:
        language === "en"
          ? "On these pages, Saturday is not counted as a business day in the standard reading."
          : language === "es"
            ? "En estas páginas, el sábado no cuenta como día hábil en la lectura estándar."
            : "Nestas páginas, sábado não entra como dia útil na leitura padrão.",
    },
    {
      question:
        language === "en"
          ? "Can I open past and future years?"
          : language === "es"
            ? "¿Puedo abrir años pasados y futuros?"
            : "Posso abrir anos passados e futuros?",
      answer:
        language === "en"
          ? "Yes. You can open previous years, the current year and future years."
          : language === "es"
            ? "Sí. Puede abrir años anteriores, el año actual y años futuros."
            : "Sim. Você pode abrir anos anteriores, o ano atual e anos futuros.",
    },
    {
      question:
        language === "en"
          ? "Do these pages help with deadlines?"
          : language === "es"
            ? "¿Estas páginas ayudan con plazos?"
            : "Essas páginas ajudam com prazos?",
      answer:
        language === "en"
          ? "Yes. Use the monthly page together with the calculator when you need to check intervals between dates."
          : language === "es"
            ? "Sí. Use la página mensual junto con la calculadora cuando necesite revisar intervalos."
            : "Sim. Use a página mensal junto com a calculadora quando precisar revisar intervalos.",
    },
  ];

  usePageSeo({
    title: `${title} | Datas Úteis`,
    description,
    path,
    keywords:
      monthSummary
        ? [
            language === "en"
              ? `${getMonthLabel(year, month!, language, { includeYear: true })} business days`
              : language === "es"
                ? `días hábiles ${getMonthLabel(year, month!, language, { includeYear: true })}`
                : `dias úteis ${getMonthLabel(year, month!, language, { includeYear: true })}`,
            language === "en" ? "fifth business day" : language === "es" ? "quinto día hábil" : "quinto dia útil",
          ]
        : [
            language === "en" ? "business days by year" : language === "es" ? "días hábiles por año" : "dias úteis por ano",
            language === "en" ? "business days by month" : language === "es" ? "días hábiles por mes" : "dias úteis por mês",
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
            monthSummary || params?.year
              ? [
                  { label: navigationLabels.home, href: "/" },
                  { label: navigationLabels.simulators },
                  { label: navigationLabels.businessDays, href: "/dias-uteis/" },
                  { label: title, href: path },
                ]
              : [
                  { label: navigationLabels.home, href: "/" },
                  { label: navigationLabels.simulators },
                  { label: navigationLabels.businessDays, href: "/dias-uteis/" },
                ]
          ),
        },
        {
          "@type": "FAQPage",
          mainEntity: faqItems.map(item => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        },
      ],
    },
  });

  return (
    <PageShell
      eyebrow={language === "en" ? "Business days" : language === "es" ? "Días hábiles" : "Dias úteis"}
      title={title}
      description={description}
      navItems={navItems}
      topLabel={topLabel}
      breadcrumbs={breadcrumbs}
      breadcrumbAriaLabel={navigationLabels.breadcrumb}
      backButtonLabel={navigationLabels.back}
      backButtonAriaLabel={navigationLabels.backAria}
      language={language}
      ctaTitle={language === "en" ? "Calculate date intervals with precision" : language === "es" ? "Calcule intervalos de fechas con precisión" : "Calcule intervalos de datas com precisão"}
      ctaButtonLabel={language === "en" ? "Use the calculator" : language === "es" ? "Usar la calculadora" : "Usar a calculadora"}
    >
      <section id="ferramenta" className="section-anchor page-stack">
        {monthSummary ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_320px]">
            <div className="section-card">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-3xl bg-primary/10 p-5"><p className="text-sm text-muted-foreground">{businessWord}</p><p className="mt-2 text-2xl font-bold text-primary">{monthSummary.businessDays}</p></article>
                <article className="rounded-3xl bg-secondary p-5"><p className="text-sm text-muted-foreground">{language === "en" ? "Calendar days" : language === "es" ? "Días corridos" : "Dias corridos"}</p><p className="mt-2 text-2xl font-bold">{monthSummary.totalDays}</p></article>
                <article className="rounded-3xl bg-secondary p-5"><p className="text-sm text-muted-foreground">{language === "en" ? "Weekends" : language === "es" ? "Fines de semana" : "Finais de semana"}</p><p className="mt-2 text-2xl font-bold">{monthSummary.weekends}</p></article>
                <article className="rounded-3xl bg-secondary p-5"><p className="text-sm text-muted-foreground">{fifthWord}</p><p className="mt-2 text-2xl font-bold">{monthSummary.fifthBusinessDay ? formatDate(monthSummary.fifthBusinessDay) : "-"}</p></article>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Link href="/calcular/" className="rounded-2xl bg-secondary px-4 py-4 font-semibold transition-colors hover:bg-secondary/80">{language === "en" ? "Calculate date intervals" : language === "es" ? "Calcular intervalos" : "Calcular intervalos de datas"}</Link>
                <Link href={`/quinto-dia-util/${year}/${getMonthSlug(activeMonth)}/`} className="rounded-2xl bg-secondary px-4 py-4 font-semibold transition-colors hover:bg-secondary/80">{language === "en" ? "Open the fifth business day page" : language === "es" ? "Abrir la página del quinto día hábil" : "Abrir a página do 5º dia útil"}</Link>
              </div>

              <div className="mt-6 space-y-3">
                {monthSummary.holidays.length ? monthSummary.holidays.map(item => (
                  <div key={item.date} className="rounded-2xl bg-secondary px-4 py-4 text-sm">
                    <p className="font-semibold">{getHolidayName(item, language)}</p>
                    <p className="mt-1 text-muted-foreground">{formatDate(item.date)}</p>
                  </div>
                )) : <div className="rounded-2xl bg-secondary px-4 py-4 text-sm text-muted-foreground">{language === "en" ? "No national holidays in this month." : language === "es" ? "No hay feriados nacionales en este mes." : "Não há feriados nacionais neste mês."}</div>}
              </div>
            </div>

            <aside className="section-card">
              <h2 className="text-2xl font-bold">{language === "en" ? "Month navigation" : language === "es" ? "Navegación del mes" : "Navegação do mês"}</h2>
              <div className="mt-5 space-y-3">
                {shifted ? <Link href={`/dias-uteis/${shifted.year}/${getMonthSlug(shifted.month)}/`} className="block rounded-2xl bg-secondary px-4 py-4 transition-colors hover:bg-secondary/80">{language === "en" ? "Previous month" : language === "es" ? "Mes anterior" : "Mês anterior"}</Link> : null}
                {shiftedNext ? <Link href={`/dias-uteis/${shiftedNext.year}/${getMonthSlug(shiftedNext.month)}/`} className="block rounded-2xl bg-secondary px-4 py-4 transition-colors hover:bg-secondary/80">{language === "en" ? "Next month" : language === "es" ? "Mes siguiente" : "Próximo mês"}</Link> : null}
                {[-1, 1]
                  .map(offset => year + offset)
                  .filter(item => item >= MIN_SUPPORTED_YEAR && item <= MAX_SUPPORTED_YEAR)
                  .map(item => (
                    <Link key={item} href={`/dias-uteis/${item}/${getMonthSlug(activeMonth)}/`} className="block rounded-2xl bg-secondary px-4 py-4 transition-colors hover:bg-secondary/80">
                      {getMonthLabel(item, activeMonth, language, { includeYear: true })}
                    </Link>
                  ))}
              </div>
            </aside>
          </div>
        ) : (
          <div className="section-card">
            <div className="mb-6 flex flex-wrap gap-3">
              {nearbyYears.map(item => (
                <Link key={item} href={`/dias-uteis/${item}/`} className={`rounded-full px-4 py-2 text-sm font-semibold ${item === year ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                  {item}
                </Link>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="px-3 py-3">{monthWord}</th>
                    <th className="px-3 py-3">{businessWord}</th>
                    <th className="px-3 py-3">{language === "en" ? "Weekends" : language === "es" ? "Fines de semana" : "Finais de semana"}</th>
                    <th className="px-3 py-3">{holidayWord}</th>
                    <th className="px-3 py-3">{fifthWord}</th>
                  </tr>
                </thead>
                <tbody>
                  {monthLinks.map(item => (
                    <tr key={item.month} className="border-b border-border/70">
                      <td className="px-3 py-3"><Link href={item.href} className="font-semibold text-primary">{getMonthLabel(year, item.month, language)}</Link></td>
                      <td className="px-3 py-3">{item.businessDays}</td>
                      <td className="px-3 py-3">{item.weekends}</td>
                      <td className="px-3 py-3">{item.holidayCount}</td>
                      <td className="px-3 py-3">{item.fifthBusinessDay ? formatDate(item.fifthBusinessDay) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section id="explicacao" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">{language === "en" ? "How to use these pages" : language === "es" ? "Cómo usar estas páginas" : "Como usar estas páginas"}</h2>
          <div className="mt-5 page-grid">
            <article className="rounded-3xl bg-secondary p-5 text-sm leading-6 text-muted-foreground">{language === "en" ? "Each year page groups all months in one table with business days, weekends, holidays and the fifth business day." : language === "es" ? "Cada página anual reúne todos los meses con días hábiles, fines de semana, feriados y quinto día hábil." : "Cada página anual reúne todos os meses com dias úteis, finais de semana, feriados e 5º dia útil."}</article>
            <article className="rounded-3xl bg-secondary p-5 text-sm leading-6 text-muted-foreground">{language === "en" ? "Monthly pages are useful for deadline checks and for comparing the same month across different years." : language === "es" ? "Las páginas mensuales ayudan a revisar plazos y comparar el mismo mes en años distintos." : "As páginas mensais ajudam a revisar prazos e comparar o mesmo mês em anos diferentes."}</article>
            <article className="rounded-3xl bg-secondary p-5 text-sm leading-6 text-muted-foreground">{language === "en" ? "Open past years, the current year and future years whenever you need to compare months." : language === "es" ? "Abra años pasados, el actual y años futuros siempre que necesite comparar meses." : "Abra anos passados, o ano atual e anos futuros sempre que precisar comparar meses."}</article>
          </div>
        </div>
      </section>

      <section id="exemplos" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">{language === "en" ? "Examples" : language === "es" ? "Ejemplos" : "Exemplos"}</h2>
          <div className="mt-5 page-grid">
            <article className="rounded-3xl bg-secondary p-5 text-sm leading-6 text-muted-foreground">{language === "en" ? `How many business days are there in ${getMonthLabel(year, month ?? 1, language, { includeYear: true })}?` : language === "es" ? `¿Cuántos días hábiles tiene ${getMonthLabel(year, month ?? 1, language, { includeYear: true })}?` : `Quantos dias úteis tem ${getMonthLabel(year, month ?? 1, language, { includeYear: true })}?`}</article>
            <article className="rounded-3xl bg-secondary p-5 text-sm leading-6 text-muted-foreground">{language === "en" ? "Which national holidays affect this month?" : language === "es" ? "¿Qué feriados nacionales afectan este mes?" : "Quais feriados nacionais afetam este mês?"}</article>
            <article className="rounded-3xl bg-secondary p-5 text-sm leading-6 text-muted-foreground">{language === "en" ? "What is the fifth business day and how do I compare it with other years?" : language === "es" ? "¿Cuál es el quinto día hábil y cómo compararlo con otros años?" : "Qual é o 5º dia útil e como comparar com outros anos?"}</article>
          </div>
        </div>
      </section>

      <section id="faq" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">FAQ</h2>
          <div className="mt-5 space-y-3">
            {faqItems.map(item => (
              <details key={item.question} className="rounded-2xl bg-secondary px-5 py-4">
                <summary className="font-semibold">{item.question}</summary>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
