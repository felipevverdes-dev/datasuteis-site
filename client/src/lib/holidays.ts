import type { SupportedLanguage } from "@/lib/site";

export type HolidayLevel = "nacional" | "ponto_facultativo";

export interface HolidayItem {
  date: string;
  names: Record<SupportedLanguage, string>;
  level: HolidayLevel;
}

function createHoliday(
  date: string,
  names: Record<SupportedLanguage, string>,
  level: HolidayLevel
): HolidayItem {
  return { date, names, level };
}

function formatIsoDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
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

function getBrazilObservancesForYear(year: number) {
  const easter = getEasterSunday(year);
  const carnivalMonday = addDays(easter, -48);
  const carnivalTuesday = addDays(easter, -47);
  const ashWednesday = addDays(easter, -46);
  const goodFriday = addDays(easter, -2);
  const corpusChristi = addDays(easter, 60);

  const fixedObservances = [
    createHoliday(
      `${year}-01-01`,
      {
        pt: "Confraternização Universal",
        en: "New Year's Day",
        es: "Año Nuevo",
      },
      "nacional"
    ),
    createHoliday(
      formatIsoDate(carnivalMonday),
      {
        pt: "Carnaval",
        en: "Carnival",
        es: "Carnaval",
      },
      "ponto_facultativo"
    ),
    createHoliday(
      formatIsoDate(carnivalTuesday),
      {
        pt: "Carnaval (terça-feira)",
        en: "Carnival (Tuesday)",
        es: "Carnaval (martes)",
      },
      "ponto_facultativo"
    ),
    createHoliday(
      formatIsoDate(ashWednesday),
      {
        pt: "Quarta-feira de Cinzas (até 14h)",
        en: "Ash Wednesday (until 2 p.m.)",
        es: "Miércoles de Ceniza (hasta las 14 h)",
      },
      "ponto_facultativo"
    ),
    createHoliday(
      formatIsoDate(goodFriday),
      {
        pt: "Sexta-Feira Santa",
        en: "Good Friday",
        es: "Viernes Santo",
      },
      "nacional"
    ),
    createHoliday(
      `${year}-04-21`,
      {
        pt: "Tiradentes",
        en: "Tiradentes Day",
        es: "Día de Tiradentes",
      },
      "nacional"
    ),
    createHoliday(
      `${year}-05-01`,
      {
        pt: "Dia do Trabalho",
        en: "Labor Day",
        es: "Día del Trabajo",
      },
      "nacional"
    ),
    createHoliday(
      formatIsoDate(corpusChristi),
      {
        pt: "Corpus Christi",
        en: "Corpus Christi",
        es: "Corpus Christi",
      },
      "ponto_facultativo"
    ),
    createHoliday(
      `${year}-09-07`,
      {
        pt: "Independência do Brasil",
        en: "Brazil Independence Day",
        es: "Independencia de Brasil",
      },
      "nacional"
    ),
    createHoliday(
      `${year}-10-12`,
      {
        pt: "Nossa Senhora Aparecida",
        en: "Our Lady of Aparecida",
        es: "Nuestra Señora Aparecida",
      },
      "nacional"
    ),
    createHoliday(
      `${year}-11-02`,
      {
        pt: "Finados",
        en: "All Souls' Day",
        es: "Día de los Difuntos",
      },
      "nacional"
    ),
    createHoliday(
      `${year}-11-15`,
      {
        pt: "Proclamação da República",
        en: "Proclamation of the Republic",
        es: "Proclamación de la República",
      },
      "nacional"
    ),
    createHoliday(
      `${year}-11-20`,
      {
        pt: "Dia da Consciência Negra",
        en: "Black Awareness Day",
        es: "Día de la Conciencia Negra",
      },
      "nacional"
    ),
    createHoliday(
      `${year}-12-25`,
      {
        pt: "Natal",
        en: "Christmas",
        es: "Navidad",
      },
      "nacional"
    ),
  ];

  return fixedObservances.sort((left, right) => left.date.localeCompare(right.date));
}

export function getHolidayName(item: HolidayItem, language: SupportedLanguage) {
  return item.names[language] ?? item.names.pt;
}

export function getCalendarObservancesForYear(year: number) {
  return getBrazilObservancesForYear(year);
}

export function getNationalHolidaysForYear(year: number) {
  return getCalendarObservancesForYear(year).filter(item => item.level === "nacional");
}

export function getHolidayMapForYear(
  year: number,
  options: { includeOptionalPoints?: boolean } = {}
) {
  const items = options.includeOptionalPoints
    ? getCalendarObservancesForYear(year)
    : getNationalHolidaysForYear(year);

  return new Map(items.map(item => [item.date, item]));
}

export function getHolidaysInRange(
  startIso: string,
  endIso: string,
  options: { includeOptionalPoints?: boolean } = {}
) {
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  if (!start || !end) {
    return [];
  }

  const safeStart = start <= end ? start : end;
  const safeEnd = start <= end ? end : start;
  const items: HolidayItem[] = [];

  for (
    let year = safeStart.getFullYear();
    year <= safeEnd.getFullYear();
    year += 1
  ) {
    items.push(
      ...(options.includeOptionalPoints
        ? getCalendarObservancesForYear(year)
        : getNationalHolidaysForYear(year))
    );
  }

  const startKey = formatIsoDate(safeStart);
  const endKey = formatIsoDate(safeEnd);
  return items.filter(item => item.date >= startKey && item.date <= endKey);
}

export function getHolidayContext(
  startIso: string,
  endIso: string,
  options: { includeOptionalPoints?: boolean } = {}
) {
  const items = getHolidaysInRange(startIso, endIso, options);
  return {
    start: startIso,
    end: endIso,
    items,
    set: new Set(items.map(item => item.date)),
    count: items.length,
  };
}

export function getNextNationalHoliday(referenceDate = new Date()) {
  for (
    let year = referenceDate.getFullYear();
    year <= referenceDate.getFullYear() + 2;
    year += 1
  ) {
    const next = getNationalHolidaysForYear(year).find(item => {
      const parsed = parseIsoDate(item.date);
      return parsed ? parsed >= new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate()) : false;
    });

    if (next) {
      return next;
    }
  }

  return null;
}

export const OFFICIAL_OBSERVANCES_2026 = getCalendarObservancesForYear(2026);
export const NATIONAL_HOLIDAYS_2026 = getNationalHolidaysForYear(2026);
