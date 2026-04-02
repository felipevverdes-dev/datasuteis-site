import * as esbuild from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, "dist", "public");
const SOURCE_SITEMAP = path.join(ROOT, "client", "public", "sitemap.xml");
const PRERENDER_BUNDLE = path.join(ROOT, "dist", ".seo-prerender.mjs");
const BLOG_DATA_BUNDLE = path.join(ROOT, "dist", ".seo-blog-data.mjs");
const SITE_URL = "https://datasuteis.com.br";
const SITE_NAME = "Datas Úteis";
const SITE_LAST_MODIFIED_DATE = "2026-04-02";
const SITE_LAST_MODIFIED_DATETIME = "2026-04-02T00:00:00-03:00";
const MIN_SUPPORTED_YEAR = 1900;
const MAX_SUPPORTED_YEAR = 2100;
const PRIORITY_PRERENDER_PATHS = new Set([
  "/",
  "/calcular/",
  "/idade/",
  "/calendario/",
  "/escala/",
]);
const MONTHS = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];
const HOME_FAQ = [
  {
    question: "O Datas Úteis é gratuito?",
    answer:
      "Sim. As ferramentas principais podem ser usadas gratuitamente e sem cadastro.",
  },
  {
    question: "A calculadora considera feriados?",
    answer:
      "Sim. A leitura padrão considera feriados nacionais e permite filtros locais na calculadora.",
  },
  {
    question: "Posso usar o site no celular?",
    answer:
      "Sim. As páginas principais foram organizadas para telas menores e toques rápidos.",
  },
];
const CALCULATOR_FAQ = [
  {
    question: "A calculadora mostra finais de semana e feriados?",
    answer:
      "Sim. O resultado separa dias úteis, dias corridos, finais de semana e os feriados abatidos do cálculo.",
  },
  {
    question: "Quais feriados entram no cálculo?",
    answer:
      "Os feriados nacionais sempre entram. Os feriados estaduais e municipais são somados quando você seleciona a localidade.",
  },
  {
    question: "Posso somar e subtrair dias úteis?",
    answer:
      "Sim. A ferramenta tem modos separados para contar um intervalo, somar dias de trabalho e subtrair dias úteis.",
  },
];
const AGE_FAQ = [
  {
    question: "Posso usar anos passados e futuros?",
    answer:
      "Sim. A ferramenta aceita datas antigas, o ano atual e anos futuros para comparação.",
  },
  {
    question: "Funciona no celular?",
    answer:
      "Sim. O formulário e os cartões de resultado foram organizados para telas menores.",
  },
  {
    question: "Posso ver o dia do próximo aniversário?",
    answer:
      "Sim. O resultado também mostra o dia da semana do próximo aniversário.",
  },
];
const CALENDAR_FAQ = [
  {
    question: "Posso trocar a localidade manualmente?",
    answer:
      "Sim. Estado e município mudam a base de feriados aplicada ao mês.",
  },
  {
    question: "O que acontece se a localização não for detectada?",
    answer:
      "O calendário mantém a base nacional e você pode escolher a localidade manualmente.",
  },
];
const SCHEDULE_FAQ = [
  {
    question: "O simulador substitui uma revisão legal?",
    answer:
      "Não. Ele ajuda a comparar cenários e cobertura, mas a validação formal depende da operação real.",
  },
  {
    question: "Posso testar cargas diferentes por colaborador?",
    answer:
      "Sim. O bloco de ajuste permite alterar a carga considerada e rodar a simulação novamente.",
  },
  {
    question: "Quais escalas posso comparar aqui?",
    answer:
      "O simulador ajuda a comparar arranjos comuns como 5x2, 6x1 e 12x36 antes de levar isso para uma operação real.",
  },
];
const HOME_LABEL = "Início";
const SIMULATORS_LABEL = "Simuladores";
const BUSINESS_DAYS_LABEL = "Dias Úteis";
const WORK_SCHEDULES_LABEL = "Escalas de Trabalho";
const AGE_CALCULATOR_LABEL = "Calculadora de Idade";
const CALENDAR_LABEL = "Calendário";
const BLOG_LABEL = "Blog";
const UTILITIES_LABEL = "Utilitários";
const GAMES_LABEL = "Jogos";
const BRAIN_GAMES_LABEL = "Raciocínio";
const ABOUT_LABEL = "Sobre";

