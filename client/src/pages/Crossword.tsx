import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import ConfettiBurst from "@/components/ConfettiBurst";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CoreNavigationBlock from "@/components/layout/CoreNavigationBlock";
import FloatingSectionNav from "@/components/layout/FloatingSectionNav";
import GameLanguageNotice from "@/components/layout/GameLanguageNotice";
import PageIntroNavigation from "@/components/layout/PageIntroNavigation";
import { useI18n } from "@/contexts/LanguageContext";
import { trackAnalyticsEvent } from "@/lib/analytics";
import {
  createCrosswordPuzzle,
  type CrosswordDifficulty,
} from "@/lib/crossword";
import {
  compareScoredRankingDesc,
  getDifficultyRanking,
  getRankingPlacement,
  insertRankingEntry,
  loadBrowserRanking,
  sanitizePlayerName,
  validatePlayerName,
} from "@/lib/game-profile";
import { buildBreadcrumbSchema, getNavigationLabels } from "@/lib/navigation";
import { getBackToTopLabel, getToolPageNavItems } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";

interface CrosswordRankingEntry {
  name: string;
  score: number;
  time: number;
  difficulty: CrosswordDifficulty;
  date: string;
}

const STORAGE_KEY = "datasuteis_crossword_ranking_v1";
const FAQ_ITEMS = [
  {
    question: "As palavras cruzadas são grátis?",
    answer: "Sim. A partida roda no navegador sem cadastro e sem pagamento.",
  },
  {
    question: "Dá para jogar no celular?",
    answer:
      "Sim. No celular, toque em uma casa e use o teclado nativo do aparelho.",
  },
  {
    question: "O jogo tem dicas?",
    answer:
      "Sim. Você pode revelar uma letra aleatória ou a palavra ativa inteira.",
  },
  {
    question: "Cada partida muda?",
    answer:
      "Sim. Cada novo jogo sorteia um tema e uma combinação diferente de palavras.",
  },
  {
    question: "Posso usar teclado?",
    answer: "Sim. Setas movem o cursor, Tab troca a direção e Backspace apaga.",
  },
  {
    question: "Existe ranking?",
    answer:
      "Sim. O Top 10 é salvo localmente neste navegador e separado por dificuldade.",
  },
] as const;

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

function isValidRankingEntry(entry: unknown): entry is CrosswordRankingEntry {
  if (!entry || typeof entry !== "object") {
    return false;
  }

  const candidate = entry as Partial<CrosswordRankingEntry>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.score === "number" &&
    typeof candidate.time === "number" &&
    typeof candidate.date === "string" &&
    typeof candidate.difficulty === "string"
  );
}

const DIFFICULTY_LABELS: Record<CrosswordDifficulty, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
  expert: "Expert",
};

function sortCluesByPriority<
  T extends { cluePriority: "required" | "recommended"; number: number },
>(items: T[]) {
  return [...items].sort((left, right) => {
    if (left.cluePriority !== right.cluePriority) {
      return left.cluePriority === "required" ? -1 : 1;
    }
    return left.number - right.number;
  });
}

