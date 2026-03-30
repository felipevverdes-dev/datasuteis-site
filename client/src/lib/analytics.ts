import { GA_MEASUREMENT_ID } from "@/lib/site";

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

function normalizeParams(params: AnalyticsParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  );
}

export function trackAnalyticsEvent(
  name: string,
  params: AnalyticsParams = {},
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", name, normalizeParams(params));
}

export function trackPageView(path: string, title: string) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  const pagePath = path.startsWith("/") ? path : `/${path}`;
  const pageLocation = `${window.location.origin}${pagePath}`;

  window.gtag("event", "page_view", {
    send_to: GA_MEASUREMENT_ID,
    page_path: pagePath,
    page_location: pageLocation,
    page_title: title,
  });
}
