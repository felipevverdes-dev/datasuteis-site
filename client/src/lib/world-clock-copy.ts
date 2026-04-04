import type { SupportedLanguage } from "@/lib/site";
import type { WorldCountryDefinition } from "@/lib/world-clock-countries";

type Localized<T> = Record<SupportedLanguage, T>;

export interface WorldClockPageCopy {
  eyebrow: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  toolLabel: string;
  tabListLabel: string;
  tabs: {
    world: string;
    markets: string;
  };
  controls: {
    searchLabel: string;
    searchPlaceholder: string;
    searchHint: string;
    worldGridTitle: string;
    worldGridDescription: string;
    countriesCountLabel: string;
    noSearchResults: string;
    noSearchResultsHint: string;
  };
  continents: {
    america: string;
    asia: string;
    africa: string;
    antarctica: string;
    europe: string;
    oceania: string;
  };
  continentNavLabel: string;
  markets: {
    title: string;
    description: string;
    refresh: string;
    updating: string;
    temporaryUnavailable: string;
    updatedAt: string;
    hours: string;
    timezone: string;
    localTime: string;
    location: string;
    status: string;
    index: string;
    currentQuote: string;
    previousClose: string;
    variation: string;
    notes: string;
    sessionOnlyFallback: string;
    quoteUnavailable: string;
    previousCloseUnavailable: string;
    variationUnavailable: string;
    tableLabel: string;
    mobileLabel: string;
    clickedAria: string;
  };
  statuses: {
    open: string;
    closed: string;
    pre: string;
    post: string;
    break: string;
  };
  modal: {
    titlePrefix: string;
    descriptionPrefix: string;
    close: string;
    loading: string;
    error: string;
    overview: string;
    quickFacts: string;
    context: string;
    keyFacts: string;
    touristSpots: string;
    leader: string;
    nationalMilestone: string;
    population: string;
    languages: string;
    capitalAltitude: string;
    seasons: string;
    predominantClimate: string;
    religion: string;
    culture: string;
    customs: string;
    altitudeUnavailable: string;
    detailUnavailable: string;
  };
  content: {
    timezonesTitle: string;
    timezonesItems: string[];
    marketsTitle: string;
    marketsItems: string[];
    faqTitle: string;
    faqItems: Array<{ question: string; answer: string }>;
  };
  ctaTitle: string;
  ctaButton: string;
}

const PAGE_COPY: Record<SupportedLanguage, WorldClockPageCopy> = {
  pt: {
    eyebrow: "Utilitários",
    title: "Horário Mundial por Continente",
    description:
      "Veja o horário atual de países e capitais por continente, com UTC em tempo real, busca rápida por país ou cidade e leitura limpa dos principais fusos.",
    seoTitle:
      "Horário Mundial por Continente | Fuso, UTC e Capitais | Datas Úteis",
    seoDescription:
      "Consulte o horário atual de países e capitais por continente, com UTC em tempo real, busca por país ou cidade e leitura rápida de fusos.",
    toolLabel: "Horário de todos os países e regiões",
    tabListLabel: "Alternar entre horário mundial e mercados globais",
    tabs: {
      world: "Horário Mundial",
      markets: "Mercados Globais",
    },
    controls: {
      searchLabel: "Pesquisar país ou cidade",
      searchPlaceholder: "Ex.: Brasil, Londres, Tóquio",
      searchHint:
        "Filtre a grade por nome do país, capital ou parte do timezone.",
      worldGridTitle: "Relógios do mundo em tempo real",
      worldGridDescription:
        "Horário de todos os países e regiões separado por continente, UTC atual e capital de cada país.",
      countriesCountLabel: "países visíveis",
      noSearchResults: "Nenhum país corresponde ao filtro atual.",
      noSearchResultsHint:
        "Tente buscar pelo nome do país, capital ou parte do timezone.",
    },
    continents: {
      america: "América",
      asia: "Ásia",
      africa: "África",
      antarctica: "Antártida",
      europe: "Europa",
      oceania: "Oceania",
    },
    continentNavLabel: "Navegar por continente",
    markets: {
      title: "Horário dos principais mercados globais",
      description:
        "Sessões são calculadas no horário oficial local. As cotações usam proxy no backend e podem oscilar sem afetar a leitura da agenda.",
      refresh: "Atualizar",
      updating: "Atualizando cotações globais...",
      temporaryUnavailable: "Dados temporariamente indisponíveis.",
      updatedAt: "Atualizado em",
      hours: "Horário oficial",
      timezone: "Timezone",
      localTime: "Hora local",
      location: "Cidade / país",
      status: "Status",
      index: "Índice",
      currentQuote: "Atual",
      previousClose: "Fechamento",
      variation: "Variação",
      notes: "Observações",
      sessionOnlyFallback: "Dados temporariamente indisponíveis.",
      quoteUnavailable: "Cotação temporariamente indisponível",
      previousCloseUnavailable: "Fechamento indisponível",
      variationUnavailable: "Sem variação disponível",
      tableLabel: "Tabela compacta das principais bolsas globais",
      mobileLabel: "Mercados globais em cards compactos",
      clickedAria: "Abrir detalhes resumidos da bolsa",
    },
    statuses: {
      open: "Aberta",
      closed: "Fechada",
      pre: "Pré-abertura",
      post: "Pós-fechamento",
      break: "Intervalo",
    },
    modal: {
      titlePrefix: "Sobre",
      descriptionPrefix:
        "Resumo editorial com contexto geral, cultura e referências rápidas.",
      close: "Fechar",
      loading: "Carregando resumo detalhado...",
      error:
        "Não foi possível carregar o resumo detalhado deste país agora. Os dados principais continuam disponíveis na página.",
      overview: "Visão geral",
      quickFacts: "Ficha rápida",
      context: "Contexto cultural",
      keyFacts: "Principais características",
      touristSpots: "Pontos turísticos",
      leader: "Líder político atual",
      nationalMilestone: "Marco nacional",
      population: "População",
      languages: "Idiomas",
      capitalAltitude: "Altitude da capital",
      seasons: "Estações do ano",
      predominantClimate: "Predominância climática",
      religion: "Religião",
      culture: "Cultura",
      customs: "Costumes",
      altitudeUnavailable: "Altitude não disponível.",
      detailUnavailable: "Informação editorial em atualização.",
    },
    content: {
      timezonesTitle: "Como funcionam os fusos horários no mundo",
      timezonesItems: [
        "O mundo é dividido em fusos horários baseados na diferença em relação ao UTC (Tempo Universal Coordenado), com cada fuso representando uma hora de diferença.",
        "Países de grande extensão territorial, como Brasil, Estados Unidos, Rússia e Austrália, adotam múltiplos fusos horários internamente.",
        "Horário de verão é adotado em parte dos países para aproveitar melhor a luz solar, deslocando o relógio local em relação ao UTC durante determinados meses.",
      ],
      marketsTitle: "Como comparar horários entre continentes",
      marketsItems: [
        "A busca local permite localizar países por nome, capital, aliases e partes do timezone sem misturar continentes ou gerar duplicações.",
        "Os relógios usam o fuso principal da capital e exibem UTC atual em tempo real, o que ajuda a planejar reuniões, viagens e janelas de atendimento.",
        "Países com múltiplos fusos mostram o total de variações no card e abrem um modal com mais contexto quando você precisa aprofundar a consulta.",
      ],
      faqTitle: "Perguntas frequentes",
      faqItems: [
        {
          question: "Qual fuso a página usa quando o país tem vários horários?",
          answer:
            "A página exibe o fuso da capital do país por padrão. Países com múltiplos fusos relevantes listam as demais opções para consulta.",
        },
        {
          question: "Por que alguns países têm fusos com meia hora de diferença?",
          answer:
            "Alguns países adotam fusos com offset de 30 ou 45 minutos em vez de horas inteiras, como Índia (UTC+5:30), Nepal (UTC+5:45) e Irã (UTC+3:30).",
        },
        {
          question: "A página atualiza os relógios automaticamente?",
          answer:
            "Sim. Os horários são recalculados no navegador em tempo real, sem depender de polling agressivo para cada país listado.",
        },
        {
          question: "Posso buscar por capital ou nome alternativo do país?",
          answer:
            "Sim. A busca aceita nome do país, capital, aliases e trechos do timezone para reduzir o número de cliques até encontrar a região desejada.",
        },
      ],
    },
    ctaTitle: "Precisa fechar prazo em dias úteis?",
    ctaButton: "Abrir calculadora",
  },
  en: {
    eyebrow: "Utilities",
    title: "World Clock by Continent",
    description:
      "See the current time for countries and capitals by continent, with live UTC offset, quick search and a clean timezone overview.",
    seoTitle: "World Clock by Continent | UTC, Capitals and Timezones | Datas Úteis",
    seoDescription:
      "Check current time for countries and capitals by continent, with live UTC offset, country or city search and a quick timezone overview.",
    toolLabel: "World clock for all countries and regions",
    tabListLabel: "Switch between world clock and global markets",
    tabs: {
      world: "World Clock",
      markets: "Global Markets",
    },
    controls: {
      searchLabel: "Search country or city",
      searchPlaceholder: "Example: Brazil, London, Tokyo",
      searchHint:
        "Filter the grid by country name, capital city or part of the timezone.",
      worldGridTitle: "World clocks in real time",
      worldGridDescription:
        "Clock for all countries and regions by continent, current UTC offset and capital city.",
      countriesCountLabel: "visible countries",
      noSearchResults: "No country matches the current filter.",
      noSearchResultsHint:
        "Try part of the country name, capital city or timezone.",
    },
    continents: {
      america: "Americas",
      asia: "Asia",
      africa: "Africa",
      antarctica: "Antarctica",
      europe: "Europe",
      oceania: "Oceania",
    },
    continentNavLabel: "Navigate by continent",
    markets: {
      title: "Main global market hours",
      description:
        "Sessions are calculated in the exchange local timezone. Quotes use a backend proxy and may fluctuate without affecting schedule reading.",
      refresh: "Refresh",
      updating: "Refreshing global quotes...",
      temporaryUnavailable: "Data temporarily unavailable.",
      updatedAt: "Updated at",
      hours: "Official hours",
      timezone: "Timezone",
      localTime: "Local time",
      location: "City / country",
      status: "Status",
      index: "Index",
      currentQuote: "Current",
      previousClose: "Previous close",
      variation: "Change",
      notes: "Notes",
      sessionOnlyFallback: "Data temporarily unavailable.",
      quoteUnavailable: "Quote temporarily unavailable",
      previousCloseUnavailable: "Previous close unavailable",
      variationUnavailable: "Change unavailable",
      tableLabel: "Compact table of the main global stock exchanges",
      mobileLabel: "Global markets in compact cards",
      clickedAria: "Open short exchange summary",
    },
    statuses: {
      open: "Open",
      closed: "Closed",
      pre: "Pre-open",
      post: "Post-close",
      break: "Break",
    },
    modal: {
      titlePrefix: "About",
      descriptionPrefix:
        "Editorial summary with general context, culture and quick references.",
      close: "Close",
      loading: "Loading detailed country summary...",
      error:
        "It was not possible to load this country summary right now. Core data is still available on the page.",
      overview: "Overview",
      quickFacts: "Quick facts",
      context: "Cultural context",
      keyFacts: "Main characteristics",
      touristSpots: "Tourist spots",
      leader: "Current political leader",
      nationalMilestone: "National milestone",
      population: "Population",
      languages: "Languages",
      capitalAltitude: "Capital altitude",
      seasons: "Seasons",
      predominantClimate: "Predominant climate",
      religion: "Religion",
      culture: "Culture",
      customs: "Customs",
      altitudeUnavailable: "Altitude unavailable.",
      detailUnavailable: "Editorial detail is being updated.",
    },
    content: {
      timezonesTitle: "How time zones work around the world",
      timezonesItems: [
        "The world is divided into time zones based on their offset from UTC (Coordinated Universal Time), with each standard zone representing one hour of difference.",
        "Large countries such as Brazil, the United States, Russia and Australia use multiple time zones internally to match solar time across their territory.",
        "Daylight saving time is observed in part of the world to make better use of natural light, shifting the local clock relative to UTC during certain months.",
      ],
      marketsTitle: "How to compare time across continents",
      marketsItems: [
        "Local search lets you find countries by name, capital, aliases and timezone fragments without mixing continents or duplicating results.",
        "Clocks use the capital city timezone and show the current UTC offset in real time, helping with meetings, travel and support windows.",
        "Countries with multiple timezones show the total count on the card and open a richer modal when you need more context.",
      ],
      faqTitle: "Frequently asked questions",
      faqItems: [
        {
          question: "Which timezone is used when a country has more than one?",
          answer:
            "The page shows the capital city timezone by default. Countries with multiple relevant timezones list the other options for reference.",
        },
        {
          question: "Why do some countries have half-hour timezone offsets?",
          answer:
            "Some countries use offsets of 30 or 45 minutes instead of full hours, such as India (UTC+5:30), Nepal (UTC+5:45) and Iran (UTC+3:30).",
        },
        {
          question: "Does the page update clocks automatically?",
          answer:
            "Yes. Times are recalculated in the browser in real time without aggressive polling for every country listed on the page.",
        },
        {
          question: "Can I search by capital city or alternate country name?",
          answer:
            "Yes. Search accepts country name, capital city, aliases and timezone fragments so you can narrow the grid quickly.",
        },
      ],
    },
    ctaTitle: "Need to close a deadline in business days?",
    ctaButton: "Open calculator",
  },
  es: {
    eyebrow: "Utilidades",
    title: "Horario Mundial por Continente",
    description:
      "Consulte el horario actual de países y capitales por continente, con UTC en tiempo real, búsqueda rápida por país o ciudad y lectura clara de husos.",
    seoTitle:
      "Horario Mundial por Continente | UTC, Capitales y Husos | Datas Úteis",
    seoDescription:
      "Consulte el horario actual de países y capitales por continente, con UTC en tiempo real, búsqueda por país o ciudad y lectura rápida de husos.",
    toolLabel: "Horario de todos los países y regiones",
    tabListLabel: "Alternar entre horario mundial y mercados globales",
    tabs: {
      world: "Horario Mundial",
      markets: "Mercados Globales",
    },
    controls: {
      searchLabel: "Buscar país o ciudad",
      searchPlaceholder: "Ej.: Brasil, Londres, Tokio",
      searchHint:
        "Filtre la cuadrícula por nombre del país, capital o parte del timezone.",
      worldGridTitle: "Relojes del mundo en tiempo real",
      worldGridDescription:
        "Horario de todos los países y regiones separado por continente, UTC actual y capital de cada país.",
      countriesCountLabel: "países visibles",
      noSearchResults: "Ningún país coincide con el filtro actual.",
      noSearchResultsHint:
        "Intente con parte del nombre del país, la capital o el timezone.",
    },
    continents: {
      america: "América",
      asia: "Asia",
      africa: "África",
      antarctica: "Antártida",
      europe: "Europa",
      oceania: "Oceanía",
    },
    continentNavLabel: "Navegar por continente",
    markets: {
      title: "Horario de los principales mercados globales",
      description:
        "Las sesiones se calculan en el horario oficial local. Las cotizaciones usan un proxy en el backend y pueden variar sin afectar la agenda.",
      refresh: "Actualizar",
      updating: "Actualizando cotizaciones globales...",
      temporaryUnavailable: "Datos temporalmente no disponibles.",
      updatedAt: "Actualizado a las",
      hours: "Horario oficial",
      timezone: "Timezone",
      localTime: "Hora local",
      location: "Ciudad / país",
      status: "Estado",
      index: "Índice",
      currentQuote: "Actual",
      previousClose: "Cierre",
      variation: "Variación",
      notes: "Observaciones",
      sessionOnlyFallback: "Datos temporalmente no disponibles.",
      quoteUnavailable: "Cotización temporalmente no disponible",
      previousCloseUnavailable: "Cierre no disponible",
      variationUnavailable: "Variación no disponible",
      tableLabel: "Tabla compacta de las principales bolsas globales",
      mobileLabel: "Mercados globales en tarjetas compactas",
      clickedAria: "Abrir resumen corto de la bolsa",
    },
    statuses: {
      open: "Abierta",
      closed: "Cerrada",
      pre: "Preapertura",
      post: "Postcierre",
      break: "Intervalo",
    },
    modal: {
      titlePrefix: "Sobre",
      descriptionPrefix:
        "Resumen editorial con contexto general, cultura y referencias rápidas.",
      close: "Cerrar",
      loading: "Cargando resumen detallado...",
      error:
        "No fue posible cargar el resumen detallado de este país ahora. Los datos principales siguen disponibles en la página.",
      overview: "Resumen general",
      quickFacts: "Ficha rápida",
      context: "Contexto cultural",
      keyFacts: "Características principales",
      touristSpots: "Puntos turísticos",
      leader: "Líder político actual",
      nationalMilestone: "Hito nacional",
      population: "Población",
      languages: "Idiomas",
      capitalAltitude: "Altitud de la capital",
      seasons: "Estaciones",
      predominantClimate: "Clima predominante",
      religion: "Religión",
      culture: "Cultura",
      customs: "Costumbres",
      altitudeUnavailable: "Altitud no disponible.",
      detailUnavailable: "Detalle editorial en actualización.",
    },
    content: {
      timezonesTitle: "Cómo funcionan los husos horarios en el mundo",
      timezonesItems: [
        "El mundo se divide en husos horarios basados en su diferencia respecto al UTC (Tiempo Universal Coordinado), donde cada huso estándar representa una hora de diferencia.",
        "Países de gran extensión, como Brasil, Estados Unidos, Rusia y Australia, utilizan múltiples husos horarios internamente para ajustarse al tiempo solar en su territorio.",
        "El horario de verano se aplica en parte del mundo para aprovechar mejor la luz natural, desplazando el reloj local respecto al UTC durante ciertos meses del año.",
      ],
      marketsTitle: "Cómo comparar horarios entre continentes",
      marketsItems: [
        "La búsqueda local permite encontrar países por nombre, capital, aliases y fragmentos del timezone sin mezclar continentes ni duplicar resultados.",
        "Los relojes usan el huso principal de la capital y muestran el UTC actual en tiempo real, lo que ayuda en reuniones, viajes y ventanas de atención.",
        "Los países con múltiples husos muestran la cantidad total en la tarjeta y abren un modal más completo cuando necesita más contexto.",
      ],
      faqTitle: "Preguntas frecuentes",
      faqItems: [
        {
          question: "¿Qué huso usa la página cuando un país tiene varios?",
          answer:
            "La página muestra el huso de la capital del país por defecto. Los países con múltiples husos relevantes listan las demás opciones para consulta.",
        },
        {
          question: "¿Por qué algunos países tienen husos de media hora?",
          answer:
            "Algunos países usan desfases de 30 o 45 minutos en lugar de horas completas, como India (UTC+5:30), Nepal (UTC+5:45) e Irán (UTC+3:30).",
        },
        {
          question: "¿La página actualiza los relojes automáticamente?",
          answer:
            "Sí. Los horarios se recalculan en el navegador en tiempo real sin usar polling agresivo para cada país listado.",
        },
        {
          question: "¿Puedo buscar por capital o nombre alternativo del país?",
          answer:
            "Sí. La búsqueda acepta nombre del país, capital, aliases y fragmentos del timezone para reducir la cuadrícula rápidamente.",
        },
      ],
    },
    ctaTitle: "¿Necesita cerrar un plazo en días hábiles?",
    ctaButton: "Abrir calculadora",
  },
};

