import { formatIsoDate, buildDate, getMonthDays } from "@/lib/date-utils";
import {
  getHolidayContext,
  getHolidayMapForYear,
  getNationalHolidaysForYear,
  type HolidayItem,
} from "@/lib/holidays";

export interface BusinessDayOptions {
  includeOptionalPoints?: boolean;
  considerSaturday?: boolean;
}

export interface BusinessDayRangeResult {
  businessDays: number;
  totalDays: number;
  weekends: number;
  holidays: HolidayItem[];
  holidayCount: number;
}

export interface BusinessDayMonthSummary extends BusinessDayRangeResult {
  year: number;
  month: number;
  monthLabel: string;
  fifthBusinessDay: string | null;
}

export function isWeekend(date: Date, options: BusinessDayOptions = {}) {
  const weekday = date.getDay();
  if (options.considerSaturday) {
    return weekday === 0;
  }
  return weekday === 0 || weekday === 6;
}

export function isBusinessDay(
  date: Date,
  options: BusinessDayOptions = {}
) {
  const iso = formatIsoDate(date);
  const holidayMap = getHolidayMapForYear(date.getFullYear(), {
    includeOptionalPoints: options.includeOptionalPoints,
  });

  return !isWeekend(date, options) && !holidayMap.has(iso);
}

export function getBusinessDayRangeSummary(
  startDate: Date,
  endDate: Date,
  options: BusinessDayOptions = {}
): BusinessDayRangeResult {
  const start = startDate <= endDate ? new Date(startDate) : new Date(endDate);
  const end = startDate <= endDate ? new Date(endDate) : new Date(startDate);
  const holidayContext = getHolidayContext(formatIsoDate(start), formatIsoDate(end), {
    includeOptionalPoints: options.includeOptionalPoints,
  });

  let businessDays = 0;
  let weekends = 0;

  const cursor = new Date(start);
  while (cursor <= end) {
    const iso = formatIsoDate(cursor);
    if (isWeekend(cursor, options)) {
      weekends += 1;
    } else if (!holidayContext.set.has(iso)) {
      businessDays += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const totalDays =
    Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;

  return {
    businessDays,
    totalDays,
    weekends,
    holidays: holidayContext.items,
    holidayCount: holidayContext.count,
  };
}

export function addBusinessDays(
  baseDate: Date,
  amount: number,
  options: BusinessDayOptions = {}
) {
  if (amount <= 0) {
    return new Date(baseDate);
  }

  const cursor = new Date(baseDate);
  let remaining = amount;
  while (remaining > 0) {
    cursor.setDate(cursor.getDate() + 1);
    if (isBusinessDay(cursor, options)) {
      remaining -= 1;
    }
  }

  return cursor;
}

export function subtractBusinessDays(
  baseDate: Date,
  amount: number,
  options: BusinessDayOptions = {}
) {
  if (amount <= 0) {
    return new Date(baseDate);
  }

  const cursor = new Date(baseDate);
  let remaining = amount;
  while (remaining > 0) {
    cursor.setDate(cursor.getDate() - 1);
    if (isBusinessDay(cursor, options)) {
      remaining -= 1;
    }
  }

  return cursor;
}

export function getFifthBusinessDay(
  year: number,
  month: number,
  options: BusinessDayOptions = {}
) {
  const totalDays = getMonthDays(year, month);
  let count = 0;

  for (let day = 1; day <= totalDays; day += 1) {
    const date = buildDate(year, month, day);
    if (isBusinessDay(date, options)) {
      count += 1;
    }
    if (count === 5) {
      return formatIsoDate(date);
    }
  }

  return null;
}

export function getBusinessDayMonthSummary(
  year: number,
  month: number,
  options: BusinessDayOptions = {}
) {
  const start = buildDate(year, month, 1);
  const end = buildDate(year, month, getMonthDays(year, month));
  return {
    year,
    month,
    monthLabel: new Intl.DateTimeFormat("pt-BR", {
      month: "long",
    }).format(start),
    ...getBusinessDayRangeSummary(start, end, options),
    fifthBusinessDay: getFifthBusinessDay(year, month, options),
  } satisfies BusinessDayMonthSummary;
}

export function getBusinessDayYearSummary(
  year: number,
  options: BusinessDayOptions = {}
) {
  const months = Array.from({ length: 12 }, (_, index) =>
    getBusinessDayMonthSummary(year, index + 1, options)
  );

  return {
    year,
    months,
    holidayCount: getNationalHolidaysForYear(year).length,
  };
}
