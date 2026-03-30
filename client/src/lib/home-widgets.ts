import { getWeatherLabel } from "@/lib/weather-display";
import { DEFAULT_GEOLOCATION } from "@/lib/geolocation";
import type { SupportedLanguage } from "@/lib/site";

const SANITIZE_NEWS_TOPIC_PATTERN = /[^A-Za-zÀ-ÖØ-öø-ÿ0-9\s-]+/g;
const WIDGET_CACHE_PREFIX = "datasuteis_widget_cache_v2";
const WIDGET_CACHE_TTL = 1000 * 60 * 15;

export type CurrencyCode = "USD" | "BRL" | "EUR" | "GBP";

export interface MarketOverviewResponse {
  updatedAt: string;
  currencies: {
    base: "USD";
    rates: Record<CurrencyCode, number>;
  } | null;
  crypto: Array<{
    symbol: string;
    name: string;
    priceBRL: number | null;
    changePercent24h: number | null;
  }>;
  indices: Array<{
    symbol: string;
    label: string;
    currency: string;
    price: number;
    changePercent: number;
  }>;
}

export interface WeatherSnapshotResponse {
  locationLabel: string;
  isFallback: boolean;
  source: "browser" | "ip" | "timezone" | "unavailable";
  timezone: string;
  current: {
    temperature: number | null;
    windSpeed: number | null;
    code: number | null;
    label: string;
  };
  daily: Array<{
    date: string;
    max: number | null;
    min: number | null;
    code: number | null;
    label: string;
  }>;
}

export interface NewsSnapshotResponse {
  topic: string;
  updatedAt: string;
  items: Array<{
    title: string;
    summary: string;
    source: string;
    sourceUrl: string;
    link: string;
    publishedAt: string;
  }>;
}

export interface WidgetErrorDetails {
  url?: string;
  status?: number;
  contentType?: string;
  provider?: string;
  hasKey?: boolean;
  reason?: string;
}

export class WidgetApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: WidgetErrorDetails;

  constructor(
    message: string,
    options?: {
      status?: number;
      code?: string;
      details?: WidgetErrorDetails;
    }
  ) {
    super(message);
    this.name = "WidgetApiError";
    this.status = options?.status ?? 500;
    this.code = options?.code ?? "widget_api_error";
    this.details = options?.details;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getWidgetCacheKey(key: string) {
  return `${WIDGET_CACHE_PREFIX}:${key}`;
}

function readWidgetCache<T>(key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(getWidgetCacheKey(key));
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as { expiresAt?: number; value?: T };
    if (
      !parsed ||
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt < Date.now() ||
      typeof parsed.value === "undefined"
    ) {
      window.localStorage.removeItem(getWidgetCacheKey(key));
      return null;
    }

    return parsed.value;
  } catch {
    return null;
  }
}

function writeWidgetCache<T>(key: string, value: T, ttl = WIDGET_CACHE_TTL) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      getWidgetCacheKey(key),
      JSON.stringify({
        expiresAt: Date.now() + ttl,
        value,
      })
    );
  } catch {
    // Ignore storage failures and keep runtime behavior intact.
  }
}

export async function fetchWidgetJson<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });
  } catch {
    throw new WidgetApiError("Não foi possível chamar a API do widget.", {
      code: "widget_api_network_error",
      details: {
        url,
        reason: "network_error",
      },
    });
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new WidgetApiError("A resposta da API não voltou em JSON.", {
      status: response.status,
      code: "invalid_content_type",
      details: {
        url,
        status: response.status,
        contentType,
      },
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new WidgetApiError(
      "Não foi possível interpretar a resposta da API.",
      {
        status: response.status,
        code: "invalid_json",
        details: {
          url,
          status: response.status,
          contentType,
        },
      }
    );
  }

  if (!response.ok) {
    const message =
      isRecord(payload) && typeof payload.message === "string"
        ? payload.message
        : "A API retornou erro.";
    const code =
      isRecord(payload) && typeof payload.error === "string"
        ? payload.error
        : "api_error";
    throw new WidgetApiError(message, {
      status: response.status,
      code,
      details: {
        url,
        status: response.status,
        contentType,
      },
    });
  }

  if (!isRecord(payload)) {
    throw new WidgetApiError("A API retornou um formato inesperado.", {
      status: response.status,
      code: "invalid_shape",
      details: {
        url,
        status: response.status,
        contentType,
      },
    });
  }

  return payload as T;
}

async function fetchJson<T>(url: string) {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });
  } catch {
    throw new WidgetApiError("Não foi possível carregar os widgets.", {
      code: "widget_fetch_failed",
      details: {
        url,
        reason: "network_error",
      },
    });
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok) {
    throw new WidgetApiError("Não foi possível carregar os widgets.", {
      status: response.status,
      code: "widget_fetch_failed",
      details: {
        url,
        status: response.status,
        contentType,
      },
    });
  }

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new WidgetApiError("A resposta do widget não voltou em JSON.", {
      status: response.status,
      code: "widget_invalid_content_type",
      details: {
        url,
        status: response.status,
        contentType,
      },
    });
  }

  return (await response.json()) as T;
}