const lastmod = SITE_LAST_MODIFIED_DATE;

function monthLabel(month, year) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  })
    .format(new Date(year, month - 1, 1))
    .replace(/^\w/, letter => letter.toUpperCase());
}

function route(
  pathname,
  title,
  description,
  priority = "0.7",
  changefreq = "monthly",
  options = {}
) {
  return {
    pathname,
    title,
    description,
    breadcrumbLabel: options.breadcrumbLabel ?? title.replace(/\s+\|\s+Datas Úteis$/, ""),
    priority,
    changefreq,
    robots: options.robots ?? "index, follow",
    type: options.type ?? "website",
    prerender: PRIORITY_PRERENDER_PATHS.has(pathname),
    sitemap: options.sitemap ?? true,
    ...options,
  };
}

function buildBlogRoutes(blogPosts) {
  return blogPosts.map(post =>
    route(
      `/blog/${post.slug}/`,
      `${post.title} | Datas Úteis`,
      post.description,
      "0.64",
      "weekly",
      {
        type: "article",
        breadcrumbLabel: post.title,
      }
    )
  );
}

function buildRoutes(blogPosts) {
  const routes = [
    route(
      "/",
      "Datas Úteis: dias úteis, calendário, feriados, ferramentas",
      "Calcule dias úteis, consulte o calendário com feriados, simule escalas de trabalho, descubra sua idade exata, jogue e use ferramentas online grátis.",
      "1.0",
      "weekly",
      { breadcrumbLabel: HOME_LABEL }
    ),
    route(
      "/calcular/",
      "Calcular dias úteis, somar e subtrair prazos | Datas Úteis",
      "Conte dias úteis entre datas, some dias de trabalho ou subtraia prazos com uma calculadora mais completa.",
      "0.9",
      "monthly",
      { breadcrumbLabel: BUSINESS_DAYS_LABEL }
    ),
    route(
      "/calendario/",
      "Calendário com fins de semana e feriados | Datas Úteis",
      "Abra o calendário principal com leitura rápida de meses, finais de semana e feriados.",
      "0.8",
      "yearly",
      { breadcrumbLabel: CALENDAR_LABEL }
    ),
    route(
      "/escala/",
      "Simulador de escalas de trabalho | Datas Úteis",
      "Simule escalas de trabalho, cobertura mensal e quadro mínimo em cenários de operação.",
      "0.8",
      "monthly",
      { breadcrumbLabel: WORK_SCHEDULES_LABEL }
    ),
    route(
      "/idade/",
      "Calcular idade, dia da semana e dias de vida | Datas Úteis",
      "Calcule idade exata, dias de vida, dia da semana de nascimento e próximo aniversário em uma só ferramenta.",
      "0.8",
      "monthly",
      { breadcrumbLabel: AGE_CALCULATOR_LABEL }
    ),
    route(
      "/idade/calcular-idade/",
      "Calcular idade exata online | Datas Úteis",
      "Calcule idade exata em anos, meses e dias com uma ferramenta rápida para celular e computador.",
      "0.82"
    ),
    route(
      "/idade/data-de-nascimento/",
      "Dados da data de nascimento | Datas Úteis",
      "Consulte idade, dia da semana de nascimento, dias de vida e próximo aniversário.",
      "0.8"
    ),
    route(
      "/idade/dia-da-semana-que-nasceu/",
      "Em que dia da semana eu nasci | Datas Úteis",
      "Descubra em que dia da semana você nasceu e veja outros dados úteis da sua data de nascimento.",
      "0.82"
    ),
    route(
      "/idade/quantos-dias-eu-tenho-de-vida/",
      "Quantos dias de vida eu tenho | Datas Úteis",
      "Calcule quantos dias de vida você tem e veja idade exata, dia da semana de nascimento e próximo aniversário.",
      "0.82"
    ),
    route(
      "/dias-uteis/",
      "Dias úteis por ano e mês | Datas Úteis",
      "Explore páginas de dias úteis por ano e mês para comparar períodos e consultar feriados.",
      "0.9",
      "monthly",
      { breadcrumbLabel: BUSINESS_DAYS_LABEL }
    ),
    route(
      "/quinto-dia-util/",
      "5º dia útil por mês e ano | Datas Úteis",
      "Veja o 5º dia útil de cada mês navegando por anos e meses sem se prender a um único calendário.",
      "0.8",
      "monthly",
      { breadcrumbLabel: "5º dia útil" }
    ),
    route(
      "/utilitarios/",
      "Utilitários de apoio para tarefas rápidas | Datas Úteis",
      "Reúna calculadora, sorteador, conversor e clima em uma área de apoio ao núcleo principal do site.",
      "0.6",
      "monthly",
      { breadcrumbLabel: UTILITIES_LABEL }
    ),
    route(
      "/utilitarios/calculadora/",
      "Calculadora online | Datas Úteis",
      "Use calculadora simples, científica, financeira e de desenvolvedor em uma mesma página.",
      "0.65"
    ),
    route(
      "/utilitarios/sorteador/",
      "Sorteador de números e nomes | Datas Úteis",
      "Sorteie números únicos ou nomes em uma ferramenta rápida com cópia do resultado.",
      "0.67"
    ),
    route(
      "/utilitarios/conversor-de-moeda/",
      "Conversor de moeda | Datas Úteis",
      "Converta moedas em uma ferramenta rápida de apoio.",
      "0.6",
      "daily"
    ),
    route(
      "/utilitarios/clima/",
      "Clima Online | Temperatura Atual e Próximos Dias | Datas Úteis",
      "Veja a temperatura atual e uma previsão curta para apoiar deslocamentos, visitas, entregas e rotinas externas.",
      "0.6",
      "daily"
    ),
    route(
      "/jogos/",
      "Jogos Online Grátis | Sudoku, Caça-Palavras e Palavras Cruzadas | Datas Úteis",
      "Jogue Sudoku, caça-palavras e palavras cruzadas online grátis em uma área organizada para pausas curtas e boa leitura no celular e no computador.",
      "0.5",
      "monthly",
      { breadcrumbLabel: GAMES_LABEL }
    ),
    route(
      "/jogos/sudoku/",
      "Sudoku Online Grátis | Fácil, Médio, Difícil e Expert | Datas Úteis",
      "Jogue Sudoku online grátis com níveis de dificuldade, timer, ranking local, validação de progresso e boa experiência no celular e no computador.",
      "0.55",
      "weekly",
      { breadcrumbLabel: "Sudoku" }
    ),
    route(
      "/jogos/caca-palavras/",
      "Caça-Palavras Online Grátis | Ranking, Dicas e Níveis | Datas Úteis",
      "Jogue caça-palavras online grátis com níveis de dificuldade, dicas, pontuação, ranking e categorias temáticas. Funciona no celular e no computador.",
      "0.55",
      "weekly",
      { breadcrumbLabel: "Caça-palavras" }
    ),
    route(
      "/jogos/palavras-cruzadas/",
      "Palavras Cruzadas Online Grátis | Com Dicas e Níveis | Datas Úteis",
      "Resolva palavras cruzadas online grátis com dicas, teclado virtual, níveis de dificuldade, pontuação e ranking. Jogue no celular ou computador.",
      "0.55",
      "weekly",
      { breadcrumbLabel: "Palavras Cruzadas" }
    ),
    route(
      "/blog/",
      "Blog sobre dias úteis e escalas | Datas Úteis",
      "Leia conteúdos de apoio sobre dias úteis, escalas e rotina de trabalho.",
      "0.7",
      "weekly",
      { breadcrumbLabel: BLOG_LABEL }
    ),
    ...buildBlogRoutes(blogPosts),
    route(
      "/sobre/",
      "Sobre o Datas Úteis | Ferramentas úteis para o dia a dia",
      "Conheça a origem, o propósito e as ferramentas do Datas Úteis. Saiba quem somos, o que oferecemos e nosso compromisso com qualidade e privacidade.",
      "0.3",
      "yearly",
      { breadcrumbLabel: ABOUT_LABEL }
    ),
    route(
      "/contato/",
      "Contato | Datas Úteis",
      "Entre em contato com o Datas Úteis para enviar sugestões de ferramentas, reportar erros de cálculo, tirar dúvidas sobre uso ou colaborar com melhorias.",
      "0.3",
      "yearly",
      { breadcrumbLabel: "Contato" }
    ),
    route(
      "/privacidade/",
      "Política de Privacidade | Datas Úteis",
      "Entenda como o Datas Úteis coleta, utiliza e protege informações dos visitantes. Detalhes sobre cookies, Google Analytics, AdSense, LGPD e seus direitos.",
      "0.3",
      "yearly"
    ),
    route(
      "/termos/",
      "Termos de Uso | Datas Úteis",
      "Consulte as regras de uso das ferramentas e conteúdos do Datas Úteis. Limites de responsabilidade, propriedade intelectual, uso aceitável e legislação aplicável.",
      "0.3",
      "yearly"
    ),
    route(
      "/404/",
      "Página não encontrada | Datas Úteis",
      "A página solicitada não foi encontrada.",
      "0.0",
      "never",
      {
        robots: "noindex, nofollow",
        breadcrumbLabel: "404",
        sitemap: false,
      }
    ),
  ];

  const currentYear = new Date().getFullYear();

  function yearPriority(year, basePriority) {
    const distance = Math.abs(year - currentYear);
    if (distance <= 1) return basePriority;
    if (distance <= 3) return String(Math.max(0.1, parseFloat(basePriority) - 0.05).toFixed(2));
    if (distance <= 10) return String(Math.max(0.1, parseFloat(basePriority) - 0.15).toFixed(2));
    return String(Math.max(0.1, parseFloat(basePriority) - 0.3).toFixed(2));
  }

  function yearChangefreq(year) {
    const distance = Math.abs(year - currentYear);
    if (distance <= 1) return "monthly";
    if (distance <= 5) return "yearly";
    return "yearly";
  }

  for (let year = MIN_SUPPORTED_YEAR; year <= MAX_SUPPORTED_YEAR; year += 1) {
    const cf = yearChangefreq(year);
    routes.push(
      route(
        `/calendario/${year}/`,
        `Calendário ${year} com feriados | Datas Úteis`,
        `Abra o calendário ${year} com leitura de meses, fins de semana e feriados.`,
        yearPriority(year, "0.8"),
        cf
      ),
      route(
        `/dias-uteis/${year}/`,
        `Dias úteis de cada mês em ${year} | Datas Úteis`,
        `Abra a tabela mensal de dias úteis, finais de semana e feriados de ${year}.`,
        yearPriority(year, "0.86"),
        cf
      ),
      route(
        `/quinto-dia-util/${year}/`,
        `5º dia útil de cada mês em ${year} | Datas Úteis`,
        `Abra a tabela anual com o 5º dia útil de cada mês de ${year}.`,
        yearPriority(year, "0.78"),
        cf
      )
    );

    for (let month = 1; month <= 12; month += 1) {
      const slug = MONTHS[month - 1];
      const label = monthLabel(month, year);
      routes.push(
        route(
          `/calendario/${year}/${slug}/`,
          `Calendário de ${label} | Datas Úteis`,
          `Consulte finais de semana e feriados de ${label}.`,
          yearPriority(year, "0.74"),
          cf
        ),
        route(
          `/dias-uteis/${year}/${slug}/`,
          `Quantos dias úteis tem ${label} | Datas Úteis`,
          `Consulte dias úteis, finais de semana, feriados e o 5º dia útil de ${label}.`,
          yearPriority(year, "0.82"),
          cf
        ),
        route(
          `/quinto-dia-util/${year}/${slug}/`,
          `5º dia útil de ${label} | Datas Úteis`,
          `Veja o 5º dia útil de ${label} e compare com meses próximos.`,
          yearPriority(year, "0.76"),
          cf
        )
      );
    }
  }

  return Array.from(new Map(routes.map(item => [item.pathname, item])).values());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function replaceMeta(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html;
}

function safeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

const SCHEMA_TYPES_WITH_DATE_MODIFIED = new Set([
  "Article",
  "ContactPage",
  "Game",
  "WebApplication",
  "WebPage",
]);

function enrichSchemaDates(value) {
  if (!value) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(item => enrichSchemaDates(item));
  }

  const nextValue = Object.fromEntries(
    Object.entries(value).map(([key, itemValue]) => {
      if (Array.isArray(itemValue)) {
        return [
          key,
          itemValue.map(entry =>
            typeof entry === "object" && entry ? enrichSchemaDates(entry) : entry
          ),
        ];
      }

      if (itemValue && typeof itemValue === "object") {
        return [key, enrichSchemaDates(itemValue)];
      }

      return [key, itemValue];
    })
  );

  if (
    typeof nextValue["@type"] === "string" &&
    SCHEMA_TYPES_WITH_DATE_MODIFIED.has(nextValue["@type"]) &&
    !("dateModified" in nextValue)
  ) {
    nextValue.dateModified = SITE_LAST_MODIFIED_DATE;
  }

  return nextValue;
}

