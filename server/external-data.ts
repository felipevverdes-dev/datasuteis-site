import type { IncomingMessage, ServerResponse } from "node:http";
import type { Express } from "express";
import { GLOBAL_MARKETS } from "../shared/global-markets";

const REQUEST_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (compatible; DatasUteis/1.0; +https://datasuteis.com.br)",
};

const DEFAULT_TIMEZONE = "UTC";
const LOCALHOST_IPS = new Set(["127.0.0.1", "::1", "localhost"]);

const EXCHANGERATE_HOST_ACCESS_KEY =
  process.env.EXCHANGERATE_HOST_ACCESS_KEY ??
  process.env.EXCHANGERATE_HOST_KEY ??
  "";

const cache = new Map<string, { expiresAt: number; value: unknown }>();
const GLOBAL_MARKETS_LIVE_TTL_MS = 1000 * 60 * 5;
const GLOBAL_MARKETS_DEGRADED_TTL_MS = 1000 * 60;
const GLOBAL_MARKETS_CONCURRENCY = 4;

interface GlobalMarketSnapshotItem {
  marketId: string;
  symbol: string;
  currency: string | null;
  price: number | null;
  previousClose: number | null;
  changeAbsolute: number | null;
  changePercent: number | null;
  updatedAt: string | null;
  source: "yahoo" | "unavailable";
}

interface GlobalMarketsSnapshotPayload {
  ok: true;
  updatedAt: string;
  snapshotStatus: "live" | "stale" | "fallback";
  snapshotNotice: string | null;
  items: GlobalMarketSnapshotItem[];
}

let globalMarketsCache:
  | { expiresAt: number; value: GlobalMarketsSnapshotPayload }
  | null = null;
let globalMarketsLastGoodSnapshot: GlobalMarketsSnapshotPayload | null = null;
let globalMarketsInFlight: Promise<GlobalMarketsSnapshotPayload> | null = null;

const HTML_ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&apos;": "'",
  "&#39;": "'",
  "&gt;": ">",
  "&lt;": "<",
  "&middot;": "·",
  "&nbsp;": " ",
  "&quot;": '"',
};

const SANITIZE_TOPIC_PATTERN = /[^A-Za-zÀ-ÖØ-öø-ÿ0-9\s-]+/g;
const SANITIZE_LABEL_PATTERN = /[^A-Za-zÀ-ÖØ-öø-ÿ0-9\s,.-]+/g;

type WeatherSource = "browser" | "ip" | "timezone" | "unavailable";
type GeoLocationSource = "browser" | "ip" | "fallback";

interface ResolvedWeatherLocation {
  latitude: number | null;
  longitude: number | null;
  label: string;
  timezone: string;
  isFallback: boolean;
  source: WeatherSource;
}

interface GeoLocationResponse {
  city: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  source: GeoLocationSource;
  label: string;
}

type ApiRequest = IncomingMessage & {
  query?: Record<string, unknown>;
};

type ApiResponse = ServerResponse;

const DEFAULT_GEOLOCATION = {
  city: "Brasília",
  region: "Distrito Federal",
  country: "Brasil",
  lat: -15.7801,
  lon: -47.9292,
  source: "fallback",
  label: "Brasília, Distrito Federal",
} satisfies GeoLocationResponse;

function setApiCache(res: ApiResponse, maxAgeSeconds: number) {
  res.setHeader("Cache-Control", `public, max-age=${maxAgeSeconds}`);
}

