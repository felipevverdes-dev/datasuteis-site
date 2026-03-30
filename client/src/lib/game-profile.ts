export type PlayerNameValidationReason =
  | "empty"
  | "minLength"
  | "maxLength"
  | "allowedCharacters"
  | "reservedTerms"
  | "offensiveTerms"
  | "repeatedCharacters";

export type PlayerNameValidationResult =
  | { ok: true; value: string }
  | { ok: false; value: string; reason: PlayerNameValidationReason };

export interface BrowserRankingEntryBase {
  name: string;
  difficulty: string;
  date: string;
}

interface PlayerNameOptions {
  maxLength?: number;
  minLength?: number;
  allowHyphen?: boolean;
  allowUnderscore?: boolean;
}

const DEFAULT_MIN_LENGTH = 3;
const DEFAULT_MAX_LENGTH = 12;
const TOP_LIMIT = 10;

const BLOCKED_RESERVED_TERMS = [
  "admin",
  "adm",
  "root",
  "null",
  "undefined",
  "script",
  "html",
  "http",
  "https",
  "www",
];

const BLOCKED_OFFENSIVE_TERMS = [
  "arromb",
  "babaca",
  "bosta",
  "burro",
  "caralh",
  "desgrac",
  "fdp",
  "foda",
  "idiot",
  "imbecil",
  "merda",
  "naz",
  "otari",
  "porra",
  "puta",
  "puto",
  "racist",
  "viad",
];

function buildAllowedPattern(options?: PlayerNameOptions) {
  const extras = `${options?.allowHyphen ? "-" : ""}${options?.allowUnderscore ? "_" : ""}`;
  return new RegExp(`[^A-Za-zÀ-ÖØ-öø-ÿ0-9 ${extras}]+`, "g");
}

function buildValidationPattern(options?: PlayerNameOptions) {
  const extras = `${options?.allowHyphen ? "-" : ""}${options?.allowUnderscore ? "_" : ""}`;
  return new RegExp(`^[A-Za-zÀ-ÖØ-öø-ÿ0-9 ${extras}]+$`);
}

function foldName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function sanitizePlayerName(value: string, options?: PlayerNameOptions) {
  const maxLength = options?.maxLength ?? DEFAULT_MAX_LENGTH;
  return value
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .replace(buildAllowedPattern(options), "")
    .trim()
    .slice(0, maxLength);
}

export function validatePlayerName(
  value: string,
  options?: PlayerNameOptions
): PlayerNameValidationResult {
  const minLength = options?.minLength ?? DEFAULT_MIN_LENGTH;
  const maxLength = options?.maxLength ?? DEFAULT_MAX_LENGTH;
  const normalized = sanitizePlayerName(value, options).trim();

  if (!normalized) {
    return { ok: false, value: normalized, reason: "empty" };
  }

  if (normalized.length < minLength) {
    return { ok: false, value: normalized, reason: "minLength" };
  }

  if (normalized.length > maxLength) {
    return { ok: false, value: normalized, reason: "maxLength" };
  }

  if (!buildValidationPattern(options).test(normalized)) {
    return { ok: false, value: normalized, reason: "allowedCharacters" };
  }

  const folded = foldName(normalized);
  if (BLOCKED_RESERVED_TERMS.some(term => folded.includes(term))) {
    return { ok: false, value: normalized, reason: "reservedTerms" };
  }

  if (BLOCKED_OFFENSIVE_TERMS.some(term => folded.includes(term))) {
    return { ok: false, value: normalized, reason: "offensiveTerms" };
  }

  if (/([a-z0-9])\1{4,}/i.test(folded.replace(/\s+/g, ""))) {
    return { ok: false, value: normalized, reason: "repeatedCharacters" };
  }

  return { ok: true, value: normalized };
}

export function loadBrowserRanking<T>(
  storageKey: string,
  isValid: (entry: unknown) => entry is T
) {
  if (typeof window === "undefined") {
    return [] as T[];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return [] as T[];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [] as T[];
    }

    return parsed.filter(isValid);
  } catch {
    return [] as T[];
  }
}

export function saveBrowserRanking<T>(storageKey: string, entries: T[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(entries));
  } catch {
    // Ignore storage failures and keep the game functional.
  }
}

export function getDifficultyRanking<T extends BrowserRankingEntryBase>(
  entries: T[],
  difficulty: string,
  compare: (a: T, b: T) => number
) {
  return entries
    .filter(entry => entry.difficulty === difficulty)
    .sort(compare)
    .slice(0, TOP_LIMIT);
}

export function getRankingPlacement<T extends BrowserRankingEntryBase>(
  entries: T[],
  difficulty: string,
  candidate: T,
  compare: (a: T, b: T) => number
) {
  const ranking = getDifficultyRanking(entries, difficulty, compare);
  const nextRanking = [...ranking, candidate].sort(compare).slice(0, TOP_LIMIT);
  const placement = nextRanking.findIndex(entry => compare(entry, candidate) === 0);
  return placement >= 0 ? placement + 1 : null;
}

export function insertRankingEntry<T extends BrowserRankingEntryBase>(
  entries: T[],
  storageKey: string,
  candidate: T,
  compare: (a: T, b: T) => number
) {
  const nextDifficultyRanking = getDifficultyRanking(
    [...entries.filter(entry => entry.difficulty !== candidate.difficulty), candidate, ...entries.filter(entry => entry.difficulty === candidate.difficulty)],
    candidate.difficulty,
    compare
  );
  const nextEntries = [
    ...entries.filter(entry => entry.difficulty !== candidate.difficulty),
    ...nextDifficultyRanking,
  ];
  saveBrowserRanking(storageKey, nextEntries);
  const position = nextDifficultyRanking.findIndex(entry => compare(entry, candidate) === 0);
  return { entries: nextEntries, position: position >= 0 ? position + 1 : null };
}

export function compareTimedRankingAsc<
  T extends BrowserRankingEntryBase & { time: number }
>(a: T, b: T) {
  if (a.time !== b.time) {
    return a.time - b.time;
  }

  if (a.date !== b.date) {
    return a.date.localeCompare(b.date);
  }

  return a.name.localeCompare(b.name);
}

export function compareScoredRankingDesc<
  T extends BrowserRankingEntryBase & { score: number; time: number }
>(a: T, b: T) {
  if (a.score !== b.score) {
    return b.score - a.score;
  }

  if (a.time !== b.time) {
    return a.time - b.time;
  }

  if (a.date !== b.date) {
    return a.date.localeCompare(b.date);
  }

  return a.name.localeCompare(b.name);
}
