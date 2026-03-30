import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Moon,
  Snowflake,
  Sun,
} from "lucide-react";
import type { SupportedLanguage } from "@/lib/site";

const WEATHER_COPY: Record<
  SupportedLanguage,
  {
    unavailable: string;
    clear: string;
    partlyCloudy: string;
    cloudy: string;
    fog: string;
    drizzle: string;
    rain: string;
    snow: string;
    storm: string;
    varied: string;
  }
> = {
  pt: {
    unavailable: "Condição indisponível",
    clear: "Céu limpo",
    partlyCloudy: "Parcialmente nublado",
    cloudy: "Nublado",
    fog: "Neblina",
    drizzle: "Garoa",
    rain: "Chuva",
    snow: "Neve",
    storm: "Tempestade",
    varied: "Tempo variado",
  },
  en: {
    unavailable: "Weather unavailable",
    clear: "Clear sky",
    partlyCloudy: "Partly cloudy",
    cloudy: "Cloudy",
    fog: "Fog",
    drizzle: "Drizzle",
    rain: "Rain",
    snow: "Snow",
    storm: "Storm",
    varied: "Mixed weather",
  },
  es: {
    unavailable: "Condición no disponible",
    clear: "Cielo despejado",
    partlyCloudy: "Parcialmente nublado",
    cloudy: "Nublado",
    fog: "Neblina",
    drizzle: "Llovizna",
    rain: "Lluvia",
    snow: "Nieve",
    storm: "Tormenta",
    varied: "Tiempo variable",
  },
};

function getWeatherCopy(language: SupportedLanguage) {
  return WEATHER_COPY[language] ?? WEATHER_COPY.pt;
}

export function getWeatherLabel(
  code: number | null,
  language: SupportedLanguage,
) {
  const copy = getWeatherCopy(language);

  if (code === null) {
    return copy.unavailable;
  }

  if (code === 0) {
    return copy.clear;
  }

  if ([1, 2].includes(code)) {
    return copy.partlyCloudy;
  }

  if (code === 3) {
    return copy.cloudy;
  }

  if ([45, 48].includes(code)) {
    return copy.fog;
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return copy.drizzle;
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return copy.rain;
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return copy.snow;
  }

  if ([95, 96, 99].includes(code)) {
    return copy.storm;
  }

  return copy.varied;
}

export function getWeatherIcon(
  code: number | null,
  options: { isNight?: boolean } = {}
): { icon: LucideIcon; className: string } {
  const normalizedCode = code ?? -1;

  if (code === 0) {
    return options.isNight
      ? { icon: Moon, className: "text-sky-300" }
      : { icon: Sun, className: "text-amber-500" };
  }

  if ([1, 2].includes(normalizedCode)) {
    return { icon: CloudSun, className: "text-sky-500" };
  }

  if (code === 3) {
    return { icon: Cloud, className: "text-slate-500" };
  }

  if ([45, 48].includes(normalizedCode)) {
    return { icon: CloudFog, className: "text-slate-500" };
  }

  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(normalizedCode)) {
    return { icon: CloudRain, className: "text-sky-600" };
  }

  if ([71, 73, 75, 77, 85, 86].includes(normalizedCode)) {
    return { icon: Snowflake, className: "text-cyan-500" };
  }

  if ([95, 96, 99].includes(normalizedCode)) {
    return { icon: CloudLightning, className: "text-violet-500" };
  }

  return { icon: Cloud, className: "text-slate-500" };
}
