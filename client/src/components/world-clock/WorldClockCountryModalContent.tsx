import type { SupportedLanguage } from "@/lib/site";
import {
  getWorldClockPageCopy,
} from "@/lib/world-clock-copy";
import type { CountryProfileContent } from "@/lib/world-clock-country-details";

interface WorldClockCountryModalContentProps {
  language: SupportedLanguage;
  status: "idle" | "loading" | "success" | "error";
  detail: CountryProfileContent | null | undefined;
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
  language,
  status,
  detail,
}: WorldClockCountryModalContentProps) {
  const copy = getWorldClockPageCopy(language).modal;

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
        <p className="mt-2 text-sm font-medium leading-6 text-foreground/90">
          {detail.editorialSummary}
        </p>
        <p className="mt-3 text-sm leading-7 text-foreground">
          {detail.overview}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl bg-secondary p-5">
          <h3 className="text-lg font-bold">{copy.quickFacts}</h3>
          <dl className="mt-4 space-y-3 text-sm leading-6">
            <div>
              <dt className="font-semibold text-foreground">{copy.leader}</dt>
              <dd className="text-muted-foreground">
                {detail.quickFacts.politicalLeader || copy.detailUnavailable}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">
                {copy.nationalMilestone}
              </dt>
              <dd className="text-muted-foreground">
                {detail.quickFacts.nationalMilestone || copy.detailUnavailable}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">
                {copy.population}
              </dt>
              <dd className="text-muted-foreground">{detail.quickFacts.population}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">
                {copy.languages}
              </dt>
              <dd className="text-muted-foreground">
                {detail.quickFacts.languages || copy.detailUnavailable}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">
                {copy.capitalAltitude}
              </dt>
              <dd className="text-muted-foreground">{detail.quickFacts.capitalAltitude}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl bg-secondary p-5">
          <h3 className="text-lg font-bold">{copy.context}</h3>
          <dl className="mt-4 space-y-3 text-sm leading-6">
            <div>
              <dt className="font-semibold text-foreground">{copy.seasons}</dt>
              <dd className="text-muted-foreground">
                {detail.culturalContext.seasons}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">
                {copy.predominantClimate}
              </dt>
              <dd className="text-muted-foreground">
                {detail.culturalContext.climate}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">{copy.religion}</dt>
              <dd className="text-muted-foreground">
                {detail.culturalContext.religion || copy.detailUnavailable}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">{copy.culture}</dt>
              <dd className="text-muted-foreground">
                {detail.culturalContext.culture || copy.detailUnavailable}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">{copy.customs}</dt>
              <dd className="text-muted-foreground">
                {detail.culturalContext.customs || copy.detailUnavailable}
              </dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-2xl bg-secondary p-5">
          <h3 className="text-lg font-bold">{copy.keyFacts}</h3>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
            {detail.highlights.map(item => (
              <li key={item} className="rounded-xl bg-background px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl bg-secondary p-5">
          <h3 className="text-lg font-bold">{copy.touristSpots}</h3>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
            {detail.tourism.map(item => (
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
