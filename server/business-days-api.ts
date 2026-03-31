import type { IncomingMessage, ServerResponse } from "node:http";
import type { Express } from "express";

const REQUEST_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (compatible; DatasUteis/1.0; +https://datasuteis.com.br)",
};

const IBGE_API_BASE_URL = "https://servicodados.ibge.gov.br/api/v1/localidades";
const BRAZIL_HOLIDAY_DATA_BASE_URL =
  "https://raw.githubusercontent.com/joaopbini/feriados-brasil/master/dados/feriados";

const cache = new Map<string, { expiresAt: number; value: unknown }>();

type ApiRequest = IncomingMessage & {
  query?: Record<string, unknown>;
};

type ApiResponse = ServerResponse;

type BusinessDayMode = "between" | "add" | "subtract";
type HolidayScope = "national" | "state" | "municipal" | "optional";

interface IbgeStateResponse {
  id: number;
  sigla: string;
  nome: string;
  regiao?: {
    nome?: string;
  };
}

interface IbgeMunicipalityResponse {
  id: number;
  nome: string;
}

interface ExternalHolidayDatasetItem {
  data: string;
  nome: string;
  tipo: string;
  descricao?: string;
  uf?: string | null;
  codigo_ibge?: number | null;
}

interface ReverseGeocodeResponse {
  address?: Record<string, string | undefined>;
  display_name?: string;
}

interface IpWhoIsResponse {
  success?: boolean;
  city?: string;
  region?: string;
  region_code?: string;
}

interface BrazilStateOption {
  code: string;
  name: string;
  region: string;
  ibgeCode: number;
}

interface BrazilMunicipalityOption {
  ibgeCode: number;
  name: string;
  stateCode: string;
}

interface HolidayItem {
  date: string;
  name: string;
  scope: HolidayScope;
  stateCode: string | null;
  municipalityCode: number | null;
}

interface HolidayListItem {
  date: string;
  name: string;
  scope: HolidayScope;
}

interface HolidayBreakdown {
  national: number;
  state: number;
  municipal: number;
  optional: number;
  totalUnique: number;
}

interface CalculationWarning {
  code: "state_holidays_unavailable" | "municipal_holidays_unavailable";
  year: number;
  stateCode?: string;
  municipalityCode?: number;
}

interface RangeSummary {
  businessDays: number;
  totalDays: number;
  weekends: number;
  holidayBreakdown: HolidayBreakdown;
  holidays: HolidayListItem[];
}

interface HolidayMonthSnapshot {
  year: number;
  month: number;
  holidayBreakdown: HolidayBreakdown;
  holidays: HolidayListItem[];
  holidayDays: number;
  warnings: CalculationWarning[];
}

interface HolidayLocalityResult {
  countryCode: "BR";
  state: BrazilStateOption | null;
  municipality: BrazilMunicipalityOption | null;
  label: string;
  source: "geolocation" | "ip" | "unavailable";
  isFallback: boolean;
}