function sendJson(res: ApiResponse, status: number, payload: unknown) {
  if (res.writableEnded) {
    return;
  }

  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function sendJsonError(
  res: ApiResponse,
  status: number,
  error: string,
  message: string,
  details?: Record<string, unknown>
) {
  sendJson(res, status, {
    ok: false,
    error,
    message,
    ...details,
  });
}

function getRequestUrl(req: ApiRequest) {
  return new URL(req.url ?? "/", "http://localhost");
}

function getQueryParam(req: ApiRequest, key: string) {
  const expressQueryValue = req.query?.[key];
  if (typeof expressQueryValue === "string") {
    return expressQueryValue;
  }

  if (Array.isArray(expressQueryValue)) {
    const firstValue = expressQueryValue[0];
    return typeof firstValue === "string" ? firstValue : undefined;
  }

  return getRequestUrl(req).searchParams.get(key) ?? undefined;
}

async function getCached<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
) {
  const current = cache.get(key);
  if (current && current.expiresAt > Date.now()) {
    return current.value as T;
  }

  const value = await loader();
  cache.set(key, {
    expiresAt: Date.now() + ttlMs,
    value,
  });
  return value;
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url, { headers: REQUEST_HEADERS });
  if (!response.ok) {
    throw new Error(`External request failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error("External request did not return JSON");
  }

  return (await response.json()) as T;
}

async function fetchText(url: string) {
  const response = await fetch(url, { headers: REQUEST_HEADERS });
  if (!response.ok) {
    throw new Error(`External request failed: ${response.status}`);
  }
  return response.text();
}

function parseNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function buildUnavailableGlobalMarketQuote(
  market: (typeof GLOBAL_MARKETS)[number]
): GlobalMarketSnapshotItem {
  return {
    marketId: market.id,
    symbol: market.index.symbol,
    currency: market.index.currency,
    price: null,
    previousClose: null,
    changeAbsolute: null,
    changePercent: null,
    updatedAt: null,
    source: "unavailable",
  };
}

function decodeHtmlEntities(value: string) {
  let current = value;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    current = current.replace(
      /&[a-z0-9#]+;/gi,
      entity => HTML_ENTITY_MAP[entity] ?? entity
    );
  }
  return current;
}

function stripHtml(value: string) {
  return decodeHtmlEntities(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeTopic(value: string) {
  return value
    .normalize("NFKC")
    .replace(SANITIZE_TOPIC_PATTERN, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48);
}

function sanitizeLabel(value: string | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  const normalized = value
    .normalize("NFKC")
    .replace(SANITIZE_LABEL_PATTERN, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48);
  return normalized || fallback;
}

function sanitizeTimezone(value: string | undefined) {
  if (!value) {
    return DEFAULT_TIMEZONE;
  }

  const normalized = value.replace(/[^A-Za-z0-9_+\-/:]/g, "").slice(0, 64);
  return normalized || DEFAULT_TIMEZONE;
}

function sanitizeLanguage(value: string | undefined) {
  if (!value) {
    return "pt-BR";
  }

  const normalized = value.replace(/[^A-Za-z0-9,-]/g, "").slice(0, 24);
  return normalized || "pt-BR";
}

function toRoundedCoordinate(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.round(parsed * 100) / 100;
}

function parseOptionalCoordinate(value: string | undefined) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.round(parsed * 100) / 100;
}

function getLocalizedUnavailableLabel(language: string) {
  const normalized = language.toLowerCase();
  if (normalized.startsWith("en")) {
    return "Location unavailable";
  }

  if (normalized.startsWith("es")) {
    return "Ubicación no disponible";
  }

  return "Localização indisponível";
}

function getTimezoneLocationLabel(timezone: string) {
  const cityToken = timezone.split("/").at(-1);
  if (!cityToken || cityToken.toUpperCase() === "UTC") {
    return null;
  }

  return sanitizeLabel(cityToken.replaceAll("_", " "), "");
}

function normalizeIpAddress(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value
    .replace(/^::ffff:/, "")
    .trim()
    .toLowerCase();
  return normalized || null;
}

function isPrivateIpAddress(value: string) {
  if (LOCALHOST_IPS.has(value)) {
    return true;
  }

  if (/^(10|127)\./.test(value)) {
    return true;
  }

  if (/^192\.168\./.test(value)) {
    return true;
  }

  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(value)) {
    return true;
  }

  return value.startsWith("fc") || value.startsWith("fd");
}

function getClientIp(req: ApiRequest) {
  const forwardedForHeader = req.headers["x-forwarded-for"];
  const forwardedValue =
    typeof forwardedForHeader === "string"
      ? forwardedForHeader
      : Array.isArray(forwardedForHeader)
        ? forwardedForHeader[0]
        : undefined;
  const candidates = [
    forwardedValue?.split(",")[0],
    req.headers["x-real-ip"]?.toString(),
    req.headers["x-client-ip"]?.toString(),
    req.headers["x-vercel-forwarded-for"]?.toString(),
    req.headers["fly-client-ip"]?.toString(),
    req.headers["cf-connecting-ip"]?.toString(),
    req.socket.remoteAddress,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeIpAddress(candidate);
    if (!normalized || isPrivateIpAddress(normalized)) {
      continue;
    }
    return normalized;
  }

  return null;
}

function readHeaderValue(req: ApiRequest, key: string) {
  const value = req.headers[key];
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0];
  }

  return undefined;
}

function decodeHeaderValue(value: string | undefined) {
  if (!value) {
    return "";
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function buildGeoLocationLabel(
  city: string,
  region: string,
  country: string,
  fallback = DEFAULT_GEOLOCATION.label
) {
  return sanitizeLabel(
    [city, region].filter(Boolean).join(", "),
    sanitizeLabel(country, fallback)
  );
}

function buildGeoLocationResponse(params: {
  city?: string;
  region?: string;
  country?: string;
  lat: number;
  lon: number;
  source: GeoLocationSource;
}) {
  const city = sanitizeLabel(params.city, "");
  const region = sanitizeLabel(params.region, "");
  const country = sanitizeLabel(params.country, DEFAULT_GEOLOCATION.country);

  return {
    city,
    region,
    country,
    lat: Math.round(params.lat * 10000) / 10000,
    lon: Math.round(params.lon * 10000) / 10000,
    source: params.source,
    label: buildGeoLocationLabel(city, region, country),
  } satisfies GeoLocationResponse;
}

type ReverseGeocodeResponse = {
  display_name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    suburb?: string;
    county?: string;
    state?: string;
    region?: string;
    country?: string;
  };
};

type BigDataCloudReverseGeoResponse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
};

type IpApiCoResponse = {
  city?: string;
  region?: string;
  country_name?: string;
  latitude?: number;
  longitude?: number;
  error?: boolean;
};

type IpApiResponse = {
  status?: string;
  city?: string;
  regionName?: string;
  country?: string;
  lat?: number;
  lon?: number;
};

async function reverseGeocodeLocationDetails(
  latitude: number,
  longitude: number,
  language: string
) {
  const cacheKey = `widgets:geo:reverse:${latitude}:${longitude}:${language}`;
  return getCached<GeoLocationResponse | null>(
    cacheKey,
    1000 * 60 * 60 * 12,
    async () => {
      try {
        const url = new URL("https://nominatim.openstreetmap.org/reverse");
        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("lat", String(latitude));
        url.searchParams.set("lon", String(longitude));
        url.searchParams.set("zoom", "10");
        url.searchParams.set("addressdetails", "1");
        url.searchParams.set("accept-language", language);

        const data = await fetchJson<ReverseGeocodeResponse>(url.toString());
        const address = data.address ?? {};
        const city = sanitizeLabel(
          address.city ??
            address.town ??
            address.village ??
            address.municipality ??
            address.suburb ??
            address.county,
          ""
        );
        const region = sanitizeLabel(address.state ?? address.region, "");
        const country = sanitizeLabel(
          address.country,
          DEFAULT_GEOLOCATION.country
        );

        if (city || region) {
          return buildGeoLocationResponse({
            city,
            region,
            country,
            lat: latitude,
            lon: longitude,
            source: "browser",
          });
        }

        const label = sanitizeLabel(
          data.display_name,
          DEFAULT_GEOLOCATION.label
        );
        if (label) {
          return {
            ...DEFAULT_GEOLOCATION,
            lat: Math.round(latitude * 10000) / 10000,
            lon: Math.round(longitude * 10000) / 10000,
            source: "browser",
            label,
          } satisfies GeoLocationResponse;
        }
      } catch {
        // Try the next reverse geocoding provider.
      }

      try {
        const url = new URL(
          "https://api.bigdatacloud.net/data/reverse-geocode-client"
        );
        url.searchParams.set("latitude", String(latitude));
        url.searchParams.set("longitude", String(longitude));
        url.searchParams.set("localityLanguage", language.slice(0, 2));

        const data = await fetchJson<BigDataCloudReverseGeoResponse>(
          url.toString()
        );
        const city = sanitizeLabel(data.city ?? data.locality, "");
        const region = sanitizeLabel(data.principalSubdivision, "");
        const country = sanitizeLabel(
          data.countryName,
          DEFAULT_GEOLOCATION.country
        );

        if (city || region) {
          return buildGeoLocationResponse({
            city,
            region,
            country,
            lat: latitude,
            lon: longitude,
            source: "browser",
          });
        }
      } catch {
        return null;
      }

      return null;
    }
  );
}

function resolveVercelGeoLocation(req: ApiRequest) {
  const city = sanitizeLabel(
    decodeHeaderValue(readHeaderValue(req, "x-vercel-ip-city")),
    ""
  );
  const region = sanitizeLabel(
    decodeHeaderValue(readHeaderValue(req, "x-vercel-ip-country-region")),
    ""
  );
  const country = sanitizeLabel(
    decodeHeaderValue(readHeaderValue(req, "x-vercel-ip-country")),
    DEFAULT_GEOLOCATION.country
  );
  const latitude = parseOptionalCoordinate(
    readHeaderValue(req, "x-vercel-ip-latitude")
  );
  const longitude = parseOptionalCoordinate(
    readHeaderValue(req, "x-vercel-ip-longitude")
  );

  if (latitude === null || longitude === null) {
    return null;
  }

  if (!city && !region) {
    return null;
  }

  return buildGeoLocationResponse({
    city,
    region,
    country,
    lat: latitude,
    lon: longitude,
    source: "ip",
  });
}

async function resolveIpLocationFromProviders(ip: string) {
  try {
    const response = await fetchJson<IpApiCoResponse>(
      `https://ipapi.co/${encodeURIComponent(ip)}/json/`
    );
    if (
      !response.error &&
      typeof response.city === "string" &&
      typeof response.latitude === "number" &&
      typeof response.longitude === "number"
    ) {
      return buildGeoLocationResponse({
        city: response.city,
        region: response.region,
        country: response.country_name,
        lat: response.latitude,
        lon: response.longitude,
        source: "ip",
      });
    }
  } catch {
    // Try the next provider.
  }

  try {
    const response = await fetchJson<IpApiResponse>(
      `http://ip-api.com/json/${encodeURIComponent(
        ip
      )}?fields=status,city,regionName,country,lat,lon`
    );
    if (
      response.status === "success" &&
      typeof response.city === "string" &&
      typeof response.lat === "number" &&
      typeof response.lon === "number"
    ) {
      return buildGeoLocationResponse({
        city: response.city,
        region: response.regionName,
        country: response.country,
        lat: response.lat,
        lon: response.lon,
        source: "ip",
      });
    }
  } catch {
    // Try the next provider.
  }

  try {
    const response = await fetchJson<any>(
      `https://ipwho.is/${encodeURIComponent(ip)}`
    );
    if (
      response?.success &&
      typeof response.city === "string" &&
      typeof response.latitude === "number" &&
      typeof response.longitude === "number"
    ) {
      return buildGeoLocationResponse({
        city: response.city,
        region: response.region,
        country: response.country,
        lat: response.latitude,
        lon: response.longitude,
        source: "ip",
      });
    }
  } catch {
    return null;
  }

  return null;
}

