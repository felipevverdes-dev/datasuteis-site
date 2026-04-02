export const SITE_NAME = "Datas Úteis";
export const SITE_URL = "https://datasuteis.com.br";
export const INDEXABLE_HOSTS = ["datasuteis.com.br"] as const;
export const SITE_LAST_MODIFIED_DATE = "2026-04-02";
export const SITE_LAST_MODIFIED_DATETIME = "2026-04-02T00:00:00-03:00";
export const SITE_DESCRIPTION =
  "Calculadora de dias úteis rápida e precisa com feriados nacionais, estaduais e municipais. Calendário, escalas de trabalho, idade e ferramentas online.";
export const DEFAULT_AUTHOR = SITE_NAME;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/brand/og-image.png`;
export const GA_MEASUREMENT_ID = "G-E9198198D5";
export const ADSENSE_CLIENT_ID = "ca-pub-3377250238500968";
export const THEME_STORAGE_KEY = "datasuteis_theme";
export const LANGUAGE_STORAGE_KEY = "datasuteis_lang";
export const LEGACY_LANGUAGE_STORAGE_KEY = "lang";
export const COOKIE_CONSENT_STORAGE_KEY = "datasuteis_cookie_consent_v1";
export const SUPPORTED_LANGUAGES = ["pt", "en", "es"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export type CookieConsentStatus = "accepted" | "rejected";

export const HTML_LANG_BY_LANGUAGE: Record<SupportedLanguage, string> = {
  pt: "pt-BR",
  en: "en",
  es: "es",
};

export function isIndexableHost(hostname: string | null | undefined) {
  if (!hostname) {
    return false;
  }

  return INDEXABLE_HOSTS.includes(
    hostname.toLowerCase() as (typeof INDEXABLE_HOSTS)[number]
  );
}

export function getDefaultRobotsContent() {
  if (typeof window === "undefined") {
    return "noindex, nofollow";
  }

  if (import.meta.env.DEV) {
    return "noindex, nofollow";
  }

  return isIndexableHost(window.location.hostname) ? "index, follow" : "noindex, nofollow";
}

export function normalizeSitePath(path: string) {
  if (!path) {
    return "/";
  }

  const [pathname] = path.split(/[?#]/, 1);
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (normalizedPath === "/") {
    return "/";
  }

  return normalizedPath.endsWith("/") ? normalizedPath : `${normalizedPath}/`;
}

export function normalizeLanguage(value: string | null | undefined): SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage) ? (value as SupportedLanguage) : "pt";
}

export function readRequestedLanguage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const rawLanguage = params.get("lang");
    return rawLanguage ? normalizeLanguage(rawLanguage) : null;
  } catch {
    return null;
  }
}

export function readStoredLanguage(): SupportedLanguage {
  if (typeof window === "undefined") {
    return "pt";
  }

  try {
    const requestedLanguage = readRequestedLanguage();
    if (requestedLanguage) {
      return requestedLanguage;
    }

    return normalizeLanguage(
      window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_LANGUAGE_STORAGE_KEY),
    );
  } catch {
    return "pt";
  }
}

export function writeStoredLanguage(language: SupportedLanguage) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    window.localStorage.setItem(LEGACY_LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage failures and keep the UI functional.
  }
}

export function applyDocumentLanguage(language: SupportedLanguage) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.lang = HTML_LANG_BY_LANGUAGE[language];
  document.documentElement.dataset.language = language;
}

export function buildLocalizedPath(path: string, language: SupportedLanguage) {
  const normalizedPath =
    path === "/" ? "/" : path.endsWith("/") ? path : `${path}/`;
  if (language === "pt") {
    return normalizedPath;
  }

  return `${normalizedPath}?lang=${language}`;
}

export function buildLocalizedUrl(path: string, language: SupportedLanguage) {
  return `${SITE_URL}${buildLocalizedPath(path, language)}`;
}

export function readStoredCookieConsent() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

export function writeStoredCookieConsent(status: CookieConsentStatus) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, status);
    window.dispatchEvent(
      new CustomEvent("datasuteis-consent-updated", {
        detail: { status },
      }),
    );
  } catch {
    // Ignore storage failures and keep the UI usable.
  }
}
