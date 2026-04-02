import { useEffect, useMemo, useState } from "react";
import { MapPin, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import PageShell from "@/components/layout/PageShell";
import { useI18n } from "@/contexts/LanguageContext";
import { useHolidayLocality } from "@/hooks/useHolidayLocality";
import {
  MAX_SUPPORTED_YEAR,
  MIN_SUPPORTED_YEAR,
  formatIsoDate,
  getMonthDays,
  getMonthLabel,
  getMonthNumberFromSlug,
  getMonthSlug,
  parseRouteYear,
} from "@/lib/date-utils";
import {
  buildNationalHolidayMonthSnapshot,
  fetchHolidayMonthSnapshot,
  type AppliedHolidayItem,
  type HolidayCalculationWarning,
} from "@/lib/holiday-service";
import { WidgetApiError } from "@/lib/home-widgets";
import { buildBreadcrumbSchema, getNavigationLabels } from "@/lib/navigation";
import { getBackToTopLabel } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";
import NotFound from "@/pages/NotFound";

interface CalendarProps {
  params?: { year?: string; month?: string };
}

const YEARS = Array.from(
  { length: MAX_SUPPORTED_YEAR - MIN_SUPPORTED_YEAR + 1 },
  (_, index) => MIN_SUPPORTED_YEAR + index
);

function groupHolidaysByDate(items: AppliedHolidayItem[]) {
  const map = new Map<string, AppliedHolidayItem[]>();
  for (const item of items) {
    const current = map.get(item.date);
    if (current) {
      current.push(item);
    } else {
      map.set(item.date, [item]);
    }
  }
  return map;
}

function getHolidayScopeLabel(
  language: string,
  scope: AppliedHolidayItem["scope"]
) {
  if (scope === "state") {
    return language === "en" ? "State" : language === "es" ? "Estatal" : "Estadual";
  }
  if (scope === "municipal") {
    return language === "en"
      ? "Municipal"
      : language === "es"
        ? "Municipal"
        : "Municipal";
  }
  if (scope === "optional") {
    return language === "en"
      ? "Optional"
      : language === "es"
        ? "Facultativo"
        : "Facultativo";
  }
  return language === "en" ? "National" : language === "es" ? "Nacional" : "Nacional";
}

function getWarningMessage(language: string, warning: HolidayCalculationWarning) {
  if (warning.code === "municipal_holidays_unavailable") {
    return language === "en"
      ? `Municipal holidays for ${warning.year} are not available yet.`
      : language === "es"
        ? `Los feriados municipales de ${warning.year} aún no están disponibles.`
        : `Os feriados municipais de ${warning.year} ainda não estão disponíveis.`;
  }

  return language === "en"
    ? `State holidays for ${warning.year} are not available yet.`
    : language === "es"
      ? `Los feriados estatales de ${warning.year} aún no están disponibles.`
      : `Os feriados estaduais de ${warning.year} ainda não estão disponíveis.`;
}

export default function Calendar({ params }: CalendarProps) {
  const [, navigate] = useLocation();
  const { language, formatDate, tm } = useI18n();
  const navigationLabels = getNavigationLabels(language);
  const currentDate = new Date();
  const routeYear = parseRouteYear(params?.year);
  const year = routeYear ?? currentDate.getFullYear();
  const monthFromRoute = params?.month ? getMonthNumberFromSlug(params.month) : null;

  if ((params?.year && routeYear === null) || (params?.month && !monthFromRoute)) {
    return <NotFound />;
  }

  const month = monthFromRoute ?? (params?.year ? 1 : currentDate.getMonth() + 1);
  const isLandingPage = !params?.year && !params?.month;
  const isYearPage = Boolean(params?.year && !params?.month);
  const locality = useHolidayLocality({ autoDetect: true });
  const fallbackSnapshot = useMemo(
    () => buildNationalHolidayMonthSnapshot({ year, month }),
    [month, year]
  );
  const [monthData, setMonthData] = useState<Awaited<
    ReturnType<typeof fetchHolidayMonthSnapshot>
  > | null>(fallbackSnapshot);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const topLabel = getBackToTopLabel(language);
  const navItems = [
    {
      id: "ferramenta",
      label:
        language === "en"
          ? "Calendar"
          : language === "es"
            ? "Calendario"
            : "Calendario",
    },
    {
      id: "explicacao",
      label:
        language === "en"
          ? "How it works"
          : language === "es"
            ? "Cómo funciona"
            : "Como funciona",
    },
    {
      id: "exemplos",
      label:
        language === "en"
          ? "Examples"
          : language === "es"
            ? "Ejemplos"
            : "Exemplos",
    },
    { id: "faq", label: "FAQ" },
  ];
  const monthLabel = getMonthLabel(year, month, language, {
    includeYear: true,
  });
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    {
      label: navigationLabels.calendar,
      ...(isLandingPage ? {} : { href: "/calendario/" }),
    },
    ...(isLandingPage ? [] : [{ label: isYearPage ? String(year) : monthLabel }]),
  ];
  const pageTitle =
    language === "en"
      ? "Holiday calendar"
      : language === "es"
        ? "Calendario con feriados"
        : "Calendário com feriados";
  const pageDescription =
    language === "en"
      ? `Browse the ${year} calendar with national, state and municipal holidays. Switch months and locality to plan deadlines and check weekends.`
      : language === "es"
        ? `Consulte el calendario ${year} con feriados nacionales, estatales y municipales. Cambie mes y localidad para planificar plazos y verificar fines de semana.`
        : `Consulte o calendário ${year} com feriados nacionais, estaduais e municipais. Troque mês e localidade para planejar prazos e verificar fins de semana.`;
  const monthPath = `/calendario/${year}/${getMonthSlug(month)}/`;
  const yearPath = `/calendario/${year}/`;
  const path = isLandingPage ? "/calendario/" : isYearPage ? yearPath : monthPath;
  const faqItems = [
    {
      question:
        language === "en"
          ? "Can I change the location manually?"
          : language === "es"
            ? "¿Puedo cambiar la localidad manualmente?"
            : "Posso trocar a localidade manualmente?",
      answer:
        language === "en"
          ? "Yes. The state and municipality fields change the holiday base used in the month."
          : language === "es"
            ? "Sí. Estado y municipio cambian la base de feriados aplicada al mes."
            : "Sim. Estado e município mudam a base de feriados aplicada ao mês.",
    },
    {
      question:
        language === "en"
          ? "What happens if location cannot be detected?"
          : language === "es"
            ? "¿Qué pasa si no se detecta la ubicación?"
            : "O que acontece se a localização não for detectada?",
      answer:
        language === "en"
          ? "The calendar keeps the national holiday base and you can choose the locality yourself."
          : language === "es"
            ? "El calendario mantiene la base nacional y usted puede elegir la localidad manualmente."
            : "O calendário mantém a base nacional e você pode escolher a localidade manualmente.",
    },
    {
      question:
        language === "en"
          ? "How do I know how many business days a month has?"
          : language === "es"
            ? "¿Cómo saber cuántos días hábiles tiene un mes?"
            : "Como saber quantos dias úteis tem um mês?",
      answer:
        language === "en"
          ? "Open the desired month and count the green cells (business days). Weekends appear in yellow and holidays in red or blue, so the green cells give you the exact number of business days."
          : language === "es"
            ? "Abra el mes deseado y cuente las celdas verdes (días hábiles). Los fines de semana aparecen en amarillo y los feriados en rojo o azul, por lo que las celdas verdes le dan el número exacto de días hábiles."
            : "Abra o mês desejado e conte as células verdes (dias úteis). Fins de semana aparecem em amarelo e feriados em vermelho ou azul, então as células verdes indicam a quantidade exata de dias úteis.",
    },
    {
      question:
        language === "en"
          ? "Which holidays are national?"
          : language === "es"
            ? "¿Cuáles feriados son nacionales?"
            : "Quais feriados são nacionais?",
      answer:
        language === "en"
          ? "National holidays are set by federal law and apply to the whole country — for example, Independence Day (September 7), Christmas (December 25) and New Year (January 1). They are shown with the 'National' badge in the holiday list."
          : language === "es"
            ? "Los feriados nacionales son establecidos por ley federal y se aplican a todo el país — por ejemplo, Día de la Independencia (7 de septiembre), Navidad (25 de diciembre) y Año Nuevo (1 de enero). Se muestran con la etiqueta 'Nacional' en la lista de feriados."
            : "Feriados nacionais são definidos por lei federal e valem para todo o país — por exemplo, Independência (7 de setembro), Natal (25 de dezembro) e Ano Novo (1 de janeiro). Eles aparecem com o selo 'Nacional' na lista de feriados.",
    },
    {
      question:
        language === "en"
          ? "Can I view calendars from previous years?"
          : language === "es"
            ? "¿Puedo consultar calendarios de años anteriores?"
            : "Posso consultar calendários de anos anteriores?",
      answer:
        language === "en"
          ? "Yes. Use the year selector to navigate to any year between 1900 and 2100. National holidays are calculated automatically. For state and municipal holidays, data availability depends on the year."
          : language === "es"
            ? "Sí. Use el selector de año para navegar a cualquier año entre 1900 y 2100. Los feriados nacionales se calculan automáticamente. Para feriados estatales y municipales, la disponibilidad depende del año."
            : "Sim. Use o seletor de ano para navegar a qualquer ano entre 1900 e 2100. Feriados nacionais são calculados automaticamente. Para feriados estaduais e municipais, a disponibilidade depende do ano.",
    },
    {
      question:
        language === "en"
          ? "Does the calendar show state holidays?"
          : language === "es"
            ? "¿El calendario muestra feriados estatales?"
            : "O calendário mostra feriados estaduais?",
      answer:
        language === "en"
          ? "Yes. Select a state in the locality panel and the calendar will include that state's holidays. Each holiday displays a badge indicating whether it is national, state, municipal or optional."
          : language === "es"
            ? "Sí. Seleccione un estado en el panel de localidad y el calendario incluirá los feriados de ese estado. Cada feriado muestra una etiqueta indicando si es nacional, estatal, municipal o facultativo."
            : "Sim. Selecione um estado no painel de localidade e o calendário incluirá os feriados daquele estado. Cada feriado exibe um selo indicando se é nacional, estadual, municipal ou facultativo.",
    },
    {
      question:
        language === "en"
          ? "How can I plan vacations using the calendar?"
          : language === "es"
            ? "¿Cómo planejar vacaciones usando el calendario?"
            : "Como planejar férias usando o calendário?",
      answer:
        language === "en"
          ? "Look for holidays that fall on Tuesdays or Thursdays — these create 'bridge' opportunities where taking one day off gives you a four-day weekend. Navigate month by month to spot the best stretches for time off."
          : language === "es"
            ? "Busque feriados que caigan en martes o jueves — estos crean oportunidades de 'puente' donde tomar un día libre le da un fin de semana de cuatro días. Navegue mes a mes para encontrar los mejores periodos de descanso."
            : "Procure feriados que caiam em terças ou quintas — eles criam oportunidades de 'emenda' em que tirar um dia de folga resulta em quatro dias seguidos de descanso. Navegue mês a mês para encontrar os melhores períodos.",
    },
    {
      question:
        language === "en"
          ? "What do the colors in the calendar mean?"
          : language === "es"
            ? "¿Qué significan los colores del calendario?"
            : "O que significam as cores no calendário?",
      answer:
        language === "en"
          ? "Green cells are regular business days. Yellow cells are weekends (Saturday and Sunday). Red cells are mandatory holidays (national, state or municipal). Blue cells are optional/facultative holidays."
          : language === "es"
            ? "Las celdas verdes son días hábiles normales. Las amarillas son fines de semana (sábado y domingo). Las rojas son feriados obligatorios (nacionales, estatales o municipales). Las azules son feriados facultativos."
            : "Células verdes são dias úteis normais. Amarelas são fins de semana (sábado e domingo). Vermelhas são feriados obrigatórios (nacionais, estaduais ou municipais). Azuis são feriados facultativos.",
    },
  ];

  usePageSeo({
    title:
      isLandingPage
        ? language === "en"
          ? `${year} Calendar with Holidays and Weekends | Datas Úteis`
          : language === "es"
            ? `Calendario ${year} con Feriados y Fines de Semana | Datas Úteis`
            : `Calendário ${year} com Feriados e Fins de Semana | Datas Úteis`
        : isYearPage
          ? language === "en"
            ? `${year} Holiday Calendar | Datas Úteis`
            : language === "es"
              ? `Calendario ${year} con Feriados | Datas Úteis`
              : `Calendário ${year} com Feriados | Datas Úteis`
        : language === "en"
          ? `${monthLabel} holiday calendar | Datas Úteis`
          : language === "es"
            ? `Calendario de ${monthLabel} | Datas Úteis`
            : `Calendário de ${monthLabel} | Datas Úteis`,
    description:
      isLandingPage
        ? pageDescription
        : isYearPage
          ? language === "en"
            ? `Review the ${year} calendar and switch months, weekends and local holidays in one place.`
            : language === "es"
              ? `Consulte el calendario de ${year} y cambie meses, fines de semana y feriados locales en un solo lugar.`
              : `Consulte o calendário de ${year} e navegue por meses, finais de semana e feriados locais em uma única página.`
        : language === "en"
          ? `Review weekends and local holidays for ${monthLabel}.`
          : language === "es"
            ? `Consulte fines de semana y feriados locales de ${monthLabel}.`
            : `Consulte finais de semana e feriados locais de ${monthLabel}.`,
    path,
    keywords: ["calendario", "feriados", "feriados locais"],
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          name: isLandingPage ? pageTitle : isYearPage ? String(year) : monthLabel,
          url: `https://datasuteis.com.br${path}`,
        },
        {
          "@type": "WebApplication",
          name: isLandingPage ? pageTitle : isYearPage ? `${year}` : monthLabel,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web",
          url: `https://datasuteis.com.br${path}`,
        },
        {
          ...buildBreadcrumbSchema(
            isLandingPage
              ? [
                  { label: navigationLabels.home, href: "/" },
                  { label: navigationLabels.calendar, href: "/calendario/" },
                ]
              : isYearPage
                ? [
                    { label: navigationLabels.home, href: "/" },
                    { label: navigationLabels.calendar, href: "/calendario/" },
                    { label: String(year), href: path },
                  ]
              : [
                  { label: navigationLabels.home, href: "/" },
                  { label: navigationLabels.calendar, href: "/calendario/" },
                  { label: monthLabel, href: path },
                ]
          ),
        },
      ],
    },
  });

  useEffect(() => {
    let cancelled = false;
    setMonthData(fallbackSnapshot);
    setLoading(true);
    setError("");

    void fetchHolidayMonthSnapshot({
      year,
      month,
      includeOptionalPoints: true,
      stateCode: locality.stateCode,
      municipalityCode: locality.selectedMunicipality?.ibgeCode,
    })
      .then(payload => {
        if (!cancelled) {
          setMonthData(payload);
        }
      })
      .catch(error => {
        if (!cancelled) {
          setMonthData(null);
          setError(
            error instanceof WidgetApiError
              ? error.message
              : language === "en"
                ? "Could not load the calendar right now."
                : language === "es"
                  ? "No fue posible cargar el calendario ahora."
                  : "Não foi possível carregar o calendário agora."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    language,
    locality.selectedMunicipality?.ibgeCode,
    locality.stateCode,
    month,
    year,
    fallbackSnapshot,
  ]);

  const holidaysByDate = useMemo(
    () => groupHolidaysByDate(monthData?.holidays ?? []),
    [monthData?.holidays]
  );
  const dayNames = tm<string[]>("pages.calendar.dayNames");
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = getMonthDays(year, month);
  const days: Array<number | null> = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        value: index + 1,
        label: getMonthLabel(year, index + 1, language),
      })),
    [language, year]
  );
  const localityHint =
    locality.detectedLocality?.source === "unavailable"
      ? language === "en"
        ? "Location unavailable. Showing the national base."
        : language === "es"
          ? "Ubicación no disponible. Mostrando la base nacional."
          : "Localização indisponível. Exibindo a base nacional."
      : locality.detectedLocality?.isFallback
        ? language === "en"
          ? "Approximate location."
          : language === "es"
            ? "Ubicación aproximada."
            : "Localização aproximada."
        : "";

  function goToCalendar(nextYear: number, nextMonth: number) {
    navigate(`/calendario/${nextYear}/${getMonthSlug(nextMonth)}/`);
  }

  return (
    <PageShell
      eyebrow={language === "en" ? "Calendar" : language === "es" ? "Calendario" : "Calendario"}
      title={isLandingPage ? pageTitle : isYearPage ? `${pageTitle} ${year}` : monthLabel}
      description={
        isLandingPage
          ? pageDescription
          : isYearPage
            ? language === "en"
              ? "Open the selected year and use the month selector to review local holidays and weekends."
              : language === "es"
                ? "Abra el año seleccionado y use el selector de mes para consultar feriados locales y fines de semana."
                : "Abra o ano selecionado e use o seletor de mês para consultar feriados locais e finais de semana."
          : language === "en"
            ? "Open the month with local holidays, weekends and weekday rhythm in one view."
            : language === "es"
              ? "Abra el mes con feriados locales, fines de semana y ritmo de días hábiles en una sola vista."
              : "Abra o mês com feriados locais, fins de semana e ritmo de dias úteis em uma única leitura."
      }
      navItems={navItems}
      topLabel={topLabel}
      breadcrumbs={breadcrumbs}
      breadcrumbAriaLabel={navigationLabels.breadcrumb}
      backButtonLabel={navigationLabels.back}
      backButtonAriaLabel={navigationLabels.backAria}
      language={language}
      ctaTitle={language === "en" ? "Calculate business-day intervals" : language === "es" ? "Calcule intervalos de días hábiles" : "Calcule intervalos de dias úteis"}
      ctaButtonLabel={language === "en" ? "Open calculator" : language === "es" ? "Abrir calculadora" : "Abrir calculadora"}
    >
      <section id="ferramenta" className="section-anchor page-stack">
        <div className="section-card">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px]">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {language === "en" ? "Month" : language === "es" ? "Mes" : "Mes"}
              </span>
              <select
                value={String(month)}
                onChange={event => goToCalendar(year, Number(event.target.value))}
                className="input-base w-full"
              >
                {monthOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {language === "en" ? "Year" : language === "es" ? "Ano" : "Ano"}
              </span>
              <select
                value={String(year)}
                onChange={event => goToCalendar(Number(event.target.value), month)}
                className="input-base w-full"
              >
                {YEARS.map(optionYear => (
                  <option key={optionYear} value={optionYear}>
                    {optionYear}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 rounded-3xl border border-border bg-secondary/40 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {language === "en" ? "Local base" : language === "es" ? "Base local" : "Base local"}
                </p>
                <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{locality.localityLabel}</span>
                </div>
                {localityHint ? (
                  <p className="mt-1 text-xs text-muted-foreground">{localityHint}</p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => void locality.detectLocality({ precise: true })}
                className="btn-secondary inline-flex items-center gap-2"
                disabled={locality.detecting}
              >
                <RefreshCw className={`h-4 w-4 ${locality.detecting ? "animate-spin" : ""}`} />
                {language === "en"
                  ? "Use my location"
                  : language === "es"
                    ? "Usar mi ubicación"
                    : "Usar minha localização"}
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold">
                  {language === "en" ? "State" : language === "es" ? "Estado" : "Estado"}
                </span>
                <select
                  value={locality.stateCode}
                  onChange={event => locality.setStateCode(event.target.value)}
                  className="input-base w-full"
                  disabled={locality.statesLoading}
                >
                  <option value="">
                    {locality.statesLoading
                      ? language === "en"
                        ? "Loading states..."
                        : language === "es"
                          ? "Cargando estados..."
                          : "Carregando estados..."
                      : language === "en"
                        ? "National base only"
                        : language === "es"
                          ? "Solo base nacional"
                          : "Somente base nacional"}
                  </option>
                  {locality.states.map(item => (
                    <option key={item.code} value={item.code}>
                      {item.code} - {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">
                  {language === "en"
                    ? "Municipality"
                    : language === "es"
                      ? "Municipio"
                      : "Municipio"}
                </span>
                <input
                  list="calendar-municipalities"
                  value={locality.municipalityInput}
                  onChange={event => {
                    const nextValue = event.target.value;
                    locality.setMunicipalityInput(nextValue);
                    locality.selectMunicipality(
                      locality.municipalities.find(
                        item =>
                          item.name.toLowerCase() === nextValue.trim().toLowerCase()
                      ) ?? null
                    );
                  }}
                  className="input-base w-full"
                  disabled={!locality.stateCode || locality.municipalitiesLoading}
                  placeholder={
                    !locality.stateCode
                      ? language === "en"
                        ? "Choose a state first"
                        : language === "es"
                          ? "Elija un estado primero"
                          : "Escolha um estado primeiro"
                      : language === "en"
                        ? "Type the municipality"
                        : language === "es"
                          ? "Escriba el municipio"
                          : "Digite o município"
                  }
                />
                <datalist id="calendar-municipalities">
                  {locality.filteredMunicipalities.map(item => (
                    <option key={item.ibgeCode} value={item.name} />
                  ))}
                </datalist>
              </label>
            </div>

            {locality.statesError ? (
              <p className="mt-3 text-sm text-amber-700">{locality.statesError}</p>
            ) : null}
            {locality.municipalitiesError ? (
              <p className="mt-3 text-sm text-amber-700">{locality.municipalitiesError}</p>
            ) : null}
          </div>

          {monthData ? (
            <div className="mt-5 rounded-3xl border border-border bg-background/70 p-4 text-sm">
              <p className="font-semibold">
                {language === "en"
                  ? "Holidays in this month"
                  : language === "es"
                    ? "Feriados de este mes"
                    : "Feriados deste mês"}
              </p>
              <p className="mt-1 text-muted-foreground">
                {monthData.holidayBreakdown.national}{" "}
                {language === "en" ? "national" : language === "es" ? "nacionales" : "nacionais"}
                {locality.stateCode
                  ? `, ${monthData.holidayBreakdown.state} ${
                      language === "en"
                        ? "state"
                        : language === "es"
                          ? "estatales"
                          : "estaduais"
                    }`
                  : ""}
                {locality.selectedMunicipality
                  ? `, ${monthData.holidayBreakdown.municipal} ${
                      language === "en"
                        ? "municipal"
                        : language === "es"
                          ? "municipales"
                          : "municipais"
                    }`
                  : ""}
              </p>
            </div>
          ) : null}

          {error ? <div className="warning-banner mt-5">{error}</div> : null}

          <div className="mt-6 grid grid-cols-7 gap-1.5 sm:gap-2">
            {dayNames.map(day => (
              <div
                key={day}
                className="flex min-h-[2.75rem] items-center justify-center break-words p-1 text-center text-[10px] font-bold leading-4 text-muted-foreground sm:p-2 sm:text-xs"
              >
                {day}
              </div>
            ))}

            {days.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="h-20 rounded-2xl bg-transparent sm:h-24"
                  />
                );
              }

              const iso = formatIsoDate(new Date(year, month - 1, day));
              const holidays = holidaysByDate.get(iso) ?? [];
              const holiday = holidays[0] ?? null;
              const weekend = new Date(year, month - 1, day).getDay() % 6 === 0;
              const optionalOnly =
                holidays.length > 0 &&
                holidays.every(item => item.scope === "optional");

              return (
                <div
                  key={day}
                  className={`min-w-0 overflow-hidden rounded-2xl p-2 text-center sm:p-3 ${
                    holiday
                      ? optionalOnly
                        ? "bg-sky-100 text-sky-700"
                        : "bg-rose-100 text-rose-700"
                      : weekend
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  <p className="text-base font-bold sm:text-lg">{day}</p>
                  <p className="mt-1 break-words text-[9px] leading-3 whitespace-normal sm:text-[11px] sm:leading-4">
                    {holiday
                      ? holiday.name
                      : weekend
                        ? language === "en"
                          ? "Weekend"
                          : language === "es"
                            ? "Fin de semana"
                            : "Fim de semana"
                        : language === "en"
                          ? "Business day"
                          : language === "es"
                            ? "Dia habil"
                            : "Dia util"}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-bold">
              {language === "en"
                ? "Dates highlighted in this month"
                : language === "es"
                  ? "Fechas destacadas de este mes"
                  : "Datas destacadas deste mês"}
            </h2>
            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                  {language === "en"
                    ? "Loading month..."
                    : language === "es"
                      ? "Cargando mes..."
                      : "Carregando mês..."}
                </div>
              ) : monthData?.holidays.length ? (
                monthData.holidays.map(item => (
                  <div
                    key={`${item.date}-${item.scope}-${item.name}`}
                    className="rounded-2xl bg-secondary px-4 py-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold">
                        {item.name}
                      </p>
                      <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {getHolidayScopeLabel(language, item.scope)}
                      </span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{formatDate(item.date)}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                  {language === "en"
                    ? "No holidays listed for this month."
                    : language === "es"
                      ? "No hay feriados para este mes."
                      : "Não há feriados listados neste mês."}
                </div>
              )}
            </div>
          </div>

          {monthData?.warnings.length ? (
            <div className="mt-4 space-y-3">
              {monthData.warnings.map(warning => (
                <div
                  key={`${warning.code}-${warning.year}-${warning.municipalityCode ?? ""}`}
                  className="warning-banner"
                >
                  {getWarningMessage(language, warning)}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section id="explicacao" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">
            {language === "en"
              ? "How it works"
              : language === "es"
                ? "Cómo funciona"
                : "Como funciona"}
          </h2>
          <div className="mt-5 space-y-6">
            <div>
              <h3 className="text-xl font-bold">
                {language === "en"
                  ? "How to use the calendar"
                  : language === "es"
                    ? "Cómo usar el calendario"
                    : "Como usar o calendário"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {language === "en"
                  ? "Use the month and year selectors at the top of the page to navigate to any period between 1900 and 2100. The calendar grid updates instantly, showing each day with a color code: green for regular business days, yellow for weekends (Saturday and Sunday), red for mandatory holidays and blue for optional (facultative) holidays. Tap or hover over any day to see the holiday name. Below the grid, a detailed list shows every holiday in the month with its date and scope badge."
                  : language === "es"
                    ? "Use los selectores de mes y año en la parte superior de la página para navegar a cualquier periodo entre 1900 y 2100. La cuadrícula del calendario se actualiza al instante, mostrando cada día con un código de colores: verde para días hábiles normales, amarillo para fines de semana (sábado y domingo), rojo para feriados obligatorios y azul para feriados facultativos. Toque o pase el cursor sobre cualquier día para ver el nombre del feriado. Debajo de la cuadrícula, una lista detallada muestra cada feriado del mes con su fecha y etiqueta de alcance."
                    : "Use os seletores de mês e ano no topo da página para navegar a qualquer período entre 1900 e 2100. A grade do calendário é atualizada instantaneamente, exibindo cada dia com um código de cores: verde para dias úteis normais, amarelo para fins de semana (sábado e domingo), vermelho para feriados obrigatórios e azul para feriados facultativos. Toque ou passe o cursor sobre qualquer dia para ver o nome do feriado. Abaixo da grade, uma lista detalhada mostra cada feriado do mês com sua data e selo de abrangência."}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold">
                {language === "en"
                  ? "National, state and municipal holidays"
                  : language === "es"
                    ? "Feriados nacionales, estatales y municipales"
                    : "O que são feriados nacionais, estaduais e municipais"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {language === "en"
                  ? "Brazil has three levels of holidays. National holidays are established by federal law and apply uniformly across the entire country — examples include Independence Day (September 7), Republic Day (November 15) and Christmas (December 25). State holidays are defined by each of the 26 states and the Federal District, such as the anniversary of the state's constitution or a patron saint's day. Municipal holidays are set by city councils and typically honor the city's founding date or local patron saint. In addition, there are optional (facultative) days like Carnival Monday and Tuesday, which are not official holidays but are widely observed. Our calendar lets you combine all three levels by selecting your state and municipality."
                  : language === "es"
                    ? "Brasil tiene tres niveles de feriados. Los feriados nacionales son establecidos por ley federal y se aplican uniformemente en todo el país — por ejemplo, el Día de la Independencia (7 de septiembre), el Día de la República (15 de noviembre) y la Navidad (25 de diciembre). Los feriados estatales son definidos por cada uno de los 26 estados y el Distrito Federal, como el aniversario de la constitución del estado o el día del santo patrono. Los feriados municipales son establecidos por los concejos municipales y normalmente conmemoran la fundación de la ciudad o el santo patrono local. Además, existen días facultativos como el lunes y martes de Carnaval, que no son feriados oficiales pero son ampliamente observados. Nuestro calendario permite combinar los tres niveles seleccionando su estado y municipio."
                    : "O Brasil possui três níveis de feriados. Feriados nacionais são estabelecidos por lei federal e valem igualmente para todo o território — exemplos incluem a Independência (7 de setembro), a Proclamação da República (15 de novembro) e o Natal (25 de dezembro). Feriados estaduais são definidos por cada um dos 26 estados e pelo Distrito Federal, como o aniversário da constituição estadual ou o dia do padroeiro. Feriados municipais são instituídos pelas câmaras de vereadores e geralmente celebram a data de fundação da cidade ou o padroeiro local. Além disso, existem os pontos facultativos, como a segunda e a terça de Carnaval, que não são feriados oficiais mas são amplamente observados. Nosso calendário permite combinar os três níveis ao selecionar seu estado e município."}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold">
                {language === "en"
                  ? "Planning with the calendar"
                  : language === "es"
                    ? "Planificación con el calendario"
                    : "Planejamento com calendário"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {language === "en"
                  ? "A visual calendar is one of the most practical tools for personal and professional planning. Individuals use it to schedule vacations around long weekends, avoid booking trips on business days unnecessarily, and coordinate family events. Companies rely on calendar views to set production schedules, plan marketing campaigns around seasonal peaks, and calculate payroll periods accurately. Project managers use the month view to identify sprints, set milestones and allocate resources, taking holidays into account so deadlines are realistic. By seeing the entire month at a glance — with weekends and holidays clearly marked — you can make informed decisions faster."
                  : language === "es"
                    ? "Un calendario visual es una de las herramientas más prácticas para la planificación personal y profesional. Las personas lo usan para programar vacaciones alrededor de fines de semana largos, evitar reservar viajes en días hábiles innecesariamente y coordinar eventos familiares. Las empresas confían en las vistas de calendario para establecer cronogramas de producción, planificar campañas de marketing según picos estacionales y calcular periodos de nómina con precisión. Los gerentes de proyectos usan la vista mensual para identificar sprints, establecer hitos y asignar recursos, teniendo en cuenta los feriados para que los plazos sean realistas. Al ver el mes completo de un vistazo — con fines de semana y feriados claramente marcados — puede tomar decisiones informadas más rápido."
                    : "Um calendário visual é uma das ferramentas mais práticas para o planejamento pessoal e profissional. Pessoas físicas o utilizam para agendar férias em torno de feriados prolongados, evitar marcar viagens em dias úteis desnecessariamente e coordenar eventos familiares. Empresas contam com visualizações de calendário para definir cronogramas de produção, planejar campanhas de marketing conforme picos sazonais e calcular períodos de folha de pagamento com precisão. Gerentes de projeto usam a visão mensal para identificar sprints, definir marcos e alocar recursos, levando feriados em conta para que prazos sejam realistas. Ao enxergar o mês inteiro de relance — com fins de semana e feriados claramente destacados — você toma decisões informadas com mais rapidez."}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold">
                {language === "en"
                  ? "Business days in the month"
                  : language === "es"
                    ? "Días hábiles en el mes"
                    : "Dias úteis no mês"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {language === "en"
                  ? "The number of business days varies from month to month depending on how many weekends and holidays fall within the period. A month with 31 days can have as few as 19 or as many as 23 business days. Months like February tend to have fewer business days, while months with no holidays — such as August in many localities — often have the most. Knowing the exact count of business days is essential for calculating deadlines, estimating delivery times, computing interest on financial products, and determining work schedules. Our calendar makes this easy: simply count the green cells for the selected month and locality."
                  : language === "es"
                    ? "La cantidad de días hábiles varía de mes a mes dependiendo de cuántos fines de semana y feriados caen dentro del periodo. Un mes con 31 días puede tener tan solo 19 o hasta 23 días hábiles. Meses como febrero tienden a tener menos días hábiles, mientras que meses sin feriados — como agosto en muchas localidades — suelen tener más. Conocer la cantidad exacta de días hábiles es esencial para calcular plazos, estimar tiempos de entrega, computar intereses en productos financieros y determinar horarios de trabajo. Nuestro calendario lo facilita: simplemente cuente las celdas verdes del mes y localidad seleccionados."
                    : "A quantidade de dias úteis varia de mês para mês conforme a distribuição de fins de semana e feriados no período. Um mês com 31 dias pode ter apenas 19 ou até 23 dias úteis. Meses como fevereiro tendem a ter menos dias úteis, enquanto meses sem feriados — como agosto em muitas localidades — costumam ter mais. Saber a contagem exata de dias úteis é essencial para calcular prazos, estimar tempos de entrega, computar juros de produtos financeiros e definir escalas de trabalho. Nosso calendário facilita essa tarefa: basta contar as células verdes do mês e da localidade selecionados."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="exemplos" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">
            {language === "en"
              ? "Practical examples"
              : language === "es"
                ? "Ejemplos prácticos"
                : "Exemplos práticos"}
          </h2>
          <div className="mt-5 space-y-6">
            <div>
              <h3 className="text-xl font-bold">
                {language === "en"
                  ? "Planning vacations around holidays"
                  : language === "es"
                    ? "Planificar vacaciones alrededor de feriados"
                    : "Planejar férias em torno de feriados"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {language === "en"
                  ? "Suppose Independence Day (September 7) falls on a Thursday. By taking Friday off you get a four-day weekend — Thursday through Sunday — using only one vacation day. Open September in the calendar, confirm the holiday's position in the grid, and plan your trip accordingly. This same strategy works with any holiday that lands on a Tuesday (take Monday off) or Thursday (take Friday off), maximizing rest with minimal leave."
                  : language === "es"
                    ? "Suponga que el Día de la Independencia (7 de septiembre) cae jueves. Tomando el viernes libre obtiene un fin de semana de cuatro días — de jueves a domingo — usando solo un día de vacaciones. Abra septiembre en el calendario, confirme la posición del feriado en la cuadrícula y planifique su viaje. Esta misma estrategia funciona con cualquier feriado que caiga martes (tome el lunes) o jueves (tome el viernes), maximizando el descanso con mínimo uso de días de vacaciones."
                    : "Suponha que a Independência (7 de setembro) caia numa quinta-feira. Tirando a sexta-feira de folga, você obtém quatro dias seguidos de descanso — de quinta a domingo — usando apenas um dia de férias. Abra setembro no calendário, confirme a posição do feriado na grade e planeje sua viagem. Essa mesma estratégia funciona com qualquer feriado que caia na terça (tire a segunda) ou na quinta (tire a sexta), maximizando o descanso com o mínimo de dias de férias utilizados."}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold">
                {language === "en"
                  ? "Identifying bridge holidays"
                  : language === "es"
                    ? "Identificar feriados puente"
                    : "Identificar feriados prolongados (emendas)"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {language === "en"
                  ? "A 'bridge' holiday occurs when a holiday falls near a weekend, creating the possibility of an extended break. For example, if a national holiday lands on a Tuesday, many workers take Monday off to enjoy a four-day weekend from Saturday to Tuesday. In the calendar, you can spot these opportunities visually: look for red or blue cells adjacent to yellow weekend cells. Browse through the year month by month to map out every bridge opportunity and plan ahead — whether for personal travel or to anticipate reduced staffing in your business."
                  : language === "es"
                    ? "Un feriado 'puente' ocurre cuando un feriado cae cerca de un fin de semana, creando la posibilidad de un descanso extendido. Por ejemplo, si un feriado nacional cae martes, muchos trabajadores toman el lunes libre para disfrutar de un fin de semana de cuatro días, de sábado a martes. En el calendario puede identificar estas oportunidades visualmente: busque celdas rojas o azules adyacentes a celdas amarillas de fin de semana. Navegue por el año mes a mes para mapear todas las oportunidades de puente y planificar con anticipación — ya sea para viajes personales o para anticipar equipos reducidos en su empresa."
                    : "Um feriado prolongado (ou 'emenda') ocorre quando um feriado cai próximo ao fim de semana, criando a possibilidade de um descanso estendido. Por exemplo, se um feriado nacional cai na terça-feira, muitos trabalhadores folgam na segunda para aproveitar quatro dias seguidos, de sábado a terça. No calendário, você identifica essas oportunidades visualmente: procure células vermelhas ou azuis adjacentes às células amarelas de fim de semana. Navegue pelo ano mês a mês para mapear todas as possibilidades de emenda e se planejar com antecedência — seja para viagens pessoais ou para antecipar equipes reduzidas na sua empresa."}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold">
                {language === "en"
                  ? "Counting business days for the month"
                  : language === "es"
                    ? "Contar días hábiles del mes"
                    : "Contar dias úteis do mês"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {language === "en"
                  ? "Need to know exactly how many business days a given month has? Select the month and your locality (state and municipality) so that all applicable holidays are loaded. Then count the green cells in the grid — each one represents a regular business day. This is useful for HR departments calculating work hours, accountants determining billing cycles, students counting school days, or anyone who needs to estimate how long a process measured in business days will take."
                  : language === "es"
                    ? "¿Necesita saber exactamente cuántos días hábiles tiene un mes? Seleccione el mes y su localidad (estado y municipio) para que se carguen todos los feriados aplicables. Luego cuente las celdas verdes en la cuadrícula — cada una representa un día hábil regular. Esto es útil para departamentos de recursos humanos calculando horas de trabajo, contadores determinando ciclos de facturación, estudiantes contando días de clase o cualquier persona que necesite estimar cuánto tardará un proceso medido en días hábiles."
                    : "Precisa saber exatamente quantos dias úteis um determinado mês possui? Selecione o mês e sua localidade (estado e município) para que todos os feriados aplicáveis sejam carregados. Depois, conte as células verdes na grade — cada uma representa um dia útil regular. Isso é útil para departamentos de RH calculando horas trabalhadas, contadores determinando ciclos de faturamento, estudantes contando dias letivos ou qualquer pessoa que precise estimar quanto tempo levará um processo medido em dias úteis."}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold">
                {language === "en"
                  ? "Scheduling events and deadlines"
                  : language === "es"
                    ? "Programar eventos y plazos"
                    : "Agendar eventos e prazos"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {language === "en"
                  ? "When scheduling a meeting, product launch or contractual deadline, it is important to verify that the chosen date is not a holiday or weekend. Open the target month, check the color of the desired day, and confirm it is a business day (green). If it falls on a holiday, you can quickly scan adjacent days to find the nearest business day. This is especially important for legal and financial deadlines, where missing a business day can result in penalties or delayed filings."
                  : language === "es"
                    ? "Al programar una reunión, lanzamiento de producto o plazo contractual, es importante verificar que la fecha elegida no sea feriado ni fin de semana. Abra el mes deseado, verifique el color del día y confirme que es un día hábil (verde). Si cae en feriado, puede escanear rápidamente los días adyacentes para encontrar el día hábil más cercano. Esto es especialmente importante para plazos legales y financieros, donde perder un día hábil puede resultar en penalizaciones o presentaciones tardías."
                    : "Ao agendar uma reunião, lançamento de produto ou prazo contratual, é importante verificar se a data escolhida não é feriado nem fim de semana. Abra o mês desejado, verifique a cor do dia e confirme que é um dia útil (verde). Se cair em feriado, você pode rapidamente verificar os dias adjacentes para encontrar o dia útil mais próximo. Isso é especialmente importante para prazos legais e financeiros, em que perder um dia útil pode resultar em multas ou atrasos em protocolos."}
              </p>
            </div>
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