const BRAZIL_STATE_FALLBACKS = [
  { code: "AC", name: "Acre", region: "Norte", ibgeCode: 12 },
  { code: "AL", name: "Alagoas", region: "Nordeste", ibgeCode: 27 },
  { code: "AP", name: "Amapá", region: "Norte", ibgeCode: 16 },
  { code: "AM", name: "Amazonas", region: "Norte", ibgeCode: 13 },
  { code: "BA", name: "Bahia", region: "Nordeste", ibgeCode: 29 },
  { code: "CE", name: "Ceará", region: "Nordeste", ibgeCode: 23 },
  { code: "DF", name: "Distrito Federal", region: "Centro-Oeste", ibgeCode: 53 },
  { code: "ES", name: "Espírito Santo", region: "Sudeste", ibgeCode: 32 },
  { code: "GO", name: "Goiás", region: "Centro-Oeste", ibgeCode: 52 },
  { code: "MA", name: "Maranhão", region: "Nordeste", ibgeCode: 21 },
  { code: "MT", name: "Mato Grosso", region: "Centro-Oeste", ibgeCode: 51 },
  { code: "MS", name: "Mato Grosso do Sul", region: "Centro-Oeste", ibgeCode: 50 },
  { code: "MG", name: "Minas Gerais", region: "Sudeste", ibgeCode: 31 },
  { code: "PA", name: "Pará", region: "Norte", ibgeCode: 15 },
  { code: "PB", name: "Paraíba", region: "Nordeste", ibgeCode: 25 },
  { code: "PR", name: "Paraná", region: "Sul", ibgeCode: 41 },
  { code: "PE", name: "Pernambuco", region: "Nordeste", ibgeCode: 26 },
  { code: "PI", name: "Piauí", region: "Nordeste", ibgeCode: 22 },
  { code: "RJ", name: "Rio de Janeiro", region: "Sudeste", ibgeCode: 33 },
  { code: "RN", name: "Rio Grande do Norte", region: "Nordeste", ibgeCode: 24 },
  { code: "RS", name: "Rio Grande do Sul", region: "Sul", ibgeCode: 43 },
  { code: "RO", name: "Rondônia", region: "Norte", ibgeCode: 11 },
  { code: "RR", name: "Roraima", region: "Norte", ibgeCode: 14 },
  { code: "SC", name: "Santa Catarina", region: "Sul", ibgeCode: 42 },
  { code: "SP", name: "São Paulo", region: "Sudeste", ibgeCode: 35 },
  { code: "SE", name: "Sergipe", region: "Nordeste", ibgeCode: 28 },
  { code: "TO", name: "Tocantins", region: "Norte", ibgeCode: 17 },
] satisfies BrazilStateOption[];

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

async function fetchJsonDocument<T>(url: string) {
  const response = await fetch(url, { headers: REQUEST_HEADERS });
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`External request failed: ${response.status}`);
  }

  const raw = await response.text();
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error("External request did not return valid JSON");
  }
}

function normalizeComparableValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/gi, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function sanitizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeStateCode(value: string | undefined) {
  if (!value) {
    return "";
  }

  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  return normalized.length === 2 ? normalized : "";
}