export default function Crossword() {
  const { language } = useI18n();
  const navigationLabels = getNavigationLabels(language);
  const [puzzle, setPuzzle] = useState(() => createCrosswordPuzzle("easy"));
  const [filled, setFilled] = useState<Record<number, string>>({});
  const [startedAt, setStartedAt] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [completedTime, setCompletedTime] = useState<number | null>(null);
  const [victoryOpen, setVictoryOpen] = useState(false);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [revealedLetters, setRevealedLetters] = useState(0);
  const [revealedWords, setRevealedWords] = useState(0);
  const [wrongCells, setWrongCells] = useState<number[]>([]);
  const [rankingEntries, setRankingEntries] = useState(() =>
    loadBrowserRanking(STORAGE_KEY, isValidRankingEntry)
  );
  const [playerName, setPlayerName] = useState("");
  const [playerError, setPlayerError] = useState("");
  const [savedPosition, setSavedPosition] = useState<number | null>(null);
  const [usesNativeMobileInput, setUsesNativeMobileInput] = useState(false);
  const cellRefs = useRef<Array<HTMLInputElement | HTMLButtonElement | null>>(
    []
  );

  const difficulty = puzzle.difficulty;
  const placements = useMemo(
    () => [...puzzle.across, ...puzzle.down],
    [puzzle.across, puzzle.down]
  );
  const placementById = useMemo(
    () => new Map(placements.map(placement => [placement.id, placement])),
    [placements]
  );
  const activePlacement = useMemo(() => {
    if (activeCell === null) {
      return null;
    }

    const cell = puzzle.cells[activeCell];
    if (!cell) {
      return null;
    }

    const preferredId = direction === "across" ? cell.acrossId : cell.downId;
    return (
      (preferredId ? placementById.get(preferredId) : null) ??
      (cell.acrossId ? placementById.get(cell.acrossId) : null) ??
      (cell.downId ? placementById.get(cell.downId) : null) ??
      null
    );
  }, [activeCell, direction, placementById, puzzle.cells]);
  const correctCount = useMemo(
    () =>
      puzzle.cells.reduce((count, cell) => {
        if (!cell) {
          return count;
        }
        return count + ((filled[cell.index] ?? "") === cell.solution ? 1 : 0);
      }, 0),
    [filled, puzzle.cells]
  );
  const progress = Math.round((correctCount / puzzle.totalLetters) * 100);
  const score = Math.max(
    0,
    1600 +
      correctCount * 8 -
      elapsed * 2 -
      revealedLetters * 30 -
      revealedWords * 90
  );
  const ranking = useMemo(
    () =>
      getDifficultyRanking(
        rankingEntries,
        difficulty,
        compareScoredRankingDesc
      ),
    [difficulty, rankingEntries]
  );
  const rankingPlacement =
    completedTime !== null && savedPosition === null
      ? getRankingPlacement(
          rankingEntries,
          difficulty,
          {
            name: "__candidate__",
            score,
            time: completedTime,
            difficulty,
            date: "9999-12-31",
          },
          compareScoredRankingDesc
        )
      : null;
  const keyboardLetters = useMemo(
    () =>
      Array.from(
        new Set(puzzle.cells.filter(Boolean).map(cell => cell!.solution))
      ).sort(),
    [puzzle.cells]
  );
  const clueCount = puzzle.across.length + puzzle.down.length;
  const acrossClues = useMemo(
    () => sortCluesByPriority(puzzle.across),
    [puzzle.across]
  );
  const downClues = useMemo(
    () => sortCluesByPriority(puzzle.down),
    [puzzle.down]
  );
  const essentialClues = useMemo(
    () =>
      placements.filter(placement => placement.cluePriority === "required")
        .length,
    [placements]
  );
  const navItems = getToolPageNavItems(language);
  const topLabel = getBackToTopLabel(language);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.games },
    { label: navigationLabels.brainGames, href: "/jogos/" },
    { label: "Palavras Cruzadas" },
  ];

  usePageSeo({
    title: "Palavras Cruzadas Online Grátis | Com Dicas e Níveis | Datas Úteis",
    description:
      "Resolva palavras cruzadas online grátis com dicas, teclado virtual, níveis de dificuldade, pontuação e ranking. Jogue no celular ou computador.",
    path: "/jogos/palavras-cruzadas/",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Game",
        name: "Palavras Cruzadas Online Grátis",
        url: "https://datasuteis.com.br/jogos/palavras-cruzadas/",
        description:
          "Palavras cruzadas com dicas, teclado virtual, ranking local e quatro níveis de dificuldade.",
      },
      {
        ...buildBreadcrumbSchema([
          { label: navigationLabels.home, href: "/" },
          { label: navigationLabels.games },
          { label: navigationLabels.brainGames, href: "/jogos/" },
          {
            label: "Palavras Cruzadas",
            href: "/jogos/palavras-cruzadas/",
          },
        ]),
      },
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Palavras Cruzadas Online Grátis",
        url: "https://datasuteis.com.br/jogos/palavras-cruzadas/",
      },
    ],
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(pointer: coarse), (max-width: 767px)"
    );
    const updateMode = () => {
      setUsesNativeMobileInput(mediaQuery.matches);
    };

    updateMode();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMode);
      return () => {
        mediaQuery.removeEventListener("change", updateMode);
      };
    }

    mediaQuery.addListener(updateMode);
    return () => {
      mediaQuery.removeListener(updateMode);
    };
  }, []);

  useEffect(() => {
    if (activeCell !== null) {
      return;
    }

    setActiveCell(puzzle.cells.find(cell => cell)?.index ?? null);
  }, [activeCell, puzzle.cells]);

  useEffect(() => {
    if (!usesNativeMobileInput || activeCell === null) {
      return;
    }

    const target = cellRefs.current[activeCell];
    if (!target || document.activeElement === target) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      target.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [activeCell, usesNativeMobileInput]);

  useEffect(() => {
    if (completedTime !== null) {
      return;
    }

    const timer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [completedTime, startedAt]);

  useEffect(() => {
    const hasWon = puzzle.cells.every(
      cell => !cell || (filled[cell.index] ?? "") === cell.solution
    );
    if (completedTime !== null || !hasWon) {
      return;
    }

    setCompletedTime(elapsed);
    setVictoryOpen(true);
    toast.success("Palavras cruzadas concluídas.");
    trackAnalyticsEvent("game_completed", {
      game_name: "crossword",
      difficulty,
      time_seconds: elapsed,
      theme: puzzle.theme,
    });
  }, [completedTime, difficulty, elapsed, filled, puzzle.cells, puzzle.theme]);

  useEffect(() => {
    if (usesNativeMobileInput) {
      return;
    }

    function handleKey(event: KeyboardEvent) {
      if (
        completedTime !== null ||
        activeCell === null ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      const upperKey = event.key.toUpperCase();
      if (/^[A-Z]$/.test(upperKey)) {
        event.preventDefault();
        fillCell(upperKey);
        return;
      }

      if (event.key === "Tab") {
        event.preventDefault();
        setDirection(current => (current === "across" ? "down" : "across"));
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        clearCell();
        return;
      }

      const movement = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      } as const;

      if (event.key in movement) {
        event.preventDefault();
        const [rowDelta, colDelta] =
          movement[event.key as keyof typeof movement];
        moveCursor(rowDelta, colDelta);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [
    activeCell,
    completedTime,
    activePlacement,
    filled,
    puzzle.cells,
    usesNativeMobileInput,
  ]);

  function resetPuzzle(nextDifficulty: CrosswordDifficulty) {
    const nextPuzzle = createCrosswordPuzzle(nextDifficulty, {
      avoidTheme: puzzle.themeId,
      avoidSignature: puzzle.signature,
    });
    setPuzzle(nextPuzzle);
    setFilled({});
    setStartedAt(Date.now());
    setElapsed(0);
    setCompletedTime(null);
    setVictoryOpen(false);
    setActiveCell(nextPuzzle.cells.find(cell => cell)?.index ?? null);
    setDirection("across");
    setRevealedLetters(0);
    setRevealedWords(0);
    setWrongCells([]);
    setPlayerName("");
    setPlayerError("");
    setSavedPosition(null);
    trackAnalyticsEvent("game_started", {
      game_name: "crossword",
      difficulty: nextDifficulty,
      theme: nextPuzzle.theme,
    });
  }

  function renderKeyboard() {
    return (
      <div className="card-base p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold">Teclado na tela</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {activePlacement
                ? `Palavra ativa: ${activePlacement.number} ${direction === "across" ? "horizontal" : "vertical"}`
                : "Clique numa casa ou numa dica para começar."}
            </p>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
            {keyboardLetters.length} letras
          </span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-7 lg:grid-cols-6 2xl:grid-cols-4">
          {keyboardLetters.map(letter => (
            <button
              key={letter}
              type="button"
              onClick={() => fillCell(letter)}
              className="h-9 rounded-xl border border-border bg-secondary text-sm font-semibold transition-colors hover:bg-secondary/80"
              aria-label={`Preencher letra ${letter}`}
            >
              {letter}
            </button>
          ))}
          <button
            type="button"
            onClick={clearCell}
            className="col-span-full h-9 rounded-xl border border-border bg-background text-sm font-semibold transition-colors hover:bg-secondary/60"
          >
            Apagar letra
          </button>
        </div>
      </div>
    );
  }

  function getPlacementForCell(
    cellIndex: number,
    preferredDirection: "across" | "down" = direction
  ) {
    const cell = puzzle.cells[cellIndex];
    if (!cell) {
      return null;
    }

    const preferredId =
      preferredDirection === "across" ? cell.acrossId : cell.downId;

    return (
      (preferredId ? placementById.get(preferredId) : null) ??
      (cell.acrossId ? placementById.get(cell.acrossId) : null) ??
      (cell.downId ? placementById.get(cell.downId) : null) ??
      null
    );
  }

  function getNextCellIndex(
    step: number,
    currentCellIndex = activeCell,
    placement = activePlacement
  ) {
    if (!placement || currentCellIndex === null) {
      return currentCellIndex;
    }

    const currentPosition = placement.cells.indexOf(currentCellIndex);
    if (currentPosition === -1) {
      return currentCellIndex;
    }

    return placement.cells[
      Math.min(placement.cells.length - 1, Math.max(0, currentPosition + step))
    ];
  }

  function fillCell(value: string) {
    if (activeCell === null) {
      return;
    }

    setFilled(current => ({ ...current, [activeCell]: value }));
    setWrongCells([]);
    if (activePlacement) {
      const nextIndex = getNextCellIndex(1);
      setActiveCell(nextIndex ?? activeCell);
    }
  }

  function clearCell() {
    if (activeCell === null) {
      return;
    }

    setFilled(current => {
      const next = { ...current };
      if (next[activeCell]) {
        delete next[activeCell];
        return next;
      }

      const previousIndex = getNextCellIndex(-1);
      if (previousIndex !== undefined && previousIndex !== null) {
        delete next[previousIndex];
        setActiveCell(previousIndex);
      }
      return next;
    });
    setWrongCells([]);
  }

  function moveCursor(rowDelta: number, colDelta: number) {
    if (activeCell === null) {
      return;
    }

    const cell = puzzle.cells[activeCell];
    if (!cell) {
      return;
    }

    let row = cell.row + rowDelta;
    let col = cell.col + colDelta;
    while (row >= 0 && col >= 0 && row < puzzle.height && col < puzzle.width) {
      const next = puzzle.cells[row * puzzle.width + col];
      if (next) {
        setActiveCell(next.index);
        return;
      }
      row += rowDelta;
      col += colDelta;
    }
  }

  function setActiveFromClue(placementId: string) {
    const nextPlacement = placementById.get(placementId);
    if (!nextPlacement) {
      return;
    }
    setActiveCell(nextPlacement.cells[0]);
    setDirection(nextPlacement.direction);
  }

  function handleMobileCellChange(cellIndex: number, rawValue: string) {
    const nextValue = rawValue
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(-1);
    const placement = getPlacementForCell(cellIndex);

    setActiveCell(cellIndex);
    setWrongCells([]);

    if (!nextValue) {
      setFilled(current => {
        const next = { ...current };
        delete next[cellIndex];
        return next;
      });
      return;
    }

    setFilled(current => ({ ...current, [cellIndex]: nextValue }));

    if (placement) {
      const nextIndex = getNextCellIndex(1, cellIndex, placement);
      setActiveCell(nextIndex ?? cellIndex);
    }
  }

  function handleMobileCellKeyDown(
    cellIndex: number,
    event: ReactKeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Backspace" && !(filled[cellIndex] ?? "")) {
      const placement = getPlacementForCell(cellIndex);
      const previousIndex = getNextCellIndex(-1, cellIndex, placement);
      if (previousIndex !== null && previousIndex !== cellIndex) {
        event.preventDefault();
        setActiveCell(previousIndex);
      }
      return;
    }

    if (event.key === "Tab") {
      setDirection(current => (current === "across" ? "down" : "across"));
      return;
    }

    const movement = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    } as const;

    if (event.key in movement) {
      event.preventDefault();
      const [rowDelta, colDelta] = movement[event.key as keyof typeof movement];
      setActiveCell(cellIndex);
      moveCursor(rowDelta, colDelta);
    }
  }

  function handleRevealLetter() {
    if (!activePlacement || completedTime !== null) {
      return;
    }

    const hiddenCells = activePlacement.cells.filter(cellIndex => {
      const cell = puzzle.cells[cellIndex];
      return cell && (filled[cellIndex] ?? "") !== cell.solution;
    });

    if (!hiddenCells.length) {
      return;
    }

    const selected =
      hiddenCells[Math.floor(Math.random() * hiddenCells.length)];
    const cell = puzzle.cells[selected];
    if (!cell) {
      return;
    }
    setFilled(current => ({ ...current, [selected]: cell.solution }));
    setRevealedLetters(current => current + 1);
  }

  function handleRevealWord() {
    if (!activePlacement || completedTime !== null) {
      return;
    }

    setFilled(current => {
      const next = { ...current };
      activePlacement.cells.forEach(cellIndex => {
        const cell = puzzle.cells[cellIndex];
        if (cell) {
          next[cellIndex] = cell.solution;
        }
      });
      return next;
    });
    setRevealedWords(current => current + 1);
  }

  function handleVerify() {
    const invalid = puzzle.cells
      .filter(
        cell =>
          cell && filled[cell.index] && filled[cell.index] !== cell.solution
      )
      .map(cell => cell!.index);
    setWrongCells(invalid);
    toast(
      invalid.length
        ? `${invalid.length} letra(s) precisam de revisão.`
        : "Nenhum erro encontrado."
    );
  }

  function handleSaveRanking() {
    if (completedTime === null || savedPosition !== null) {
      return;
    }

    const validation = validatePlayerName(playerName, { maxLength: 12 });
    if (!validation.ok) {
      setPlayerError(
        {
          empty: "Informe um nome para registrar a partida.",
          minLength: "Use pelo menos 3 caracteres.",
          maxLength: "Use no máximo 12 caracteres.",
          allowedCharacters: "Use apenas letras, números e espaço.",
          reservedTerms: "Esse nome não pode ser usado no ranking.",
          offensiveTerms: "Escolha um nome mais apropriado para o ranking.",
          repeatedCharacters: "Escolha um nome menos repetitivo.",
        }[validation.reason]
      );
      return;
    }

    const result = insertRankingEntry(
      rankingEntries,
      STORAGE_KEY,
      {
        name: validation.value,
        score,
        time: completedTime,
        difficulty,
        date: new Date().toISOString().slice(0, 10),
      },
      compareScoredRankingDesc
    );

    if (!result.position) {
      setPlayerError("A partida não entrou no Top 10 desta dificuldade.");
      return;
    }

    setRankingEntries(result.entries);
    setSavedPosition(result.position);
    setPlayerError("");
    setPlayerName(validation.value);
    trackAnalyticsEvent("ranking_saved", {
      game_name: "crossword",
      difficulty,
      position: result.position,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" role="main" className="relative">
        <section className="hero border-b border-border bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto">
            <div className="max-w-4xl">
              <PageIntroNavigation
                breadcrumbs={breadcrumbs}
                breadcrumbAriaLabel={navigationLabels.breadcrumb}
                backLabel={navigationLabels.back}
                backAriaLabel={navigationLabels.backAria}
              />
              <h1 className="mt-4 text-3xl font-bold text-primary md:text-4xl">
                Palavras Cruzadas Online Grátis
              </h1>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                Resolva uma grade compacta com tema sorteado, dicas completas,
                teclado virtual e ranking local por dificuldade.
              </p>
            </div>
          </div>
        </section>

        <FloatingSectionNav items={navItems} topLabel={topLabel} />

        <section className="section-md">
          <div className="container mx-auto page-stack">
            <GameLanguageNotice />

            <section id="ferramenta" className="section-anchor">
              <div className="card-base relative p-5 sm:p-6" data-game-focus>
                <ConfettiBurst active={completedTime !== null} />
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        "easy",
                        "medium",
                        "hard",
                        "expert",
                      ] as CrosswordDifficulty[]
                    ).map(level => (
                      <button
                        key={level}
                        type="button"
                        className={cn(
                          "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                          difficulty === level
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary hover:bg-secondary/80"
                        )}
                        onClick={() => resetPuzzle(level)}
                      >
                        {DIFFICULTY_LABELS[level]}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full bg-secondary px-3 py-2">
                      Tempo: {formatElapsed(elapsed)}
                    </span>
                    <span className="rounded-full bg-secondary px-3 py-2">
                      Progresso: {progress}%
                    </span>
                    <span className="rounded-full bg-secondary px-3 py-2">
                      Pontos: {score}
                    </span>
                    <span className="rounded-full bg-secondary px-3 py-2">
                      Palavras: {placements.length}
                    </span>
                    <span className="rounded-full bg-secondary px-3 py-2">
                      Pistas: {clueCount}
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="h-3 rounded-full bg-secondary">
                    <div
                      className="h-3 rounded-full bg-primary transition-[width]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="space-y-5">
                    <div className="text-center">
                      <div className="game-theme-chip">
                        Pistas sobre: {puzzle.theme}
                      </div>
                    </div>

                    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_200px] xl:items-start">
                      <div
                        className="game-interactive-area protected-interactive mx-auto w-full max-w-[720px]"
                        onContextMenu={event => event.preventDefault()}
                      >
                        <div
                          className="grid gap-1 rounded-3xl bg-primary/10 p-2.5 sm:p-3"
                          style={{
                            gridTemplateColumns: `repeat(${puzzle.width}, minmax(0, 1fr))`,
                          }}
                        >
                          {puzzle.cells.map((cell, index) =>
                            cell ? (
                              usesNativeMobileInput ? (
                                <div
                                  key={index}
                                  className={cn(
                                    "relative aspect-square rounded-lg border border-border bg-background",
                                    activePlacement?.cells.includes(
                                      cell.index
                                    ) && "bg-primary/10",
                                    activeCell === cell.index &&
                                      "ring-2 ring-primary/35",
                                    wrongCells.includes(cell.index) &&
                                      "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-200"
                                  )}
                                >
                                  {cell.number ? (
                                    <span className="absolute left-1 top-1 z-10 text-[10px] font-bold text-muted-foreground">
                                      {cell.number}
                                    </span>
                                  ) : null}
                                  <input
                                    key={index}
                                    ref={element => {
                                      cellRefs.current[index] = element;
                                    }}
                                    type="text"
                                    inputMode="text"
                                    autoCapitalize="characters"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    enterKeyHint="next"
                                    maxLength={1}
                                    value={filled[cell.index] ?? ""}
                                    onFocus={() => {
                                      setActiveCell(cell.index);
                                      setDirection(
                                        cell.acrossId ? "across" : "down"
                                      );
                                    }}
                                    onClick={() => {
                                      if (
                                        activeCell === cell.index &&
                                        cell.acrossId &&
                                        cell.downId
                                      ) {
                                        setDirection(current =>
                                          current === "across"
                                            ? "down"
                                            : "across"
                                        );
                                      }
                                    }}
                                    onChange={event =>
                                      handleMobileCellChange(
                                        cell.index,
                                        event.target.value
                                      )
                                    }
                                    onKeyDown={event =>
                                      handleMobileCellKeyDown(cell.index, event)
                                    }
                                    className="h-full w-full rounded-lg bg-transparent px-0 text-center text-sm font-semibold uppercase caret-primary sm:text-base"
                                    aria-label={
                                      cell.number
                                        ? `Casa ${cell.number}`
                                        : "Casa da palavra cruzada"
                                    }
                                  />
                                </div>
                              ) : (
                                <button
                                  key={index}
                                  ref={element => {
                                    cellRefs.current[index] = element;
                                  }}
                                  type="button"
                                  onClick={() => {
                                    if (
                                      activeCell === cell.index &&
                                      cell.acrossId &&
                                      cell.downId
                                    ) {
                                      setDirection(current =>
                                        current === "across" ? "down" : "across"
                                      );
                                    } else {
                                      setActiveCell(cell.index);
                                      setDirection(
                                        cell.acrossId ? "across" : "down"
                                      );
                                    }
                                  }}
                                  className={cn(
                                    "relative aspect-square rounded-lg border border-border bg-background px-0 text-center text-sm font-semibold uppercase sm:text-base",
                                    activePlacement?.cells.includes(
                                      cell.index
                                    ) && "bg-primary/10",
                                    activeCell === cell.index &&
                                      "ring-2 ring-primary/35",
                                    wrongCells.includes(cell.index) &&
                                      "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-200"
                                  )}
                                  aria-label={
                                    cell.number
                                      ? `Casa ${cell.number}`
                                      : "Casa da palavra cruzada"
                                  }
                                >
                                  {cell.number ? (
                                    <span className="absolute left-1 top-1 text-[10px] font-bold text-muted-foreground">
                                      {cell.number}
                                    </span>
                                  ) : null}
                                  {filled[cell.index] ?? ""}
                                </button>
                              )
                            ) : (
                              <div
                                key={index}
                                className="aspect-square rounded-lg bg-secondary/60"
                              />
                            )
                          )}
                        </div>
                      </div>

                      {!usesNativeMobileInput ? (
                        <div className="xl:sticky xl:top-24">
                          {renderKeyboard()}
                        </div>
                      ) : null}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <button
                        type="button"
                        onClick={handleRevealLetter}
                        className="btn-secondary"
                      >
                        Revelar letra
                      </button>
                      <button
                        type="button"
                        onClick={handleRevealWord}
                        className="btn-secondary"
                      >
                        Revelar palavra
                      </button>
                      <button
                        type="button"
                        onClick={handleVerify}
                        className="btn-secondary"
                      >
                        Verificar
                      </button>
                      <button
                        type="button"
                        onClick={() => resetPuzzle(difficulty)}
                        className="btn-primary"
                      >
                        Novo jogo
                      </button>
                    </div>
                  </div>

                  <aside className="space-y-3">
                    <div className="card-base p-3.5 sm:p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-bold">Dicas horizontais</h2>
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                          {puzzle.across.length}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {essentialClues
                          ? "As essenciais ficam no topo para destravar a grade mais cedo."
                          : "Todas as pistas desta rodada estão aqui."}
                      </p>
                      <div className="mt-3 max-h-[14rem] space-y-1.5 overflow-auto pr-1 md:max-h-[16rem] xl:max-h-[18rem]">
                        {acrossClues.map(placement => (
                          <button
                            key={placement.id}
                            type="button"
                            className={cn(
                              "w-full rounded-xl px-3 py-2 text-left text-[12px] leading-4 sm:text-[13px] sm:leading-5",
                              activePlacement?.id === placement.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary"
                            )}
                            onClick={() => setActiveFromClue(placement.id)}
                            aria-label={`Dica horizontal ${placement.number}: ${placement.entry.clue}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <strong>{placement.number}.</strong>{" "}
                                {placement.entry.clue}
                              </div>
                              <div className="flex flex-col items-end gap-1 text-[11px] font-semibold uppercase tracking-wide">
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-1",
                                    activePlacement?.id === placement.id
                                      ? "bg-primary-foreground/15 text-primary-foreground"
                                      : placement.cluePriority === "required"
                                        ? "bg-primary/10 text-primary"
                                        : "bg-background text-muted-foreground"
                                  )}
                                >
                                  {placement.cluePriority === "required"
                                    ? "Essencial"
                                    : "Apoio"}
                                </span>
                                <span
                                  className={
                                    activePlacement?.id === placement.id
                                      ? "text-primary-foreground/80"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {placement.crossings} cruz.
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="card-base p-3.5 sm:p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-bold">Dicas verticais</h2>
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                          {puzzle.down.length}
                        </span>
                      </div>
                      <div className="mt-3 max-h-[14rem] space-y-1.5 overflow-auto pr-1 md:max-h-[16rem] xl:max-h-[18rem]">
                        {downClues.map(placement => (
                          <button
                            key={placement.id}
                            type="button"
                            className={cn(
                              "w-full rounded-xl px-3 py-2 text-left text-[12px] leading-4 sm:text-[13px] sm:leading-5",
                              activePlacement?.id === placement.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary"
                            )}
                            onClick={() => setActiveFromClue(placement.id)}
                            aria-label={`Dica vertical ${placement.number}: ${placement.entry.clue}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <strong>{placement.number}.</strong>{" "}
                                {placement.entry.clue}
                              </div>
                              <div className="flex flex-col items-end gap-1 text-[11px] font-semibold uppercase tracking-wide">
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-1",
                                    activePlacement?.id === placement.id
                                      ? "bg-primary-foreground/15 text-primary-foreground"
                                      : placement.cluePriority === "required"
                                        ? "bg-primary/10 text-primary"
                                        : "bg-background text-muted-foreground"
                                  )}
                                >
                                  {placement.cluePriority === "required"
                                    ? "Essencial"
                                    : "Apoio"}
                                </span>
                                <span
                                  className={
                                    activePlacement?.id === placement.id
                                      ? "text-primary-foreground/80"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {placement.crossings} cruz.
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </section>

            <div
              id="explicacao"
              className="section-anchor grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
            >
              <section className="space-y-6">
                <div className="card-base p-6">
                  <h2 className="text-2xl font-bold">
                    Como jogar palavras cruzadas
                  </h2>
                  <p className="mt-3 text-muted-foreground">
                    Escolha uma dica horizontal ou vertical, toque nas casas da
                    grade e preencha as letras. No computador, use setas para
                    navegar, Tab para trocar a direção e Backspace para apagar.
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    Comece pelas pistas com selo <strong>Essencial</strong>.
                    Elas ajudam mais quando a palavra ainda tem poucos
                    cruzamentos e dão o contexto mínimo para destravar a grade.
                  </p>
                </div>
                <div id="exemplos" className="section-anchor card-base p-6">
                  <h2 className="text-2xl font-bold">Tema da rodada</h2>
                  <p className="mt-3 text-muted-foreground">
                    A rodada atual traz pistas sobre{" "}
                    <strong>{puzzle.theme}</strong>. Cada novo jogo sorteia um
                    tema e uma combinação diferente de palavras para manter a
                    partida variada.
                  </p>
                </div>
                <div className="card-base p-6">
                  <h2 className="text-2xl font-bold">Recursos da partida</h2>
                  <p className="mt-3 text-muted-foreground">
                    Você pode revelar uma letra, revelar a palavra ativa,
                    verificar erros e acompanhar progresso, tempo e pontuação na
                    mesma tela.
                  </p>
                </div>
                <div className="card-base p-6">
                  <h2 className="text-2xl font-bold">
                    Benefícios das palavras cruzadas
                  </h2>
                  <p className="mt-3 text-muted-foreground">
                    Palavras cruzadas ajudam a manter leitura ativa, vocabulário
                    e atenção a padrões curtos. Funcionam bem como pausa mental
                    rápida sem depender de reflexo ou velocidade extrema.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href="/jogos/sudoku/" className="btn-secondary">
                      Alternar para Sudoku
                    </Link>
                    <Link
                      href="/blog/beneficios-dos-jogos-de-logica/"
                      className="btn-secondary"
                    >
                      Ler sobre jogos de lógica
                    </Link>
                  </div>
                </div>
                <div id="faq" className="section-anchor card-base p-6">
                  <h2 className="text-2xl font-bold">Perguntas frequentes</h2>
                  <div className="mt-4 space-y-3">
                    {FAQ_ITEMS.map(item => (
                      <details
                        key={item.question}
                        className="rounded-2xl bg-secondary px-4 py-3"
                      >
                        <summary className="font-semibold">
                          {item.question}
                        </summary>
                        <p className="mt-3 text-sm text-muted-foreground">
                          {item.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3 text-sm">
                    <Link href="/jogos/" className="btn-secondary">
                      Todos os jogos
                    </Link>
                    <Link
                      href="/jogos/caca-palavras/"
                      className="btn-secondary"
                    >
                      Caça-palavras
                    </Link>
                    <Link href="/jogos/sudoku/" className="btn-secondary">
                      Sudoku
                    </Link>
                  </div>
                </div>
              </section>

              <aside className="space-y-6">
                <div className="card-base p-6">
                  <h2 className="text-xl font-bold">Top 10 por dificuldade</h2>
                  <div className="mt-4 rounded-2xl bg-secondary px-4 py-3 text-sm font-medium">
                    Dificuldade: {DIFFICULTY_LABELS[difficulty]}
                  </div>
                  <div className="mt-4 space-y-3">
                    {ranking.length ? (
                      ranking.map((entry, index) => (
                        <div
                          key={`${entry.name}-${entry.score}-${entry.date}`}
                          className="rounded-2xl bg-secondary/60 px-4 py-3 text-sm"
                        >
                          <p className="font-semibold">
                            {index + 1}. {entry.name}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            {entry.score} pts • {formatElapsed(entry.time)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-2xl bg-secondary/60 px-4 py-4 text-sm text-muted-foreground">
                        Ainda não há partidas registradas nesta dificuldade.
                      </p>
                    )}
                  </div>
                </div>

                <div className="card-base p-6">
                  <h2 className="text-xl font-bold">Registrar pontuação</h2>
                  {completedTime !== null ? (
                    <>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {rankingPlacement
                          ? `Sua partida entra em ${rankingPlacement}º lugar nesta dificuldade.`
                          : "A partida não entrou no Top 10 desta dificuldade."}
                      </p>
                      {rankingPlacement ? (
                        <div className="mt-4 space-y-3">
                          <input
                            type="text"
                            value={playerName}
                            onChange={event => {
                              setPlayerName(
                                sanitizePlayerName(event.target.value, {
                                  maxLength: 12,
                                })
                              );
                              setPlayerError("");
                            }}
                            className="input-base w-full"
                            placeholder="Nome ou apelido"
                          />
                          {playerError ? (
                            <p className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/60 dark:text-rose-200">
                              {playerError}
                            </p>
                          ) : null}
                          {savedPosition !== null ? (
                            <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent">
                              Pontuação registrada em {savedPosition}º lugar.
                            </p>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSaveRanking}
                              className="btn-primary w-full"
                            >
                              Registrar pontuação
                            </button>
                          )}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Termine a grade para tentar entrar no Top 10.
                    </p>
                  )}
                </div>
              </aside>
            </div>

            <CoreNavigationBlock />
          </div>
        </section>
      </main>
      {victoryOpen && completedTime !== null ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="crossword-victory-title"
            className="card-base w-full max-w-md p-6"
          >
            <h2 id="crossword-victory-title" className="text-2xl font-bold">
              Grade concluída
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Você terminou a rodada em{" "}
              <strong>{formatElapsed(completedTime)}</strong> com{" "}
              <strong>{score} pontos</strong>.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {rankingPlacement
                ? `Sua pontuação entra em ${rankingPlacement}º lugar nesta dificuldade.`
                : "A rodada foi concluída, mas a pontuação não entrou no Top 10 desta dificuldade."}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setVictoryOpen(false)}
              >
                Ver ranking
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => resetPuzzle(difficulty)}
              >
                Novo jogo
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <Footer />
    </div>
  );
}