function buildLocalizedPath(pathname, language) {
  const normalizedPath =
    pathname === "/" ? "/" : pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (language === "pt") {
    return normalizedPath;
  }

  return `${normalizedPath}?lang=${language}`;
}

function buildLocalizedUrl(pathname, language) {
  return `${SITE_URL}${buildLocalizedPath(pathname, language)}`;
}

function getRouteLabel(item) {
  return item.breadcrumbLabel ?? item.title.replace(/\s+\|\s+Datas Úteis$/, "");
}

function getBreadcrumbs(item) {
  const label = getRouteLabel(item);

  if (item.pathname === "/") {
    return [];
  }

  if (item.pathname === "/calcular/") {
    return [
      { label: HOME_LABEL, href: "/" },
      { label: SIMULATORS_LABEL },
      { label: BUSINESS_DAYS_LABEL, href: "/calcular/" },
    ];
  }

  if (item.pathname === "/escala/") {
    return [
      { label: HOME_LABEL, href: "/" },
      { label: SIMULATORS_LABEL },
      { label: WORK_SCHEDULES_LABEL, href: "/escala/" },
    ];
  }

  if (item.pathname === "/idade/") {
    return [
      { label: HOME_LABEL, href: "/" },
      { label: SIMULATORS_LABEL },
      { label: AGE_CALCULATOR_LABEL, href: "/idade/" },
    ];
  }

  if (item.pathname.startsWith("/idade/")) {
    return [
      { label: HOME_LABEL, href: "/" },
      { label: SIMULATORS_LABEL },
      { label: AGE_CALCULATOR_LABEL, href: "/idade/" },
      { label },
    ];
  }

  if (item.pathname === "/dias-uteis/") {
    return [
      { label: HOME_LABEL, href: "/" },
      { label: SIMULATORS_LABEL },
      { label: BUSINESS_DAYS_LABEL, href: "/dias-uteis/" },
    ];
  }

  if (item.pathname.startsWith("/dias-uteis/")) {
    return [
      { label: HOME_LABEL, href: "/" },
      { label: SIMULATORS_LABEL },
      { label: BUSINESS_DAYS_LABEL, href: "/dias-uteis/" },
      { label },
    ];
  }

  if (item.pathname === "/quinto-dia-util/") {
    return [
      { label: HOME_LABEL, href: "/" },
      { label: SIMULATORS_LABEL },
      { label: BUSINESS_DAYS_LABEL, href: "/dias-uteis/" },
      { label: "5º dia útil", href: "/quinto-dia-util/" },
    ];
  }

  if (item.pathname.startsWith("/quinto-dia-util/")) {
    return [
      { label: HOME_LABEL, href: "/" },
      { label: SIMULATORS_LABEL },
      { label: BUSINESS_DAYS_LABEL, href: "/dias-uteis/" },
      { label: "5º dia útil", href: "/quinto-dia-util/" },
      { label },
    ];
  }

  if (item.pathname === "/calendario/") {
    return [
      { label: HOME_LABEL, href: "/" },
      { label: CALENDAR_LABEL, href: "/calendario/" },
    ];
  }

  if (item.pathname.startsWith("/calendario/")) {
    return [
      { label: HOME_LABEL, href: "/" },
      { label: CALENDAR_LABEL, href: "/calendario/" },
      { label },
    ];
  }

  if (item.pathname === "/blog/") {
    return [
      { label: HOME_LABEL, href: "/" },
      { label: BLOG_LABEL, href: "/blog/" },
    ];
  }

  if (item.pathname.startsWith("/blog/")) {
    return [
      { label: HOME_LABEL, href: "/" },
      { label: BLOG_LABEL, href: "/blog/" },
      { label },
    ];
  }

  if (item.pathname === "/utilitarios/") {
    return [
      { label: HOME_LABEL, href: "/" },
      { label: UTILITIES_LABEL, href: "/utilitarios/" },
    ];
  }

  if (item.pathname.startsWith("/utilitarios/")) {
    return [
      { label: HOME_LABEL, href: "/" },
      { label: UTILITIES_LABEL, href: "/utilitarios/" },
      { label },
    ];
  }

  if (item.pathname === "/jogos/") {
    return [
      { label: HOME_LABEL, href: "/" },
      { label: GAMES_LABEL, href: "/jogos/" },
    ];
  }

  if (item.pathname.startsWith("/jogos/")) {
    return [
      { label: HOME_LABEL, href: "/" },
      { label: GAMES_LABEL, href: "/jogos/" },
      { label: BRAIN_GAMES_LABEL, href: "/jogos/" },
      { label },
    ];
  }

  if (item.pathname === "/sobre/") {
    return [
      { label: HOME_LABEL, href: "/" },
      { label: ABOUT_LABEL, href: "/sobre/" },
    ];
  }

  if (item.pathname === "/contato/") {
    return [
      { label: HOME_LABEL, href: "/" },
      { label: ABOUT_LABEL, href: "/sobre/" },
      { label },
    ];
  }

  if (item.pathname === "/privacidade/" || item.pathname === "/termos/") {
    return [
      { label: HOME_LABEL, href: "/" },
      { label: ABOUT_LABEL, href: "/sobre/" },
      { label },
    ];
  }

  return [
    { label: HOME_LABEL, href: "/" },
    { label },
  ];
}

