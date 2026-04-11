import { useState } from "react";
import LocalizedDateInput from "@/components/age/LocalizedDateInput";
import PageShell from "@/components/layout/PageShell";
import { useI18n } from "@/contexts/LanguageContext";
import { calculateAgeDetails } from "@/lib/age-tools";
import { formatIsoDate, getWeekdayLabel, parseIsoDate } from "@/lib/date-utils";
import { buildBreadcrumbSchema, getNavigationLabels } from "@/lib/navigation";
import { getBackToTopLabel, getToolPageNavItems } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";
import type { SupportedLanguage } from "@/lib/site";

export type AgeVariant =
  | "hub"
  | "calculate-age"
  | "birth-data"
  | "birth-weekday"
  | "life-days";

interface AgeExperienceProps {
  variant: AgeVariant;
  path: string;
}

const COPY: Record<
  SupportedLanguage,
  Record<
    AgeVariant,
    { title: string; titleTag: string; desc: string; keywords: string[] }
  >
> = {
  pt: {
    hub: {
      title: "Calcule idade, dias de vida e dados da sua data de nascimento",
      titleTag: "Calcular idade, dia da semana e dias de vida | Datas Úteis",
      desc: "Veja idade exata, dia da semana em que nasceu, dias de vida e próximo aniversário em uma mesma tela.",
      keywords: ["calcular idade", "dias de vida", "dia da semana que nasci"],
    },
    "calculate-age": {
      title: "Calcule sua idade exata",
      titleTag: "Calcular idade exata online | Datas Úteis",
      desc: "Descubra sua idade em anos, meses e dias com uma leitura direta.",
      keywords: ["calcular idade exata", "idade em anos meses e dias"],
    },
    "birth-data": {
      title: "Descubra dados úteis da sua data de nascimento",
      titleTag: "Dados da data de nascimento | Datas Úteis",
      desc: "Consulte idade, dia da semana de nascimento, dias de vida e próximo aniversário.",
      keywords: ["data de nascimento", "dados da data de nascimento"],
    },
    "birth-weekday": {
      title: "Descubra em que dia da semana você nasceu",
      titleTag: "Em que dia da semana eu nasci | Datas Úteis",
      desc: "Informe a data de nascimento para ver o dia da semana, a idade atual e o próximo aniversário.",
      keywords: ["em que dia da semana eu nasci", "dia da semana nascimento"],
    },
    "life-days": {
      title: "Descubra quantos dias de vida você tem",
      titleTag: "Quantos dias de vida eu tenho | Datas Úteis",
      desc: "Calcule seus dias de vida com a mesma ferramenta que mostra idade exata e próximo aniversário.",
      keywords: ["quantos dias eu tenho de vida", "dias de vida"],
    },
  },
  en: {
    hub: {
      title: "Calculate age, days alive and details from your birth date",
      titleTag: "Age calculator, birth weekday and days alive | Datas Úteis",
      desc: "Check exact age, birth weekday, days alive and the next birthday on the same screen.",
      keywords: ["age calculator", "days alive", "birth weekday"],
    },
    "calculate-age": {
      title: "Calculate your exact age",
      titleTag: "Exact age calculator online | Datas Úteis",
      desc: "See your age in years, months and days with a direct answer.",
      keywords: ["exact age calculator", "age in years months days"],
    },
    "birth-data": {
      title: "See useful details from your birth date",
      titleTag: "Birth date details | Datas Úteis",
      desc: "Review age, birth weekday, days alive and your next birthday.",
      keywords: ["birth date details", "birth day info"],
    },
    "birth-weekday": {
      title: "Find the weekday you were born on",
      titleTag: "What weekday was I born on | Datas Úteis",
      desc: "Enter your birth date to see the weekday, current age and next birthday.",
      keywords: ["what weekday was i born", "birth weekday"],
    },
    "life-days": {
      title: "Find how many days you have been alive",
      titleTag: "How many days have I been alive | Datas Úteis",
      desc: "Calculate your days alive with the same tool that shows exact age and next birthday.",
      keywords: ["days alive", "how many days have i been alive"],
    },
  },
  es: {
    hub: {
      title: "Calcule edad, días de vida y datos de su fecha de nacimiento",
      titleTag: "Calcular edad, día de nacimiento y días de vida | Datas Úteis",
      desc: "Consulte edad exacta, día de nacimiento, días de vida y próximo cumpleaños en una sola pantalla.",
      keywords: ["calcular edad", "días de vida", "día de nacimiento"],
    },
    "calculate-age": {
      title: "Calcule su edad exacta",
      titleTag: "Calcular edad exacta online | Datas Úteis",
      desc: "Descubra su edad en años, meses y días con una lectura directa.",
      keywords: ["calcular edad exacta", "edad exacta online"],
    },
    "birth-data": {
      title: "Descubra datos útiles de su fecha de nacimiento",
      titleTag: "Datos de la fecha de nacimiento | Datas Úteis",
      desc: "Consulte edad, día de nacimiento, días de vida y próximo cumpleaños.",
      keywords: ["fecha de nacimiento", "datos de nacimiento"],
    },
    "birth-weekday": {
      title: "Descubra en qué día de la semana nació",
      titleTag: "En qué día de la semana nací | Datas Úteis",
      desc: "Ingrese la fecha de nacimiento para ver el día, la edad actual y el próximo cumpleaños.",
      keywords: ["en qué día nací", "día de nacimiento"],
    },
    "life-days": {
      title: "Descubra cuántos días de vida tiene",
      titleTag: "Cuántos días de vida tengo | Datas Úteis",
      desc: "Calcule sus días de vida con la misma herramienta que muestra edad exacta.",
      keywords: ["días de vida", "cuántos días de vida tengo"],
    },
  },
};

