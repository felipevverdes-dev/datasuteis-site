import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
  Calculator,
  CheckCircle2,
  Clock3,
  Gamepad2,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Link } from "wouter";
import AdSlot from "@/components/AdSlot";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FloatingSectionNav from "@/components/layout/FloatingSectionNav";
import { useI18n } from "@/contexts/LanguageContext";
import { trackAnalyticsEvent } from "@/lib/analytics";
import {
  calculateBusinessDays,
  fetchBusinessDayStates,
  type BusinessDayCalculationResponse,
  type BusinessDayStateOption,
} from "@/lib/business-day-service";
import { formatIsoDate, parseIsoDate } from "@/lib/date-utils";
import { getGamesNavLabel, getUtilitiesNavLabel } from "@/lib/games-nav";
import { getHomeBlogTeasers } from "@/lib/home-blog-teasers";
import {
  getBackToTopLabel,
  type PageSectionNavItem,
} from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";
import type { SupportedLanguage } from "@/lib/site";

/* ─────────────────────────── i18n copy ─────────────────────────── */

const HomeMomentSummary = lazy(
  () => import("@/components/home/HomeMomentSummary")
);

function HomeMomentSummaryFallback() {
  return (
    <section
      id="momento"
      className="section-anchor min-h-[24rem] rounded-3xl border border-border bg-card p-6 shadow-sm md:min-h-[22rem]"
      aria-busy="true"
    >
      <div className="h-9 w-52 animate-pulse rounded-full bg-secondary" />
      <div className="mt-6 space-y-4">
        <div className="h-5 w-2/3 animate-pulse rounded-full bg-secondary" />
        <div className="h-5 w-1/2 animate-pulse rounded-full bg-secondary" />
        <div className="h-12 w-full animate-pulse rounded-2xl bg-secondary" />
        <div className="h-px w-full bg-border" />
        <div className="h-5 w-1/3 animate-pulse rounded-full bg-secondary" />
        <div className="h-8 w-24 animate-pulse rounded-full bg-secondary" />
      </div>
    </section>
  );
}

const COPY: Record<
  SupportedLanguage,
  {
    seoTitle: string;
    seoDescription: string;
    heroTitle: string;
    heroSubtitle: string;
    heroCta: string;
    calcTitle: string;
    startDateLabel: string;
    endDateLabel: string;
    stateLabel: string;
    stateLoading: string;
    stateSelect: string;
    calcButton: string;
    calculating: string;
    resultTitle: string;
    businessDaysLabel: string;
    calendarDaysLabel: string;
    weekendsLabel: string;
    holidaysLabel: string;
    fullCalcCta: string;
    primaryTitle: string;
    snapshotTitle: string;
    supportTitle: string;
    supportDescription: string;
    aboutTitle: string;
    aboutItems: Array<{ title: string; text: string }>;
    seoContentTitle: string;
    seoContentBody: string[];
    seoExamplesTitle: string;
    seoExamples: string[];
    blogTitle: string;
    faqTitle: string;
    faqItems: Array<{ question: string; answer: string }>;
    open: string;
    ctaFinalTitle: string;
    ctaFinalButton: string;
    invalidDateError: string;
    calcError: string;
  }