function serializeBreadcrumbSchema(items, currentPath) {
  const schemaItems = items.flatMap((item, index) => {
    if (item.href) {
      return [{ label: item.label, href: item.href }];
    }

    if (index === items.length - 1) {
      return [{ label: item.label, href: currentPath }];
    }

    return [];
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: schemaItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}

function buildBasePageSchema(item) {
  return {
    "@context": "https://schema.org",
    "@type": item.pathname === "/contato/" ? "ContactPage" : "WebPage",
    name: getRouteLabel(item),
    url: `${SITE_URL}${item.pathname}`,
    description: item.description,
    dateModified: SITE_LAST_MODIFIED_DATE,
  };
}

function serializeFaqSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(item => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function buildRouteSchemas(item) {
  if (item.pathname === "/calcular/") {
    return [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Calculadora de dias úteis",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        url: `${SITE_URL}/calcular/`,
        description: item.description,
      },
    ];
  }

  if (item.pathname === "/idade/") {
    return [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Calculadora de idade",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        url: `${SITE_URL}/idade/`,
        description: item.description,
      },
    ];
  }

  if (item.pathname === "/calendario/") {
    return [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Calendário com feriados",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        url: `${SITE_URL}/calendario/`,
        description: item.description,
      },
    ];
  }

  if (item.pathname === "/escala/") {
    return [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Simulador de escalas de trabalho",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: `${SITE_URL}/escala/`,
        description: item.description,
      },
    ];
  }

  // FAQPage schemas are injected client-side by usePageSeo to avoid
  // duplicates between static HTML and React hydration.
  return [];
}

