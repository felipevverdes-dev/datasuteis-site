import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  LocateFixed,
  MapPin,
  PartyPopper,
  Thermometer,
} from "lucide-react";
import { useGeolocation } from "@/contexts/GeolocationContext";
import { getBusinessDayRangeSummary, isBusinessDay } from "@/lib/business-days";
import { buildDate, getWeekdayLabel } from "@/lib/date-utils";
import { getLocationLabel } from "@/lib/geolocation";
import {
  fetchWeatherSnapshot,
  formatTemperature,
  type WeatherSnapshotResponse,
} from "@/lib/home-widgets";
import { getHolidayName, getNextNationalHoliday } from "@/lib/holidays";
import { scheduleWhenIdle } from "@/lib/idle";
import { getWeatherIcon, getWeatherLabel } from "@/lib/weather-display";
import { useI18n } from "@/contexts/LanguageContext";
import type { SupportedLanguage } from "@/lib/site";

const COPY: Record<
  SupportedLanguage,
  {
    title: string;
    todayLabel: string;
    businessDayLabel: string;
    nextHolidayLabel: string;
    businessDaysLeftLabel: string;
    yes: string;
    no: string;
    locationFallback: string;
    locationLoading: string;
    usePreciseLocation: string;
    usePreciseLocationAria: string;
    preciseLocationLoading: string;
    locationError: string;
  }
> = {
  pt: {
    title: "Resumo do momento",
    todayLabel: "Hoje é dia:",
    businessDayLabel: "Hoje é um dia útil?",
    nextHolidayLabel: "Próximo Feriado Nacional:",
    businessDaysLeftLabel: "Dias úteis restantes no mês:",
    yes: "Sim",
    no: "Não",
    locationFallback: "Brasil",
    locationLoading: "Localizando...",
    usePreciseLocation: "Usar minha localização",
    usePreciseLocationAria: "Usar minha localização precisa",
    preciseLocationLoading: "Atualizando localização...",
    locationError: "Não foi possível localizar",
  },
  en: {
    title: "Today snapshot",
    todayLabel: "Today is:",
    businessDayLabel: "Is today a business day?",
    nextHolidayLabel: "Next National Holiday:",
    businessDaysLeftLabel: "Business days left this month:",
    yes: "Yes",
    no: "No",
    locationFallback: "Brazil",
    locationLoading: "Locating...",
    usePreciseLocation: "Use my location",
    usePreciseLocationAria: "Use my precise location",
    preciseLocationLoading: "Updating location...",
    locationError: "Could not get location",
  },
  es: {
    title: "Resumen del momento",
    todayLabel: "Hoy es:",
    businessDayLabel: "¿Hoy es un día hábil?",
    nextHolidayLabel: "Próximo Feriado Nacional:",
    businessDaysLeftLabel: "Días hábiles restantes del mes:",
    yes: "Sí",
    no: "No",
    locationFallback: "Brasil",
    locationLoading: "Localizando...",
    usePreciseLocation: "Usar mi ubicación",
    usePreciseLocationAria: "Usar mi ubicación precisa",
    preciseLocationLoading: "Actualizando ubicación...",
    locationError: "No se pudo obtener ubicación",
  },
};

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

