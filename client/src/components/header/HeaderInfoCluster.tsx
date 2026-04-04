import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Cloud, DollarSign, LocateFixed } from "lucide-react";
import { useGeolocation } from "@/contexts/GeolocationContext";
import type { GeoLocation } from "@/lib/geolocation";
import {
  fetchMarketOverviewSnapshot,
  fetchWeatherSnapshot,
  formatTemperature,
  getBrlPairRate,
  type MarketOverviewResponse,
  type WeatherSnapshotResponse,
} from "@/lib/home-widgets";
import { scheduleWhenIdle } from "@/lib/idle";
import { useI18n } from "@/contexts/LanguageContext";
import { getWeatherIcon, getWeatherLabel } from "@/lib/weather-display";
import type { SupportedLanguage } from "@/lib/site";

interface HeaderInfoClusterProps {
  mode: "desktop" | "mobile";
  data: ReturnType<typeof useHeaderInfoClusterData>;
  onClick?: () => void;
}

const BRAZIL_REGION_ABBREVIATIONS: Record<string, string> = {
  acre: "AC",
  alagoas: "AL",
  amapa: "AP",
  amazonas: "AM",
  bahia: "BA",
  ceara: "CE",
  "distrito federal": "DF",
  "espirito santo": "ES",
  goias: "GO",
  maranhao: "MA",
  "mato grosso": "MT",
  "mato grosso do sul": "MS",
  "minas gerais": "MG",
  para: "PA",
  paraiba: "PB",
  parana: "PR",
  pernambuco: "PE",
  piaui: "PI",
  "rio de janeiro": "RJ",
  "rio grande do norte": "RN",
  "rio grande do sul": "RS",
  rondonia: "RO",
  roraima: "RR",
  "santa catarina": "SC",
  "sao paulo": "SP",
  sergipe: "SE",
  tocantins: "TO",
};

const SKELETON_BAR_CLASS_NAME = "animate-pulse rounded-full bg-secondary/85";

const COPY: Record<
  SupportedLanguage,
  {
    locationUnavailable: string;
    weatherUnavailable: string;
    weatherFallbackValue: string;
    exchangeUnavailable: string;
    weatherTitle: string;
    ratesTitle: string;
    usePreciseLocation: string;
    preciseLocationLoading: string;
  }
> = {
  pt: {
    locationUnavailable: "Localização indisponível",
    weatherUnavailable: "Clima indisponível",
    weatherFallbackValue: "--°",
    exchangeUnavailable: "Câmbio indisponível",
    weatherTitle: "Clima",
    ratesTitle: "Cotações",
    usePreciseLocation: "Usar minha localização",
    preciseLocationLoading: "Localizando...",
  },
  en: {
    locationUnavailable: "Location unavailable",
    weatherUnavailable: "Weather unavailable",
    weatherFallbackValue: "--°",
    exchangeUnavailable: "Exchange unavailable",
    weatherTitle: "Weather",
    ratesTitle: "Rates",
    usePreciseLocation: "Use my location",
    preciseLocationLoading: "Locating...",
  },
  es: {
    locationUnavailable: "Ubicación no disponible",
    weatherUnavailable: "Clima no disponible",
    weatherFallbackValue: "--°",
    exchangeUnavailable: "Cambio no disponible",
    weatherTitle: "Clima",
    ratesTitle: "Cotizaciones",
    usePreciseLocation: "Usar mi ubicación",
    preciseLocationLoading: "Localizando...",
  },
};

function normalizeRegionalKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^(state of|estado do|estado da|estado de)\s+/i, "")
    .trim()
    .toLowerCase();
}

function isBrazilCountry(value: string | undefined) {
  const normalized = (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  return (
    normalized === "brasil" || normalized === "brazil" || normalized === "br"
  );
}

function abbreviateRegionLabel(
  region: string | undefined,
  country: string | undefined
) {
  const trimmedRegion = region?.trim() ?? "";
  if (!trimmedRegion) {
    return "";
  }

  if (!isBrazilCountry(country)) {
    return trimmedRegion;
  }

  if (/^[A-Za-z]{2}$/.test(trimmedRegion)) {
    return trimmedRegion.toUpperCase();
  }

  return (
    BRAZIL_REGION_ABBREVIATIONS[normalizeRegionalKey(trimmedRegion)] ??
    trimmedRegion
  );
}

function getCompactLocationLabel(location: GeoLocation, fallback: string) {
  const city = location.city.trim();
  const region = abbreviateRegionLabel(location.region, location.country);

  if (city && region) {
    return `${city}, ${region}`;
  }

  if (city) {
    return city;
  }

  if (region) {
    return region;
  }

  return location.country.trim() || fallback;
}

function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function isNightInTimezone(timezone: string | undefined) {
  if (!timezone) {
    return false;
  }

  try {
    const hourText = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hour12: false,
      timeZone: timezone,
    }).format(new Date());
    const hour = Number(hourText);
    return Number.isFinite(hour) && (hour < 6 || hour >= 18);
  } catch {
    return false;
  }
}