async function resolveApproximateGeoLocation(
  req: ApiRequest,
  language: string
) {
  const vercelGeoLocation = resolveVercelGeoLocation(req);
  const clientIp = getClientIp(req);
  const cacheKey = `widgets:geo:auto:${vercelGeoLocation?.label ?? "no-edge"}:${
    clientIp ?? "unknown"
  }:${language}`;

  return getCached<GeoLocationResponse>(cacheKey, 1000 * 60 * 30, async () => {
    if (vercelGeoLocation) {
      return vercelGeoLocation;
    }

    if (clientIp) {
      const ipLocation = await resolveIpLocationFromProviders(clientIp);
      if (ipLocation) {
        return ipLocation;
      }
    }

    return DEFAULT_GEOLOCATION;
  });
}

function toIsoDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString();
}

function summarizeNews(title: string, description: string) {
  const cleanTitle = title.replace(/\s+-\s+[^-]+$/, "").trim();
  const base =
    description && description !== cleanTitle ? description : cleanTitle;
  return base.length > 170 ? `${base.slice(0, 167).trim()}...` : base;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseNewsFeed(xml: string) {
  const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g));
  return items
    .map(match => {
      const item = match[1];
      const title = stripHtml(
        item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? ""
      );
      const link = stripHtml(
        item.match(/<link>([\s\S]*?)<\/link>/i)?.[1] ?? ""
      );
      const description = stripHtml(
        item.match(/<description>([\s\S]*?)<\/description>/i)?.[1] ?? ""
      );
      const source = stripHtml(
        item.match(/<source[^>]*>([\s\S]*?)<\/source>/i)?.[1] ?? ""
      );
      const sourceUrl = stripHtml(
        item.match(/<source[^>]*url="([^"]+)"/i)?.[1] ?? ""
      );
      const publishedAt = stripHtml(
        item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] ?? ""
      );

      if (!title || !link) {
        return null;
      }

      const normalizedDescription = source
        ? description
            .replace(new RegExp(`${escapeRegExp(source)}$`, "i"), "")
            .trim()
        : description;

      return {
        title,
        summary: summarizeNews(title, normalizedDescription),
        source: source || "Fonte externa",
        sourceUrl: sourceUrl || link,
        link,
        publishedAt: toIsoDate(publishedAt),
      };
    })
    .filter(Boolean)
    .slice(0, 6);
}

