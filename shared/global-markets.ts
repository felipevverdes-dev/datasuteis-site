export type GlobalMarketId =
  | "nyse"
  | "nasdaq"
  | "b3"
  | "lse"
  | "euronext-paris"
  | "xetra"
  | "six"
  | "jpx"
  | "hkex"
  | "sse"
  | "szse"
  | "nse"
  | "tsx"
  | "asx"
  | "sgx";

export interface MarketSessionWindow {
  start: string;
  end: string;
  label?: string;
}

export interface GlobalMarketDefinition {
  id: GlobalMarketId;
  name: string;
  city: string;
  countryCode: string;
  countryName: string;
  timezone: string;
  openWeekdays: number[];
  regularSessions: MarketSessionWindow[];
  preSession?: MarketSessionWindow;
  postSession?: MarketSessionWindow;
  breakSessions?: MarketSessionWindow[];
  officialHoursLabel: string;
  notes?: string;
  index: {
    name: string;
    symbol: string;
    currency: string;
    displaySymbol: string;
  };
}

export const GLOBAL_MARKETS: GlobalMarketDefinition[] = [
  {
    id: "nyse",
    name: "NYSE",
    city: "Nova York",
    countryCode: "US",
    countryName: "Estados Unidos",
    timezone: "America/New_York",
    openWeekdays: [1, 2, 3, 4, 5],
    regularSessions: [{ start: "09:30", end: "16:00" }],
    preSession: { start: "04:00", end: "09:30", label: "Pré-mercado" },
    postSession: { start: "16:00", end: "20:00", label: "After-hours" },
    officialHoursLabel: "09:30-16:00",
    notes: "Inclui pré-mercado e after-hours na leitura de status.",
    index: {
      name: "NYSE Composite",
      symbol: "^NYA",
      currency: "USD",
      displaySymbol: "NYA",
    },
  },
  {
    id: "nasdaq",
    name: "Nasdaq",
    city: "Nova York",
    countryCode: "US",
    countryName: "Estados Unidos",
    timezone: "America/New_York",
    openWeekdays: [1, 2, 3, 4, 5],
    regularSessions: [{ start: "09:30", end: "16:00" }],
    preSession: { start: "04:00", end: "09:30", label: "Pré-mercado" },
    postSession: { start: "16:00", end: "20:00", label: "After-hours" },
    officialHoursLabel: "09:30-16:00",
    notes: "Inclui pré-mercado e after-hours na leitura de status.",
    index: {
      name: "Nasdaq Composite",
      symbol: "^IXIC",
      currency: "USD",
      displaySymbol: "IXIC",
    },
  },
  {
    id: "b3",
    name: "B3",
    city: "São Paulo",
    countryCode: "BR",
    countryName: "Brasil",
    timezone: "America/Sao_Paulo",
    openWeekdays: [1, 2, 3, 4, 5],
    regularSessions: [{ start: "10:00", end: "17:00" }],
    officialHoursLabel: "10:00-17:00",
    index: {
      name: "Ibovespa",
      symbol: "^BVSP",
      currency: "BRL",
      displaySymbol: "IBOV",
    },
  },
  {
    id: "lse",
    name: "LSE",
    city: "Londres",
    countryCode: "GB",
    countryName: "Reino Unido",
    timezone: "Europe/London",
    openWeekdays: [1, 2, 3, 4, 5],
    regularSessions: [{ start: "08:00", end: "16:30" }],
    officialHoursLabel: "08:00-16:30",
    index: {
      name: "FTSE 100",
      symbol: "^FTSE",
      currency: "GBP",
      displaySymbol: "FTSE",
    },
  },
  {
    id: "euronext-paris",
    name: "Euronext Paris",
    city: "Paris",
    countryCode: "FR",
    countryName: "França",
    timezone: "Europe/Paris",
    openWeekdays: [1, 2, 3, 4, 5],
    regularSessions: [{ start: "09:00", end: "17:30" }],
    officialHoursLabel: "09:00-17:30",
    index: {
      name: "CAC 40",
      symbol: "^FCHI",
      currency: "EUR",
      displaySymbol: "CAC 40",
    },
  },
  {
    id: "xetra",
    name: "Deutsche Börse Xetra",
    city: "Frankfurt",
    countryCode: "DE",
    countryName: "Alemanha",
    timezone: "Europe/Berlin",
    openWeekdays: [1, 2, 3, 4, 5],
    regularSessions: [{ start: "09:00", end: "17:30" }],
    officialHoursLabel: "09:00-17:30",
    index: {
      name: "DAX",
      symbol: "^GDAXI",
      currency: "EUR",
      displaySymbol: "DAX",
    },
  },
  {
    id: "six",
    name: "SIX Swiss Exchange",
    city: "Zurique",
    countryCode: "CH",
    countryName: "Suíça",
    timezone: "Europe/Zurich",
    openWeekdays: [1, 2, 3, 4, 5],
    regularSessions: [{ start: "09:00", end: "17:30" }],
    officialHoursLabel: "09:00-17:30",
    index: {
      name: "SMI",
      symbol: "^SSMI",
      currency: "CHF",
      displaySymbol: "SMI",
    },
  },
  {
    id: "jpx",
    name: "JPX / Tokyo Stock Exchange",
    city: "Tóquio",
    countryCode: "JP",
    countryName: "Japão",
    timezone: "Asia/Tokyo",
    openWeekdays: [1, 2, 3, 4, 5],
    regularSessions: [
      { start: "09:00", end: "11:30", label: "Sessão da manhã" },
      { start: "12:30", end: "15:30", label: "Sessão da tarde" },
    ],
    breakSessions: [{ start: "11:30", end: "12:30", label: "Intervalo" }],
    officialHoursLabel: "09:00-11:30 / 12:30-15:30",
    notes: "Sessão interrompida no meio do dia.",
    index: {
      name: "Nikkei 225",
      symbol: "^N225",
      currency: "JPY",
      displaySymbol: "N225",
    },
  },
  {
    id: "hkex",
    name: "HKEX",
    city: "Hong Kong",
    countryCode: "HK",
    countryName: "Hong Kong",
    timezone: "Asia/Hong_Kong",
    openWeekdays: [1, 2, 3, 4, 5],
    regularSessions: [
      { start: "09:30", end: "12:00", label: "Sessão da manhã" },
      { start: "13:00", end: "16:00", label: "Sessão da tarde" },
    ],
    breakSessions: [{ start: "12:00", end: "13:00", label: "Intervalo" }],
    officialHoursLabel: "09:30-12:00 / 13:00-16:00",
    notes: "Sessão interrompida no meio do dia.",
    index: {
      name: "Hang Seng",
      symbol: "^HSI",
      currency: "HKD",
      displaySymbol: "HSI",
    },
  },
  {
    id: "sse",
    name: "Shanghai Stock Exchange",
    city: "Xangai",
    countryCode: "CN",
    countryName: "China",
    timezone: "Asia/Shanghai",
    openWeekdays: [1, 2, 3, 4, 5],
    regularSessions: [
      { start: "09:30", end: "11:30", label: "Sessão da manhã" },
      { start: "13:00", end: "15:00", label: "Sessão da tarde" },
    ],
    breakSessions: [{ start: "11:30", end: "13:00", label: "Intervalo" }],
    officialHoursLabel: "09:30-11:30 / 13:00-15:00",
    notes: "Sessão interrompida no almoço.",
    index: {
      name: "Shanghai Composite",
      symbol: "000001.SS",
      currency: "CNY",
      displaySymbol: "SSE Composite",
    },
  },
  {
    id: "szse",
    name: "Shenzhen Stock Exchange",
    city: "Shenzhen",
    countryCode: "CN",
    countryName: "China",
    timezone: "Asia/Shanghai",
    openWeekdays: [1, 2, 3, 4, 5],
    regularSessions: [
      { start: "09:30", end: "11:30", label: "Sessão da manhã" },
      { start: "13:00", end: "15:00", label: "Sessão da tarde" },
    ],
    breakSessions: [{ start: "11:30", end: "13:00", label: "Intervalo" }],
    officialHoursLabel: "09:30-11:30 / 13:00-15:00",
    notes: "Sessão interrompida no almoço.",
    index: {
      name: "SZSE Component",
      symbol: "399001.SZ",
      currency: "CNY",
      displaySymbol: "SZSE",
    },
  },
  {
    id: "nse",
    name: "NSE India",
    city: "Mumbai",
    countryCode: "IN",
    countryName: "Índia",
    timezone: "Asia/Kolkata",
    openWeekdays: [1, 2, 3, 4, 5],
    regularSessions: [{ start: "09:15", end: "15:30" }],
    officialHoursLabel: "09:15-15:30",
    index: {
      name: "NIFTY 50",
      symbol: "^NSEI",
      currency: "INR",
      displaySymbol: "NIFTY 50",
    },
  },
  {
    id: "tsx",
    name: "TSX",
    city: "Toronto",
    countryCode: "CA",
    countryName: "Canadá",
    timezone: "America/Toronto",
    openWeekdays: [1, 2, 3, 4, 5],
    regularSessions: [{ start: "09:30", end: "16:00" }],
    officialHoursLabel: "09:30-16:00",
    index: {
      name: "S&P/TSX Composite",
      symbol: "^GSPTSE",
      currency: "CAD",
      displaySymbol: "TSX",
    },
  },
  {
    id: "asx",
    name: "ASX",
    city: "Sydney",
    countryCode: "AU",
    countryName: "Austrália",
    timezone: "Australia/Sydney",
    openWeekdays: [1, 2, 3, 4, 5],
    regularSessions: [{ start: "10:00", end: "16:00" }],
    officialHoursLabel: "10:00-16:00",
    index: {
      name: "S&P/ASX 200",
      symbol: "^AXJO",
      currency: "AUD",
      displaySymbol: "ASX 200",
    },
  },
  {
    id: "sgx",
    name: "SGX",
    city: "Singapura",
    countryCode: "SG",
    countryName: "Singapura",
    timezone: "Asia/Singapore",
    openWeekdays: [1, 2, 3, 4, 5],
    regularSessions: [{ start: "09:00", end: "17:00" }],
    officialHoursLabel: "09:00-17:00",
    index: {
      name: "Straits Times Index",
      symbol: "^STI",
      currency: "SGD",
      displaySymbol: "STI",
    },
  },
];

export const GLOBAL_MARKETS_BY_ID = Object.fromEntries(
  GLOBAL_MARKETS.map(market => [market.id, market])
) as Record<GlobalMarketId, GlobalMarketDefinition>;