function serializeRouteSchemas(item) {
  const breadcrumbs = getBreadcrumbs(item);
  const schemas = [buildBasePageSchema(item)];

  if (breadcrumbs.length) {
    schemas.push(serializeBreadcrumbSchema(breadcrumbs, item.pathname));
  }

  schemas.push(...buildRouteSchemas(item));

  if (!schemas.length) {
    return "";
  }

  return schemas
    .map(
      schema =>
        `    <script type="application/ld+json">${safeJsonLd(enrichSchemaDates(schema))}</script>`
    )
    .join("\n");
}

function applyMetadata(template, item) {
  const canonical = `${SITE_URL}${item.pathname}`;
  let html = template;

  html = replaceMeta(
    html,
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeHtml(item.title)}</title>`
  );
  html = replaceMeta(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(item.description)}" />`
  );
  html = replaceMeta(
    html,
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/,
    `<meta name="robots" content="${escapeHtml(item.robots)}" />`
  );
  html = replaceMeta(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${canonical}" />`
  );
  html = replaceMeta(
    html,
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:type" content="${escapeHtml(item.type)}" />`
  );
  html = replaceMeta(
    html,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapeHtml(item.title)}" />`
  );
  html = replaceMeta(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapeHtml(item.description)}" />`
  );
  html = replaceMeta(
    html,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${canonical}" />`
  );
  html = replaceMeta(
    html,
    /<meta\s+property="og:updated_time"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:updated_time" content="${SITE_LAST_MODIFIED_DATETIME}" />`
  );
  html = replaceMeta(
    html,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escapeHtml(item.title)}" />`
  );
  html = replaceMeta(
    html,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escapeHtml(item.description)}" />`
  );
  html = html.replace(
    /<link\s+rel="alternate"\s+hreflang="pt-BR"\s+href="[^"]*"\s*\/?>[\s\S]*?<link\s+rel="alternate"\s+hreflang="x-default"\s+href="[^"]*"\s*\/?>/,
    [
      `<link rel="alternate" hreflang="pt-BR" href="${buildLocalizedUrl(item.pathname, "pt")}" />`,
      `<link rel="alternate" hreflang="en" href="${buildLocalizedUrl(item.pathname, "en")}" />`,
      `<link rel="alternate" hreflang="es" href="${buildLocalizedUrl(item.pathname, "es")}" />`,
      `<link rel="alternate" hreflang="x-default" href="${buildLocalizedUrl(item.pathname, "pt")}" />`,
    ].join("\n    ")
  );

  const schemaScripts = serializeRouteSchemas(item);
  if (schemaScripts) {
    html = html.replace("</head>", `${schemaScripts}\n  </head>`);
  }

  return html;
}