function mapWeatherCode(code: number | null) {
  if (code === null) {
    return "Condição indisponível";
  }

  if (code === 0) {
    return "Céu limpo";
  }

  if ([1, 2].includes(code)) {
    return "Parcialmente nublado";
  }

  if (code === 3) {
    return "Nublado";
  }

  if ([45, 48].includes(code)) {
    return "Neblina";
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return "Garoa";
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return "Chuva";
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "Neve";
  }

  if ([95, 96, 99].includes(code)) {
    return "Tempestade";
  }

  return "Tempo variado";
}

async function reverseGeocodeLocationLabel(
  latitude: number,
  longitude: number,
  language: string,
  fallbackLabel: string
) {
  const details = await reverseGeocodeLocationDetails(
    latitude,
    longitude,
    language
  );
  return details?.label ?? fallbackLabel;
}

async function resolveWeatherLocation(req: ApiRequest) {
  const latitude = parseOptionalCoordinate(getQueryParam(req, "lat"));
  const longitude = parseOptionalCoordinate(getQueryParam(req, "lon"));
  const timezone = sanitizeTimezone(getQueryParam(req, "timezone"));
  const language = sanitizeLanguage(getQueryParam(req, "lang"));

  if (latitude !== null && longitude !== null) {
    const preciseLocation =
      (await reverseGeocodeLocationDetails(latitude, longitude, language)) ??
      buildGeoLocationResponse({
        city: "",
        region: "",
        country: DEFAULT_GEOLOCATION.country,
        lat: latitude,
        lon: longitude,
        source: "browser",
      });

    return {
      latitude,
      longitude,
      label: sanitizeLabel(getQueryParam(req, "label"), preciseLocation.label),
      timezone,
      isFallback: false,
      source: "browser",
    } satisfies ResolvedWeatherLocation;
  }

  const approximateLocation = await resolveApproximateGeoLocation(
    req,
    language
  );

  return {
    latitude: approximateLocation.lat,
    longitude: approximateLocation.lon,
    label: approximateLocation.label,
    timezone,
    isFallback: true,
    source: "ip",
  } satisfies ResolvedWeatherLocation;
}