interface LocalizedCountryMeta {
  flag: string;
  name: Localized<string>;
  capital: Localized<string>;
  politicalRegime: Localized<string>;
  languages: Localized<string[]>;
}

const COUNTRY_META: Record<string, LocalizedCountryMeta> = {
  // ── AMÉRICA ──
  ag: {
    flag: "🇦🇬",
    name: { pt: "Antígua e Barbuda", en: "Antigua and Barbuda", es: "Antigua y Barbuda" },
    capital: { pt: "Saint John's", en: "Saint John's", es: "Saint John's" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  ar: {
    flag: "🇦🇷",
    name: { pt: "Argentina", en: "Argentina", es: "Argentina" },
    capital: { pt: "Buenos Aires", en: "Buenos Aires", es: "Buenos Aires" },
    politicalRegime: {
      pt: "República federal presidencialista",
      en: "Federal presidential republic",
      es: "República federal presidencialista",
    },
    languages: { pt: ["Espanhol"], en: ["Spanish"], es: ["Español"] },
  },
  bs: {
    flag: "🇧🇸",
    name: { pt: "Bahamas", en: "Bahamas", es: "Bahamas" },
    capital: { pt: "Nassau", en: "Nassau", es: "Nassau" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  bb: {
    flag: "🇧🇧",
    name: { pt: "Barbados", en: "Barbados", es: "Barbados" },
    capital: { pt: "Bridgetown", en: "Bridgetown", es: "Bridgetown" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  bz: {
    flag: "🇧🇿",
    name: { pt: "Belize", en: "Belize", es: "Belice" },
    capital: { pt: "Belmopan", en: "Belmopan", es: "Belmopán" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  bo: {
    flag: "🇧🇴",
    name: { pt: "Bolívia", en: "Bolivia", es: "Bolivia" },
    capital: { pt: "Sucre", en: "Sucre", es: "Sucre" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Espanhol", "Quíchua", "Aimará"],
      en: ["Spanish", "Quechua", "Aymara"],
      es: ["Español", "Quechua", "Aimara"],
    },
  },
  br: {
    flag: "🇧🇷",
    name: { pt: "Brasil", en: "Brazil", es: "Brasil" },
    capital: { pt: "Brasília", en: "Brasília", es: "Brasilia" },
    politicalRegime: {
      pt: "República federativa presidencialista",
      en: "Federal presidential republic",
      es: "República federal presidencialista",
    },
    languages: { pt: ["Português"], en: ["Portuguese"], es: ["Portugués"] },
  },
  ca: {
    flag: "🇨🇦",
    name: { pt: "Canadá", en: "Canada", es: "Canadá" },
    capital: { pt: "Ottawa", en: "Ottawa", es: "Ottawa" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar federal",
      en: "Federal parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria federal",
    },
    languages: { pt: ["Inglês", "Francês"], en: ["English", "French"], es: ["Inglés", "Francés"] },
  },
  cl: {
    flag: "🇨🇱",
    name: { pt: "Chile", en: "Chile", es: "Chile" },
    capital: { pt: "Santiago", en: "Santiago", es: "Santiago" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Espanhol"], en: ["Spanish"], es: ["Español"] },
  },
  co: {
    flag: "🇨🇴",
    name: { pt: "Colômbia", en: "Colombia", es: "Colombia" },
    capital: { pt: "Bogotá", en: "Bogotá", es: "Bogotá" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Espanhol"], en: ["Spanish"], es: ["Español"] },
  },
  cr: {
    flag: "🇨🇷",
    name: { pt: "Costa Rica", en: "Costa Rica", es: "Costa Rica" },
    capital: { pt: "San José", en: "San José", es: "San José" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Espanhol"], en: ["Spanish"], es: ["Español"] },
  },
  cu: {
    flag: "🇨🇺",
    name: { pt: "Cuba", en: "Cuba", es: "Cuba" },
    capital: { pt: "Havana", en: "Havana", es: "La Habana" },
    politicalRegime: {
      pt: "República socialista de partido único",
      en: "Single-party socialist republic",
      es: "República socialista de partido único",
    },
    languages: { pt: ["Espanhol"], en: ["Spanish"], es: ["Español"] },
  },
  dm: {
    flag: "🇩🇲",
    name: { pt: "Dominica", en: "Dominica", es: "Dominica" },
    capital: { pt: "Roseau", en: "Roseau", es: "Roseau" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  do: {
    flag: "🇩🇴",
    name: { pt: "República Dominicana", en: "Dominican Republic", es: "República Dominicana" },
    capital: { pt: "Santo Domingo", en: "Santo Domingo", es: "Santo Domingo" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Espanhol"], en: ["Spanish"], es: ["Español"] },
  },
  ec: {
    flag: "🇪🇨",
    name: { pt: "Equador", en: "Ecuador", es: "Ecuador" },
    capital: { pt: "Quito", en: "Quito", es: "Quito" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Espanhol"], en: ["Spanish"], es: ["Español"] },
  },
  sv: {
    flag: "🇸🇻",
    name: { pt: "El Salvador", en: "El Salvador", es: "El Salvador" },
    capital: { pt: "San Salvador", en: "San Salvador", es: "San Salvador" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Espanhol"], en: ["Spanish"], es: ["Español"] },
  },
  us: {
    flag: "🇺🇸",
    name: { pt: "Estados Unidos", en: "United States", es: "Estados Unidos" },
    capital: { pt: "Washington, D.C.", en: "Washington, D.C.", es: "Washington, D. C." },
    politicalRegime: {
      pt: "República federal presidencialista",
      en: "Federal presidential republic",
      es: "República federal presidencialista",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  gd: {
    flag: "🇬🇩",
    name: { pt: "Granada", en: "Grenada", es: "Granada" },
    capital: { pt: "Saint George's", en: "Saint George's", es: "Saint George's" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  gt: {
    flag: "🇬🇹",
    name: { pt: "Guatemala", en: "Guatemala", es: "Guatemala" },
    capital: { pt: "Cidade da Guatemala", en: "Guatemala City", es: "Ciudad de Guatemala" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Espanhol"], en: ["Spanish"], es: ["Español"] },
  },
  gy: {
    flag: "🇬🇾",
    name: { pt: "Guiana", en: "Guyana", es: "Guyana" },
    capital: { pt: "Georgetown", en: "Georgetown", es: "Georgetown" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  ht: {
    flag: "🇭🇹",
    name: { pt: "Haiti", en: "Haiti", es: "Haití" },
    capital: { pt: "Porto Príncipe", en: "Port-au-Prince", es: "Puerto Príncipe" },
    politicalRegime: {
      pt: "República semipresidencialista",
      en: "Semi-presidential republic",
      es: "República semipresidencialista",
    },
    languages: {
      pt: ["Francês", "Crioulo haitiano"],
      en: ["French", "Haitian Creole"],
      es: ["Francés", "Criollo haitiano"],
    },
  },
  hn: {
    flag: "🇭🇳",
    name: { pt: "Honduras", en: "Honduras", es: "Honduras" },
    capital: { pt: "Tegucigalpa", en: "Tegucigalpa", es: "Tegucigalpa" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Espanhol"], en: ["Spanish"], es: ["Español"] },
  },
  jm: {
    flag: "🇯🇲",
    name: { pt: "Jamaica", en: "Jamaica", es: "Jamaica" },
    capital: { pt: "Kingston", en: "Kingston", es: "Kingston" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  mx: {
    flag: "🇲🇽",
    name: { pt: "México", en: "Mexico", es: "México" },
    capital: { pt: "Cidade do México", en: "Mexico City", es: "Ciudad de México" },
    politicalRegime: {
      pt: "República federal presidencialista",
      en: "Federal presidential republic",
      es: "República federal presidencialista",
    },
    languages: { pt: ["Espanhol"], en: ["Spanish"], es: ["Español"] },
  },
  ni: {
    flag: "🇳🇮",
    name: { pt: "Nicarágua", en: "Nicaragua", es: "Nicaragua" },
    capital: { pt: "Manágua", en: "Managua", es: "Managua" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Espanhol"], en: ["Spanish"], es: ["Español"] },
  },
  pa: {
    flag: "🇵🇦",
    name: { pt: "Panamá", en: "Panama", es: "Panamá" },
    capital: { pt: "Cidade do Panamá", en: "Panama City", es: "Ciudad de Panamá" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Espanhol"], en: ["Spanish"], es: ["Español"] },
  },
  py: {
    flag: "🇵🇾",
    name: { pt: "Paraguai", en: "Paraguay", es: "Paraguay" },
    capital: { pt: "Assunção", en: "Asunción", es: "Asunción" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Espanhol", "Guarani"],
      en: ["Spanish", "Guaraní"],
      es: ["Español", "Guaraní"],
    },
  },
  pe: {
    flag: "🇵🇪",
    name: { pt: "Peru", en: "Peru", es: "Perú" },
    capital: { pt: "Lima", en: "Lima", es: "Lima" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Espanhol"], en: ["Spanish"], es: ["Español"] },
  },
  kn: {
    flag: "🇰🇳",
    name: { pt: "São Cristóvão e Neves", en: "Saint Kitts and Nevis", es: "San Cristóbal y Nieves" },
    capital: { pt: "Basseterre", en: "Basseterre", es: "Basseterre" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar federal",
      en: "Federal parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria federal",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  vc: {
    flag: "🇻🇨",
    name: { pt: "São Vicente e Granadinas", en: "Saint Vincent and the Grenadines", es: "San Vicente y las Granadinas" },
    capital: { pt: "Kingstown", en: "Kingstown", es: "Kingstown" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  lc: {
    flag: "🇱🇨",
    name: { pt: "Santa Lúcia", en: "Saint Lucia", es: "Santa Lucía" },
    capital: { pt: "Castries", en: "Castries", es: "Castries" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  sr: {
    flag: "🇸🇷",
    name: { pt: "Suriname", en: "Suriname", es: "Surinam" },
    capital: { pt: "Paramaribo", en: "Paramaribo", es: "Paramaribo" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Holandês"], en: ["Dutch"], es: ["Neerlandés"] },
  },
  tt: {
    flag: "🇹🇹",
    name: { pt: "Trinidad e Tobago", en: "Trinidad and Tobago", es: "Trinidad y Tobago" },
    capital: { pt: "Porto Espanha", en: "Port of Spain", es: "Puerto España" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  uy: {
    flag: "🇺🇾",
    name: { pt: "Uruguai", en: "Uruguay", es: "Uruguay" },
    capital: { pt: "Montevidéu", en: "Montevideo", es: "Montevideo" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Espanhol"], en: ["Spanish"], es: ["Español"] },
  },
  ve: {
    flag: "🇻🇪",
    name: { pt: "Venezuela", en: "Venezuela", es: "Venezuela" },
    capital: { pt: "Caracas", en: "Caracas", es: "Caracas" },
    politicalRegime: {
      pt: "República federal presidencialista",
      en: "Federal presidential republic",
      es: "República federal presidencialista",
    },
    languages: { pt: ["Espanhol"], en: ["Spanish"], es: ["Español"] },
  },

  // ── ÁSIA ──
  af: {
    flag: "🇦🇫",
    name: { pt: "Afeganistão", en: "Afghanistan", es: "Afganistán" },
    capital: { pt: "Cabul", en: "Kabul", es: "Kabul" },
    politicalRegime: {
      pt: "Emirado islâmico",
      en: "Islamic Emirate",
      es: "Emirato islámico",
    },
    languages: {
      pt: ["Dari", "Pashto"],
      en: ["Dari", "Pashto"],
      es: ["Dari", "Pashto"],
    },
  },
  sa: {
    flag: "🇸🇦",
    name: { pt: "Arábia Saudita", en: "Saudi Arabia", es: "Arabia Saudita" },
    capital: { pt: "Riade", en: "Riyadh", es: "Riad" },
    politicalRegime: {
      pt: "Monarquia absoluta",
      en: "Absolute monarchy",
      es: "Monarquía absoluta",
    },
    languages: { pt: ["Árabe"], en: ["Arabic"], es: ["Árabe"] },
  },
  am: {
    flag: "🇦🇲",
    name: { pt: "Armênia", en: "Armenia", es: "Armenia" },
    capital: { pt: "Erevã", en: "Yerevan", es: "Ereván" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Armênio"], en: ["Armenian"], es: ["Armenio"] },
  },
  az: {
    flag: "🇦🇿",
    name: { pt: "Azerbaijão", en: "Azerbaijan", es: "Azerbaiyán" },
    capital: { pt: "Baku", en: "Baku", es: "Bakú" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Azerbaijano"], en: ["Azerbaijani"], es: ["Azerbaiyano"] },
  },
  bh: {
    flag: "🇧🇭",
    name: { pt: "Barein", en: "Bahrain", es: "Baréin" },
    capital: { pt: "Manama", en: "Manama", es: "Manama" },
    politicalRegime: {
      pt: "Monarquia constitucional",
      en: "Constitutional monarchy",
      es: "Monarquía constitucional",
    },
    languages: { pt: ["Árabe"], en: ["Arabic"], es: ["Árabe"] },
  },
  bd: {
    flag: "🇧🇩",
    name: { pt: "Bangladesh", en: "Bangladesh", es: "Bangladés" },
    capital: { pt: "Daca", en: "Dhaka", es: "Daca" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Bengali"], en: ["Bengali"], es: ["Bengalí"] },
  },
  bn: {
    flag: "🇧🇳",
    name: { pt: "Brunei", en: "Brunei", es: "Brunéi" },
    capital: { pt: "Bandar Seri Begawan", en: "Bandar Seri Begawan", es: "Bandar Seri Begawan" },
    politicalRegime: {
      pt: "Monarquia absoluta",
      en: "Absolute monarchy",
      es: "Monarquía absoluta",
    },
    languages: { pt: ["Malaio"], en: ["Malay"], es: ["Malayo"] },
  },
  bt: {
    flag: "🇧🇹",
    name: { pt: "Butão", en: "Bhutan", es: "Bután" },
    capital: { pt: "Thimphu", en: "Thimphu", es: "Timbu" },
    politicalRegime: {
      pt: "Monarquia constitucional",
      en: "Constitutional monarchy",
      es: "Monarquía constitucional",
    },
    languages: { pt: ["Dzongkha"], en: ["Dzongkha"], es: ["Dzongkha"] },
  },
  kh: {
    flag: "🇰🇭",
    name: { pt: "Camboja", en: "Cambodia", es: "Camboya" },
    capital: { pt: "Phnom Penh", en: "Phnom Penh", es: "Nom Pen" },
    politicalRegime: {
      pt: "Monarquia constitucional",
      en: "Constitutional monarchy",
      es: "Monarquía constitucional",
    },
    languages: { pt: ["Khmer"], en: ["Khmer"], es: ["Jemer"] },
  },
  qa: {
    flag: "🇶🇦",
    name: { pt: "Catar", en: "Qatar", es: "Catar" },
    capital: { pt: "Doha", en: "Doha", es: "Doha" },
    politicalRegime: {
      pt: "Monarquia absoluta",
      en: "Absolute monarchy",
      es: "Monarquía absoluta",
    },
    languages: { pt: ["Árabe"], en: ["Arabic"], es: ["Árabe"] },
  },
  kz: {
    flag: "🇰🇿",
    name: { pt: "Cazaquistão", en: "Kazakhstan", es: "Kazajistán" },
    capital: { pt: "Astana", en: "Astana", es: "Astana" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Cazaque", "Russo"],
      en: ["Kazakh", "Russian"],
      es: ["Kazajo", "Ruso"],
    },
  },
  cn: {
    flag: "🇨🇳",
    name: { pt: "China", en: "China", es: "China" },
    capital: { pt: "Pequim", en: "Beijing", es: "Pekín" },
    politicalRegime: {
      pt: "República socialista de partido único",
      en: "Single-party socialist republic",
      es: "República socialista de partido único",
    },
    languages: { pt: ["Mandarim"], en: ["Mandarin"], es: ["Mandarín"] },
  },
  kp: {
    flag: "🇰🇵",
    name: { pt: "Coreia do Norte", en: "North Korea", es: "Corea del Norte" },
    capital: { pt: "Pyongyang", en: "Pyongyang", es: "Pyongyang" },
    politicalRegime: {
      pt: "República socialista de partido único",
      en: "Single-party socialist republic",
      es: "República socialista de partido único",
    },
    languages: { pt: ["Coreano"], en: ["Korean"], es: ["Coreano"] },
  },
  kr: {
    flag: "🇰🇷",
    name: { pt: "Coreia do Sul", en: "South Korea", es: "Corea del Sur" },
    capital: { pt: "Seul", en: "Seoul", es: "Seúl" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Coreano"], en: ["Korean"], es: ["Coreano"] },
  },
  ae: {
    flag: "🇦🇪",
    name: { pt: "Emirados Árabes Unidos", en: "United Arab Emirates", es: "Emiratos Árabes Unidos" },
    capital: { pt: "Abu Dhabi", en: "Abu Dhabi", es: "Abu Dabi" },
    politicalRegime: {
      pt: "Monarquia constitucional federal",
      en: "Federal constitutional monarchy",
      es: "Monarquía constitucional federal",
    },
    languages: { pt: ["Árabe"], en: ["Arabic"], es: ["Árabe"] },
  },
  ph: {
    flag: "🇵🇭",
    name: { pt: "Filipinas", en: "Philippines", es: "Filipinas" },
    capital: { pt: "Manila", en: "Manila", es: "Manila" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Filipino", "Inglês"],
      en: ["Filipino", "English"],
      es: ["Filipino", "Inglés"],
    },
  },
  ge: {
    flag: "🇬🇪",
    name: { pt: "Geórgia", en: "Georgia", es: "Georgia" },
    capital: { pt: "Tbilisi", en: "Tbilisi", es: "Tiflis" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Georgiano"], en: ["Georgian"], es: ["Georgiano"] },
  },
  hk: {
    flag: "🇭🇰",
    name: { pt: "Hong Kong", en: "Hong Kong", es: "Hong Kong" },
    capital: { pt: "Hong Kong", en: "Hong Kong", es: "Hong Kong" },
    politicalRegime: {
      pt: "Região administrativa especial",
      en: "Special administrative region",
      es: "Región administrativa especial",
    },
    languages: {
      pt: ["Chinês", "Inglês"],
      en: ["Chinese", "English"],
      es: ["Chino", "Inglés"],
    },
  },
  ye: {
    flag: "🇾🇪",
    name: { pt: "Iêmen", en: "Yemen", es: "Yemen" },
    capital: { pt: "Sanaa", en: "Sana'a", es: "Saná" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Árabe"], en: ["Arabic"], es: ["Árabe"] },
  },
  in: {
    flag: "🇮🇳",
    name: { pt: "Índia", en: "India", es: "India" },
    capital: { pt: "Nova Délhi", en: "New Delhi", es: "Nueva Delhi" },
    politicalRegime: {
      pt: "República federal parlamentar",
      en: "Federal parliamentary republic",
      es: "República federal parlamentaria",
    },
    languages: {
      pt: ["Hindi", "Inglês e idiomas regionais"],
      en: ["Hindi", "English and regional languages"],
      es: ["Hindi", "Inglés e idiomas regionales"],
    },
  },
  id: {
    flag: "🇮🇩",
    name: { pt: "Indonésia", en: "Indonesia", es: "Indonesia" },
    capital: { pt: "Jacarta", en: "Jakarta", es: "Yakarta" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Indonésio"], en: ["Indonesian"], es: ["Indonesio"] },
  },
  ir: {
    flag: "🇮🇷",
    name: { pt: "Irã", en: "Iran", es: "Irán" },
    capital: { pt: "Teerã", en: "Tehran", es: "Teherán" },
    politicalRegime: {
      pt: "República islâmica teocrática",
      en: "Theocratic Islamic republic",
      es: "República islámica teocrática",
    },
    languages: { pt: ["Persa"], en: ["Persian"], es: ["Persa"] },
  },
  iq: {
    flag: "🇮🇶",
    name: { pt: "Iraque", en: "Iraq", es: "Irak" },
    capital: { pt: "Bagdá", en: "Baghdad", es: "Bagdad" },
    politicalRegime: {
      pt: "República parlamentar federal",
      en: "Federal parliamentary republic",
      es: "República parlamentaria federal",
    },
    languages: {
      pt: ["Árabe", "Curdo"],
      en: ["Arabic", "Kurdish"],
      es: ["Árabe", "Kurdo"],
    },
  },
  il: {
    flag: "🇮🇱",
    name: { pt: "Israel", en: "Israel", es: "Israel" },
    capital: { pt: "Jerusalém", en: "Jerusalem", es: "Jerusalén" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: {
      pt: ["Hebraico", "Árabe"],
      en: ["Hebrew", "Arabic"],
      es: ["Hebreo", "Árabe"],
    },
  },
  jp: {
    flag: "🇯🇵",
    name: { pt: "Japão", en: "Japan", es: "Japón" },
    capital: { pt: "Tóquio", en: "Tokyo", es: "Tokio" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: { pt: ["Japonês"], en: ["Japanese"], es: ["Japonés"] },
  },
  jo: {
    flag: "🇯🇴",
    name: { pt: "Jordânia", en: "Jordan", es: "Jordania" },
    capital: { pt: "Amã", en: "Amman", es: "Ammán" },
    politicalRegime: {
      pt: "Monarquia constitucional",
      en: "Constitutional monarchy",
      es: "Monarquía constitucional",
    },
    languages: { pt: ["Árabe"], en: ["Arabic"], es: ["Árabe"] },
  },
  kw: {
    flag: "🇰🇼",
    name: { pt: "Kuwait", en: "Kuwait", es: "Kuwait" },
    capital: { pt: "Cidade do Kuwait", en: "Kuwait City", es: "Ciudad de Kuwait" },
    politicalRegime: {
      pt: "Monarquia constitucional",
      en: "Constitutional monarchy",
      es: "Monarquía constitucional",
    },
    languages: { pt: ["Árabe"], en: ["Arabic"], es: ["Árabe"] },
  },
  kg: {
    flag: "🇰🇬",
    name: { pt: "Quirguistão", en: "Kyrgyzstan", es: "Kirguistán" },
    capital: { pt: "Bishkek", en: "Bishkek", es: "Biskek" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Quirguiz", "Russo"],
      en: ["Kyrgyz", "Russian"],
      es: ["Kirguís", "Ruso"],
    },
  },
  lb: {
    flag: "🇱🇧",
    name: { pt: "Líbano", en: "Lebanon", es: "Líbano" },
    capital: { pt: "Beirute", en: "Beirut", es: "Beirut" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Árabe"], en: ["Arabic"], es: ["Árabe"] },
  },
  my: {
    flag: "🇲🇾",
    name: { pt: "Malásia", en: "Malaysia", es: "Malasia" },
    capital: { pt: "Kuala Lumpur", en: "Kuala Lumpur", es: "Kuala Lumpur" },
    politicalRegime: {
      pt: "Monarquia constitucional federal",
      en: "Federal constitutional monarchy",
      es: "Monarquía constitucional federal",
    },
    languages: { pt: ["Malaio"], en: ["Malay"], es: ["Malayo"] },
  },
  mv: {
    flag: "🇲🇻",
    name: { pt: "Maldivas", en: "Maldives", es: "Maldivas" },
    capital: { pt: "Malé", en: "Malé", es: "Malé" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Maldiviano"], en: ["Maldivian"], es: ["Maldivo"] },
  },
  mm: {
    flag: "🇲🇲",
    name: { pt: "Mianmar", en: "Myanmar", es: "Myanmar" },
    capital: { pt: "Naypyidaw", en: "Naypyidaw", es: "Naipyidó" },
    politicalRegime: {
      pt: "Junta militar",
      en: "Military junta",
      es: "Junta militar",
    },
    languages: { pt: ["Birmanês"], en: ["Burmese"], es: ["Birmano"] },
  },
  mn: {
    flag: "🇲🇳",
    name: { pt: "Mongólia", en: "Mongolia", es: "Mongolia" },
    capital: { pt: "Ulaanbaatar", en: "Ulaanbaatar", es: "Ulán Bator" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Mongol"], en: ["Mongolian"], es: ["Mongol"] },
  },
  np: {
    flag: "🇳🇵",
    name: { pt: "Nepal", en: "Nepal", es: "Nepal" },
    capital: { pt: "Catmandu", en: "Kathmandu", es: "Katmandú" },
    politicalRegime: {
      pt: "República parlamentar federal",
      en: "Federal parliamentary republic",
      es: "República parlamentaria federal",
    },
    languages: { pt: ["Nepalês"], en: ["Nepali"], es: ["Nepalés"] },
  },
  om: {
    flag: "🇴🇲",
    name: { pt: "Omã", en: "Oman", es: "Omán" },
    capital: { pt: "Mascate", en: "Muscat", es: "Mascate" },
    politicalRegime: {
      pt: "Monarquia absoluta",
      en: "Absolute monarchy",
      es: "Monarquía absoluta",
    },
    languages: { pt: ["Árabe"], en: ["Arabic"], es: ["Árabe"] },
  },
  pk: {
    flag: "🇵🇰",
    name: { pt: "Paquistão", en: "Pakistan", es: "Pakistán" },
    capital: { pt: "Islamabad", en: "Islamabad", es: "Islamabad" },
    politicalRegime: {
      pt: "República parlamentar federal",
      en: "Federal parliamentary republic",
      es: "República parlamentaria federal",
    },
    languages: {
      pt: ["Urdu", "Inglês"],
      en: ["Urdu", "English"],
      es: ["Urdu", "Inglés"],
    },
  },
  ru: {
    flag: "🇷🇺",
    name: { pt: "Rússia", en: "Russia", es: "Rusia" },
    capital: { pt: "Moscou", en: "Moscow", es: "Moscú" },
    politicalRegime: {
      pt: "República federal semipresidencialista",
      en: "Federal semi-presidential republic",
      es: "República federal semipresidencialista",
    },
    languages: { pt: ["Russo"], en: ["Russian"], es: ["Ruso"] },
  },
  sg: {
    flag: "🇸🇬",
    name: { pt: "Singapura", en: "Singapore", es: "Singapur" },
    capital: { pt: "Singapura", en: "Singapore", es: "Singapur" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: {
      pt: ["Inglês", "Mandarim", "Malaio", "Tâmil"],
      en: ["English", "Mandarin", "Malay", "Tamil"],
      es: ["Inglés", "Mandarín", "Malayo", "Tamil"],
    },
  },
  sy: {
    flag: "🇸🇾",
    name: { pt: "Síria", en: "Syria", es: "Siria" },
    capital: { pt: "Damasco", en: "Damascus", es: "Damasco" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Árabe"], en: ["Arabic"], es: ["Árabe"] },
  },
  lk: {
    flag: "🇱🇰",
    name: { pt: "Sri Lanka", en: "Sri Lanka", es: "Sri Lanka" },
    capital: {
      pt: "Sri Jayawardenepura Kotte",
      en: "Sri Jayawardenepura Kotte",
      es: "Sri Jayawardenepura Kotte",
    },
    politicalRegime: {
      pt: "República semipresidencialista",
      en: "Semi-presidential republic",
      es: "República semipresidencialista",
    },
    languages: {
      pt: ["Cingalês", "Tâmil"],
      en: ["Sinhala", "Tamil"],
      es: ["Cingalés", "Tamil"],
    },
  },
  tj: {
    flag: "🇹🇯",
    name: { pt: "Tajiquistão", en: "Tajikistan", es: "Tayikistán" },
    capital: { pt: "Dushanbe", en: "Dushanbe", es: "Dusambé" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Tadjique"], en: ["Tajik"], es: ["Tayiko"] },
  },
  tw: {
    flag: "🇹🇼",
    name: { pt: "Taiwan", en: "Taiwan", es: "Taiwán" },
    capital: { pt: "Taipei", en: "Taipei", es: "Taipéi" },
    politicalRegime: {
      pt: "República semipresidencialista",
      en: "Semi-presidential republic",
      es: "República semipresidencialista",
    },
    languages: { pt: ["Mandarim"], en: ["Mandarin"], es: ["Mandarín"] },
  },
  th: {
    flag: "🇹🇭",
    name: { pt: "Tailândia", en: "Thailand", es: "Tailandia" },
    capital: { pt: "Bangkok", en: "Bangkok", es: "Bangkok" },
    politicalRegime: {
      pt: "Monarquia constitucional",
      en: "Constitutional monarchy",
      es: "Monarquía constitucional",
    },
    languages: { pt: ["Tailandês"], en: ["Thai"], es: ["Tailandés"] },
  },
  tl: {
    flag: "🇹🇱",
    name: { pt: "Timor-Leste", en: "Timor-Leste", es: "Timor Oriental" },
    capital: { pt: "Díli", en: "Dili", es: "Dili" },
    politicalRegime: {
      pt: "República semipresidencialista",
      en: "Semi-presidential republic",
      es: "República semipresidencialista",
    },
    languages: {
      pt: ["Português", "Tétum"],
      en: ["Portuguese", "Tetum"],
      es: ["Portugués", "Tétum"],
    },
  },
  tm: {
    flag: "🇹🇲",
    name: { pt: "Turcomenistão", en: "Turkmenistan", es: "Turkmenistán" },
    capital: { pt: "Ashgabat", en: "Ashgabat", es: "Asjabad" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Turcomeno"], en: ["Turkmen"], es: ["Turcomano"] },
  },
  tr: {
    flag: "🇹🇷",
    name: { pt: "Turquia", en: "Turkey", es: "Turquía" },
    capital: { pt: "Ancara", en: "Ankara", es: "Ankara" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Turco"], en: ["Turkish"], es: ["Turco"] },
  },
  uz: {
    flag: "🇺🇿",
    name: { pt: "Uzbequistão", en: "Uzbekistan", es: "Uzbekistán" },
    capital: { pt: "Tashkent", en: "Tashkent", es: "Taskent" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Uzbeque"], en: ["Uzbek"], es: ["Uzbeko"] },
  },
  vn: {
    flag: "🇻🇳",
    name: { pt: "Vietnã", en: "Vietnam", es: "Vietnam" },
    capital: { pt: "Hanói", en: "Hanoi", es: "Hanói" },
    politicalRegime: {
      pt: "República socialista de partido único",
      en: "Single-party socialist republic",
      es: "República socialista de partido único",
    },
    languages: { pt: ["Vietnamita"], en: ["Vietnamese"], es: ["Vietnamita"] },
  },

  // ── ÁFRICA ──
  za: {
    flag: "🇿🇦",
    name: { pt: "África do Sul", en: "South Africa", es: "Sudáfrica" },
    capital: { pt: "Pretória", en: "Pretoria", es: "Pretoria" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: {
      pt: ["Zulu", "Xhosa", "Africâner", "Inglês"],
      en: ["Zulu", "Xhosa", "Afrikaans", "English"],
      es: ["Zulú", "Xhosa", "Afrikáans", "Inglés"],
    },
  },
  dz: {
    flag: "🇩🇿",
    name: { pt: "Argélia", en: "Algeria", es: "Argelia" },
    capital: { pt: "Argel", en: "Algiers", es: "Argel" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Árabe", "Amazigh"],
      en: ["Arabic", "Amazigh"],
      es: ["Árabe", "Amazigh"],
    },
  },
  ao: {
    flag: "🇦🇴",
    name: { pt: "Angola", en: "Angola", es: "Angola" },
    capital: { pt: "Luanda", en: "Luanda", es: "Luanda" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Português"], en: ["Portuguese"], es: ["Portugués"] },
  },
  bj: {
    flag: "🇧🇯",
    name: { pt: "Benin", en: "Benin", es: "Benín" },
    capital: { pt: "Porto-Novo", en: "Porto-Novo", es: "Porto Novo" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Francês"], en: ["French"], es: ["Francés"] },
  },
  bw: {
    flag: "🇧🇼",
    name: { pt: "Botsuana", en: "Botswana", es: "Botsuana" },
    capital: { pt: "Gaborone", en: "Gaborone", es: "Gaborone" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: {
      pt: ["Inglês", "Setswana"],
      en: ["English", "Setswana"],
      es: ["Inglés", "Setswana"],
    },
  },
  bf: {
    flag: "🇧🇫",
    name: { pt: "Burkina Faso", en: "Burkina Faso", es: "Burkina Faso" },
    capital: { pt: "Ouagadougou", en: "Ouagadougou", es: "Uagadugú" },
    politicalRegime: {
      pt: "Junta militar",
      en: "Military junta",
      es: "Junta militar",
    },
    languages: { pt: ["Francês"], en: ["French"], es: ["Francés"] },
  },
  bi: {
    flag: "🇧🇮",
    name: { pt: "Burundi", en: "Burundi", es: "Burundi" },
    capital: { pt: "Gitega", en: "Gitega", es: "Gitega" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Kirundi", "Francês"],
      en: ["Kirundi", "French"],
      es: ["Kirundi", "Francés"],
    },
  },
  cv: {
    flag: "🇨🇻",
    name: { pt: "Cabo Verde", en: "Cape Verde", es: "Cabo Verde" },
    capital: { pt: "Praia", en: "Praia", es: "Praia" },
    politicalRegime: {
      pt: "República semipresidencialista",
      en: "Semi-presidential republic",
      es: "República semipresidencialista",
    },
    languages: { pt: ["Português"], en: ["Portuguese"], es: ["Portugués"] },
  },
  cm: {
    flag: "🇨🇲",
    name: { pt: "Camarões", en: "Cameroon", es: "Camerún" },
    capital: { pt: "Yaoundé", en: "Yaoundé", es: "Yaundé" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Francês", "Inglês"],
      en: ["French", "English"],
      es: ["Francés", "Inglés"],
    },
  },
  td: {
    flag: "🇹🇩",
    name: { pt: "Chade", en: "Chad", es: "Chad" },
    capital: { pt: "N'Djamena", en: "N'Djamena", es: "Yamena" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Francês", "Árabe"],
      en: ["French", "Arabic"],
      es: ["Francés", "Árabe"],
    },
  },
  km: {
    flag: "🇰🇲",
    name: { pt: "Comores", en: "Comoros", es: "Comoras" },
    capital: { pt: "Moroni", en: "Moroni", es: "Moroni" },
    politicalRegime: {
      pt: "República presidencialista federal",
      en: "Federal presidential republic",
      es: "República presidencialista federal",
    },
    languages: {
      pt: ["Árabe", "Francês", "Comoriano"],
      en: ["Arabic", "French", "Comorian"],
      es: ["Árabe", "Francés", "Comorense"],
    },
  },
  cg: {
    flag: "🇨🇬",
    name: { pt: "Congo", en: "Republic of the Congo", es: "República del Congo" },
    capital: { pt: "Brazzaville", en: "Brazzaville", es: "Brazzaville" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Francês"], en: ["French"], es: ["Francés"] },
  },
  cd: {
    flag: "🇨🇩",
    name: {
      pt: "República Democrática do Congo",
      en: "Democratic Republic of the Congo",
      es: "República Democrática del Congo",
    },
    capital: { pt: "Kinshasa", en: "Kinshasa", es: "Kinshasa" },
    politicalRegime: {
      pt: "República semipresidencialista",
      en: "Semi-presidential republic",
      es: "República semipresidencialista",
    },
    languages: { pt: ["Francês"], en: ["French"], es: ["Francés"] },
  },
  ci: {
    flag: "🇨🇮",
    name: { pt: "Costa do Marfim", en: "Ivory Coast", es: "Costa de Marfil" },
    capital: { pt: "Yamoussoukro", en: "Yamoussoukro", es: "Yamusukro" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Francês"], en: ["French"], es: ["Francés"] },
  },
  dj: {
    flag: "🇩🇯",
    name: { pt: "Djibouti", en: "Djibouti", es: "Yibuti" },
    capital: { pt: "Djibouti", en: "Djibouti", es: "Yibuti" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Francês", "Árabe"],
      en: ["French", "Arabic"],
      es: ["Francés", "Árabe"],
    },
  },
  eg: {
    flag: "🇪🇬",
    name: { pt: "Egito", en: "Egypt", es: "Egipto" },
    capital: { pt: "Cairo", en: "Cairo", es: "El Cairo" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Árabe"], en: ["Arabic"], es: ["Árabe"] },
  },
  er: {
    flag: "🇪🇷",
    name: { pt: "Eritreia", en: "Eritrea", es: "Eritrea" },
    capital: { pt: "Asmara", en: "Asmara", es: "Asmara" },
    politicalRegime: {
      pt: "República presidencialista de partido único",
      en: "Single-party presidential republic",
      es: "República presidencialista de partido único",
    },
    languages: {
      pt: ["Tigrínia", "Árabe"],
      en: ["Tigrinya", "Arabic"],
      es: ["Tigriña", "Árabe"],
    },
  },
  sz: {
    flag: "🇸🇿",
    name: { pt: "Eswatini", en: "Eswatini", es: "Esuatini" },
    capital: { pt: "Mbabane", en: "Mbabane", es: "Mbabane" },
    politicalRegime: {
      pt: "Monarquia absoluta",
      en: "Absolute monarchy",
      es: "Monarquía absoluta",
    },
    languages: {
      pt: ["Suázi", "Inglês"],
      en: ["Swati", "English"],
      es: ["Suazi", "Inglés"],
    },
  },
  et: {
    flag: "🇪🇹",
    name: { pt: "Etiópia", en: "Ethiopia", es: "Etiopía" },
    capital: { pt: "Addis Abeba", en: "Addis Ababa", es: "Adís Abeba" },
    politicalRegime: {
      pt: "República parlamentar federal",
      en: "Federal parliamentary republic",
      es: "República parlamentaria federal",
    },
    languages: { pt: ["Amárico"], en: ["Amharic"], es: ["Amhárico"] },
  },
  ga: {
    flag: "🇬🇦",
    name: { pt: "Gabão", en: "Gabon", es: "Gabón" },
    capital: { pt: "Libreville", en: "Libreville", es: "Libreville" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Francês"], en: ["French"], es: ["Francés"] },
  },
  gm: {
    flag: "🇬🇲",
    name: { pt: "Gâmbia", en: "Gambia", es: "Gambia" },
    capital: { pt: "Banjul", en: "Banjul", es: "Banjul" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  gh: {
    flag: "🇬🇭",
    name: { pt: "Gana", en: "Ghana", es: "Ghana" },
    capital: { pt: "Acra", en: "Accra", es: "Acra" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  gn: {
    flag: "🇬🇳",
    name: { pt: "Guiné", en: "Guinea", es: "Guinea" },
    capital: { pt: "Conacri", en: "Conakry", es: "Conakri" },
    politicalRegime: {
      pt: "Junta militar",
      en: "Military junta",
      es: "Junta militar",
    },
    languages: { pt: ["Francês"], en: ["French"], es: ["Francés"] },
  },
  gw: {
    flag: "🇬🇼",
    name: { pt: "Guiné-Bissau", en: "Guinea-Bissau", es: "Guinea-Bisáu" },
    capital: { pt: "Bissau", en: "Bissau", es: "Bisáu" },
    politicalRegime: {
      pt: "República semipresidencialista",
      en: "Semi-presidential republic",
      es: "República semipresidencialista",
    },
    languages: { pt: ["Português"], en: ["Portuguese"], es: ["Portugués"] },
  },
  gq: {
    flag: "🇬🇶",
    name: { pt: "Guiné Equatorial", en: "Equatorial Guinea", es: "Guinea Ecuatorial" },
    capital: { pt: "Malabo", en: "Malabo", es: "Malabo" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Espanhol", "Francês", "Português"],
      en: ["Spanish", "French", "Portuguese"],
      es: ["Español", "Francés", "Portugués"],
    },
  },
  ke: {
    flag: "🇰🇪",
    name: { pt: "Quênia", en: "Kenya", es: "Kenia" },
    capital: { pt: "Nairóbi", en: "Nairobi", es: "Nairobi" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Suaíli", "Inglês"],
      en: ["Swahili", "English"],
      es: ["Suajili", "Inglés"],
    },
  },
  ls: {
    flag: "🇱🇸",
    name: { pt: "Lesoto", en: "Lesotho", es: "Lesoto" },
    capital: { pt: "Maseru", en: "Maseru", es: "Maseru" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: {
      pt: ["Sesoto", "Inglês"],
      en: ["Sesotho", "English"],
      es: ["Sesoto", "Inglés"],
    },
  },
  lr: {
    flag: "🇱🇷",
    name: { pt: "Libéria", en: "Liberia", es: "Liberia" },
    capital: { pt: "Monróvia", en: "Monrovia", es: "Monrovia" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  ly: {
    flag: "🇱🇾",
    name: { pt: "Líbia", en: "Libya", es: "Libia" },
    capital: { pt: "Trípoli", en: "Tripoli", es: "Trípoli" },
    politicalRegime: {
      pt: "Governo de transição",
      en: "Transitional government",
      es: "Gobierno de transición",
    },
    languages: { pt: ["Árabe"], en: ["Arabic"], es: ["Árabe"] },
  },
  mg: {
    flag: "🇲🇬",
    name: { pt: "Madagascar", en: "Madagascar", es: "Madagascar" },
    capital: { pt: "Antananarivo", en: "Antananarivo", es: "Antananarivo" },
    politicalRegime: {
      pt: "República semipresidencialista",
      en: "Semi-presidential republic",
      es: "República semipresidencialista",
    },
    languages: {
      pt: ["Malgaxe", "Francês"],
      en: ["Malagasy", "French"],
      es: ["Malgache", "Francés"],
    },
  },
  mw: {
    flag: "🇲🇼",
    name: { pt: "Malauí", en: "Malawi", es: "Malaui" },
    capital: { pt: "Lilongwe", en: "Lilongwe", es: "Lilongüe" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Inglês", "Chichewa"],
      en: ["English", "Chichewa"],
      es: ["Inglés", "Chichewa"],
    },
  },
  ml: {
    flag: "🇲🇱",
    name: { pt: "Mali", en: "Mali", es: "Malí" },
    capital: { pt: "Bamako", en: "Bamako", es: "Bamako" },
    politicalRegime: {
      pt: "Junta militar",
      en: "Military junta",
      es: "Junta militar",
    },
    languages: { pt: ["Francês"], en: ["French"], es: ["Francés"] },
  },
  ma: {
    flag: "🇲🇦",
    name: { pt: "Marrocos", en: "Morocco", es: "Marruecos" },
    capital: { pt: "Rabat", en: "Rabat", es: "Rabat" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: {
      pt: ["Árabe", "Amazigh"],
      en: ["Arabic", "Amazigh"],
      es: ["Árabe", "Amazigh"],
    },
  },
  mu: {
    flag: "🇲🇺",
    name: { pt: "Maurício", en: "Mauritius", es: "Mauricio" },
    capital: { pt: "Port Louis", en: "Port Louis", es: "Port Louis" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: {
      pt: ["Inglês", "Francês", "Crioulo mauriciano"],
      en: ["English", "French", "Mauritian Creole"],
      es: ["Inglés", "Francés", "Criollo mauriciano"],
    },
  },
  mr: {
    flag: "🇲🇷",
    name: { pt: "Mauritânia", en: "Mauritania", es: "Mauritania" },
    capital: { pt: "Nouakchott", en: "Nouakchott", es: "Nuakchot" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Árabe"], en: ["Arabic"], es: ["Árabe"] },
  },
  mz: {
    flag: "🇲🇿",
    name: { pt: "Moçambique", en: "Mozambique", es: "Mozambique" },
    capital: { pt: "Maputo", en: "Maputo", es: "Maputo" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Português"], en: ["Portuguese"], es: ["Portugués"] },
  },
  na: {
    flag: "🇳🇦",
    name: { pt: "Namíbia", en: "Namibia", es: "Namibia" },
    capital: { pt: "Windhoek", en: "Windhoek", es: "Windhoek" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  ne: {
    flag: "🇳🇪",
    name: { pt: "Niger", en: "Niger", es: "Níger" },
    capital: { pt: "Niamey", en: "Niamey", es: "Niamey" },
    politicalRegime: {
      pt: "Junta militar",
      en: "Military junta",
      es: "Junta militar",
    },
    languages: { pt: ["Francês"], en: ["French"], es: ["Francés"] },
  },
  ng: {
    flag: "🇳🇬",
    name: { pt: "Nigéria", en: "Nigeria", es: "Nigeria" },
    capital: { pt: "Abuja", en: "Abuja", es: "Abuya" },
    politicalRegime: {
      pt: "República federal presidencialista",
      en: "Federal presidential republic",
      es: "República federal presidencialista",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  cf: {
    flag: "🇨🇫",
    name: {
      pt: "República Centro-Africana",
      en: "Central African Republic",
      es: "República Centroafricana",
    },
    capital: { pt: "Bangui", en: "Bangui", es: "Bangui" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Francês", "Sango"],
      en: ["French", "Sango"],
      es: ["Francés", "Sango"],
    },
  },
  rw: {
    flag: "🇷🇼",
    name: { pt: "Ruanda", en: "Rwanda", es: "Ruanda" },
    capital: { pt: "Kigali", en: "Kigali", es: "Kigali" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Kinyarwanda", "Francês", "Inglês"],
      en: ["Kinyarwanda", "French", "English"],
      es: ["Kinyarwanda", "Francés", "Inglés"],
    },
  },
  st: {
    flag: "🇸🇹",
    name: { pt: "São Tomé e Príncipe", en: "São Tomé and Príncipe", es: "Santo Tomé y Príncipe" },
    capital: { pt: "São Tomé", en: "São Tomé", es: "Santo Tomé" },
    politicalRegime: {
      pt: "República semipresidencialista",
      en: "Semi-presidential republic",
      es: "República semipresidencialista",
    },
    languages: { pt: ["Português"], en: ["Portuguese"], es: ["Portugués"] },
  },
  sn: {
    flag: "🇸🇳",
    name: { pt: "Senegal", en: "Senegal", es: "Senegal" },
    capital: { pt: "Dakar", en: "Dakar", es: "Dakar" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Francês"], en: ["French"], es: ["Francés"] },
  },
  sc: {
    flag: "🇸🇨",
    name: { pt: "Seicheles", en: "Seychelles", es: "Seychelles" },
    capital: { pt: "Victoria", en: "Victoria", es: "Victoria" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Crioulo seichelense", "Francês", "Inglês"],
      en: ["Seychellois Creole", "French", "English"],
      es: ["Criollo seychelense", "Francés", "Inglés"],
    },
  },
  sl: {
    flag: "🇸🇱",
    name: { pt: "Serra Leoa", en: "Sierra Leone", es: "Sierra Leona" },
    capital: { pt: "Freetown", en: "Freetown", es: "Freetown" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  so: {
    flag: "🇸🇴",
    name: { pt: "Somália", en: "Somalia", es: "Somalia" },
    capital: { pt: "Mogadíscio", en: "Mogadishu", es: "Mogadiscio" },
    politicalRegime: {
      pt: "República parlamentar federal",
      en: "Federal parliamentary republic",
      es: "República parlamentaria federal",
    },
    languages: {
      pt: ["Somali", "Árabe"],
      en: ["Somali", "Arabic"],
      es: ["Somalí", "Árabe"],
    },
  },
  sd: {
    flag: "🇸🇩",
    name: { pt: "Sudão", en: "Sudan", es: "Sudán" },
    capital: { pt: "Cartum", en: "Khartoum", es: "Jartum" },
    politicalRegime: {
      pt: "Governo de transição",
      en: "Transitional government",
      es: "Gobierno de transición",
    },
    languages: {
      pt: ["Árabe", "Inglês"],
      en: ["Arabic", "English"],
      es: ["Árabe", "Inglés"],
    },
  },
  ss: {
    flag: "🇸🇸",
    name: { pt: "Sudão do Sul", en: "South Sudan", es: "Sudán del Sur" },
    capital: { pt: "Juba", en: "Juba", es: "Yuba" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  tz: {
    flag: "🇹🇿",
    name: { pt: "Tanzânia", en: "Tanzania", es: "Tanzania" },
    capital: { pt: "Dodoma", en: "Dodoma", es: "Dodoma" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Suaíli", "Inglês"],
      en: ["Swahili", "English"],
      es: ["Suajili", "Inglés"],
    },
  },
  tg: {
    flag: "🇹🇬",
    name: { pt: "Togo", en: "Togo", es: "Togo" },
    capital: { pt: "Lomé", en: "Lomé", es: "Lomé" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Francês"], en: ["French"], es: ["Francés"] },
  },
  tn: {
    flag: "🇹🇳",
    name: { pt: "Tunísia", en: "Tunisia", es: "Túnez" },
    capital: { pt: "Túnis", en: "Tunis", es: "Túnez" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Árabe"], en: ["Arabic"], es: ["Árabe"] },
  },
  ug: {
    flag: "🇺🇬",
    name: { pt: "Uganda", en: "Uganda", es: "Uganda" },
    capital: { pt: "Kampala", en: "Kampala", es: "Kampala" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Inglês", "Suaíli"],
      en: ["English", "Swahili"],
      es: ["Inglés", "Suajili"],
    },
  },
  zm: {
    flag: "🇿🇲",
    name: { pt: "Zâmbia", en: "Zambia", es: "Zambia" },
    capital: { pt: "Lusaka", en: "Lusaka", es: "Lusaka" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  zw: {
    flag: "🇿🇼",
    name: { pt: "Zimbábue", en: "Zimbabwe", es: "Zimbabue" },
    capital: { pt: "Harare", en: "Harare", es: "Harare" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Inglês", "Shona", "Ndebele"],
      en: ["English", "Shona", "Ndebele"],
      es: ["Inglés", "Shona", "Ndebele"],
    },
  },

  // ── ANTÁRTIDA ──
  "aq-mcmurdo": {
    flag: "🇦🇶",
    name: { pt: "Estação McMurdo", en: "McMurdo Station", es: "Estación McMurdo" },
    capital: { pt: "McMurdo", en: "McMurdo", es: "McMurdo" },
    politicalRegime: {
      pt: "Base de pesquisa (EUA)",
      en: "Research station (USA)",
      es: "Base de investigación (EE. UU.)",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  "aq-palmer": {
    flag: "🇦🇶",
    name: { pt: "Estação Palmer", en: "Palmer Station", es: "Estación Palmer" },
    capital: { pt: "Palmer", en: "Palmer", es: "Palmer" },
    politicalRegime: {
      pt: "Base de pesquisa (EUA)",
      en: "Research station (USA)",
      es: "Base de investigación (EE. UU.)",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  "aq-rothera": {
    flag: "🇦🇶",
    name: { pt: "Estação Rothera", en: "Rothera Station", es: "Estación Rothera" },
    capital: { pt: "Rothera", en: "Rothera", es: "Rothera" },
    politicalRegime: {
      pt: "Base de pesquisa (Reino Unido)",
      en: "Research station (United Kingdom)",
      es: "Base de investigación (Reino Unido)",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  "aq-comandante-ferraz": {
    flag: "🇧🇷",
    name: {
      pt: "Estação Comandante Ferraz",
      en: "Comandante Ferraz Station",
      es: "Estación Comandante Ferraz",
    },
    capital: { pt: "Comandante Ferraz", en: "Comandante Ferraz", es: "Comandante Ferraz" },
    politicalRegime: {
      pt: "Base de pesquisa (Brasil)",
      en: "Research station (Brazil)",
      es: "Base de investigación (Brasil)",
    },
    languages: { pt: ["Português"], en: ["Portuguese"], es: ["Portugués"] },
  },

  // ── EUROPA ──
  al: {
    flag: "🇦🇱",
    name: { pt: "Albânia", en: "Albania", es: "Albania" },
    capital: { pt: "Tirana", en: "Tirana", es: "Tirana" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Albanês"], en: ["Albanian"], es: ["Albanés"] },
  },
  de: {
    flag: "🇩🇪",
    name: { pt: "Alemanha", en: "Germany", es: "Alemania" },
    capital: { pt: "Berlim", en: "Berlin", es: "Berlín" },
    politicalRegime: {
      pt: "República federal parlamentar",
      en: "Federal parliamentary republic",
      es: "República federal parlamentaria",
    },
    languages: { pt: ["Alemão"], en: ["German"], es: ["Alemán"] },
  },
  ad: {
    flag: "🇦🇩",
    name: { pt: "Andorra", en: "Andorra", es: "Andorra" },
    capital: { pt: "Andorra-a-Velha", en: "Andorra la Vella", es: "Andorra la Vieja" },
    politicalRegime: {
      pt: "Coprincipado parlamentar",
      en: "Parliamentary co-principality",
      es: "Coprincipado parlamentario",
    },
    languages: { pt: ["Catalão"], en: ["Catalan"], es: ["Catalán"] },
  },
  at: {
    flag: "🇦🇹",
    name: { pt: "Áustria", en: "Austria", es: "Austria" },
    capital: { pt: "Viena", en: "Vienna", es: "Viena" },
    politicalRegime: {
      pt: "República federal parlamentar",
      en: "Federal parliamentary republic",
      es: "República federal parlamentaria",
    },
    languages: { pt: ["Alemão"], en: ["German"], es: ["Alemán"] },
  },
  by: {
    flag: "🇧🇾",
    name: { pt: "Belarus", en: "Belarus", es: "Bielorrusia" },
    capital: { pt: "Minsk", en: "Minsk", es: "Minsk" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Bielorrusso", "Russo"],
      en: ["Belarusian", "Russian"],
      es: ["Bielorruso", "Ruso"],
    },
  },
  be: {
    flag: "🇧🇪",
    name: { pt: "Bélgica", en: "Belgium", es: "Bélgica" },
    capital: { pt: "Bruxelas", en: "Brussels", es: "Bruselas" },
    politicalRegime: {
      pt: "Monarquia constitucional federal parlamentar",
      en: "Federal parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria federal",
    },
    languages: {
      pt: ["Holandês", "Francês", "Alemão"],
      en: ["Dutch", "French", "German"],
      es: ["Neerlandés", "Francés", "Alemán"],
    },
  },
  ba: {
    flag: "🇧🇦",
    name: { pt: "Bósnia e Herzegovina", en: "Bosnia and Herzegovina", es: "Bosnia y Herzegovina" },
    capital: { pt: "Sarajevo", en: "Sarajevo", es: "Sarajevo" },
    politicalRegime: {
      pt: "República parlamentar federal",
      en: "Federal parliamentary republic",
      es: "República parlamentaria federal",
    },
    languages: {
      pt: ["Bósnio", "Sérvio", "Croata"],
      en: ["Bosnian", "Serbian", "Croatian"],
      es: ["Bosnio", "Serbio", "Croata"],
    },
  },
  bg: {
    flag: "🇧🇬",
    name: { pt: "Bulgária", en: "Bulgaria", es: "Bulgaria" },
    capital: { pt: "Sófia", en: "Sofia", es: "Sofía" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Búlgaro"], en: ["Bulgarian"], es: ["Búlgaro"] },
  },
  cy: {
    flag: "🇨🇾",
    name: { pt: "Chipre", en: "Cyprus", es: "Chipre" },
    capital: { pt: "Nicósia", en: "Nicosia", es: "Nicosia" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Grego", "Turco"],
      en: ["Greek", "Turkish"],
      es: ["Griego", "Turco"],
    },
  },
  hr: {
    flag: "🇭🇷",
    name: { pt: "Croácia", en: "Croatia", es: "Croacia" },
    capital: { pt: "Zagreb", en: "Zagreb", es: "Zagreb" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Croata"], en: ["Croatian"], es: ["Croata"] },
  },
  dk: {
    flag: "🇩🇰",
    name: { pt: "Dinamarca", en: "Denmark", es: "Dinamarca" },
    capital: { pt: "Copenhague", en: "Copenhagen", es: "Copenhague" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: { pt: ["Dinamarquês"], en: ["Danish"], es: ["Danés"] },
  },
  sk: {
    flag: "🇸🇰",
    name: { pt: "Eslováquia", en: "Slovakia", es: "Eslovaquia" },
    capital: { pt: "Bratislava", en: "Bratislava", es: "Bratislava" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Eslovaco"], en: ["Slovak"], es: ["Eslovaco"] },
  },
  si: {
    flag: "🇸🇮",
    name: { pt: "Eslovênia", en: "Slovenia", es: "Eslovenia" },
    capital: { pt: "Liubliana", en: "Ljubljana", es: "Liubliana" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Esloveno"], en: ["Slovenian"], es: ["Esloveno"] },
  },
  es: {
    flag: "🇪🇸",
    name: { pt: "Espanha", en: "Spain", es: "España" },
    capital: { pt: "Madri", en: "Madrid", es: "Madrid" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: { pt: ["Espanhol"], en: ["Spanish"], es: ["Español"] },
  },
  ee: {
    flag: "🇪🇪",
    name: { pt: "Estônia", en: "Estonia", es: "Estonia" },
    capital: { pt: "Tallinn", en: "Tallinn", es: "Tallin" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Estoniano"], en: ["Estonian"], es: ["Estonio"] },
  },
  fi: {
    flag: "🇫🇮",
    name: { pt: "Finlândia", en: "Finland", es: "Finlandia" },
    capital: { pt: "Helsinque", en: "Helsinki", es: "Helsinki" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: {
      pt: ["Finlandês", "Sueco"],
      en: ["Finnish", "Swedish"],
      es: ["Finlandés", "Sueco"],
    },
  },
  fr: {
    flag: "🇫🇷",
    name: { pt: "França", en: "France", es: "Francia" },
    capital: { pt: "Paris", en: "Paris", es: "París" },
    politicalRegime: {
      pt: "República semipresidencialista",
      en: "Semi-presidential republic",
      es: "República semipresidencialista",
    },
    languages: { pt: ["Francês"], en: ["French"], es: ["Francés"] },
  },
  gr: {
    flag: "🇬🇷",
    name: { pt: "Grécia", en: "Greece", es: "Grecia" },
    capital: { pt: "Atenas", en: "Athens", es: "Atenas" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Grego"], en: ["Greek"], es: ["Griego"] },
  },
  nl: {
    flag: "🇳🇱",
    name: { pt: "Países Baixos", en: "Netherlands", es: "Países Bajos" },
    capital: { pt: "Amsterdã", en: "Amsterdam", es: "Ámsterdam" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: { pt: ["Holandês"], en: ["Dutch"], es: ["Neerlandés"] },
  },
  hu: {
    flag: "🇭🇺",
    name: { pt: "Hungria", en: "Hungary", es: "Hungría" },
    capital: { pt: "Budapeste", en: "Budapest", es: "Budapest" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Húngaro"], en: ["Hungarian"], es: ["Húngaro"] },
  },
  ie: {
    flag: "🇮🇪",
    name: { pt: "Irlanda", en: "Ireland", es: "Irlanda" },
    capital: { pt: "Dublin", en: "Dublin", es: "Dublín" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: {
      pt: ["Inglês", "Irlandês"],
      en: ["English", "Irish"],
      es: ["Inglés", "Irlandés"],
    },
  },
  is: {
    flag: "🇮🇸",
    name: { pt: "Islândia", en: "Iceland", es: "Islandia" },
    capital: { pt: "Reykjavik", en: "Reykjavik", es: "Reikiavik" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Islandês"], en: ["Icelandic"], es: ["Islandés"] },
  },
  it: {
    flag: "🇮🇹",
    name: { pt: "Itália", en: "Italy", es: "Italia" },
    capital: { pt: "Roma", en: "Rome", es: "Roma" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Italiano"], en: ["Italian"], es: ["Italiano"] },
  },
  lv: {
    flag: "🇱🇻",
    name: { pt: "Letônia", en: "Latvia", es: "Letonia" },
    capital: { pt: "Riga", en: "Riga", es: "Riga" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Letão"], en: ["Latvian"], es: ["Letón"] },
  },
  li: {
    flag: "🇱🇮",
    name: { pt: "Liechtenstein", en: "Liechtenstein", es: "Liechtenstein" },
    capital: { pt: "Vaduz", en: "Vaduz", es: "Vaduz" },
    politicalRegime: {
      pt: "Monarquia constitucional",
      en: "Constitutional monarchy",
      es: "Monarquía constitucional",
    },
    languages: { pt: ["Alemão"], en: ["German"], es: ["Alemán"] },
  },
  lt: {
    flag: "🇱🇹",
    name: { pt: "Lituânia", en: "Lithuania", es: "Lituania" },
    capital: { pt: "Vilnius", en: "Vilnius", es: "Vilna" },
    politicalRegime: {
      pt: "República semipresidencialista",
      en: "Semi-presidential republic",
      es: "República semipresidencialista",
    },
    languages: { pt: ["Lituano"], en: ["Lithuanian"], es: ["Lituano"] },
  },
  lu: {
    flag: "🇱🇺",
    name: { pt: "Luxemburgo", en: "Luxembourg", es: "Luxemburgo" },
    capital: { pt: "Luxemburgo", en: "Luxembourg City", es: "Luxemburgo" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: {
      pt: ["Luxemburguês", "Francês", "Alemão"],
      en: ["Luxembourgish", "French", "German"],
      es: ["Luxemburgués", "Francés", "Alemán"],
    },
  },
  mk: {
    flag: "🇲🇰",
    name: { pt: "Macedônia do Norte", en: "North Macedonia", es: "Macedonia del Norte" },
    capital: { pt: "Skopje", en: "Skopje", es: "Skopie" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Macedônio"], en: ["Macedonian"], es: ["Macedonio"] },
  },
  mt: {
    flag: "🇲🇹",
    name: { pt: "Malta", en: "Malta", es: "Malta" },
    capital: { pt: "Valletta", en: "Valletta", es: "La Valeta" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: {
      pt: ["Maltês", "Inglês"],
      en: ["Maltese", "English"],
      es: ["Maltés", "Inglés"],
    },
  },
  md: {
    flag: "🇲🇩",
    name: { pt: "Moldávia", en: "Moldova", es: "Moldavia" },
    capital: { pt: "Chișinău", en: "Chișinău", es: "Chisinau" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Romeno"], en: ["Romanian"], es: ["Rumano"] },
  },
  mc: {
    flag: "🇲🇨",
    name: { pt: "Mônaco", en: "Monaco", es: "Mónaco" },
    capital: { pt: "Mônaco", en: "Monaco", es: "Mónaco" },
    politicalRegime: {
      pt: "Monarquia constitucional",
      en: "Constitutional monarchy",
      es: "Monarquía constitucional",
    },
    languages: { pt: ["Francês"], en: ["French"], es: ["Francés"] },
  },
  me: {
    flag: "🇲🇪",
    name: { pt: "Montenegro", en: "Montenegro", es: "Montenegro" },
    capital: { pt: "Podgorica", en: "Podgorica", es: "Podgorica" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Montenegrino"], en: ["Montenegrin"], es: ["Montenegrino"] },
  },
  no: {
    flag: "🇳🇴",
    name: { pt: "Noruega", en: "Norway", es: "Noruega" },
    capital: { pt: "Oslo", en: "Oslo", es: "Oslo" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: { pt: ["Norueguês"], en: ["Norwegian"], es: ["Noruego"] },
  },
  pl: {
    flag: "🇵🇱",
    name: { pt: "Polônia", en: "Poland", es: "Polonia" },
    capital: { pt: "Varsóvia", en: "Warsaw", es: "Varsovia" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Polonês"], en: ["Polish"], es: ["Polaco"] },
  },
  pt: {
    flag: "🇵🇹",
    name: { pt: "Portugal", en: "Portugal", es: "Portugal" },
    capital: { pt: "Lisboa", en: "Lisbon", es: "Lisboa" },
    politicalRegime: {
      pt: "República semipresidencialista",
      en: "Semi-presidential republic",
      es: "República semipresidencialista",
    },
    languages: { pt: ["Português"], en: ["Portuguese"], es: ["Portugués"] },
  },
  gb: {
    flag: "🇬🇧",
    name: { pt: "Reino Unido", en: "United Kingdom", es: "Reino Unido" },
    capital: { pt: "Londres", en: "London", es: "Londres" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  cz: {
    flag: "🇨🇿",
    name: { pt: "Tchéquia", en: "Czechia", es: "Chequia" },
    capital: { pt: "Praga", en: "Prague", es: "Praga" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Tcheco"], en: ["Czech"], es: ["Checo"] },
  },
  ro: {
    flag: "🇷🇴",
    name: { pt: "Romênia", en: "Romania", es: "Rumanía" },
    capital: { pt: "Bucareste", en: "Bucharest", es: "Bucarest" },
    politicalRegime: {
      pt: "República semipresidencialista",
      en: "Semi-presidential republic",
      es: "República semipresidencialista",
    },
    languages: { pt: ["Romeno"], en: ["Romanian"], es: ["Rumano"] },
  },
  sm: {
    flag: "🇸🇲",
    name: { pt: "San Marino", en: "San Marino", es: "San Marino" },
    capital: { pt: "San Marino", en: "San Marino", es: "San Marino" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Italiano"], en: ["Italian"], es: ["Italiano"] },
  },
  rs: {
    flag: "🇷🇸",
    name: { pt: "Sérvia", en: "Serbia", es: "Serbia" },
    capital: { pt: "Belgrado", en: "Belgrade", es: "Belgrado" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: { pt: ["Sérvio"], en: ["Serbian"], es: ["Serbio"] },
  },
  se: {
    flag: "🇸🇪",
    name: { pt: "Suécia", en: "Sweden", es: "Suecia" },
    capital: { pt: "Estocolmo", en: "Stockholm", es: "Estocolmo" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: { pt: ["Sueco"], en: ["Swedish"], es: ["Sueco"] },
  },
  ch: {
    flag: "🇨🇭",
    name: { pt: "Suíça", en: "Switzerland", es: "Suiza" },
    capital: { pt: "Berna", en: "Bern", es: "Berna" },
    politicalRegime: {
      pt: "República federal diretorial",
      en: "Federal directorial republic",
      es: "República federal directorial",
    },
    languages: {
      pt: ["Alemão", "Francês", "Italiano", "Romanche"],
      en: ["German", "French", "Italian", "Romansh"],
      es: ["Alemán", "Francés", "Italiano", "Romanche"],
    },
  },
  ua: {
    flag: "🇺🇦",
    name: { pt: "Ucrânia", en: "Ukraine", es: "Ucrania" },
    capital: { pt: "Kiev", en: "Kyiv", es: "Kiev" },
    politicalRegime: {
      pt: "República semipresidencialista",
      en: "Semi-presidential republic",
      es: "República semipresidencialista",
    },
    languages: { pt: ["Ucraniano"], en: ["Ukrainian"], es: ["Ucraniano"] },
  },
  va: {
    flag: "🇻🇦",
    name: { pt: "Vaticano", en: "Vatican City", es: "Ciudad del Vaticano" },
    capital: { pt: "Cidade do Vaticano", en: "Vatican City", es: "Ciudad del Vaticano" },
    politicalRegime: {
      pt: "Teocracia eletiva",
      en: "Elective theocracy",
      es: "Teocracia electiva",
    },
    languages: {
      pt: ["Italiano", "Latim"],
      en: ["Italian", "Latin"],
      es: ["Italiano", "Latín"],
    },
  },

  // ── OCEANIA ──
  au: {
    flag: "🇦🇺",
    name: { pt: "Austrália", en: "Australia", es: "Australia" },
    capital: { pt: "Canberra", en: "Canberra", es: "Canberra" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar federal",
      en: "Federal parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria federal",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  fj: {
    flag: "🇫🇯",
    name: { pt: "Fiji", en: "Fiji", es: "Fiyi" },
    capital: { pt: "Suva", en: "Suva", es: "Suva" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: {
      pt: ["Inglês", "Fijiano", "Hindi fijiano"],
      en: ["English", "Fijian", "Fiji Hindi"],
      es: ["Inglés", "Fiyiano", "Hindi fiyiano"],
    },
  },
  ki: {
    flag: "🇰🇮",
    name: { pt: "Kiribati", en: "Kiribati", es: "Kiribati" },
    capital: { pt: "Tarawa Sul", en: "South Tarawa", es: "Tarawa del Sur" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Inglês", "Gilbertês"],
      en: ["English", "Gilbertese"],
      es: ["Inglés", "Gilbertés"],
    },
  },
  mh: {
    flag: "🇲🇭",
    name: { pt: "Ilhas Marshall", en: "Marshall Islands", es: "Islas Marshall" },
    capital: { pt: "Majuro", en: "Majuro", es: "Majuro" },
    politicalRegime: {
      pt: "República presidencialista",
      en: "Presidential republic",
      es: "República presidencialista",
    },
    languages: {
      pt: ["Marshalês", "Inglês"],
      en: ["Marshallese", "English"],
      es: ["Marshalés", "Inglés"],
    },
  },
  sb: {
    flag: "🇸🇧",
    name: { pt: "Ilhas Salomão", en: "Solomon Islands", es: "Islas Salomón" },
    capital: { pt: "Honiara", en: "Honiara", es: "Honiara" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  fm: {
    flag: "🇫🇲",
    name: { pt: "Micronésia", en: "Micronesia", es: "Micronesia" },
    capital: { pt: "Palikir", en: "Palikir", es: "Palikir" },
    politicalRegime: {
      pt: "República federal presidencialista",
      en: "Federal presidential republic",
      es: "República federal presidencialista",
    },
    languages: { pt: ["Inglês"], en: ["English"], es: ["Inglés"] },
  },
  nr: {
    flag: "🇳🇷",
    name: { pt: "Nauru", en: "Nauru", es: "Nauru" },
    capital: { pt: "Yaren", en: "Yaren", es: "Yaren" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: {
      pt: ["Nauruano", "Inglês"],
      en: ["Nauruan", "English"],
      es: ["Nauruano", "Inglés"],
    },
  },
  nz: {
    flag: "🇳🇿",
    name: { pt: "Nova Zelândia", en: "New Zealand", es: "Nueva Zelanda" },
    capital: { pt: "Wellington", en: "Wellington", es: "Wellington" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: {
      pt: ["Inglês", "Maori"],
      en: ["English", "Māori"],
      es: ["Inglés", "Maorí"],
    },
  },
  pg: {
    flag: "🇵🇬",
    name: { pt: "Papua Nova Guiné", en: "Papua New Guinea", es: "Papúa Nueva Guinea" },
    capital: { pt: "Port Moresby", en: "Port Moresby", es: "Port Moresby" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: {
      pt: ["Inglês", "Tok Pisin", "Hiri Motu"],
      en: ["English", "Tok Pisin", "Hiri Motu"],
      es: ["Inglés", "Tok Pisin", "Hiri Motu"],
    },
  },
  ws: {
    flag: "🇼🇸",
    name: { pt: "Samoa", en: "Samoa", es: "Samoa" },
    capital: { pt: "Apia", en: "Apia", es: "Apia" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: {
      pt: ["Samoano", "Inglês"],
      en: ["Samoan", "English"],
      es: ["Samoano", "Inglés"],
    },
  },
  to: {
    flag: "🇹🇴",
    name: { pt: "Tonga", en: "Tonga", es: "Tonga" },
    capital: { pt: "Nukualofa", en: "Nukuʻalofa", es: "Nukualofa" },
    politicalRegime: {
      pt: "Monarquia constitucional",
      en: "Constitutional monarchy",
      es: "Monarquía constitucional",
    },
    languages: {
      pt: ["Tonganês", "Inglês"],
      en: ["Tongan", "English"],
      es: ["Tongano", "Inglés"],
    },
  },
  tv: {
    flag: "🇹🇻",
    name: { pt: "Tuvalu", en: "Tuvalu", es: "Tuvalu" },
    capital: { pt: "Funafuti", en: "Funafuti", es: "Funafuti" },
    politicalRegime: {
      pt: "Monarquia constitucional parlamentar",
      en: "Parliamentary constitutional monarchy",
      es: "Monarquía constitucional parlamentaria",
    },
    languages: {
      pt: ["Tuvaluano", "Inglês"],
      en: ["Tuvaluan", "English"],
      es: ["Tuvaluano", "Inglés"],
    },
  },
  vu: {
    flag: "🇻🇺",
    name: { pt: "Vanuatu", en: "Vanuatu", es: "Vanuatu" },
    capital: { pt: "Port Vila", en: "Port Vila", es: "Port Vila" },
    politicalRegime: {
      pt: "República parlamentar",
      en: "Parliamentary republic",
      es: "República parlamentaria",
    },
    languages: {
      pt: ["Bislama", "Inglês", "Francês"],
      en: ["Bislama", "English", "French"],
      es: ["Bislama", "Inglés", "Francés"],
    },
  },
};

export function getWorldClockPageCopy(language: SupportedLanguage) {
  return PAGE_COPY[language] ?? PAGE_COPY.pt;
}

export function getLocalizedCountryMeta(
  countryId: string,
  language: SupportedLanguage
) {
  const meta = COUNTRY_META[countryId];
  if (!meta) {
    return {
      flag: "🌐",
      name: countryId,
      capital: "—",
      politicalRegime: "—",
      languages: [] as string[],
    };
  }
  return {
    flag: meta.flag,
    name: meta.name[language] ?? meta.name.pt,
    capital: meta.capital[language] ?? meta.capital.pt,
    politicalRegime: meta.politicalRegime[language] ?? meta.politicalRegime.pt,
    languages: meta.languages[language] ?? meta.languages.pt,
  };
}

export function getLocalizedMarketStatusLabel(
  language: SupportedLanguage,
  status: "open" | "closed" | "pre" | "post" | "break"
) {
  const copy = getWorldClockPageCopy(language);
  return copy.statuses[status] ?? copy.statuses.closed;
}