const LABELS: Record<
  SupportedLanguage,
  {
    home: string;
    section: string;
    birth: string;
    reference: string;
    zodiac: string;
    invalidOrder: string;
    invalidFormat: string;
    exact: string;
    weekday: string;
    days: string;
    next: string;
    until: string;
    nextWeekday: string;
    faq: string;
    formatHint: string;
    optionalZodiac: string;
  }
> = {
  pt: {
    home: "Início",
    section: "Idade",
    birth: "Data de nascimento",
    reference: "Data de referência",
    zodiac: "Mostrar signo",
    invalidOrder:
      "A data de nascimento não pode ser maior que a data de referência.",
    invalidFormat: "Preencha as duas datas no formato dd/mm/aaaa.",
    exact: "Idade exata",
    weekday: "Dia da semana de nascimento",
    days: "Dias de vida",
    next: "Próximo aniversário",
    until: "Dias até o próximo aniversário",
    nextWeekday: "Dia da semana do próximo aniversário",
    faq: "FAQ",
    formatHint: "Formato da data",
    optionalZodiac: "Opcional",
  },
  en: {
    home: "Home",
    section: "Age",
    birth: "Birth date",
    reference: "Reference date",
    zodiac: "Show zodiac sign",
    invalidOrder: "The birth date cannot be later than the reference date.",
    invalidFormat: "Fill in both dates using the mm/dd/yyyy format.",
    exact: "Exact age",
    weekday: "Birth weekday",
    days: "Days alive",
    next: "Next birthday",
    until: "Days until next birthday",
    nextWeekday: "Weekday of the next birthday",
    faq: "FAQ",
    formatHint: "Date format",
    optionalZodiac: "Optional",
  },
  es: {
    home: "Inicio",
    section: "Edad",
    birth: "Fecha de nacimiento",
    reference: "Fecha de referencia",
    zodiac: "Mostrar signo",
    invalidOrder:
      "La fecha de nacimiento no puede ser posterior a la fecha de referencia.",
    invalidFormat: "Complete ambas fechas con el formato dd/mm/aaaa.",
    exact: "Edad exacta",
    weekday: "Día de nacimiento",
    days: "Días de vida",
    next: "Próximo cumpleaños",
    until: "Días hasta el próximo cumpleaños",
    nextWeekday: "Día de la semana del próximo cumpleaños",
    faq: "FAQ",
    formatHint: "Formato de la fecha",
    optionalZodiac: "Opcional",
  },
};

function getDefaultState() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 30);
  return {
    birth: formatIsoDate(date),
    reference: formatIsoDate(new Date()),
  };
}

function normalizePath(path: string) {
  if (path === "/") {
    return "/";
  }

  return path.endsWith("/") ? path : `${path}/`;
}

function formatExactAge(
  years: number,
  months: number,
  days: number,
  language: SupportedLanguage
) {
  if (language === "en") {
    return `${years} years, ${months} months and ${days} days`;
  }

  if (language === "es") {
    return `${years} años, ${months} meses y ${days} días`;
  }

  return `${years} anos, ${months} meses e ${days} dias`;
}

function getExplanationCards(language: SupportedLanguage) {
  if (language === "en") {
    return [
      "Enter the birth date and a reference date to compare today, a past date or a future milestone.",
      "The result keeps age, birth weekday, days alive and the next birthday in the same block.",
      "Enable the zodiac sign only when you want that extra reading in the summary.",
    ];
  }

  if (language === "es") {
    return [
      "Ingrese la fecha de nacimiento y una fecha de referencia para comparar hoy, una fecha pasada o una futura.",
      "El resultado reúne edad, día de nacimiento, días de vida y próximo cumpleaños en el mismo bloque.",
      "Active el signo solo cuando quiera esa lectura adicional en el resumen.",
    ];
  }

  return [
    "Informe a data de nascimento e uma data de referência para comparar hoje, uma data passada ou uma data futura.",
    "O resultado junta idade, dia da semana de nascimento, dias de vida e próximo aniversário no mesmo bloco.",
    "Ative o signo apenas quando quiser esse dado extra no resumo.",
  ];
}

function getExampleCards(language: SupportedLanguage) {
  if (language === "en") {
    return [
      "Compare exact age on the current date or on a contract, exam or travel date.",
      "Use the same page to discover your birth weekday without doing the math manually.",
      "Check how many days are left until the next birthday and on which weekday it falls.",
    ];
  }

  if (language === "es") {
    return [
      "Compare la edad exacta en la fecha actual o en una fecha de contrato, examen o viaje.",
      "Use la misma página para descubrir el día de nacimiento sin hacer la cuenta a mano.",
      "Vea cuántos días faltan para el próximo cumpleaños y en qué día cae.",
    ];
  }

  return [
    "Compare a idade exata na data de hoje ou em uma data de contrato, prova ou viagem.",
    "Use a mesma página para descobrir o dia da semana em que nasceu sem fazer conta manual.",
    "Veja quantos dias faltam para o próximo aniversário e em que dia da semana ele cai.",
  ];
}

