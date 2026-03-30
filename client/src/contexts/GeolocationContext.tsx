import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { requestBrowserCoordinates } from "@/lib/browser-location";
import {
  DEFAULT_GEOLOCATION,
  fetchLocationByIPDirect,
  hasDetailedGeoLocation,
  readCachedGeolocation,
  reverseGeocodeDirect,
  type GeoLocation,
  writeCachedGeolocation,
} from "@/lib/geolocation";
import { useI18n } from "@/contexts/LanguageContext";

export type GeolocationErrorCode =
  | "denied"
  | "unsupported"
  | "unavailable"
  | null;

interface GeolocationContextValue {
  location: GeoLocation;
  loading: boolean;
  requestingPreciseLocation: boolean;
  error: GeolocationErrorCode;
  requestPreciseLocation: () => Promise<GeoLocation | null>;
}

const fallbackGeolocationContextValue: GeolocationContextValue = {
  location: DEFAULT_GEOLOCATION,
  loading: false,
  requestingPreciseLocation: false,
  error: null,
  requestPreciseLocation: async () => null,
};

const GeolocationContext = createContext<GeolocationContextValue>(
  fallbackGeolocationContextValue
);

function getInitialCachedLocation() {
  return readCachedGeolocation();
}

export function GeolocationProvider({ children }: { children: ReactNode }) {
  const { language } = useI18n();
  const cachedLocation = getInitialCachedLocation();
  const [location, setLocation] = useState<GeoLocation>(
    () => cachedLocation ?? DEFAULT_GEOLOCATION
  );
  const [loading, setLoading] = useState(() => cachedLocation === null);
  const [requestingPreciseLocation, setRequestingPreciseLocation] =
    useState(false);
  const [error, setError] = useState<GeolocationErrorCode>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const cachedLocation = readCachedGeolocation();
      if (cachedLocation) {
        if (!cancelled) {
          setLocation(cachedLocation);
          setLoading(false);
          setError(null);
        }
        return;
      }

      const directIpLocation = await fetchLocationByIPDirect();
      const approximateLocation =
        (hasDetailedGeoLocation(directIpLocation)
          ? directIpLocation
          : directIpLocation ?? DEFAULT_GEOLOCATION);

      if (!cancelled) {
        setLocation(approximateLocation);
        writeCachedGeolocation(approximateLocation);
        setLoading(false);
        setError(null);
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [language]);

  const requestPreciseLocation = useCallback(async () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setError("unsupported");
      return null;
    }

    setRequestingPreciseLocation(true);
    setError(null);

    try {
      const coordinates = await requestBrowserCoordinates({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000 * 60 * 10,
      });

      const directReverseLocation = await reverseGeocodeDirect(
        coordinates,
        language
      );
      const preciseLocation =
        (hasDetailedGeoLocation(directReverseLocation)
          ? directReverseLocation
          : directReverseLocation) ??
        {
          city: "",
          region: "",
          country: DEFAULT_GEOLOCATION.country,
          lat: coordinates.lat,
          lon: coordinates.lon,
          source: "browser" as const,
        };

      setLocation(preciseLocation);
      writeCachedGeolocation(preciseLocation);
      setError(null);
      return preciseLocation;
    } catch (rawError) {
      if (
        rawError &&
        typeof rawError === "object" &&
        "code" in rawError &&
        rawError.code === 1
      ) {
        setError("denied");
      } else {
        setError("unavailable");
      }

      return null;
    } finally {
      setRequestingPreciseLocation(false);
    }
  }, [language]);

  const value = useMemo(
    () => ({
      location,
      loading,
      requestingPreciseLocation,
      error,
      requestPreciseLocation,
    }),
    [error, loading, location, requestPreciseLocation, requestingPreciseLocation]
  );

  return (
    <GeolocationContext.Provider value={value}>
      {children}
    </GeolocationContext.Provider>
  );
}

export function useGeolocation() {
  return useContext(GeolocationContext);
}
