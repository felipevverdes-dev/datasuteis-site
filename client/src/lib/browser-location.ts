const BROWSER_LOCATION_STORAGE_KEY = "datasuteis_browser_location_v1";

export interface BrowserCoordinates {
  lat: number;
  lon: number;
}

type GeolocationPermissionState =
  | PermissionState
  | "unsupported"
  | "unknown";

function roundCoordinate(value: number) {
  return Math.round(value * 100) / 100;
}

function isBrowserCoordinates(value: unknown): value is BrowserCoordinates {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<BrowserCoordinates>;
  return (
    typeof candidate.lat === "number" &&
    Number.isFinite(candidate.lat) &&
    typeof candidate.lon === "number" &&
    Number.isFinite(candidate.lon)
  );
}

export function readStoredBrowserCoordinates() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(BROWSER_LOCATION_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue);
    return isBrowserCoordinates(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeStoredBrowserCoordinates(coordinates: BrowserCoordinates) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      BROWSER_LOCATION_STORAGE_KEY,
      JSON.stringify(coordinates),
    );
  } catch {
    // Ignore storage failures and keep runtime behavior intact.
  }
}

export async function getBrowserGeolocationPermission() {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return "unsupported" as GeolocationPermissionState;
  }

  if (!("permissions" in navigator) || !navigator.permissions?.query) {
    return "unknown" as GeolocationPermissionState;
  }

  try {
    const status = await navigator.permissions.query({
      name: "geolocation",
    });
    return status.state;
  } catch {
    return "unknown" as GeolocationPermissionState;
  }
}

export function requestBrowserCoordinates(
  options: PositionOptions = {},
): Promise<BrowserCoordinates> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return Promise.reject(new Error("geolocation_unavailable"));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const nextCoordinates = {
          lat: roundCoordinate(position.coords.latitude),
          lon: roundCoordinate(position.coords.longitude),
        };
        writeStoredBrowserCoordinates(nextCoordinates);
        resolve(nextCoordinates);
      },
      error => {
        reject(error);
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 1000 * 60 * 30,
        ...options,
      },
    );
  });
}
