import type { IncomingMessage, ServerResponse } from "node:http";
import type { Express } from "express";
import type {
  IpLookupResponse,
  TrafficFlowMode,
} from "../shared/connection-tools.js";

const REQUEST_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (compatible; DatasUteis/1.0; +https://datasuteis.com.br)",
};

const LOCALHOST_IPS = new Set(["127.0.0.1", "::1", "localhost"]);
const lookupCache = new Map<string, { expiresAt: number; value: IpLookupResponse }>();
const IP_LOOKUP_TTL_MS = 1000 * 60 * 20;
const DEFAULT_DOWNLOAD_SIZE = 1_200_000;
const MAX_BINARY_SIZE = 2_000_000;
const MAX_UPLOAD_SIZE = 3_000_000;

interface VercelGeoLocation {
  city: string | null;
  region: string | null;
  country: string | null;
}

interface IpWhoIsResponse {
  success?: boolean;
  ip?: string;
  type?: string;
  city?: string;
  region?: string;
  country?: string;
  connection?: {
    isp?: string;
  };
}

interface IpApiCoResponse {
  ip?: string;
  version?: string;
  city?: string;
  region?: string;
  country_name?: string;
  org?: string;
  error?: boolean;
}

interface IpifyResponse {
  ip?: string;
}

interface FreeIpApiResponse {
  ipVersion?: number;
  ipAddress?: string;
  cityName?: string;
  regionName?: string;
  countryName?: string;
  asnOrganization?: string;
}

type ApiRequest = IncomingMessage & {
  query?: Record<string, unknown>;
};