function getSummaryGuide(language: SupportedLanguage) {
  if (language === "en") {
    return {
      title: "This summary brings together the main points of your birth date.",
      items: [
        {
          label: "Exact age",
          description:
            "Shows the difference in years, months and days up to the reference date.",
        },
        {
          label: "Birth date",
          description:
            "Keeps the original date visible so you can confirm the base used in the calculation.",
        },
        {
          label: "Birth weekday",
          description: "Shows which weekday your birth date fell on.",
        },
        {
          label: "Days alive",
          description:
            "Counts the total calendar days from birth to the reference date.",
        },
      ],
    };
  }

  if (language === "es") {
    return {
      title: "Este resumen reúne lo principal de su fecha de nacimiento.",
      items: [
        {
          label: "Edad exacta",
          description:
            "Muestra la diferencia en años, meses y días hasta la fecha de referencia.",
        },
        {
          label: "Fecha de nacimiento",
          description:
            "Mantiene visible la fecha base usada en el cálculo para una lectura más clara.",
        },
        {
          label: "Día de nacimiento",
          description: "Indica en qué día de la semana cayó su nacimiento.",
        },
        {
          label: "Días de vida",
          description:
            "Cuenta el total de días corridos entre el nacimiento y la fecha de referencia.",
        },
      ],
    };
  }

  return {
    title: "Este resumo reúne o principal da sua data de nascimento.",
    items: [
      {
        label: "Idade exata",
        description:
          "Mostra a diferença em anos, meses e dias até a data de referência.",
      },
      {
        label: "Data de nascimento",
        description:
          "Mantém visível a data base usada no cálculo para facilitar a conferência.",
      },
      {
        label: "Dia em que nasceu",
        description:
          "Indica em que dia da semana a sua data de nascimento caiu.",
      },
      {
        label: "Dias de vida",
        description:
          "Conta o total de dias corridos entre o nascimento e a data de referência.",
      },
    ],
  };
}