function parsePositiveInteger(value: string | undefined) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function parseBoolean(value: string | undefined) {
  if (!value) {
    return false;
  }

  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function parseIsoDate(value: string | undefined) {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatIsoDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function parseBrazilDateToIso(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return formatIsoDate(date);
}

function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function getDayDifference(start: Date, end: Date) {
  const startUtc = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((endUtc - startUtc) / 86400000);
}

function isWeekend(date: Date, considerSaturday: boolean) {
  const day = date.getDay();
  if (considerSaturday) {
    return day === 0;
  }

  return day === 0 || day === 6;
}

function createHoliday(
  date: string,
  name: string,
  scope: HolidayScope,
  stateCode: string | null = null,
  municipalityCode: number | null = null
): HolidayItem {
  return {
    date,
    name,
    scope,
    stateCode,
    municipalityCode,
  };
}

function getEasterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getNationalHolidayItems(year: number) {
  const easter = getEasterSunday(year);
  const goodFriday = addDays(easter, -2);

  return [
    createHoliday(`${year}-01-01`, "Confraternização Universal", "national"),
    createHoliday(formatIsoDate(goodFriday), "Sexta-Feira Santa", "national"),
    createHoliday(`${year}-04-21`, "Tiradentes", "national"),
    createHoliday(`${year}-05-01`, "Dia do Trabalho", "national"),
    createHoliday(`${year}-09-07`, "Independência do Brasil", "national"),
    createHoliday(`${year}-10-12`, "Nossa Senhora Aparecida", "national"),
    createHoliday(`${year}-11-02`, "Finados", "national"),
    createHoliday(`${year}-11-15`, "Proclamação da República", "national"),
    createHoliday(`${year}-11-20`, "Dia da Consciência Negra", "national"),
    createHoliday(`${year}-12-25`, "Natal", "national"),
  ];
}

function getNationalOptionalHolidayItems(year: number) {
  const easter = getEasterSunday(year);
  const carnivalMonday = addDays(easter, -48);
  const carnivalTuesday = addDays(easter, -47);
  const ashWednesday = addDays(easter, -46);
  const corpusChristi = addDays(easter, 60);

  return [
    createHoliday(formatIsoDate(carnivalMonday), "Carnaval", "optional"),
    createHoliday(
      formatIsoDate(carnivalTuesday),
      "Carnaval (terça-feira)",
      "optional"
    ),
    createHoliday(
      formatIsoDate(ashWednesday),
      "Quarta-feira de Cinzas (até 14h)",
      "optional"
    ),
    createHoliday(formatIsoDate(corpusChristi), "Corpus Christi", "optional"),
  ];
}

async function getBrazilStates() {
  return getCached(
    "business-days:states",
    1000 * 60 * 60 * 24 * 7,
    async () => {
      try {
        const data = await fetchJson<IbgeStateResponse[]>(
          `${IBGE_API_BASE_URL}/estados`
        );
        return data
          .map(item => ({
            code: item.sigla,
            name: item.nome,
            region: item.regiao?.nome ?? "",
            ibgeCode: item.id,
          }))
          .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
      } catch {
        return BRAZIL_STATE_FALLBACKS;
      }
    }
  );
}

async function getBrazilMunicipalitiesByState(stateCode: string) {
  return getCached(
    `business-days:municipalities:${stateCode}`,
    1000 * 60 * 60 * 24 * 7,
    async () => {
      const url = `${IBGE_API_BASE_URL}/estados/${stateCode}/municipios`;
      const data = await fetchJson<IbgeMunicipalityResponse[]>(url);
      return data
        .map(item => ({
          ibgeCode: item.id,
          name: item.nome,
          stateCode,
        }))
        .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
    }
  );
}

async function getLocalHolidayDataset(
  scope: "state" | "municipal",
  year: number
) {
  const cacheKey = `business-days:${scope}:holidays:${year}`;
  return getCached(cacheKey, 1000 * 60 * 60 * 12, async () => {
    const folder = scope === "state" ? "estadual" : "municipal";
    const url = `${BRAZIL_HOLIDAY_DATA_BASE_URL}/${folder}/json/${year}.json`;
    const payload = await fetchJsonDocument<ExternalHolidayDatasetItem[]>(url);
    return payload;
  });
}

function normalizeExternalHolidayItem(
  item: ExternalHolidayDatasetItem,
  scope: "state" | "municipal"
) {
  const isoDate = parseBrazilDateToIso(item.data);
  if (!isoDate) {
    return null;
  }

  return createHoliday(
    isoDate,
    item.nome || "Feriado",
    scope,
    item.uf?.trim().toUpperCase() || null,
    typeof item.codigo_ibge === "number" ? item.codigo_ibge : null
  );
}

class HolidayProvider {
  private readonly yearItems = new Map<number, Promise<HolidayItem[]>>();
  private readonly yearMaps = new Map<
    number,
    Promise<Map<string, HolidayItem[]>>
  >();
  private readonly warningKeys = new Set<string>();
  readonly warnings: CalculationWarning[] = [];

  constructor(
    private readonly stateCode: string,
    private readonly municipalityCode: number | undefined,
    private readonly includeOptionalPoints: boolean
  ) {}

  private pushWarning(warning: CalculationWarning) {
    const key = `${warning.code}:${warning.year}:${warning.stateCode ?? ""}:${warning.municipalityCode ?? ""}`;
    if (this.warningKeys.has(key)) {
      return;
    }

    this.warningKeys.add(key);
    this.warnings.push(warning);
  }

  async getYearItems(year: number) {
    const existing = this.yearItems.get(year);
    if (existing) {
      return existing;
    }

    const promise = this.loadYearItems(year);
    this.yearItems.set(year, promise);
    return promise;
  }

  async getYearMap(year: number) {
    const existing = this.yearMaps.get(year);
    if (existing) {
      return existing;
    }

    const promise = this.getYearItems(year).then(items => {
      const map = new Map<string, HolidayItem[]>();
      for (const item of items) {
        const current = map.get(item.date);
        if (current) {
          current.push(item);
        } else {
          map.set(item.date, [item]);
        }
      }
      return map;
    });

    this.yearMaps.set(year, promise);
    return promise;
  }

  private async loadYearItems(year: number) {
    const items: HolidayItem[] = [
      ...getNationalHolidayItems(year),
      ...(this.includeOptionalPoints
        ? getNationalOptionalHolidayItems(year)
        : []),
    ];

    if (this.stateCode) {
      const stateDataset = await getLocalHolidayDataset("state", year);
      if (stateDataset === null) {
        this.pushWarning({
          code: "state_holidays_unavailable",
          year,
          stateCode: this.stateCode,
        });
      } else {
        items.push(
          ...stateDataset
            .map(item => normalizeExternalHolidayItem(item, "state"))
            .filter((item): item is HolidayItem => Boolean(item))
            .filter(item => item.stateCode === this.stateCode)
        );
      }
    }

    if (this.municipalityCode) {
      const municipalDataset = await getLocalHolidayDataset("municipal", year);
      if (municipalDataset === null) {
        this.pushWarning({
          code: "municipal_holidays_unavailable",
          year,
          stateCode: this.stateCode || undefined,
          municipalityCode: this.municipalityCode,
        });
      } else {
        items.push(
          ...municipalDataset
            .map(item => normalizeExternalHolidayItem(item, "municipal"))
            .filter((item): item is HolidayItem => Boolean(item))
            .filter(item => item.municipalityCode === this.municipalityCode)
        );
      }
    }

    const uniqueItems = new Map<string, HolidayItem>();
    for (const item of items) {
      const key = [
        item.date,
        item.scope,
        item.name,
        item.stateCode ?? "",
        item.municipalityCode ?? "",
      ].join("|");
      uniqueItems.set(key, item);
    }

    return Array.from(uniqueItems.values()).sort((left, right) =>
      left.date.localeCompare(right.date)
    );
  }
}

function buildHolidayBreakdown(items: HolidayItem[]) {
  const nationalDates = new Set<string>();
  const stateDates = new Set<string>();
  const municipalDates = new Set<string>();
  const optionalDates = new Set<string>();
  const totalHolidayDates = new Set<string>();

  for (const item of items) {
    totalHolidayDates.add(item.date);
    if (item.scope === "national") {
      nationalDates.add(item.date);
    } else if (item.scope === "state") {
      stateDates.add(item.date);
    } else if (item.scope === "municipal") {
      municipalDates.add(item.date);
    } else if (item.scope === "optional") {
      optionalDates.add(item.date);
    }
  }

  return {
    national: nationalDates.size,
    state: stateDates.size,
    municipal: municipalDates.size,
    optional: optionalDates.size,
    totalUnique: totalHolidayDates.size,
  } satisfies HolidayBreakdown;
}

function normalizeIpAddress(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  return normalized.startsWith("::ffff:") ? normalized.slice(7) : normalized;
}

function isPrivateIpAddress(ip: string) {
  return (
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
    ip.startsWith("fc") ||
    ip.startsWith("fd")
  );
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

async function findStateByCodeOrName(
  stateCode: string,
  stateName: string
): Promise<BrazilStateOption | null> {
  const states = await getBrazilStates();
  const normalizedCode = sanitizeStateCode(stateCode);
  if (normalizedCode) {
    const match = states.find(item => item.code === normalizedCode);
    if (match) {
      return match;
    }
  }

  const normalizedName = normalizeComparableValue(stateName);
  if (!normalizedName) {
    return null;
  }

  return (
    states.find(item => normalizeComparableValue(item.name) === normalizedName) ??
    null
  );
}

function findMunicipalityByName(
  municipalities: BrazilMunicipalityOption[],
  cityName: string
) {
  const normalizedCity = normalizeComparableValue(cityName);
  if (!normalizedCity) {
    return null;
  }

  return (
    municipalities.find(
      item => normalizeComparableValue(item.name) === normalizedCity
    ) ??
    municipalities.find(item =>
      normalizeComparableValue(item.name).startsWith(normalizedCity)
    ) ??
    municipalities.find(item =>
      normalizedCity.startsWith(normalizeComparableValue(item.name))
    ) ??
    null
  );
}

async function reverseGeocodeCoordinates(latitude: number, longitude: number) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("zoom", "10");
  url.searchParams.set("addressdetails", "1");

  const data = await fetchJson<ReverseGeocodeResponse>(url.toString());
  const address = data.address ?? {};
  const city = sanitizeText(
    address.city ??
      address.town ??
      address.village ??
      address.municipality ??
      address.county ??
      address.suburb
  );
  const stateName = sanitizeText(address.state ?? address.region);
  const isoCode = sanitizeText(address["ISO3166-2-lvl4"]);
  const stateCode = sanitizeStateCode(isoCode.split("-")[1]);

  if (!city && !stateName && !stateCode) {
    return null;
  }

  return {
    city,
    stateName,
    stateCode,
    label:
      [city, stateCode || stateName].filter(Boolean).join(", ") ||
      sanitizeText(data.display_name) ||
      "Brasil",
    source: "geolocation" as const,
    isFallback: false,
  };
}

async function resolveLocationFromIp(req: ApiRequest) {
  const clientIp = getClientIp(req);
  if (!clientIp) {
    return null;
  }

  const response = await fetchJson<IpWhoIsResponse>(
    `https://ipwho.is/${encodeURIComponent(clientIp)}`
  );

  if (!response?.success) {
    return null;
  }

  const city = sanitizeText(response.city);
  const stateName = sanitizeText(response.region);
  const stateCode = sanitizeStateCode(response.region_code);

  if (!city && !stateName && !stateCode) {
    return null;
  }

  return {
    city,
    stateName,
    stateCode,
    label: [city, stateCode || stateName].filter(Boolean).join(", ") || "Brasil",
    source: "ip" as const,
    isFallback: true,
  };
}

async function isBusinessDay(
  date: Date,
  provider: HolidayProvider,
  considerSaturday: boolean
) {
  if (isWeekend(date, considerSaturday)) {
    return false;
  }

  const holidayMap = await provider.getYearMap(date.getFullYear());
  return !holidayMap.has(formatIsoDate(date));
}

async function addBusinessDays(
  startDate: Date,
  amount: number,
  provider: HolidayProvider,
  considerSaturday: boolean
) {
  if (amount <= 0) {
    return new Date(startDate);
  }

  const cursor = new Date(startDate);
  let remaining = amount;

  while (remaining > 0) {
    cursor.setDate(cursor.getDate() + 1);
    if (await isBusinessDay(cursor, provider, considerSaturday)) {
      remaining -= 1;
    }
  }

  return cursor;
}

async function subtractBusinessDays(
  startDate: Date,
  amount: number,
  provider: HolidayProvider,
  considerSaturday: boolean
) {
  if (amount <= 0) {
    return new Date(startDate);
  }

  const cursor = new Date(startDate);
  let remaining = amount;

  while (remaining > 0) {
    cursor.setDate(cursor.getDate() - 1);
    if (await isBusinessDay(cursor, provider, considerSaturday)) {
      remaining -= 1;
    }
  }

  return cursor;
}

async function summarizeRange(
  startDate: Date | null,
  endDate: Date | null,
  provider: HolidayProvider,
  considerSaturday: boolean
): Promise<RangeSummary> {
  if (!startDate || !endDate || startDate > endDate) {
    return {
      businessDays: 0,
      totalDays: 0,
      weekends: 0,
      holidayBreakdown: {
        national: 0,
        state: 0,
        municipal: 0,
        optional: 0,
        totalUnique: 0,
      },
      holidays: [],
    };
  }

  const holidayMaps = new Map<number, Map<string, HolidayItem[]>>();
  for (
    let year = startDate.getFullYear();
    year <= endDate.getFullYear();
    year += 1
  ) {
    holidayMaps.set(year, await provider.getYearMap(year));
  }

  let businessDays = 0;
  let weekends = 0;
  const nationalDates = new Set<string>();
  const stateDates = new Set<string>();
  const municipalDates = new Set<string>();
  const optionalDates = new Set<string>();
  const totalHolidayDates = new Set<string>();
  const listedHolidayItems = new Map<string, HolidayListItem>();

  for (
    const cursor = new Date(startDate);
    cursor <= endDate;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    const isoDate = formatIsoDate(cursor);

    if (isWeekend(cursor, considerSaturday)) {
      weekends += 1;
      continue;
    }

    const items = holidayMaps.get(cursor.getFullYear())?.get(isoDate) ?? [];
    if (!items.length) {
      businessDays += 1;
      continue;
    }

    totalHolidayDates.add(isoDate);
    for (const item of items) {
      const itemKey = `${item.date}|${item.scope}|${item.name}`;
      listedHolidayItems.set(itemKey, {
        date: item.date,
        name: item.name,
        scope: item.scope,
      });

      if (item.scope === "national") {
        nationalDates.add(isoDate);
      } else if (item.scope === "state") {
        stateDates.add(isoDate);
      } else if (item.scope === "municipal") {
        municipalDates.add(isoDate);
      } else if (item.scope === "optional") {
        optionalDates.add(isoDate);
      }
    }
  }

  return {
    businessDays,
    totalDays: getDayDifference(startDate, endDate) + 1,
    weekends,
    holidayBreakdown: {
      national: nationalDates.size,
      state: stateDates.size,
      municipal: municipalDates.size,
      optional: optionalDates.size,
      totalUnique: totalHolidayDates.size,
    },
    holidays: Array.from(listedHolidayItems.values()).sort((left, right) => {
      if (left.date !== right.date) {
        return left.date.localeCompare(right.date);
      }

      return left.name.localeCompare(right.name, "pt-BR");
    }),
  };
}

async function getHolidayMonthSnapshot(params: {
  year: number;
  month: number;
  includeOptionalPoints: boolean;
  stateCode: string;
  municipalityCode?: number;
}) {
  const year = Math.min(2100, Math.max(1900, Math.trunc(params.year)));
  const month = Math.min(12, Math.max(1, Math.trunc(params.month)));
  const provider = new HolidayProvider(
    params.stateCode,
    params.municipalityCode,
    params.includeOptionalPoints
  );
  const items = (await provider.getYearItems(year)).filter(item =>
    item.date.startsWith(`${year}-${String(month).padStart(2, "0")}-`)
  );

  const holidays = items
    .map(item => ({
      date: item.date,
      name: item.name,
      scope: item.scope,
    }))
    .sort((left, right) =>
      left.date !== right.date
        ? left.date.localeCompare(right.date)
        : left.name.localeCompare(right.name, "pt-BR")
    );
  const holidayBreakdown = buildHolidayBreakdown(items);

  return {
    year,
    month,
    holidayBreakdown,
    holidays,
    holidayDays: holidayBreakdown.totalUnique,
    warnings: provider.warnings,
  } satisfies HolidayMonthSnapshot;
}

async function detectHolidayLocality(
  req: ApiRequest,
  latitude?: number,
  longitude?: number
): Promise<HolidayLocalityResult> {
  let resolved:
    | {
        city: string;
        stateName: string;
        stateCode: string;
        label: string;
        source: "geolocation" | "ip";
        isFallback: boolean;
      }
    | null = null;

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    try {
      resolved = await reverseGeocodeCoordinates(latitude!, longitude!);
    } catch {
      resolved = null;
    }
  }

  if (!resolved) {
    try {
      resolved = await resolveLocationFromIp(req);
    } catch {
      resolved = null;
    }
  }

  if (!resolved) {
    return {
      countryCode: "BR",
      state: null,
      municipality: null,
      label: "Brasil",
      source: "unavailable",
      isFallback: true,
    };
  }

  const state = await findStateByCodeOrName(
    resolved.stateCode,
    resolved.stateName
  );
  let municipality: BrazilMunicipalityOption | null = null;

  if (state && resolved.city) {
    try {
      municipality = findMunicipalityByName(
        await getBrazilMunicipalitiesByState(state.code),
        resolved.city
      );
    } catch {
      municipality = null;
    }
  }

  return {
    countryCode: "BR",
    state,
    municipality,
    label: municipality
      ? `${municipality.name}, ${state?.code ?? resolved.stateCode}`
      : state
        ? state.name
        : resolved.label,
    source: resolved.source,
    isFallback: resolved.isFallback,
  };
}

async function handleStatesRequest(res: ApiResponse) {
  try {
    const items = await getBrazilStates();
    setApiCache(res, 86400);
    sendJson(res, 200, {
      ok: true,
      items,
    });
  } catch {
    sendJsonError(
      res,
      502,
      "states_unavailable",
      "Não foi possível carregar a lista de estados agora."
    );
  }
}

async function handleMunicipalitiesRequest(req: ApiRequest, res: ApiResponse) {
  const stateCode = sanitizeStateCode(getQueryParam(req, "state"));
  if (!stateCode) {
    sendJsonError(
      res,
      400,
      "invalid_state",
      "Selecione um estado válido para carregar os municípios."
    );
    return;
  }

  try {
    const items = await getBrazilMunicipalitiesByState(stateCode);
    setApiCache(res, 86400);
    sendJson(res, 200, {
      ok: true,
      items,
    });
  } catch {
    sendJsonError(
      res,
      502,
      "municipalities_unavailable",
      "Não foi possível carregar os municípios agora."
    );
  }
}

async function handleCalculationRequest(req: ApiRequest, res: ApiResponse) {
  const modeParam = getQueryParam(req, "mode");
  const mode: BusinessDayMode =
    modeParam === "add" || modeParam === "subtract" || modeParam === "between"
      ? modeParam
      : "between";
  const startDate = parseIsoDate(getQueryParam(req, "start"));
  const endDate = parseIsoDate(getQueryParam(req, "end"));
  const amount = Math.max(0, Number(getQueryParam(req, "amount")) || 0);
  const considerSaturday = parseBoolean(getQueryParam(req, "considerSaturday"));
  const includeOptionalPoints = parseBoolean(
    getQueryParam(req, "includeOptionalPoints")
  );
  const stateCode = sanitizeStateCode(getQueryParam(req, "state"));
  const municipalityCode = parsePositiveInteger(
    getQueryParam(req, "municipalityCode")
  );

  if (!startDate) {
    sendJsonError(
      res,
      400,
      "invalid_start_date",
      "Informe uma data inicial válida no formato YYYY-MM-DD."
    );
    return;
  }

  if (mode === "between" && !endDate) {
    sendJsonError(
      res,
      400,
      "invalid_end_date",
      "Informe uma data final válida no formato YYYY-MM-DD."
    );
    return;
  }

  try {
    const provider = new HolidayProvider(
      stateCode,
      municipalityCode,
      includeOptionalPoints
    );

    if (mode === "between" && endDate) {
      const rangeStart = startDate <= endDate ? startDate : endDate;
      const rangeEnd = startDate <= endDate ? endDate : startDate;
      const summary = await summarizeRange(
        rangeStart,
        rangeEnd,
        provider,
        considerSaturday
      );
      setApiCache(res, 300);
      sendJson(res, 200, {
        ok: true,
        mode,
        ...summary,
        holidayDays: summary.holidayBreakdown.totalUnique,
        warnings: provider.warnings,
      });
      return;
    }

    const resultDate =
      mode === "add"
        ? await addBusinessDays(startDate, amount, provider, considerSaturday)
        : await subtractBusinessDays(
            startDate,
            amount,
            provider,
            considerSaturday
          );

    const traversalRange =
      amount > 0
        ? mode === "add"
          ? {
              start: addDays(startDate, 1),
              end: resultDate,
            }
          : {
              start: resultDate,
              end: addDays(startDate, -1),
            }
        : null;

    const summary = await summarizeRange(
      traversalRange?.start ?? null,
      traversalRange?.end ?? null,
      provider,
      considerSaturday
    );

    setApiCache(res, 300);
    sendJson(res, 200, {
      ok: true,
      mode,
      ...summary,
      holidayDays: summary.holidayBreakdown.totalUnique,
      resultDate: formatIsoDate(resultDate),
      warnings: provider.warnings,
    });
  } catch {
    sendJsonError(
      res,
      502,
      "holiday_data_unavailable",
      "Não foi possível calcular com a base de feriados locais agora."
    );
  }
}

async function handleMonthRequest(req: ApiRequest, res: ApiResponse) {
  const year = Number(getQueryParam(req, "year")) || new Date().getFullYear();
  const month = Number(getQueryParam(req, "month")) || new Date().getMonth() + 1;
  const includeOptionalPoints = parseBoolean(
    getQueryParam(req, "includeOptionalPoints")
  );
  const stateCode = sanitizeStateCode(getQueryParam(req, "state"));
  const municipalityCode = parsePositiveInteger(
    getQueryParam(req, "municipalityCode")
  );

  try {
    const snapshot = await getHolidayMonthSnapshot({
      year,
      month,
      includeOptionalPoints,
      stateCode,
      municipalityCode,
    });
    setApiCache(res, 900);
    sendJson(res, 200, {
      ok: true,
      ...snapshot,
    });
  } catch {
    sendJsonError(
      res,
      502,
      "month_holidays_unavailable",
      "Não foi possível carregar os feriados deste mês agora."
    );
  }
}

async function handleDetectLocalityRequest(req: ApiRequest, res: ApiResponse) {
  const latitude = Number(getQueryParam(req, "latitude"));
  const longitude = Number(getQueryParam(req, "longitude"));

  try {
    const locality = await detectHolidayLocality(
      req,
      Number.isFinite(latitude) ? latitude : undefined,
      Number.isFinite(longitude) ? longitude : undefined
    );
    setApiCache(res, 900);
    sendJson(res, 200, {
      ok: true,
      ...locality,
    });
  } catch {
    sendJsonError(
      res,
      502,
      "locality_unavailable",
      "Não foi possível detectar a localidade agora."
    );
  }
}

async function handleBusinessDayApiRequest(req: ApiRequest, res: ApiResponse) {
  const pathname = getRequestUrl(req).pathname;
  if (!pathname.startsWith("/api/business-days")) {
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

  if (pathname === "/api/business-days/states") {
    await handleStatesRequest(res);
    return true;
  }

  if (pathname === "/api/business-days/municipalities") {
    await handleMunicipalitiesRequest(req, res);
    return true;
  }

  if (pathname === "/api/business-days/calculate") {
    await handleCalculationRequest(req, res);
    return true;
  }

  if (pathname === "/api/business-days/month") {
    await handleMonthRequest(req, res);
    return true;
  }

  if (pathname === "/api/business-days/detect-locality") {
    await handleDetectLocalityRequest(req, res);
    return true;
  }

  sendJsonError(res, 404, "api_not_found", "Rota de API não encontrada.");
  return true;
}

export function createBusinessDayApiMiddleware() {
  return (
    req: ApiRequest,
    res: ApiResponse,
    next: (error?: unknown) => void
  ) => {
    void handleBusinessDayApiRequest(req, res)
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

export function createBusinessDayApiRouter() {
  return createBusinessDayApiMiddleware();
}

export function registerBusinessDayApiRoutes(app: Express) {
  app.use(createBusinessDayApiMiddleware());
}