function getFormattedTodayDate(
  formatDate: ReturnType<typeof useI18n>["formatDate"],
  date: Date
) {
  return formatDate(date, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getShortLocalizedDate(
  formatDate: ReturnType<typeof useI18n>["formatDate"],
  value: string | Date
) {
  return formatDate(value, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function HomeMomentSummary() {
  const { language, formatDate } = useI18n();
  const {
    location,
    loading: geolocationLoading,
    requestingPreciseLocation,
    error: geolocationError,
    requestPreciseLocation,
  } = useGeolocation();
  const copy = COPY[language] ?? COPY.pt;
  const today = new Date();
  const endOfMonth = buildDate(
    today.getFullYear(),
    today.getMonth() + 1,
    new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  );
  const tomorrow = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );
  const nextHoliday = getNextNationalHoliday(today);
  const businessDaysLeft =
    tomorrow <= endOfMonth
      ? getBusinessDayRangeSummary(tomorrow, endOfMonth).businessDays
      : 0;
  const todayIsBusinessDay = isBusinessDay(today);
  const [weather, setWeather] = useState<WeatherSnapshotResponse | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [isActivated, setIsActivated] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) {
      return;
    }

    let cleanupIdle = () => {};

    if (typeof IntersectionObserver !== "function") {
      cleanupIdle = scheduleWhenIdle(() => {
        setIsActivated(true);
      });

      return () => {
        cleanupIdle();
      };
    }

    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0]?.isIntersecting) {
          return;
        }

        cleanupIdle = scheduleWhenIdle(() => {
          setIsActivated(true);
        });
        observer.disconnect();
      },
      { rootMargin: "240px 0px" }
    );

    observer.observe(node);

    return () => {
      cleanupIdle();
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      if (!isActivated || geolocationLoading) {
        return;
      }

      setLoadingWeather(true);

      try {
        const payload = await fetchWeatherSnapshot(language, {
          origin: window.location.origin,
          timezone: getTimezone(),
          coordinates: {
            lat: location.lat,
            lon: location.lon,
          },
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
          setLoadingWeather(false);
        }
      }
    }

    void loadWeather();

    return () => {
      cancelled = true;
    };
  }, [geolocationLoading, isActivated, language, location.lat, location.lon]);

  async function handlePreciseLocationRequest() {
    await requestPreciseLocation();
  }

  const businessDayValue = todayIsBusinessDay ? copy.yes : copy.no;
  const businessDayValueClassName = todayIsBusinessDay
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-300";
  const weatherIcon = getWeatherIcon(weather?.current.code ?? null, {
    isNight: isNightInTimezone(weather?.timezone),
  });
  const WeatherIcon = weatherIcon.icon;
  const locationLabel = geolocationLoading
    ? copy.locationLoading
    : getLocationLabel(location) || copy.locationFallback;
  const weatherLabel = getWeatherLabel(weather?.current.code ?? null, language);
  const temperatureLabel = loadingWeather
    ? "..."
    : formatTemperature(weather?.current.temperature ?? null);
  const todayLabel = `${getFormattedTodayDate(formatDate, today)} - ${getWeekdayLabel(today, language)}`;
  const canUsePreciseLocation =
    typeof navigator !== "undefined" && "geolocation" in navigator;
  const showUseLocationAction =
    canUsePreciseLocation &&
    !geolocationLoading &&
    location.source !== "browser";
  const showLocationError =
    geolocationError !== null && !requestingPreciseLocation;

  return (
    <section
      ref={sectionRef}
      id="momento"
      className="section-anchor min-h-[24rem] rounded-3xl border border-border bg-card p-6 shadow-sm md:min-h-[22rem]"
      aria-busy={geolocationLoading || (isActivated && loadingWeather)}
    >
      <h2 className="text-3xl font-bold">{copy.title}</h2>

      <div className="mt-6 space-y-5">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm leading-6 text-foreground">
            <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              {copy.todayLabel} <strong>{todayLabel}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm leading-6 text-foreground">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              {copy.businessDayLabel}{" "}
              <strong className={businessDayValueClassName}>
                {businessDayValue}
              </strong>
            </span>
          </div>

          <div className="flex items-start gap-3 text-sm leading-6 text-foreground">
            <PartyPopper className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              {copy.nextHolidayLabel}{" "}
              <strong>
                {nextHoliday
                  ? getShortLocalizedDate(formatDate, nextHoliday.date)
                  : "--"}
              </strong>
              <br />
              <span className="text-muted-foreground">
                {nextHoliday ? getHolidayName(nextHoliday, language) : "--"}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm leading-6 text-foreground">
            <BarChart3 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              {copy.businessDaysLeftLabel} <strong>{businessDaysLeft}</strong>
            </span>
          </div>
        </div>

        <hr className="border-border" />

        <div className="space-y-3">
          <div className="flex min-h-6 items-center gap-3 text-sm leading-6 text-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>{locationLabel}</span>
          </div>

          <div className="flex min-h-8 items-center gap-3 text-sm leading-6 text-foreground">
            <Thermometer className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-2xl font-bold">{temperatureLabel}</span>
          </div>

          <div className="flex min-h-6 items-center gap-3 text-sm leading-6 text-foreground">
            <WeatherIcon
              className={`h-4 w-4 shrink-0 ${weatherIcon.className}`}
            />
            <span>{weatherLabel}</span>
          </div>

          <div className="min-h-6">
            {showUseLocationAction ? (
              <button
                type="button"
                onClick={() => void handlePreciseLocationRequest()}
                className="inline-flex items-center gap-2 rounded-md text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                aria-label={copy.usePreciseLocationAria}
                title={copy.usePreciseLocation}
                disabled={requestingPreciseLocation}
              >
                <LocateFixed className="h-3.5 w-3.5" />
                <span>
                  {requestingPreciseLocation
                    ? copy.preciseLocationLoading
                    : copy.usePreciseLocation}
                </span>
              </button>
            ) : null}
          </div>

          {showLocationError ? (
            <p className="text-xs text-muted-foreground">
              {copy.locationError}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