type ApiResponse = ServerResponse;

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
  message: string
) {
  sendJson(res, status, {
    ok: false,
    error,
    message,
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

function setNoStoreHeaders(res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

function normalizeIpAddress(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/^::ffff:/, "").trim();
  return normalized || null;
}

function isPrivateIpAddress(value: string) {
  const normalized = value.toLowerCase();

  if (LOCALHOST_IPS.has(normalized)) {
    return true;
  }

  if (/^(10|127)\./.test(normalized)) {
    return true;
  }

  if (/^192\.168\./.test(normalized)) {
    return true;
  }

  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)) {
    return true;
  }

  return normalized.startsWith("fc") || normalized.startsWith("fd");
}

function getClientIp(req: ApiRequest) {
  const forwardedForHeader = readHeaderValue(req, "x-forwarded-for");
  const candidates = [
    forwardedForHeader?.split(",")[0],
    readHeaderValue(req, "x-real-ip"),
    readHeaderValue(req, "x-client-ip"),
    readHeaderValue(req, "x-vercel-forwarded-for"),
    readHeaderValue(req, "fly-client-ip"),
    readHeaderValue(req, "cf-connecting-ip"),
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

function getIpVersion(ip: string | null) {
  if (!ip) {
    return "Desconhecido" as const;
  }

  return ip.includes(":") ? ("IPv6" as const) : ("IPv4" as const);
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

function cleanText(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value
    .normalize("NFKC")
    .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ0-9\s,.\-_/()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || null;
}

function resolveEdgeLocation(req: ApiRequest): VercelGeoLocation | null {
  const city = cleanText(
    decodeHeaderValue(readHeaderValue(req, "x-vercel-ip-city"))
  );
  const region = cleanText(
    decodeHeaderValue(readHeaderValue(req, "x-vercel-ip-country-region"))
  );
  const country = cleanText(
    decodeHeaderValue(readHeaderValue(req, "x-vercel-ip-country"))
  );

  if (!city && !region && !country) {
    return null;
  }

  return { city, region, country };
}

// ── Location normalisation (ISO codes → Portuguese display names) ────────────

const COUNTRY_DISPLAY_NAMES: Record<string, string> = {
  BR: "Brasil", BRAZIL: "Brasil", BRASIL: "Brasil",
  US: "Estados Unidos", "UNITED STATES": "Estados Unidos",
  PT: "Portugal",
  AR: "Argentina",
  UY: "Uruguai", URUGUAY: "Uruguai",
  PY: "Paraguai", PARAGUAY: "Paraguai",
  CL: "Chile",
  CO: "Colômbia", COLOMBIA: "Colômbia",
  PE: "Peru",
  BO: "Bolívia", BOLIVIA: "Bolívia",
  VE: "Venezuela",
  EC: "Equador", ECUADOR: "Equador",
  MX: "México", MEXICO: "México",
  DE: "Alemanha", GERMANY: "Alemanha",
  FR: "França", FRANCE: "França",
  ES: "Espanha", SPAIN: "Espanha",
  IT: "Itália", ITALY: "Itália",
  GB: "Reino Unido", "UNITED KINGDOM": "Reino Unido",
  JP: "Japão", JAPAN: "Japão",
  CN: "China",
  CA: "Canadá", CANADA: "Canadá",
};

const BR_STATE_NAMES: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas",
  BA: "Bahia", CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo",
  GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul",
  MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
  PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina",
  SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};

function normalizeCountry(value: string | null): string | null {
  if (!value) return null;
  const key = value.trim().toUpperCase();
  return COUNTRY_DISPLAY_NAMES[key] ?? value;
}

function normalizeRegion(value: string | null, rawCountry: string | null): string | null {
  if (!value) return null;
  if (!rawCountry) return value;
  const countryKey = rawCountry.trim().toUpperCase();
  const isBrazil = countryKey === "BR" || countryKey === "BRAZIL" || countryKey === "BRASIL";
  if (isBrazil) {
    const regionKey = value.trim().toUpperCase();
    return BR_STATE_NAMES[regionKey] ?? value;
  }
  return value;
}

// ── UA detection ────────────────────────────────────────────────────────────

function detectOperatingSystem(userAgent: string) {
  if (/Windows NT 10\.0/i.test(userAgent)) {
    return "Windows";
  }

  if (/Android/i.test(userAgent)) {
    return "Android";
  }

  if (/(iPhone|iPad|iPod)/i.test(userAgent)) {
    return "iOS";
  }

  if (/Mac OS X/i.test(userAgent)) {
    return "macOS";
  }

  if (/CrOS/i.test(userAgent)) {
    return "ChromeOS";
  }

  if (/Linux/i.test(userAgent)) {
    return "Linux";
  }

  return "Não identificado";
}

function detectBrowser(userAgent: string) {
  if (/Edg\//i.test(userAgent)) {
    return "Microsoft Edge";
  }

  if (/OPR\//i.test(userAgent)) {
    return "Opera";
  }

  if (/Firefox\//i.test(userAgent)) {
    return "Firefox";
  }

  if (/Chrome\//i.test(userAgent) && !/Edg\//i.test(userAgent)) {
    return "Chrome";
  }

  if (/Safari\//i.test(userAgent) && /Version\//i.test(userAgent)) {
    return "Safari";
  }

  return "Navegador não identificado";
}

async function fetchJsonWithTimeout<T>(url: string, timeoutMs = 3500) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: REQUEST_HEADERS,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`External request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function resolvePublicIpFallback() {
  try {
    const response = await fetchJsonWithTimeout<IpifyResponse>(
      "https://api64.ipify.org?format=json",
      3000
    );
    const normalized = normalizeIpAddress(response.ip);
    return normalized && !isPrivateIpAddress(normalized) ? normalized : null;
  } catch {
    return null;
  }
}

async function resolveIpMetadata(ip: string) {
  try {
    const response = await fetchJsonWithTimeout<FreeIpApiResponse>(
      `https://freeipapi.com/api/json/${encodeURIComponent(ip)}`
    );

    if (response.ipAddress || response.cityName || response.countryName) {
      return {
        ip: cleanText(response.ipAddress) ?? ip,
        ipVersion:
          response.ipVersion === 6
            ? ("IPv6" as const)
            : response.ipVersion === 4
              ? ("IPv4" as const)
              : getIpVersion(ip),
        city: cleanText(response.cityName),
        region: cleanText(response.regionName),
        country: cleanText(response.countryName),
        isp: cleanText(response.asnOrganization),
      };
    }
  } catch {
    // Try other providers below.
  }

  try {
    const response = await fetchJsonWithTimeout<IpWhoIsResponse>(
      `https://ipwho.is/${encodeURIComponent(ip)}`
    );

    if (response.success !== false) {
      return {
        ip: cleanText(response.ip) ?? ip,
        ipVersion:
          response.type === "IPv6"
            ? ("IPv6" as const)
            : response.type === "IPv4"
              ? ("IPv4" as const)
              : getIpVersion(ip),
        city: cleanText(response.city),
        region: cleanText(response.region),
        country: cleanText(response.country),
        isp: cleanText(response.connection?.isp),
      };
    }
  } catch {
    // Fallback provider below.
  }

  try {
    const response = await fetchJsonWithTimeout<IpApiCoResponse>(
      `https://ipapi.co/${encodeURIComponent(ip)}/json/`
    );

    if (!response.error) {
      return {
        ip: cleanText(response.ip) ?? ip,
        ipVersion:
          response.version === "IPv6"
            ? ("IPv6" as const)
            : response.version === "IPv4"
              ? ("IPv4" as const)
              : getIpVersion(ip),
        city: cleanText(response.city),
        region: cleanText(response.region),
        country: cleanText(response.country_name),
        isp: cleanText(response.org),
      };
    }
  } catch {
    // Ignore and fall back to request-only data.
  }

  return {
    ip,
    ipVersion: getIpVersion(ip),
    city: null,
    region: null,
    country: null,
    isp: null,
  };
}