function parseYahooIndex(
  data: any,
  config: { symbol: string; label: string; displaySymbol: string }
) {
  const result = data?.chart?.result?.[0];
  const meta = result?.meta;
  const closes = Array.isArray(result?.indicators?.quote?.[0]?.close)
    ? result.indicators.quote[0].close.filter(
        (value: unknown) => typeof value === "number"
      )
    : [];
  const price =
    parseNumber(meta?.regularMarketPrice) ?? parseNumber(closes.at(-1));
  const previousClose =
    parseNumber(meta?.previousClose) ?? parseNumber(closes.at(-2));

  if (price === null || previousClose === null || previousClose === 0) {
    return null;
  }

  return {
    symbol: config.displaySymbol,
    label: config.label,
    currency: meta?.currency ?? "USD",
    price,
    changePercent: ((price - previousClose) / previousClose) * 100,
  };
}

function parseYahooMarketQuote(marketId: string, symbol: string, data: any) {
  const result = data?.chart?.result?.[0];
  const meta = result?.meta;
  const closes = Array.isArray(result?.indicators?.quote?.[0]?.close)
    ? result.indicators.quote[0].close.filter(
        (value: unknown) => typeof value === "number"
      )
    : [];
  const price =
    parseNumber(meta?.regularMarketPrice) ?? parseNumber(closes.at(-1));
  const previousClose =
    parseNumber(meta?.previousClose) ?? parseNumber(closes.at(-2));
  const quoteCurrency =
    typeof meta?.currency === "string" && meta.currency.trim()
      ? meta.currency
      : null;
  const updatedAt =
    typeof meta?.regularMarketTime === "number"
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : new Date().toISOString();

  if (price === null || previousClose === null || previousClose === 0) {
    return {
      marketId,
      symbol,
      currency: quoteCurrency,
      price: null,
      previousClose,
      changeAbsolute: null,
      changePercent: null,
      updatedAt,
      source: "unavailable" as const,
    };
  }

  return {
    marketId,
    symbol,
    currency: quoteCurrency,
    price,
    previousClose,
    changeAbsolute: price - previousClose,
    changePercent: ((price - previousClose) / previousClose) * 100,
    updatedAt,
    source: "yahoo" as const,
  };
}

async function mapWithConcurrency<TItem, TResult>(
  items: TItem[],
  concurrency: number,
  mapper: (item: TItem, index: number) => Promise<TResult>
) {
  const results = new Array<TResult>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= items.length) {
        return;
      }

      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  );

  return results;
}

async function fetchCurrencyRates() {
  if (EXCHANGERATE_HOST_ACCESS_KEY) {
    const data = await fetchJson<{
      success?: boolean;
      quotes?: Record<string, number>;
      source?: string;
      error?: { code?: number; info?: string };
    }>(
      `https://api.exchangerate.host/live?source=USD&currencies=BRL,EUR,GBP&access_key=${encodeURIComponent(
        EXCHANGERATE_HOST_ACCESS_KEY
      )}`
    );

    if (!data.success || !data.quotes) {
      throw new Error(data.error?.info ?? "Currency provider error");
    }

    return {
      provider: "exchangerate.host",
      base: "USD" as const,
      rates: {
        USD: 1,
        BRL: data.quotes.USDBRL,
        EUR: data.quotes.USDEUR,
        GBP: data.quotes.USDGBP,
      },
    };
  }

  const fallback = await fetchJson<{ rates: Record<string, number> }>(
    "https://api.frankfurter.app/latest?from=USD&to=BRL,EUR,GBP"
  );

  return {
    provider: "frankfurter.app",
    base: "USD" as const,
    rates: {
      USD: 1,
      BRL: fallback.rates.BRL,
      EUR: fallback.rates.EUR,
      GBP: fallback.rates.GBP,
    },
  };
}

