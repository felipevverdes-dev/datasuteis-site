import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useI18n } from "@/contexts/LanguageContext";
import { trackAnalyticsEvent } from "@/lib/analytics";
import {
  type CookieConsentStatus,
  readStoredCookieConsent,
  writeStoredCookieConsent,
} from "@/lib/site";

const COPY = {
  pt: {
    message:
      "Usamos cookies de medição para Analytics e AdSense. Você pode aceitar ou recusar.",
    accept: "Aceitar",
    reject: "Recusar",
    privacy: "Privacidade",
  },
  en: {
    message:
      "We use measurement cookies for Analytics and AdSense. You can accept or reject them.",
    accept: "Accept",
    reject: "Reject",
    privacy: "Privacy",
  },
  es: {
    message:
      "Usamos cookies de medición para Analytics y AdSense. Puede aceptarlas o rechazarlas.",
    accept: "Aceptar",
    reject: "Rechazar",
    privacy: "Privacidad",
  },
} as const;

export default function CookieConsentBanner() {
  const { language } = useI18n();
  const copy = COPY[language] ?? COPY.pt;
  const [consent, setConsent] = useState<CookieConsentStatus | null>(() =>
    readStoredCookieConsent()
  );

  useEffect(() => {
    function handleConsentUpdate(event: Event) {
      const detail = (event as CustomEvent<{ status?: CookieConsentStatus }>)
        .detail;
      if (detail?.status) {
        setConsent(detail.status);
      }
    }

    window.addEventListener("datasuteis-consent-updated", handleConsentUpdate);
    return () => {
      window.removeEventListener(
        "datasuteis-consent-updated",
        handleConsentUpdate
      );
    };
  }, []);

  if (consent) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-border/70 bg-background/95 shadow-lg backdrop-blur">
      <div className="cookie-consent-safe-area container mx-auto flex flex-col gap-2 px-3 py-2.5 md:flex-row md:items-center md:justify-between md:px-4 md:py-3 lg:gap-3 lg:px-5 lg:py-2">
        <p className="max-w-4xl text-[13px] leading-4 text-muted-foreground md:text-sm md:leading-5 lg:text-[11px] lg:leading-4">
          {copy.message}{" "}
          <Link href="/privacidade/" className="font-semibold text-primary">
            {copy.privacy}
          </Link>
        </p>

        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
          <button
            type="button"
            onClick={() => {
              trackAnalyticsEvent("cookie_consent_updated", {
                consent_status: "rejected",
              });
              writeStoredCookieConsent("rejected");
            }}
            className="btn-outline min-h-10 px-4 py-2 text-sm lg:min-h-9 lg:px-3.5 lg:py-1.5 lg:text-[13px]"
          >
            {copy.reject}
          </button>
          <button
            type="button"
            onClick={() => {
              trackAnalyticsEvent("cookie_consent_updated", {
                consent_status: "accepted",
              });
              writeStoredCookieConsent("accepted");
            }}
            className="btn-primary min-h-10 px-4 py-2 text-sm lg:min-h-9 lg:px-3.5 lg:py-1.5 lg:text-[13px]"
          >
            {copy.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
