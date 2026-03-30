import { WidgetApiError, fetchWidgetJson } from "@/lib/home-widgets";
import { getMonthDays } from "@/lib/date-utils";
import { getNationalHolidaysForYear } from "@/lib/holidays";

export interface HolidayStateOption {
  code: string;
  name: string;
  region: string;
  ibgeCode: number;
}

export interface HolidayMunicipalityOption {
  ibgeCode: number;
  name: string;
  stateCode: string;
}

export interface HolidayCalculationWarning {
  code: "state_holidays_unavailable" | "municipal_holidays_unavailable";
  year: number;
  stateCode?: string;
  municipalityCode?: number;
}

export interface AppliedHolidayItem {
  date: string;
  name: string;
  scope: "national" | "state" | "municipal" | "optional";
}

export interface HolidayBreakdown {
  national: number;
  state: number;
  municipal: number;
  optional: number;
  totalUnique: number;
}

export interface BusinessDayCalculationResponse {
  mode: "between" | "add" | "subtract";
  businessDays: number;
  totalDays: number;
  weekends: number;
  holidayDays: number;
  holidayBreakdown: HolidayBreakdown;
  holidays: AppliedHolidayItem[];
  resultDate?: string;
  warnings: HolidayCalculationWarning[];
}

export interface HolidayMonthSnapshotResponse {
  year: number;
  month: number;
  holidayDays: number;
  holidayBreakdown: HolidayBreakdown;
  holidays: AppliedHolidayItem[];
  warnings: HolidayCalculationWarning[];
}

export interface HolidayLocalityResponse {
  countryCode: "BR";
  state: HolidayStateOption | null;
  municipality: HolidayMunicipalityOption | null;
  label: string;
  source: "geolocation" | "ip" | "unavailable";
  isFallback: boolean;
}