async function buildMarketOverview() {
  const [
    currenciesResult,
    cryptoResult,
    ibovResult,
    nasdaqResult,
    sp500Result,
  ] = await Promise.allSettled([
    fetchCurrencyRates(),
    fetchJson<Record<string, { brl?: number; brl_24h_change?: number }>>(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=brl&include_24hr_change=true"
    ),
    fetchJson<any>(
      "https://query1.finance.yahoo.com/v8/finance/chart/%5EBVSP?interval=1d&range=5d"
    ),
    fetchJson<any>(
      "https://query1.finance.yahoo.com/v8/finance/chart/%5EIXIC?interval=1d&range=5d"
    ),
    fetchJson<any>(
      "https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=5d"
    ),
  ]);

  const currencies =
    currenciesResult.status === "fulfilled" ? currenciesResult.value : null;

  const crypto =
    cryptoResult.status === "fulfilled"
      ? [
          {
            symbol: "BTC",
            name: "Bitcoin",
            priceBRL: parseNumber(cryptoResult.value.bitcoin?.brl),
            changePercent24h: parseNumber(
              cryptoResult.value.bitcoin?.brl_24h_change
            ),
          },
          {
            symbol: "ETH",
            name: "Ethereum",
            priceBRL: parseNumber(cryptoResult.value.ethereum?.brl),
            changePercent24h: parseNumber(
              cryptoResult.value.ethereum?.brl_24h_change
            ),
          },
          {
            symbol: "SOL",
            name: "Solana",
            priceBRL: parseNumber(cryptoResult.value.solana?.brl),
            changePercent24h: parseNumber(
              cryptoResult.value.solana?.brl_24h_change
            ),
          },
        ].filter(item => item.priceBRL !== null)
      : [];

  const indices = [
    ibovResult.status === "fulfilled"
      ? parseYahooIndex(ibovResult.value, {
          symbol: "^BVSP",
          label: "Ibovespa",
          displaySymbol: "IBOV",
        })
      : null,
    nasdaqResult.status === "fulfilled"
      ? parseYahooIndex(nasdaqResult.value, {
          symbol: "^IXIC",
          label: "NASDAQ",
          displaySymbol: "NASDAQ",
        })
      : null,
    sp500Result.status === "fulfilled"
      ? parseYahooIndex(sp500Result.value, {
          symbol: "^GSPC",
          label: "S&P 500",
          displaySymbol: "S&P 500",
        })
      : null,
  ].filter(Boolean);

  if (!currencies && !crypto.length && !indices.length) {
    throw new Error("No market data available");
  }

  return {
    ok: true,
    updatedAt: new Date().toISOString(),
    currencies,
    crypto,
    indices,
  };
}

