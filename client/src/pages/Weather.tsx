import { useEffect, useMemo, useState } from "react";
import { LocateFixed, MapPin, RefreshCw } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import { useGeolocation } from "@/contexts/GeolocationContext";
import { useI18n } from "@/contexts/LanguageContext";
import { getLocationLabel } from "@/lib/geolocation";
import {
  fetchWeatherSnapshot,
  formatTemperature,
  type WeatherSnapshotResponse,
} from "@/lib/home-widgets";
import { buildBreadcrumbSchema, getNavigationLabels } from "@/lib/navigation";
import { getBackToTopLabel, getToolPageNavItems } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";
import type { SupportedLanguage } from "@/lib/site";
import { getWeatherLabel } from "@/lib/weather-display";

const COPY: Record<
  SupportedLanguage,
  {
    eyebrow: string;
    title: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
    useLocation: string;
    locating: string;
    refresh: string;
    currentTemp: string;
    wind: string;
    source: string;
    currentSource: string;
    approximateSource: string;
    unavailableSource: string;
    shortWindText: string;
    noForecast: string;
    locationLoading: string;
    explanationTitle: string;
    explanationItems: string[];
    examplesTitle: string;
    faqTitle: string;
    faqItems: Array<{ question: string; answer: string }>;
    notices: {
      current: string;
      denied: string;
      unavailable: string;
      browser: string;
      approximate: string;
    };
    errors: {
      weather: string;
      location: string;
    };
  }
