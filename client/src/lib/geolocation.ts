import type { SupportedLanguage } from "@/lib/site";

export type GeoLocationSource = "browser" | "ip" | "fallback";

export interface GeoLocation {
  city: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  source: GeoLocationSource;
}

interface CachedGeoLocationPayload {
  location: GeoLocation;
  timestamp: number;
}

interface IpApiCoResponse {
  city?: unknown;
  region?: unknown;
  country_name?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  error?: unknown;
}

interface IpWhoIsResponse {
  success?: unknown;
  city?: unknown;
  region?: unknown;
  country?: unknown;
  latitude?: unknown;
  longitude?: unknown;
}

interface BigDataCloudResponse {
  city?: unknown;
  locality?: unknown;
  principalSubdivision?: unknown;
  countryName?: unknown;
}

const CACHE_KEY = "datasuteis_geolocation_v1";
const CACHE_TTL = 30 * 60 * 1000;

export const DEFAULT_GEOLOCATION: GeoLocation = {
  city: "Brasília",
  region: "Distrito Federal",
  country: "Brasil",
  lat: -15.7801,
  lon: -47.9292,
  source: "fallback",
};

function getLanguageCode(language?: SupportedLanguage) {
  if (language === "en") {
    return "en";
  }

  if (language === "es") {
    return "es";
  }

  return "pt";
}

function sanitizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseCoordinate(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeGeoLocation(candidate: {
  city?: unknown;
  region?: unknown;
  country?: unknown;
  lat?: unknown;
  lon?: unknown;
  source?: unknown;
}) {
  const lat = parseCoordinate(candidate.lat);
  const lon = parseCoordinate(candidate.lon);
  if (lat === null || lon === null) {
    return null;
  }

  const source =
    candidate.source === "browser" ||
    candidate.source === "ip" ||
    candidate.source === "fallback"
      ? candidate.source
      : "fallback";

  return {
    city: sanitizeText(candidate.city),
    region: sanitizeText(candidate.region),
    country: sanitizeText(candidate.country) || DEFAULT_GEOLOCATION.country,
    lat,
    lon,
    source,
  } satisfies GeoLocation;
}

export function getLocationLabel(location: GeoLocation | null | undefined) {
  if (!location) {
    return `${DEFAULT_GEOLOCATION.city}, ${DEFAULT_GEOLOCATION.region}`;
  }

  if (location.city && location.region) {
    return `${location.city}, ${location.region}`;
  }

  if (location.city) {
    return location.city;
  }

  if (location.region) {
    return location.region;
  }

  return location.country || DEFAULT_GEOLOCATION.country;
}

export function hasDetailedGeoLocation(
  location: GeoLocation | null | undefined
): location is GeoLocation {
  return Boolean(location && (location.city || location.region));
}

export function readCachedGeolocation() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(CACHE_KEY);
    if (!rawValue) {
      return null;
    }

    const payload = JSON.parse(rawValue) as CachedGeoLocationPayload;
    if (
      !payload ||
      typeof payload.timestamp !== "number" ||
      Date.now() - payload.timestamp > CACHE_TTL
    ) {
      window.localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return normalizeGeoLocation(payload.location);
  } catch {
    return null;
  }
}

export function writeCachedGeolocation(location: GeoLocation) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        location,
        timestamp: Date.now(),
      } satisfies CachedGeoLocationPayload)
    );
  } catch {
    // Ignore storage failures and keep runtime behavior intact.
  }
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`request_failed_${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchLocationByIPDirect() {
  try {
    const payload = await fetchJson<IpApiCoResponse>("https://ipapi.co/json/");
    if (
      payload.error ||
      typeof payload.city !== "string" ||
      typeof payload.latitude !== "number" ||
      typeof payload.longitude !== "number"
    ) {
      throw new Error("ipapi_invalid_payload");
    }

    return normalizeGeoLocation({
      city: payload.city,
      region: payload.region,
      country: payload.country_name,
      lat: payload.latitude,
      lon: payload.longitude,
      source: "ip",
    });
  } catch {
    try {
      const payload = await fetchJson<IpWhoIsResponse>("https://ipwho.is/");
      if (
        payload.success !== true ||
        typeof payload.city !== "string" ||
        typeof payload.latitude !== "number" ||
        typeof payload.longitude !== "number"
      ) {
        throw new Error("ipwhois_invalid_payload");
      }

      return normalizeGeoLocation({
        city: payload.city,
        region: payload.region,
        country: payload.country,
        lat: payload.latitude,
        lon: payload.longitude,
        source: "ip",
      });
    } catch {
      return null;
    }
  }
}

export async function reverseGeocodeDirect(
  coordinates: { lat: number; lon: number },
  language?: SupportedLanguage
) {
  try {
    const url = new URL(
      "https://api.bigdatacloud.net/data/reverse-geocode-client"
    );
    url.searchParams.set("latitude", String(coordinates.lat));
    url.searchParams.set("longitude", String(coordinates.lon));
    url.searchParams.set("localityLanguage", getLanguageCode(language));

    const payload = await fetchJson<BigDataCloudResponse>(url.toString());
    return normalizeGeoLocation({
      city: payload.city ?? payload.locality,
      region: payload.principalSubdivision,
      country: payload.countryName,
      lat: coordinates.lat,
      lon: coordinates.lon,
      source: "browser",
    });
  } catch {
    return null;
  }
}
