import { useEffect, useMemo, useState } from "react";
import { Copy, Dices, Users } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import { useI18n } from "@/contexts/LanguageContext";
import { buildBreadcrumbSchema, getNavigationLabels } from "@/lib/navigation";
import { getBackToTopLabel, getToolPageNavItems } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";
import type { SupportedLanguage } from "@/lib/site";

type PickerMode = "numbers" | "names";

interface StoredDrawResult {
  mode: PickerMode;
  result: string;
  createdAt: string;
}

const STORAGE_KEY = "datasuteis_last_random_draw_v1";

const COPY: Record<
  SupportedLanguage,
  {
    eyebrow: string;
    title: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
    modeNumbers: string;
    modeNames: string;
    startLabel: string;
    endLabel: string;
    amountLabel: string;
    namesLabel: string;
    namesPlaceholder: string;
    namesCount: (count: number) => string;
    drawNow: string;
    copyResult: string;
    currentResult: string;
    waitingResult: string;
    lastResult: string;
    noResult: string;
    savedModeLabel: Record<PickerMode, string>;
    explanationTitle: string;
    explanationItems: string[];
    examplesTitle: string;
    exampleItems: string[];
    faqTitle: string;
    faqItems: Array<{ question: string; answer: string }>;
    errors: {
      integer: string;
      invalidRange: string;
      invalidAmount: string;
      missingName: string;
    };
  }
