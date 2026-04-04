import {
  GLOBAL_MARKETS,
  type GlobalMarketDefinition,
} from "@shared/global-markets";
import {
  getCountryById as getCountryByIdFromDataset,
  getCountryTimezoneOption as getCountryTimezoneOptionFromDataset,
  WORLD_CLOCK_COUNTRIES,
  WORLD_CLOCK_COUNTRY_BY_ID,
  type CountryTimezoneOption,
  type WorldCountryDefinition,
} from "@/lib/world-clock-countries";

export type WorldCountryId = WorldCountryDefinition["id"];

export type { CountryTimezoneOption, WorldCountryDefinition };
export { WORLD_CLOCK_COUNTRIES, WORLD_CLOCK_COUNTRY_BY_ID, GLOBAL_MARKETS };

export interface GlobalMarketQuote {
  marketId: GlobalMarketDefinition["id"];
  currency: string | null;
  price: number | null;
  previousClose: number | null;
  changeAbsolute: number | null;
  changePercent: number | null;
  updatedAt: string | null;
  source: "yahoo" | "unavailable";
}

export interface GlobalMarketsSnapshotResponse {
  updatedAt: string;
  items: GlobalMarketQuote[];
  snapshotStatus: "live" | "stale" | "fallback";
  snapshotNotice?: string | null;
}

const OFFSET_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();
const DATE_TIME_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();
const DATE_PARTS_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

function getFormatter(cacheKey: string, options: Intl.DateTimeFormatOptions) {
  const formatterCache = options.timeZoneName
    ? OFFSET_FORMATTER_CACHE
    : options.weekday
      ? DATE_PARTS_FORMATTER_CACHE
      : DATE_TIME_FORMATTER_CACHE;

  const cached = formatterCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const nextFormatter = new Intl.DateTimeFormat("pt-BR", options);
  formatterCache.set(cacheKey, nextFormatter);
  return nextFormatter;
}

function parseTimeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(part => Number(part));
  return hours * 60 + minutes;
}

function isMinuteInsideWindow(
  value: number,
  window: { start: string; end: string }
) {
  return (
    value >= parseTimeToMinutes(window.start) &&
    value < parseTimeToMinutes(window.end)
  );
}

export function getCountryById(countryId: string) {
  return getCountryByIdFromDataset(countryId);
}

export function getCountryTimezoneOption(
  country: WorldCountryDefinition,
  timezoneId: string | null | undefined
) {
  return getCountryTimezoneOptionFromDataset(country, timezoneId);
}

export function formatZonedTime(
  date: Date,
  timezone: string,
  locale = "pt-BR"
) {
  const cacheKey = `${locale}:${timezone}:time`;
  const formatter =
    DATE_TIME_FORMATTER_CACHE.get(cacheKey) ??
    new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  DATE_TIME_FORMATTER_CACHE.set(cacheKey, formatter);
  return formatter.format(date);
}

export function formatZonedDate(
  date: Date,
  timezone: string,
  locale = "pt-BR"
) {
  const cacheKey = `${locale}:${timezone}:date`;
  const formatter =
    DATE_TIME_FORMATTER_CACHE.get(cacheKey) ??
    new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      weekday: "short",
      day: "2-digit",
      month: "short",
    });

  DATE_TIME_FORMATTER_CACHE.set(cacheKey, formatter);
  return formatter.format(date);
}

export function formatUtcOffset(date: Date, timezone: string) {
  const formatter = getFormatter(`${timezone}:offset`, {
    timeZone: timezone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
  });

  const offsetPart = formatter
    .formatToParts(date)
    .find(part => part.type === "timeZoneName")?.value;

  return offsetPart?.replace("GMT", "UTC") ?? "UTC";
}

export function getTimezoneWeekdayAndMinutes(date: Date, timezone: string) {
  const formatter = getFormatter(`${timezone}:weekday-minutes`, {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const weekdayLabel =
    parts.find(part => part.type === "weekday")?.value ?? "seg.";
  const hour = Number(parts.find(part => part.type === "hour")?.value ?? "0");
  const minute = Number(
    parts.find(part => part.type === "minute")?.value ?? "0"
  );
  const normalizedWeekday = weekdayLabel.toLowerCase();
  const weekday = normalizedWeekday.startsWith("dom")
    ? 0
    : normalizedWeekday.startsWith("seg")
      ? 1
      : normalizedWeekday.startsWith("ter")
        ? 2
        : normalizedWeekday.startsWith("qua")
          ? 3
          : normalizedWeekday.startsWith("qui")
            ? 4
            : normalizedWeekday.startsWith("sex")
              ? 5
              : 6;

  return {
    weekday,
    minutes: hour * 60 + minute,
  };
}

export function formatPopulation(value: number | null, locale = "pt-BR") {
  if (value === null) {
    return "População em atualização";
  }

  return new Intl.NumberFormat(locale).format(value);
}

export function getMarketStatus(
  market: GlobalMarketDefinition,
  date: Date
): "open" | "closed" | "pre" | "post" | "break" {
  const { weekday, minutes } = getTimezoneWeekdayAndMinutes(
    date,
    market.timezone
  );
  if (!market.openWeekdays.includes(weekday)) {
    return "closed";
  }

  if (
    market.breakSessions?.some(window => isMinuteInsideWindow(minutes, window))
  ) {
    return "break";
  }

  if (
    market.regularSessions.some(window => isMinuteInsideWindow(minutes, window))
  ) {
    return "open";
  }

  if (market.preSession && isMinuteInsideWindow(minutes, market.preSession)) {
    return "pre";
  }

  if (market.postSession && isMinuteInsideWindow(minutes, market.postSession)) {
    return "post";
  }

  return "closed";
}
