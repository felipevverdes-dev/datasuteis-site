import {
  compareTimedRankingAsc,
  getDifficultyRanking,
  getRankingPlacement,
  insertRankingEntry,
  loadBrowserRanking,
  sanitizePlayerName,
  type PlayerNameValidationResult,
  saveBrowserRanking,
  validatePlayerName,
} from "@/lib/game-profile";

export type SudokuDifficulty = "easy" | "medium" | "hard" | "expert";
export type SudokuBoard = number[];

export interface SudokuGame {
  difficulty: SudokuDifficulty;
  puzzle: SudokuBoard;
  solution: SudokuBoard;
  clueCount: number;
}

export interface SudokuRankingEntry {
  name: string;
  time: number;
  difficulty: SudokuDifficulty;
  date: string;
}

export type NicknameValidationResult = PlayerNameValidationResult;

export const SUDOKU_RANKING_KEY = "datasuteis_sudoku_ranking_v1";

const BOARD_SIZE = 81;
const GRID_SIZE = 9;
const BLOCK_SIZE = 3;
const TOP_RANKING_LIMIT = 10;

const DIFFICULTY_CLUES: Record<SudokuDifficulty, number> = {
  easy: 40,
  medium: 33,
  hard: 28,
  expert: 24,
};

const VALID_DIFFICULTIES = new Set<SudokuDifficulty>([
  "easy",
  "medium",
  "hard",
  "expert",
]);

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }
  return next;
}

function getRow(index: number) {
  return Math.floor(index / GRID_SIZE);
}

function getColumn(index: number) {
  return index % GRID_SIZE;
}

function getBlock(index: number) {
  return (
    Math.floor(getRow(index) / BLOCK_SIZE) * BLOCK_SIZE +
    Math.floor(getColumn(index) / BLOCK_SIZE)
  );
}

export function getSudokuRow(index: number) {
  return getRow(index);
}

export function getSudokuColumn(index: number) {
  return getColumn(index);
}

export function getSudokuBlock(index: number) {
  return getBlock(index);
}

export function getSudokuDifficultyClues(difficulty: SudokuDifficulty) {
  return DIFFICULTY_CLUES[difficulty];
}

function getCandidates(board: SudokuBoard, index: number) {
  if (board[index] !== 0) {
    return [];
  }

  const unavailable = new Set<number>();
  const row = getRow(index);
  const column = getColumn(index);
  const block = getBlock(index);

  for (let current = 0; current < BOARD_SIZE; current += 1) {
    if (
      getRow(current) === row ||
      getColumn(current) === column ||
      getBlock(current) === block
    ) {
      const value = board[current];
      if (value !== 0) {
        unavailable.add(value);
      }
    }
  }

  return Array.from({ length: GRID_SIZE }, (_, offset) => offset + 1).filter(
    value => !unavailable.has(value)
  );
}

function findNextCell(board: SudokuBoard) {
  let bestIndex = -1;
  let bestCandidates: number[] = [];

  for (let index = 0; index < BOARD_SIZE; index += 1) {
    if (board[index] !== 0) {
      continue;
    }

    const candidates = getCandidates(board, index);
    if (candidates.length === 0) {
      return { index, candidates };
    }

    if (bestIndex === -1 || candidates.length < bestCandidates.length) {
      bestIndex = index;
      bestCandidates = candidates;
    }
  }

  return bestIndex === -1
    ? null
    : { index: bestIndex, candidates: bestCandidates };
}

function solveBoard(board: SudokuBoard): boolean {
  const nextCell = findNextCell(board);
  if (!nextCell) {
    return true;
  }

  const { index, candidates } = nextCell;
  for (const candidate of shuffle(candidates)) {
    board[index] = candidate;
    if (solveBoard(board)) {
      return true;
    }
  }

  board[index] = 0;
  return false;
}

function countSolutions(board: SudokuBoard, limit = 2): number {
  const nextCell = findNextCell(board);
  if (!nextCell) {
    return 1;
  }

  const { index, candidates } = nextCell;
  if (candidates.length === 0) {
    return 0;
  }

  let count = 0;
  for (const candidate of candidates) {
    board[index] = candidate;
    count += countSolutions(board, limit - count);
    if (count >= limit) {
      break;
    }
  }

  board[index] = 0;
  return count;
}

function generateSolvedBoard() {
  const board = Array.from({ length: BOARD_SIZE }, () => 0);
  solveBoard(board);
  return board;
}

function buildPuzzle(solution: SudokuBoard, difficulty: SudokuDifficulty) {
  const targetClues = DIFFICULTY_CLUES[difficulty];
  const puzzle = [...solution];
  let clueCount = BOARD_SIZE;

  for (const index of shuffle(
    Array.from({ length: BOARD_SIZE }, (_, current) => current)
  )) {
    if (clueCount <= targetClues) {
      break;
    }

    const previous = puzzle[index];
    puzzle[index] = 0;

    if (countSolutions([...puzzle], 2) !== 1) {
      puzzle[index] = previous;
      continue;
    }

    clueCount -= 1;
  }

  return { puzzle, clueCount };
}

