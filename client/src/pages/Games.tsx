import { ArrowRight, BookOpen, Grid3X3, Search } from "lucide-react";
import { Link } from "wouter";
import PageShell from "@/components/layout/PageShell";
import { useI18n } from "@/contexts/LanguageContext";
import { buildBreadcrumbSchema, getNavigationLabels } from "@/lib/navigation";
import { getBackToTopLabel, getToolPageNavItems } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";
import type { SupportedLanguage } from "@/lib/site";

const COPY: Record<
  SupportedLanguage,
  {
    eyebrow: string;
    title: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
    cards: Array<{
      href: string;
      title: string;
      description: string;
      cta: string;
    }>;
    explanationTitle: string;
    explanationItems: string[];
    examplesTitle: string;
    exampleItems: string[];
    faqTitle: string;
    faqItems: Array<{ question: string; answer: string }>;
  }
> = {
  pt: {
    eyebrow: "Jogos",
    title: "Jogos leves para pausas rápidas",
    description:
      "Sudoku, caça-palavras e palavras cruzadas para pausas curtas, com ranking local e boa leitura em celular e computador.",
    seoTitle:
      "Jogos Online Grátis | Sudoku, Caça-Palavras e Palavras Cruzadas | Datas Úteis",
    seoDescription:
      "Jogue Sudoku, caça-palavras e palavras cruzadas online grátis em uma área organizada para pausas curtas e boa leitura no celular e no computador.",
    cards: [
      {
        href: "/jogos/sudoku/",
        title: "Sudoku",
        description:
          "Grade 9x9 com quatro níveis, timer, verificação de progresso e Top 10 salvo neste navegador.",
        cta: "Abrir Sudoku",
      },
      {
        href: "/jogos/caca-palavras/",
        title: "Caça-Palavras",
        description:
          "Categorias temáticas, dicas, pontuação, streak e ranking local por dificuldade.",
        cta: "Abrir Caça-Palavras",
      },
      {
        href: "/jogos/palavras-cruzadas/",
        title: "Palavras Cruzadas",
        description:
          "Grade compacta com teclado virtual, verificação, dicas e ranking local.",
        cta: "Abrir Palavras Cruzadas",
      },
    ],
    explanationTitle: "Jogos para pausas curtas",
    explanationItems: [
      "Escolha uma partida rápida para descansar entre tarefas sem sair do navegador.",
      "Cada jogo funciona sem cadastro, com leitura confortável em celular e computador.",
      "O ranking fica salvo apenas neste dispositivo, com Top 10 por dificuldade.",
    ],
    examplesTitle: "Quando usar",
    exampleItems: [
      "Use Sudoku quando quiser uma pausa curta com foco em lógica, leitura de padrões e atenção.",
      "Use Caça-Palavras para uma rodada rápida com pontuação, dica e leitura visual mais dinâmica.",
      "Use Palavras Cruzadas para partidas com pistas curtas, teclado virtual e leitura mais analítica.",
    ],
    faqTitle: "Perguntas frequentes",
    faqItems: [
      {
        question: "Preciso criar conta para jogar?",
        answer:
          "Não. As partidas rodam direto no navegador.",
      },
      {
        question: "Os rankings são públicos?",
        answer:
          "Não. Cada jogo salva o Top 10 localmente neste navegador, sem criar perfil externo.",
      },
      {
        question: "Dá para jogar no celular?",
        answer:
          "Sim. As páginas foram organizadas para leitura e toque em telas menores.",
      },
    ],
  },
  en: {
    eyebrow: "Games",
    title: "Light games for quick breaks",
    description:
      "Sudoku, word search and crosswords for short breaks, with local rankings and comfortable reading on mobile and desktop.",
    seoTitle: "Games | Sudoku, Word Search and Crosswords | Datas Úteis",
    seoDescription:
      "Play Sudoku, word search and crosswords in a dedicated area designed for short breaks on mobile and desktop.",
    cards: [
      {
        href: "/jogos/sudoku/",
        title: "Sudoku",
        description:
          "9x9 board with four levels, timer, progress validation and local Top 10 ranking.",
        cta: "Open Sudoku",
      },
      {
        href: "/jogos/caca-palavras/",
        title: "Word Search",
        description:
          "Themed categories, hints, scoring, streak and local ranking by difficulty.",
        cta: "Open Word Search",
      },
      {
        href: "/jogos/palavras-cruzadas/",
        title: "Crossword",
        description:
          "Compact board with virtual keyboard, validation, hints and local ranking.",
        cta: "Open Crossword",
      },
    ],
    explanationTitle: "Games for short breaks",
    explanationItems: [
      "Pick a quick round to take a break without leaving the browser.",
      "Each game runs without sign-up and keeps touch-friendly reading on mobile and desktop.",
      "Rankings stay on this device only, with a Top 10 for each difficulty.",
    ],
    examplesTitle: "When to use it",
    exampleItems: [
      "Use Sudoku for a short break focused on logic and pattern reading.",
      "Use Word Search for a quicker round with score, hint and visual scanning.",
      "Use Crossword for clue-based play with virtual keyboard support.",
    ],
    faqTitle: "Frequently asked questions",
    faqItems: [
      {
        question: "Do I need an account to play?",
        answer:
          "No. The games run directly in the browser.",
      },
      {
        question: "Are rankings public?",
        answer: "No. Each game saves its own local Top 10 in this browser.",
      },
      {
        question: "Can I play on mobile?",
        answer: "Yes. The pages are organized for touch and smaller screens.",
      },
    ],
  },
  es: {
    eyebrow: "Juegos",
    title: "Juegos ligeros para pausas rápidas",
    description:
      "Sudoku, sopa de letras y crucigramas para pausas cortas, con ranking local y buena lectura en móvil y escritorio.",
    seoTitle: "Juegos | Sudoku, Sopa de Letras y Crucigrama | Datas Úteis",
    seoDescription:
      "Juegue Sudoku, sopa de letras y crucigramas en un área dedicada para pausas cortas en móvil y escritorio.",
    cards: [
      {
        href: "/jogos/sudoku/",
        title: "Sudoku",
        description:
          "Cuadrícula 9x9 con cuatro niveles, temporizador, validación de progreso y Top 10 local.",
        cta: "Abrir Sudoku",
      },
      {
        href: "/jogos/caca-palavras/",
        title: "Sopa de letras",
        description:
          "Categorías temáticas, pistas, puntuación, racha y ranking local por dificultad.",
        cta: "Abrir sopa de letras",
      },
      {
        href: "/jogos/palavras-cruzadas/",
        title: "Crucigrama",
        description:
          "Cuadrícula compacta con teclado virtual, validación, pistas y ranking local.",
        cta: "Abrir crucigrama",
      },
    ],
    explanationTitle: "Juegos para pausas cortas",
    explanationItems: [
      "Elija una partida rápida para hacer una pausa sin salir del navegador.",
      "Cada juego funciona sin registro y mantiene lectura cómoda en móvil y escritorio.",
      "El ranking se guarda solo en este dispositivo, con Top 10 por dificultad.",
    ],
    examplesTitle: "Cuándo usar",
    exampleItems: [
      "Use Sudoku cuando quiera una pausa corta con foco en lógica y patrones.",
      "Use la sopa de letras para una ronda rápida con puntuación, pista y lectura visual.",
      "Use el crucigrama para partidas con pistas cortas y teclado virtual.",
    ],
    faqTitle: "Preguntas frecuentes",
    faqItems: [
      {
        question: "¿Necesito una cuenta para jugar?",
        answer:
          "No. Las partidas funcionan directamente en el navegador.",
      },
      {
        question: "¿Los rankings son públicos?",
        answer: "No. Cada juego guarda su Top 10 localmente en este navegador.",
      },
      {
        question: "¿Se puede jugar en el celular?",
        answer:
          "Sí. Las páginas fueron organizadas para toque y pantallas menores.",
      },
    ],
  },
};