async function buildGlobalMarketsSnapshot() {
  const items = await mapWithConcurrency(
    GLOBAL_MARKETS,
    GLOBAL_MARKETS_CONCURRENCY,
    async market => {
      try {
        const payload = await fetchJson<any>(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
            market.index.symbol
          )}?interval=1d&range=5d`
        );

        return parseYahooMarketQuote(market.id, market.index.symbol, payload);
      } catch {
        return buildUnavailableGlobalMarketQuote(market);
      }
    }
  );

  return {
    ok: true,
    updatedAt: new Date().toISOString(),
    snapshotStatus: "live",
    snapshotNotice: null,
    items,
  } satisfies GlobalMarketsSnapshotPayload;
}

function countLiveGlobalMarketQuotes(snapshot: GlobalMarketsSnapshotPayload) {
  return snapshot.items.filter(
    item => item.source === "yahoo" && item.price !== null
  ).length;
}

function buildFallbackGlobalMarketsSnapshotPayload() {
  return {
    ok: true,
    updatedAt: new Date().toISOString(),
    snapshotStatus: "fallback",
    snapshotNotice: "provider_unavailable",
    items: GLOBAL_MARKETS.map(market => buildUnavailableGlobalMarketQuote(market)),
  } satisfies GlobalMarketsSnapshotPayload;
}

function getGlobalMarketsCachedSnapshot(forceRefresh: boolean) {
  if (forceRefresh || !globalMarketsCache) {
    return null;
  }

  return globalMarketsCache.expiresAt > Date.now()
    ? globalMarketsCache.value
    : null;
}

function setGlobalMarketsCachedSnapshot(
  snapshot: GlobalMarketsSnapshotPayload,
  ttlMs: number
) {
  globalMarketsCache = {
    expiresAt: Date.now() + ttlMs,
    value: snapshot,
  };
}

async function loadGlobalMarketsSnapshot(forceRefresh = false) {
  const cached = getGlobalMarketsCachedSnapshot(forceRefresh);
  if (cached) {
    return cached;
  }

  if (globalMarketsInFlight) {
    return globalMarketsInFlight;
  }

  globalMarketsInFlight = (async () => {
    try {
      const snapshot = await buildGlobalMarketsSnapshot();
      const liveQuotes = countLiveGlobalMarketQuotes(snapshot);

      if (liveQuotes > 0) {
        globalMarketsLastGoodSnapshot = snapshot;
        setGlobalMarketsCachedSnapshot(snapshot, GLOBAL_MARKETS_LIVE_TTL_MS);
        return snapshot;
      }
    } catch {
      // Ignore here and fall back to the latest valid snapshot below.
    }

    if (globalMarketsLastGoodSnapshot) {
      const staleSnapshot = {
        ...globalMarketsLastGoodSnapshot,
        snapshotStatus: "stale" as const,
        snapshotNotice: "stale_last_good",
      };
      setGlobalMarketsCachedSnapshot(
        staleSnapshot,
        GLOBAL_MARKETS_DEGRADED_TTL_MS
      );
      return staleSnapshot;
    }

    const fallbackSnapshot = buildFallbackGlobalMarketsSnapshotPayload();
    setGlobalMarketsCachedSnapshot(
      fallbackSnapshot,
      GLOBAL_MARKETS_DEGRADED_TTL_MS
    );
    return fallbackSnapshot;
  })();

  try {
    return await globalMarketsInFlight;
  } finally {
    globalMarketsInFlight = null;
  }
}

async function buildWeatherSnapshot(req: ApiRequest) {
  const language = sanitizeLanguage(getQueryParam(req, "lang"));
  const resolvedLocation = await resolveWeatherLocation(req);

  if (
    resolvedLocation.latitude === null ||
    resolvedLocation.longitude === null
  ) {
    return {
      ok: true,
      locationLabel: resolvedLocation.label,
      isFallback: true,
      source: resolvedLocation.source,
      timezone: resolvedLocation.timezone,
      current: {
        temperature: null,
        windSpeed: null,
        code: null,
        label: mapWeatherCode(null),
      },
      daily: [],
    };
  }

  const locationLabel = await reverseGeocodeLocationLabel(
    resolvedLocation.latitude,
    resolvedLocation.longitude,
    language,
    resolvedLocation.label
  );

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(resolvedLocation.latitude));
  url.searchParams.set("longitude", String(resolvedLocation.longitude));
  url.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m");
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,weather_code"
  );
  url.searchParams.set("forecast_days", "3");
  url.searchParams.set("timezone", resolvedLocation.timezone);

  const data = await fetchJson<any>(url.toString());
  const dates: string[] = data?.daily?.time ?? [];
  const maxValues: number[] = data?.daily?.temperature_2m_max ?? [];
  const minValues: number[] = data?.daily?.temperature_2m_min ?? [];
  const codes: number[] = data?.daily?.weather_code ?? [];

  return {
    ok: true,
    locationLabel,
    isFallback: resolvedLocation.isFallback,
    source: resolvedLocation.source,
    timezone: resolvedLocation.timezone,
    current: {
      temperature: parseNumber(data?.current?.temperature_2m),
      windSpeed: parseNumber(data?.current?.wind_speed_10m),
      code: parseNumber(data?.current?.weather_code),
      label: mapWeatherCode(parseNumber(data?.current?.weather_code)),
    },
    daily: dates.slice(0, 3).map((date, index) => ({
      date,
      max: parseNumber(maxValues[index]),
      min: parseNumber(minValues[index]),
      code: parseNumber(codes[index]),
      label: mapWeatherCode(parseNumber(codes[index])),
    })),
  };
}

async function buildNewsSnapshot(topic: string) {
  const url = new URL("https://news.google.com/rss/search");
  url.searchParams.set("q", topic);
  url.searchParams.set("hl", "pt-BR");
  url.searchParams.set("gl", "BR");
  url.searchParams.set("ceid", "BR:pt-419");

  const xml = await fetchText(url.toString());
  return {
    ok: true,
    topic,
    updatedAt: new Date().toISOString(),
    items: parseNewsFeed(xml),
  };
}

async function handleOverviewRequest(res: ApiResponse) {
  try {
    const data = await getCached(
      "widgets:overview",
      1000 * 60 * 10,
      buildMarketOverview
    );
    setApiCache(res, 300);
    sendJson(res, 200, data);
  } catch {
    sendJsonError(
      res,
      502,
      "overview_unavailable",
      "Não foi possível carregar cotações e indicadores agora."
    );
  }
}

async function handleGlobalMarketsRequest(req: ApiRequest, res: ApiResponse) {
  try {
    const forceRefresh = getQueryParam(req, "refresh") === "1";
    const data = await loadGlobalMarketsSnapshot(forceRefresh);
    setApiCache(
      res,
      data.snapshotStatus === "live" ? 300 : 60
    );
    sendJson(res, 200, data);
  } catch {
    sendJsonError(
      res,
      502,
      "global_markets_unavailable",
      "Não foi possível carregar os mercados globais agora."
    );
  }
}

async function handleGeoRequest(req: ApiRequest, res: ApiResponse) {
  try {
    const latitude = parseOptionalCoordinate(getQueryParam(req, "lat"));
    const longitude = parseOptionalCoordinate(getQueryParam(req, "lon"));
    const language = sanitizeLanguage(getQueryParam(req, "lang"));
    const cacheKey =
      latitude !== null && longitude !== null
        ? `widgets:geo:coords:${latitude}:${longitude}:${language}`
        : `widgets:geo:auto:${getClientIp(req) ?? "unknown"}:${language}:${
            resolveVercelGeoLocation(req)?.label ?? "no-edge"
          }`;

    const data = await getCached(cacheKey, 1000 * 60 * 30, async () => {
      if (latitude !== null && longitude !== null) {
        return (
          (await reverseGeocodeLocationDetails(
            latitude,
            longitude,
            language
          )) ??
          buildGeoLocationResponse({
            city: "",
            region: "",
            country: DEFAULT_GEOLOCATION.country,
            lat: latitude,
            lon: longitude,
            source: "browser",
          })
        );
      }

      return resolveApproximateGeoLocation(req, language);
    });

    setApiCache(res, 1800);
    sendJson(res, 200, data);
  } catch {
    sendJsonError(
      res,
      502,
      "geo_unavailable",
      "Não foi possível carregar a localização agora."
    );
  }
}

async function handleWeatherRequest(req: ApiRequest, res: ApiResponse) {
  try {
    const latitude = parseOptionalCoordinate(getQueryParam(req, "lat"));
    const longitude = parseOptionalCoordinate(getQueryParam(req, "lon"));
    const timezone = sanitizeTimezone(getQueryParam(req, "timezone"));
    const language = sanitizeLanguage(getQueryParam(req, "lang"));
    const cacheKey =
      latitude !== null && longitude !== null
        ? `widgets:weather:coords:${latitude}:${longitude}:${timezone}:${language}`
        : `widgets:weather:auto:${getClientIp(req) ?? "unknown"}:${timezone}:${language}`;
    const data = await getCached(cacheKey, 1000 * 60 * 30, () =>
      buildWeatherSnapshot(req)
    );
    setApiCache(res, 900);
    sendJson(res, 200, data);
  } catch {
    sendJsonError(
      res,
      502,
      "weather_unavailable",
      "Não foi possível carregar o clima agora."
    );
  }
}

async function handleNewsRequest(req: ApiRequest, res: ApiResponse) {
  const topic = sanitizeTopic(String(getQueryParam(req, "topic") ?? ""));
  if (topic.length < 2) {
    sendJsonError(
      res,
      400,
      "invalid_topic",
      "Informe um assunto com pelo menos 2 caracteres."
    );
    return;
  }

  try {
    const data = await getCached(
      `widgets:news:${topic.toLowerCase()}`,
      1000 * 60 * 15,
      () => buildNewsSnapshot(topic)
    );
    setApiCache(res, 300);
    sendJson(res, 200, data);
  } catch {
    sendJsonError(
      res,
      502,
      "news_unavailable",
      "Não foi possível carregar notícias agora."
    );
  }
}

async function handleExternalDataRequest(req: ApiRequest, res: ApiResponse) {
  const pathname = getRequestUrl(req).pathname;
  if (!pathname.startsWith("/api/") && !pathname.startsWith("/widgets/")) {
    return false;
  }

  if (!["GET", "HEAD"].includes(req.method ?? "GET")) {
    sendJsonError(
      res,
      405,
      "method_not_allowed",
      "Método HTTP não suportado nesta rota."
    );
    return true;
  }

  if (
    pathname === "/api/widgets/overview" ||
    pathname === "/widgets/overview"
  ) {
    await handleOverviewRequest(res);
    return true;
  }

  if (pathname === "/api/widgets/weather" || pathname === "/widgets/weather") {
    await handleWeatherRequest(req, res);
    return true;
  }

  if (pathname === "/api/markets/global") {
    await handleGlobalMarketsRequest(req, res);
    return true;
  }

  if (pathname === "/api/geo") {
    await handleGeoRequest(req, res);
    return true;
  }

  if (pathname === "/api/widgets/news" || pathname === "/widgets/news") {
    await handleNewsRequest(req, res);
    return true;
  }

  sendJsonError(res, 404, "api_not_found", "Rota de API não encontrada.");
  return true;
}

export function createExternalDataMiddleware() {
  return (
    req: ApiRequest,
    res: ApiResponse,
    next: (error?: unknown) => void
  ) => {
    void handleExternalDataRequest(req, res)
      .then(handled => {
        if (!handled) {
          next();
        }
      })
      .catch(error => {
        next(error);
      });
  };
}

export function createExternalDataRouter() {
  return createExternalDataMiddleware();
}

export function registerExternalDataRoutes(app: Express) {
  app.use(createExternalDataMiddleware());
}
