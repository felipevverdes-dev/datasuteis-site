import type { SupportedLanguage } from "@/lib/site";

interface MarketHoursPageCopy {
  eyebrow: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  liveLoadNotice: string;
  staleNotice: string;
  fallbackNotice: string;
  refreshHelp: string;
  adLabel: string;
  content: {
    introTitle: string;
    introItems: string[];
    examplesTitle: string;
    examplesItems: string[];
    faqTitle: string;
    faqItems: Array<{ question: string; answer: string }>;
  };
  ctaTitle: string;
  ctaButton: string;
}

const MARKET_HOURS_COPY: Record<SupportedLanguage, MarketHoursPageCopy> = {
  pt: {
    eyebrow: "Utilitários",
    title: "Horário das Bolsas Globais e Principais Mercados",
    description:
      "Consulte o horário local das principais bolsas do mundo, status de sessão, aberturas, fechamentos e snapshots úteis para acompanhar NYSE, Nasdaq, B3, Europa e Ásia.",
    seoTitle:
      "Horário das Bolsas Globais: NYSE, Nasdaq, B3 e Mercados do Mundo | Datas Úteis",
    seoDescription:
      "Veja horário de abertura e fechamento das principais bolsas globais, status em tempo real, timezone local e janelas de negociação para NYSE, Nasdaq, B3, Europa e Ásia.",
    liveLoadNotice:
      "Os dados ao vivo carregam ao abrir a página. Se o feed oscilar, a agenda oficial das bolsas continua disponível.",
    staleNotice:
      "Exibindo o último snapshot válido disponível no momento.",
    fallbackNotice:
      "Dados temporariamente indisponíveis. A agenda oficial das bolsas continua ativa nesta página.",
    refreshHelp:
      "Use Atualizar para pedir um novo snapshot ao servidor sem travar a navegação.",
    adLabel: "Espaço reservado para anúncio de mercados",
    content: {
      introTitle: "Como usar a página de horário de mercados",
      introItems: [
        "A página mostra a hora local de cada bolsa, o timezone oficial e o status da sessão para ajudar quem acompanha abertura, fechamento e sobreposição entre mercados.",
        "Quando o feed de cotação responde, a tabela exibe atual, último fechamento e variação. Quando o feed falha, a página continua útil com horários, status e janelas oficiais.",
        "Mercados com intervalo intradiário, como Tóquio, Hong Kong, Xangai e Shenzhen, aparecem com pausa destacada para evitar leitura incorreta da sessão.",
      ],
      examplesTitle: "Perguntas que esta página ajuda a responder",
      examplesItems: [
        "Que horas abre a bolsa de Nova York no Brasil?",
        "Quando a Nasdaq entra em pré-mercado e after-hours?",
        "Qual é o horário de negociação da B3 hoje?",
        "Quais bolsas asiáticas fazem pausa no meio do dia?",
      ],
      faqTitle: "Perguntas frequentes",
      faqItems: [
        {
          question: "A página mostra cotação em tempo real garantida?",
          answer:
            "Não. O feed depende de providers externos e pode oscilar. Quando isso acontece, a página mantém a agenda oficial de negociação e tenta reutilizar o último snapshot válido.",
        },
        {
          question: "Por que o botão Atualizar nem sempre muda os números?",
          answer:
            "As cotações passam por cache controlado no servidor para evitar rajadas desnecessárias ao provider. O botão força uma nova tentativa, mas pode retornar o mesmo snapshot se o mercado não mudou ou se o provider ainda estiver entregando o último valor.",
        },
        {
          question: "Os horários consideram pré e pós-mercado?",
          answer:
            "Sim. NYSE e Nasdaq exibem pré-abertura e pós-fechamento. Mercados com pausa intradiária também mostram intervalo como estado próprio.",
        },
      ],
    },
    ctaTitle: "Precisa comparar países e fusos completos?",
    ctaButton: "Abrir horário mundial",
  },
  en: {
    eyebrow: "Utilities",
    title: "Global Market Hours and Major Exchanges",
    description:
      "Check the local time of the main stock exchanges, session status, open and close windows, and useful snapshots for NYSE, Nasdaq, B3, Europe and Asia.",
    seoTitle:
      "Global Market Hours: NYSE, Nasdaq, B3 and Major Exchanges | Datas Úteis",
    seoDescription:
      "See opening and closing times for the main global exchanges, live session status, local timezone and trading windows for NYSE, Nasdaq, B3, Europe and Asia.",
    liveLoadNotice:
      "Live data loads after the page opens. If the feed fluctuates, the official exchange schedule remains available.",
    staleNotice: "Showing the latest valid snapshot available right now.",
    fallbackNotice:
      "Data temporarily unavailable. The official exchange schedule remains available on this page.",
    refreshHelp:
      "Use Refresh to request a new server snapshot without blocking the page.",
    adLabel: "Reserved market ad slot",
    content: {
      introTitle: "How to use the market hours page",
      introItems: [
        "The page shows each exchange local time, official timezone and session status to help track opens, closes and overlaps between markets.",
        "When the quote feed responds, the table includes current value, previous close and change. When it fails, the page stays useful with hours, status and official sessions.",
        "Exchanges with intraday breaks, such as Tokyo, Hong Kong, Shanghai and Shenzhen, display a dedicated pause state.",
      ],
      examplesTitle: "Search questions this page helps answer",
      examplesItems: [
        "What time does the New York Stock Exchange open in Brazil?",
        "When does Nasdaq enter pre-market and after-hours?",
        "What are B3 trading hours today?",
        "Which Asian exchanges pause in the middle of the day?",
      ],
      faqTitle: "Frequently asked questions",
      faqItems: [
        {
          question: "Does the page guarantee real-time quotes?",
          answer:
            "No. Quote delivery depends on external providers and can fluctuate. When it does, the page keeps the official schedule and tries to reuse the latest valid snapshot.",
        },
        {
          question: "Why does Refresh not always change the numbers?",
          answer:
            "Quotes go through server-side cache to avoid unnecessary bursts against the provider. Refresh forces a new attempt, but it can still return the same snapshot if the market did not move or the provider still serves the latest value.",
        },
        {
          question: "Do market hours include pre and post sessions?",
          answer:
            "Yes. NYSE and Nasdaq include pre-open and post-close. Exchanges with intraday breaks also expose a dedicated break state.",
        },
      ],
    },
    ctaTitle: "Need the full country and timezone explorer?",
    ctaButton: "Open world clock",
  },
  es: {
    eyebrow: "Utilidades",
    title: "Horario de las Bolsas Globales y Principales Mercados",
    description:
      "Consulte la hora local de las principales bolsas del mundo, estado de sesión, aperturas, cierres y snapshots útiles para seguir NYSE, Nasdaq, B3, Europa y Asia.",
    seoTitle:
      "Horario de las Bolsas Globales: NYSE, Nasdaq, B3 y Mercados del Mundo | Datas Úteis",
    seoDescription:
      "Vea horario de apertura y cierre de las principales bolsas globales, estado en tiempo real, timezone local y ventanas de negociación para NYSE, Nasdaq, B3, Europa y Asia.",
    liveLoadNotice:
      "Los datos en vivo se cargan al abrir la página. Si el feed fluctúa, el horario oficial de las bolsas sigue disponible.",
    staleNotice:
      "Se muestra el último snapshot válido disponible en este momento.",
    fallbackNotice:
      "Datos temporalmente no disponibles. El horario oficial de las bolsas sigue disponible en esta página.",
    refreshHelp:
      "Use Actualizar para pedir un nuevo snapshot al servidor sin bloquear la navegación.",
    adLabel: "Espacio reservado para anuncio de mercados",
    content: {
      introTitle: "Cómo usar la página de horarios de mercados",
      introItems: [
        "La página muestra la hora local de cada bolsa, el timezone oficial y el estado de la sesión para seguir aperturas, cierres y superposiciones entre mercados.",
        "Cuando el feed responde, la tabla muestra valor actual, último cierre y variación. Cuando falla, la página sigue siendo útil con horarios, estado y sesiones oficiales.",
        "Las bolsas con pausas intradiarias, como Tokio, Hong Kong, Shanghái y Shenzhen, muestran un estado de intervalo específico.",
      ],
      examplesTitle: "Preguntas que esta página ayuda a responder",
      examplesItems: [
        "¿A qué hora abre la bolsa de Nueva York en Brasil?",
        "¿Cuándo entra Nasdaq en premarket y after-hours?",
        "¿Cuál es el horario de negociación de B3 hoy?",
        "¿Qué bolsas asiáticas hacen pausa al mediodía?",
      ],
      faqTitle: "Preguntas frecuentes",
      faqItems: [
        {
          question: "¿La página garantiza cotizaciones en tiempo real?",
          answer:
            "No. El feed depende de proveedores externos y puede fluctuar. Cuando eso ocurre, la página mantiene la agenda oficial e intenta reutilizar el último snapshot válido.",
        },
        {
          question: "¿Por qué el botón Actualizar no siempre cambia los números?",
          answer:
            "Las cotizaciones pasan por caché en el servidor para evitar ráfagas innecesarias contra el proveedor. Actualizar fuerza un nuevo intento, pero puede devolver el mismo snapshot si el mercado no cambió o si el proveedor sigue entregando el último valor.",
        },
        {
          question: "¿Los horarios incluyen preapertura y postcierre?",
          answer:
            "Sí. NYSE y Nasdaq incluyen preapertura y postcierre. Las bolsas con pausas intradiarias también muestran un estado de intervalo.",
        },
      ],
    },
    ctaTitle: "¿Necesita el explorador completo de países y husos?",
    ctaButton: "Abrir horario mundial",
  },
};

export function getMarketHoursPageCopy(language: SupportedLanguage) {
  return MARKET_HOURS_COPY[language] ?? MARKET_HOURS_COPY.pt;
}