function buildWeatherRequest(
  language: SupportedLanguage,
  coordinates?: { lat: number; lon: number }
) {
  return fetchWeatherSnapshot(language, {
    timezone: getTimezone(),
    coordinates,
  });
}

function formatCompactRate(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function useHeaderInfoClusterData() {
  const { language, dateLocale } = useI18n();
  const {
    location,
    loading: geolocationLoading,
    requestingPreciseLocation,
    requestPreciseLocation,
  } = useGeolocation();
  const copy = COPY[language] ?? COPY.pt;
  const [weather, setWeather] = useState<WeatherSnapshotResponse | null>(null);
  const [overview, setOverview] = useState<MarketOverviewResponse | null>(null);
  const [weatherLoaded, setWeatherLoaded] = useState(false);
  const [overviewLoaded, setOverviewLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      try {
        const payload = await fetchMarketOverviewSnapshot();
        if (!cancelled) {
          setOverview(payload);
        }
      } catch {
        if (!cancelled) {
          setOverview(null);
        }
      } finally {
        if (!cancelled) {
          setOverviewLoaded(true);
        }
      }
    }

    const cleanup = scheduleWhenIdle(() => {
      void loadOverview();
    });
    const intervalId = window.setInterval(
      () => {
        if (document.visibilityState === "visible") {
          void loadOverview();
        }
      },
      1000 * 60 * 15
    );

    return () => {
      cancelled = true;
      cleanup();
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (geolocationLoading) {
      return;
    }

    let cancelled = false;

    async function loadWeather() {
      try {
        const payload = await buildWeatherRequest(language, {
          lat: location.lat,
          lon: location.lon,
        });
        if (!cancelled) {
          setWeather(payload);
        }
      } catch {
        if (!cancelled) {
          setWeather(null);
        }
      } finally {
        if (!cancelled) {
          setWeatherLoaded(true);
        }
      }
    }

    function triggerLoad() {
      setWeatherLoaded(false);
      void loadWeather();
    }

    const cleanup = scheduleWhenIdle(() => {
      triggerLoad();
    });
    const intervalId = window.setInterval(
      () => {
        if (document.visibilityState === "visible") {
          triggerLoad();
        }
      },
      1000 * 60 * 15
    );

    return () => {
      cancelled = true;
      cleanup();
      window.clearInterval(intervalId);
    };
  }, [geolocationLoading, language, location.lat, location.lon]);

  const compactLocationLabel = useMemo(
    () => getCompactLocationLabel(location, copy.locationUnavailable),
    [copy.locationUnavailable, location]
  );

  const currencySummary = useMemo(() => {
    if (!overview?.currencies?.rates) {
      return null;
    }

    const usd = getBrlPairRate(overview.currencies.rates, "USD");
    const eur = getBrlPairRate(overview.currencies.rates, "EUR");
    if (!Number.isFinite(usd) || !Number.isFinite(eur)) {
      return null;
    }

    const usdValue = formatCompactRate(usd, dateLocale);
    const eurValue = formatCompactRate(eur, dateLocale);

    return {
      text: `US$ ${usdValue} · € ${eurValue}`,
      speechText: `USD ${usdValue} BRL, EUR ${eurValue} BRL`,
    };
  }, [dateLocale, overview?.currencies?.rates]);

  const weatherSummary = useMemo(() => {
    if (
      !weather ||
      weather.source === "unavailable" ||
      weather.current.temperature === null
    ) {
      return null;
    }

    const icon = getWeatherIcon(weather.current.code, {
      isNight: isNightInTimezone(weather.timezone),
    });

    return {
      icon,
      temperature: formatTemperature(weather.current.temperature),
      label: getWeatherLabel(weather.current.code, language),
    };
  }, [language, weather]);

  const combinedLabel = useMemo(() => {
    const weatherTemperature =
      weatherSummary?.temperature ?? copy.weatherFallbackValue;
    const weatherCondition = weatherSummary?.label ?? copy.weatherUnavailable;
    const ratesTitleText = currencySummary?.text ?? copy.exchangeUnavailable;
    const ratesSpeechText =
      currencySummary?.speechText ?? copy.exchangeUnavailable;

    return {
      title: `${copy.weatherTitle}: ${weatherTemperature}, ${weatherCondition}, ${compactLocationLabel}. ${copy.ratesTitle}: ${ratesTitleText}`,
      ariaLabel: `${copy.weatherTitle}: ${weatherTemperature}, ${weatherCondition}, ${compactLocationLabel}. ${copy.ratesTitle}: ${ratesSpeechText}`,
    };
  }, [
    compactLocationLabel,
    copy.exchangeUnavailable,
    copy.ratesTitle,
    copy.weatherFallbackValue,
    copy.weatherTitle,
    copy.weatherUnavailable,
    currencySummary,
    weatherSummary,
  ]);

  return {
    copy,
    compactLocationLabel,
    combinedLabel,
    currencySummary,
    weatherSummary,
    weatherLoaded,
    overviewLoaded,
    requestingPreciseLocation,
    showPreciseLocationAction:
      typeof navigator !== "undefined" &&
      "geolocation" in navigator &&
      !geolocationLoading &&
      location.source !== "browser",
    requestPreciseLocation,
  };
}