export default function AgeExperience({ variant, path }: AgeExperienceProps) {
  const { language, formatDate, dateLocale } = useI18n();
  const copy = COPY[language][variant];
  const labels = LABELS[language];
  const navigationLabels = getNavigationLabels(language);
  const navItems = getToolPageNavItems(language);
  const topLabel = getBackToTopLabel(language);
  const isHubPage = normalizePath(path) === "/idade/";
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.simulators },
    ...(isHubPage
      ? [{ label: navigationLabels.ageCalculator }]
      : [
          { label: navigationLabels.ageCalculator, href: "/idade/" },
          { label: copy.title },
        ]),
  ];
  const [state, setState] = useState(getDefaultState);
  const [includeZodiac, setIncludeZodiac] = useState(false);
  const [birthValid, setBirthValid] = useState(true);
  const [referenceValid, setReferenceValid] = useState(true);

  const birth = parseIsoDate(state.birth);
  const reference = parseIsoDate(state.reference);
  const hasValidDates = Boolean(
    state.birth &&
    state.reference &&
    birth &&
    reference &&
    birthValid &&
    referenceValid
  );
  const hasInvalidOrder = Boolean(
    hasValidDates && birth && reference && birth > reference
  );
  const details =
    hasValidDates && !hasInvalidOrder && birth && reference
      ? calculateAgeDetails(birth, reference, language, { includeZodiac })
      : null;
  const numberFormatter = new Intl.NumberFormat(dateLocale);
  const summaryGuide = getSummaryGuide(language);
  const faqItems = [
    {
      question:
        language === "en"
          ? "Can I use past and future years?"
          : language === "es"
            ? "¿Puedo usar años pasados y futuros?"
            : "Posso usar anos passados e futuros?",
      answer:
        language === "en"
          ? "Yes. The tool accepts older dates, the current year and future years for comparison."
          : language === "es"
            ? "Sí. La herramienta acepta fechas antiguas, el año actual y años futuros para comparación."
            : "Sim. A ferramenta aceita datas antigas, o ano atual e anos futuros para comparação.",
    },
    {
      question:
        language === "en"
          ? "Does it work on mobile?"
          : language === "es"
            ? "¿Funciona en el celular?"
            : "Funciona no celular?",
      answer:
        language === "en"
          ? "Yes. The form and result cards were organized for smaller screens."
          : language === "es"
            ? "Sí. El formulario y las tarjetas de resultado fueron organizados para pantallas menores."
            : "Sim. O formulário e os cartões de resultado foram organizados para telas menores.",
    },
    {
      question:
        language === "en"
          ? "Can I see the weekday of my next birthday?"
          : language === "es"
            ? "¿Puedo ver el día del próximo cumpleaños?"
            : "Posso ver o dia do meu próximo aniversário?",
      answer:
        language === "en"
          ? "Yes. The result also shows the weekday of the next birthday date."
          : language === "es"
            ? "Sí. El resultado también muestra el día de la semana del próximo cumpleaños."
            : "Sim. O resultado também mostra o dia da semana do próximo aniversário.",
    },
    {
      question:
        language === "en"
          ? "Does the calculation consider leap years?"
          : language === "es"
            ? "¿El cálculo considera años bisiestos?"
            : "O cálculo considera anos bissextos?",
      answer:
        language === "en"
          ? "Yes. The algorithm accounts for leap years when counting months and days. February has 29 days in leap years and 28 in common years, and this is reflected in the final result. If you were born on February 29, the tool still calculates your age correctly for every reference date."
          : language === "es"
            ? "Sí. El algoritmo considera los años bisiestos al contar meses y días. Febrero tiene 29 días en años bisiestos y 28 en años comunes, y esto se refleja en el resultado final. Si nació el 29 de febrero, la herramienta calcula su edad correctamente para cualquier fecha de referencia."
            : "Sim. O algoritmo considera os anos bissextos ao contar meses e dias. Fevereiro tem 29 dias em anos bissextos e 28 em anos comuns, e isso é refletido no resultado final. Se você nasceu em 29 de fevereiro, a ferramenta ainda calcula sua idade corretamente para qualquer data de referência.",
    },
    {
      question:
        language === "en"
          ? "Can I calculate the age of another person?"
          : language === "es"
            ? "¿Puedo calcular la edad de otra persona?"
            : "Posso calcular a idade de outra pessoa?",
      answer:
        language === "en"
          ? "Absolutely. Simply enter that person's birth date in the first field and use today's date or any other reference date. The tool does not store personal data — the calculation happens entirely in your browser, so you can check the age of family members, friends or historical figures with complete privacy."
          : language === "es"
            ? "Por supuesto. Simplemente ingrese la fecha de nacimiento de esa persona en el primer campo y use la fecha de hoy o cualquier otra fecha de referencia. La herramienta no almacena datos personales — el cálculo ocurre completamente en su navegador, por lo que puede verificar la edad de familiares, amigos o figuras históricas con total privacidad."
            : "Com certeza. Basta inserir a data de nascimento da pessoa no primeiro campo e usar a data de hoje ou qualquer outra data de referência. A ferramenta não armazena dados pessoais — o cálculo acontece inteiramente no seu navegador, então você pode verificar a idade de familiares, amigos ou figuras históricas com total privacidade.",
    },
    {
      question:
        language === "en"
          ? "What does the age in months and days mean?"
          : language === "es"
            ? "¿Qué significa la edad en meses y días?"
            : "O que significa a idade em meses e dias?",
      answer:
        language === "en"
          ? "The months represent complete calendar months elapsed after your last full birthday year. The days represent the remaining days after those complete months. For example, if you are 30 years, 4 months and 12 days old, it means 30 full years have passed, plus 4 additional full months, plus 12 extra days since your last month anniversary."
          : language === "es"
            ? "Los meses representan meses calendario completos transcurridos después de su último año de cumpleaños completo. Los días representan los días restantes después de esos meses completos. Por ejemplo, si tiene 30 años, 4 meses y 12 días, significa que pasaron 30 años completos, más 4 meses completos adicionales, más 12 días extra desde su último aniversario mensual."
            : "Os meses representam meses-calendário completos transcorridos após o último ano completo de aniversário. Os dias representam os dias restantes após esses meses completos. Por exemplo, se você tem 30 anos, 4 meses e 12 dias, significa que 30 anos completos se passaram, mais 4 meses completos adicionais, mais 12 dias extras desde o último aniversário mensal.",
    },
    {
      question:
        language === "en"
          ? "How do I find when I turn 10,000 days old?"
          : language === "es"
            ? "¿Cómo saber cuándo cumplo 10.000 días de vida?"
            : "Como saber quando faço 10.000 dias de vida?",
      answer:
        language === "en"
          ? 'Enter your birth date and check the "Days alive" result. If you have not yet reached 10,000 days, you can adjust the reference date forward until the counter shows exactly 10,000. The same approach works for other milestones like 15,000 or 20,000 days. As a quick reference, 10,000 days is approximately 27 years and 4 months.'
          : language === "es"
            ? 'Ingrese su fecha de nacimiento y consulte el resultado de "Días de vida". Si aún no alcanzó los 10.000 días, puede ajustar la fecha de referencia hacia adelante hasta que el contador muestre exactamente 10.000. El mismo enfoque funciona para otros hitos como 15.000 o 20.000 días. Como referencia rápida, 10.000 días equivalen a aproximadamente 27 años y 4 meses.'
            : 'Insira sua data de nascimento e consulte o resultado de "Dias de vida". Se você ainda não atingiu 10.000 dias, pode ajustar a data de referência para frente até que o contador mostre exatamente 10.000. A mesma abordagem funciona para outros marcos como 15.000 ou 20.000 dias. Como referência rápida, 10.000 dias equivalem a aproximadamente 27 anos e 4 meses.',
    },
    {
      question:
        language === "en"
          ? "Does the tool work for old or historical dates?"
          : language === "es"
            ? "¿La herramienta funciona para fechas antiguas o históricas?"
            : "A ferramenta funciona para datas antigas?",
      answer:
        language === "en"
          ? "Yes. You can enter birth dates going back many decades. This is useful for genealogy research, calculating the age of historical figures at specific events, or simply verifying old family records. Keep in mind that calendar reforms (such as the switch from Julian to Gregorian) may affect accuracy for dates before the 1500s in some regions."
          : language === "es"
            ? "Sí. Puede ingresar fechas de nacimiento de muchas décadas atrás. Esto es útil para investigación genealógica, calcular la edad de figuras históricas en eventos específicos o simplemente verificar registros familiares antiguos. Tenga en cuenta que las reformas del calendario (como el cambio del juliano al gregoriano) pueden afectar la precisión para fechas anteriores al siglo XVI en algunas regiones."
            : "Sim. Você pode inserir datas de nascimento de muitas décadas atrás. Isso é útil para pesquisa genealógica, calcular a idade de figuras históricas em eventos específicos ou simplesmente verificar registros familiares antigos. Tenha em mente que reformas do calendário (como a mudança do juliano para o gregoriano) podem afetar a precisão para datas anteriores ao século XVI em algumas regiões.",
    },
  ];

  usePageSeo({
    title: copy.titleTag,
    description: copy.desc,
    path,
    keywords: copy.keywords,
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          name: copy.title,
          url: `https://datasuteis.com.br${path}`,
          description: copy.desc,
        },
        {
          ...buildBreadcrumbSchema(
            isHubPage
              ? [
                  { label: navigationLabels.home, href: "/" },
                  { label: navigationLabels.simulators },
                  {
                    label: navigationLabels.ageCalculator,
                    href: "/idade/",
                  },
                ]
              : [
                  { label: navigationLabels.home, href: "/" },
                  { label: navigationLabels.simulators },
                  {
                    label: navigationLabels.ageCalculator,
                    href: "/idade/",
                  },
                  { label: copy.title, href: path },
                ]
          ),
        },
        {
          "@type": "WebApplication",
          name: copy.title,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web",
          url: `https://datasuteis.com.br${path}`,
        },
      ],
    },
  });

  return (
    <PageShell
      eyebrow={labels.section}
      title={copy.title}
      description={copy.desc}
      navItems={navItems}
      topLabel={topLabel}
      breadcrumbs={breadcrumbs}
      breadcrumbAriaLabel={navigationLabels.breadcrumb}
      backButtonLabel={navigationLabels.back}
      backButtonAriaLabel={navigationLabels.backAria}
    >
      <div id="ferramenta" className="section-anchor page-stack">
        <div className="section-card" data-floating-focus>
          <div className="grid gap-4 md:grid-cols-2">
            <LocalizedDateInput
              label={labels.birth}
              language={language}
              value={state.birth}
              max={state.reference || undefined}
              autoComplete="bday"
              placeholderLabel={labels.formatHint}
              onValidityChange={setBirthValid}
              onChange={nextValue =>
                setState(current => ({ ...current, birth: nextValue }))
              }
            />

            <LocalizedDateInput
              label={labels.reference}
              language={language}
              value={state.reference}
              min={state.birth || undefined}
              autoComplete="off"
              placeholderLabel={labels.formatHint}
              onValidityChange={setReferenceValid}
              onChange={nextValue =>
                setState(current => ({ ...current, reference: nextValue }))
              }
            />
          </div>

          <label className="mt-4 inline-flex items-center gap-3 rounded-full border border-border px-4 py-2 text-sm">
            <input
              type="checkbox"
              checked={includeZodiac}
              onChange={event => setIncludeZodiac(event.target.checked)}
            />
            <span>{labels.zodiac}</span>
            <span className="text-muted-foreground">
              ({labels.optionalZodiac})
            </span>
          </label>

          {!hasValidDates ? (
            <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-100">
              {labels.invalidFormat}
            </p>
          ) : null}

          {hasInvalidOrder ? (
            <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-200">
              {labels.invalidOrder}
            </p>
          ) : null}

          {details ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <article className="rounded-3xl bg-primary/10 p-5">
                <p className="text-sm text-muted-foreground">{labels.exact}</p>
                <p className="mt-2 text-2xl font-bold text-primary">
                  {formatExactAge(
                    details.years,
                    details.months,
                    details.days,
                    language
                  )}
                </p>
              </article>

              <article className="rounded-3xl bg-secondary p-5">
                <p className="text-sm text-muted-foreground">
                  {labels.weekday}
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {details.weekdayOfBirth}
                </p>
              </article>

              <article className="rounded-3xl bg-secondary p-5">
                <p className="text-sm text-muted-foreground">{labels.days}</p>
                <p className="mt-2 text-2xl font-bold">
                  {numberFormatter.format(details.totalDaysAlive)}
                </p>
              </article>

              <article className="rounded-3xl bg-secondary p-5">
                <p className="text-sm text-muted-foreground">{labels.next}</p>
                <p className="mt-2 text-2xl font-bold">
                  {formatDate(details.nextBirthday)}
                </p>
              </article>

              <article className="rounded-3xl bg-secondary p-5">
                <p className="text-sm text-muted-foreground">{labels.until}</p>
                <p className="mt-2 text-2xl font-bold">
                  {numberFormatter.format(details.daysUntilNextBirthday)}
                </p>
              </article>

              <article className="rounded-3xl bg-secondary p-5">
                <p className="text-sm text-muted-foreground">
                  {labels.nextWeekday}
                </p>
                <p className="mt-2 text-lg font-bold">
                  {getWeekdayLabel(details.nextBirthday, language)}
                </p>
              </article>

              {details.zodiacSign ? (
                <article className="rounded-3xl bg-secondary p-5">
                  <p className="text-sm text-muted-foreground">
                    {labels.zodiac}
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {details.zodiacSign}
                  </p>
                </article>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border border-border/60 bg-secondary/20 px-4 py-3">
            <p className="text-xs leading-5 text-muted-foreground">
              {summaryGuide.title}
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {summaryGuide.items.map(item => (
                <article key={item.label} className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section id="explicacao" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">{copy.title}</h2>
          <div className="mt-5 page-grid">
            {getExplanationCards(language).map(item => (
              <article
                key={item}
                className="rounded-3xl bg-secondary p-5 text-sm leading-6 text-muted-foreground"
              >
                {item}
              </article>
            ))}
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold">
                {language === "en"
                  ? "How exact age calculation works"
                  : language === "es"
                    ? "Cómo funciona el cálculo de edad exacta"
                    : "Como funciona o cálculo de idade exata"}
              </h3>
              <div className="mt-3 space-y-3">
                <p className="text-sm leading-7 text-muted-foreground">
                  {language === "en"
                    ? "Calculating someone's exact age is not as simple as subtracting birth year from the current year. That approach ignores whether the birthday has already occurred this year, which can make the result off by a full year. A precise calculation counts complete years first, then the remaining complete months, and finally the leftover days. Each step respects the actual number of days in every month involved, including the shorter February in common years and the longer one in leap years."
                    : language === "es"
                      ? "Calcular la edad exacta de una persona no es tan simple como restar el año de nacimiento del año actual. Ese enfoque ignora si el cumpleaños ya ocurrió este año, lo que puede generar un error de un año completo. Un cálculo preciso cuenta primero los años completos, luego los meses completos restantes y finalmente los días sobrantes. Cada paso respeta la cantidad real de días de cada mes involucrado, incluyendo el febrero más corto en años comunes y el más largo en años bisiestos."
                      : "Calcular a idade exata de uma pessoa não é tão simples quanto subtrair o ano de nascimento do ano atual. Essa abordagem ignora se o aniversário já ocorreu neste ano, o que pode gerar um erro de um ano inteiro. Um cálculo preciso conta primeiro os anos completos, depois os meses completos restantes e por fim os dias que sobram. Cada etapa respeita a quantidade real de dias de cada mês envolvido, incluindo o fevereiro mais curto em anos comuns e o mais longo em anos bissextos."}
                </p>
                <p className="text-sm leading-7 text-muted-foreground">
                  {language === "en"
                    ? "Leap years add a subtle layer of complexity. A person born on February 29 may only see that exact date on the calendar every four years, yet their age still advances annually. Our calculator handles this correctly: it identifies whether each intermediate year is a leap year, adjusting the day count accordingly so that the final result in years, months and days is always accurate to the calendar."
                    : language === "es"
                      ? "Los años bisiestos añaden una capa sutil de complejidad. Una persona nacida el 29 de febrero solo ve esa fecha exacta en el calendario cada cuatro años, pero su edad sigue avanzando anualmente. Nuestra calculadora maneja esto correctamente: identifica si cada año intermedio es bisiesto y ajusta el conteo de días para que el resultado final en años, meses y días sea siempre preciso según el calendario."
                      : "Os anos bissextos adicionam uma camada sutil de complexidade. Uma pessoa nascida em 29 de fevereiro só vê essa data exata no calendário a cada quatro anos, mas a sua idade continua avançando anualmente. Nossa calculadora trata isso corretamente: identifica se cada ano intermediário é bissexto e ajusta a contagem de dias para que o resultado final em anos, meses e dias seja sempre preciso em relação ao calendário."}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold">
                {language === "en"
                  ? "Difference between years, months and days"
                  : language === "es"
                    ? "Diferencia entre años, meses y días"
                    : "Diferença entre anos, meses e dias"}
              </h3>
              <div className="mt-3 space-y-3">
                <p className="text-sm leading-7 text-muted-foreground">
                  {language === "en"
                    ? 'When an age is displayed as "30 years, 4 months and 12 days", each unit has a specific meaning. The years represent complete cycles from one birthday to the next. The months count additional complete calendar months after the last full year. The days are whatever remains after those full months. Because calendar months range from 28 to 31 days, the same number of "leftover days" can represent slightly different spans depending on which months are involved.'
                    : language === "es"
                      ? 'Cuando una edad se muestra como "30 años, 4 meses y 12 días", cada unidad tiene un significado específico. Los años representan ciclos completos de un cumpleaños al siguiente. Los meses cuentan meses calendario completos adicionales después del último año completo. Los días son lo que queda después de esos meses completos. Como los meses del calendario van de 28 a 31 días, la misma cantidad de "días restantes" puede representar períodos ligeramente diferentes según los meses involucrados.'
                      : 'Quando uma idade é exibida como "30 anos, 4 meses e 12 dias", cada unidade tem um significado específico. Os anos representam ciclos completos de um aniversário ao seguinte. Os meses contam meses-calendário completos adicionais após o último ano completo. Os dias são o que sobra depois desses meses completos. Como os meses do calendário variam de 28 a 31 dias, a mesma quantidade de "dias restantes" pode representar períodos ligeiramente diferentes dependendo dos meses envolvidos.'}
                </p>
                <p className="text-sm leading-7 text-muted-foreground">
                  {language === "en"
                    ? "This breakdown matters in practical situations. Legal age thresholds, for instance, are defined in complete years. Medical records sometimes track age in months for infants. And when filling in official forms, you may need to state exact age as of a specific date — not just the year you were born."
                    : language === "es"
                      ? "Este desglose es importante en situaciones prácticas. Los límites legales de edad, por ejemplo, se definen en años completos. Los registros médicos a veces miden la edad en meses para los bebés. Y al completar formularios oficiales, puede necesitar indicar la edad exacta en una fecha específica, no solo el año de nacimiento."
                      : "Essa divisão é importante em situações práticas. Limites legais de idade, por exemplo, são definidos em anos completos. Registros médicos às vezes medem a idade em meses no caso de bebês. E ao preencher formulários oficiais, pode ser necessário informar a idade exata em uma data específica — não apenas o ano em que nasceu."}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold">
                {language === "en"
                  ? "Why knowing your birth weekday matters"
                  : language === "es"
                    ? "Por qué importa saber el día de la semana en que nació"
                    : "Por que saber o dia da semana de nascimento"}
              </h3>
              <div className="mt-3 space-y-3">
                <p className="text-sm leading-7 text-muted-foreground">
                  {language === "en"
                    ? "The day of the week you were born carries cultural and practical significance in many traditions. In some cultures, each weekday is associated with personality traits or lucky elements. Beyond folklore, knowing your birth weekday is useful for verifying historical records, confirming document accuracy, or simply satisfying curiosity about the circumstances of your arrival. It is also a common question in school projects and trivia games."
                    : language === "es"
                      ? "El día de la semana en que nació tiene importancia cultural y práctica en muchas tradiciones. En algunas culturas, cada día de la semana está asociado con rasgos de personalidad o elementos de suerte. Más allá del folclore, conocer su día de nacimiento es útil para verificar registros históricos, confirmar la precisión de documentos o simplemente satisfacer la curiosidad sobre las circunstancias de su llegada. También es una pregunta común en proyectos escolares y juegos de trivia."
                      : "O dia da semana em que você nasceu carrega significado cultural e prático em muitas tradições. Em algumas culturas, cada dia da semana é associado a traços de personalidade ou elementos de sorte. Além do folclore, saber o dia de nascimento é útil para verificar registros históricos, confirmar a precisão de documentos ou simplesmente satisfazer a curiosidade sobre as circunstâncias do seu nascimento. Também é uma pergunta comum em trabalhos escolares e jogos de curiosidades."}
                </p>
                <p className="text-sm leading-7 text-muted-foreground">
                  {language === "en"
                    ? "From a planning perspective, knowing which weekday your birthday falls on each year helps organize celebrations. If your birthday lands on a Tuesday, you might schedule the party for the previous Saturday. Our tool shows not only the original birth weekday but also the weekday of your next birthday, helping you plan ahead."
                    : language === "es"
                      ? "Desde una perspectiva de planificación, saber en qué día de la semana cae su cumpleaños cada año ayuda a organizar celebraciones. Si su cumpleaños cae en martes, podría programar la fiesta para el sábado anterior. Nuestra herramienta muestra no solo el día original de nacimiento, sino también el día de la semana de su próximo cumpleaños, ayudándole a planificar con anticipación."
                      : "Do ponto de vista de planejamento, saber em que dia da semana o seu aniversário cai a cada ano ajuda a organizar comemorações. Se o seu aniversário cai numa terça-feira, você pode agendar a festa para o sábado anterior. Nossa ferramenta mostra não apenas o dia original de nascimento, mas também o dia da semana do próximo aniversário, ajudando no planejamento."}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold">
                {language === "en"
                  ? "What is the use of knowing your days alive"
                  : language === "es"
                    ? "Para qué sirve saber los días de vida"
                    : "Para que serve saber os dias de vida"}
              </h3>
              <div className="mt-3 space-y-3">
                <p className="text-sm leading-7 text-muted-foreground">
                  {language === "en"
                    ? "The total number of days you have been alive offers a unique perspective on time. While we usually measure our lives in years, seeing the number in days — often in the tens of thousands — gives a more granular and sometimes surprising sense of how much time has passed. Many people celebrate milestones such as 10,000 days alive (around age 27), 15,000 days (around age 41) or 20,000 days (around age 54) as a fun alternative to traditional birthday celebrations."
                    : language === "es"
                      ? "El número total de días que ha vivido ofrece una perspectiva única sobre el tiempo. Aunque normalmente medimos nuestras vidas en años, ver el número en días — a menudo en las decenas de miles — da una noción más detallada y a veces sorprendente de cuánto tiempo ha pasado. Muchas personas celebran hitos como 10.000 días de vida (alrededor de los 27 años), 15.000 días (alrededor de los 41) o 20.000 días (alrededor de los 54) como una alternativa divertida a las celebraciones de cumpleaños tradicionales."
                      : "O número total de dias que você viveu oferece uma perspectiva única sobre o tempo. Embora costumemos medir nossas vidas em anos, ver o número em dias — frequentemente na casa das dezenas de milhares — traz uma noção mais detalhada e às vezes surpreendente de quanto tempo já passou. Muitas pessoas celebram marcos como 10.000 dias de vida (por volta dos 27 anos), 15.000 dias (por volta dos 41) ou 20.000 dias (por volta dos 54) como uma alternativa divertida às celebrações tradicionais de aniversário."}
                </p>
                <p className="text-sm leading-7 text-muted-foreground">
                  {language === "en"
                    ? "Beyond curiosity, the days-alive figure can be meaningful for personal reflection or journaling. Some people use it as a gratitude exercise, recognizing that every single day is an accumulation of experiences. Educators also find it useful as a math exercise for students learning to work with large numbers and date arithmetic."
                    : language === "es"
                      ? "Más allá de la curiosidad, la cifra de días de vida puede ser significativa para la reflexión personal o el diario. Algunas personas la usan como un ejercicio de gratitud, reconociendo que cada día es una acumulación de experiencias. Los educadores también la encuentran útil como ejercicio matemático para estudiantes que aprenden a trabajar con números grandes y aritmética de fechas."
                      : "Além da curiosidade, o número de dias de vida pode ser significativo para reflexão pessoal ou diário. Algumas pessoas usam como exercício de gratidão, reconhecendo que cada dia é um acúmulo de experiências. Educadores também consideram útil como exercício de matemática para alunos aprendendo a trabalhar com números grandes e aritmética de datas."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="exemplos" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">{copy.title}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {getExampleCards(language).map(item => (
              <article
                key={item}
                className="rounded-3xl bg-secondary p-5 text-sm leading-6 text-muted-foreground"
              >
                {item}
              </article>
            ))}
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold">
                {language === "en"
                  ? "Filling forms and documents with exact age"
                  : language === "es"
                    ? "Completar formularios y documentos con la edad exacta"
                    : "Preenchendo formulários e documentos com a idade exata"}
              </h3>
              <div className="mt-3 space-y-3">
                <p className="text-sm leading-7 text-muted-foreground">
                  {language === "en"
                    ? "Many official forms — visa applications, insurance policies, school enrollments — ask for your exact age as of a specific date. Instead of doing mental math and risking a mistake, you can set the reference date to the exact date required by the form and get the precise answer in years, months and days. This avoids rounding errors that could cause delays or rejections in bureaucratic processes."
                    : language === "es"
                      ? "Muchos formularios oficiales — solicitudes de visa, pólizas de seguro, inscripciones escolares — solicitan su edad exacta en una fecha específica. En lugar de hacer cálculos mentales y arriesgarse a un error, puede configurar la fecha de referencia con la fecha exacta requerida por el formulario y obtener la respuesta precisa en años, meses y días. Esto evita errores de redondeo que podrían causar demoras o rechazos en procesos burocráticos."
                      : "Muitos formulários oficiais — pedidos de visto, apólices de seguro, matrículas escolares — pedem a idade exata em uma data específica. Em vez de fazer contas de cabeça e arriscar um erro, você pode definir a data de referência com a data exata exigida pelo formulário e obter a resposta precisa em anos, meses e dias. Isso evita erros de arredondamento que poderiam causar atrasos ou recusas em processos burocráticos."}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold">
                {language === "en"
                  ? "Checking age requirements"
                  : language === "es"
                    ? "Verificar requisitos de edad"
                    : "Verificando requisitos de idade"}
              </h3>
              <div className="mt-3 space-y-3">
                <p className="text-sm leading-7 text-muted-foreground">
                  {language === "en"
                    ? "Age thresholds govern many aspects of daily life. You must be 18 to vote or sign contracts in most countries. Senior benefits often start at 60 or 65. Retirement eligibility, youth sports leagues, driver's license minimums — all depend on a precise age on a specific date. With this tool, you can set the reference date to the cutoff date in question and immediately see whether the age requirement is met, down to the exact day."
                    : language === "es"
                      ? "Los límites de edad rigen muchos aspectos de la vida diaria. Debe tener 18 años para votar o firmar contratos en la mayoría de los países. Los beneficios para adultos mayores suelen comenzar a los 60 o 65 años. La elegibilidad para jubilación, ligas deportivas juveniles, edad mínima para licencia de conducir: todo depende de una edad precisa en una fecha específica. Con esta herramienta, puede configurar la fecha de referencia con la fecha límite en cuestión y ver inmediatamente si se cumple el requisito de edad, hasta el día exacto."
                      : "Limites de idade regem muitos aspectos da vida cotidiana. É preciso ter 18 anos para votar ou assinar contratos na maioria dos países. Benefícios para idosos geralmente começam aos 60 ou 65 anos. Elegibilidade para aposentadoria, ligas esportivas juvenis, idade mínima para carteira de motorista — tudo depende de uma idade precisa em uma data específica. Com esta ferramenta, você pode definir a data de referência com a data-limite em questão e ver imediatamente se o requisito de idade é atendido, até o dia exato."}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold">
                {language === "en"
                  ? "Planning milestone birthdays"
                  : language === "es"
                    ? "Planificar cumpleaños especiales"
                    : "Planejando aniversários marcantes"}
              </h3>
              <div className="mt-3 space-y-3">
                <p className="text-sm leading-7 text-muted-foreground">
                  {language === "en"
                    ? "Round-number birthdays like 30, 40 or 50 deserve special planning. Knowing not just the date but the weekday it falls on helps you decide whether to hold the party on the day itself or move it to a nearby weekend. The days-until-next-birthday counter also helps you gauge how much time you have left to prepare invitations, book a venue or organize a surprise."
                    : language === "es"
                      ? "Los cumpleaños de números redondos como 30, 40 o 50 merecen una planificación especial. Saber no solo la fecha sino el día de la semana en que cae le ayuda a decidir si celebrar el mismo día o mover la fiesta a un fin de semana cercano. El contador de días hasta el próximo cumpleaños también ayuda a calcular cuánto tiempo queda para preparar invitaciones, reservar un lugar u organizar una sorpresa."
                      : "Aniversários de números redondos como 30, 40 ou 50 merecem planejamento especial. Saber não apenas a data, mas o dia da semana em que ela cai, ajuda a decidir se a festa será no próprio dia ou transferida para o fim de semana mais próximo. O contador de dias até o próximo aniversário também ajuda a calcular quanto tempo resta para preparar convites, reservar um local ou organizar uma surpresa."}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold">
                {language === "en"
                  ? "Discovering your birth weekday for curiosity"
                  : language === "es"
                    ? "Descubrir su día de nacimiento por curiosidad"
                    : "Descobrindo o dia da semana do nascimento por curiosidade"}
              </h3>
              <div className="mt-3 space-y-3">
                <p className="text-sm leading-7 text-muted-foreground">
                  {language === "en"
                    ? '"What day of the week was I born?" is one of the most common curiosity-driven questions people search online. While birth certificates often list the date, they rarely mention the weekday. Our calculator fills that gap instantly. You can also check the birth weekday for family members and friends, turning it into a fun conversation topic at gatherings or even a quick icebreaker at social events.'
                    : language === "es"
                      ? '"¿En qué día de la semana nací?" es una de las preguntas de curiosidad más comunes que la gente busca en internet. Aunque los certificados de nacimiento suelen indicar la fecha, rara vez mencionan el día de la semana. Nuestra calculadora llena ese vacío al instante. También puede verificar el día de nacimiento de familiares y amigos, convirtiéndolo en un tema de conversación divertido en reuniones o incluso una forma rápida de romper el hielo en eventos sociales.'
                      : '"Em que dia da semana eu nasci?" é uma das perguntas de curiosidade mais comuns que as pessoas pesquisam na internet. Embora certidões de nascimento costumem informar a data, raramente mencionam o dia da semana. Nossa calculadora preenche essa lacuna instantaneamente. Você também pode verificar o dia de nascimento de familiares e amigos, transformando isso em um tema divertido de conversa em reuniões ou até em uma forma rápida de quebrar o gelo em eventos sociais.'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold">
                {language === "en"
                  ? "Educational use: teaching children about time"
                  : language === "es"
                    ? "Uso educativo: enseñar a los niños sobre el tiempo"
                    : "Uso educativo: ensinando crianças sobre o tempo"}
              </h3>
              <div className="mt-3 space-y-3">
                <p className="text-sm leading-7 text-muted-foreground">
                  {language === "en"
                    ? "For teachers and parents, an age calculator is an excellent hands-on tool for lessons about time, calendars and arithmetic. Children can enter their own birth date and see how their age breaks down into years, months and days — making abstract concepts concrete. Comparing the birth weekdays of classmates, calculating who has been alive the most days, or figuring out how many days until the next school holiday are all engaging exercises that reinforce math skills while keeping students interested."
                    : language === "es"
                      ? "Para profesores y padres, una calculadora de edad es una excelente herramienta práctica para lecciones sobre el tiempo, calendarios y aritmética. Los niños pueden ingresar su propia fecha de nacimiento y ver cómo su edad se descompone en años, meses y días, haciendo concretos los conceptos abstractos. Comparar los días de nacimiento de compañeros de clase, calcular quién ha vivido más días o averiguar cuántos días faltan para las próximas vacaciones escolares son ejercicios motivadores que refuerzan las habilidades matemáticas y mantienen el interés de los estudiantes."
                      : "Para professores e pais, uma calculadora de idade é uma excelente ferramenta prática para aulas sobre tempo, calendários e aritmética. As crianças podem inserir a própria data de nascimento e ver como a idade se divide em anos, meses e dias — tornando conceitos abstratos mais concretos. Comparar os dias da semana de nascimento dos colegas, calcular quem já viveu mais dias ou descobrir quantos dias faltam para as próximas férias escolares são exercícios envolventes que reforçam habilidades matemáticas e mantêm o interesse dos alunos."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">{labels.faq}</h2>
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