async function resolveIpLookup(req: ApiRequest) {
  const requestIp = getClientIp(req);
  const resolvedIp = requestIp ?? (await resolvePublicIpFallback());
  const userAgent =
    readHeaderValue(req, "user-agent") ?? "User-Agent indisponível";
  const edgeLocation = resolveEdgeLocation(req);

  if (resolvedIp) {
    const cached = lookupCache.get(resolvedIp);
    if (cached && cached.expiresAt > Date.now()) {
      return {
        ...cached.value,
        userAgent,
        os: detectOperatingSystem(userAgent),
        browser: detectBrowser(userAgent),
      } satisfies IpLookupResponse;
    }
  }

  const resolved = resolvedIp ? await resolveIpMetadata(resolvedIp) : null;

  const rawCountry = edgeLocation?.country ?? resolved?.country ?? null;
  const rawRegion = edgeLocation?.region ?? resolved?.region ?? null;
  const rawCity = edgeLocation?.city ?? resolved?.city ?? null;

  const payload = {
    ip: resolved?.ip ?? resolvedIp ?? "Não foi possível identificar",
    ipVersion: resolved?.ipVersion ?? getIpVersion(resolvedIp),
    city: rawCity,
    region: normalizeRegion(rawRegion, rawCountry),
    country: normalizeCountry(rawCountry),
    isp: resolved?.isp ?? null,
    userAgent,
    os: detectOperatingSystem(userAgent),
    browser: detectBrowser(userAgent),
  } satisfies IpLookupResponse;

  if (resolvedIp) {
    lookupCache.set(resolvedIp, {
      expiresAt: Date.now() + IP_LOOKUP_TTL_MS,
      value: payload,
    });
  }

  return payload;
}

function sanitizeMode(value: string | undefined): TrafficFlowMode {
  return value === "obfuscated" ? "obfuscated" : "normal";
}

function sanitizeSize(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(128_000, Math.min(MAX_BINARY_SIZE, Math.round(parsed)));
}

function hashSeed(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createObfuscatedBuffer(size: number, seed: string) {
  const buffer = Buffer.allocUnsafe(size);
  let state = hashSeed(seed) || 123456789;

  for (let index = 0; index < size; index += 1) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    buffer[index] = state & 0xff;
  }

  return buffer;
}

function createNormalBuffer(size: number) {
  const pattern = Buffer.from(
    "datasuteis-network-diagnostics-normal-flow|",
    "utf8"
  );
  const buffer = Buffer.alloc(size);

  for (let index = 0; index < size; index += pattern.length) {
    pattern.copy(buffer, index);
  }

  return buffer;
}

