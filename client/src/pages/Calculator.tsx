import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "wouter";
import LocalizedDateInput from "@/components/age/LocalizedDateInput";
import PageShell from "@/components/layout/PageShell";
import { useI18n } from "@/contexts/LanguageContext";
import { trackAnalyticsEvent } from "@/lib/analytics";
import {
  calculateBusinessDays,
  fetchBusinessDayMunicipalities,
  fetchBusinessDayStates,
  type BusinessDayAppliedHoliday,
  type BusinessDayCalculationResponse,
  type BusinessDayCalculationWarning,
  type BusinessDayMunicipalityOption,
  type BusinessDayStateOption,
} from "@/lib/business-day-service";
import { formatIsoDate, parseIsoDate } from "@/lib/date-utils";
import { buildBreadcrumbSchema, getNavigationLabels } from "@/lib/navigation";
import { getBackToTopLabel, getToolPageNavItems } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";

type CalculatorMode = "between" | "add" | "subtract";

interface ResultState extends BusinessDayCalculationResponse {
  localityLabel: string;
}

function normalizeLocationValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export default function Calculator() {
  const { language, formatDate } = useI18n();
  const navItems = getToolPageNavItems(language);
  const topLabel = getBackToTopLabel(language);
  const isEn = language === "en";
  const isEs = language === "es";
  const t = (pt: string, en: string, es: string) =>
    isEn ? en : isEs ? es : pt;

  const [mode, setMode] = useState<CalculatorMode>("between");
  const [startDate, setStartDate] = useState(() => formatIsoDate(new Date()));
  const [endDate, setEndDate] = useState(() => formatIsoDate(new Date()));
  const [amount, setAmount] = useState("5");
  const [considerSaturday, setConsiderSaturday] = useState(false);
  const [includeOptionalPoints, setIncludeOptionalPoints] = useState(false);
  const [stateCode, setStateCode] = useState("");
  const [states, setStates] = useState<BusinessDayStateOption[]>([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [statesError, setStatesError] = useState("");
  const [municipalities, setMunicipalities] = useState<
    BusinessDayMunicipalityOption[]
  >([]);
  const [municipalitiesLoading, setMunicipalitiesLoading] = useState(false);
  const [municipalitiesError, setMunicipalitiesError] = useState("");
  const [municipalityInput, setMunicipalityInput] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] =
    useState<BusinessDayMunicipalityOption | null>(null);
  const [municipalityMenuOpen, setMunicipalityMenuOpen] = useState(false);
  const [showAllMunicipalities, setShowAllMunicipalities] = useState(false);
  const [formError, setFormError] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const municipalityFieldRef = useRef<HTMLDivElement | null>(null);

  const selectedState = states.find(item => item.code === stateCode) ?? null;
  const canUseLocalFilters = statesLoading || states.length > 0;
  const filteredMunicipalities = useMemo(() => {
    if (showAllMunicipalities) {
      return municipalities;
    }

    const query = normalizeLocationValue(municipalityInput);
    if (!query) {
      return municipalities;
    }

    return municipalities.filter(item =>
      normalizeLocationValue(item.name).includes(query)
    );
  }, [municipalities, municipalityInput, showAllMunicipalities]);

  const pageTitle = t(
    "Calcule dias úteis, some prazos e subtraia dias de trabalho",
    "Calculate business days, add deadlines and subtract working days",
    "Calcule días hábiles, sume plazos y reste días laborables"
  );
  const navigationLabels = getNavigationLabels(language);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.simulators },
    { label: navigationLabels.businessDays },
  ];
  const faqItems = [
    {
      question: t(
        "A calculadora mostra finais de semana e feriados?",
        "Does the calculator show weekends and holidays?",
        "¿La calculadora muestra fines de semana y feriados?"
      ),
      answer: t(
        "Sim. O resultado separa dias úteis, dias corridos, finais de semana e os feriados abatidos do cálculo.",
        "Yes. The result separates business days, calendar days, weekends and holiday days deducted from the calculation.",
        "Sí. El resultado separa días hábiles, días corridos, fines de semana y los feriados descontados del cálculo."
      ),
    },
    {
      question: t(
        "Quais feriados entram no cálculo?",
        "Which holidays are considered?",
        "¿Qué feriados se consideran?"
      ),
      answer: t(
        "Os feriados nacionais sempre entram. Os feriados estaduais e municipais são somados quando você seleciona a localidade.",
        "National holidays are always considered. State and municipal holidays are added when you select the locality.",
        "Los feriados nacionales siempre entran. Los feriados estatales y municipales se suman cuando selecciona la localidad."
      ),
    },
    {
      question: t(
        "Posso somar e subtrair dias úteis?",
        "Can I add and subtract business days?",
        "¿Puedo sumar y restar días hábiles?"
      ),
      answer: t(
        "Sim. A ferramenta tem modos separados para contar um intervalo, somar dias de trabalho e subtrair dias úteis.",
        "Yes. The tool has separate modes to count an interval, add working days and subtract working days.",
        "Sí. La herramienta tiene modos separados para contar un intervalo, sumar días laborables y restarlos."
      ),
    },
    {
      question: t(
        "Sábado conta como dia útil?",
        "Does Saturday count as a business day?",
        "¿El sábado cuenta como día hábil?"
      ),
      answer: t(
        "Depende do contexto. Na maioria das convenções trabalhistas e bancárias, sábado não é dia útil. Porém, em alguns setores do comércio e em certas convenções coletivas, o sábado pode ser considerado dia útil. Esta calculadora permite marcar a opção \"Contar sábado como dia útil\" para atender ambos os cenários.",
        "It depends on the context. In most labor and banking conventions, Saturday is not a business day. However, in some retail sectors and certain collective agreements, Saturday may be considered a working day. This calculator lets you check the \"Count Saturday as business day\" option to handle both scenarios.",
        "Depende del contexto. En la mayoría de las convenciones laborales y bancarias, el sábado no es día hábil. Sin embargo, en algunos sectores del comercio y en ciertos convenios colectivos, el sábado puede considerarse día hábil. Esta calculadora permite marcar la opción \"Contar sábado como día hábil\" para atender ambos escenarios."
      ),
    },
    {
      question: t(
        "Ponto facultativo é dia útil?",
        "Is an optional holiday a business day?",
        "¿El punto facultativo es día hábil?"
      ),
      answer: t(
        "Tecnicamente sim. Pontos facultativos são datas em que o governo federal autoriza a dispensa do ponto para servidores públicos, mas não são feriados oficiais. Empresas privadas podem ou não aderir. Se a sua empresa trata o ponto facultativo como folga, marque a opção correspondente na calculadora para descontá-lo da contagem.",
        "Technically yes. Optional holidays are dates when the federal government authorizes public servants to take the day off, but they are not official holidays. Private companies may or may not observe them. If your company treats optional holidays as days off, check the corresponding option in the calculator to deduct them from the count.",
        "Técnicamente sí. Los puntos facultativos son fechas en que el gobierno federal autoriza la dispensa del punto para servidores públicos, pero no son feriados oficiales. Las empresas privadas pueden adherir o no. Si su empresa trata el punto facultativo como descanso, marque la opción correspondiente en la calculadora para descontarlo del conteo."
      ),
    },
    {
      question: t(
        "Como contar prazos judiciais em dias úteis?",
        "How do I count legal deadlines in business days?",
        "¿Cómo contar plazos judiciales en días hábiles?"
      ),
      answer: t(
        "Desde 2016, o Código de Processo Civil brasileiro (art. 219) determina que os prazos processuais são contados em dias úteis, excluindo o dia do início e incluindo o dia do vencimento. Use o modo \"Somar dias úteis\" informando a data da intimação como data inicial e a quantidade de dias do prazo. Lembre-se de que o prazo só começa a correr no primeiro dia útil seguinte à publicação.",
        "Since 2016, the Brazilian Code of Civil Procedure (art. 219) determines that procedural deadlines are counted in business days, excluding the start day and including the due date. Use the \"Add business days\" mode with the notification date as the start date and the number of deadline days. Remember that the deadline only starts running on the first business day after publication.",
        "Desde 2016, el Código de Proceso Civil brasileño (art. 219) determina que los plazos procesales se cuentan en días hábiles, excluyendo el día de inicio e incluyendo el día de vencimiento. Use el modo \"Sumar días hábiles\" con la fecha de notificación como fecha inicial y la cantidad de días del plazo. Recuerde que el plazo solo comienza a correr en el primer día hábil siguiente a la publicación."
      ),
    },
    {
      question: t(
        "O resultado inclui o dia inicial na contagem?",
        "Does the result include the start day in the count?",
        "¿El resultado incluye el día inicial en el conteo?"
      ),
      answer: t(
        "Não. A contagem começa no dia seguinte à data inicial informada, seguindo a convenção mais comum usada em prazos legais, bancários e contratuais no Brasil. Se você precisa incluir o dia inicial, basta ajustar a data de partida para o dia anterior.",
        "No. The count starts on the day after the entered start date, following the most common convention used in legal, banking and contractual deadlines in Brazil. If you need to include the start day, simply adjust the start date to the previous day.",
        "No. El conteo comienza en el día siguiente a la fecha inicial informada, siguiendo la convención más común usada en plazos legales, bancarios y contractuales en Brasil. Si necesita incluir el día inicial, simplemente ajuste la fecha de partida al día anterior."
      ),
    },
    {
      question: t(
        "A calculadora funciona para anos futuros?",
        "Does the calculator work for future years?",
        "¿La calculadora funciona para años futuros?"
      ),
      answer: t(
        "Sim. Os feriados nacionais fixos e os que possuem regra de cálculo (como Páscoa e Corpus Christi) são projetados automaticamente. Feriados estaduais e municipais dependem da disponibilidade da base para cada ano. Se a base de um determinado ano ainda não estiver disponível, o resultado mostrará um aviso informando quais feriados foram considerados.",
        "Yes. Fixed national holidays and those with calculation rules (such as Easter and Corpus Christi) are projected automatically. State and municipal holidays depend on the database availability for each year. If a given year's data is not yet available, the result will show a warning indicating which holidays were considered.",
        "Sí. Los feriados nacionales fijos y los que poseen regla de cálculo (como Pascua y Corpus Christi) se proyectan automáticamente. Los feriados estatales y municipales dependen de la disponibilidad de la base para cada año. Si la base de un determinado año aún no está disponible, el resultado mostrará un aviso informando qué feriados fueron considerados."
      ),
    },
    {
      question: t(
        "Qual a diferença entre dias úteis e dias corridos?",
        "What is the difference between business days and calendar days?",
        "¿Cuál es la diferencia entre días hábiles y días corridos?"
      ),
      answer: t(
        "Dias corridos incluem todos os dias do calendário — sábados, domingos e feriados. Dias úteis excluem finais de semana e feriados. Por exemplo, um prazo de 10 dias corridos sempre termina em 10 dias. Já 10 dias úteis podem equivaler a 14 ou mais dias corridos, dependendo de quantos finais de semana e feriados caem no período.",
        "Calendar days include every day — Saturdays, Sundays and holidays. Business days exclude weekends and holidays. For example, a 10 calendar-day deadline always ends in 10 days. But 10 business days can equal 14 or more calendar days, depending on how many weekends and holidays fall within the period.",
        "Días corridos incluyen todos los días del calendario — sábados, domingos y feriados. Días hábiles excluyen fines de semana y feriados. Por ejemplo, un plazo de 10 días corridos siempre termina en 10 días. Pero 10 días hábiles pueden equivaler a 14 o más días corridos, dependiendo de cuántos fines de semana y feriados caen en el período."
      ),
    },
  ];

  usePageSeo({
    title: t(
      "Calculadora de Dias Úteis Online — Some e Subtraia Prazos | Datas Úteis",
      "Business Day Calculator — Add and Subtract Deadlines | Datas Úteis",
      "Calculadora de Días Hábiles — Sume y Reste Plazos | Datas Úteis"
    ),
    description: t(
      "Calculadora de dias úteis com feriados nacionais, estaduais e municipais. Conte entre datas, some prazos ou subtraia dias de trabalho com precisão.",
      "Business day calculator with national, state and municipal holidays. Count between dates, add deadlines or subtract working days accurately.",
      "Calculadora de días hábiles con feriados nacionales, estatales y municipales. Cuente entre fechas, sume plazos o reste días laborables con precisión."
    ),
    path: "/calcular/",
    keywords: [
      "calcular dias úteis",
      "somar dias úteis",
      "subtrair dias úteis",
    ],
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          name: pageTitle,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web",
          url: "https://datasuteis.com.br/calcular/",
          description: t(
            "Calculadora de dias úteis com contagem entre datas, soma de prazos e subtração de dias de trabalho.",
            "Business-day calculator with date ranges, deadline additions and working-day subtraction.",
            "Calculadora de días hábiles con conteo entre fechas, suma de plazos y resta de días laborables."
          ),
        },
        {
          ...buildBreadcrumbSchema([
            { label: navigationLabels.home, href: "/" },
            { label: navigationLabels.simulators },
            { label: navigationLabels.businessDays, href: "/calcular/" },
          ]),
        },
      ],
    },
  });

  useEffect(() => {
    let cancelled = false;
    setStatesLoading(true);
    setStatesError("");

    void fetchBusinessDayStates()
      .then(items => {
        if (!cancelled) {
          setStates(items);
        }
      })
      .catch(error => {
        if (!cancelled) {
          setStates([]);
          setStatesError(
            t(
              "Os filtros locais não estão disponíveis agora. O cálculo seguirá apenas com feriados nacionais.",
              "Local filters are unavailable right now. The calculation will use national holidays only.",
              "Los filtros locales no están disponibles ahora. El cálculo seguirá solo con feriados nacionales."
            )
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setStatesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

  useEffect(() => {
    setMunicipalityInput("");
    setSelectedMunicipality(null);
    setMunicipalities([]);
    setMunicipalitiesError("");
    setMunicipalityMenuOpen(false);
    setShowAllMunicipalities(false);

    if (!stateCode) {
      setMunicipalitiesLoading(false);
      return;
    }

    let cancelled = false;
    setMunicipalitiesLoading(true);

    void fetchBusinessDayMunicipalities(stateCode)
      .then(items => {
        if (!cancelled) {
          setMunicipalities(items);
        }
      })
      .catch(error => {
        if (!cancelled) {
          setMunicipalities([]);
          setMunicipalitiesError(
            t(
              "Não foi possível carregar os municípios deste estado agora.",
              "Could not load the municipalities for this state right now.",
              "No se pudieron cargar los municipios de este estado ahora."
            )
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setMunicipalitiesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [language, stateCode]);

  useEffect(() => {
    setResult(null);
    setFormError("");
  }, [
    amount,
    considerSaturday,
    endDate,
    includeOptionalPoints,
    mode,
    municipalityInput,
    startDate,
    stateCode,
  ]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        municipalityFieldRef.current &&
        event.target instanceof Node &&
        !municipalityFieldRef.current.contains(event.target)
      ) {
        setMunicipalityMenuOpen(false);
        setShowAllMunicipalities(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  function getLocalityLabel() {
    const parts = ["Brasil"];
    if (selectedState) parts.push(selectedState.code);
    if (selectedMunicipality) parts.push(selectedMunicipality.name);
    return parts.join(" > ");
  }

  function formatHolidaySummary(currentResult: ResultState) {
    const parts = [
      `${currentResult.holidayBreakdown.national} ${t("nacionais", "national", "nacionales")}`,
    ];
    if (selectedState)
      parts.push(
        `${currentResult.holidayBreakdown.state} ${t("estaduais", "state", "estatales")}`
      );
    if (selectedMunicipality)
      parts.push(
        `${currentResult.holidayBreakdown.municipal} ${t("municipais", "municipal", "municipales")}`
      );
    return parts.join(", ");
  }

  function getWarningMessage(warning: BusinessDayCalculationWarning) {
    if (warning.code === "municipal_holidays_unavailable") {
      return t(
        `A base municipal de ${warning.year} ainda não está disponível. Esse ano foi calculado apenas com feriados nacionais e estaduais.`,
        `Municipal holiday data for ${warning.year} is not available yet. That year was calculated with national and state holidays only.`,
        `La base municipal de ${warning.year} aún no está disponible. Ese año se calculó solo con feriados nacionales y estatales.`
      );
    }

    return t(
      `A base estadual de ${warning.year} ainda não está disponível. Esse ano foi calculado apenas com feriados nacionais.`,
      `State holiday data for ${warning.year} is not available yet. That year was calculated with national holidays only.`,
      `La base estatal de ${warning.year} aún no está disponible. Ese año se calculó solo con feriados nacionales.`
    );
  }

  function getHolidayScopeLabel(scope: BusinessDayAppliedHoliday["scope"]) {
    if (scope === "state") {
      return t("Estadual", "State", "Estatal");
    }

    if (scope === "municipal") {
      return t("Municipal", "Municipal", "Municipal");
    }

    if (scope === "optional") {
      return t("Facultativo", "Optional", "Facultativo");
    }

    return t("Nacional", "National", "Nacional");
  }

  function selectMunicipality(option: BusinessDayMunicipalityOption) {
    setSelectedMunicipality(option);
    setMunicipalityInput(option.name);
    setMunicipalityMenuOpen(false);
    setShowAllMunicipalities(false);
    setFormError("");
  }

  async function runCalculation() {
    if (
      !parseIsoDate(startDate) ||
      (mode === "between" && !parseIsoDate(endDate))
    ) {
      setFormError(
        t(
          "Informe datas válidas antes de calcular.",
          "Enter valid dates before calculating.",
          "Ingrese fechas válidas antes de calcular."
        )
      );
      return;
    }

    if (municipalityInput.trim() && !selectedMunicipality) {
      setFormError(
        t(
          "Selecione um município da lista para incluir feriados municipais.",
          "Select a municipality from the list to include municipal holidays.",
          "Seleccione un municipio de la lista para incluir feriados municipales."
        )
      );
      return;
    }

    setFormError("");
    setIsCalculating(true);

    try {
      const calculation = await calculateBusinessDays({
        mode,
        start: startDate,
        end: mode === "between" ? endDate : undefined,
        amount:
          mode === "between" ? undefined : Math.max(0, Number(amount) || 0),
        considerSaturday,
        includeOptionalPoints,
        stateCode,
        municipalityCode: selectedMunicipality?.ibgeCode,
      });

      trackAnalyticsEvent("tool_calculation", {
        tool_name: "business_days_calculator",
        mode,
        consider_saturday: considerSaturday,
        include_optional_points: includeOptionalPoints,
        has_state_filter: Boolean(stateCode),
        has_municipality_filter: Boolean(selectedMunicipality),
      });

      setResult({
        ...calculation,
        localityLabel: getLocalityLabel(),
      });
    } catch (error) {
      setFormError(
        t(
          "Não foi possível calcular agora. Tente novamente em alguns instantes.",
          "Could not calculate right now. Please try again in a moment.",
          "No se pudo calcular ahora. Inténtalo de nuevo en un momento."
        )
      );
    } finally {
      setIsCalculating(false);
    }
  }

  return (
    <PageShell
      title={pageTitle}
      description={t(
        "Use três modos para contar dias úteis entre datas, somar dias de trabalho ou subtrair dias úteis a partir de uma data base.",
        "Use three modes to count business days between dates, add working days or subtract them from a starting point.",
        "Use tres modos para contar días hábiles entre fechas, sumar días laborables o restarlos desde una fecha base."
      )}
      navItems={navItems}
      topLabel={topLabel}
      breadcrumbs={breadcrumbs}
      breadcrumbAriaLabel={navigationLabels.breadcrumb}
      backButtonLabel={navigationLabels.back}
      backButtonAriaLabel={navigationLabels.backAria}
      language={language}
      ctaTitle={t("Precisa do calendário?", "Need the calendar?", "¿Necesita el calendario?")}
      ctaButtonLabel={t("Ver calendário", "View calendar", "Ver calendario")}
      ctaHref="/calendario/"
    >
      <section id="ferramenta" className="section-anchor page-stack">
        <form
          className="section-card"
          onSubmit={event => {
            event.preventDefault();
            void runCalculation();
          }}
        >
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {t(
              "Use esta página para contar dias úteis entre datas, projetar um prazo para frente ou descobrir a data inicial de um processo.",
              "Use this page when you need to count business days between dates, project a deadline forward or discover the starting date of a process.",
              "Use esta página para contar días hábiles entre fechas, proyectar un plazo hacia adelante o descubrir la fecha inicial de un proceso."
            )}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              {
                id: "between",
                label: t("Entre datas", "Between dates", "Entre fechas"),
              },
              {
                id: "add",
                label: t(
                  "Somar dias úteis",
                  "Add business days",
                  "Sumar días hábiles"
                ),
              },
              {
                id: "subtract",
                label: t(
                  "Subtrair dias úteis",
                  "Subtract business days",
                  "Restar días hábiles"
                ),
              },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id as CalculatorMode)}
                className={mode === item.id ? "btn-primary" : "btn-secondary"}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <LocalizedDateInput
                label={t("Data inicial", "Start date", "Fecha inicial")}
                language={language}
                value={startDate}
                max={mode === "between" ? endDate : undefined}
                placeholderLabel={t(
                  "Formato da data",
                  "Date format",
                  "Formato de la fecha"
                )}
                onChange={setStartDate}
              />
            </div>

            {mode === "between" ? (
              <div className="space-y-2">
                <LocalizedDateInput
                  label={t("Data final", "End date", "Fecha final")}
                  language={language}
                  value={endDate}
                  min={startDate}
                  placeholderLabel={t(
                    "Formato da data",
                    "Date format",
                    "Formato de la fecha"
                  )}
                  onChange={setEndDate}
                />
              </div>
            ) : (
              <label className="space-y-2">
                <span className="text-sm font-semibold">
                  {t(
                    "Quantidade de dias úteis",
                    "Number of business days",
                    "Cantidad de días hábiles"
                  )}
                </span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={amount}
                  onChange={event => setAmount(event.target.value)}
                  className="input-base w-full"
                />
              </label>
            )}

            {canUseLocalFilters ? (
              <>
                <label className="space-y-2">
                  <span className="text-sm font-semibold">
                    {t("Estado", "State", "Estado")}
                  </span>
                  <select
                    value={stateCode}
                    onChange={event => setStateCode(event.target.value)}
                    className="input-base w-full"
                    disabled={statesLoading}
                  >
                    <option value="">
                      {statesLoading
                        ? t(
                            "Carregando estados...",
                            "Loading states...",
                            "Cargando estados..."
                          )
                        : t(
                            "Selecione um estado",
                            "Select a state",
                            "Seleccione un estado"
                          )}
                    </option>
                    {states.map(item => (
                      <option key={item.code} value={item.code}>
                        {item.code} - {item.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold">
                    {t("Município", "Municipality", "Municipio")}
                  </span>
                  <div ref={municipalityFieldRef} className="combo-shell">
                    <input
                      type="text"
                      value={municipalityInput}
                      onChange={event => {
                        const nextValue = event.target.value;
                        const match =
                          municipalities.find(
                            item =>
                              normalizeLocationValue(item.name) ===
                              normalizeLocationValue(nextValue)
                          ) ?? null;
                        setMunicipalityInput(nextValue);
                        setSelectedMunicipality(match);
                        setShowAllMunicipalities(false);
                        setMunicipalityMenuOpen(true);
                      }}
                      onFocus={() => {
                        if (stateCode && !municipalitiesLoading) {
                          setMunicipalityMenuOpen(true);
                        }
                      }}
                      onKeyDown={event => {
                        if (
                          event.key === "ArrowDown" &&
                          stateCode &&
                          !municipalitiesLoading
                        ) {
                          event.preventDefault();
                          setMunicipalityMenuOpen(true);
                        }
                      }}
                      className="input-base w-full pr-12"
                      placeholder={
                        !stateCode
                          ? t(
                              "Selecione um estado primeiro",
                              "Select a state first",
                              "Seleccione un estado primero"
                            )
                          : municipalitiesLoading
                            ? t(
                                "Carregando municípios...",
                                "Loading municipalities...",
                                "Cargando municipios..."
                              )
                            : t(
                                "Digite ou abra a lista completa",
                                "Type or open the full list",
                                "Escriba o abra la lista completa"
                              )
                      }
                      disabled={!stateCode || municipalitiesLoading}
                      autoComplete="off"
                      aria-expanded={municipalityMenuOpen}
                      aria-haspopup="listbox"
                    />
                    <button
                      type="button"
                      className="combo-toggle"
                      onClick={() => {
                        setMunicipalityMenuOpen(current => {
                          const nextOpen = !current;
                          setShowAllMunicipalities(nextOpen);
                          return nextOpen;
                        });
                      }}
                      disabled={!stateCode || municipalitiesLoading}
                      aria-label={t(
                        "Abrir lista de municípios",
                        "Open municipality list",
                        "Abrir lista de municipios"
                      )}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {municipalityMenuOpen &&
                    stateCode &&
                    !municipalitiesLoading ? (
                      <div className="combo-panel" role="listbox">
                        {filteredMunicipalities.length ? (
                          filteredMunicipalities.map(item => (
                            <button
                              key={item.ibgeCode}
                              type="button"
                              role="option"
                              data-active={
                                selectedMunicipality?.ibgeCode === item.ibgeCode
                              }
                              aria-selected={
                                selectedMunicipality?.ibgeCode === item.ibgeCode
                              }
                              className="combo-option"
                              onClick={() => selectMunicipality(item)}
                            >
                              {item.name}
                            </button>
                          ))
                        ) : (
                          <p className="px-3 py-2 text-sm text-muted-foreground">
                            {t(
                              "Nenhum município encontrado com esse filtro.",
                              "No municipality matched this filter.",
                              "Ningún municipio coincide con este filtro."
                            )}
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                </label>
              </>
            ) : null}
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {canUseLocalFilters
              ? t(
                  "Selecione estado e município para incluir feriados locais no cálculo.",
                  "Select state and municipality to include local holidays in the calculation.",
                  "Seleccione estado y municipio para incluir feriados locales en el cálculo."
                )
              : t(
                  "No momento, o cálculo considera apenas feriados nacionais.",
                  "At the moment, the calculation uses national holidays only.",
                  "Por ahora, el cálculo considera solo feriados nacionales."
                )}
          </p>

          {statesError && !statesLoading ? (
            <div className="warning-banner mt-4">{statesError}</div>
          ) : null}
          {municipalitiesError ? (
            <div className="warning-banner mt-4">{municipalitiesError}</div>
          ) : null}
          {formError ? (
            <div className="warning-banner mt-4">{formError}</div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-3 rounded-full border border-border px-4 py-2 text-sm">
              <input
                type="checkbox"
                checked={considerSaturday}
                onChange={event => setConsiderSaturday(event.target.checked)}
              />
              <span>
                {t(
                  "Contar sábado como dia útil",
                  "Count Saturday as business day",
                  "Contar sábado como día hábil"
                )}
              </span>
            </label>
            <label className="inline-flex items-center gap-3 rounded-full border border-border px-4 py-2 text-sm">
              <input
                type="checkbox"
                checked={includeOptionalPoints}
                onChange={event =>
                  setIncludeOptionalPoints(event.target.checked)
                }
              />
              <span>
                {t(
                  "Considerar ponto facultativo",
                  "Consider optional points",
                  "Considerar punto facultativo"
                )}
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary mt-6"
            disabled={isCalculating}
          >
            {isCalculating
              ? t("Calculando...", "Calculating...", "Calculando...")
              : t("Calcular", "Calculate", "Calcular")}
          </button>

          {result ? (
            <>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <article className="rounded-3xl bg-primary/10 p-5">
                  <p className="text-sm text-muted-foreground">
                    {t("Dias úteis", "Business days", "Días hábiles")}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-primary">
                    {result.businessDays}
                  </p>
                </article>
                <article className="rounded-3xl bg-secondary p-5">
                  <p className="text-sm text-muted-foreground">
                    {t("Dias corridos", "Calendar days", "Días corridos")}
                  </p>
                  <p className="mt-2 text-2xl font-bold">{result.totalDays}</p>
                </article>
                <article className="rounded-3xl bg-secondary p-5">
                  <p className="text-sm text-muted-foreground">
                    {t("Finais de semana", "Weekends", "Fines de semana")}
                  </p>
                  <p className="mt-2 text-2xl font-bold">{result.weekends}</p>
                </article>
                <article className="rounded-3xl bg-secondary p-5">
                  <p className="text-sm text-muted-foreground">
                    {t(
                      "Feriados no cálculo",
                      "Holiday days deducted",
                      "Feriados descontados"
                    )}
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {result.holidayDays}
                  </p>
                </article>
                {result.resultDate ? (
                  <article className="rounded-3xl bg-secondary p-5">
                    <p className="text-sm text-muted-foreground">
                      {t("Data resultante", "Result date", "Fecha resultante")}
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {formatDate(result.resultDate)}
                    </p>
                  </article>
                ) : null}
              </div>

              <div className="mt-6 rounded-3xl border border-border bg-secondary/50 p-5">
                <p className="text-sm text-muted-foreground">
                  {t("Localidade usada", "Locality used", "Localidad usada")}
                </p>
                <p className="mt-2 text-lg font-bold">{result.localityLabel}</p>
                <p className="mt-4 text-sm text-muted-foreground">
                  {t(
                    "Feriados considerados",
                    "Holidays considered",
                    "Feriados considerados"
                  )}
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {formatHolidaySummary(result)}
                </p>
                {result.holidayBreakdown.optional > 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {result.holidayBreakdown.optional}{" "}
                    {t(
                      "pontos facultativos",
                      "optional points",
                      "puntos facultativos"
                    )}
                  </p>
                ) : null}
              </div>

              {result.holidays.length ? (
                <div className="mt-6 rounded-3xl border border-border bg-secondary/50 p-5">
                  <h3 className="text-lg font-bold">
                    {t(
                      "Feriados no período",
                      "Holidays in this range",
                      "Feriados en el período"
                    )}
                  </h3>
                  <div className="mt-4 space-y-3">
                    {result.holidays.map(holiday => (
                      <div
                        key={`${holiday.date}-${holiday.scope}-${holiday.name}`}
                        className="rounded-2xl bg-background/80 px-4 py-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-semibold">
                            {formatDate(holiday.date)} — {holiday.name}
                          </p>
                          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                            {getHolidayScopeLabel(holiday.scope)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {result.warnings.length ? (
                <div className="mt-4 space-y-3">
                  {result.warnings.map(warning => (
                    <div
                      key={`${warning.code}-${warning.year}-${warning.municipalityCode ?? ""}`}
                      className="warning-banner"
                    >
                      {getWarningMessage(warning)}
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-6 rounded-3xl border border-border bg-secondary/50 p-5">
                <h3 className="text-lg font-bold">
                  {t(
                    "Como ler este resultado",
                    "How to read this result",
                    "Cómo leer este resultado"
                  )}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {mode === "between"
                    ? t(
                        `O intervalo tem ${result.businessDays} dias úteis usando ${result.localityLabel} como localidade do cálculo.`,
                        `The interval has ${result.businessDays} business days using ${result.localityLabel} as the calculation locality.`,
                        `El intervalo tiene ${result.businessDays} días hábiles usando ${result.localityLabel} como localidad del cálculo.`
                      )
                    : mode === "add"
                      ? t(
                          `Partindo de ${formatDate(startDate)}, o prazo chega em ${result.resultDate ? formatDate(result.resultDate) : "-"} considerando a localidade escolhida.`,
                          `Starting on ${formatDate(startDate)}, the deadline reaches ${result.resultDate ? formatDate(result.resultDate) : "-"} considering the selected locality.`,
                          `Partiendo de ${formatDate(startDate)}, el plazo llega a ${result.resultDate ? formatDate(result.resultDate) : "-"} considerando la localidad elegida.`
                        )
                      : t(
                          "O modo de subtração devolve a data inicial do processo considerando a localidade escolhida.",
                          "The subtraction mode returns the start date of the workflow considering the selected locality.",
                          "El modo de resta devuelve la fecha inicial del flujo considerando la localidad elegida."
                        )}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/blog/dias-uteis-o-que-sao/"
                    className="btn-secondary"
                  >
                    {t(
                      "Guia de dias úteis",
                      "Business days guide",
                      "Guía de días hábiles"
                    )}
                  </Link>
                  <Link
                    href="/blog/como-contar-prazos-em-dias-uteis/"
                    className="btn-secondary"
                  >
                    {t(
                      "Como contar prazos",
                      "Deadline counting",
                      "Conteo de plazos"
                    )}
                  </Link>
                  <Link
                    href="/blog/sabado-conta-como-dia-util/"
                    className="btn-secondary"
                  >
                    {t(
                      "Sábado conta como dia útil?",
                      "Saturday rule",
                      "Regla del sábado"
                    )}
                  </Link>
                </div>
              </div>
            </>
          ) : null}
        </form>
      </section>

      <section id="explicacao" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">
            {t(
              "Como usar a calculadora",
              "How to use the calculator",
              "Cómo usar la calculadora"
            )}
          </h2>
          <div className="mt-5 page-grid">
            <article className="rounded-3xl bg-secondary p-5 text-sm leading-6 text-muted-foreground">
              {t(
                "Use Entre datas quando precisar do total de dias úteis dentro de um intervalo.",
                "Use Between dates when you need the total number of business days inside an interval.",
                "Use Entre fechas cuando necesite el total de días hábiles dentro de un intervalo."
              )}
            </article>
            <article className="rounded-3xl bg-secondary p-5 text-sm leading-6 text-muted-foreground">
              {t(
                "O filtro de localidade muda a base de feriados. Feriados estaduais e municipais entram apenas quando você os seleciona.",
                "The locality filter changes the holiday base. State and municipal holidays are added only when you select them.",
                "El filtro de localidad cambia la base de feriados. Los feriados estatales y municipales se agregan solo cuando los selecciona."
              )}
            </article>
            <article className="rounded-3xl bg-secondary p-5 text-sm leading-6 text-muted-foreground">
              {t(
                "Use Somar dias úteis para encontrar a data final de um prazo em dias de trabalho.",
                "Use Add business days to find the final date of a deadline counted in working days.",
                "Use Sumar días hábiles para encontrar la fecha final de un plazo."
              )}
            </article>
            <article className="rounded-3xl bg-secondary p-5 text-sm leading-6 text-muted-foreground">
              {t(
                "Use Subtrair dias úteis para descobrir a data inicial de um prazo ou fluxo.",
                "Use Subtract business days to discover the starting date of a deadline or workflow.",
                "Use Restar días hábiles para descubrir la fecha inicial de un plazo o flujo."
              )}
            </article>
          </div>

          <div className="mt-12">
            <h3 className="text-2xl font-bold">
              {t(
                "O que são dias úteis?",
                "What are business days?",
                "¿Qué son los días hábiles?"
              )}
            </h3>
            <div className="mt-4 space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                {t(
                  "Dias úteis são os dias da semana em que a maioria das atividades comerciais, bancárias e governamentais acontece normalmente. No Brasil, a convenção mais aceita considera como dias úteis de segunda-feira a sexta-feira, excluindo sábados, domingos e feriados oficiais. Essa definição é usada por bancos, tribunais, órgãos públicos e pela maior parte das empresas privadas para calcular prazos de pagamento, vencimentos e obrigações contratuais.",
                  "Business days are the days of the week when most commercial, banking and government activities operate normally. In Brazil, the most widely accepted convention considers Monday through Friday as business days, excluding Saturdays, Sundays and official holidays. This definition is used by banks, courts, government agencies and most private companies to calculate payment deadlines, due dates and contractual obligations.",
                  "Días hábiles son los días de la semana en que la mayoría de las actividades comerciales, bancarias y gubernamentales funcionan normalmente. En Brasil, la convención más aceptada considera como días hábiles de lunes a viernes, excluyendo sábados, domingos y feriados oficiales. Esta definición es usada por bancos, tribunales, organismos públicos y la mayoría de las empresas privadas para calcular plazos de pago, vencimientos y obligaciones contractuales."
                )}
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                {t(
                  "A diferença entre um dia útil e um dia corrido pode parecer simples, mas tem impacto direto no cumprimento de prazos. Quando um contrato estabelece que o pagamento deve ser feito em \"5 dias úteis\", isso significa que finais de semana e feriados não entram na contagem. Dependendo do período, 5 dias úteis podem representar 7, 8 ou até 9 dias corridos — especialmente em semanas com feriados prolongados como Carnaval ou Semana Santa.",
                  "The difference between a business day and a calendar day may seem simple, but it directly affects deadline compliance. When a contract states that payment must be made within \"5 business days,\" weekends and holidays are excluded from the count. Depending on the period, 5 business days can represent 7, 8 or even 9 calendar days — especially during weeks with extended holidays like Carnival or Holy Week.",
                  "La diferencia entre un día hábil y un día corrido puede parecer simple, pero tiene impacto directo en el cumplimiento de plazos. Cuando un contrato establece que el pago debe hacerse en \"5 días hábiles\", eso significa que fines de semana y feriados no entran en el conteo. Dependiendo del período, 5 días hábiles pueden representar 7, 8 o hasta 9 días corridos — especialmente en semanas con feriados prolongados como Carnaval o Semana Santa."
                )}
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                {t(
                  "No contexto jurídico brasileiro, a contagem em dias úteis ganhou ainda mais relevância com o Código de Processo Civil de 2015. Desde então, todos os prazos processuais passaram a ser contados exclusivamente em dias úteis, o que mudou a dinâmica de trabalho de escritórios de advocacia e departamentos jurídicos em todo o país.",
                  "In the Brazilian legal context, counting in business days gained even more relevance with the 2015 Code of Civil Procedure. Since then, all procedural deadlines are counted exclusively in business days, which changed the workflow of law firms and legal departments across the country.",
                  "En el contexto jurídico brasileño, el conteo en días hábiles ganó aún más relevancia con el Código de Proceso Civil de 2015. Desde entonces, todos los plazos procesales se cuentan exclusivamente en días hábiles, lo que cambió la dinámica de trabajo de oficinas de abogados y departamentos jurídicos en todo el país."
                )}
              </p>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-2xl font-bold">
              {t(
                "Diferença entre dias úteis e dias corridos",
                "Difference between business days and calendar days",
                "Diferencia entre días hábiles y días corridos"
              )}
            </h3>
            <div className="mt-4 space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                {t(
                  "Dias corridos incluem absolutamente todos os dias do calendário, sem exceção: segundas, terças, sábados, domingos, feriados nacionais e até pontos facultativos. A contagem é linear e previsível — 30 dias corridos a partir de hoje sempre terminam exatamente 30 dias depois. Já os dias úteis excluem finais de semana e feriados, o que torna a contagem variável dependendo do mês e da localidade.",
                  "Calendar days include absolutely every day on the calendar, without exception: Mondays, Tuesdays, Saturdays, Sundays, national holidays and even optional holidays. The count is linear and predictable — 30 calendar days from today always end exactly 30 days later. Business days, on the other hand, exclude weekends and holidays, making the count variable depending on the month and location.",
                  "Días corridos incluyen absolutamente todos los días del calendario, sin excepción: lunes, martes, sábados, domingos, feriados nacionales y hasta puntos facultativos. El conteo es lineal y predecible — 30 días corridos a partir de hoy siempre terminan exactamente 30 días después. Los días hábiles, en cambio, excluyen fines de semana y feriados, lo que hace el conteo variable dependiendo del mes y la localidad."
                )}
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                {t(
                  "Essa distinção é fundamental na prática. Um boleto com vencimento em \"10 dias corridos\" e outro em \"10 dias úteis\" terão datas de pagamento diferentes. Em meses com muitos feriados, como novembro (Finados, Proclamação da República) e abril (Páscoa, Tiradentes), a diferença pode ser de vários dias. Por isso, é essencial saber qual tipo de prazo está sendo utilizado antes de calcular uma data limite.",
                  "This distinction is fundamental in practice. A payment slip due in \"10 calendar days\" and another in \"10 business days\" will have different payment dates. In months with many holidays, such as November (All Souls' Day, Republic Day) and April (Easter, Tiradentes Day), the difference can be several days. That's why it's essential to know which type of deadline is being used before calculating a due date.",
                  "Esta distinción es fundamental en la práctica. Un boleto con vencimiento en \"10 días corridos\" y otro en \"10 días hábiles\" tendrán fechas de pago diferentes. En meses con muchos feriados, como noviembre (Finados, Proclamación de la República) y abril (Pascua, Tiradentes), la diferencia puede ser de varios días. Por eso, es esencial saber qué tipo de plazo se está utilizando antes de calcular una fecha límite."
                )}
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                {t(
                  "Outro ponto importante: em algumas situações, o prazo em dias corridos é convertido automaticamente quando o vencimento cai em um fim de semana ou feriado. Nesse caso, é comum que o vencimento seja prorrogado para o próximo dia útil. Isso acontece frequentemente com boletos bancários e obrigações fiscais, e é mais um motivo pelo qual ter uma ferramenta de cálculo precisa faz diferença no dia a dia.",
                  "Another important point: in some situations, a calendar-day deadline is automatically adjusted when the due date falls on a weekend or holiday. In that case, the due date is usually extended to the next business day. This frequently happens with bank payment slips and tax obligations, and it's yet another reason why having an accurate calculation tool makes a difference in daily routines.",
                  "Otro punto importante: en algunas situaciones, el plazo en días corridos se convierte automáticamente cuando el vencimiento cae en un fin de semana o feriado. En ese caso, es común que el vencimiento se prorrogue al próximo día hábil. Esto ocurre frecuentemente con boletos bancarios y obligaciones fiscales, y es una razón más por la cual tener una herramienta de cálculo precisa marca la diferencia en el día a día."
                )}
              </p>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-2xl font-bold">
              {t(
                "Como feriados afetam a contagem de dias úteis",
                "How holidays affect the business day count",
                "Cómo los feriados afectan el conteo de días hábiles"
              )}
            </h3>
            <div className="mt-4 space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                {t(
                  "O Brasil possui feriados em três esferas: nacional, estadual e municipal. Os feriados nacionais, como Independência (7 de setembro), Natal (25 de dezembro) e Proclamação da República (15 de novembro), valem para todo o território e sempre são descontados da contagem de dias úteis. Já os feriados estaduais variam de estado para estado — por exemplo, o aniversário de São Paulo (25 de janeiro) é feriado apenas no estado de SP, e a Revolução Constitucionalista (9 de julho) também.",
                  "Brazil has holidays at three levels: national, state and municipal. National holidays, such as Independence Day (September 7), Christmas (December 25) and Republic Proclamation Day (November 15), apply across the entire territory and are always deducted from the business day count. State holidays vary from state to state — for example, São Paulo's anniversary (January 25) is a holiday only in the state of SP, and the Constitutionalist Revolution (July 9) as well.",
                  "Brasil tiene feriados en tres esferas: nacional, estatal y municipal. Los feriados nacionales, como Independencia (7 de septiembre), Navidad (25 de diciembre) y Proclamación de la República (15 de noviembre), valen para todo el territorio y siempre se descuentan del conteo de días hábiles. Los feriados estatales varían de estado a estado — por ejemplo, el aniversario de São Paulo (25 de enero) es feriado solo en el estado de SP, y la Revolución Constitucionalista (9 de julio) también."
                )}
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                {t(
                  "Os feriados municipais adicionam outra camada de complexidade. Cada município pode instituir seus próprios feriados por lei municipal, geralmente ligados ao padroeiro da cidade ou a datas históricas locais. É por isso que esta calculadora oferece filtros de estado e município: para que o resultado reflita com precisão os feriados que realmente se aplicam à sua localidade.",
                  "Municipal holidays add another layer of complexity. Each municipality can establish its own holidays through local law, usually linked to the city's patron saint or local historical dates. That's why this calculator offers state and municipality filters: so the result accurately reflects the holidays that actually apply to your location.",
                  "Los feriados municipales agregan otra capa de complejidad. Cada municipio puede instituir sus propios feriados por ley municipal, generalmente ligados al patrono de la ciudad o a fechas históricas locales. Por eso esta calculadora ofrece filtros de estado y municipio: para que el resultado refleje con precisión los feriados que realmente se aplican a su localidad."
                )}
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                {t(
                  "Além dos feriados oficiais, existem os pontos facultativos — datas como Carnaval (que não é feriado nacional por lei) e Quarta-feira de Cinzas (meio expediente). Os pontos facultativos não são obrigatórios para a iniciativa privada, mas muitas empresas e a maioria dos órgãos públicos os observam. Nesta calculadora, você pode ativar a opção \"Considerar ponto facultativo\" para incluí-los no cálculo quando necessário.",
                  "Beyond official holidays, there are optional holidays — dates like Carnival (which is not a national holiday by law) and Ash Wednesday (half day). Optional holidays are not mandatory for the private sector, but many companies and most government agencies observe them. In this calculator, you can enable the \"Consider optional points\" option to include them in the calculation when needed.",
                  "Además de los feriados oficiales, existen los puntos facultativos — fechas como Carnaval (que no es feriado nacional por ley) y Miércoles de Ceniza (medio día). Los puntos facultativos no son obligatorios para la iniciativa privada, pero muchas empresas y la mayoría de los organismos públicos los observan. En esta calculadora, puede activar la opción \"Considerar punto facultativo\" para incluirlos en el cálculo cuando sea necesario."
                )}
              </p>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-2xl font-bold">
              {t(
                "Quem mais usa essa ferramenta?",
                "Who uses this tool the most?",
                "¿Quién usa más esta herramienta?"
              )}
            </h3>
            <div className="mt-4 space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                {t(
                  "Profissionais de recursos humanos utilizam a calculadora de dias úteis diariamente para determinar datas de pagamento de salários, calcular prazos de aviso prévio e planejar períodos de férias. A CLT estabelece que o salário deve ser pago até o 5º dia útil do mês subsequente, e um erro nessa contagem pode gerar multas e problemas trabalhistas. Da mesma forma, o aviso prévio proporcional precisa ser contado com precisão para evitar litígios.",
                  "Human resources professionals use the business day calculator daily to determine salary payment dates, calculate notice period deadlines and plan vacation periods. Brazilian labor law (CLT) establishes that salaries must be paid by the 5th business day of the following month, and a mistake in this count can generate fines and labor disputes. Similarly, proportional notice periods need to be counted accurately to avoid litigation.",
                  "Profesionales de recursos humanos utilizan la calculadora de días hábiles diariamente para determinar fechas de pago de salarios, calcular plazos de aviso previo y planificar períodos de vacaciones. La CLT establece que el salario debe pagarse hasta el 5º día hábil del mes siguiente, y un error en ese conteo puede generar multas y problemas laborales. De la misma forma, el aviso previo proporcional necesita ser contado con precisión para evitar litigios."
                )}
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                {t(
                  "Advogados e escritórios de advocacia dependem do cálculo correto de dias úteis para cumprir prazos processuais. Um prazo judicial perdido pode significar a perda de um direito de recurso ou até a extinção de um processo. Contadores e departamentos financeiros também utilizam a ferramenta para calcular vencimentos de impostos, prazos de entrega de declarações fiscais e datas de compensação bancária.",
                  "Lawyers and law firms depend on accurate business day calculations to meet procedural deadlines. A missed court deadline can mean the loss of an appeal right or even the dismissal of a case. Accountants and finance departments also use the tool to calculate tax due dates, fiscal declaration deadlines and bank clearing dates.",
                  "Abogados y oficinas de abogados dependen del cálculo correcto de días hábiles para cumplir plazos procesales. Un plazo judicial perdido puede significar la pérdida de un derecho de recurso o hasta la extinción de un proceso. Contadores y departamentos financieros también utilizan la herramienta para calcular vencimientos de impuestos, plazos de entrega de declaraciones fiscales y fechas de compensación bancaria."
                )}
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                {t(
                  "Profissionais de logística e e-commerce usam a calculadora para estimar prazos de entrega realistas. Quando uma transportadora informa que o prazo é de \"7 dias úteis\", o comprador precisa saber a data real de chegada para se planejar. Além disso, setores como construção civil, administração pública e gestão de projetos dependem dessa contagem para criar cronogramas confiáveis e cumprir obrigações contratuais sem surpresas.",
                  "Logistics and e-commerce professionals use the calculator to estimate realistic delivery deadlines. When a carrier states a delivery time of \"7 business days,\" the buyer needs to know the actual arrival date for planning. Additionally, sectors like construction, public administration and project management depend on this count to create reliable schedules and meet contractual obligations without surprises.",
                  "Profesionales de logística y e-commerce usan la calculadora para estimar plazos de entrega realistas. Cuando una transportadora informa que el plazo es de \"7 días hábiles\", el comprador necesita saber la fecha real de llegada para planificarse. Además, sectores como construcción civil, administración pública y gestión de proyectos dependen de este conteo para crear cronogramas confiables y cumplir obligaciones contractuales sin sorpresas."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="exemplos" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">
            {t(
              "Exemplos práticos de uso",
              "Practical usage examples",
              "Ejemplos prácticos de uso"
            )}
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {t(
              "Veja como aplicar a calculadora de dias úteis em situações reais do dia a dia profissional e pessoal.",
              "See how to apply the business day calculator in real-world professional and personal situations.",
              "Vea cómo aplicar la calculadora de días hábiles en situaciones reales del día a día profesional y personal."
            )}
          </p>

          <div className="mt-8 space-y-6">
            <article className="rounded-3xl bg-secondary p-6">
              <h3 className="text-lg font-bold">
                {t(
                  "Prazo de entrega de produto",
                  "Product delivery deadline",
                  "Plazo de entrega de producto"
                )}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {t(
                  "Você comprou um produto online e a loja informou que o prazo de entrega é de 5 dias úteis. A compra foi feita na sexta-feira. Para descobrir quando o produto chega, use o modo \"Somar dias úteis\", informe a data da compra como data inicial e coloque 5 na quantidade de dias. A calculadora vai pular o sábado e o domingo automaticamente e mostrar que a entrega será na sexta-feira seguinte — desde que não haja feriados no meio. Se houver um feriado na quarta-feira, por exemplo, o prazo se estende para a segunda-feira da semana posterior.",
                  "You bought a product online and the store said the delivery time is 5 business days. The purchase was made on Friday. To find out when the product arrives, use the \"Add business days\" mode, enter the purchase date as the start date and put 5 as the number of days. The calculator will automatically skip Saturday and Sunday and show that delivery will be the following Friday — as long as there are no holidays in between. If there's a holiday on Wednesday, for example, the deadline extends to Monday of the next week.",
                  "Usted compró un producto en línea y la tienda informó que el plazo de entrega es de 5 días hábiles. La compra fue hecha el viernes. Para descubrir cuándo llega el producto, use el modo \"Sumar días hábiles\", informe la fecha de compra como fecha inicial y coloque 5 en la cantidad de días. La calculadora va a saltar el sábado y el domingo automáticamente y mostrar que la entrega será el viernes siguiente — siempre que no haya feriados en el medio. Si hay un feriado el miércoles, por ejemplo, el plazo se extiende al lunes de la semana posterior."
                )}
              </p>
            </article>

            <article className="rounded-3xl bg-secondary p-6">
              <h3 className="text-lg font-bold">
                {t(
                  "Prazo contratual de 30 dias úteis",
                  "30 business day contractual deadline",
                  "Plazo contractual de 30 días hábiles"
                )}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {t(
                  "Um contrato de prestação de serviços determina que a empresa tem 30 dias úteis para entregar o projeto após a assinatura. O contrato foi assinado no dia 3 de março. Usando o modo \"Somar dias úteis\" com a data inicial de 3 de março e 30 dias, a calculadora mostrará a data exata de vencimento, considerando todos os feriados do período (como Carnaval e eventuais feriados estaduais). Isso evita surpresas e permite que ambas as partes tenham clareza sobre o prazo real.",
                  "A service contract determines the company has 30 business days to deliver the project after signing. The contract was signed on March 3rd. Using \"Add business days\" mode with March 3rd as the start date and 30 days, the calculator will show the exact due date, considering all holidays in the period (such as Carnival and any state holidays). This avoids surprises and ensures both parties are clear about the actual deadline.",
                  "Un contrato de prestación de servicios determina que la empresa tiene 30 días hábiles para entregar el proyecto tras la firma. El contrato fue firmado el 3 de marzo. Usando el modo \"Sumar días hábiles\" con la fecha inicial del 3 de marzo y 30 días, la calculadora mostrará la fecha exacta de vencimiento, considerando todos los feriados del período (como Carnaval y eventuales feriados estatales). Esto evita sorpresas y permite que ambas partes tengan claridad sobre el plazo real."
                )}
              </p>
            </article>

            <article className="rounded-3xl bg-secondary p-6">
              <h3 className="text-lg font-bold">
                {t(
                  "Pagamento de salário no 5º dia útil",
                  "Salary payment on the 5th business day",
                  "Pago de salario en el 5º día hábil"
                )}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {t(
                  "A legislação trabalhista brasileira (CLT, art. 459) determina que o salário deve ser pago até o 5º dia útil do mês subsequente ao trabalhado. Para descobrir essa data, use o modo \"Somar dias úteis\" com o último dia do mês anterior como data inicial e 5 dias. Por exemplo, para o salário de janeiro, informe 31 de janeiro como data inicial. Se fevereiro começar com feriados municipais ou se o dia 1º cair em um sábado, a data do 5º dia útil pode mudar significativamente. O filtro de município garante que feriados locais sejam considerados no cálculo.",
                  "Brazilian labor law (CLT, art. 459) determines that salaries must be paid by the 5th business day of the month following the work period. To find this date, use \"Add business days\" mode with the last day of the previous month as the start date and 5 days. For example, for January's salary, enter January 31st as the start date. If February starts with municipal holidays or if the 1st falls on a Saturday, the 5th business day date can change significantly. The municipality filter ensures local holidays are considered in the calculation.",
                  "La legislación laboral brasileña (CLT, art. 459) determina que el salario debe pagarse hasta el 5º día hábil del mes siguiente al trabajado. Para descubrir esa fecha, use el modo \"Sumar días hábiles\" con el último día del mes anterior como fecha inicial y 5 días. Por ejemplo, para el salario de enero, informe el 31 de enero como fecha inicial. Si febrero comienza con feriados municipales o si el día 1º cae en sábado, la fecha del 5º día hábil puede cambiar significativamente. El filtro de municipio garantiza que los feriados locales se consideren en el cálculo."
                )}
              </p>
            </article>

            <article className="rounded-3xl bg-secondary p-6">
              <h3 className="text-lg font-bold">
                {t(
                  "Prazo judicial de 15 dias úteis para recurso",
                  "15 business day judicial deadline for appeal",
                  "Plazo judicial de 15 días hábiles para recurso"
                )}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {t(
                  "Um advogado recebeu a intimação de uma decisão desfavorável na terça-feira e precisa interpor recurso de apelação dentro de 15 dias úteis (CPC, art. 1.003). De acordo com a regra processual, o prazo começa a contar no primeiro dia útil seguinte à intimação. Use o modo \"Somar dias úteis\" informando a data da intimação como data inicial e 15 como quantidade de dias. A calculadora irá pular automaticamente sábados, domingos e feriados, mostrando a data final do prazo. Se houver um feriado forense ou suspensão de expediente no período, lembre-se de que esses dias também não contam como úteis para prazos judiciais.",
                  "A lawyer received notification of an unfavorable decision on Tuesday and needs to file an appeal within 15 business days (CPC, art. 1,003). According to procedural rules, the deadline starts on the first business day after notification. Use \"Add business days\" mode with the notification date as the start date and 15 as the number of days. The calculator will automatically skip Saturdays, Sundays and holidays, showing the final deadline date. If there's a court holiday or suspension of operations during the period, remember that those days also don't count as business days for judicial deadlines.",
                  "Un abogado recibió la intimación de una decisión desfavorable el martes y necesita interponer recurso de apelación dentro de 15 días hábiles (CPC, art. 1.003). De acuerdo con la regla procesal, el plazo comienza a contar en el primer día hábil siguiente a la intimación. Use el modo \"Sumar días hábiles\" informando la fecha de la intimación como fecha inicial y 15 como cantidad de días. La calculadora saltará automáticamente sábados, domingos y feriados, mostrando la fecha final del plazo. Si hay un feriado forense o suspensión de expediente en el período, recuerde que esos días tampoco cuentan como hábiles para plazos judiciales."
                )}
              </p>
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
