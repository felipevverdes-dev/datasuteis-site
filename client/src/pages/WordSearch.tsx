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
import GameMobileProgress from "@/components/games/GameMobileProgress";
import GamePageHero from "@/components/games/GamePageHero";
import ResponsiveSecondarySection from "@/components/games/ResponsiveSecondarySection";
import Header from "@/components/Header";
import CoreNavigationBlock from "@/components/layout/CoreNavigationBlock";
import FloatingSectionNav from "@/components/layout/FloatingSectionNav";
import GameLanguageNotice from "@/components/layout/GameLanguageNotice";
import { useI18n } from "@/contexts/LanguageContext";
import { trackAnalyticsEvent } from "@/lib/analytics";
import {
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  getNavigationLabels,
} from "@/lib/navigation";
import { getBackToTopLabel, getToolPageNavItems } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";
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
  createWordSearchGame,
  getWordSearchConfig,
  getWordSearchSelection,
  shuffleUnusedLetters,
  type WordSearchDifficulty,
} from "@/lib/word-search";
import { cn } from "@/lib/utils";

interface WordSearchRankingEntry {
  name: string;
  score: number;
  time: number;
  difficulty: WordSearchDifficulty;
  date: string;
}

const STORAGE_KEY = "datasuteis_word_search_ranking_v1";
const FAQ_ITEMS = [
  {
    question: "Como jogar caça-palavras?",
    answer:
      "Procure as palavras da lista e selecione cada uma em linha reta, na horizontal, vertical ou diagonal.",
  },
  {
    question: "Dá para jogar no celular?",
    answer:
      "Sim. A seleção funciona por toque e arraste no celular, e por mouse ou teclado no computador.",
  },
  {
    question: "O jogo muda a cada rodada?",
    answer:
      "Sim. Cada novo jogo sorteia um tema, uma grade e uma combinação diferente de palavras.",
  },
  {
    question: "Existe ranking?",
    answer:
      "Sim. O Top 10 fica salvo localmente neste navegador e separado por dificuldade.",
  },
  {
    question: "Como funciona a seleção de palavras?",
    answer:
      "Basta marcar o início e o fim da palavra na mesma direção. Se a seleção bater com a lista da rodada, ela é validada automaticamente.",
  },
  {
    question: "O tema muda?",
    answer:
      "Sim. As rodadas alternam categorias como calendário, tecnologia, natureza, culinária e cidade.",
  },
] as const;

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function buildLine(size: number, cells: number[]) {
  const first = cells[0];
  const last = cells[cells.length - 1];
  const cellSize = 100 / size;
  return {
    x1: ((first % size) + 0.5) * cellSize,
    y1: (Math.floor(first / size) + 0.5) * cellSize,
    x2: ((last % size) + 0.5) * cellSize,
    y2: (Math.floor(last / size) + 0.5) * cellSize,
  };
}

function arraysEqual(a: number[], b: number[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function isValidRankingEntry(entry: unknown): entry is WordSearchRankingEntry {
  if (!entry || typeof entry !== "object") {
    return false;
  }

  const candidate = entry as Partial<WordSearchRankingEntry>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.score === "number" &&
    typeof candidate.time === "number" &&
    typeof candidate.date === "string" &&
    typeof candidate.difficulty === "string"
  );
}

const DIFFICULTY_LABELS: Record<WordSearchDifficulty, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
  expert: "Expert",
};

