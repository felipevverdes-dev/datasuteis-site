import type { SupportedLanguage } from "@/lib/site";
import {
  getLocalizedCountryMeta,
  getLocalizedMarketStatusLabel,
  getWorldClockPageCopy,
} from "@/lib/world-clock-copy";
import {
  formatUtcOffset,
  formatZonedTime,
  getMarketStatus,
  type GlobalMarketQuote,
  GLOBAL_MARKETS,
} from "@/lib/world-clock-data";

function getStatusClassName(status: ReturnType<typeof getMarketStatus>) {
  switch (status) {
    case "open":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200";
    case "pre":
      return "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200";
    case "post":
      return "bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200";
    case "break":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

function formatMoney(
  value: number | null | undefined,
  currency: string,
  locale: string
) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(value);
}

function formatSignedMoney(
  value: number | null | undefined,
  currency: string,
  locale: string
) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
    signDisplay: "always",
  }).format(value);
}

function formatSignedPercent(value: number | null | undefined, locale: string) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }

  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: "always",
  }).format(value / 100);
}

interface WorldClockMarketsTableProps {
  language: SupportedLanguage;
  dateLocale: string;
  now: Date;
  quotesById: Record<string, GlobalMarketQuote | undefined>;
  onMarketClick: (marketId: string) => void;
  hideQuoteColumns?: boolean;
  compactFallbackNote?: string | null;
}

export default function WorldClockMarketsTable({
  language,
  dateLocale,
  now,
  quotesById,
  onMarketClick,
  hideQuoteColumns = false,
  compactFallbackNote = null,
}: WorldClockMarketsTableProps) {
  const copy = getWorldClockPageCopy(language).markets;

  return (
    <>
      <div
        className="compact-table hidden lg:block"
        aria-label={copy.tableLabel}
      >
        <div className="table-wrap">
          <table className="data-table data-table-compact">
            <thead>
              <tr>
                <th>{copy.index}</th>
                <th>{copy.location}</th>
                <th>{copy.localTime}</th>
                <th>{copy.timezone}</th>
                <th>{copy.status}</th>
                <th>{copy.hours}</th>
                {!hideQuoteColumns ? <th>{copy.currentQuote}</th> : null}
                {!hideQuoteColumns ? <th>{copy.previousClose}</th> : null}
                {!hideQuoteColumns ? <th>{copy.variation}</th> : null}
              </tr>
            </thead>
            <tbody>
              {GLOBAL_MARKETS.map(market => {
                const quote = quotesById[market.id];
                const status = getMarketStatus(market, now);
                const currency = quote?.currency ?? market.index.currency;
                const localizedCountry = getLocalizedCountryMeta(
                  market.countryCode.toLowerCase() as Parameters<
                    typeof getLocalizedCountryMeta
                  >[0],
                  language
                );

                return (
                  <tr key={market.id}>
                    <td>
                      <div className="min-w-0">
                        <button
                          type="button"
                          className="text-left font-semibold text-primary hover:underline"
                          onClick={() => onMarketClick(market.id)}
                        >
                          {market.name}
                        </button>
                        <div className="text-xs text-muted-foreground">
                          {market.index.displaySymbol}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        {market.city}, {localizedCountry.name}
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold tabular-nums">
                        {formatZonedTime(now, market.timezone, dateLocale)}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">{market.timezone}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatUtcOffset(now, market.timezone)}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-chip ${getStatusClassName(status)}`}
                      >
                        {getLocalizedMarketStatusLabel(language, status)}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm font-medium">
                        {market.officialHoursLabel}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {market.notes ?? copy.sessionOnlyFallback}
                      </div>
                    </td>
                    {!hideQuoteColumns ? (
                      <td className="font-semibold">
                        {formatMoney(quote?.price, currency, dateLocale) ??
                          copy.quoteUnavailable}
                      </td>
                    ) : null}
                    {!hideQuoteColumns ? (
                      <td>
                        {formatMoney(
                          quote?.previousClose,
                          currency,
                          dateLocale
                        ) ?? copy.previousCloseUnavailable}
                      </td>
                    ) : null}
                    {!hideQuoteColumns ? (
                      <td>
                        {quote?.changeAbsolute === null ||
                        quote?.changeAbsolute === undefined
                          ? copy.variationUnavailable
                          : `${formatSignedMoney(
                              quote.changeAbsolute,
                              currency,
                              dateLocale
                            )} • ${formatSignedPercent(
                              quote.changePercent,
                              dateLocale
                            )}`}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 lg:hidden" aria-label={copy.mobileLabel}>
        {GLOBAL_MARKETS.map(market => {
          const quote = quotesById[market.id];
          const status = getMarketStatus(market, now);
          const currency = quote?.currency ?? market.index.currency;
          const localizedCountry = getLocalizedCountryMeta(
            market.countryCode.toLowerCase() as Parameters<
              typeof getLocalizedCountryMeta
            >[0],
            language
          );

          return (
            <button
              key={market.id}
              type="button"
              className="card-base block w-full p-3 text-left"
              onClick={() => onMarketClick(market.id)}
              aria-label={`${copy.clickedAria}: ${market.name}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold leading-5">{market.name}</h3>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {market.city}, {localizedCountry.name}
                  </p>
                </div>
                <span className={`status-chip ${getStatusClassName(status)}`}>
                  {getLocalizedMarketStatusLabel(language, status)}
                </span>
              </div>

              <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                <div className="compact-stat compact-stat-tight">
                  <span className="compact-stat-label">{copy.localTime}</span>
                  <strong className="compact-stat-value tabular-nums">
                    {formatZonedTime(now, market.timezone, dateLocale)}
                  </strong>
                  <span className="compact-stat-note">
                    {formatUtcOffset(now, market.timezone)}
                  </span>
                </div>
                <div className="compact-stat compact-stat-tight">
                  <span className="compact-stat-label">{copy.index}</span>
                  <strong className="compact-stat-value">
                    {market.index.displaySymbol}
                  </strong>
                  <span className="compact-stat-note">
                    {market.officialHoursLabel}
                  </span>
                </div>
                {!hideQuoteColumns ? (
                  <div className="compact-stat compact-stat-tight">
                    <span className="compact-stat-label">
                      {copy.currentQuote}
                    </span>
                    <strong className="compact-stat-value">
                      {formatMoney(quote?.price, currency, dateLocale) ??
                        copy.quoteUnavailable}
                    </strong>
                    <span className="compact-stat-note">
                      {copy.previousClose}:{" "}
                      {formatMoney(
                        quote?.previousClose,
                        currency,
                        dateLocale
                      ) ?? copy.previousCloseUnavailable}
                    </span>
                  </div>
                ) : null}
                <div className="compact-stat compact-stat-tight">
                  <span className="compact-stat-label">
                    {hideQuoteColumns ? copy.notes : copy.variation}
                  </span>
                  <strong className="compact-stat-value">
                    {hideQuoteColumns
                      ? compactFallbackNote ?? market.notes ?? copy.sessionOnlyFallback
                      : quote?.changeAbsolute === null ||
                          quote?.changeAbsolute === undefined
                        ? copy.variationUnavailable
                        : `${formatSignedMoney(
                            quote.changeAbsolute,
                            currency,
                            dateLocale
                          )} • ${formatSignedPercent(
                            quote.changePercent,
                            dateLocale
                          )}`}
                  </strong>
                  <span className="compact-stat-note">
                    {market.notes ?? copy.sessionOnlyFallback}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