function extractLeadingResourceHints(markup) {
  let remaining = markup.trim();
  const headTags = [];

  while (true) {
    const match = remaining.match(/^<link\b[^>]*\/?>\s*/i);
    if (!match) {
      break;
    }

    headTags.push(match[0].trim());
    remaining = remaining.slice(match[0].length).trimStart();
  }

  return {
    headTags,
    bodyMarkup: remaining,
  };
}

function injectPrerenderMarkup(html, prerenderMarkup) {
  if (!prerenderMarkup) {
    return html;
  }

  const { headTags, bodyMarkup } = extractLeadingResourceHints(prerenderMarkup);
  let nextHtml = html;

  if (headTags.length) {
    nextHtml = nextHtml.replace(
      "</head>",
      `${headTags.map(tag => `    ${tag}`).join("\n")}\n  </head>`
    );
  }

  return nextHtml.replace(
    /<div id="root">\s*<\/div>/,
    `<div id="root">${bodyMarkup}</div>`
  );
}

async function readBuildAssetHints() {
  const assetsDir = path.join(DIST_DIR, "assets");
  const files = await fs.readdir(assetsDir);
  const mainModule = files.find(fileName => /^main-[A-Za-z0-9_-]+\.js$/i.test(fileName));
  const homeModule = files.find(fileName => /^Home-[A-Za-z0-9_-]+\.js$/i.test(fileName));

  return {
    mainModuleHref: mainModule ? `/assets/${mainModule}` : null,
    homeModuleHref: homeModule ? `/assets/${homeModule}` : null,
  };
}

