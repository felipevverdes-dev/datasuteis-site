import {
  type CSSProperties,
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
import ResponsiveSecondarySection from "@/components/games/ResponsiveSecondarySection";
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
  type CrosswordPlacement,
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
import {
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  getNavigationLabels,
} from "@/lib/navigation";
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

interface ClueListSectionProps {
  title: string;
  direction: "across" | "down";
  clues: CrosswordPlacement[];
  activePlacementId?: string;
  onSelect: (placementId: string) => void;
  showMeta?: boolean;
  showHeader?: boolean;
  className?: string;
}

function ClueListSection({
  title,
  direction,
  clues,
  activePlacementId,
  onSelect,
  showMeta = false,
  showHeader = true,
  className,
}: ClueListSectionProps) {
  const directionLabel = direction === "across" ? "horizontal" : "vertical";
  const directionPlural = direction === "across" ? "horizontais" : "verticais";

  return (
    <section className={cn("space-y-3", className)}>
      {showHeader ? (
        <header className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{title}</h2>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
            {clues.length}
          </span>
        </header>
      ) : null}
      <p className="text-xs leading-5 text-muted-foreground">
        Mostrando {clues.length} de {clues.length} pistas {directionPlural}.
      </p>
      <ul className="space-y-1.5">
        {clues.map(placement => (
          <li key={placement.id}>
            <button
              type="button"
              className={cn(
                "crossword-clue-item",
                activePlacementId === placement.id &&
                  "crossword-clue-item-active"
              )}
              onClick={() => onSelect(placement.id)}
              aria-label={`Dica ${directionLabel} ${placement.number}: ${placement.entry.clue}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <strong>{placement.number}.</strong> {placement.entry.clue}
                </div>
                {showMeta ? (
                  <div className="flex flex-col items-end gap-1 text-[11px] font-semibold uppercase tracking-wide">
                    <span
                      className={cn(
                        "rounded-full px-2 py-1",
                        activePlacementId === placement.id
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
                        activePlacementId === placement.id
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      }
                    >
                      {placement.crossings} cruz.
                    </span>
                  </div>
                ) : null}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
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
  const cellRefs = useRef<Array<HTMLInputElement | null>>([]);
  const shouldFocusActiveCellRef = useRef(false);

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
  const boardSizing =
    puzzle.width >= 13
      ? { staticMax: "38rem", vhOffset: "28rem" }
      : { staticMax: "34rem", vhOffset: "28rem" };
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.games },
    { label: navigationLabels.brainGames, href: "/jogos/" },
    { label: "Palavras Cruzadas" },
  ];

  usePageSeo({
    title: "Palavras Cruzadas Online Grátis | Com Dicas e Níveis | Datas Úteis",
    description:
      "Resolva palavras cruzadas online grátis com dicas, teclado nativo no celular, teclado físico no desktop, níveis de dificuldade, pontuação e ranking.",
    path: "/jogos/palavras-cruzadas/",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Game",
        name: "Palavras Cruzadas Online Grátis",
        url: "https://datasuteis.com.br/jogos/palavras-cruzadas/",
        description:
          "Palavras cruzadas com dicas, teclado nativo no celular, teclado físico no desktop, ranking local e quatro níveis de dificuldade.",
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
      buildFaqPageSchema(FAQ_ITEMS),
    ],
  });

  useEffect(() => {
    if (activeCell !== null) {
      return;
    }

    setActiveCell(puzzle.cells.find(cell => cell)?.index ?? null);
  }, [activeCell, puzzle.cells]);

  useEffect(() => {
    if (activeCell === null) {
      return;
    }

    if (!shouldFocusActiveCellRef.current) {
      return;
    }

    shouldFocusActiveCellRef.current = false;

    const target = cellRefs.current[activeCell];
    if (!target || document.activeElement === target) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      target.focus({ preventScroll: true });
      target.select();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [activeCell]);

  function updateActiveCell(index: number | null, focus = false) {
    shouldFocusActiveCellRef.current = focus;
    setActiveCell(index);
  }

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
    updateActiveCell(nextPuzzle.cells.find(cell => cell)?.index ?? null);
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
        updateActiveCell(next.index, true);
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
    updateActiveCell(nextPlacement.cells[0], true);
    setDirection(nextPlacement.direction);
  }

  function handleCellChange(cellIndex: number, rawValue: string) {
    const nextValue = rawValue
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(-1);
    const placement = getPlacementForCell(cellIndex);

    updateActiveCell(cellIndex);
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
      updateActiveCell(nextIndex ?? cellIndex, nextIndex !== cellIndex);
    }
  }

  function handleCellKeyDown(
    cellIndex: number,
    event: ReactKeyboardEvent<HTMLInputElement>
  ) {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    if (event.key === "Backspace" && !(filled[cellIndex] ?? "")) {
      const placement = getPlacementForCell(cellIndex);
      const previousIndex = getNextCellIndex(-1, cellIndex, placement);
      if (previousIndex !== null && previousIndex !== cellIndex) {
        event.preventDefault();
        updateActiveCell(previousIndex, true);
      }
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
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
      updateActiveCell(cellIndex);
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

  const activeClueSummary = activePlacement
    ? `${activePlacement.number}. ${activePlacement.entry.clue}`
    : "Toque em uma casa da grade para abrir a pista ativa.";
  const rankingList = ranking.length ? (
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
  );
  const scoreRegistrationContent =
    completedTime !== null ? (
      <>
        <p className="text-sm text-muted-foreground">
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
      <p className="text-sm text-muted-foreground">
        Termine a grade para tentar entrar no Top 10.
      </p>
    );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" role="main" className="relative">
        <section className="hero-game border-b border-border bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto">
            <div className="max-w-3xl">
              <PageIntroNavigation
                breadcrumbs={breadcrumbs}
                breadcrumbAriaLabel={navigationLabels.breadcrumb}
                backLabel={navigationLabels.back}
                backAriaLabel={navigationLabels.backAria}
              />
              <h1 className="mt-2 text-3xl font-bold text-primary md:text-[2.2rem] lg:text-[1.875rem] xl:text-[2.05rem]">
                Palavras Cruzadas Online Grátis
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground lg:hidden">
                Resolva uma grade compacta com tema sorteado, dicas completas,
                teclado nativo no celular, teclado físico no desktop e ranking
                local por dificuldade.
              </p>
            </div>
          </div>
        </section>

        <FloatingSectionNav items={navItems} topLabel={topLabel} />

        <section className="section-game">
          <div className="container mx-auto game-mobile-container game-page-stack">
            <GameLanguageNotice />

            <section id="ferramenta" className="section-anchor">
              <div className="card-base game-panel relative" data-game-focus>
                <ConfettiBurst active={completedTime !== null} />
                <div className="hidden lg:block game-toolbar">
                  <div className="game-toolbar-row">
                    <div className="flex flex-wrap items-center gap-2">
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
                            "game-difficulty-button",
                            difficulty === level
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary hover:bg-secondary/80"
                          )}
                          onClick={() => resetPuzzle(level)}
                        >
                          {DIFFICULTY_LABELS[level]}
                        </button>
                      ))}

                      <div className="game-theme-chip game-theme-chip-compact">
                        Pistas sobre: {puzzle.theme}
                      </div>
                    </div>

                    <div className="game-meta-row">
                      <span className="game-meta-chip">
                        Tempo: {formatElapsed(elapsed)}
                      </span>
                      <span className="game-meta-chip">
                        Progresso: {progress}%
                      </span>
                      <span className="game-meta-chip">Pontos: {score}</span>
                      <span className="game-meta-chip">
                        Palavras: {placements.length}
                      </span>
                      <span className="game-meta-chip">
                        Pistas: {clueCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 lg:hidden">
                  <div className="h-3 rounded-full bg-secondary">
                    <div
                      className="h-3 rounded-full bg-primary transition-[width]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,22rem)] 2xl:grid-cols-[minmax(0,1fr)_23rem]">
                  <div className="space-y-4">
                    <div
                      className="game-interactive-area protected-interactive game-board-shell game-mobile-stage crossword-board-frame mx-auto w-full"
                      style={
                        {
                          "--game-board-static-max": boardSizing.staticMax,
                          "--game-board-vh-offset": boardSizing.vhOffset,
                        } as CSSProperties
                      }
                      onContextMenu={event => event.preventDefault()}
                    >
                      <div
                        className="crossword-board-grid"
                        style={{
                          gridTemplateColumns: `repeat(${puzzle.width}, minmax(0, 1fr))`,
                        }}
                      >
                        {puzzle.cells.map((cell, index) =>
                          cell ? (
                            <div
                              key={index}
                              className={cn(
                                "crossword-cell",
                                activePlacement?.cells.includes(cell.index) &&
                                  "bg-primary/10",
                                activeCell === cell.index &&
                                  "ring-2 ring-primary/35",
                                wrongCells.includes(cell.index) &&
                                  "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-200"
                              )}
                            >
                              {cell.number ? (
                                <span className="crossword-cell-number">
                                  {cell.number}
                                </span>
                              ) : null}
                              <input
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
                                  updateActiveCell(cell.index);
                                  if (activeCell !== cell.index) {
                                    setDirection(
                                      cell.acrossId ? "across" : "down"
                                    );
                                  }
                                }}
                                onClick={() => {
                                  if (
                                    activeCell === cell.index &&
                                    cell.acrossId &&
                                    cell.downId
                                  ) {
                                    setDirection(current =>
                                      current === "across" ? "down" : "across"
                                    );
                                    return;
                                  }

                                  updateActiveCell(cell.index);
                                  setDirection(
                                    cell.acrossId ? "across" : "down"
                                  );
                                }}
                                onChange={event =>
                                  handleCellChange(cell.index, event.target.value)
                                }
                                onKeyDown={event =>
                                  handleCellKeyDown(cell.index, event)
                                }
                                className="crossword-cell-input"
                                aria-label={
                                  cell.number
                                    ? `Casa ${cell.number}`
                                    : "Casa da palavra cruzada"
                                }
                              />
                            </div>
                          ) : (
                            <div
                              key={index}
                              className="crossword-cell crossword-cell-block"
                            />
                          )
                        )}
                      </div>
                    </div>

                    <div className="game-mobile-primary-actions lg:flex lg:flex-wrap lg:gap-2">
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

                    <div className="space-y-3 lg:hidden">
                      <div className="rounded-2xl bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Pista ativa
                        </p>
                        <p className="mt-2 font-semibold text-foreground">
                          {activePlacement
                            ? `${activePlacement.direction === "across" ? "Horizontal" : "Vertical"} ${activePlacement.number}`
                            : "Selecione uma casa"}
                        </p>
                        <p className="mt-1 leading-6">{activeClueSummary}</p>
                      </div>

                      <div className="game-mobile-status-grid">
                        <div className="compact-stat compact-stat-tight">
                          <span className="compact-stat-label">Tempo</span>
                          <span className="compact-stat-value">
                            {formatElapsed(elapsed)}
                          </span>
                        </div>
                        <div className="compact-stat compact-stat-tight">
                          <span className="compact-stat-label">Pontos</span>
                          <span className="compact-stat-value">{score}</span>
                        </div>
                        <div className="compact-stat compact-stat-tight">
                          <span className="compact-stat-label">Progresso</span>
                          <span className="compact-stat-value">{progress}%</span>
                        </div>
                        <div className="compact-stat compact-stat-tight">
                          <span className="compact-stat-label">Pistas</span>
                          <span className="compact-stat-value">{clueCount}</span>
                        </div>
                      </div>

                      <ResponsiveSecondarySection
                        title="Dicas horizontais"
                        summaryText={`${acrossClues.length} de ${puzzle.across.length} pistas exibidas.`}
                        className="lg:hidden"
                      >
                        <ClueListSection
                          title="Dicas horizontais"
                          direction="across"
                          clues={acrossClues}
                          activePlacementId={activePlacement?.id}
                          onSelect={setActiveFromClue}
                          showHeader={false}
                        />
                      </ResponsiveSecondarySection>

                      <ResponsiveSecondarySection
                        title="Dicas verticais"
                        summaryText={`${downClues.length} de ${puzzle.down.length} pistas exibidas.`}
                        className="lg:hidden"
                      >
                        <ClueListSection
                          title="Dicas verticais"
                          direction="down"
                          clues={downClues}
                          activePlacementId={activePlacement?.id}
                          onSelect={setActiveFromClue}
                          showHeader={false}
                        />
                      </ResponsiveSecondarySection>

                      <ResponsiveSecondarySection
                        title="Nivel e ajuda"
                        summaryText="Troque a dificuldade e veja o tema sorteado."
                        className="lg:hidden"
                      >
                        <div className="space-y-4">
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
                                  "game-difficulty-button",
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
                          <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                            Pistas sobre <strong>{puzzle.theme}</strong>. No
                            teclado físico, use setas para mover, Tab para
                            trocar a direção e Backspace para apagar.
                          </div>
                        </div>
                      </ResponsiveSecondarySection>
                    </div>
                  </div>

                  <aside className="hidden lg:block">
                    <div className="card-base crossword-clues-panel p-3.5 sm:p-4">
                      <p className="text-xs leading-5 text-muted-foreground">
                        {essentialClues
                          ? "As pistas essenciais aparecem primeiro para destravar a grade."
                          : "Todas as pistas da rodada aparecem na lista completa abaixo."}
                      </p>
                      <div className="crossword-clues-panel-scroll mt-3 space-y-5 pr-1">
                        <ClueListSection
                          title="Dicas horizontais"
                          direction="across"
                          clues={acrossClues}
                          activePlacementId={activePlacement?.id}
                          onSelect={setActiveFromClue}
                          showMeta
                        />
                        <ClueListSection
                          title="Dicas verticais"
                          direction="down"
                          clues={downClues}
                          activePlacementId={activePlacement?.id}
                          onSelect={setActiveFromClue}
                          showMeta
                        />
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </section>

            <div className="space-y-3 lg:hidden">
              <ResponsiveSecondarySection
                title="Ranking local"
                summaryText="Top 10 salvo neste navegador por dificuldade."
              >
                <div className="space-y-3">{rankingList}</div>
              </ResponsiveSecondarySection>

              <ResponsiveSecondarySection
                title="Registrar pontuacao"
                summaryText="Salve sua rodada quando a pontuacao entrar no ranking."
                defaultOpenMobile={completedTime !== null}
              >
                <div className="space-y-4">{scoreRegistrationContent}</div>
              </ResponsiveSecondarySection>
            </div>

            <div
              id="explicacao"
              className="section-anchor grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]"
            >
              <section className="space-y-3 lg:space-y-6">
                <ResponsiveSecondarySection
                  title="Como jogar palavras cruzadas"
                  summaryText="Fluxo da grade, tema da rodada e recursos de apoio."
                >
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
                </ResponsiveSecondarySection>
                <ResponsiveSecondarySection
                  id="exemplos"
                  title="Tema da rodada"
                  summaryText="Tema atual e como as partidas variam."
                  className="section-anchor"
                >
                  <p className="mt-3 text-muted-foreground">
                    A rodada atual traz pistas sobre{" "}
                    <strong>{puzzle.theme}</strong>. Cada novo jogo sorteia um
                    tema e uma combinação diferente de palavras para manter a
                    partida variada.
                  </p>
                </ResponsiveSecondarySection>
                <ResponsiveSecondarySection
                  title="Recursos da partida"
                  summaryText="Ajudas de letra, verificacao, pontuacao e beneficios do jogo."
                >
                  <p className="mt-3 text-muted-foreground">
                    Você pode revelar uma letra, revelar a palavra ativa,
                    verificar erros e acompanhar progresso, tempo e pontuação na
                    mesma tela.
                  </p>
                  <h3 className="mt-6 text-xl font-bold">
                    Beneficios das palavras cruzadas
                  </h3>
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
                </ResponsiveSecondarySection>
                <ResponsiveSecondarySection
                  id="faq"
                  title="Perguntas frequentes"
                  summaryText="Respostas rapidas sobre dicas, ranking e teclado."
                  className="section-anchor"
                >
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
                </ResponsiveSecondarySection>
              </section>

              <aside className="hidden space-y-6 lg:block">
                <div className="card-base p-6">
                  <h2 className="text-xl font-bold">Top 10 por dificuldade</h2>
                  <div className="mt-4 rounded-2xl bg-secondary px-4 py-3 text-sm font-medium">
                    Dificuldade: {DIFFICULTY_LABELS[difficulty]}
                  </div>
                  <div className="mt-4 space-y-3">{rankingList}</div>
                </div>

                <div className="card-base p-6">
                  <h2 className="text-xl font-bold">Registrar pontuação</h2>
                  <div className="mt-3 space-y-4">{scoreRegistrationContent}</div>
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