interface ItemsResponse<T> {
  items: T[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isHolidayStateOption(value: unknown): value is HolidayStateOption {
  return (
    isRecord(value) &&
    typeof value.code === "string" &&
    typeof value.name === "string" &&
    typeof value.region === "string" &&
    typeof value.ibgeCode === "number"
  );
}

function isHolidayMunicipalityOption(
  value: unknown
): value is HolidayMunicipalityOption {
  return (
    isRecord(value) &&
    typeof value.ibgeCode === "number" &&
    typeof value.name === "string" &&
    typeof value.stateCode === "string"
  );
}

function isHolidayWarning(value: unknown): value is HolidayCalculationWarning {
  return (
    isRecord(value) &&
    (value.code === "state_holidays_unavailable" ||
      value.code === "municipal_holidays_unavailable") &&
    typeof value.year === "number"
  );
}

function isAppliedHolidayItem(value: unknown): value is AppliedHolidayItem {
  return (
    isRecord(value) &&
    typeof value.date === "string" &&
    typeof value.name === "string" &&
    (value.scope === "national" ||
      value.scope === "state" ||
      value.scope === "municipal" ||
      value.scope === "optional")
  );
}

function isHolidayBreakdown(value: unknown): value is HolidayBreakdown {
  return (
    isRecord(value) &&
    typeof value.national === "number" &&
    typeof value.state === "number" &&
    typeof value.municipal === "number" &&
    typeof value.optional === "number" &&
    typeof value.totalUnique === "number"
  );
}

function isItemsResponse<T>(
  value: unknown,
  itemGuard: (item: unknown) => item is T
): value is ItemsResponse<T> {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(itemGuard)
  );
}

function isHolidayMonthSnapshotResponse(
  value: unknown
): value is HolidayMonthSnapshotResponse {
  return (
    isRecord(value) &&
    typeof value.year === "number" &&
    typeof value.month === "number" &&
    typeof value.holidayDays === "number" &&
    isHolidayBreakdown(value.holidayBreakdown) &&
    Array.isArray(value.holidays) &&
    value.holidays.every(isAppliedHolidayItem) &&
    Array.isArray(value.warnings) &&
    value.warnings.every(isHolidayWarning)
  );
}

function buildApiUrl(
  pathname: string,
  params?: Record<string, string | number | boolean | undefined>
) {
  const url = new URL(pathname, window.location.origin);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === "") {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

export async function fetchHolidayStates() {
  const response = await fetchWidgetJson<ItemsResponse<HolidayStateOption>>(
    buildApiUrl("/api/business-days/states")
  );

  if (!isItemsResponse(response, isHolidayStateOption)) {
    throw new WidgetApiError("A API retornou uma lista inválida de estados.", {
      status: 500,
      code: "invalid_shape",
    });
  }

  return response.items;
}

export async function fetchHolidayMunicipalities(stateCode: string) {
  if (!stateCode) {
    return [];
  }

  const response = await fetchWidgetJson<ItemsResponse<HolidayMunicipalityOption>>(
    buildApiUrl("/api/business-days/municipalities", { state: stateCode })
  );

  if (!isItemsResponse(response, isHolidayMunicipalityOption)) {
    throw new WidgetApiError(
      "A API retornou uma lista inválida de municípios.",
      {
        status: 500,
        code: "invalid_shape",
      }
    );
  }

  return response.items;
}

export async function detectHolidayLocality(params?: {
  latitude?: number;
  longitude?: number;
}) {
  return fetchWidgetJson<HolidayLocalityResponse>(
    buildApiUrl("/api/business-days/detect-locality", {
      latitude: params?.latitude,
      longitude: params?.longitude,
    })
  );
}

export async function fetchHolidayMonthSnapshot(params: {
  year: number;
  month: number;
  includeOptionalPoints?: boolean;
  stateCode?: string;
  municipalityCode?: number;
}) {
  const response = await fetchWidgetJson<HolidayMonthSnapshotResponse>(
    buildApiUrl("/api/business-days/month", {
      year: params.year,
      month: params.month,
      includeOptionalPoints: params.includeOptionalPoints,
      state: params.stateCode,
      municipalityCode: params.municipalityCode,
    })
  );

  if (!isHolidayMonthSnapshotResponse(response)) {
    throw new WidgetApiError(
      "A API retornou um mês de feriados em formato inválido.",
      {
        status: 500,
        code: "invalid_shape",
      }
    );
  }

  return response;
}

export function buildNationalHolidayMonthSnapshot(params: {
  year: number;
  month: number;
}) {
  const start = `${params.year}-${String(params.month).padStart(2, "0")}-01`;
  const end = `${params.year}-${String(params.month).padStart(2, "0")}-${String(
    getMonthDays(params.year, params.month)
  ).padStart(2, "0")}`;
  const holidays = getNationalHolidaysForYear(params.year)
    .filter(item => item.date >= start && item.date <= end)
    .map<AppliedHolidayItem>(item => ({
      date: item.date,
      name: item.names.pt,
      scope: "national",
    }));

  return {
    year: params.year,
    month: params.month,
    holidayDays: holidays.length,
    holidayBreakdown: {
      national: holidays.length,
      state: 0,
      municipal: 0,
      optional: 0,
      totalUnique: holidays.length,
    },
    holidays,
    warnings: [],
  } satisfies HolidayMonthSnapshotResponse;
}

export async function calculateBusinessDays(params: {
  mode: "between" | "add" | "subtract";
  start: string;
  end?: string;
  amount?: number;
  considerSaturday: boolean;
  includeOptionalPoints: boolean;
  stateCode?: string;
  municipalityCode?: number;
}) {
  const response = await fetchWidgetJson<BusinessDayCalculationResponse>(
    buildApiUrl("/api/business-days/calculate", {
      mode: params.mode,
      start: params.start,
      end: params.end,
      amount: params.amount,
      considerSaturday: params.considerSaturday,
      includeOptionalPoints: params.includeOptionalPoints,
      state: params.stateCode,
      municipalityCode: params.municipalityCode,
    })
  );

  if (!response || typeof response.businessDays !== "number") {
    throw new WidgetApiError("A API retornou um cálculo inválido.", {
      status: 500,
      code: "invalid_shape",
    });
  }

  return response;
}