export function createSudokuGame(difficulty: SudokuDifficulty): SudokuGame {
  const solution = generateSolvedBoard();
  const { puzzle, clueCount } = buildPuzzle(solution, difficulty);
  return {
    difficulty,
    puzzle,
    solution,
    clueCount,
  };
}

function getConflictSet(board: SudokuBoard) {
  const conflicts = new Set<number>();
  const groups: number[][] = [];

  for (let row = 0; row < GRID_SIZE; row += 1) {
    groups.push(
      Array.from({ length: GRID_SIZE }, (_, column) => row * GRID_SIZE + column)
    );
  }

  for (let column = 0; column < GRID_SIZE; column += 1) {
    groups.push(
      Array.from({ length: GRID_SIZE }, (_, row) => row * GRID_SIZE + column)
    );
  }

  for (let blockRow = 0; blockRow < BLOCK_SIZE; blockRow += 1) {
    for (let blockColumn = 0; blockColumn < BLOCK_SIZE; blockColumn += 1) {
      const group: number[] = [];
      for (let row = 0; row < BLOCK_SIZE; row += 1) {
        for (let column = 0; column < BLOCK_SIZE; column += 1) {
          const globalRow = blockRow * BLOCK_SIZE + row;
          const globalColumn = blockColumn * BLOCK_SIZE + column;
          group.push(globalRow * GRID_SIZE + globalColumn);
        }
      }
      groups.push(group);
    }
  }

  for (const group of groups) {
    const entries = new Map<number, number[]>();
    for (const index of group) {
      const value = board[index];
      if (value === 0) {
        continue;
      }

      const current = entries.get(value) ?? [];
      current.push(index);
      entries.set(value, current);
    }

    entries.forEach(indexes => {
      if (indexes.length > 1) {
        indexes.forEach(index => conflicts.add(index));
      }
    });
  }

  return conflicts;
}

export function getEditableConflicts(board: SudokuBoard, puzzle: SudokuBoard) {
  const conflicts = getConflictSet(board);
  return new Set(Array.from(conflicts).filter(index => puzzle[index] === 0));
}

export function clearEditableConflicts(
  board: SudokuBoard,
  puzzle: SudokuBoard
) {
  const conflicts = getEditableConflicts(board, puzzle);
  const nextBoard = [...board];
  conflicts.forEach(index => {
    nextBoard[index] = 0;
  });
  return { board: nextBoard, clearedCount: conflicts.size };
}

export function isSudokuSolved(board: SudokuBoard, solution: SudokuBoard) {
  return board.every((value, index) => value === solution[index]);
}

export function sanitizeSudokuNicknameInput(value: string) {
  return sanitizePlayerName(value, { maxLength: 12 });
}

export function validateSudokuNickname(
  value: string
): NicknameValidationResult {
  return validatePlayerName(value, { maxLength: 12 });
}

function isValidRankingEntry(entry: unknown): entry is SudokuRankingEntry {
  if (!entry || typeof entry !== "object") {
    return false;
  }

  const candidate = entry as Partial<SudokuRankingEntry>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.time === "number" &&
    Number.isFinite(candidate.time) &&
    typeof candidate.date === "string" &&
    VALID_DIFFICULTIES.has(candidate.difficulty as SudokuDifficulty)
  );
}

export function loadSudokuRanking(): SudokuRankingEntry[] {
  return loadBrowserRanking(SUDOKU_RANKING_KEY, isValidRankingEntry);
}

export function saveSudokuRanking(entries: SudokuRankingEntry[]) {
  saveBrowserRanking(SUDOKU_RANKING_KEY, entries);
}

export function getSudokuRankingForDifficulty(
  entries: SudokuRankingEntry[],
  difficulty: SudokuDifficulty
) {
  return getDifficultyRanking(entries, difficulty, compareTimedRankingAsc);
}

export function getSudokuRankingPlacement(
  entries: SudokuRankingEntry[],
  difficulty: SudokuDifficulty,
  time: number
) {
  return getRankingPlacement(
    entries,
    difficulty,
    {
      name: "__candidate__",
      difficulty,
      date: "9999-12-31",
      time,
    },
    compareTimedRankingAsc
  );
}

export function insertSudokuRankingEntry(
  entries: SudokuRankingEntry[],
  entry: SudokuRankingEntry
) {
  return insertRankingEntry(
    entries,
    SUDOKU_RANKING_KEY,
    entry,
    compareTimedRankingAsc
  );
}
