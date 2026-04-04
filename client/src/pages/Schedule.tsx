import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import LocalizedTimeInput from "@/components/age/LocalizedTimeInput";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import CoreNavigationBlock from "@/components/layout/CoreNavigationBlock";
import CtaFinalBlock from "@/components/layout/CtaFinalBlock";
import FloatingSectionNav from "@/components/layout/FloatingSectionNav";
import PageIntroNavigation from "@/components/layout/PageIntroNavigation";
import { trackAnalyticsEvent } from "@/lib/analytics";
import {
  buildNationalHolidayMonthSnapshot,
  fetchHolidayMonthSnapshot,
  type HolidayCalculationWarning,
} from "@/lib/holiday-service";
import { buildBreadcrumbSchema, buildFaqPageSchema, getNavigationLabels } from "@/lib/navigation";
import { useI18n } from "@/contexts/LanguageContext";
import { getBackToTopLabel, getToolPageNavItems } from "@/lib/page-sections";
import {
  SCALE_OPTIONS,
  getDefaultScheduleInput,
  simulateScheduleScenario,
  type ScheduleHolidayContext,
  type ScheduleFormInput,
  type ScheduleSimulationResult,
} from "@/lib/schedule-simulator";
import { usePageSeo } from "@/lib/seo";

function statusUi(
  code: string,
  labels: { standard: string; alert: string; incompatible: string }
) {
  if (code === "standard") {
    return {
      label: labels.standard,
      className: "bg-emerald-100 text-emerald-700",
    };
  }
  if (code === "below_reference" || code === "above_reference") {
    return { label: labels.alert, className: "bg-amber-100 text-amber-700" };
  }
  return { label: labels.incompatible, className: "bg-rose-100 text-rose-700" };
}