> = {
  pt: {
    eyebrow: "Utilitários",
    title: "Sorteador de números e nomes",
    description:
      "Faça sorteios simples no navegador para escolher números únicos, definir ordem de atendimento ou selecionar nomes sem depender de planilha.",
    seoTitle: "Sorteador Online | Números e Nomes | Datas Úteis",
    seoDescription:
      "Sorteie números únicos ou escolha nomes aleatoriamente com resultado copiável e histórico local do último sorteio.",
    modeNumbers: "Modo números",
    modeNames: "Modo nomes",
    startLabel: "Valor inicial",
    endLabel: "Valor final",
    amountLabel: "Quantidade",
    namesLabel: "Lista de nomes",
    namesPlaceholder: "Um nome por linha\nAté 50 nomes",
    namesCount: count => `${count}/50 nomes considerados`,
    drawNow: "Sortear agora",
    copyResult: "Copiar resultado",
    currentResult: "Resultado atual",
    waitingResult: "Aguardando sorteio",
    lastResult: "Último sorteio salvo neste navegador",
    noResult: "Nenhum sorteio salvo ainda.",
    savedModeLabel: {
      numbers: "Modo números",
      names: "Modo nomes",
    },
    explanationTitle: "Como funciona",
    explanationItems: [
      "No modo números, o sorteador cria uma lista única a partir do intervalo informado e embaralha os valores antes de selecionar a quantidade desejada.",
      "No modo nomes, a ferramenta lê até 50 linhas, remove vazios e escolhe um nome aleatoriamente.",
      "O último resultado fica salvo no localStorage do navegador para consulta rápida na próxima visita.",
    ],
    examplesTitle: "Exemplos de uso",
    exampleItems: [
      "Sorteie 3 números entre 1 e 20 para distribuir ordem de atendimento, mesa ou sequência de apresentação.",
      "Cole a lista da equipe para escolher quem ficará com uma tarefa rotativa, brinde interno ou dinâmica rápida.",
      "Use o resultado copiado para registrar o sorteio em chat interno, e-mail ou ata simples.",
    ],
    faqTitle: "Perguntas frequentes",
    faqItems: [
      {
        question: "Os números podem se repetir?",
        answer:
          "Não. No modo números o resultado é sempre composto por valores únicos dentro do intervalo informado.",
      },
      {
        question: "Quantos nomes posso colar?",
        answer: "Até 50 nomes. Linhas vazias são ignoradas automaticamente.",
      },
      {
        question: "O último sorteio é compartilhado com outras pessoas?",
        answer:
          "Não. O histórico fica salvo apenas neste navegador, usando armazenamento local.",
      },
    ],
    errors: {
      integer: "Preencha o intervalo e a quantidade com números inteiros.",
      invalidRange: "O valor final precisa ser maior que o valor inicial.",
      invalidAmount:
        "A quantidade precisa caber dentro do intervalo informado.",
      missingName: "Informe pelo menos um nome para sortear.",
    },
  },
  en: {
    eyebrow: "Utilities",
    title: "Random picker for numbers and names",
    description:
      "Run simple browser draws to pick unique numbers, define service order or select names without using spreadsheets.",
    seoTitle: "Random Picker | Numbers and Names | Datas Úteis",
    seoDescription:
      "Draw unique numbers or choose names randomly with copyable output and the latest local result saved in the browser.",
    modeNumbers: "Numbers mode",
    modeNames: "Names mode",
    startLabel: "Start value",
    endLabel: "End value",
    amountLabel: "Amount",
    namesLabel: "Names list",
    namesPlaceholder: "One name per line\nUp to 50 names",
    namesCount: count => `${count}/50 names considered`,
    drawNow: "Draw now",
    copyResult: "Copy result",
    currentResult: "Current result",
    waitingResult: "Waiting for draw",
    lastResult: "Latest draw saved in this browser",
    noResult: "No saved draw yet.",
    savedModeLabel: {
      numbers: "Numbers mode",
      names: "Names mode",
    },
    explanationTitle: "How it works",
    explanationItems: [
      "In numbers mode, the picker builds a unique list from the informed range and shuffles the values before selecting the requested amount.",
      "In names mode, the tool reads up to 50 lines, removes blanks and chooses one name randomly.",
      "The latest result stays saved in localStorage for quick reference on the next visit.",
    ],
    examplesTitle: "Examples",
    exampleItems: [
      "Draw 3 numbers between 1 and 20 to define service order, seats or presentation sequence.",
      "Paste a team list to choose who handles a rotating task, internal gift or quick activity.",
      "Use the copied result to document the draw in chat, email or simple notes.",
    ],
    faqTitle: "Frequently asked questions",
    faqItems: [
      {
        question: "Can numbers repeat?",
        answer:
          "No. In numbers mode, the result always contains unique values within the informed range.",
      },
      {
        question: "How many names can I paste?",
        answer: "Up to 50 names. Empty lines are ignored automatically.",
      },
      {
        question: "Is the last draw shared with other people?",
        answer:
          "No. The history stays stored only in this browser using local storage.",
      },
    ],
    errors: {
      integer: "Fill the range and amount using whole numbers.",
      invalidRange: "The end value must be greater than the start value.",
      invalidAmount: "The requested amount must fit within the informed range.",
      missingName: "Provide at least one name to draw.",
    },
  },
  es: {
    eyebrow: "Utilidades",
    title: "Sorteador de números y nombres",
    description:
      "Realice sorteos simples en el navegador para elegir números únicos, definir orden de atención o seleccionar nombres sin usar planillas.",
    seoTitle: "Sorteador | Números y Nombres | Datas Úteis",
    seoDescription:
      "Sortee números únicos o elija nombres aleatoriamente con resultado copiable e historial local del último sorteo.",
    modeNumbers: "Modo números",
    modeNames: "Modo nombres",
    startLabel: "Valor inicial",
    endLabel: "Valor final",
    amountLabel: "Cantidad",
    namesLabel: "Lista de nombres",
    namesPlaceholder: "Un nombre por línea\nHasta 50 nombres",
    namesCount: count => `${count}/50 nombres considerados`,
    drawNow: "Sortear ahora",
    copyResult: "Copiar resultado",
    currentResult: "Resultado actual",
    waitingResult: "Esperando sorteo",
    lastResult: "Último sorteo guardado en este navegador",
    noResult: "Todavía no hay sorteos guardados.",
    savedModeLabel: {
      numbers: "Modo números",
      names: "Modo nombres",
    },
    explanationTitle: "Cómo funciona",
    explanationItems: [
      "En modo números, el sorteador crea una lista única a partir del intervalo informado y mezcla los valores antes de seleccionar la cantidad deseada.",
      "En modo nombres, la herramienta lee hasta 50 líneas, elimina vacíos y elige un nombre aleatoriamente.",
      "El último resultado queda guardado en el localStorage del navegador para consulta rápida en la próxima visita.",
    ],
    examplesTitle: "Ejemplos de uso",
    exampleItems: [
      "Sortee 3 números entre 1 y 20 para distribuir orden de atención, mesa o secuencia de presentación.",
      "Pegue la lista del equipo para elegir quién realizará una tarea rotativa, un premio interno o una dinámica rápida.",
      "Use el resultado copiado para registrar el sorteo en chat, correo o acta simple.",
    ],
    faqTitle: "Preguntas frecuentes",
    faqItems: [
      {
        question: "¿Los números pueden repetirse?",
        answer:
          "No. En modo números el resultado siempre se compone de valores únicos dentro del intervalo informado.",
      },
      {
        question: "¿Cuántos nombres puedo pegar?",
        answer:
          "Hasta 50 nombres. Las líneas vacías se ignoran automáticamente.",
      },
      {
        question: "¿El último sorteo se comparte con otras personas?",
        answer:
          "No. El historial queda guardado solo en este navegador mediante almacenamiento local.",
      },
    ],
    errors: {
      integer: "Complete el intervalo y la cantidad con números enteros.",
      invalidRange: "El valor final debe ser mayor que el valor inicial.",
      invalidAmount: "La cantidad debe caber dentro del intervalo informado.",
      missingName: "Informe al menos un nombre para sortear.",
    },
  },
};