function getTimezoneCityLabel(timezone: string) {
  const city = timezone.split("/").pop() ?? timezone;
  return city.replace(/_/g, " ").trim() || "Local aproximado";
}

function getLanguageCode(language: SupportedLanguage) {
  if (language === "en") {
    return "en";
  }

  if (language === "es") {
    return "es";
  }

  return "pt";
}

function buildWeatherCacheKey(
  language: SupportedLanguage,
  timezone: string,
  coordinates?: { lat: number; lon: number }
) {
  const locationKey = coordinates
    ? `${coordinates.lat.toFixed(2)}:${coordinates.lon.toFixed(2)}`
    : timezone;
  return `weather:${language}:${locationKey}`;
}

type OpenMeteoForecastResponse = {
  current?: {
    temperature_2m?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    weather_code?: number[];
  };
  timezone?: string;
};

type OpenMeteoGeocodingResponse = {
  results?: Array<{
    name?: string;
    admin1?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  }>;
};

type IpWhoIsResponse = {
  success?: boolean;
  city?: string;
  region?: string;
  region_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
};

const BRAZIL_STATE_ABBREVIATIONS: Record<string, string> = {
  acre: "AC",
  alagoas: "AL",
  amapa: "AP",
  amazonas: "AM",
  bahia: "BA",
  ceara: "CE",
  "distrito federal": "DF",
  "espirito santo": "ES",
  goias: "GO",
  maranhao: "MA",
  "mato grosso": "MT",
  "mato grosso do sul": "MS",
  "minas gerais": "MG",
  para: "PA",
  paraiba: "PB",
  parana: "PR",
  pernambuco: "PE",
  piaui: "PI",
  "rio de janeiro": "RJ",
  "rio grande do norte": "RN",
  "rio grande do sul": "RS",
  rondonia: "RO",
  roraima: "RR",
  "santa catarina": "SC",
  "sao paulo": "SP",
  sergipe: "SE",
  tocantins: "TO",
};

function normalizeRegionalLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^(state of|estado do|estado da|estado de)\s+/i, "")
    .trim()
    .toLowerCase();
}

function abbreviateRegionLabel(value: string) {
  if (/^[A-Z]{2}$/.test(value.trim())) {
    return value.trim().toUpperCase();
  }

  return BRAZIL_STATE_ABBREVIATIONS[normalizeRegionalLabel(value)] ?? value;
}

function buildLocationLabel(parts: Array<string | undefined>) {
  const normalizedParts = parts
    .map(part => part?.trim())
    .filter(Boolean) as string[];

  if (!normalizedParts.length) {
    return "";
  }

  if (normalizedParts.length === 1) {
    return normalizedParts[0];
  }

  return `${normalizedParts[0]}, ${abbreviateRegionLabel(normalizedParts[1])}`;
}

async function geocodeByTimezone(
  timezone: string,
  language: SupportedLanguage
) {
  const cityName = getTimezoneCityLabel(timezone);
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", cityName);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", getLanguageCode(language));
  url.searchParams.set("format", "json");

  const payload = await fetchJson<OpenMeteoGeocodingResponse>(url.toString());
  const result = payload.results?.[0];
  if (
    !result ||
    typeof result.latitude !== "number" ||
    typeof result.longitude !== "number"
  ) {
    throw new WidgetApiError(
      "Não foi possível localizar a cidade pela timezone.",
      {
        code: "timezone_geocoding_failed",
      }
    );
  }

  return {
    latitude: result.latitude,
    longitude: result.longitude,
    label: buildLocationLabel([result.name, result.admin1 ?? result.country]),
  };
}

async function resolveIpLocationDirect(language: SupportedLanguage) {
  const payload = await fetchJson<IpWhoIsResponse>("https://ipwho.is/");
  if (
    !payload.success ||
    typeof payload.latitude !== "number" ||
    typeof payload.longitude !== "number"
  ) {
    throw new WidgetApiError("Não foi possível localizar a região por IP.", {
      code: "ip_geolocation_failed",
      details: {
        url: "https://ipwho.is/",
        provider: "ipwho.is",
        reason: "invalid_ip_payload",
      },
    });
  }

  const locationLabel = buildLocationLabel([
    payload.city,
    payload.region_code || payload.region || payload.country,
  ]);

  return {
    latitude: payload.latitude,
    longitude: payload.longitude,
    label:
      locationLabel ||
      (language === "en"
        ? "Approximate location"
        : language === "es"
          ? "Ubicación aproximada"
          : "Local aproximado"),
  };
}