function formatHours(value: number, locale: string, unit: string) {
  return `${value.toLocaleString(locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: Math.abs(value % 1) > 0.001 ? 1 : 0,
  })} ${unit}`;
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className={`rounded-2xl p-5 ${tone ?? "bg-secondary"}`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function getHolidayWarningMessage(
  language: string,
  warning: HolidayCalculationWarning
) {
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

function buildHolidayContextSnapshot(year: number, month: number) {
  const snapshot = buildNationalHolidayMonthSnapshot({ year, month });

  return {
    count: snapshot.holidayDays,
    set: new Set(snapshot.holidays.map(item => item.date)),
  } satisfies ScheduleHolidayContext;
}

function getInitialScheduleState() {
  const form = getDefaultScheduleInput();
  const result = simulateScheduleScenario(
    form,
    buildHolidayContextSnapshot(form.year, form.month)
  );

  return {
    form,
    result,
    hoursInput: String(result.userBlock.consideredHours),
  };
}

export default function Schedule() {
  const initialState = useMemo(() => getInitialScheduleState(), []);
  const [form, setForm] = useState<ScheduleFormInput>(initialState.form);
  const [result, setResult] = useState<ScheduleSimulationResult | null>(
    initialState.result
  );
  const [holidayWarnings, setHolidayWarnings] = useState<
    HolidayCalculationWarning[]
  >([]);
  const [holidayLoading, setHolidayLoading] = useState(false);
  const [hoursInput, setHoursInput] = useState(initialState.hoursInput);
  const { language, t, tm, dateLocale } = useI18n();
  const navigationLabels = getNavigationLabels(language);
  const navItems = getToolPageNavItems(language);
  const topLabel = getBackToTopLabel(language);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.simulators },
    { label: navigationLabels.workSchedules },
  ];
  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const label = new Intl.DateTimeFormat(dateLocale, {
          month: "long",
        }).format(new Date(form.year, index, 1));
        return {
          value: index + 1,
          label: label.charAt(0).toUpperCase() + label.slice(1),
        };
      }),
    [dateLocale, form.year]
  );
  const weekdayLabels = tm<string[]>("pages.schedule.weekdayLabels");
  const hoursUnit = t("pages.schedule.hoursUnit");
  const statusLabels = {
    standard: t("pages.schedule.statusStandard"),
    alert: t("pages.schedule.statusAlert"),
    incompatible: t("pages.schedule.statusIncompatible"),
  };
  const timeFormatHint =
    language === "en"
      ? "24-hour format"
      : language === "es"
        ? "Formato de 24 horas"
        : "Formato 24 horas";
  const timePickerLabel =
    language === "en"
      ? "Open time picker"
      : language === "es"
        ? "Abrir selector de hora"
        : "Abrir seletor de hora";
  const timePanelLabels =
    language === "en"
      ? {
          hour: "Hour",
          minute: "Minute",
          apply: "Apply",
          close: "Close",
        }
      : language === "es"
        ? {
            hour: "Hora",
            minute: "Minuto",
            apply: "Aplicar",
            close: "Cerrar",
          }
        : {
            hour: "Hora",
            minute: "Minuto",
            apply: "Aplicar",
            close: "Fechar",
          };
  const faqItems = [
    {
      question:
        language === "en"
          ? "Does the simulator replace legal review?"
          : language === "es"
            ? "¿El simulador sustituye una revisión legal?"
            : "O simulador substitui uma revisão legal?",
      answer:
        language === "en"
          ? "No. It helps compare scenarios and coverage, but formal legal validation depends on the real operation."
          : language === "es"
            ? "No. Ayuda a comparar escenarios y cobertura, pero la validación formal depende de la operación real."
            : "Não. Ele ajuda a comparar cenários e cobertura, mas a validação formal depende da operação real.",
    },
    {
      question:
        language === "en"
          ? "Can I test different hours per employee?"
          : language === "es"
            ? "¿Puedo probar jornadas diferentes por colaborador?"
            : "Posso testar cargas diferentes por colaborador?",
      answer:
        language === "en"
          ? "Yes. The adjustment area lets you change the considered hours and run the simulation again."
          : language === "es"
            ? "Sí. El bloque de ajuste permite cambiar la carga considerada y volver a simular."
            : "Sim. O bloco de ajuste permite alterar a carga considerada e rodar a simulação novamente.",
    },
    {
      question:
        language === "en"
          ? "Which schedules can I compare here?"
          : language === "es"
            ? "¿Qué escalas puedo comparar aquí?"
            : "Quais escalas posso comparar aqui?",
      answer:
        language === "en"
          ? "The simulator helps compare common arrangements such as 5x2, 6x1 and 12x36 before applying them to a real operation."
          : language === "es"
            ? "El simulador ayuda a comparar arreglos comunes como 5x2, 6x1 y 12x36 antes de llevarlos a una operación real."
            : "O simulador ajuda a comparar arranjos comuns como 5x2, 6x1 e 12x36 antes de levar isso para uma operação real.",
    },
    {
      question:
        language === "en"
          ? "What is the minimum headcount (quadro mínimo)?"
          : language === "es"
            ? "¿Qué es el cuadro mínimo?"
            : "O que é o quadro mínimo?",
      answer:
        language === "en"
          ? "The minimum headcount is the smallest number of employees needed to maintain the required number of simultaneous posts covered every operating day of the month, considering the selected schedule model, rest days, and holidays. It accounts for the rotation pattern so that no post is left uncovered."
          : language === "es"
            ? "El cuadro mínimo es la menor cantidad de empleados necesarios para mantener los puestos simultáneos cubiertos todos los días de operación del mes, considerando el modelo de escala seleccionado, días de descanso y feriados. Tiene en cuenta el patrón de rotación para que ningún puesto quede descubierto."
            : "O quadro mínimo é a menor quantidade de colaboradores necessários para manter os postos simultâneos cobertos em todos os dias de operação do mês, considerando o modelo de escala selecionado, dias de folga e feriados. Ele leva em conta o padrão de revezamento para que nenhum posto fique descoberto.",
    },
    {
      question:
        language === "en"
          ? "Is the 12x36 schedule legal?"
          : language === "es"
            ? "¿La escala 12x36 es legal?"
            : "A escala 12x36 é legal?",
      answer:
        language === "en"
          ? "Yes. The 12x36 schedule is expressly permitted by Article 59-A of the CLT, introduced by the 2017 Labor Reform (Law 13.467/2017). It can be established through an individual written agreement between employer and employee, or through a collective bargaining agreement. The employee works 12 consecutive hours and rests for the following 36 hours. Breaks and meal periods during the 12-hour shift may be compensated financially (indenized) rather than taken as actual rest, depending on the agreement."
          : language === "es"
            ? "Sí. La escala 12x36 está expresamente permitida por el Artículo 59-A de la CLT, introducido por la Reforma Laboral de 2017 (Ley 13.467/2017). Puede establecerse mediante acuerdo individual escrito entre empleador y empleado, o mediante convenio colectivo. El empleado trabaja 12 horas consecutivas y descansa las 36 horas siguientes. Los intervalos y períodos de comida durante el turno de 12 horas pueden ser compensados financieramente (indemnizados) en lugar de tomarse como descanso efectivo, dependiendo del acuerdo."
            : "Sim. A escala 12x36 é expressamente permitida pelo Artigo 59-A da CLT, introduzido pela Reforma Trabalhista de 2017 (Lei 13.467/2017). Ela pode ser estabelecida por acordo individual escrito entre empregador e empregado, ou por convenção coletiva. O colaborador trabalha 12 horas consecutivas e descansa nas 36 horas seguintes. Os intervalos intrajornada durante o turno de 12 horas podem ser indenizados (pagos em dinheiro) em vez de usufruídos como descanso efetivo, conforme o acordo firmado.",
    },
    {
      question:
        language === "en"
          ? "How does the day off work in the 6x1 schedule?"
          : language === "es"
            ? "¿Cómo funciona la folga en la escala 6x1?"
            : "Como funciona a folga na escala 6x1?",
      answer:
        language === "en"
          ? "In the 6x1 model, the employee works 6 consecutive days and rests on the 7th. The rest day rotates throughout the month, so it does not always fall on a Sunday. However, Brazilian law requires that the weekly paid rest (DSR) coincide with a Sunday at least once every 7 weeks for commercial establishments, or as defined by collective agreements for other sectors. The employer must organize the rotation so that all employees periodically rest on Sundays."
          : language === "es"
            ? "En el modelo 6x1, el empleado trabaja 6 días consecutivos y descansa el 7°. El día de descanso rota a lo largo del mes, por lo que no siempre cae en domingo. Sin embargo, la ley brasileña exige que el descanso semanal remunerado (DSR) coincida con un domingo al menos una vez cada 7 semanas para establecimientos comerciales, o según lo definido por convenios colectivos para otros sectores. El empleador debe organizar la rotación para que todos los empleados descansen periódicamente en domingo."
            : "No modelo 6x1, o colaborador trabalha 6 dias consecutivos e folga no 7º. O dia de folga reveza ao longo do mês, portanto nem sempre cai no domingo. Porém, a legislação brasileira exige que o descanso semanal remunerado (DSR) coincida com um domingo pelo menos uma vez a cada 7 semanas para estabelecimentos comerciais, ou conforme definido por convenção coletiva para outros setores. O empregador deve organizar o revezamento para que todos os colaboradores folguem periodicamente aos domingos.",
    },
    {
      question:
        language === "en"
          ? "Do I need to pay overtime in the 12x36 schedule?"
          : language === "es"
            ? "¿Necesito pagar horas extras en la escala 12x36?"
            : "Preciso pagar hora extra na escala 12x36?",
      answer:
        language === "en"
          ? "Under the standard 12x36 arrangement, the hours within the 12-hour shift are not considered overtime because the extended rest of 36 hours compensates for the longer workday. However, if an employee works during their 36-hour rest period, those hours are considered overtime and must be paid at the applicable premium (at least 50%, or 100% on Sundays and holidays). Working on holidays in the 12x36 model is generally considered part of the normal schedule and already compensated by the rest period, but collective agreements may establish additional payments."
          : language === "es"
            ? "Bajo el régimen estándar 12x36, las horas dentro del turno de 12 horas no se consideran horas extras porque el descanso extendido de 36 horas compensa la jornada más larga. Sin embargo, si un empleado trabaja durante su período de descanso de 36 horas, esas horas se consideran extras y deben pagarse con el adicional aplicable (al menos 50%, o 100% en domingos y feriados). Trabajar en feriados en el modelo 12x36 generalmente se considera parte de la escala normal y ya está compensado por el descanso, pero convenios colectivos pueden establecer pagos adicionales."
            : "No regime padrão 12x36, as horas dentro do turno de 12 horas não são consideradas hora extra porque o descanso estendido de 36 horas compensa a jornada mais longa. Porém, se o colaborador trabalhar durante seu período de descanso de 36 horas, essas horas são consideradas extras e devem ser pagas com o adicional aplicável (mínimo de 50%, ou 100% em domingos e feriados). Trabalhar em feriados no modelo 12x36 geralmente é considerado parte da escala normal e já está compensado pelo descanso, mas convenções coletivas podem estabelecer pagamentos adicionais.",
    },
    {
      question:
        language === "en"
          ? "Does the simulator consider holidays?"
          : language === "es"
            ? "¿El simulador considera los feriados?"
            : "O simulador considera feriados?",
      answer:
        language === "en"
          ? "Yes. The simulator automatically loads the national holiday calendar for the selected month and year. Holidays affect the total operating days and are reflected in the monthly calendar view, where holiday days that coincide with operating days are highlighted. If the 'works on holidays' option is enabled, the simulator includes those days in the coverage calculation; otherwise, they are treated as non-operating days. Note that only national holidays are included by default; state and municipal holidays may not be available for all years."
          : language === "es"
            ? "Sí. El simulador carga automáticamente el calendario de feriados nacionales para el mes y año seleccionados. Los feriados afectan el total de días operativos y se reflejan en la vista de calendario mensual, donde los feriados que coinciden con días de operación se destacan. Si la opción 'trabaja en feriados' está habilitada, el simulador incluye esos días en el cálculo de cobertura; de lo contrario, se tratan como días no operativos. Solo se incluyen feriados nacionales por defecto; los feriados estatales y municipales pueden no estar disponibles para todos los años."
            : "Sim. O simulador carrega automaticamente o calendário de feriados nacionais para o mês e ano selecionados. Os feriados afetam o total de dias operacionais e são refletidos na visualização do calendário mensal, onde os feriados que coincidem com dias de operação são destacados. Se a opção 'trabalha em feriados' estiver habilitada, o simulador inclui esses dias no cálculo de cobertura; caso contrário, são tratados como dias não operacionais. Apenas feriados nacionais são incluídos por padrão; feriados estaduais e municipais podem não estar disponíveis para todos os anos.",
    },
    {
      question:
        language === "en"
          ? "Can I use this to plan a real schedule?"
          : language === "es"
            ? "¿Puedo usar esto para planificar una escala real?"
            : "Posso usar para planejar escala real?",
      answer:
        language === "en"
          ? "The simulator is designed as a planning and comparison tool. It gives you a solid starting point by calculating the minimum headcount, expected monthly hours, and coverage distribution across the month. However, a real schedule also depends on factors the simulator does not cover, such as individual employee availability, vacation periods, sick leave, collective bargaining rules specific to your industry, and local municipal holidays. Use the simulator's output as a quantitative foundation, then adjust based on your operational reality and legal counsel."
          : language === "es"
            ? "El simulador está diseñado como una herramienta de planificación y comparación. Le da un punto de partida sólido al calcular el cuadro mínimo, las horas mensuales esperadas y la distribución de cobertura a lo largo del mes. Sin embargo, una escala real también depende de factores que el simulador no cubre, como la disponibilidad individual de los empleados, períodos de vacaciones, licencias médicas, reglas de convenios colectivos específicas de su sector y feriados municipales locales. Use la salida del simulador como base cuantitativa y luego ajuste según su realidad operativa y asesoría legal."
            : "O simulador é projetado como ferramenta de planejamento e comparação. Ele fornece um ponto de partida sólido ao calcular o quadro mínimo, as horas mensais esperadas e a distribuição de cobertura ao longo do mês. No entanto, uma escala real também depende de fatores que o simulador não cobre, como disponibilidade individual dos colaboradores, períodos de férias, licenças médicas, regras de convenções coletivas específicas do seu setor e feriados municipais locais. Use a saída do simulador como base quantitativa e depois ajuste conforme sua realidade operacional e orientação jurídica.",
    },
  ];

  const appliedHolidayBaseLabel =
    language === "en"
      ? "National holidays"
      : language === "es"
        ? "Feriados nacionales"
        : "Feriados nacionais";

  usePageSeo({
    title: t("pages.schedule.seoTitle"),
    description: t("pages.schedule.seoDescription"),
    path: "/escala/",
    keywords: [
      "simulador de escala",
      "12x36",
      "6x1",
      "quadro mínimo",
      "escala de trabalho",
    ],
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          name: "Simulador de Escalas de Trabalho",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: "https://datasuteis.com.br/escala/",
        },
        {
          ...buildBreadcrumbSchema([
            { label: navigationLabels.home, href: "/" },
            { label: navigationLabels.simulators },
            {
              label: navigationLabels.workSchedules,
              href: "/escala/",
            },
          ]),
        },
        buildFaqPageSchema(faqItems),
      ],
    },
  });

  useEffect(() => {
    setForm(current => {
      const shifts = current.shifts.slice(0, current.shiftCount);
      while (shifts.length < current.shiftCount) {
        shifts.push(
          shifts[shifts.length - 1] ?? {
            start: current.operationStart,
            end: current.operationEnd,
          }
        );
      }
      return { ...current, shifts };
    });
  }, [form.shiftCount, form.operationStart, form.operationEnd]);

  async function loadHolidayContext(nextForm: ScheduleFormInput) {
    const snapshot = await fetchHolidayMonthSnapshot({
      year: nextForm.year,
      month: nextForm.month,
      includeOptionalPoints: false,
    });

    setHolidayWarnings(snapshot.warnings);
    return {
      count: snapshot.holidayDays,
      set: new Set(snapshot.holidays.map(item => item.date)),
    } satisfies ScheduleHolidayContext;
  }

  useEffect(() => {
    let cancelled = false;
    const fallbackContext = buildHolidayContextSnapshot(form.year, form.month);
    const fallbackResult = simulateScheduleScenario(form, fallbackContext);

    setResult(fallbackResult);
    setHoursInput(String(fallbackResult.userBlock.consideredHours));
    setHolidayWarnings([]);
    setHolidayLoading(true);

    void loadHolidayContext(form)
      .then(context => {
        if (cancelled) {
          return;
        }

        const initialResult = simulateScheduleScenario(form, context);
        setResult(initialResult);
        setHoursInput(String(initialResult.userBlock.consideredHours));
      })
      .catch(() => {
        if (!cancelled) {
          setHolidayWarnings([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHolidayLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [form.month, form.year]);

  const selectedScaleMeta = useMemo(
    () => SCALE_OPTIONS.find(option => option.id === form.scaleChoice),
    [form.scaleChoice]
  );

  const runSimulation = async (nextForm = form) => {
    const fallbackContext = buildHolidayContextSnapshot(
      nextForm.year,
      nextForm.month
    );
    const fallbackResult = simulateScheduleScenario(nextForm, fallbackContext);

    setResult(fallbackResult);
    setHoursInput(String(fallbackResult.userBlock.consideredHours));
    setHolidayWarnings([]);
    setHolidayLoading(true);

    try {
      const holidayContext = await loadHolidayContext(nextForm);
      const nextResult = simulateScheduleScenario(nextForm, holidayContext);
      setResult(nextResult);
      setHoursInput(String(nextResult.userBlock.consideredHours));
      trackAnalyticsEvent("tool_calculation", {
        tool_name: "schedule_simulator",
        scale_choice: nextForm.scaleChoice,
        shift_count: nextForm.shiftCount,
        simultaneous_posts: nextForm.postos,
        month: nextForm.month,
        year: nextForm.year,
      });
    } catch {
      setHolidayWarnings([]);
    } finally {
      setHolidayLoading(false);
    }
  };

  const firstDayOffset = result
    ? new Date(form.year, form.month - 1, 1).getDay()
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" role="main">
        <section className="hero border-b border-border bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="hero-title text-primary">{t("scale_title")}</h1>
            <p className="hero-subtitle mt-6">{t("scale_page_subtitle")}</p>
          </div>
        </section>

        <FloatingSectionNav items={navItems} topLabel={topLabel} />

        <section className="section-md">
          <div className="container mx-auto page-stack">
            <section id="ferramenta" className="section-anchor">
              <PageIntroNavigation
                breadcrumbs={breadcrumbs}
                breadcrumbAriaLabel={navigationLabels.breadcrumb}
                backLabel={navigationLabels.back}
                backAriaLabel={navigationLabels.backAria}
              />

              <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
                <aside className="space-y-6">
                  <div className="card-base p-6">
                    <p className="text-sm leading-6 text-muted-foreground">
                      {language === "en"
                        ? "Set the month, work model and coverage target to compare staffing scenarios before closing a real schedule."
                        : language === "es"
                          ? "Defina mes, modelo de jornada y meta de cobertura para comparar escenarios antes de cerrar una escala real."
                          : "Defina mês, modelo de jornada e meta de cobertura para comparar cenários antes de fechar uma escala real."}
                    </p>
                    <h2 className="text-xl font-bold">
                      {t("scale_params_title")}
                    </h2>
                    <div className="mt-6 space-y-5">
                      <label className="block space-y-2">
                        <span className="text-sm font-semibold">
                          {t("scale_month")}
                        </span>
                        <select
                          value={String(form.month)}
                          onChange={event =>
                            setForm({
                              ...form,
                              month: Number(event.target.value),
                            })
                          }
                          className="input-base w-full"
                        >
                          {monthOptions.map(month => (
                            <option key={month.value} value={month.value}>
                              {month.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block space-y-2">
                        <span className="text-sm font-semibold">
                          {language === "en"
                            ? "Year"
                            : language === "es"
                              ? "Año"
                              : "Ano"}
                        </span>
                        <input
                          type="number"
                          min={1900}
                          max={2100}
                          value={form.year}
                          onChange={event =>
                            setForm({
                              ...form,
                              year: Math.min(
                                2100,
                                Math.max(
                                  1900,
                                  Number(event.target.value) || form.year
                                )
                              ),
                            })
                          }
                          className="input-base w-full"
                        />
                      </label>

                      <label className="block space-y-2">
                        <span className="text-sm font-semibold">
                          {t("scale_type")}
                        </span>
                        <select
                          value={form.scaleChoice}
                          onChange={event =>
                            setForm({
                              ...form,
                              scaleChoice: event.target
                                .value as ScheduleFormInput["scaleChoice"],
                            })
                          }
                          className="input-base w-full"
                        >
                          <option value="auto">
                            {t("pages.schedule.autoSuggested")}
                          </option>
                          {SCALE_OPTIONS.map(option => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block space-y-2">
                        <span className="text-sm font-semibold">
                          {t("pages.schedule.simultaneousPosts")}
                        </span>
                        <input
                          type="number"
                          min={1}
                          value={form.postos}
                          onChange={event =>
                            setForm({
                              ...form,
                              postos: Math.max(
                                1,
                                Number(event.target.value) || 1
                              ),
                            })
                          }
                          className="input-base w-full"
                        />
                      </label>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <LocalizedTimeInput
                          label={t("pages.schedule.operationStart")}
                          value={form.operationStart}
                          placeholderLabel={timeFormatHint}
                          pickerLabel={timePickerLabel}
                          hourLabel={timePanelLabels.hour}
                          minuteLabel={timePanelLabels.minute}
                          applyLabel={timePanelLabels.apply}
                          closeLabel={timePanelLabels.close}
                          onChange={nextValue =>
                            setForm({
                              ...form,
                              operationStart: nextValue,
                            })
                          }
                        />
                        <LocalizedTimeInput
                          label={t("pages.schedule.operationEnd")}
                          value={form.operationEnd}
                          placeholderLabel={timeFormatHint}
                          pickerLabel={timePickerLabel}
                          hourLabel={timePanelLabels.hour}
                          minuteLabel={timePanelLabels.minute}
                          applyLabel={timePanelLabels.apply}
                          closeLabel={timePanelLabels.close}
                          onChange={nextValue =>
                            setForm({
                              ...form,
                              operationEnd: nextValue,
                            })
                          }
                        />
                      </div>

                      <label className="block space-y-2">
                        <span className="text-sm font-semibold">
                          {t("pages.schedule.shiftCount")}
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={4}
                          value={form.shiftCount}
                          onChange={event =>
                            setForm({
                              ...form,
                              shiftCount: Math.min(
                                4,
                                Math.max(1, Number(event.target.value) || 1)
                              ),
                            })
                          }
                          className="input-base w-full"
                        />
                      </label>

                      <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-border px-4 py-3">
                        <span className="text-sm font-semibold">
                          {t("pages.schedule.shiftOverlap")}
                        </span>
                        <input
                          type="checkbox"
                          className="flex-shrink-0"
                          checked={form.hasOverlap}
                          onChange={event =>
                            setForm({
                              ...form,
                              hasOverlap: event.target.checked,
                            })
                          }
                        />
                      </label>

                      {form.hasOverlap ? (
                        <div className="space-y-3 rounded-2xl border border-border p-4">
                          {form.shifts.map((shift, index) => (
                            <div
                              key={`${index}-${shift.start}-${shift.end}`}
                              className="grid gap-3 sm:grid-cols-2"
                            >
                              <LocalizedTimeInput
                                label={t("pages.schedule.shiftStart", {
                                  index: index + 1,
                                })}
                                value={shift.start}
                                placeholderLabel={timeFormatHint}
                                pickerLabel={timePickerLabel}
                                hourLabel={timePanelLabels.hour}
                                minuteLabel={timePanelLabels.minute}
                                applyLabel={timePanelLabels.apply}
                                closeLabel={timePanelLabels.close}
                                onChange={nextValue =>
                                  setForm({
                                    ...form,
                                    shifts: form.shifts.map(
                                      (item, itemIndex) =>
                                        itemIndex === index
                                          ? {
                                              ...item,
                                              start: nextValue,
                                            }
                                          : item
                                    ),
                                  })
                                }
                              />
                              <LocalizedTimeInput
                                label={t("pages.schedule.shiftEnd", {
                                  index: index + 1,
                                })}
                                value={shift.end}
                                placeholderLabel={timeFormatHint}
                                pickerLabel={timePickerLabel}
                                hourLabel={timePanelLabels.hour}
                                minuteLabel={timePanelLabels.minute}
                                applyLabel={timePanelLabels.apply}
                                closeLabel={timePanelLabels.close}
                                onChange={nextValue =>
                                  setForm({
                                    ...form,
                                    shifts: form.shifts.map(
                                      (item, itemIndex) =>
                                        itemIndex === index
                                          ? {
                                              ...item,
                                              end: nextValue,
                                            }
                                          : item
                                    ),
                                  })
                                }
                              />
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="grid gap-3 sm:grid-cols-3">
                        <label className="cursor-pointer rounded-2xl border border-border px-4 py-3 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span>{t("pages.schedule.saturday")}</span>
                            <input
                              type="checkbox"
                              className="flex-shrink-0"
                              checked={form.worksSaturday}
                              onChange={event =>
                                setForm({
                                  ...form,
                                  worksSaturday: event.target.checked,
                                })
                              }
                            />
                          </div>
                        </label>
                        <label className="cursor-pointer rounded-2xl border border-border px-4 py-3 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span>{t("pages.schedule.sunday")}</span>
                            <input
                              type="checkbox"
                              className="flex-shrink-0"
                              checked={form.worksSunday}
                              onChange={event =>
                                setForm({
                                  ...form,
                                  worksSunday: event.target.checked,
                                })
                              }
                            />
                          </div>
                        </label>
                        <label className="cursor-pointer rounded-2xl border border-border px-4 py-3 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span>{t("pages.schedule.holidays")}</span>
                            <input
                              type="checkbox"
                              className="flex-shrink-0"
                              checked={form.worksHolidays}
                              onChange={event =>
                                setForm({
                                  ...form,
                                  worksHolidays: event.target.checked,
                                })
                              }
                            />
                          </div>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => void runSimulation()}
                        className="btn-primary w-full"
                        disabled={holidayLoading}
                      >
                        {holidayLoading
                          ? language === "en"
                            ? "Updating..."
                            : language === "es"
                              ? "Actualizando..."
                              : "Atualizando..."
                          : t("scale_generate_btn")}
                      </button>

                      {holidayWarnings.length ? (
                        <div className="space-y-2">
                          {holidayWarnings.map(warning => (
                            <div
                              key={`${warning.code}-${warning.year}-${warning.municipalityCode ?? ""}`}
                              className="warning-banner"
                            >
                              {getHolidayWarningMessage(language, warning)}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <AdSlot id="ads-schedule-content" minHeight={100} format="auto" />
                </aside>

                <div className="space-y-6">
                  {holidayLoading && result ? (
                    <div className="card-base p-4 text-sm text-muted-foreground">
                      {language === "en"
                        ? "Updating the holiday base and recalculating the schedule."
                        : language === "es"
                          ? "Actualizando la base de feriados y recalculando la escala."
                          : "Atualizando a base de feriados e recalculando a escala."}
                    </div>
                  ) : null}

                  {result ? (
                    <>
                      <section className="card-base max-w-3xl p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {t("pages.schedule.resultEyebrow")}
                            </p>
                            <h2 className="mt-2 text-2xl font-bold">
                              {t("scale_result_title")}
                            </h2>
                            <p className="mt-3 text-sm text-muted-foreground">
                              {result.scenarioSummary.operationWindowLabel} •{" "}
                              {t("pages.schedule.postsSummary", {
                                count:
                                  result.scenarioSummary.simultaneousPeople,
                              })}{" "}
                              •{" "}
                              {t("pages.schedule.shiftsSummary", {
                                count: result.scenarioSummary.shiftCount,
                              })}{" "}
                              • {t("pages.schedule.saturday")}:{" "}
                              {form.worksSaturday
                                ? t("common.yes")
                                : t("common.no")}{" "}
                              • {t("pages.schedule.sunday")}:{" "}
                              {form.worksSunday
                                ? t("common.yes")
                                : t("common.no")}{" "}
                              • {t("pages.schedule.holidays")}:{" "}
                              {form.worksHolidays
                                ? t("common.yes")
                                : t("common.no")}
                            </p>
                          </div>

                          <div
                            className={`rounded-full px-4 py-2 text-sm font-semibold ${statusUi(result.userBlock.status.code, statusLabels).className}`}
                          >
                            {
                              statusUi(
                                result.userBlock.status.code,
                                statusLabels
                              ).label
                            }
                          </div>
                        </div>

                        <div className="mt-6 grid gap-4 xl:grid-cols-5 md:grid-cols-2">
                          <MetricCard
                            label={t("pages.schedule.suggestedScale")}
                            value={result.suggestedScale.label}
                            tone="bg-primary/10"
                          />
                          <MetricCard
                            label={t("pages.schedule.simulatedScale")}
                            value={result.selectedScale.label}
                          />
                          <MetricCard
                            label={t("pages.schedule.minimumHeadcount")}
                            value={String(
                              result.userBlock.coveragePlan
                                .colaboradoresNecessarios
                            )}
                            tone="bg-accent/10"
                          />
                          <MetricCard
                            label={t("pages.schedule.hoursPerEmployee")}
                            value={formatHours(
                              result.userBlock.consideredHours,
                              dateLocale,
                              hoursUnit
                            )}
                          />
                          <MetricCard
                            label={t("pages.schedule.coverage")}
                            value={`${result.userBlock.coberturaPercentual}%`}
                            tone="bg-secondary"
                          />
                        </div>

                        <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                          <p>
                            {t(
                              `pages.schedule.hoursComparison.${result.userBlock.hoursComparison.code}`,
                              {
                                reference: formatHours(
                                  result.userBlock.automaticHoursReference,
                                  dateLocale,
                                  hoursUnit
                                ),
                                considered: formatHours(
                                  result.userBlock.consideredHours,
                                  dateLocale,
                                  hoursUnit
                                ),
                              }
                            )}
                          </p>
                          <p>
                            {result.holidayCount > 0
                              ? t("pages.schedule.holidaySummary.withCount", {
                                  count: result.holidayCount,
                                })
                              : t("pages.schedule.holidaySummary.none")}
                          </p>
                          <p>
                            {language === "en"
                              ? `Applied base: ${appliedHolidayBaseLabel}`
                              : language === "es"
                                ? `Base aplicada: ${appliedHolidayBaseLabel}`
                                : `Base aplicada: ${appliedHolidayBaseLabel}`}
                          </p>
                          {selectedScaleMeta &&
                          form.scaleChoice !== "auto" &&
                          !result.selectedIsSuggested ? (
                            <p>
                              {t("pages.schedule.selectedVsSuggested", {
                                selected: selectedScaleMeta.label,
                                suggested: result.suggestedScale.label,
                              })}
                            </p>
                          ) : null}
                        </div>

                        {result.alternatives.length ? (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {result.alternatives.map(option => (
                              <span
                                key={option.id}
                                className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground"
                              >
                                {option.label} •{" "}
                                {option.tagCode === "compatible"
                                  ? t("pages.schedule.alternativeCompatible")
                                  : t("pages.schedule.alternativeWarning")}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </section>

                      <section className="card-base p-6">
                        <h2 className="text-xl font-bold">
                          {language === "en"
                            ? "How to read the simulation"
                            : language === "es"
                              ? "Cómo leer la simulación"
                              : "Como ler a simulação"}
                        </h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                          <article className="rounded-2xl bg-secondary p-4 text-sm leading-6 text-muted-foreground">
                            {language === "en"
                              ? "Start with the suggested scale and minimum headcount to understand the baseline monthly coverage."
                              : language === "es"
                                ? "Empiece por la escala sugerida y el cuadro mínimo para entender la cobertura base del mes."
                                : "Comece pela escala sugerida e pelo quadro mínimo para entender a cobertura base do mês."}
                          </article>
                          <article className="rounded-2xl bg-secondary p-4 text-sm leading-6 text-muted-foreground">
                            {language === "en"
                              ? "The monthly calendar shows where the operation becomes tighter, especially on weekends and holidays."
                              : language === "es"
                                ? "El calendario mensual muestra dónde la operación queda más ajustada, especialmente en fines de semana y feriados."
                                : "O calendário mensal mostra onde a operação fica mais apertada, principalmente em finais de semana e feriados."}
                          </article>
                          <article className="rounded-2xl bg-secondary p-4 text-sm leading-6 text-muted-foreground">
                            {language === "en"
                              ? "Use the adjustment block to compare a 12x36, 6x1 or custom model before changing the team roster."
                              : language === "es"
                                ? "Use el ajuste para comparar un 12x36, 6x1 u otro modelo antes de cambiar la escala del equipo."
                                : "Use o ajuste para comparar um 12x36, 6x1 ou outro modelo antes de mudar a escala da equipe."}
                          </article>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-3">
                          <Link
                            href="/blog/escala-12x36-como-funciona/"
                            className="btn-secondary"
                          >
                            {language === "en"
                              ? "12x36 guide"
                              : language === "es"
                                ? "Guía 12x36"
                                : "Guia 12x36"}
                          </Link>
                          <Link
                            href="/blog/como-montar-escala-de-trabalho/"
                            className="btn-secondary"
                          >
                            {language === "en"
                              ? "Build a schedule"
                              : language === "es"
                                ? "Montar una escala"
                                : "Como montar escala"}
                          </Link>
                          <Link
                            href="/blog/escalas-de-trabalho-clt/"
                            className="btn-secondary"
                          >
                            {language === "en"
                              ? "CLT schedules"
                              : language === "es"
                                ? "Escalas CLT"
                                : "Escalas na CLT"}
                          </Link>
                        </div>
                      </section>

                      <section className="card-base p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {t("pages.schedule.adjustmentEyebrow")}
                            </p>
                            <h2 className="mt-2 text-xl font-bold">
                              {t("pages.schedule.adjustmentTitle")}
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {t("pages.schedule.referenceSuggested", {
                                value: formatHours(
                                  result.userBlock.automaticHoursReference,
                                  dateLocale,
                                  hoursUnit
                                ),
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-[auto_minmax(0,180px)_auto]">
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() =>
                              setHoursInput(
                                String(
                                  Math.max(
                                    1,
                                    Number(
                                      hoursInput ||
                                        result.userBlock.consideredHours
                                    ) - 1
                                  )
                                )
                              )
                            }
                          >
                            {t("pages.schedule.minusOneHour")}
                          </button>
                          <input
                            type="number"
                            min={1}
                            step={1}
                            value={hoursInput}
                            onChange={event =>
                              setHoursInput(event.target.value)
                            }
                            className="input-base w-full"
                          />
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() =>
                              setHoursInput(
                                String(
                                  Number(
                                    hoursInput ||
                                      result.userBlock.consideredHours
                                  ) + 1
                                )
                              )
                            }
                          >
                            {t("pages.schedule.plusOneHour")}
                          </button>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => {
                              const nextForm = {
                                ...form,
                                hoursOverride: Math.max(
                                  1,
                                  Number(hoursInput) ||
                                    result.userBlock.consideredHours
                                ),
                              };
                              setForm(nextForm);
                              void runSimulation(nextForm);
                            }}
                          >
                            {t("pages.schedule.applyAdjustment")}
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              const nextForm = { ...form, hoursOverride: 0 };
                              setForm(nextForm);
                              void runSimulation(nextForm);
                            }}
                          >
                            {t("pages.schedule.backToSuggested")}
                          </button>
                        </div>
                      </section>

                      <section className="card-base p-6">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t("pages.schedule.calendarEyebrow")}
                        </p>
                        <h2 className="mt-2 text-xl font-bold">
                          {t("pages.schedule.calendarTitle")}
                        </h2>
                        <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-muted-foreground">
                          {weekdayLabels.map(label => (
                            <div key={label} className="p-2">
                              {label}
                            </div>
                          ))}
                        </div>

                        <div className="mt-2 grid grid-cols-7 gap-2">
                          {Array.from({ length: firstDayOffset }).map(
                            (_, index) => (
                              <div
                                key={`empty-${index}`}
                                className="h-28 rounded-2xl bg-transparent"
                              />
                            )
                          )}
                          {result.userBlock.simulation.days.map(day => (
                            <article
                              key={day.iso}
                              className={
                                day.deficit > 0
                                  ? "rounded-2xl border border-rose-200 bg-rose-50 p-2"
                                  : day.holiday && day.operated
                                    ? "rounded-2xl border border-amber-200 bg-amber-50 p-2"
                                    : day.operated
                                      ? "rounded-2xl border border-emerald-200 bg-emerald-50 p-2"
                                      : "rounded-2xl border border-border bg-secondary/40 p-2"
                              }
                            >
                              <div className="flex items-center justify-between text-xs">
                                <strong>{day.day}</strong>
                                <span className="text-muted-foreground">
                                  {day.operated
                                    ? `${day.assigned.length}/${day.requiredAssignments}`
                                    : t("pages.schedule.dayOff")}
                                </span>
                              </div>
                              <div className="mt-2 space-y-1">
                                {day.assigned.slice(0, 3).map(employee => (
                                  <span
                                    key={employee}
                                    className="mr-1 inline-flex rounded-full bg-background px-2 py-1 text-[10px] font-medium"
                                  >
                                    {employee}
                                  </span>
                                ))}
                                {day.assigned.length > 3 ? (
                                  <span className="inline-flex rounded-full bg-background px-2 py-1 text-[10px] font-medium">
                                    +{day.assigned.length - 3}
                                  </span>
                                ) : null}
                                {day.deficit > 0 ? (
                                  <p className="pt-1 text-[10px] font-semibold text-rose-600">
                                    {t("pages.schedule.deficitOf", {
                                      count: day.deficit,
                                    })}
                                  </p>
                                ) : null}
                              </div>
                            </article>
                          ))}
                        </div>
                      </section>

                      <section className="card-base p-6">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t("pages.schedule.alertsEyebrow")}
                        </p>
                        <div className="mt-4 grid gap-6 lg:grid-cols-2">
                          <div>
                            <h2 className="text-lg font-bold">
                              {t("pages.schedule.alertsTitle")}
                            </h2>
                            <div className="mt-4 space-y-3">
                              {result.userBlock.alertas.length ? (
                                result.userBlock.alertas.map(alerta => (
                                  <div
                                    key={alerta}
                                    className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800"
                                  >
                                    {t(
                                      `pages.schedule.alertMessages.${alerta}`
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                  {t("pages.schedule.noCriticalAlerts")}
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h2 className="text-lg font-bold">
                              {t("pages.schedule.observationsTitle")}
                            </h2>
                            <div className="mt-4 space-y-3">
                              {[
                                ...result.userBlock.observacoes,
                                ...result.userBlock.legalNotes,
                              ].map((note, index) => (
                                <div
                                  key={`${note}-${index}`}
                                  className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground"
                                >
                                  {result.userBlock.legalNotes.includes(note)
                                    ? t(`pages.schedule.legalMessages.${note}`)
                                    : t(
                                        `pages.schedule.observationMessages.${note}`
                                      )}
                                </div>
                              ))}
                              <div className="rounded-2xl border border-border px-4 py-3 text-sm">
                                <strong>
                                  {t("pages.schedule.legalSummary")}
                                </strong>{" "}
                                {result.userBlock.legalSummaryCode.startsWith(
                                  "scale_profile_"
                                )
                                  ? t(
                                      `pages.schedule.legalProfiles.${result.userBlock.scale.id}`
                                    )
                                  : t(
                                      `pages.schedule.legalMessages.${result.userBlock.legalSummaryCode}`
                                    )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </>
                  ) : (
                    <section className="card-base max-w-3xl p-6">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("pages.schedule.resultEyebrow")}
                      </p>
                      <h2 className="mt-2 text-2xl font-bold">
                        {t("scale_result_title")}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {holidayLoading
                          ? language === "en"
                            ? "Preparing the simulation with the selected period and holiday base."
                            : language === "es"
                              ? "Preparando la simulación con el período y la base de feriados seleccionados."
                              : "Preparando a simulacao com o periodo e a base de feriados selecionados."
                          : language === "en"
                            ? "Set the schedule and period to see the result here."
                            : language === "es"
                              ? "Defina la jornada y el período para ver aquí el resultado."
                              : "Selecione a jornada e o periodo para gerar a escala."}
                      </p>
                    </section>
                  )}
                </div>
              </div>
            </section>

            <section id="explicacao" className="section-anchor">
              <div className="card-base p-6">
                <h2 className="text-2xl font-bold">
                  {language === "en"
                    ? "How to use the simulator"
                    : language === "es"
                      ? "Cómo usar el simulador"
                      : "Como usar o simulador"}
                </h2>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <article className="rounded-2xl bg-secondary p-4 text-sm leading-6 text-muted-foreground">
                    {language === "en"
                      ? "Define the month, scale type, simultaneous posts and operation window before running the simulation."
                      : language === "es"
                        ? "Defina el mes, tipo de escala, puestos simultáneos y ventana de operación antes de ejecutar la simulación."
                        : "Defina mês, tipo de escala, postos simultâneos e janela de operação antes de rodar a simulação."}
                  </article>
                  <article className="rounded-2xl bg-secondary p-4 text-sm leading-6 text-muted-foreground">
                    {language === "en"
                      ? "The result compares the selected model with suggested hours and monthly coverage."
                      : language === "es"
                        ? "El resultado compara el modelo seleccionado con la carga sugerida y la cobertura mensal."
                        : "O resultado compara o modelo selecionado com a carga sugerida e a cobertura mensal."}
                  </article>
                  <article className="rounded-2xl bg-secondary p-4 text-sm leading-6 text-muted-foreground">
                    {language === "en"
                      ? "Use the adjustment block when you need to test a higher or lower hours-per-employee scenario."
                      : language === "es"
                        ? "Use el bloque de ajuste cuando necesite probar una jornada mayor o menor por colaborador."
                        : "Use o bloco de ajuste quando precisar testar uma carga maior ou menor por colaborador."}
                  </article>
                  <article className="rounded-2xl bg-secondary p-4 text-sm leading-6 text-muted-foreground">
                    {language === "en"
                      ? "For long shifts such as 12x36, compare the suggested hours, holidays and monthly deficits before locking the scale."
                      : language === "es"
                        ? "En jornadas largas como 12x36, compare carga sugerida, feriados y déficits antes de cerrar la escala."
                        : "Em jornadas longas como 12x36, compare carga sugerida, feriados e déficits antes de fechar a escala."}
                  </article>
                </div>

                <div className="mt-10 space-y-8">
                  <div>
                    <h3 className="text-xl font-bold">
                      {language === "en"
                        ? "What is a work schedule"
                        : language === "es"
                          ? "Qué es una escala de trabajo"
                          : "O que é uma escala de trabalho"}
                    </h3>
                    <div className="mt-3 space-y-3">
                      <p className="text-sm leading-7 text-muted-foreground">
                        {language === "en"
                          ? "A work schedule (escala de trabalho) is the organized plan that defines which days and hours each employee works during a given period. In Brazil, these schedules are governed by the Consolidation of Labor Laws (CLT), which sets clear rules on maximum daily and weekly hours, mandatory rest periods, and overtime compensation. Employers must follow these rules to protect workers' rights and avoid legal penalties."
                          : language === "es"
                            ? "Una escala de trabajo es el plan organizado que define qué días y horarios trabaja cada empleado durante un período determinado. En Brasil, estas escalas están reguladas por la Consolidación de las Leyes del Trabajo (CLT), que establece reglas claras sobre jornadas máximas diarias y semanales, descansos obligatorios y compensación de horas extras. Los empleadores deben cumplir estas normas para proteger los derechos de los trabajadores y evitar sanciones legales."
                            : "Uma escala de trabalho é o plano organizado que define em quais dias e horários cada colaborador trabalha durante um determinado período. No Brasil, essas escalas são regidas pela Consolidação das Leis do Trabalho (CLT), que estabelece regras claras sobre jornadas máximas diárias e semanais, intervalos obrigatórios de descanso e compensação de horas extras. Os empregadores devem seguir essas normas para proteger os direitos dos trabalhadores e evitar penalidades legais."}
                      </p>
                      <p className="text-sm leading-7 text-muted-foreground">
                        {language === "en"
                          ? "Work schedules exist because different industries have different operational needs. A hospital needs 24/7 coverage, while an office typically operates only on weekdays. The schedule model chosen directly impacts staffing costs, employee well-being, and service quality. A well-designed schedule ensures adequate coverage without overloading workers or generating excessive overtime expenses."
                          : language === "es"
                            ? "Las escalas de trabajo existen porque distintos sectores tienen necesidades operativas diferentes. Un hospital necesita cobertura 24/7, mientras que una oficina normalmente opera solo en días laborables. El modelo de escala elegido impacta directamente en los costos de personal, el bienestar de los empleados y la calidad del servicio. Una escala bien diseñada garantiza cobertura adecuada sin sobrecargar a los trabajadores ni generar gastos excesivos de horas extras."
                            : "As escalas de trabalho existem porque diferentes setores possuem necessidades operacionais distintas. Um hospital precisa de cobertura 24 horas, enquanto um escritório normalmente funciona apenas em dias úteis. O modelo de escala escolhido impacta diretamente nos custos de pessoal, no bem-estar dos colaboradores e na qualidade do serviço. Uma escala bem planejada garante cobertura adequada sem sobrecarregar os trabalhadores nem gerar custos excessivos com horas extras."}
                      </p>
                      <p className="text-sm leading-7 text-muted-foreground">
                        {language === "en"
                          ? "The legal basis for work schedules in Brazil is found primarily in Articles 58 to 65 of the CLT, along with the 2017 Labor Reform (Law 13.467/2017) which expanded the possibilities for 12x36 schedules through individual agreements. Article 7, item XIII of the Federal Constitution also guarantees a maximum workday of 8 hours and 44 hours per week, serving as the constitutional foundation for all schedule models."
                          : language === "es"
                            ? "La base legal de las escalas de trabajo en Brasil se encuentra principalmente en los Artículos 58 al 65 de la CLT, junto con la Reforma Laboral de 2017 (Ley 13.467/2017) que amplió las posibilidades de escalas 12x36 mediante acuerdos individuales. El Artículo 7, inciso XIII de la Constitución Federal también garantiza una jornada máxima de 8 horas diarias y 44 horas semanales, sirviendo como fundamento constitucional para todos los modelos de escala."
                            : "A base legal das escalas de trabalho no Brasil está principalmente nos Artigos 58 a 65 da CLT, juntamente com a Reforma Trabalhista de 2017 (Lei 13.467/2017), que ampliou as possibilidades da escala 12x36 por meio de acordo individual. O Artigo 7º, inciso XIII da Constituição Federal também garante jornada máxima de 8 horas diárias e 44 horas semanais, servindo como fundamento constitucional para todos os modelos de escala."}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">
                      {language === "en"
                        ? "Main schedule models"
                        : language === "es"
                          ? "Principales modelos de escala"
                          : "Principais modelos de escala"}
                    </h3>
                    <div className="mt-3 space-y-3">
                      <p className="text-sm leading-7 text-muted-foreground">
                        {language === "en"
                          ? "The 5x2 schedule is the most common in Brazil: employees work five consecutive days and rest two (typically Saturday and Sunday). This model fits the standard 44-hour week when combined with an 8h48min daily shift or 8 hours plus 4 hours on Saturday. It is widely used in offices, banks, and administrative roles. The main advantage is predictability and alignment with school and family routines. The downside is that it does not support 24/7 operations without additional shifts."
                          : language === "es"
                            ? "La escala 5x2 es la más común en Brasil: los empleados trabajan cinco días consecutivos y descansan dos (generalmente sábado y domingo). Este modelo se ajusta a la jornada estándar de 44 horas semanales cuando se combina con turnos de 8h48min diarios u 8 horas más 4 horas los sábados. Es ampliamente utilizada en oficinas, bancos y funciones administrativas. Su principal ventaja es la previsibilidad y la alineación con rutinas escolares y familiares. La desventaja es que no soporta operaciones 24/7 sin turnos adicionales."
                            : "A escala 5x2 é a mais comum no Brasil: os colaboradores trabalham cinco dias consecutivos e folgam dois (geralmente sábado e domingo). Esse modelo se encaixa na jornada padrão de 44 horas semanais quando combinado com turnos de 8h48min diárias ou 8 horas mais 4 horas aos sábados. É amplamente utilizada em escritórios, bancos e funções administrativas. A principal vantagem é a previsibilidade e o alinhamento com rotinas escolares e familiares. A desvantagem é que não suporta operações 24/7 sem turnos adicionais."}
                      </p>
                      <p className="text-sm leading-7 text-muted-foreground">
                        {language === "en"
                          ? "The 6x1 schedule means six working days followed by one day off, rotating throughout the month. It is very popular in retail, restaurants, and service industries where Saturday operation is essential. The weekly rest must include at least one Sunday per month, as required by law. This model maximizes operational coverage but demands careful planning to ensure employees receive their mandatory rest. It typically results in 7h20min daily shifts to stay within the 44-hour weekly limit."
                          : language === "es"
                            ? "La escala 6x1 significa seis días de trabajo seguidos de un día de descanso, rotando a lo largo del mes. Es muy popular en el comercio, restaurantes y servicios donde la operación del sábado es esencial. El descanso semanal debe incluir al menos un domingo al mes, según la ley. Este modelo maximiza la cobertura operativa pero exige planificación cuidadosa para garantizar el descanso obligatorio. Generalmente resulta en turnos diarios de 7h20min para mantenerse dentro del límite de 44 horas semanales."
                            : "A escala 6x1 significa seis dias de trabalho seguidos de um dia de folga, revezando ao longo do mês. É muito popular no comércio, restaurantes e serviços onde a operação aos sábados é essencial. O descanso semanal remunerado (DSR) deve incluir pelo menos um domingo por mês, conforme exigência legal. Esse modelo maximiza a cobertura operacional, mas exige planejamento cuidadoso para garantir o descanso obrigatório. Geralmente resulta em turnos diários de 7h20min para se manter dentro do limite de 44 horas semanais."}
                      </p>
                      <p className="text-sm leading-7 text-muted-foreground">
                        {language === "en"
                          ? "The 12x36 schedule consists of 12 hours of work followed by 36 hours of rest. It is widely used in hospitals, security firms, fire departments, and industrial plants that need continuous coverage. Since the 2017 Labor Reform, this model can be adopted through individual written agreement, not just collective bargaining. The monthly total is approximately 180 hours. Despite the long shifts, employees benefit from more rest days per month. The 24x48 model (24 hours on, 48 hours off) is less common and primarily used by fire departments and some security operations. It requires very careful fatigue management."
                          : language === "es"
                            ? "La escala 12x36 consiste en 12 horas de trabajo seguidas de 36 horas de descanso. Es ampliamente utilizada en hospitales, empresas de seguridad, bomberos y plantas industriales que necesitan cobertura continua. Desde la Reforma Laboral de 2017, este modelo puede adoptarse mediante acuerdo individual escrito, no solo por convenio colectivo. El total mensual es de aproximadamente 180 horas. A pesar de los turnos largos, los empleados se benefician de más días de descanso al mes. El modelo 24x48 (24 horas de trabajo, 48 de descanso) es menos común y se usa principalmente en bomberos y algunas operaciones de seguridad. Requiere gestión muy cuidadosa de la fatiga."
                            : "A escala 12x36 consiste em 12 horas de trabalho seguidas de 36 horas de descanso. É amplamente utilizada em hospitais, empresas de segurança, corpos de bombeiros e indústrias que precisam de cobertura contínua. Desde a Reforma Trabalhista de 2017, esse modelo pode ser adotado por acordo individual escrito, não apenas por convenção coletiva. O total mensal fica em torno de 180 horas. Apesar dos turnos longos, os colaboradores se beneficiam de mais dias de folga por mês. O modelo 24x48 (24 horas de trabalho, 48 de descanso) é menos comum e utilizado principalmente por corpos de bombeiros e algumas operações de segurança. Exige gestão muito cuidadosa da fadiga."}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">
                      {language === "en"
                        ? "How working hours work in Brazil"
                        : language === "es"
                          ? "Cómo funciona la jornada de trabajo en Brasil"
                          : "Como funciona a jornada de trabalho no Brasil"}
                    </h3>
                    <div className="mt-3 space-y-3">
                      <p className="text-sm leading-7 text-muted-foreground">
                        {language === "en"
                          ? "Under the CLT, the standard working week in Brazil is 44 hours, distributed across up to 6 days. The daily limit is 8 hours, with up to 2 extra hours allowed as overtime (totaling 10 hours maximum per day). The monthly reference for payroll purposes is 220 hours (44 hours x 5 weeks). Overtime must be compensated at a minimum of 50% above the regular hourly rate, and on Sundays and holidays this premium rises to 100%."
                          : language === "es"
                            ? "Según la CLT, la jornada laboral estándar en Brasil es de 44 horas semanales, distribuidas en hasta 6 días. El límite diario es de 8 horas, con hasta 2 horas extras permitidas (totalizando un máximo de 10 horas por día). La referencia mensual para fines de nómina es de 220 horas (44 horas x 5 semanas). Las horas extras deben compensarse con un mínimo de 50% sobre el valor de la hora normal, y en domingos y feriados este adicional sube al 100%."
                            : "De acordo com a CLT, a jornada padrão de trabalho no Brasil é de 44 horas semanais, distribuídas em até 6 dias. O limite diário é de 8 horas, com até 2 horas extras permitidas (totalizando no máximo 10 horas por dia). A referência mensal para fins de folha de pagamento é de 220 horas (44 horas x 5 semanas). As horas extras devem ser remuneradas com adicional mínimo de 50% sobre o valor da hora normal, e em domingos e feriados esse adicional sobe para 100%."}
                      </p>
                      <p className="text-sm leading-7 text-muted-foreground">
                        {language === "en"
                          ? "Rest periods are also strictly regulated. For shifts longer than 6 hours, a break of at least 1 hour (and no more than 2 hours) is mandatory for meals and rest. Between two consecutive shifts, there must be a minimum of 11 hours of rest. Additionally, every worker is entitled to a weekly paid rest of at least 24 consecutive hours, preferably on Sundays. These rules ensure that regardless of the schedule model chosen, employee health and recovery time are preserved."
                          : language === "es"
                            ? "Los intervalos de descanso también están estrictamente regulados. Para jornadas superiores a 6 horas, es obligatorio un descanso de al menos 1 hora (y no más de 2 horas) para comida y reposo. Entre dos turnos consecutivos, debe haber un mínimo de 11 horas de descanso. Además, todo trabajador tiene derecho a un descanso semanal remunerado de al menos 24 horas consecutivas, preferentemente los domingos. Estas reglas garantizan que, independientemente del modelo de escala elegido, se preserve la salud y el tiempo de recuperación del empleado."
                            : "Os intervalos de descanso também são rigorosamente regulamentados. Para jornadas superiores a 6 horas, é obrigatório um intervalo de no mínimo 1 hora (e no máximo 2 horas) para refeição e descanso. Entre duas jornadas consecutivas, deve haver no mínimo 11 horas de descanso (intervalo interjornada). Além disso, todo trabalhador tem direito a um descanso semanal remunerado (DSR) de pelo menos 24 horas consecutivas, preferencialmente aos domingos. Essas regras garantem que, independentemente do modelo de escala escolhido, a saúde e o tempo de recuperação do colaborador sejam preservados."}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">
                      {language === "en"
                        ? "When to use the simulator"
                        : language === "es"
                          ? "Cuándo usar el simulador"
                          : "Quando usar o simulador"}
                    </h3>
                    <div className="mt-3 space-y-3">
                      <p className="text-sm leading-7 text-muted-foreground">
                        {language === "en"
                          ? "This simulator is useful in several practical scenarios. If you are opening a new business and need to determine how many employees are required to maintain adequate coverage, the tool lets you test different schedule models before committing to a staffing plan. If you already operate a business and are considering switching from a 6x1 to a 12x36 model (or vice versa), the simulator shows how each option impacts headcount, monthly hours, and coverage gaps."
                          : language === "es"
                            ? "Este simulador es útil en varios escenarios prácticos. Si está abriendo un nuevo negocio y necesita determinar cuántos empleados se requieren para mantener cobertura adecuada, la herramienta le permite probar diferentes modelos de escala antes de comprometerse con un plan de personal. Si ya opera un negocio y está considerando cambiar de un modelo 6x1 a un 12x36 (o viceversa), el simulador muestra cómo cada opción impacta la cantidad de personal, las horas mensuales y las brechas de cobertura."
                            : "Este simulador é útil em diversos cenários práticos. Se você está abrindo um novo negócio e precisa determinar quantos funcionários são necessários para manter a cobertura adequada, a ferramenta permite testar diferentes modelos de escala antes de se comprometer com um plano de pessoal. Se você já opera um negócio e está considerando trocar de um modelo 6x1 para 12x36 (ou vice-versa), o simulador mostra como cada opção impacta o quadro de pessoal, as horas mensais e as lacunas de cobertura."}
                      </p>
                      <p className="text-sm leading-7 text-muted-foreground">
                        {language === "en"
                          ? "HR professionals and managers can also use it when reviewing staffing during months with many holidays, when coverage tends to shrink. By adjusting the month and enabling the holidays option, you can see exactly where deficits appear on the calendar and plan temporary reinforcements. The simulator does not replace formal legal advice, but it provides a solid quantitative foundation for making informed decisions about workforce scheduling."
                          : language === "es"
                            ? "Los profesionales de RRHH y gerentes también pueden usarlo al revisar la dotación de personal en meses con muchos feriados, cuando la cobertura tiende a reducirse. Al ajustar el mes y habilitar la opción de feriados, puede ver exactamente dónde aparecen los déficits en el calendario y planificar refuerzos temporales. El simulador no sustituye la asesoría legal formal, pero proporciona una base cuantitativa sólida para tomar decisiones informadas sobre la programación de personal."
                            : "Profissionais de RH e gestores também podem usá-lo ao revisar o dimensionamento de equipe em meses com muitos feriados, quando a cobertura tende a diminuir. Ao ajustar o mês e habilitar a opção de feriados, é possível ver exatamente onde os déficits aparecem no calendário e planejar reforços temporários. O simulador não substitui assessoria jurídica formal, mas fornece uma base quantitativa sólida para tomar decisões informadas sobre o dimensionamento da força de trabalho."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="exemplos" className="section-anchor">
              <div className="card-base p-6">
                <h2 className="text-2xl font-bold">
                  {language === "en"
                    ? "Examples"
                    : language === "es"
                      ? "Ejemplos"
                      : "Exemplos"}
                </h2>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <article className="rounded-2xl bg-secondary p-4 text-sm leading-6 text-muted-foreground">
                    {language === "en"
                      ? "Estimate the minimum team size needed to cover a month with weekends and holidays."
                      : language === "es"
                        ? "Estime el cuadro mínimo necesario para cubrir un mes con fines de semana y feriados."
                        : "Estime o quadro mínimo necessário para cobrir um mês com finais de semana e feriados."}
                  </article>
                  <article className="rounded-2xl bg-secondary p-4 text-sm leading-6 text-muted-foreground">
                    {language === "en"
                      ? "Compare 12x36, 6x1 or other models before adjusting a real schedule."
                      : language === "es"
                        ? "Compare 12x36, 6x1 u otros modelos antes de ajustar una escala real."
                        : "Compare 12x36, 6x1 ou outros modelos antes de ajustar uma escala real."}
                  </article>
                  <article className="rounded-2xl bg-secondary p-4 text-sm leading-6 text-muted-foreground">
                    {language === "en"
                      ? "Use the calendar output to see where deficits or stronger coverage happen during the month."
                      : language === "es"
                        ? "Use la salida del calendario para ver dónde hay déficit o mayor cobertura durante el mes."
                        : "Use a saída em calendário para ver onde há déficit ou sobra de cobertura ao longo do mês."}
                  </article>
                </div>

                <div className="mt-10 space-y-8">
                  <div>
                    <h3 className="text-xl font-bold">
                      {language === "en"
                        ? "Hospital or clinic with 24/7 coverage (12x36)"
                        : language === "es"
                          ? "Hospital o clínica con cobertura 24/7 (12x36)"
                          : "Hospital ou clínica com cobertura 24h (12x36)"}
                    </h3>
                    <div className="mt-3 space-y-3">
                      <p className="text-sm leading-7 text-muted-foreground">
                        {language === "en"
                          ? "A hospital emergency room operates around the clock, every day of the year. Using the 12x36 model, each nurse or technician works a 12-hour shift (e.g., 7 AM to 7 PM) and then rests for 36 hours before the next shift. To maintain one simultaneous post 24 hours a day, you typically need 4 employees: 2 covering the day shift (alternating) and 2 covering the night shift (alternating). In this simulator, set the operation window to 00:00–00:00 (full day), choose 12x36, enable weekends and holidays, and set simultaneous posts to the number of positions you need covered at any given time. The result will show the minimum headcount and highlight any coverage gaps during the month."
                          : language === "es"
                            ? "Una sala de emergencias opera las 24 horas, todos los días del año. Con el modelo 12x36, cada enfermero o técnico trabaja un turno de 12 horas (por ejemplo, de 7:00 a 19:00) y luego descansa 36 horas antes del siguiente turno. Para mantener un puesto simultáneo las 24 horas, generalmente se necesitan 4 empleados: 2 cubriendo el turno diurno (alternando) y 2 el nocturno (alternando). En este simulador, configure la ventana de operación como 00:00–00:00 (día completo), elija 12x36, habilite fines de semana y feriados, y defina los puestos simultáneos según las posiciones que necesite cubiertas. El resultado mostrará el cuadro mínimo y destacará brechas de cobertura durante el mes."
                            : "Um pronto-socorro opera 24 horas por dia, todos os dias do ano. Com o modelo 12x36, cada enfermeiro ou técnico trabalha um turno de 12 horas (por exemplo, das 7h às 19h) e depois descansa 36 horas antes do próximo turno. Para manter um posto simultâneo 24 horas por dia, normalmente são necessários 4 colaboradores: 2 cobrindo o turno diurno (alternando) e 2 cobrindo o noturno (alternando). Neste simulador, defina a janela de operação como 00:00–00:00 (dia inteiro), escolha 12x36, habilite finais de semana e feriados, e defina os postos simultâneos conforme o número de posições que precisam estar cobertas. O resultado mostrará o quadro mínimo e destacará lacunas de cobertura ao longo do mês."}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">
                      {language === "en"
                        ? "Retail store coverage (6x1)"
                        : language === "es"
                          ? "Cobertura de tienda minorista (6x1)"
                          : "Cobertura de loja de varejo (6x1)"}
                    </h3>
                    <div className="mt-3 space-y-3">
                      <p className="text-sm leading-7 text-muted-foreground">
                        {language === "en"
                          ? "A retail store open Monday through Saturday (e.g., 9 AM to 9 PM) typically uses the 6x1 schedule. Each employee works 6 days and gets 1 day off, with the off day rotating throughout the month. To simulate this scenario, set the operation window to 09:00–21:00, select 6x1, enable Saturday, and disable Sunday unless the store opens on Sundays. If you need 2 salespeople on the floor at all times, set simultaneous posts to 2. The simulator calculates that with 7h20min daily shifts (to respect the 44-hour weekly limit), you would need approximately 3 employees per post, meaning 6 total. The calendar view reveals which days might have thinner coverage due to holiday coincidences."
                          : language === "es"
                            ? "Una tienda minorista abierta de lunes a sábado (por ejemplo, de 9:00 a 21:00) generalmente usa la escala 6x1. Cada empleado trabaja 6 días y descansa 1, con el día libre rotando a lo largo del mes. Para simular este escenario, configure la ventana de operación como 09:00–21:00, seleccione 6x1, habilite el sábado y desactive el domingo a menos que la tienda abra los domingos. Si necesita 2 vendedores en piso todo el tiempo, defina puestos simultáneos en 2. El simulador calcula que con jornadas de 7h20min (para respetar el límite de 44 horas semanales), necesitaría aproximadamente 3 empleados por puesto, o sea 6 en total. La vista de calendario revela qué días pueden tener cobertura más limitada por coincidencias con feriados."
                            : "Uma loja de varejo aberta de segunda a sábado (por exemplo, das 9h às 21h) normalmente usa a escala 6x1. Cada colaborador trabalha 6 dias e folga 1, com o dia de folga revezando ao longo do mês. Para simular esse cenário, defina a janela de operação como 09:00–21:00, selecione 6x1, habilite sábado e desabilite domingo (a menos que a loja abra aos domingos). Se você precisa de 2 vendedores no salão o tempo todo, defina postos simultâneos como 2. O simulador calcula que com jornadas de 7h20min (para respeitar o limite de 44 horas semanais), seriam necessários aproximadamente 3 colaboradores por posto, ou seja, 6 no total. A visualização em calendário revela quais dias podem ter cobertura mais reduzida por coincidências com feriados."}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">
                      {language === "en"
                        ? "Office or administrative team (5x2)"
                        : language === "es"
                          ? "Oficina o equipo administrativo (5x2)"
                          : "Escritório ou equipe administrativa (5x2)"}
                    </h3>
                    <div className="mt-3 space-y-3">
                      <p className="text-sm leading-7 text-muted-foreground">
                        {language === "en"
                          ? "An office that operates Monday to Friday from 8 AM to 6 PM fits the classic 5x2 model. Each employee works 8h48min per day (or 8 hours with a compensating 4-hour Saturday shift). In the simulator, set the operation window to 08:00–18:00, select 5x2, and disable Saturday, Sunday, and holidays. With 1 simultaneous post, the minimum headcount is simply 1 employee. This example is useful for understanding how holidays reduce the total monthly hours worked, and for planning around months like Carnival or year-end when multiple holidays cluster together. The adjustment block lets you see what happens if an employee works fewer hours due to absences."
                          : language === "es"
                            ? "Una oficina que opera de lunes a viernes de 8:00 a 18:00 se ajusta al modelo clásico 5x2. Cada empleado trabaja 8h48min por día (u 8 horas con un turno compensatorio de 4 horas los sábados). En el simulador, configure la ventana de operación como 08:00–18:00, seleccione 5x2 y desactive sábado, domingo y feriados. Con 1 puesto simultáneo, el cuadro mínimo es simplemente 1 empleado. Este ejemplo es útil para entender cómo los feriados reducen el total de horas trabajadas en el mes, y para planificar en meses como Carnaval o fin de año cuando varios feriados coinciden. El bloque de ajuste permite ver qué sucede si un empleado trabaja menos horas por ausencias."
                            : "Um escritório que funciona de segunda a sexta, das 8h às 18h, se encaixa no modelo clássico 5x2. Cada colaborador trabalha 8h48min por dia (ou 8 horas com compensação de 4 horas aos sábados). No simulador, defina a janela de operação como 08:00–18:00, selecione 5x2 e desabilite sábado, domingo e feriados. Com 1 posto simultâneo, o quadro mínimo é simplesmente 1 colaborador. Esse exemplo é útil para entender como os feriados reduzem o total de horas trabalhadas no mês, e para planejar meses como Carnaval ou fim de ano quando vários feriados se concentram. O bloco de ajuste permite ver o que acontece se um colaborador trabalhar menos horas por ausências."}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">
                      {language === "en"
                        ? "Security and surveillance (12x36 or 24x48)"
                        : language === "es"
                          ? "Seguridad y vigilancia (12x36 o 24x48)"
                          : "Segurança e vigilância (12x36 ou 24x48)"}
                    </h3>
                    <div className="mt-3 space-y-3">
                      <p className="text-sm leading-7 text-muted-foreground">
                        {language === "en"
                          ? "Security companies and gated communities often need guards present 24 hours a day, 7 days a week. The 12x36 model is the most popular choice: it provides continuous coverage with rotating pairs. For a single guard post running 24/7, you need at least 4 security guards on a 12x36 rotation. Some operations with heavier demand use the 24x48 model, where a guard works a full 24-hour shift and then rests for 48 hours. This reduces the number of shift handovers but increases fatigue risk. In the simulator, try both models with the same operation window and compare the headcount, monthly hours, and deficit indicators. Pay special attention to months with holidays, as the calendar will show days where reduced coverage could create security vulnerabilities."
                          : language === "es"
                            ? "Las empresas de seguridad y los condominios cerrados suelen necesitar vigilantes presentes las 24 horas, los 7 días de la semana. El modelo 12x36 es la opción más popular: proporciona cobertura continua con pares rotativos. Para un solo puesto de vigilancia funcionando 24/7, se necesitan al menos 4 vigilantes en rotación 12x36. Algunas operaciones con mayor demanda usan el modelo 24x48, donde un vigilante trabaja un turno completo de 24 horas y luego descansa 48 horas. Esto reduce las entregas de turno pero aumenta el riesgo de fatiga. En el simulador, pruebe ambos modelos con la misma ventana de operación y compare el cuadro mínimo, las horas mensuales y los indicadores de déficit. Preste especial atención a los meses con feriados, ya que el calendario mostrará días donde la cobertura reducida podría crear vulnerabilidades de seguridad."
                            : "Empresas de segurança e condomínios fechados frequentemente precisam de vigilantes presentes 24 horas por dia, 7 dias por semana. O modelo 12x36 é a escolha mais popular: proporciona cobertura contínua com pares em revezamento. Para um único posto de vigilância funcionando 24/7, são necessários pelo menos 4 vigilantes em rotação 12x36. Algumas operações com maior demanda utilizam o modelo 24x48, onde o vigilante trabalha um turno completo de 24 horas e depois descansa 48 horas. Isso reduz a quantidade de passagens de turno, mas aumenta o risco de fadiga. No simulador, experimente ambos os modelos com a mesma janela de operação e compare o quadro mínimo, as horas mensais e os indicadores de déficit. Preste atenção especial aos meses com feriados, pois o calendário mostrará dias onde a cobertura reduzida pode criar vulnerabilidades na segurança."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/blog/escala-12x36-como-funciona/"
                    className="btn-secondary"
                  >
                    {language === "en"
                      ? "Read 12x36 guide"
                      : language === "es"
                        ? "Leer guía 12x36"
                        : "Ler guia 12x36"}
                  </Link>
                  <Link
                    href="/blog/como-montar-escala-de-trabalho/"
                    className="btn-secondary"
                  >
                    {language === "en"
                      ? "Build a work schedule"
                      : language === "es"
                        ? "Montar una escala"
                        : "Montar escala de trabalho"}
                  </Link>
                  <Link href="/calcular/" className="btn-secondary">
                    {language === "en"
                      ? "Open business-day calculator"
                      : language === "es"
                        ? "Abrir calculadora"
                        : "Abrir calculadora de dias úteis"}
                  </Link>
                </div>
              </div>
            </section>

            <section id="faq" className="section-anchor">
              <div className="card-base p-6">
                <h2 className="text-2xl font-bold">{t("faq_title")}</h2>
                <div className="mt-5 space-y-3">
                  {faqItems.map(item => (
                    <details
                      key={item.question}
                      className="rounded-2xl bg-secondary px-4 py-3"
                    >
                      <summary className="font-semibold">
                        {item.question}
                      </summary>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </section>

            <CoreNavigationBlock />

            <AdSlot id="ads-schedule-bottom" className="my-4" minHeight={100} format="auto" />

            <CtaFinalBlock
              language={language}
              title={language === "en" ? "Need to calculate business days?" : language === "es" ? "¿Necesita calcular días hábiles?" : "Precisa calcular dias úteis?"}
              buttonLabel={language === "en" ? "Open calculator" : language === "es" ? "Abrir calculadora" : "Abrir calculadora"}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