async function readRequestBody(req: ApiRequest) {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.byteLength;

    if (totalBytes > MAX_UPLOAD_SIZE) {
      throw new Error("payload_too_large");
    }

    chunks.push(buffer);
  }

  return Buffer.concat(chunks);
}

async function handleIpRequest(req: ApiRequest, res: ApiResponse) {
  try {
    setNoStoreHeaders(res);
    const payload = await resolveIpLookup(req);
    sendJson(res, 200, payload);
  } catch {
    sendJsonError(
      res,
      500,
      "ip_lookup_failed",
      "Não foi possível consultar seus dados de conexão agora. Tente novamente em instantes."
    );
  }
}

function handlePingRequest(req: ApiRequest, res: ApiResponse) {
  setNoStoreHeaders(res);
  sendJson(res, 200, {
    ok: true,
    status: "ok",
    mode: sanitizeMode(getQueryParam(req, "mode")),
    timestamp: Date.now(),
    serverTime: Date.now(),
  });
}

function handleDownloadRequest(req: ApiRequest, res: ApiResponse) {
  const mode = sanitizeMode(getQueryParam(req, "mode"));
  const size = sanitizeSize(getQueryParam(req, "size"), DEFAULT_DOWNLOAD_SIZE);
  const seed = getQueryParam(req, "seed") ?? `${Date.now()}:${mode}:${size}`;
  const payload =
    mode === "obfuscated"
      ? createObfuscatedBuffer(size, seed)
      : createNormalBuffer(size);

  setNoStoreHeaders(res);
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Length", String(payload.byteLength));
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Connection-Test-Mode", mode);
  res.end(payload);
}

async function handleUploadRequest(req: ApiRequest, res: ApiResponse) {
  try {
    const body = await readRequestBody(req);

    setNoStoreHeaders(res);
    sendJson(res, 200, {
      ok: true,
      mode: sanitizeMode(getQueryParam(req, "mode")),
      receivedBytes: body.byteLength,
      timestamp: Date.now(),
      serverTime: Date.now(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "payload_too_large") {
      sendJsonError(
        res,
        413,
        "payload_too_large",
        "O envio de teste excedeu o limite aceito no ambiente local."
      );
      return;
    }

    sendJsonError(
      res,
      500,
      "upload_failed",
      "Não foi possível concluir a medição de upload agora."
    );
  }
}

async function handleConnectionToolRequest(req: ApiRequest, res: ApiResponse) {
  const pathname = getRequestUrl(req).pathname;

  if (!pathname.startsWith("/api/")) {
    return false;
  }

  if (pathname === "/api/ip") {
    if (!["GET", "HEAD"].includes(req.method ?? "GET")) {
      sendJsonError(
        res,
        405,
        "method_not_allowed",
        "Método HTTP não suportado nesta rota."
      );
      return true;
    }

    await handleIpRequest(req, res);
    return true;
  }

  if (pathname === "/api/network/ping") {
    if (!["GET", "HEAD"].includes(req.method ?? "GET")) {
      sendJsonError(
        res,
        405,
        "method_not_allowed",
        "Método HTTP não suportado nesta rota."
      );
      return true;
    }

    handlePingRequest(req, res);
    return true;
  }

  if (pathname === "/api/network/download") {
    if (!["GET", "HEAD"].includes(req.method ?? "GET")) {
      sendJsonError(
        res,
        405,
        "method_not_allowed",
        "Método HTTP não suportado nesta rota."
      );
      return true;
    }

    handleDownloadRequest(req, res);
    return true;
  }

  if (pathname === "/api/network/upload") {
    if (req.method !== "POST") {
      sendJsonError(
        res,
        405,
        "method_not_allowed",
        "Método HTTP não suportado nesta rota."
      );
      return true;
    }

    await handleUploadRequest(req, res);
    return true;
  }

  return false;
}

export function createConnectionToolMiddleware() {
  return (
    req: ApiRequest,
    res: ApiResponse,
    next: (error?: unknown) => void
  ) => {
    void handleConnectionToolRequest(req, res)
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

export function createConnectionToolRouter() {
  return createConnectionToolMiddleware();
}

export function registerConnectionToolRoutes(app: Express) {
  app.use(createConnectionToolMiddleware());
}