async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number,
  language: SupportedLanguage
) {
  try {
    const url = new URL(
      "https://api.bigdatacloud.net/data/reverse-geocode-client"
    );
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("localityLanguage", getLanguageCode(language));
    const payload = await fetchJson<{
      locality?: string;
      city?: string;
      principalSubdivision?: string;
      countryName?: string;
    }>(url.toString());
    const cityLabel = payload.locality || payload.city;
    if (!cityLabel) {
      return null;
    }

    return buildLocationLabel([
      cityLabel,
      payload.principalSubdivision ?? payload.countryName,
    ]);
  } catch {
    return null;
  }
}

async function fetchForecast(
  latitude: number,
  longitude: number,
  timezone: string
) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", "temperature_2m,wind_speed_10m,weather_code");
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min"
  );
  url.searchParams.set("forecast_days", "5");
  url.searchParams.set("timezone", timezone || "auto");

  return fetchJson<OpenMeteoForecastResponse>(url.toString());
}

function buildWeatherSnapshotResponse(
  payload: OpenMeteoForecastResponse,
  language: SupportedLanguage,
  options: {
    locationLabel: string;
    source: WeatherSnapshotResponse["source"];
    timezone: string;
    isFallback: boolean;
  }
): WeatherSnapshotResponse {
  const currentCode = payload.current?.weather_code ?? null;
  const dailyDates = payload.daily?.time ?? [];
  const dailyCodes = payload.daily?.weather_code ?? [];
  const dailyMax = payload.daily?.temperature_2m_max ?? [];
  const dailyMin = payload.daily?.temperature_2m_min ?? [];

  return {
    locationLabel: options.locationLabel,
    isFallback: options.isFallback,
    source: options.source,
    timezone: payload.timezone ?? options.timezone,
    current: {
      temperature: payload.current?.temperature_2m ?? null,
      windSpeed: payload.current?.wind_speed_10m ?? null,
      code: currentCode,
      label: getWeatherLabel(currentCode, language),
    },
    daily: dailyDates.map((date, index) => {
      const code = dailyCodes[index] ?? null;
      return {
        date,
        max: dailyMax[index] ?? null,
        min: dailyMin[index] ?? null,
        code,
        label: getWeatherLabel(code, language),
      };
    }),
  };
}

function buildUnavailableWeatherSnapshot(
  language: SupportedLanguage,
  timezone: string
): WeatherSnapshotResponse {
  return {
    locationLabel:
      language === "en"
        ? "Location unavailable"
        : language === "es"
          ? "Ubicación no disponible"
          : "Localização indisponível",
    isFallback: true,
    source: "unavailable",
    timezone,
    current: {
      temperature: null,
      windSpeed: null,
      code: null,
      label: getWeatherLabel(null, language),
    },
    daily: [],
  };
}

async function fetchWeatherDirect(
  language: SupportedLanguage,
  timezone: string,
  coordinates?: { lat: number; lon: number }
) {
  if (coordinates) {
    const reverseLabel = await reverseGeocodeCoordinates(
      coordinates.lat,
      coordinates.lon,
      language
    );
    const forecast = await fetchForecast(
      coordinates.lat,
      coordinates.lon,
      timezone
    );
    return buildWeatherSnapshotResponse(forecast, language, {
      locationLabel:
        reverseLabel ||
        (language === "en"
          ? "Detected location"
          : language === "es"
            ? "Ubicación detectada"
            : "Local detectado"),
      source: "browser",
      timezone,
      isFallback: false,
    });
  }

  const approximateLocation =
    (await resolveIpLocationDirect(language).catch(() => null)) ?? {
      latitude: DEFAULT_GEOLOCATION.lat,
      longitude: DEFAULT_GEOLOCATION.lon,
      label: buildLocationLabel([
        DEFAULT_GEOLOCATION.city,
        DEFAULT_GEOLOCATION.region,
      ]),
    };

  try {
    const forecast = await fetchForecast(
      approximateLocation.latitude,
      approximateLocation.longitude,
      timezone
    );
    return buildWeatherSnapshotResponse(forecast, language, {
      locationLabel: approximateLocation.label,
      source: "ip",
      timezone,
      isFallback: true,
    });
  } catch {
    return buildUnavailableWeatherSnapshot(language, timezone);
  }
}

