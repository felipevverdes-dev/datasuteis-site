export type WordSearchDifficulty = "easy" | "medium" | "hard" | "expert";

export interface WordSearchPlacedWord {
  id: string;
  label: string;
  answer: string;
  cells: number[];
}

export interface WordSearchGame {
  difficulty: WordSearchDifficulty;
  category: string;
  size: number;
  letters: string[];
  words: WordSearchPlacedWord[];
  usedCells: number[];
}

const DIRECTIONS = [
  { row: -1, col: -1 },
  { row: -1, col: 0 },
  { row: -1, col: 1 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
  { row: 1, col: -1 },
  { row: 1, col: 0 },
  { row: 1, col: 1 },
];

const CONFIG = {
  easy: { size: 10, wordCount: 6, maxHints: 3 },
  medium: { size: 14, wordCount: 10, maxHints: 3 },
  hard: { size: 17, wordCount: 14, maxHints: 3 },
  expert: { size: 20, wordCount: 18, maxHints: 3 },
} as const satisfies Record<
  WordSearchDifficulty,
  { size: number; wordCount: number; maxHints: number }
>;

const WORD_SEARCH_CATEGORIES = [
  {
    name: "Calendário e tempo",
    words: [
      "Agenda",
      "Ano",
      "Calendário",
      "Carnaval",
      "Data",
      "Dezembro",
      "Domingo",
      "Feriado",
      "Janeiro",
      "Julho",
      "Junho",
      "Maio",
      "Mês",
      "Novembro",
      "Outubro",
      "Páscoa",
      "Prazo",
      "Semana",
      "Setembro",
      "Sexta",
      "Tempo",
      "Turno",
    ],
  },
  {
    name: "Tecnologia",
    words: [
      "Arquivo",
      "Backup",
      "Browser",
      "Cache",
      "Celular",
      "Código",
      "Dados",
      "Domínio",
      "Filtro",
      "Fonte",
      "Interface",
      "Internet",
      "Layout",
      "Memória",
      "Monitor",
      "Nuvem",
      "Script",
      "Servidor",
      "Sistema",
      "Teclado",
      "Tela",
      "Vetor",
    ],
  },
  {
    name: "Natureza",
    words: [
      "Areia",
      "Bosque",
      "Brisa",
      "Campo",
      "Chuva",
      "Folha",
      "Floresta",
      "Lago",
      "Luar",
      "Montanha",
      "Nuvem",
      "Oceano",
      "Pedra",
      "Planta",
      "Praia",
      "Raiz",
      "Rio",
      "Semente",
      "Sol",
      "Trilha",
      "Vento",
      "Verde",
    ],
  },
  {
    name: "Culinária",
    words: [
      "Arroz",
      "Azeite",
      "Batata",
      "Bolo",
      "Cacau",
      "Canela",
      "Cozinha",
      "Farofa",
      "Feijão",
      "Forno",
      "Fruta",
      "Leite",
      "Massa",
      "Mel",
      "Molho",
      "Panela",
      "Pimenta",
      "Prato",
      "Receita",
      "Salada",
      "Suco",
      "Tempero",
    ],
  },
  {
    name: "Cidade",
    words: [
      "Avenida",
      "Bairro",
      "Banco",
      "Biblioteca",
      "Cidade",
      "Escola",
      "Estação",
      "Feira",
      "Mercado",
      "Ônibus",
      "Parque",
      "Praça",
      "Prédio",
      "Ponte",
      "Posto",
      "Rua",
      "Semáforo",
      "Teatro",
      "Terminal",
      "Trânsito",
      "Viagem",
      "Viaduto",
    ],
  },
] as const;

function normalizeWord(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase();
}

function shuffle<T>(items: readonly T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }
  return next;
}

function getIndex(size: number, row: number, col: number) {
  return row * size + col;
}