> = {
  pt: {
    seoTitle:
      "Calcule dias úteis em segundos (com feriados automáticos) | Datas Úteis",
    seoDescription:
      "Calculadora de dias úteis rápida e precisa com feriados nacionais, estaduais e municipais. Sem erro. Ideal para empresas, prazos e planejamento.",
    heroTitle: "Calcule dias úteis em segundos\n(com feriados automáticos)",
    heroSubtitle:
      "Sem erro. Rápido. Ideal para empresas, prazos e planejamento.",
    heroCta: "Calcular agora",
    calcTitle: "Calculadora rápida",
    startDateLabel: "Data inicial",
    endDateLabel: "Data final",
    stateLabel: "Estado (opcional)",
    stateLoading: "Carregando estados...",
    stateSelect: "Apenas feriados nacionais",
    calcButton: "Calcular dias úteis",
    calculating: "Calculando...",
    resultTitle: "Resultado",
    businessDaysLabel: "Dias úteis",
    calendarDaysLabel: "Dias corridos",
    weekendsLabel: "Finais de semana",
    holidaysLabel: "Feriados",
    fullCalcCta: "Usar calculadora completa",
    primaryTitle: "Ferramentas principais",
    snapshotTitle: "Resumo do momento",
    supportTitle: "Mais recursos úteis",
    supportDescription:
      "Use utilitários, jogos e conteúdos de apoio quando quiser complementar o planejamento do dia com consulta rápida ou uma pausa curta.",
    aboutTitle: "O que é o Datas Úteis",
    aboutItems: [
      {
        title: "Ferramentas práticas para o dia a dia",
        text: "O Datas Úteis reúne calculadora de dias úteis, calendário com feriados, simulador de escalas de trabalho e ferramentas de idade em um único lugar. Todas as ferramentas funcionam diretamente no navegador, sem cadastro e sem custo.",
      },
      {
        title: "Dados confiáveis e atualizados",
        text: "Os feriados nacionais seguem a legislação federal brasileira. Na calculadora, é possível selecionar estado e município para incluir feriados locais. Os dados de localidade são obtidos do IBGE e de bases públicas oficiais.",
      },
      {
        title: "Para profissionais e uso pessoal",
        text: "O site é usado por profissionais de RH, departamento pessoal, contabilidade, advocacia, logística e por qualquer pessoa que precise calcular prazos, planejar rotinas ou conferir datas. O simulador de escalas ajuda a comparar modelos como 5x2, 6x1 e 12x36 antes de aplicar em operações reais.",
      },
    ],
    seoContentTitle: "Como calcular dias úteis corretamente",
    seoContentBody: [
      "Dias úteis são os dias em que normalmente se trabalha — de segunda a sexta-feira — excluindo sábados, domingos e feriados oficiais. O conceito é fundamental para calcular prazos legais, bancários, trabalhistas e contratuais no Brasil.",
      "Para calcular dias úteis entre duas datas, o método mais preciso é contar cada dia do intervalo verificando se ele é um dia de semana (segunda a sexta) e se não coincide com nenhum feriado. Este é exatamente o método que a calculadora acima utiliza, considerando automaticamente todos os feriados nacionais brasileiros e, quando selecionado, os feriados estaduais e municipais.",
      "A contagem de dias úteis segue convenções importantes. No Brasil, a maioria dos prazos legais e bancários exclui o dia inicial da contagem e inclui o dia de vencimento. Por exemplo, um prazo de 5 dias úteis contado a partir de segunda-feira começa na terça e termina na segunda seguinte (se não houver feriados no período).",
      "Desde 2016, o Código de Processo Civil brasileiro (artigo 219) determina que os prazos processuais sejam contados em dias úteis, e não mais em dias corridos como era antes. Essa mudança impactou diretamente a rotina de escritórios de advocacia, departamentos jurídicos e tribunais em todo o país.",
      "Para empresas, calcular dias úteis com precisão é essencial em diversas situações: prazo de pagamento de fornecedores, cálculo de juros bancários, tempo de entrega de produtos, período de experiência trabalhista, antecedência mínima para convocação de reuniões societárias, entre outros.",
      "A diferença entre dias úteis e dias corridos é significativa na prática. Um prazo de 10 dias corridos sempre termina em 10 dias. Porém, 10 dias úteis podem equivaler a 14 ou mais dias corridos, dependendo dos finais de semana e feriados no período. Por isso, confundir os dois conceitos pode causar atrasos e problemas legais.",
      "A questão do sábado como dia útil depende do contexto. Na maioria das convenções trabalhistas e bancárias, sábado não é dia útil. Entretanto, em alguns setores do comércio e convenções coletivas específicas, o sábado pode ser considerado dia útil. A calculadora permite configurar essa opção para atender ambos os cenários.",
      "Quanto aos feriados, o Brasil possui feriados nacionais fixos (como 1º de janeiro, 7 de setembro e 25 de dezembro) e feriados móveis que variam a cada ano (como Carnaval, Sexta-feira Santa e Corpus Christi). Além disso, cada estado e município pode ter seus próprios feriados locais, o que torna importante selecioná-los na calculadora para obter resultados precisos.",
    ],
    seoExamplesTitle: "Exemplos práticos de cálculo de dias úteis",
    seoExamples: [
      "Prazo de pagamento de 30 dias úteis: Se a nota fiscal é emitida em 02/01, o vencimento não será em 01/02 (30 dias corridos), mas provavelmente após 11/02 considerando finais de semana e feriados.",
      "Prazo judicial de 15 dias úteis: Após a intimação, o prazo começa no primeiro dia útil seguinte. A calculadora mostra exatamente quando esse prazo se encerra.",
      "Período de experiência de 45 dias: Apesar de contado em dias corridos pela CLT, muitas empresas precisam saber quantos dias úteis o colaborador efetivamente trabalhará no período.",
      "Entrega de mercadoria em 5 dias úteis: Uma compra feita na sexta-feira terá entrega prevista para a sexta seguinte (e não na quarta), pois o sábado e domingo não contam.",
      "Antecedência de 3 dias úteis para convocação de assembleia: Se a reunião será na quarta, a convocação deve ser enviada até a sexta anterior.",
    ],
    blogTitle: "Conteúdos de apoio",
    faqTitle: "Perguntas frequentes",
    faqItems: [
      {
        question: "Quais ferramentas o site oferece?",
        answer:
          "Calculadora de dias úteis, calendário com feriados, simulador de escalas de trabalho, calculadora de idade, jogos e utilitários de apoio.",
      },
      {
        question: "A calculadora de dias úteis considera feriados?",
        answer:
          "Sim. A leitura padrão considera feriados nacionais e permite filtros por estado e município.",
      },
      {
        question: "Posso calcular datas de anos passados e futuros?",
        answer:
          "Sim. As páginas e ferramentas foram organizadas para aceitar anos anteriores, o ano atual e anos futuros.",
      },
      {
        question: "Quais escalas posso simular?",
        answer:
          "Você pode simular escalas como 5x2, 6x1, 12x36 e outras variações usadas em operações reais.",
      },
      {
        question: "O site mostra feriados estaduais e municipais?",
        answer:
          "Na calculadora, você pode selecionar estado e município para incluir feriados locais no cálculo.",
      },
      {
        question: "Como saber em que dia da semana eu nasci?",
        answer:
          "Use a área de idade para informar sua data de nascimento e ver o dia da semana correspondente.",
      },
      {
        question: "Como calcular minha idade exata?",
        answer:
          "Na área de idade, a ferramenta mostra anos, meses e dias com base na data informada.",
      },
      {
        question:
          "Posso usar a ferramenta para planejar prazos?",
        answer:
          "Sim. O site ajuda a planejar prazos e rotinas, mas regras legais específicas devem ser validadas no seu contexto.",
      },
    ],
    open: "Abrir página",
    ctaFinalTitle: "Calcule agora seus dias úteis com precisão",
    ctaFinalButton: "Usar calculadora",
    invalidDateError: "Informe datas válidas antes de calcular.",
    calcError: "Não foi possível calcular. Tente novamente.",
  },
  en: {
    seoTitle:
      "Calculate business days in seconds (with automatic holidays) | Datas Úteis",
    seoDescription:
      "Fast and accurate business day calculator with national, state and municipal holidays. No errors. Ideal for businesses, deadlines and planning.",
    heroTitle: "Calculate business days in seconds\n(with automatic holidays)",
    heroSubtitle:
      "No errors. Fast. Ideal for businesses, deadlines and planning.",
    heroCta: "Calculate now",
    calcTitle: "Quick calculator",
    startDateLabel: "Start date",
    endDateLabel: "End date",
    stateLabel: "State (optional)",
    stateLoading: "Loading states...",
    stateSelect: "National holidays only",
    calcButton: "Calculate business days",
    calculating: "Calculating...",
    resultTitle: "Result",
    businessDaysLabel: "Business days",
    calendarDaysLabel: "Calendar days",
    weekendsLabel: "Weekends",
    holidaysLabel: "Holidays",
    fullCalcCta: "Use full calculator",
    primaryTitle: "Main tools",
    snapshotTitle: "Today snapshot",
    supportTitle: "More useful resources",
    supportDescription:
      "Use utilities, games and support content when you want quick consultation, a short break or extra context for planning.",
    aboutTitle: "What is Datas Úteis",
    aboutItems: [
      {
        title: "Practical tools for everyday tasks",
        text: "Datas Úteis brings together a business-day calculator, a holiday calendar, a work schedule simulator and age tools in one place. Every tool runs directly in the browser, with no sign-up and no cost.",
      },
      {
        title: "Reliable and up-to-date data",
        text: "National holidays follow Brazilian federal legislation. In the calculator, you can select a state and municipality to include local holidays. Location data comes from IBGE and official public sources.",
      },
      {
        title: "For professionals and personal use",
        text: "The site is used by HR professionals, payroll departments, accountants, lawyers, logistics teams and anyone who needs to calculate deadlines, plan routines or check dates. The schedule simulator helps compare models like 5x2, 6x1 and 12x36 before applying them.",
      },
    ],
    seoContentTitle: "How to correctly calculate business days",
    seoContentBody: [
      "Business days are the days when work normally takes place — Monday through Friday — excluding Saturdays, Sundays and official holidays. This concept is essential for calculating legal, banking, labor and contractual deadlines in Brazil.",
      "To calculate business days between two dates, the most accurate method is to check each day in the range to determine if it is a weekday (Monday to Friday) and if it does not coincide with any holiday. This is exactly the method the calculator above uses, automatically considering all Brazilian national holidays and, when selected, state and municipal holidays.",
      "Business day counting follows important conventions. In Brazil, most legal and banking deadlines exclude the start day and include the due date. For example, a 5-business-day deadline counted from Monday starts on Tuesday and ends on the following Monday (if there are no holidays during the period).",
      "Since 2016, the Brazilian Code of Civil Procedure (article 219) determines that procedural deadlines are counted in business days, no longer in calendar days as before. This change directly impacted the routine of law firms, legal departments and courts across the country.",
      "For companies, accurately calculating business days is essential in several situations: supplier payment deadlines, bank interest calculations, product delivery times, probation periods, minimum notice for calling board meetings, among others.",
      "The difference between business days and calendar days is significant in practice. A 10 calendar-day deadline always ends in 10 days. However, 10 business days can equal 14 or more calendar days, depending on weekends and holidays in the period. Therefore, confusing the two concepts can cause delays and legal issues.",
      "The question of Saturday as a business day depends on the context. In most labor and banking conventions, Saturday is not a business day. However, in some retail sectors and specific collective agreements, Saturday may be considered a business day. The calculator allows you to configure this option.",
      "Regarding holidays, Brazil has fixed national holidays (like January 1st, September 7th and December 25th) and variable holidays that change each year (like Carnival, Good Friday and Corpus Christi). Additionally, each state and municipality may have their own local holidays.",
    ],
    seoExamplesTitle: "Practical business day calculation examples",
    seoExamples: [
      "30 business day payment term: If the invoice is issued on 01/02, the due date will not be 02/01 (30 calendar days), but probably after 02/11 considering weekends and holidays.",
      "15 business day legal deadline: After notification, the deadline starts on the next business day. The calculator shows exactly when this deadline expires.",
      "45-day probation period: Although counted in calendar days by labor law, many companies need to know how many business days the employee will actually work.",
      "5 business day delivery: A Friday purchase will be delivered the following Friday (not Wednesday), as Saturday and Sunday don't count.",
      "3 business day notice for assembly: If the meeting is on Wednesday, the notice must be sent by the previous Friday.",
    ],
    blogTitle: "Support content",
    faqTitle: "Frequently asked questions",
    faqItems: [
      {
        question: "What tools does the site offer?",
        answer:
          "Business day calculator, holiday calendar, work schedule simulator, age calculator, games and support utilities.",
      },
      {
        question: "Does the business-day calculator consider holidays?",
        answer:
          "Yes. The standard reading considers national holidays and allows state and municipality filters.",
      },
      {
        question: "Can I calculate past and future years?",
        answer:
          "Yes. The tools accept previous years, the current year and future years.",
      },
      {
        question: "Which schedules can I simulate?",
        answer:
          "You can simulate 5x2, 6x1, 12x36 and other work-pattern variations.",
      },
      {
        question: "Does the site show state and city holidays?",
        answer:
          "In the calculator, you can select state and municipality to include local holidays in the calculation.",
      },
      {
        question: "How do I find the weekday I was born on?",
        answer:
          "Use the age area and enter your birth date to see the corresponding weekday.",
      },
      {
        question: "How do I calculate my exact age?",
        answer:
          "In the age area, the result shows years, months and days from the informed date.",
      },
      {
        question: "Can I use the tools to plan deadlines?",
        answer:
          "Yes. The site helps with deadline and routine planning, but formal legal rules must be checked in your context.",
      },
    ],
    open: "Open page",
    ctaFinalTitle: "Calculate your business days with precision now",
    ctaFinalButton: "Use calculator",
    invalidDateError: "Enter valid dates before calculating.",
    calcError: "Could not calculate. Please try again.",
  },
  es: {
    seoTitle:
      "Calcule días hábiles en segundos (con feriados automáticos) | Datas Úteis",
    seoDescription:
      "Calculadora de días hábiles rápida y precisa con feriados nacionales, estatales y municipales. Sin errores. Ideal para empresas, plazos y planificación.",
    heroTitle:
      "Calcule días hábiles en segundos\n(con feriados automáticos)",
    heroSubtitle:
      "Sin errores. Rápido. Ideal para empresas, plazos y planificación.",
    heroCta: "Calcular ahora",
    calcTitle: "Calculadora rápida",
    startDateLabel: "Fecha inicial",
    endDateLabel: "Fecha final",
    stateLabel: "Estado (opcional)",
    stateLoading: "Cargando estados...",
    stateSelect: "Solo feriados nacionales",
    calcButton: "Calcular días hábiles",
    calculating: "Calculando...",
    resultTitle: "Resultado",
    businessDaysLabel: "Días hábiles",
    calendarDaysLabel: "Días corridos",
    weekendsLabel: "Fines de semana",
    holidaysLabel: "Feriados",
    fullCalcCta: "Usar calculadora completa",
    primaryTitle: "Herramientas principales",
    snapshotTitle: "Resumen del momento",
    supportTitle: "Más recursos útiles",
    supportDescription:
      "Use utilidades, juegos y contenidos de apoyo cuando necesite una consulta rápida, una pausa corta o más contexto para planear.",
    aboutTitle: "Qué es Datas Úteis",
    aboutItems: [
      {
        title: "Herramientas prácticas para el día a día",
        text: "Datas Úteis reúne calculadora de días hábiles, calendario con feriados, simulador de escalas de trabajo y herramientas de edad en un solo lugar. Todas las herramientas funcionan directamente en el navegador, sin registro y sin costo.",
      },
      {
        title: "Datos confiables y actualizados",
        text: "Los feriados nacionales siguen la legislación federal brasileña. En la calculadora, es posible seleccionar estado y municipio para incluir feriados locales. Los datos de localidad provienen del IBGE y de fuentes públicas oficiales.",
      },
      {
        title: "Para profesionales y uso personal",
        text: "El sitio es utilizado por profesionales de RH, departamento de personal, contabilidad, abogacía, logística y cualquier persona que necesite calcular plazos, planificar rutinas o consultar fechas. El simulador de escalas ayuda a comparar modelos como 5x2, 6x1 y 12x36.",
      },
    ],
    seoContentTitle: "Cómo calcular días hábiles correctamente",
    seoContentBody: [
      "Días hábiles son los días en que normalmente se trabaja — de lunes a viernes — excluyendo sábados, domingos y feriados oficiales. El concepto es fundamental para calcular plazos legales, bancarios, laborales y contractuales en Brasil.",
      "Para calcular días hábiles entre dos fechas, el método más preciso es contar cada día del intervalo verificando si es un día de semana (lunes a viernes) y si no coincide con ningún feriado. Este es exactamente el método que la calculadora usa, considerando automáticamente todos los feriados nacionales brasileños.",
      "El conteo de días hábiles sigue convenciones importantes. En Brasil, la mayoría de los plazos legales y bancarios excluyen el día inicial del conteo e incluyen el día de vencimiento.",
      "Desde 2016, el Código de Proceso Civil brasileño (artículo 219) determina que los plazos procesales se cuenten en días hábiles, no más en días corridos.",
      "Para empresas, calcular días hábiles con precisión es esencial en diversas situaciones: plazos de pago, cálculo de intereses bancarios, tiempo de entrega, periodo de prueba laboral, entre otros.",
      "La diferencia entre días hábiles y días corridos es significativa en la práctica. Un plazo de 10 días corridos siempre termina en 10 días. Sin embargo, 10 días hábiles pueden equivaler a 14 o más días corridos.",
      "La cuestión del sábado como día hábil depende del contexto. En la mayoría de las convenciones laborales y bancarias, el sábado no es día hábil.",
      "En cuanto a los feriados, Brasil tiene feriados nacionales fijos y feriados móviles que varían cada año. Además, cada estado y municipio puede tener sus propios feriados locales.",
    ],
    seoExamplesTitle: "Ejemplos prácticos de cálculo de días hábiles",
    seoExamples: [
      "Plazo de pago de 30 días hábiles: Si la factura se emite el 02/01, el vencimiento no será el 01/02 (30 días corridos), sino probablemente después del 11/02.",
      "Plazo judicial de 15 días hábiles: Después de la notificación, el plazo comienza en el siguiente día hábil.",
      "Período de prueba de 45 días: Aunque se cuente en días corridos, las empresas necesitan saber cuántos días hábiles trabajará el colaborador.",
      "Entrega en 5 días hábiles: Una compra del viernes se entregaría el viernes siguiente.",
      "Anticipación de 3 días hábiles para reunión: Si la reunión es el miércoles, la convocatoria debe enviarse antes del viernes anterior.",
    ],
    blogTitle: "Contenidos de apoyo",
    faqTitle: "Preguntas frecuentes",
    faqItems: [
      {
        question: "¿Qué herramientas ofrece el sitio?",
        answer:
          "Calculadora de días hábiles, calendario con feriados, simulador de escalas de trabajo, calculadora de edad, juegos y utilidades de apoyo.",
      },
      {
        question:
          "¿La calculadora de días hábiles considera feriados?",
        answer:
          "Sí. La lectura estándar considera feriados nacionales y permite filtros por estado y municipio.",
      },
      {
        question: "¿Puedo calcular años pasados y futuros?",
        answer:
          "Sí. Las herramientas aceptan años anteriores, el año actual y años futuros.",
      },
      {
        question: "¿Qué escalas puedo simular?",
        answer:
          "Puede simular 5x2, 6x1, 12x36 y otras variaciones de jornada.",
      },
      {
        question:
          "¿El sitio muestra feriados estatales y municipales?",
        answer:
          "En la calculadora, puede seleccionar estado y municipio para incluir feriados locales en el cálculo.",
      },
      {
        question: "¿Cómo saber en qué día nací?",
        answer:
          "Use el área de edad e ingrese la fecha de nacimiento para ver el día correspondiente.",
      },
      {
        question: "¿Cómo calcular mi edad exacta?",
        answer:
          "En el área de edad, el resultado muestra años, meses y días.",
      },
      {
        question:
          "¿Puedo usar la herramienta para planear plazos?",
        answer:
          "Sí. El sitio ayuda a planear plazos y rutinas, pero las reglas legales deben validarse en su contexto.",
      },
    ],
    open: "Abrir página",
    ctaFinalTitle: "Calcule ahora sus días hábiles con precisión",
    ctaFinalButton: "Usar calculadora",
    invalidDateError: "Ingrese fechas válidas antes de calcular.",
    calcError: "No se pudo calcular. Inténtalo de nuevo.",
  },
};