> = {
  pt: {
    eyebrow: "Utilitários",
    title: "Clima para rotina externa e deslocamentos",
    description:
      "Consulte a temperatura atual, o vento e uma previsão curta para ajustar visitas, saídas, entregas e compromissos fora do escritório.",
    seoTitle: "Clima Online | Temperatura Atual e Próximos Dias | Datas Úteis",
    seoDescription:
      "Veja a temperatura atual e uma previsão curta para apoiar deslocamentos, visitas, entregas e rotinas externas.",
    useLocation: "Usar minha localização",
    locating: "Localizando...",
    refresh: "Atualizar",
    currentTemp: "Temperatura atual",
    wind: "Vento",
    source: "Origem da previsão",
    currentSource: "Localização precisa",
    approximateSource: "Localização aproximada",
    unavailableSource: "Sem localização",
    shortWindText: "Leitura curta para deslocamentos e visitas.",
    noForecast:
      "A previsão curta aparece aqui assim que a página identifica sua região.",
    locationLoading: "Detectando localização",
    explanationTitle: "Leitura rápida da previsão",
    explanationItems: [
      "A página carrega primeiro uma previsão aproximada e só pede a localização do navegador quando você escolhe usar sua posição.",
      "Se a localização não estiver disponível, a interface tenta uma leitura aproximada da região e deixa isso claro na tela.",
      "A leitura destaca temperatura, vento e próximos dias para decisões rápidas de deslocamento e agenda externa.",
    ],
    examplesTitle: "Próximos dias",
    faqTitle: "Perguntas frequentes",
    faqItems: [
      {
        question: "Preciso liberar a localização?",
        answer:
          "Não. Sem permissão, a página tenta carregar uma previsão aproximada e informa quando a localização exata não foi usada.",
      },
      {
        question: "Qual local aparece na previsão?",
        answer:
          "Quando a geolocalização funciona, a página mostra a cidade detectada. Sem isso, a interface destaca que a previsão é aproximada.",
      },
      {
        question: "O botão atualizar usa minha posição real?",
        answer:
          "Se você já escolheu usar sua localização, sim. Caso contrário, o botão atualiza a previsão aproximada sem pedir permissão novamente.",
      },
    ],
    notices: {
      current: "Previsão atualizada com sua localização.",
      denied: "Localização não permitida. Exibindo uma previsão aproximada.",
      unavailable:
        "Não foi possível obter sua localização. Exibindo uma previsão aproximada.",
      browser:
        "Geolocalização indisponível neste navegador. Exibindo uma previsão aproximada.",
      approximate: "Previsão carregada com localização aproximada.",
    },
    errors: {
      weather: "Não foi possível carregar a previsão agora.",
      location: "Não foi possível localizar",
    },
  },
  en: {
    eyebrow: "Utilities",
    title: "Weather for outdoor routines and trips",
    description:
      "Check current temperature, wind and a short forecast to adjust visits, deliveries and outside commitments.",
    seoTitle: "Weather | Current Temperature and Next Days | Datas Úteis",
    seoDescription:
      "Check current temperature and a short forecast to support trips, visits, deliveries and outdoor routines.",
    useLocation: "Use my location",
    locating: "Locating...",
    refresh: "Refresh",
    currentTemp: "Current temperature",
    wind: "Wind",
    source: "Query source",
    currentSource: "Precise location",
    approximateSource: "Approximate location",
    unavailableSource: "No location",
    shortWindText: "Quick reading for visits and trips.",
    noForecast:
      "The short forecast appears here as soon as the page identifies your region.",
    locationLoading: "Detecting location",
    explanationTitle: "Quick forecast reading",
    explanationItems: [
      "The page loads an approximate forecast first and only asks for browser geolocation when you choose to use your location.",
      "If location is unavailable, the page tries an approximate regional forecast and states that clearly in the interface.",
      "The page highlights temperature, wind and the next days for quick trip and schedule decisions.",
    ],
    examplesTitle: "Next days",
    faqTitle: "Frequently asked questions",
    faqItems: [
      {
        question: "Do I need to allow location access?",
        answer:
          "No. Without permission, the page tries to load an approximate forecast and makes it clear that the exact location was not used.",
      },
      {
        question: "Which place is shown in the forecast?",
        answer:
          "When geolocation works, the page shows the detected city. Otherwise, the interface makes it clear that the forecast is approximate.",
      },
      {
        question: "Does refresh use my real position?",
        answer:
          "Yes, if you already chose to use your location. Otherwise, refresh updates the approximate forecast without asking for permission again.",
      },
    ],
    notices: {
      current: "Forecast updated with your location.",
      denied: "Location not allowed. Showing an approximate forecast.",
      unavailable:
        "It was not possible to get your location. Showing an approximate forecast.",
      browser:
        "Geolocation is unavailable in this browser. Showing an approximate forecast.",
      approximate: "Forecast loaded with an approximate location.",
    },
    errors: {
      weather: "It was not possible to load the forecast right now.",
      location: "Could not get location",
    },
  },
  es: {
    eyebrow: "Utilidades",
    title: "Clima para rutina externa y desplazamientos",
    description:
      "Consulte la temperatura actual, el viento y una previsión corta para ajustar visitas, salidas, entregas y compromisos fuera de la oficina.",
    seoTitle: "Clima | Temperatura Actual y Próximos Días | Datas Úteis",
    seoDescription:
      "Vea la temperatura actual y una previsión corta para apoyar desplazamientos, visitas, entregas y rutinas externas.",
    useLocation: "Usar mi ubicación",
    locating: "Localizando...",
    refresh: "Actualizar",
    currentTemp: "Temperatura actual",
    wind: "Viento",
    source: "Origen del pronóstico",
    currentSource: "Ubicación precisa",
    approximateSource: "Ubicación aproximada",
    unavailableSource: "Sin ubicación",
    shortWindText: "Lectura rápida para visitas y desplazamientos.",
    noForecast:
      "La previsión corta aparecerá aquí cuando la página identifique su región.",
    locationLoading: "Detectando ubicación",
    explanationTitle: "Lectura rápida de la previsión",
    explanationItems: [
      "La página carga primero una previsión aproximada y solo pide la geolocalización del navegador cuando usted elige usar su ubicación.",
      "Si la ubicación no está disponible, la página intenta una previsión aproximada de la región y lo deja claro en la interfaz.",
      "La lectura destaca temperatura, viento y próximos días para decisiones rápidas de desplazamiento y agenda externa.",
    ],
    examplesTitle: "Próximos días",
    faqTitle: "Preguntas frecuentes",
    faqItems: [
      {
        question: "¿Necesito liberar la ubicación?",
        answer:
          "No. Sin permiso, la página intenta cargar una previsión aproximada y deja claro que no se usó la ubicación exacta.",
      },
      {
        question: "¿Qué lugar aparece en la previsión?",
        answer:
          "Cuando la geolocalización funciona, la página muestra la ciudad detectada. Sin eso, la interfaz deja claro que la previsión es aproximada.",
      },
      {
        question: "¿El botón actualizar usa mi ubicación real?",
        answer:
          "Sí, si usted ya eligió usar su ubicación. En caso contrario, el botón actualiza la previsión aproximada sin volver a pedir permiso.",
      },
    ],
    notices: {
      current: "Previsión actualizada con su ubicación.",
      denied: "Ubicación no permitida. Mostrando una previsión aproximada.",
      unavailable:
        "No fue posible obtener su ubicación. Mostrando una previsión aproximada.",
      browser:
        "La geolocalización no está disponible en este navegador. Mostrando una previsión aproximada.",
      approximate: "Previsión cargada con una ubicación aproximada.",
    },
    errors: {
      weather: "No fue posible cargar la previsión ahora.",
      location: "No se pudo obtener ubicación",
    },
  },
};