function randomLetter() {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

function buildSelectionCells(
  size: number,
  start: { row: number; col: number },
  direction: { row: number; col: number },
  length: number
) {
  return Array.from({ length }, (_, offset) =>
    getIndex(size, start.row + direction.row * offset, start.col + direction.col * offset)
  );
}

function findPlacement(
  size: number,
  grid: string[],
  answer: string
) {
  let bestPlacement:
    | { row: number; col: number; direction: { row: number; col: number }; overlap: number }
    | null = null;

  for (let attempt = 0; attempt < 200; attempt += 1) {
    const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    const startRow = Math.floor(Math.random() * size);
    const startCol = Math.floor(Math.random() * size);
    const endRow = startRow + direction.row * (answer.length - 1);
    const endCol = startCol + direction.col * (answer.length - 1);

    if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) {
      continue;
    }

    let overlap = 0;
    let valid = true;

    for (let offset = 0; offset < answer.length; offset += 1) {
      const row = startRow + direction.row * offset;
      const col = startCol + direction.col * offset;
      const index = getIndex(size, row, col);
      const current = grid[index];
      if (current && current !== answer[offset]) {
        valid = false;
        break;
      }

      if (current === answer[offset]) {
        overlap += 1;
      }
    }

    if (!valid) {
      continue;
    }

    if (!bestPlacement || overlap > bestPlacement.overlap) {
      bestPlacement = {
        row: startRow,
        col: startCol,
        direction,
        overlap,
      };
    }
  }

  return bestPlacement;
}

function buildGame(difficulty: WordSearchDifficulty) {
  const config = CONFIG[difficulty];
  const size = config.size;
  const category = WORD_SEARCH_CATEGORIES[Math.floor(Math.random() * WORD_SEARCH_CATEGORIES.length)];
  const selection = shuffle(category.words)
    .map(label => ({ label, answer: normalizeWord(label) }))
    .sort((a, b) => b.answer.length - a.answer.length)
    .slice(0, config.wordCount);

  const grid = Array.from({ length: size * size }, () => "");
  const words: WordSearchPlacedWord[] = [];

  for (const word of selection) {
    const placement = findPlacement(size, grid, word.answer);
    if (!placement) {
      return null;
    }

    const cells = buildSelectionCells(
      size,
      { row: placement.row, col: placement.col },
      placement.direction,
      word.answer.length
    );

    cells.forEach((cellIndex, offset) => {
      grid[cellIndex] = word.answer[offset];
    });

    words.push({
      id: `${word.answer}-${cells[0]}`,
      label: word.label,
      answer: word.answer,
      cells,
    });
  }

  const usedCells = Array.from(
    new Set(words.flatMap(word => word.cells))
  );

  const letters = grid.map(letter => letter || randomLetter());
  return {
    difficulty,
    category: category.name,
    size,
    letters,
    words,
    usedCells,
  } satisfies WordSearchGame;
}

export function createWordSearchGame(difficulty: WordSearchDifficulty) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const game = buildGame(difficulty);
    if (game) {
      return game;
    }
  }

  return buildGame("easy")!;
}

export function getWordSearchConfig(difficulty: WordSearchDifficulty) {
  return CONFIG[difficulty];
}

export function getWordSearchSelection(
  size: number,
  startIndex: number,
  endIndex: number
) {
  const startRow = Math.floor(startIndex / size);
  const startCol = startIndex % size;
  const endRow = Math.floor(endIndex / size);
  const endCol = endIndex % size;
  const deltaRow = endRow - startRow;
  const deltaCol = endCol - startCol;
  const stepRow = Math.sign(deltaRow);
  const stepCol = Math.sign(deltaCol);

  if (
    (deltaRow !== 0 && deltaCol !== 0 && Math.abs(deltaRow) !== Math.abs(deltaCol)) ||
    (deltaRow === 0 && deltaCol === 0 ? false : stepRow === 0 && stepCol === 0)
  ) {
    return null;
  }

  const length = Math.max(Math.abs(deltaRow), Math.abs(deltaCol)) + 1;
  return buildSelectionCells(
    size,
    { row: startRow, col: startCol },
    { row: stepRow, col: stepCol },
    length
  );
}

export function shuffleUnusedLetters(letters: string[], usedCells: number[]) {
  const usedSet = new Set(usedCells);
  return letters.map((letter, index) => (usedSet.has(index) ? letter : randomLetter()));
}