/* ─────────────────────────── component ─────────────────────────── */

export default function Home() {
  const { language, t, formatDate } = useI18n();
  const copy = COPY[language];
  const topLabel = getBackToTopLabel(language);
  const posts = useMemo(() => getHomeBlogTeasers(language), [language]);
  const gamesNavLabel = getGamesNavLabel(language);
  const utilitiesNavLabel = getUtilitiesNavLabel(language);

  /* ── Inline calculator state ── */
  const [startDate, setStartDate] = useState(() => formatIsoDate(new Date()));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return formatIsoDate(d);
  });
  const [stateCode, setStateCode] = useState("");
  const [states, setStates] = useState<BusinessDayStateOption[]>([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcResult, setCalcResult] =
    useState<BusinessDayCalculationResponse | null>(null);
  const [calcError, setCalcError] = useState("");
  const resultRef = useRef<HTMLDivElement | null>(null);

  /* Load states for the dropdown */
  useEffect(() => {
    let cancelled = false;
    void fetchBusinessDayStates()
      .then((items) => {
        if (!cancelled) setStates(items);
      })
      .catch(() => {
        if (!cancelled) setStates([]);
      })
      .finally(() => {
        if (!cancelled) setStatesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* Clear result on input change */
  useEffect(() => {
    setCalcResult(null);
    setCalcError("");
  }, [startDate, endDate, stateCode]);

  /* ── Run calculation ── */
  async function handleCalculate() {
    if (!parseIsoDate(startDate) || !parseIsoDate(endDate)) {
      setCalcError(copy.invalidDateError);
      return;
    }

    setCalcError("");
    setIsCalculating(true);

    try {
      const result = await calculateBusinessDays({
        mode: "between",
        start: startDate,
        end: endDate,
        considerSaturday: false,
        includeOptionalPoints: false,
        stateCode: stateCode || undefined,
      });

      trackAnalyticsEvent("tool_calculation", {
        tool_name: "home_quick_calculator",
        mode: "between",
        has_state_filter: Boolean(stateCode),
      });

      setCalcResult(result);

      /* Smooth scroll to result */
      window.requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    } catch {
      setCalcError(copy.calcError);
    } finally {
      setIsCalculating(false);
    }
  }

  /* ── Navigation cards ── */
  const primaryCards = [
    {
      href: "/calcular/",
      title:
        language === "en"
          ? "Calculate business days"
          : language === "es"
            ? "Calcular días hábiles"
            : "Calcular dias úteis",
      description:
        language === "en"
          ? "Count business days, add or subtract working days and review holidays."
          : language === "es"
            ? "Cuente días hábiles, sume o reste días y revise feriados."
            : "Conte dias úteis, some ou subtraia dias e revise feriados.",
      icon: Clock3,
    },
    {
      href: "/calendario/",
      title: t("nav_calendar"),
      description:
        language === "en"
          ? "Review months, weekends and holidays with a faster calendar view."
          : language === "es"
            ? "Consulte meses, fines de semana y feriados en una vista rápida."
            : "Consulte meses, finais de semana e feriados em uma leitura rápida.",
      icon: CalendarDays,
    },
    {
      href: "/escala/",
      title: t("nav_scale"),
      description:
        language === "en"
          ? "Simulate teams, shifts and monthly coverage scenarios."
          : language === "es"
            ? "Simule equipos, turnos y cobertura mensual."
            : "Simule equipes, turnos e cobertura mensal.",
      icon: BriefcaseBusiness,
    },
    {
      href: "/idade/",
      title:
        language === "en"
          ? "Calculate age"
          : language === "es"
            ? "Calcular edad"
            : "Calcular idade",
      description:
        language === "en"
          ? "Discover exact age, birth weekday, days alive and next birthday."
          : language === "es"
            ? "Descubra edad exacta, día de nacimiento, días de vida y próximo cumpleaños."
            : "Descubra idade exata, dia da semana de nascimento, dias de vida e próximo aniversário.",
      icon: CalendarClock,
    },
  ];

  const supportCards = [
    {
      href: "/utilitarios/",
      title: utilitiesNavLabel,
      description:
        language === "en"
          ? "Calculator, random picker, weather and currency tools."
          : language === "es"
            ? "Calculadora, sorteador, clima y cambio."
            : "Calculadora, sorteador, clima e câmbio.",
      icon: Wrench,
    },
    {
      href: "/jogos/",
      title: gamesNavLabel,
      description:
        language === "en"
          ? "Sudoku, word search and crosswords for short breaks."
          : language === "es"
            ? "Sudoku, sopa de letras y crucigramas para pausas cortas."
            : "Sudoku, caça-palavras e palavras cruzadas para pausas curtas.",
      icon: Gamepad2,
    },
    {
      href: "/blog/",
      title: t("nav_blog"),
      description:
        language === "en"
          ? "Support content about business days, schedules and work routines."
          : language === "es"
            ? "Contenidos sobre días hábiles, escalas y rutina laboral."
            : "Conteúdos sobre dias úteis, escalas e rotina de trabalho.",
      icon: Sparkles,
    },
  ];

  const homeNavItems: PageSectionNavItem[] =
    language === "en"
      ? [
          { id: "calculadora", label: "Calculator" },
          { id: "principais", label: "Main tools" },
          { id: "momento", label: "Today" },
          { id: "adicionais", label: "More" },
          { id: "conteudo-seo", label: "Guide" },
          { id: "sobre", label: "About" },
          { id: "blog", label: "Blog" },
          { id: "faq", label: "FAQ" },
        ]
      : language === "es"
        ? [
            { id: "calculadora", label: "Calculadora" },
            { id: "principais", label: "Principales" },
            { id: "momento", label: "Hoy" },
            { id: "adicionais", label: "Más" },
            { id: "conteudo-seo", label: "Guía" },
            { id: "sobre", label: "Sobre" },
            { id: "blog", label: "Blog" },
            { id: "faq", label: "FAQ" },
          ]
        : [
            { id: "calculadora", label: "Calculadora" },
            { id: "principais", label: "Principais" },
            { id: "momento", label: "Hoje" },
            { id: "adicionais", label: "Mais" },
            { id: "conteudo-seo", label: "Guia" },
            { id: "sobre", label: "Sobre" },
            { id: "blog", label: "Blog" },
            { id: "faq", label: "FAQ" },
          ];

  usePageSeo({
    title: copy.seoTitle,
    description: copy.seoDescription,
    path: "/",
    keywords: [
      "dias úteis",
      "calcular dias úteis",
      "calendário",
      "feriados",
      "ferramentas",
      "escala",
      "idade",
    ],
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          name: copy.heroTitle.replace("\n", " "),
          url: "https://datasuteis.com.br/",
          description: copy.seoDescription,
        },
        {
          "@type": "WebApplication",
          name:
            language === "en"
              ? "Business Day Calculator"
              : language === "es"
                ? "Calculadora de Días Hábiles"
                : "Calculadora de Dias Úteis",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web",
          url: "https://datasuteis.com.br/",
        },
      ],
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" role="main" className="relative">
        {/* ═══════════════ HERO ═══════════════ */}
        <section className="hero-conversion border-b border-border">
          <div className="container mx-auto">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="hero-title-conversion text-primary">
                {copy.heroTitle.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i === 0 && <br />}
                  </span>
                ))}
              </h1>
              <p className="hero-subtitle mt-5">{copy.heroSubtitle}</p>
              <div className="mt-8">
                <a
                  href="#calculadora"
                  className="btn-cta-primary"
                  id="hero-cta"
                >
                  <Calculator className="h-5 w-5" />
                  {copy.heroCta}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ ADS TOP ═══════════════ */}
        <div className="container mx-auto mt-6">
          <AdSlot id="ads-top" minHeight={100} format="horizontal" />
        </div>

        {/* ═══════════════ INLINE CALCULATOR ═══════════════ */}
        <section
          id="calculadora"
          className="section-anchor container mx-auto mt-8"
        >
          <div className="section-card calculator-card">
            <h2 className="flex items-center gap-3 text-2xl font-bold">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Calculator className="h-5 w-5" />
              </div>
              {copy.calcTitle}
            </h2>

            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                void handleCalculate();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-sm font-semibold">
                    {copy.startDateLabel}
                  </span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-base input-touch w-full"
                    id="home-start-date"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold">
                    {copy.endDateLabel}
                  </span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-base input-touch w-full"
                    id="home-end-date"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold">
                    {copy.stateLabel}
                  </span>
                  <select
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    className="input-base input-touch w-full"
                    disabled={statesLoading}
                    id="home-state-select"
                  >
                    <option value="">
                      {statesLoading
                        ? copy.stateLoading
                        : copy.stateSelect}
                    </option>
                    {states.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.code} - {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {calcError && (
                <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">
                  {calcError}
                </p>
              )}

              <button
                type="submit"
                className="btn-cta-primary mt-6 w-full sm:w-auto"
                disabled={isCalculating}
                id="home-calc-submit"
              >
                {isCalculating ? copy.calculating : copy.calcButton}
              </button>
            </form>

            {/* ── Result cards ── */}
            {calcResult && (
              <div
                ref={resultRef}
                className="mt-8 animate-fade-in"
                id="home-result"
              >
                <h3 className="flex items-center gap-2 text-lg font-bold text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  {copy.resultTitle}
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <article className="result-card result-card-primary">
                    <p className="text-sm text-muted-foreground">
                      {copy.businessDaysLabel}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-primary">
                      {calcResult.businessDays}
                    </p>
                  </article>
                  <article className="result-card">
                    <p className="text-sm text-muted-foreground">
                      {copy.calendarDaysLabel}
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                      {calcResult.totalDays}
                    </p>
                  </article>
                  <article className="result-card">
                    <p className="text-sm text-muted-foreground">
                      {copy.weekendsLabel}
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                      {calcResult.weekends}
                    </p>
                  </article>
                  <article className="result-card">
                    <p className="text-sm text-muted-foreground">
                      {copy.holidaysLabel}
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                      {calcResult.holidayDays}
                    </p>
                  </article>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/calcular/" className="btn-primary">
                    {copy.fullCalcCta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════ ADS RESULT ═══════════════ */}
        {calcResult && (
          <div className="container mx-auto mt-6">
            <AdSlot id="ads-result" minHeight={100} format="auto" />
          </div>
        )}

        <FloatingSectionNav items={homeNavItems} topLabel={topLabel} />

        {/* ═══════════════ MAIN CONTENT ═══════════════ */}
        <section className="section-md">
          <div className="container mx-auto page-stack">
            {/* ── Primary tools ── */}
            <section
              id="principais"
              className="section-anchor section-card"
            >
              <h2 className="text-3xl font-bold">{copy.primaryTitle}</h2>
              <div className="mt-6 page-grid">
                {primaryCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Link
                      key={card.href}
                      href={card.href}
                      className="card-base card-hover block p-6"
                    >
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 text-2xl font-bold">
                        {card.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {card.description}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-2 font-semibold text-primary">
                        {copy.open}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* ── Moment summary ── */}
            <Suspense fallback={<HomeMomentSummaryFallback />}>
              <HomeMomentSummary />
            </Suspense>

            {/* ── Support cards ── */}
            <section
              id="adicionais"
              className="section-anchor section-card"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" />
                {copy.supportTitle}
              </div>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                {copy.supportDescription}
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {supportCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Link
                      key={card.href}
                      href={card.href}
                      className="card-base card-hover block p-5"
                    >
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="mt-4 text-xl font-bold">
                        {card.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {card.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* ═══════════════ ADS CONTENT ═══════════════ */}
            <AdSlot
              id="ads-content"
              className="my-4"
              minHeight={100}
              format="auto"
            />

            {/* ── SEO content block ── */}
            <section
              id="conteudo-seo"
              className="section-anchor section-card"
            >
              <h2 className="text-3xl font-bold">
                {copy.seoContentTitle}
              </h2>
              <div className="mt-6 space-y-4 text-base leading-7 text-muted-foreground">
                {copy.seoContentBody.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              <h3 className="mt-10 text-2xl font-bold">
                {copy.seoExamplesTitle}
              </h3>
              <ul className="mt-5 space-y-3 pl-5">
                {copy.seoExamples.map((example, i) => (
                  <li
                    key={i}
                    className="text-base leading-7 text-muted-foreground"
                  >
                    <strong className="text-foreground">
                      {example.split(":")[0]}:
                    </strong>{" "}
                    {example.split(":").slice(1).join(":")}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/calcular/" className="btn-primary">
                  {copy.heroCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/blog/dias-uteis-o-que-sao/" className="btn-outline">
                  {language === "en"
                    ? "Business days guide"
                    : language === "es"
                      ? "Guía de días hábiles"
                      : "Guia de dias úteis"}
                </Link>
              </div>
            </section>

            {/* ── About ── */}
            <section
              id="sobre"
              className="section-anchor section-card"
            >
              <h2 className="text-3xl font-bold">{copy.aboutTitle}</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                {copy.aboutItems.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-3xl bg-secondary p-5"
                  >
                    <h3 className="text-lg font-bold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {item.text}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            {/* ── Blog teasers ── */}
            <section
              id="blog"
              className="section-anchor section-card"
            >
              <h2 className="text-3xl font-bold">{copy.blogTitle}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {posts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}/`}
                    className="block rounded-3xl bg-secondary px-5 py-4 transition-colors hover:bg-secondary/80"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <span>{post.category}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-bold">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {post.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            {/* ═══════════════ ADS BOTTOM ═══════════════ */}
            <AdSlot
              id="ads-bottom"
              className="my-4"
              minHeight={100}
              format="auto"
            />

            {/* ── FAQ ── */}
            <section
              id="faq"
              className="section-anchor section-card"
            >
              <h2 className="text-3xl font-bold">{copy.faqTitle}</h2>
              <div className="mt-5 space-y-3">
                {copy.faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="rounded-2xl bg-secondary px-5 py-4"
                  >
                    <summary className="font-semibold">
                      {item.question}
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            {/* ═══════════════ CTA FINAL ═══════════════ */}
            <section className="cta-final-section" id="cta-final">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">
                  {copy.ctaFinalTitle}
                </h2>
                <div className="mt-8">
                  <Link href="/calcular/" className="btn-cta-final">
                    <Calculator className="h-5 w-5" />
                    {copy.ctaFinalButton}
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
