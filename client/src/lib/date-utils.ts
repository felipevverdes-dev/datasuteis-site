import type { SupportedLanguage } from "@/lib/site";

export const PT_MONTH_SLUGS = [
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
] as const;

type LocalizedDatePart = "day" | "month" | "year";
type LocalizedTimePart = "hour" | "minute";

export function clampYear(value: number, fallback = new Date().getFullYear()) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(2100, Math.max(1900, Math.trunc(value)));
}

export function getMonthSlug(month: number) {
  return PT_MONTH_SLUGS[month - 1] ?? PT_MONTH_SLUGS[0];
}

export function getMonthNumberFromSlug(slug: string) {
  const index = PT_MONTH_SLUGS.indexOf(
    slug.toLowerCase() as (typeof PT_MONTH_SLUGS)[number]
  );
  return index >= 0 ? index + 1 : null;
}

export function formatIsoDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function buildDate(year: number, month: number, day: number) {
  return new Date(year, month - 1, day);
}

export function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function getLocalizedDatePlaceholder(language: SupportedLanguage) {
  return language === "en" ? "mm/dd/yyyy" : "dd/mm/aaaa";
}

export function getLocalizedDateInputPattern(language: SupportedLanguage) {
  return language === "en" ? "MM/DD/YYYY" : "DD/MM/AAAA";
}

function getLocalizedDateOrder(
  language: SupportedLanguage
): [LocalizedDatePart, LocalizedDatePart, LocalizedDatePart] {
  return language === "en"
    ? ["month", "day", "year"]
    : ["day", "month", "year"];
}

export function formatLocalizedDateInputValue(
  isoValue: string,
  language: SupportedLanguage
) {
  const date = parseIsoDate(isoValue);
  if (!date) {
    return "";
  }

  const values: Record<LocalizedDatePart, string> = {
    day: String(date.getDate()).padStart(2, "0"),
    month: String(date.getMonth() + 1).padStart(2, "0"),
    year: String(date.getFullYear()),
  };

  return getLocalizedDateOrder(language)
    .map(part => values[part])
    .join("/");
}

export function maskLocalizedDateInput(
  rawValue: string,
  language: SupportedLanguage
) {
  const digits = rawValue.replace(/\D/g, "").slice(0, 8);
  if (!digits) {
    return "";
  }

  const segments = [
    digits.slice(0, 2),
    digits.slice(2, 4),
    digits.slice(4, 8),
  ].filter(Boolean);
  return segments.join("/");
}

export function parseLocalizedDateInput(
  value: string,
  language: SupportedLanguage
) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 8) {
    return null;
  }

  const [first, second, yearDigits] = [
    digits.slice(0, 2),
    digits.slice(2, 4),
    digits.slice(4, 8),
  ];
  const order = getLocalizedDateOrder(language);
  const parts = {
    [order[0]]: Number(first),
    [order[1]]: Number(second),
    [order[2]]: Number(yearDigits),
  } as Record<LocalizedDatePart, number>;

  const year = parts.year;
  const month = parts.month;
  const day = parts.day;

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return formatIsoDate(date);
}

export function getLocalizedTimePlaceholder() {
  return "00:00";
}

export function getLocalizedTimeInputPattern() {
  return "HH:MM";
}

function getLocalizedTimeOrder(): [LocalizedTimePart, LocalizedTimePart] {
  return ["hour", "minute"];
}

export function formatLocalizedTimeInputValue(value: string) {
  const parsed = parseLocalizedTimeInput(value);
  if (!parsed) {
    return "";
  }

  const [hour, minute] = parsed.split(":");
  return getLocalizedTimeOrder()
    .map(part => (part === "hour" ? hour : minute))
    .join(":");
}

export function maskLocalizedTimeInput(rawValue: string) {
  const digits = rawValue.replace(/\D/g, "").slice(0, 4);
  if (!digits) {
    return "";
  }

  const segments = [digits.slice(0, 2), digits.slice(2, 4)].filter(Boolean);
  return segments.join(":");
}

export function parseLocalizedTimeInput(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 4) {
    return null;
  }

  const hour = Number(digits.slice(0, 2));
  const minute = Number(digits.slice(2, 4));

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function getMonthLabel(
  year: number,
  month: number,
  language: SupportedLanguage,
  options: { includeYear?: boolean } = {}
) {
  const locale =
    language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR";
  const formatter = new Intl.DateTimeFormat(locale, {
    month: "long",
    ...(options.includeYear ? { year: "numeric" } : {}),
  });
  const label = formatter.format(new Date(year, month - 1, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function getWeekdayLabel(date: Date, language: SupportedLanguage) {
  const locale =
    language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR";
  return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date);
}

export function getMonthDays(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function shiftMonth(year: number, month: number, amount: number) {
  const date = new Date(year, month - 1 + amount, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function toUtcDayValue(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getCalendarDayDifference(start: Date, end: Date) {
  return Math.round((toUtcDayValue(end) - toUtcDayValue(start)) / 86400000);
}