function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export default function Weather() {
  const { language, formatDate, dateLocale } = useI18n();
  const {
    location,
    loading: geolocationLoading,
    requestingPreciseLocation,
    error: geolocationError,
    requestPreciseLocation,
  } = useGeolocation();
  const copy = COPY[language] ?? COPY.pt;
  const navigationLabels = getNavigationLabels(language);
  const navItems = getToolPageNavItems(language);
  const topLabel = getBackToTopLabel(language);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.utilities, href: "/utilitarios/" },
    { label: copy.title },
  ];
  const [weather, setWeather] = useState<WeatherSnapshotResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const windFormatter = useMemo(
    () =>
      new Intl.NumberFormat(dateLocale, {
        maximumFractionDigits: 1,
      }),
    [dateLocale]
  );

  usePageSeo({
    title: copy.seoTitle,
    description: copy.seoDescription,
    path: "/utilitarios/clima/",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Clima",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        url: "https://datasuteis.com.br/utilitarios/clima/",
      },
      buildBreadcrumbSchema([
        { label: navigationLabels.home, href: "/" },
        { label: navigationLabels.utilities, href: "/utilitarios/" },
        { label: copy.title, href: "/utilitarios/clima/" },
      ]),
    ],
  });

  function getSourceLabel() {
    if (location.source === "browser") {
      return copy.currentSource;
    }

    if (location.source === "ip" || location.source === "fallback") {
      return copy.approximateSource;
    }

    return copy.unavailableSource;
  }

  async function loadWeather() {
    if (geolocationLoading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = await fetchWeatherSnapshot(language, {
        origin: window.location.origin,
        timezone: getTimezone(),
        coordinates: {
          lat: location.lat,
          lon: location.lon,
        },
      });
      setWeather(payload);
    } catch {
      setWeather(null);
      setError(copy.errors.weather);
    } finally {
      setLoading(false);
    }
  }

  async function useDetectedLocation() {
    await requestPreciseLocation();
  }

  useEffect(() => {
    void loadWeather();
  }, [geolocationLoading, language, location.lat, location.lon]);

  function refreshWeather() {
    void loadWeather();
  }

  const forecast = useMemo(() => weather?.daily ?? [], [weather?.daily]);
  const locationLabel = geolocationLoading
    ? copy.locationLoading
    : getLocationLabel(location);
  const notice = useMemo(() => {
    if (geolocationLoading) {
      return "";
    }

    if (geolocationError === "denied") {
      return copy.notices.denied;
    }

    if (geolocationError === "unsupported") {
      return copy.notices.browser;
    }

    if (geolocationError === "unavailable") {
      return copy.notices.unavailable;
    }

    if (location.source === "browser") {
      return copy.notices.current;
    }

    return copy.notices.approximate;
  }, [copy.notices, geolocationError, geolocationLoading, location.source]);

  return (
    <PageShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      navItems={navItems}
      topLabel={topLabel}
      breadcrumbs={breadcrumbs}
      breadcrumbAriaLabel={navigationLabels.breadcrumb}
      backButtonLabel={navigationLabels.back}
      backButtonAriaLabel={navigationLabels.backAria}
    >
      <section id="ferramenta" className="section-anchor">
        <div className="section-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <MapPin className="h-4 w-4" />
              {locationLabel}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void useDetectedLocation()}
                className="btn-secondary"
                disabled={requestingPreciseLocation}
                aria-label={copy.useLocation}
                title={copy.useLocation}
              >
                <span className="inline-flex items-center gap-2">
                  <LocateFixed className="h-4 w-4" />
                  {requestingPreciseLocation ? copy.locating : copy.useLocation}
                </span>
              </button>

              <button
                type="button"
                onClick={refreshWeather}
                className="btn-secondary"
                disabled={loading}
              >
                <span className="inline-flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {copy.refresh}
                </span>
              </button>
            </div>
          </div>

          {notice ? (
            <div className="mt-5 rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
              {notice}
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="mt-6 page-grid">
            <article className="rounded-2xl bg-primary/10 p-5">
              <p className="text-sm text-muted-foreground">
                {copy.currentTemp}
              </p>
              <p className="mt-3 text-3xl font-bold text-primary">
                {loading && !weather
                  ? "..."
                  : formatTemperature(weather?.current.temperature ?? null)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {getWeatherLabel(weather?.current.code ?? null, language)}
              </p>
            </article>

            <article className="rounded-2xl bg-secondary p-5">
              <p className="text-sm text-muted-foreground">{copy.wind}</p>
              <p className="mt-3 text-2xl font-bold">
                {weather?.current.windSpeed !== null &&
                weather?.current.windSpeed !== undefined
                  ? `${windFormatter.format(weather.current.windSpeed)} km/h`
                  : "--"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {copy.shortWindText}
              </p>
            </article>

            <article className="rounded-2xl bg-secondary p-5">
              <p className="text-sm text-muted-foreground">{copy.source}</p>
              <p className="mt-3 text-2xl font-bold">{getSourceLabel()}</p>
              <p className="mt-2 text-sm text-muted-foreground">{notice}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="explicacao" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">{copy.explanationTitle}</h2>
          <div className="mt-5 page-grid">
            {copy.explanationItems.map(item => (
              <article
                key={item}
                className="rounded-2xl bg-secondary p-5 text-sm leading-6 text-muted-foreground"
              >
                {item}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="exemplos" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">{copy.examplesTitle}</h2>
          <div className="mt-5 page-grid">
            {forecast.length ? (
              forecast.map(day => (
                <article
                  key={day.date}
                  className="rounded-2xl bg-secondary p-5"
                >
                  <p className="text-sm text-muted-foreground">
                    {formatDate(day.date)}
                  </p>
                  <p className="mt-3 text-2xl font-bold">
                    {getWeatherLabel(day.code, language)}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {language === "en"
                      ? `Max ${formatTemperature(day.max)} • Min ${formatTemperature(day.min)}`
                      : language === "es"
                        ? `Máx. ${formatTemperature(day.max)} • Mín. ${formatTemperature(day.min)}`
                        : `Máx. ${formatTemperature(day.max)} • Mín. ${formatTemperature(day.min)}`}
                  </p>
                </article>
              ))
            ) : (
              <article className="rounded-2xl bg-secondary p-5 text-sm leading-6 text-muted-foreground md:col-span-3">
                {copy.noForecast}
              </article>
            )}
          </div>
        </div>
      </section>

      <section id="faq" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">{copy.faqTitle}</h2>
          <div className="mt-5 space-y-3">
            {copy.faqItems.map(item => (
              <details
                key={item.question}
                className="rounded-2xl bg-secondary px-5 py-4"
              >
                <summary className="font-semibold">{item.question}</summary>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
