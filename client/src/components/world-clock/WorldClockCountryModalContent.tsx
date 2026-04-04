import type { SupportedLanguage } from "@/lib/site";
import {
  getLocalizedCountryMeta,
  getWorldClockPageCopy,
} from "@/lib/world-clock-copy";
import type { CountryDetailContent } from "@/lib/world-clock-country-details";
import { formatPopulation } from "@/lib/world-clock-data";
import type { WorldCountryDefinition } from "@/lib/world-clock-countries";

interface WorldClockCountryModalContentProps {
  country: WorldCountryDefinition;
  language: SupportedLanguage;
  dateLocale: string;
  status: "idle" | "loading" | "success" | "error";
  detail: CountryDetailContent | null | undefined;
}

function NoticeBanner({ children }: { children: string }) {
  return (
    <div
      className="rounded-2xl bg-secondary px-4 py-3 text-sm leading-6 text-muted-foreground"
      aria-live="polite"
    >
      {children}
    </div>
  );
}

export default function WorldClockCountryModalContent({
  country,
  language,
  dateLocale,
  status,
  detail,
}: WorldClockCountryModalContentProps) {
  const copy = getWorldClockPageCopy(language).modal;
  const localizedCountry = getLocalizedCountryMeta(country.id, language);

  if (status === "loading") {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-2xl bg-secondary" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-44 animate-pulse rounded-2xl bg-secondary" />
          <div className="h-44 animate-pulse rounded-2xl bg-secondary" />
        </div>
        <div className="h-44 animate-pulse rounded-2xl bg-secondary" />
      </div>
    );
  }

  if (status === "error" || !detail) {
    return <NoticeBanner>{copy.error}</NoticeBanner>;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-primary/10 p-5">
        <h3 className="text-xl font-bold text-primary">{copy.overview}</h3>
        <p className="mt-3 text-sm leading-7 text-foreground">
          {detail.summary}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl bg-secondary p-5">
          <h3 className="text-lg font-bold">{copy.quickFacts}</h3>
          <dl className="mt-4 space-y-3 text-sm leading-6">
            <div>
              <dt className="font-semibold text-foreground">{copy.leader}</dt>
              <dd className="text-muted-foreground">
                {detail.leader || copy.detailUnavailable}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">
                {copy.nationalMilestone}
              </dt>
              <dd className="text-muted-foreground">
                {detail.nationalMilestone || copy.detailUnavailable}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">
                {copy.population}
              </dt>
              <dd className="text-muted-foreground">
                {formatPopulation(country.population, dateLocale)}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">
                {copy.languages}
              </dt>
              <dd className="text-muted-foreground">
                {localizedCountry.languages.join(", ") ||
                  copy.detailUnavailable}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">
                {copy.capitalAltitude}
              </dt>
              <dd className="text-muted-foreground">
                {detail.capitalAltitudeMeters === null
                  ? copy.altitudeUnavailable
                  : `${new Intl.NumberFormat(dateLocale).format(detail.capitalAltitudeMeters)} m`}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl bg-secondary p-5">
          <h3 className="text-lg font-bold">{copy.context}</h3>
          <dl className="mt-4 space-y-3 text-sm leading-6">
            <div>
              <dt className="font-semibold text-foreground">{copy.seasons}</dt>
              <dd className="text-muted-foreground">{detail.seasons}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">
                {copy.predominantClimate}
              </dt>
              <dd className="text-muted-foreground">
                {detail.predominantClimate}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">{copy.religion}</dt>
              <dd className="text-muted-foreground">
                {detail.religion || copy.detailUnavailable}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">{copy.culture}</dt>
              <dd className="text-muted-foreground">
                {detail.culture || copy.detailUnavailable}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">{copy.customs}</dt>
              <dd className="text-muted-foreground">
                {detail.customs || copy.detailUnavailable}
              </dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-2xl bg-secondary p-5">
          <h3 className="text-lg font-bold">{copy.keyFacts}</h3>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
            {detail.keyFacts.map(item => (
              <li key={item} className="rounded-xl bg-background px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl bg-secondary p-5">
          <h3 className="text-lg font-bold">{copy.touristSpots}</h3>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
            {detail.touristSpots.map(item => (
              <li key={item} className="rounded-xl bg-background px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
