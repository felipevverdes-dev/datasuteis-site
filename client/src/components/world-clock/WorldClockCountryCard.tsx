import { Clock3, Globe2, Layers3 } from "lucide-react";
import type {
  CountryTimezoneOption,
  WorldCountryDefinition,
} from "@/lib/world-clock-countries";
import {
  formatUtcOffset,
  formatZonedDate,
  formatZonedTime,
} from "@/lib/world-clock-data";

interface WorldClockCountryCardProps {
  country: WorldCountryDefinition;
  displayName: string;
  displayCapital: string;
  flag: string;
  timezone: CountryTimezoneOption;
  timezoneLabel: string;
  dateLocale: string;
  now: Date;
  detailsLabel: string;
  onClick: () => void;
}

export default function WorldClockCountryCard({
  country,
  displayName,
  displayCapital,
  flag,
  timezone,
  timezoneLabel,
  dateLocale,
  now,
  detailsLabel,
  onClick,
}: WorldClockCountryCardProps) {
  return (
    <button
      type="button"
      className="card-base card-hover block w-full p-2.5 text-left hover:bg-card"
      onClick={onClick}
      aria-label={`${detailsLabel}: ${displayName}`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm" aria-hidden="true">
              {flag}
            </span>
            <span className="truncate text-[13px] font-semibold leading-5 text-primary">
              {displayName}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[11px] leading-4 text-muted-foreground">
            {displayCapital}
          </p>
        </div>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-foreground">
          {formatUtcOffset(now, timezone.timezone)}
        </span>
      </div>

      <div className="mt-2.5 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="tabular-nums text-[1.35rem] font-bold leading-none text-foreground">
            {formatZonedTime(now, timezone.timezone, dateLocale)}
          </p>
          <p className="mt-0.5 truncate text-[10px] leading-4 text-muted-foreground">
            {formatZonedDate(now, timezone.timezone, dateLocale)}
          </p>
        </div>
        <Clock3 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary/70 px-2 py-0.5">
          <Globe2 className="h-3 w-3" />
          {timezoneLabel}
        </span>
        {country.timezones.length > 1 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary/70 px-2 py-0.5">
            <Layers3 className="h-3 w-3" />
            {country.timezones.length}
          </span>
        ) : null}
      </div>
    </button>
  );
}