export default function WordSearch() {
  const { language } = useI18n();
  const navigationLabels = getNavigationLabels(language);
  const [game, setGame] = useState(() => createWordSearchGame("easy"));
  const [letters, setLetters] = useState<string[]>([]);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [completedTime, setCompletedTime] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hintsLeft, setHintsLeft] = useState<number>(
    getWordSearchConfig("easy").maxHints
  );
  const [hintWordId, setHintWordId] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ start: number; current: number } | null>(
    null
  );
  const [rankingEntries, setRankingEntries] = useState(() =>
    loadBrowserRanking(STORAGE_KEY, isValidRankingEntry)
  );
  const [playerName, setPlayerName] = useState("");
  const [playerError, setPlayerError] = useState("");
  const [savedPosition, setSavedPosition] = useState<number | null>(null);
  const [activeCell, setActiveCell] = useState<number | null>(0);
  const [keyboardAnchor, setKeyboardAnchor] = useState<number | null>(null);
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const difficulty = game.difficulty;
  const multiplier = 1 + Math.min(streak, 4) * 0.25;
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
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.games },
    { label: navigationLabels.brainGames, href: "/jogos/" },
    { label: "Caça-Palavras" },
  ];

  usePageSeo({
    title:
      "Caça-Palavras Online Grátis | Ranking, Dicas e Níveis | Datas Úteis",
    description:
      "Jogue caça-palavras online grátis com níveis de dificuldade, dicas, pontuação, ranking e categorias temáticas. Funciona no celular e no computador.",
    path: "/jogos/caca-palavras/",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Game",
        name: "Caça-Palavras Online Grátis",
        url: "https://datasuteis.com.br/jogos/caca-palavras/",
        description:
          "Caça-palavras online com ranking local, dicas, categorias temáticas e quatro níveis de dificuldade.",
      },
      {
        ...buildBreadcrumbSchema([
          { label: navigationLabels.home, href: "/" },
          { label: navigationLabels.games },
          { label: navigationLabels.brainGames, href: "/jogos/" },
          { label: "Caça-Palavras", href: "/jogos/caca-palavras/" },
        ]),
      },
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Caça-Palavras Online Grátis",
        url: "https://datasuteis.com.br/jogos/caca-palavras/",
      },
      buildFaqPageSchema(FAQ_ITEMS),
    ],
  });

  useEffect(() => {
    if (letters.length === 0) {
      setLetters([...game.letters]);
    }
  }, [game.letters, letters.length]);

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
    if (drag === null) {
      return;
    }

    function handleMove(event: PointerEvent) {
      const target = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>("[data-word-cell]");
      const value = target?.dataset.wordCell;
      if (value) {
        setDrag(current =>
          current ? { ...current, current: Number(value) } : current
        );
      }
    }

    function handleUp() {
      if (!drag) {
        return;
      }

      const selection = getWordSearchSelection(
        game.size,
        drag.start,
        drag.current
      );
      if (!selection) {
        setStreak(0);
        setDrag(null);
        return;
      }

      const matched = commitSelection(selection);
      setDrag(null);
      setKeyboardAnchor(null);
      if (!matched) {
        return;
      }
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [drag, foundIds, game.size, game.words, streak]);

  useEffect(() => {
    if (completedTime !== null || foundIds.length !== game.words.length) {
      return;
    }

    setCompletedTime(elapsed);
    toast.success("Partida concluída.");
    trackAnalyticsEvent("game_completed", {
      game_name: "word_search",
      difficulty,
      time_seconds: elapsed,
      words_found: foundIds.length,
    });
  }, [completedTime, difficulty, elapsed, foundIds.length, game.words.length]);

  useEffect(() => {
    if (!hintWordId) {
      return;
    }

    const timeout = window.setTimeout(() => setHintWordId(null), 4500);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [hintWordId]);

  function resetForGame(nextDifficulty: WordSearchDifficulty) {
    const nextGame = createWordSearchGame(nextDifficulty);
    setGame(nextGame);
    setLetters([...nextGame.letters]);
    setFoundIds([]);
    setElapsed(0);
    setStartedAt(Date.now());
    setCompletedTime(null);
    setScore(0);
    setStreak(0);
    setHintsLeft(getWordSearchConfig(nextDifficulty).maxHints);
    setHintWordId(null);
    setDrag(null);
    setPlayerName("");
    setPlayerError("");
    setSavedPosition(null);
    setActiveCell(0);
    setKeyboardAnchor(null);
    trackAnalyticsEvent("game_started", {
      game_name: "word_search",
      difficulty: nextDifficulty,
      theme: nextGame.category,
    });
  }

  function restartRound() {
    setLetters([...game.letters]);
    setFoundIds([]);
    setElapsed(0);
    setStartedAt(Date.now());
    setCompletedTime(null);
    setScore(0);
    setStreak(0);
    setHintsLeft(getWordSearchConfig(difficulty).maxHints);
    setHintWordId(null);
    setDrag(null);
    setPlayerName("");
    setPlayerError("");
    setSavedPosition(null);
    setActiveCell(0);
    setKeyboardAnchor(null);
    toast("Rodada reiniciada.");
    trackAnalyticsEvent("game_restarted", {
      game_name: "word_search",
      difficulty,
      theme: game.category,
    });
  }

  function commitSelection(selection: number[] | null) {
    if (!selection) {
      setStreak(0);
      return false;
    }

    const match = game.words.find(
      word =>
        !foundIds.includes(word.id) &&
        (arraysEqual(word.cells, selection) ||
          arraysEqual([...word.cells].reverse(), selection))
    );

    if (!match) {
      setStreak(0);
      return false;
    }

    setFoundIds(current => [...current, match.id]);
    setStreak(current => current + 1);
    setScore(
      current =>
        current +
        Math.round(
          match.answer.length * 12 * (1 + Math.min(streak + 1, 4) * 0.25)
        )
    );
    toast.success(`Palavra encontrada: ${match.label}`);
    trackAnalyticsEvent("word_found", {
      game_name: "word_search",
      difficulty,
      theme: game.category,
      word_length: match.answer.length,
    });
    return true;
  }

  function focusGridCell(index: number) {
    setActiveCell(index);
    cellRefs.current[index]?.focus();
  }

  function moveCell(index: number, rowDelta: number, colDelta: number) {
    const row = Math.floor(index / game.size);
    const col = index % game.size;
    const nextRow = Math.min(game.size - 1, Math.max(0, row + rowDelta));
    const nextCol = Math.min(game.size - 1, Math.max(0, col + colDelta));
    return nextRow * game.size + nextCol;
  }

  function handleGridKeyDown(
    index: number,
    event: ReactKeyboardEvent<HTMLButtonElement>
  ) {
    const movement = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    } as const;

    if (event.key in movement) {
      event.preventDefault();
      const [rowDelta, colDelta] = movement[event.key as keyof typeof movement];
      const nextIndex = moveCell(index, rowDelta, colDelta);
      focusGridCell(nextIndex);
      if (keyboardAnchor !== null) {
        setDrag({ start: keyboardAnchor, current: nextIndex });
      }
      return;
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (keyboardAnchor === null) {
        setKeyboardAnchor(index);
        setDrag({ start: index, current: index });
        return;
      }

      commitSelection(getWordSearchSelection(game.size, keyboardAnchor, index));
      setKeyboardAnchor(null);
      setDrag(null);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setKeyboardAnchor(null);
      setDrag(null);
    }
  }

  function handleHint() {
    if (hintsLeft <= 0 || completedTime !== null) {
      return;
    }

    const hiddenWords = game.words.filter(word => !foundIds.includes(word.id));
    if (!hiddenWords.length) {
      return;
    }

    const hintedWord =
      hiddenWords[Math.floor(Math.random() * hiddenWords.length)];
    setHintsLeft(current => current - 1);
    setHintWordId(hintedWord.id);
    setScore(current => Math.max(0, current - 25));
  }

  function handleShuffle() {
    if (completedTime !== null) {
      return;
    }
    setLetters(current => shuffleUnusedLetters(current, game.usedCells));
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
      setPlayerError("A pontuação não entrou no Top 10 desta dificuldade.");
      return;
    }

    setRankingEntries(result.entries);
    setSavedPosition(result.position);
    setPlayerName(validation.value);
    setPlayerError("");
    trackAnalyticsEvent("ranking_saved", {
      game_name: "word_search",
      difficulty,
      position: result.position,
    });
  }

  const foundWords = new Set(foundIds);
  const foundWordObjects = game.words.filter(word => foundWords.has(word.id));
  const wordsRemaining = game.words.length - foundIds.length;
  const progress = Math.round((foundIds.length / game.words.length) * 100);
  const difficultyLabel = DIFFICULTY_LABELS[difficulty];
  const highlightedWord = hintWordId
    ? (game.words.find(word => word.id === hintWordId) ?? null)
    : null;
  const previewLine =
    drag && getWordSearchSelection(game.size, drag.start, drag.current);
  const navItems = getToolPageNavItems(language);
  const topLabel = getBackToTopLabel(language);
  const boardSizing =
    game.size >= 18
      ? { staticMax: "48rem", min: "22rem", minMobile: "18rem" }
      : game.size >= 14
        ? { staticMax: "44rem", min: "20rem", minMobile: "18rem" }
        : { staticMax: "40rem", min: "20rem", minMobile: "18rem" };
  const cellTextClassName =
    game.size >= 18
      ? "text-[11px] sm:text-xs"
      : game.size >= 14
        ? "text-[12px] sm:text-sm"
        : "text-[13px] sm:text-base";
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
            : "A pontuação final não entrou no Top 10 desta dificuldade."}
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
        Termine a rodada para tentar entrar no Top 10.
      </p>
    );

  return (
    <div className="min-h-screen bg-background">
      <Header />
<<<<<<< HEAD
      <main id="main-content" role="main" className="relative">
        <GamePageHero
          breadcrumbs={breadcrumbs}
          breadcrumbAriaLabel={navigationLabels.breadcrumb}
          backLabel={navigationLabels.back}
          backAriaLabel={navigationLabels.backAria}
          title="Caça-Palavras Online Grátis"
          mobileSummary="Encontre palavras em linha reta, acompanhe o tema da rodada e registre sua melhor pontuação por dificuldade."
        />
=======
      <main id="main-content" className="relative">
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
                Caça-Palavras Online Grátis
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground lg:hidden">
                Encontre palavras em até 8 direções, use dicas com parcimônia e
                registre sua melhor pontuação por dificuldade.
              </p>
            </div>
          </div>
        </section>
>>>>>>> a1934ab (Ajuste do site para os padrões do W3C Validator)

        <FloatingSectionNav items={navItems} topLabel={topLabel} />

        <div className="section-game">
          <div className="container mx-auto game-mobile-container game-page-stack">
            <GameLanguageNotice />

            <div id="ferramenta" className="section-anchor">
              <div
                className="card-base game-focus-card game-panel"
                data-game-focus
              >
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
                        ] as WordSearchDifficulty[]
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
                          onClick={() => resetForGame(level)}
                        >
                          {DIFFICULTY_LABELS[level]}
                        </button>
                      ))}

                      <div className="game-theme-chip game-theme-chip-compact">
                        Tema da rodada: {game.category}
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
                        Palavras: {foundIds.length}/{game.words.length}
                      </span>
                      <span className="game-meta-chip">Dicas: {hintsLeft}</span>
                    </div>
                  </div>
                </div>

                <GameMobileProgress
                  value={progress}
                  label="Progresso do caça-palavras"
                />

                <div className="game-standard-main-grid">
                  <div className="game-standard-main-column">
                    <div
                      className="game-interactive-area protected-interactive game-board-shell game-mobile-stage relative mx-auto w-full touch-none"
                      style={
                        {
                          "--game-board-static-max": boardSizing.staticMax,
                          "--game-board-min": boardSizing.min,
                          "--game-board-min-mobile": boardSizing.minMobile,
                        } as CSSProperties
                      }
                      onContextMenu={event => event.preventDefault()}
                    >
                      <div
                        className="grid gap-1 rounded-3xl bg-primary/10 p-2.5 sm:p-3"
                        role="grid"
                        aria-label={`Caça-palavras sobre ${game.category}`}
                        style={{
                          gridTemplateColumns: `repeat(${game.size}, minmax(0, 1fr))`,
                        }}
                      >
                        {letters.map((letter, index) => {
                          const inHint = hintWordId
                            ? game.words
                                .find(word => word.id === hintWordId)
                                ?.cells.includes(index)
                            : false;
                          const isFound = foundWordObjects.some(word =>
                            word.cells.includes(index)
                          );
                          return (
                            <button
                              key={index}
                              ref={element => {
                                cellRefs.current[index] = element;
                              }}
                              type="button"
                              data-word-cell={index}
                              aria-label={`Linha ${Math.floor(index / game.size) + 1}, coluna ${(index % game.size) + 1}, letra ${letter}`}
                              aria-pressed={
                                keyboardAnchor === index ||
                                drag?.start === index
                              }
                              className={cn(
                                "aspect-square rounded-lg border border-border bg-background font-bold",
                                cellTextClassName,
                                isFound && "bg-accent/15 text-accent",
                                inHint && "ring-2 ring-primary/30",
                                activeCell === index &&
                                  "ring-2 ring-primary/35",
                                drag &&
                                  (drag.start === index ||
                                    drag.current === index) &&
                                  "bg-primary text-primary-foreground"
                              )}
                              onFocus={() => setActiveCell(index)}
                              onKeyDown={event =>
                                handleGridKeyDown(index, event)
                              }
                              onPointerDown={event => {
                                event.preventDefault();
                                setActiveCell(index);
                                setKeyboardAnchor(null);
                                setDrag({ start: index, current: index });
                              }}
                            >
                              {letter}
                            </button>
                          );
                        })}
                      </div>

                      <svg
                        className="pointer-events-none absolute inset-0 h-full w-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                      >
                        {foundWordObjects.map(word => {
                          const line = buildLine(game.size, word.cells);
                          return (
                            <line
                              key={word.id}
                              x1={line.x1}
                              y1={line.y1}
                              x2={line.x2}
                              y2={line.y2}
                              stroke="rgba(16,185,129,0.85)"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                            />
                          );
                        })}
                        {previewLine
                          ? (() => {
                              const line = buildLine(game.size, previewLine);
                              return (
                                <line
                                  x1={line.x1}
                                  y1={line.y1}
                                  x2={line.x2}
                                  y2={line.y2}
                                  stroke="rgba(26,58,92,0.6)"
                                  strokeWidth="1.7"
                                  strokeDasharray="3 2"
                                  strokeLinecap="round"
                                />
                              );
                            })()
                          : null}
                      </svg>
                    </div>

                    <div className="game-mobile-primary-actions lg:flex lg:flex-wrap lg:gap-2">
                      <button
                        type="button"
                        onClick={() => resetForGame(difficulty)}
                        className="btn-primary"
                      >
                        Novo jogo
                      </button>
                      <button
                        type="button"
                        onClick={handleHint}
                        className="btn-secondary"
                      >
                        Usar dica ({hintsLeft})
                      </button>
                      <button
                        type="button"
                        onClick={restartRound}
                        className="btn-secondary"
                      >
                        Reiniciar
                      </button>
                      <button
                        type="button"
                        onClick={handleShuffle}
                        className="btn-secondary"
                      >
                        Embaralhar letras livres
                      </button>
                    </div>

                    <div className="hidden lg:block game-secondary-note">
                      Use toque ou mouse para arrastar a seleção. No teclado,
                      use as setas para mover, Enter para marcar início e Enter
                      novamente para fechar a palavra.
                    </div>

                    <div className="space-y-3 lg:hidden">
                      <div className="game-context-card-muted">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Contexto da rodada
                        </p>
                        <p className="mt-2 font-semibold text-foreground">
                          {game.category}
                        </p>
                        <p className="mt-1 leading-6">
                          {highlightedWord
                            ? `Dica ativa em ${highlightedWord.label}. Feche essa palavra para aproveitar melhor os pontos da rodada.`
                            : "Arraste com o dedo para marcar palavras em linha reta e comece pelas maiores para abrir a leitura da grade."}
                        </p>
                        <p className="mt-2 text-xs leading-5">
                          Encontradas {foundIds.length} de {game.words.length} •
                          Restam {wordsRemaining} • Streak atual {streak}.
                        </p>
                      </div>

                      <div className="game-context-card">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-base font-bold">
                            Palavras da rodada
                          </h2>
                          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                            {foundIds.length}/{game.words.length}
                          </span>
                        </div>
                        <div className="game-side-scroll mt-3 space-y-1.5 overflow-auto pr-1">
                          {game.words.map(word => (
                            <div
                              key={word.id}
                              className={cn(
                                "game-context-item",
                                foundWords.has(word.id)
                                  ? "bg-accent/15 text-accent line-through"
                                  : hintWordId === word.id
                                    ? "bg-primary/10 text-primary"
                                    : "text-foreground"
                              )}
                            >
                              {word.label}
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 text-xs leading-5 text-muted-foreground">
                          {highlightedWord
                            ? `Dica atual: ${highlightedWord.label}.`
                            : `Use as ${hintsLeft} dica(s) restantes apenas quando precisar destravar a grade.`}
                        </p>
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
                          <span className="compact-stat-value">
                            {progress}%
                          </span>
                        </div>
                        <div className="compact-stat compact-stat-tight">
<<<<<<< HEAD
                          <span className="compact-stat-label">Dicas</span>
=======
                          <span className="compact-stat-label">
                            Multiplicador
                          </span>
>>>>>>> a1934ab (Ajuste do site para os padrões do W3C Validator)
                          <span className="compact-stat-value">
                            {hintsLeft}
                          </span>
                        </div>
                      </div>

                      <ResponsiveSecondarySection
                        title="Nivel e ajuda"
                        summaryText="Troque a dificuldade, revise os controles e acompanhe o tema da rodada."
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
                              ] as WordSearchDifficulty[]
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
                                onClick={() => resetForGame(level)}
                              >
                                {DIFFICULTY_LABELS[level]}
                              </button>
                            ))}
                          </div>
                          <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                            Tema atual: <strong>{game.category}</strong>. No
                            teclado físico, use setas para mover, Enter para
                            marcar o início e Enter novamente para fechar a
                            palavra.
                          </div>
                        </div>
                      </ResponsiveSecondarySection>
                    </div>
                  </div>

                  <aside className="game-standard-context-sidebar">
                    <div className="game-context-card">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-bold">
                          Contexto da rodada
                        </h2>
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                          {difficultyLabel}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        Tema atual, andamento da grade e status das dicas.
                      </p>
                      <div className="game-context-list">
                        <div className="game-context-item text-foreground">
                          <strong>Tema:</strong> {game.category}
                        </div>
                        <div className="game-context-item text-foreground">
                          <strong>Encontradas:</strong> {foundIds.length}/
                          {game.words.length}
                        </div>
                        <div className="game-context-item text-foreground">
                          <strong>Restantes:</strong> {wordsRemaining}
                        </div>
                        <div className="game-context-item text-foreground">
                          <strong>Multiplicador:</strong>{" "}
                          {multiplier.toFixed(2)}x
                        </div>
                      </div>
                      <div className="mt-3 rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                        {highlightedWord
                          ? `Dica ativa em ${highlightedWord.label}.`
                          : `Use as ${hintsLeft} dica(s) restantes apenas quando precisar destravar a rodada.`}
                      </div>
                    </div>

                    <div className="game-context-card">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-bold">
                          Palavras da rodada
                        </h2>
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                          {foundIds.length}/{game.words.length}
                        </span>
                      </div>
                      <div className="game-side-scroll mt-3 space-y-1.5 overflow-auto pr-1">
                        {game.words.map(word => (
                          <div
                            key={word.id}
                            className={cn(
                              "game-context-item",
                              foundWords.has(word.id)
                                ? "bg-accent/15 text-accent line-through"
                                : hintWordId === word.id
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground"
                            )}
                          >
                            {word.label}
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Streak atual:{" "}
                        <strong className="text-foreground">{streak}</strong>
                        {" • "}Multiplicador{" "}
                        <strong className="text-foreground">
                          {multiplier.toFixed(2)}x
                        </strong>
                      </p>
                    </div>
                  </aside>
                </div>
              </div>
            </div>

            <div className="space-y-3 lg:hidden">
              <ResponsiveSecondarySection
                title="Ranking local"
                summaryText="Top 10 salvo neste navegador por dificuldade."
              >
                <div className="space-y-3">{rankingList}</div>
              </ResponsiveSecondarySection>

              <ResponsiveSecondarySection
                title="Registrar pontuacao"
                summaryText="Salve a rodada quando a pontuacao entrar no ranking."
                defaultOpenMobile={completedTime !== null}
              >
                <div className="space-y-4">{scoreRegistrationContent}</div>
              </ResponsiveSecondarySection>
            </div>

<<<<<<< HEAD
            <div id="explicacao" className="game-standard-editorial-grid">
              <section className="game-standard-editorial-main">
=======
            <div
              id="explicacao"
              className="section-anchor grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]"
            >
              <div className="space-y-3 lg:space-y-6">
>>>>>>> a1934ab (Ajuste do site para os padrões do W3C Validator)
                <ResponsiveSecondarySection
                  title="Como jogar caça-palavras"
                  summaryText="Fluxo da grade, selecao das palavras e ritmo da rodada."
                >
                  <p className="mt-3 text-muted-foreground">
                    Procure as palavras da rodada no grid e selecione cada uma
                    em linha reta. As direções podem seguir horizontal, vertical
                    ou diagonal, então vale começar pelas palavras maiores para
                    abrir a leitura da grade.
<<<<<<< HEAD
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    Use dica apenas quando quiser destravar uma palavra
                    específica. No teclado físico, setas movem o foco e Enter
                    marca o início e o fim da seleção.
                  </p>
                </ResponsiveSecondarySection>
                <ResponsiveSecondarySection
                  id="exemplos"
                  title="Tema da rodada"
                  summaryText="Categoria atual e como as partidas variam."
                  className="section-anchor"
                >
                  <p className="mt-3 text-muted-foreground">
                    A rodada atual traz palavras sobre{" "}
                    <strong>{game.category}</strong>. Cada novo jogo pode trocar
                    o tema e a combinação de palavras, mantendo a leitura da
                    grade sempre diferente.
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    As dificuldades ampliam o tabuleiro e a quantidade de termos
                    por rodada, indo de grades 10x10 até 20x20.
                  </p>
                </ResponsiveSecondarySection>
                <ResponsiveSecondarySection
                  title="Recursos da partida"
                  summaryText="Dicas, pontuacao, progresso e beneficios do jogo."
                >
                  <p className="mt-3 text-muted-foreground">
                    A partida reúne timer, pontuação, progresso, multiplicador
                    por streak, dicas controladas e embaralhamento das letras
                    ainda livres na grade.
=======
>>>>>>> a1934ab (Ajuste do site para os padrões do W3C Validator)
                  </p>
                  <h3 className="mt-6 text-xl font-bold">
                    Beneficios do caça-palavras
                  </h3>
                  <p className="mt-3 text-muted-foreground">
                    Caça-palavras funciona bem como pausa curta para foco
                    visual, leitura rápida e reconhecimento de padrões sem
                    depender de reflexos extremos.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href="/jogos/sudoku/" className="btn-secondary">
                      Alternar para Sudoku
                    </Link>
                    <Link
                      href="/jogos/jogo-da-velha/"
                      className="btn-secondary"
                    >
                      Abrir Jogo da Velha
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
                  summaryText="Respostas rapidas sobre tema, selecao e ranking."
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
                      href="/jogos/palavras-cruzadas/"
                      className="btn-secondary"
                    >
                      Palavras cruzadas
                    </Link>
                    <Link href="/jogos/sudoku/" className="btn-secondary">
                      Sudoku
                    </Link>
                    <Link
                      href="/jogos/jogo-da-velha/"
                      className="btn-secondary"
                    >
                      Jogo da Velha
                    </Link>
                  </div>
                </ResponsiveSecondarySection>
              </div>

              <aside className="game-standard-editorial-sidebar">
                <div className="card-base p-6">
                  <h2 className="text-xl font-bold">Top 10 por dificuldade</h2>
                  <div className="mt-4 rounded-2xl bg-secondary px-4 py-3 text-sm font-medium">
                    Dificuldade: {difficultyLabel}
                  </div>
                  <div className="mt-4 space-y-3">{rankingList}</div>
                </div>

                <div className="card-base p-6">
                  <h2 className="text-xl font-bold">Registrar pontuação</h2>
                  <div className="mt-3 space-y-4">
                    {scoreRegistrationContent}
                  </div>
                </div>
              </aside>
            </div>

            <CoreNavigationBlock />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
