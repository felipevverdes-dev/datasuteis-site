import type {
  GlobalMarketQuote,
  GlobalMarketsSnapshotResponse,
} from "@/lib/world-clock-data";
import { GLOBAL_MARKETS } from "@shared/global-markets";

export class WorldClockApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "WorldClockApiError";
    this.status = status;
  }
}

export function buildFallbackGlobalMarketsSnapshot(
  updatedAt = new Date().toISOString()
): GlobalMarketsSnapshotResponse {
  return {
    updatedAt,
    items: GLOBAL_MARKETS.map(
      market =>
        ({
          marketId: market.id,
          currency: market.index.currency,
          price: null,
          previousClose: null,
          changeAbsolute: null,
          changePercent: null,
          updatedAt: null,
          source: "unavailable",
        }) satisfies GlobalMarketQuote
    ),
  };
}

export async function fetchGlobalMarketsSnapshot() {
  const response = await fetch("/api/markets/global", {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new WorldClockApiError(
      "Não foi possível carregar as cotações globais agora.",
      response.status
    );
  }

  const payload =
    (await response.json()) as Partial<GlobalMarketsSnapshotResponse>;
  if (
    !payload ||
    !Array.isArray(payload.items) ||
    typeof payload.updatedAt !== "string"
  ) {
    throw new WorldClockApiError(
      "A resposta das bolsas globais veio em formato inesperado.",
      response.status
    );
  }

  return payload as GlobalMarketsSnapshotResponse;
}