export default function Games() {
  const { language } = useI18n();
  const copy = COPY[language] ?? COPY.pt;
  const navigationLabels = getNavigationLabels(language);
  const navItems = getToolPageNavItems(language);
  const topLabel = getBackToTopLabel(language);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.games },
  ];

  usePageSeo({
    title: copy.seoTitle,
    description: copy.seoDescription,
    path: "/jogos/",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Jogos Online Grátis | Datas Úteis",
        url: "https://datasuteis.com.br/jogos/",
        description:
          "Jogue Sudoku, caça-palavras e palavras cruzadas em uma área dedicada do Datas Úteis.",
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: copy.cards.map((game, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: game.title,
          url: `https://datasuteis.com.br${game.href}`,
        })),
      },
      buildBreadcrumbSchema([
        { label: navigationLabels.home, href: "/" },
        { label: navigationLabels.games, href: "/jogos/" },
      ]),
    ],
  });

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
      language={language}
      ctaTitle={language === "en" ? "Discover all Datas Úteis tools" : language === "es" ? "Descubra todas las herramientas de Datas Úteis" : "Conheça todas as ferramentas do Datas Úteis"}
      ctaButtonLabel={language === "en" ? "Explore tools" : language === "es" ? "Explorar herramientas" : "Explorar ferramentas"}
      ctaHref="/"
    >
      <section id="ferramenta" className="section-anchor">
        <div className="section-card">
          <div className="page-grid">
            {copy.cards.map(game => {
              const Icon =
                game.href === "/jogos/sudoku/"
                  ? Grid3X3
                  : game.href === "/jogos/caca-palavras/"
                    ? Search
                    : BookOpen;

              return (
                <Link
                  key={game.href}
                  href={game.href}
                  className="card-base card-hover block p-6"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-2xl font-bold">{game.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {game.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 font-semibold text-primary">
                    {game.cta}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

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