function optimizeAssetLoading(html, item, assetHints) {
  let nextHtml = html;

  const modulePreloads = [];

  if (assetHints.mainModuleHref) {
    modulePreloads.push(
      `<link rel="modulepreload" crossorigin href="${assetHints.mainModuleHref}" />`
    );
  }

  if (item.pathname === "/" && assetHints.homeModuleHref) {
    modulePreloads.push(
      `<link rel="modulepreload" crossorigin href="${assetHints.homeModuleHref}" />`
    );
  }

  if (modulePreloads.length) {
    nextHtml = nextHtml.replace(
      "</head>",
      `${modulePreloads.map(tag => `    ${tag}`).join("\n")}\n  </head>`
    );
  }

  return nextHtml;
}

async function loadBlogPosts() {
  await esbuild.build({
    entryPoints: [path.join(ROOT, "client", "src", "lib", "blog.ts")],
    outfile: BLOG_DATA_BUNDLE,
    bundle: true,
    platform: "node",
    packages: "external",
    format: "esm",
    target: "node20",
    alias: {
      "@": path.join(ROOT, "client", "src"),
      "@shared": path.join(ROOT, "shared"),
      "@assets": path.join(ROOT, "attached_assets"),
    },
    define: {
      "import.meta.env.DEV": "false",
      "import.meta.env.PROD": "true",
      "import.meta.env.SSR": "true",
    },
    logLevel: "silent",
  });

  const blogModule = await import(
    `${pathToFileURL(BLOG_DATA_BUNDLE).href}?t=${Date.now()}`
  );

  return typeof blogModule.getLocalizedBlogPosts === "function"
    ? blogModule.getLocalizedBlogPosts("pt")
    : [];
}