function shuffleNumbers(values: number[]) {
  const next = [...values];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

export default function RandomPicker() {
  const { language, formatDate } = useI18n();
  const copy = COPY[language] ?? COPY.pt;
  const navigationLabels = getNavigationLabels(language);
  const navItems = getToolPageNavItems(language);
  const topLabel = getBackToTopLabel(language);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.utilities, href: "/utilitarios/" },
    { label: copy.title },
  ];
  const [mode, setMode] = useState<PickerMode>("numbers");
  const [start, setStart] = useState("1");
  const [end, setEnd] = useState("50");
  const [amount, setAmount] = useState("5");
  const [namesInput, setNamesInput] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [lastResult, setLastResult] = useState<StoredDrawResult | null>(null);

  usePageSeo({
    title: copy.seoTitle,
    description: copy.seoDescription,
    path: "/utilitarios/sorteador/",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Sorteador Online",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        url: "https://datasuteis.com.br/utilitarios/sorteador/",
      },
      buildBreadcrumbSchema([
        { label: navigationLabels.home, href: "/" },
        { label: navigationLabels.utilities, href: "/utilitarios/" },
        { label: copy.title, href: "/utilitarios/sorteador/" },
      ]),
    ],
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as StoredDrawResult;
      if (parsed?.result && parsed?.createdAt) {
        setLastResult(parsed);
      }
    } catch {
      // Ignore storage issues and keep the tool functional.
    }
  }, []);

  const parsedNames = useMemo(
    () =>
      namesInput
        .split(/\r?\n/g)
        .map(name => name.trim())
        .filter(Boolean)
        .slice(0, 50),
    [namesInput]
  );

  function persistResult(nextMode: PickerMode, nextResult: string) {
    const payload = {
      mode: nextMode,
      result: nextResult,
      createdAt: new Date().toISOString(),
    } satisfies StoredDrawResult;

    setLastResult(payload);
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage issues and keep the tool functional.
    }
  }

  function handleDrawNumbers() {
    const min = Number(start);
    const max = Number(end);
    const quantity = Number(amount);

    if (
      !Number.isInteger(min) ||
      !Number.isInteger(max) ||
      !Number.isInteger(quantity)
    ) {
      setError(copy.errors.integer);
      return;
    }

    if (min >= max) {
      setError(copy.errors.invalidRange);
      return;
    }

    const available = max - min + 1;
    if (quantity < 1 || quantity > available) {
      setError(copy.errors.invalidAmount);
      return;
    }

    const pool = Array.from({ length: available }, (_, index) => index + min);
    const selected = shuffleNumbers(pool)
      .slice(0, quantity)
      .sort((left, right) => left - right);
    const nextResult = selected.join(", ");
    setError("");
    setResult(nextResult);
    persistResult("numbers", nextResult);
  }

  function handleDrawNames() {
    if (!parsedNames.length) {
      setError(copy.errors.missingName);
      return;
    }

    const uniqueNames = Array.from(new Set(parsedNames));
    const selected =
      uniqueNames[Math.floor(Math.random() * uniqueNames.length)];
    setError("");
    setResult(selected);
    persistResult("names", selected);
  }

  async function copyResult() {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(result);
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
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={mode === "numbers" ? "btn-primary" : "btn-secondary"}
              onClick={() => {
                setMode("numbers");
                setError("");
              }}
            >
              <span className="inline-flex items-center gap-2">
                <Dices className="h-4 w-4" />
                {copy.modeNumbers}
              </span>
            </button>
            <button
              type="button"
              className={mode === "names" ? "btn-primary" : "btn-secondary"}
              onClick={() => {
                setMode("names");
                setError("");
              }}
            >
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4" />
                {copy.modeNames}
              </span>
            </button>
          </div>

          {mode === "numbers" ? (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-semibold">{copy.startLabel}</span>
                <input
                  className="input-base w-full"
                  value={start}
                  onChange={event => setStart(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold">{copy.endLabel}</span>
                <input
                  className="input-base w-full"
                  value={end}
                  onChange={event => setEnd(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold">
                  {copy.amountLabel}
                </span>
                <input
                  className="input-base w-full"
                  value={amount}
                  onChange={event => setAmount(event.target.value)}
                />
              </label>
            </div>
          ) : (
            <div className="mt-6 space-y-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold">{copy.namesLabel}</span>
                <textarea
                  className="input-base min-h-52 w-full"
                  value={namesInput}
                  onChange={event => setNamesInput(event.target.value)}
                  placeholder={copy.namesPlaceholder}
                />
              </label>
              <p className="text-sm text-muted-foreground">
                {copy.namesCount(parsedNames.length)}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={mode === "numbers" ? handleDrawNumbers : handleDrawNames}
              className="btn-primary"
            >
              {copy.drawNow}
            </button>
            <button
              type="button"
              onClick={copyResult}
              className="btn-secondary"
              disabled={!result}
            >
              <span className="inline-flex items-center gap-2">
                <Copy className="h-4 w-4" />
                {copy.copyResult}
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
              <p className="text-sm text-muted-foreground">
                {copy.currentResult}
              </p>
              <p className="mt-3 text-2xl font-bold text-primary">
                {result || copy.waitingResult}
              </p>
            </article>

            <article className="rounded-2xl bg-secondary p-5 md:col-span-2">
              <p className="text-sm text-muted-foreground">{copy.lastResult}</p>
              {lastResult ? (
                <>
                  <p className="mt-3 text-lg font-semibold">
                    {lastResult.result}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {copy.savedModeLabel[lastResult.mode]} •{" "}
                    {formatDate(lastResult.createdAt)}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  {copy.noResult}
                </p>
              )}
            </article>
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
                className="rounded-2xl bg-secondary px-5 py-4"
                key={item.question}
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
