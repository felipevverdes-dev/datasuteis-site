export type TicTacToePlayer = "X" | "O";
export type TicTacToeCell = TicTacToePlayer | null;
export type TicTacToeResult = TicTacToePlayer | "draw";
export type TicTacToeMode = "pvp" | "cpu";

export interface TicTacToeHistoryEntry {
  id: string;
  result: TicTacToeResult;
  moves: number;
  date: string;
  starter: TicTacToePlayer;
  mode: TicTacToeMode;
}

export interface TicTacToeStats {
  gamesPlayed: number;
  xWins: number;
  oWins: number;
  draws: number;
  history: TicTacToeHistoryEntry[];
}

const STORAGE_KEY = "datasuteis_tic_tac_toe_stats_v1";
const HISTORY_LIMIT = 8;
const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;
const CORNER_MOVES = [0, 2, 6, 8] as const;
const SIDE_MOVES = [1, 3, 5, 7] as const;

const EMPTY_STATS: TicTacToeStats = {
  gamesPlayed: 0,
  xWins: 0,
  oWins: 0,
  draws: 0,
  history: [],
};

function createHistoryId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getRandomMove(moves: number[]) {
  if (!moves.length) {
    return null;
  }

  return moves[Math.floor(Math.random() * moves.length)] ?? null;
}

function getAvailableMoves(board: TicTacToeCell[]) {
  return board.flatMap((cell, index) => (cell === null ? [index] : []));
}

function findLineFinisher(board: TicTacToeCell[], player: TicTacToePlayer) {
  for (const line of WINNING_LINES) {
    const values = line.map(index => board[index]);
    const playerMarks = values.filter(value => value === player).length;
    const emptyIndex = line.find(index => board[index] === null);

    if (playerMarks === 2 && emptyIndex !== undefined) {
      return emptyIndex;
    }
  }

  return null;
}

function isHistoryEntry(value: unknown): value is TicTacToeHistoryEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TicTacToeHistoryEntry>;
  return (
    typeof candidate.id === "string" &&
    (candidate.result === "X" ||
      candidate.result === "O" ||
      candidate.result === "draw") &&
    typeof candidate.moves === "number" &&
    typeof candidate.date === "string" &&
    (candidate.starter === "X" || candidate.starter === "O") &&
    (candidate.mode === "pvp" || candidate.mode === "cpu")
  );
}

function sanitizeHistoryEntry(value: unknown) {
  if (isHistoryEntry(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<TicTacToeHistoryEntry>;
  if (
    typeof candidate.id === "string" &&
    (candidate.result === "X" ||
      candidate.result === "O" ||
      candidate.result === "draw") &&
    typeof candidate.moves === "number" &&
    typeof candidate.date === "string" &&
    (candidate.starter === "X" || candidate.starter === "O")
  ) {
    return {
      ...candidate,
      mode: "pvp" as TicTacToeMode,
    };
  }

  return null;
}

function sanitizeStats(value: unknown): TicTacToeStats {
  if (!value || typeof value !== "object") {
    return { ...EMPTY_STATS };
  }

  const candidate = value as Partial<TicTacToeStats>;
  return {
    gamesPlayed:
      typeof candidate.gamesPlayed === "number" ? candidate.gamesPlayed : 0,
    xWins: typeof candidate.xWins === "number" ? candidate.xWins : 0,
    oWins: typeof candidate.oWins === "number" ? candidate.oWins : 0,
    draws: typeof candidate.draws === "number" ? candidate.draws : 0,
    history: Array.isArray(candidate.history)
      ? candidate.history
          .map(sanitizeHistoryEntry)
          .filter((entry): entry is TicTacToeHistoryEntry => entry !== null)
          .slice(0, HISTORY_LIMIT)
      : [],
  };
}

function saveStats(stats: TicTacToeStats) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Keep the game functional even if storage is unavailable.
  }
}

export function getWinningLine(board: TicTacToeCell[]) {
  return (
    WINNING_LINES.find(([a, b, c]) => {
      const first = board[a];
      return first !== null && first === board[b] && first === board[c];
    }) ?? null
  );
}

export function isBoardFull(board: TicTacToeCell[]) {
  return board.every(cell => cell !== null);
}

export function getComputerMove(
  board: TicTacToeCell[],
  computerPlayer: TicTacToePlayer = "O",
  humanPlayer: TicTacToePlayer = "X"
) {
  const winningMove = findLineFinisher(board, computerPlayer);
  if (winningMove !== null) {
    return winningMove;
  }

  const blockingMove = findLineFinisher(board, humanPlayer);
  if (blockingMove !== null) {
    return blockingMove;
  }

  if (board[4] === null) {
    return 4;
  }

  const freeCorners = CORNER_MOVES.filter(index => board[index] === null);
  const cornerMove = getRandomMove([...freeCorners]);
  if (cornerMove !== null) {
    return cornerMove;
  }

  const freeSides = SIDE_MOVES.filter(index => board[index] === null);
  const sideMove = getRandomMove([...freeSides]);
  if (sideMove !== null) {
    return sideMove;
  }

  return getRandomMove(getAvailableMoves(board));
}

export function loadTicTacToeStats() {
  if (typeof window === "undefined") {
    return { ...EMPTY_STATS };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...EMPTY_STATS };
    }

    return sanitizeStats(JSON.parse(raw));
  } catch {
    return { ...EMPTY_STATS };
  }
}

export function recordTicTacToeResult(
  currentStats: TicTacToeStats,
  result: TicTacToeResult,
  moves: number,
  starter: TicTacToePlayer,
  mode: TicTacToeMode
) {
  const nextStats: TicTacToeStats = {
    gamesPlayed: currentStats.gamesPlayed + 1,
    xWins: currentStats.xWins + (result === "X" ? 1 : 0),
    oWins: currentStats.oWins + (result === "O" ? 1 : 0),
    draws: currentStats.draws + (result === "draw" ? 1 : 0),
    history: [
      {
        id: createHistoryId(),
        result,
        moves,
        date: new Date().toISOString(),
        starter,
        mode,
      },
      ...currentStats.history,
    ].slice(0, HISTORY_LIMIT),
  };

  saveStats(nextStats);
  return nextStats;
}

export function clearTicTacToeStats() {
  const nextStats = { ...EMPTY_STATS };
  saveStats(nextStats);
  return nextStats;
}