async function buildPrerenderMap(routes) {
  const prerenderable = routes.filter(item => item.prerender);

  if (!prerenderable.length) {
    return new Map();
  }

  await esbuild.build({
    entryPoints: [path.join(ROOT, "client", "src", "seo-prerender-entry.tsx")],
    outfile: PRERENDER_BUNDLE,
    bundle: true,
    platform: "node",
    packages: "external",
    format: "esm",
    target: "node20",
    jsx: "automatic",
    alias: {
      "@": path.join(ROOT, "client", "src"),
      "@shared": path.join(ROOT, "shared"),
      "@assets": path.join(ROOT, "attached_assets"),
    },
    define: {
      "import.meta.env.DEV": "false",
      "import.meta.env.PROD": "true",
      "import.meta.env.SSR": "true",
    },
    logLevel: "silent",
  });

  const prerenderModule = await import(
    `${pathToFileURL(PRERENDER_BUNDLE).href}?t=${Date.now()}`
  );

  const map = new Map();
  for (const item of prerenderable) {
    const markup = prerenderModule.renderPrerenderRoute(item.pathname);
    if (typeof markup === "string" && markup.trim()) {
      map.set(item.pathname, markup);
    }
  }

  return map;
}

async function writeRouteHtml(template, item, prerenderMap, assetHints) {
  let content = applyMetadata(template, item);
  content = optimizeAssetLoading(content, item, assetHints);
  content = injectPrerenderMarkup(content, prerenderMap.get(item.pathname) ?? "");

  const filePath =
    item.pathname === "/"
      ? path.join(DIST_DIR, "index.html")
      : path.join(DIST_DIR, item.pathname.replace(/^\//, ""), "index.html");

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);

  if (item.pathname === "/404/") {
    await fs.writeFile(path.join(DIST_DIR, "404.html"), content);
  }

  return content;
}

function buildSitemap(routes) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];

  routes
    .filter(item => item.sitemap !== false)
    .forEach(item => {
    lines.push("  <url>");
    lines.push(`    <loc>${SITE_URL}${item.pathname}</loc>`);
    lines.push(`    <lastmod>${lastmod}</lastmod>`);
    lines.push(`    <changefreq>${item.changefreq}</changefreq>`);
    lines.push(`    <priority>${item.priority}</priority>`);
    lines.push(
      `    <xhtml:link rel="alternate" hreflang="pt-BR" href="${buildLocalizedUrl(item.pathname, "pt")}" />`
    );
    lines.push(
      `    <xhtml:link rel="alternate" hreflang="en" href="${buildLocalizedUrl(item.pathname, "en")}" />`
    );
    lines.push(
      `    <xhtml:link rel="alternate" hreflang="es" href="${buildLocalizedUrl(item.pathname, "es")}" />`
    );
    lines.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${buildLocalizedUrl(item.pathname, "pt")}" />`
    );
    lines.push("  </url>");
    });

  lines.push("</urlset>");
  return `${lines.join("\n")}\n`;
}

async function cleanupTempBundles() {
  await Promise.all([
    fs.rm(PRERENDER_BUNDLE, { force: true }),
    fs.rm(BLOG_DATA_BUNDLE, { force: true }),
  ]);
}

async function main() {
  const template = await fs.readFile(path.join(DIST_DIR, "index.html"), "utf8");
  const blogPosts = await loadBlogPosts();
  const routes = buildRoutes(blogPosts);
  const prerenderMap = await buildPrerenderMap(routes);
  const assetHints = await readBuildAssetHints();

  await Promise.all(
    routes.map(item => writeRouteHtml(template, item, prerenderMap, assetHints))
  );

  const sitemap = buildSitemap(routes);
  await fs.writeFile(path.join(DIST_DIR, "sitemap.xml"), sitemap);
  await fs.writeFile(SOURCE_SITEMAP, sitemap);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await cleanupTempBundles();
    } catch {
      // Ignore cleanup failures after a build error.
    }

    if (process.exitCode) {
      process.exit(process.exitCode);
    }
  });