async function fetchMarketOverviewFromFrankfurter() {
  const url = new URL("https://api.frankfurter.app/latest");
  url.searchParams.set("from", "USD");
  url.searchParams.set("to", "BRL,EUR,GBP");

  const payload = await fetchJson<{
    amount?: number;
    base?: string;
    date?: string;
    rates?: Record<string, number>;
  }>(url.toString());

  if (
    !payload.rates ||
    typeof payload.rates.BRL !== "number" ||
    typeof payload.rates.EUR !== "number" ||
    typeof payload.rates.GBP !== "number"
  ) {
    throw new WidgetApiError("A resposta do câmbio veio incompleta.", {
      code: "market_rates_incomplete",
      details: {
        url: url.toString(),
        provider: "frankfurter.app",
      },
    });
  }

  return {
    updatedAt: payload.date ?? new Date().toISOString(),
    currencies: {
      base: "USD" as const,
      rates: {
        USD: 1,
        BRL: payload.rates.BRL,
        EUR: payload.rates.EUR,
        GBP: payload.rates.GBP,
      },
    },
    crypto: [],
    indices: [],
  } satisfies MarketOverviewResponse;
}

async function fetchMarketOverviewFromOpenErApi() {
  const url = "https://open.er-api.com/v6/latest/USD";
  const payload = await fetchJson<{
    result?: string;
    time_last_update_utc?: string;
    rates?: Record<string, number>;
  }>(url);

  if (
    payload.result !== "success" ||
    !payload.rates ||
    typeof payload.rates.BRL !== "number" ||
    typeof payload.rates.EUR !== "number" ||
    typeof payload.rates.GBP !== "number"
  ) {
    throw new WidgetApiError(
      "A resposta alternativa do câmbio veio incompleta.",
      {
        code: "market_alt_rates_incomplete",
        details: {
          url,
          provider: "open.er-api.com",
        },
      }
    );
  }

  return {
    updatedAt: payload.time_last_update_utc ?? new Date().toISOString(),
    currencies: {
      base: "USD" as const,
      rates: {
        USD: 1,
        BRL: payload.rates.BRL,
        EUR: payload.rates.EUR,
        GBP: payload.rates.GBP,
      },
    },
    crypto: [],
    indices: [],
  } satisfies MarketOverviewResponse;
}

export async function fetchMarketOverviewSnapshot(
  _origin = window.location.origin
) {
  const cachedValue = readWidgetCache<MarketOverviewResponse>("market-overview");
  if (cachedValue) {
    return cachedValue;
  }

  try {
    const providers = [
      fetchMarketOverviewFromFrankfurter,
      fetchMarketOverviewFromOpenErApi,
    ] as const;

    for (const loadProvider of providers) {
      try {
        const response = await loadProvider();
        writeWidgetCache("market-overview", response);
        return response;
      } catch {
        // Try the next public provider.
      }
    }

    throw new WidgetApiError("Não foi possível carregar o câmbio.", {
      code: "market_overview_unavailable",
    });
  } catch (apiError) {
    throw apiError instanceof WidgetApiError
      ? apiError
      : new WidgetApiError("Não foi possível carregar o câmbio.", {
          code: "market_overview_unavailable",
        });
  }
}

export async function fetchWeatherSnapshot(
  language: SupportedLanguage,
  options?: {
    origin?: string;
    timezone?: string;
    coordinates?: { lat: number; lon: number };
  }
) {
  const timezone = options?.timezone ?? "UTC";
  const cacheKey = buildWeatherCacheKey(
    language,
    timezone,
    options?.coordinates
  );
  const cachedValue = readWidgetCache<WeatherSnapshotResponse>(cacheKey);
  if (cachedValue) {
    return cachedValue;
  }

  try {
    const response = await fetchWeatherDirect(
      language,
      timezone,
      options?.coordinates
    );
    if (response.current.temperature !== null) {
      writeWidgetCache(cacheKey, response);
    }
    return response;
  } catch (directError) {
    throw directError;
  }
}

export function formatCurrency(
  value: number,
  currency: string,
  maximumFractionDigits = 2
) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(value);
}

export function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits,
  }).format(value);
}

export function formatPercent(value: number) {
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: "always",
  });
  return formatter.format(value / 100);
}

export function formatTemperature(value: number | null) {
  if (value === null) {
    return "--";
  }
  return `${Math.round(value)}°C`;
}

export function getBrlPairRate(
  rates: Record<CurrencyCode, number>,
  from: Exclude<CurrencyCode, "BRL">
) {
  if (from === "USD") {
    return rates.BRL;
  }

  return rates.BRL / rates[from];
}

export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: Record<CurrencyCode, number>
) {
  if (!Number.isFinite(amount)) {
    return null;
  }

  const normalizedAmount = amount / rates[from];
  return normalizedAmount * rates[to];
}

export function sanitizeNewsTopic(value: string) {
  return value
    .normalize("NFKC")
    .replace(SANITIZE_NEWS_TOPIC_PATTERN, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48);
}