function UnifiedInfoCard({
  icon: WeatherIcon,
  iconClassName,
  temperatureLabel,
  locationLabel,
  ratesLabel,
  ariaLabel,
  title,
  onClick,
  className,
}: {
  icon: LucideIcon;
  iconClassName: string;
  temperatureLabel: string;
  locationLabel: string;
  ratesLabel: string;
  ariaLabel: string;
  title: string;
  onClick?: () => void;
  className?: string;
}) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`min-w-0 rounded-2xl border border-border/70 bg-background/90 px-3 py-1.5 shadow-sm backdrop-blur ${className ?? ""} ${onClick ? "cursor-pointer transition-colors hover:bg-background/80 text-left" : ""}`}
      aria-label={ariaLabel}
      title={title}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <WeatherIcon className={`h-3.5 w-3.5 shrink-0 ${iconClassName}`} />
          <span className="shrink-0 text-xs font-semibold leading-none text-foreground">
            {temperatureLabel}
          </span>
          <span className="min-w-0 truncate text-[10px] leading-none text-muted-foreground">
            {locationLabel}
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="min-w-0 truncate text-xs font-semibold leading-none text-foreground">
            {ratesLabel}
          </span>
        </div>
      </div>
    </Component>
  );
}

function LoadingUnifiedInfoCard({ onClick }: { onClick?: () => void }) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`min-w-0 rounded-2xl border border-border/70 bg-background/90 px-3 py-1.5 shadow-sm backdrop-blur ${onClick ? "cursor-pointer transition-colors hover:bg-background/80 text-left" : ""}`}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <div className={`h-3.5 w-3.5 ${SKELETON_BAR_CLASS_NAME}`} />
          <div className={`h-3 w-9 ${SKELETON_BAR_CLASS_NAME}`} />
          <div className={`h-2.5 w-24 ${SKELETON_BAR_CLASS_NAME}`} />
        </div>

        <div className="flex items-center gap-1.5">
          <div className={`h-3.5 w-3.5 ${SKELETON_BAR_CLASS_NAME}`} />
          <div className={`h-3 w-28 ${SKELETON_BAR_CLASS_NAME}`} />
        </div>
      </div>
    </Component>
  );
}

export function HeaderInfoCluster({
  mode,
  data,
  onClick,
}: HeaderInfoClusterProps) {
  const isDesktop = mode === "desktop";
  const visibilityClass = isDesktop
    ? "grid min-w-0 grid-cols-[minmax(0,15rem)_2rem] items-center gap-1.5"
    : "flex w-full min-w-0 items-center gap-1.5 overflow-x-auto py-1.5 xl:hidden";
  const desktopCardWidthClassName = "w-[15rem] max-w-[15rem]";
  const mobileCardWidthClassName = "min-w-[170px] max-w-[calc(100vw-5.5rem)]";
  const weatherIcon = data.weatherSummary?.icon.icon ?? Cloud;
  const weatherIconClass =
    data.weatherSummary?.icon.className ?? "text-muted-foreground";
  const weatherTemperature =
    data.weatherSummary?.temperature ?? data.copy.weatherFallbackValue;
  const ratesLabel =
    data.currencySummary?.text ?? data.copy.exchangeUnavailable;
  const isLoading = !data.weatherLoaded || !data.overviewLoaded;

  return (
    <div className={visibilityClass} aria-live="polite">
      {isLoading ? (
        <div
          className={
            isDesktop ? desktopCardWidthClassName : mobileCardWidthClassName
          }
        >
          <LoadingUnifiedInfoCard onClick={onClick} />
        </div>
      ) : (
        <UnifiedInfoCard
          icon={weatherIcon}
          iconClassName={weatherIconClass}
          temperatureLabel={weatherTemperature}
          locationLabel={data.compactLocationLabel}
          ratesLabel={ratesLabel}
          ariaLabel={data.combinedLabel.ariaLabel}
          title={data.combinedLabel.title}
          onClick={onClick}
          className={
            isDesktop ? desktopCardWidthClassName : mobileCardWidthClassName
          }
        />
      )}

      {data.showPreciseLocationAction ? (
        <button
          type="button"
          onClick={() => void data.requestPreciseLocation()}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
          aria-label={
            data.requestingPreciseLocation
              ? data.copy.preciseLocationLoading
              : data.copy.usePreciseLocation
          }
          title={
            data.requestingPreciseLocation
              ? data.copy.preciseLocationLoading
              : data.copy.usePreciseLocation
          }
          disabled={data.requestingPreciseLocation}
        >
          <LocateFixed className="h-3.5 w-3.5" />
          <span className="sr-only">
            {data.requestingPreciseLocation
              ? data.copy.preciseLocationLoading
              : data.copy.usePreciseLocation}
          </span>
        </button>
      ) : isDesktop ? (
        <span className="block h-8 w-8" aria-hidden="true" />
      ) : null}
    </div>
  );
}
