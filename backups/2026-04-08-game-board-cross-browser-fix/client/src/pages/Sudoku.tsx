import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Medal } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import ConfettiBurst from "@/components/ConfettiBurst";
import ResponsiveSecondarySection from "@/components/games/ResponsiveSecondarySection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CoreNavigationBlock from "@/components/layout/CoreNavigationBlock";
import FloatingSectionNav from "@/components/layout/FloatingSectionNav";
import GameLanguageNotice from "@/components/layout/GameLanguageNotice";
import PageIntroNavigation from "@/components/layout/PageIntroNavigation";
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
  clearEditableConflicts,
  createSudokuGame,
  getEditableConflicts,
  getSudokuBlock,
  getSudokuColumn,
  getSudokuDifficultyClues,
  getSudokuRankingForDifficulty,
  getSudokuRankingPlacement,
  getSudokuRow,
  insertSudokuRankingEntry,
  isSudokuSolved,
  loadSudokuRanking,
  sanitizeSudokuNicknameInput,
  type SudokuDifficulty,
  validateSudokuNickname,
} from "@/lib/sudoku";
import { cn } from "@/lib/utils";

const DIFFICULTY_COPY: Record<
  SudokuDifficulty,
  { label: string; teaser: string }
> = {
  easy: {
    label: "Fácil",
    teaser: "Mais pistas iniciais e leitura mais aberta da grade.",
  },
  medium: {
    label: "Médio",
    teaser: "Equilíbrio entre velocidade, atenção e dedução.",
  },
  hard: {
    label: "Difícil",
    teaser: "Menos pistas e mais dependência de cruzamentos.",
  },
  expert: {
    label: "Expert",
    teaser: "Poucas pistas iniciais e leitura mais analítica.",
  },
};

const VALIDATION_MESSAGES = {
  empty: "Informe um nome para registrar a partida.",
  minLength: "Use pelo menos 3 caracteres.",
  maxLength: "Use no máximo 12 caracteres.",
  allowedCharacters: "Use apenas letras, números e espaços.",
  reservedTerms: "Esse nome não pode ser usado no ranking.",
  offensiveTerms: "Escolha um nome mais apropriado para o ranking.",
  repeatedCharacters: "Escolha um nome menos repetitivo.",
} as const;

const FAQ_ITEMS = [
  {
    question: "O Sudoku é grátis?",
    answer:
      "Sim. O jogo roda direto no navegador, sem cadastro e sem cobrança.",
  },
  {
    question: "Funciona no celular?",
    answer:
      "Sim. Toque em uma célula editável para abrir o teclado numérico nativo do aparelho.",
  },
  {
    question: "Tem níveis de dificuldade?",
    answer:
      "Sim. Há modos Fácil, Médio, Difícil e Expert, cada um com menos pistas iniciais e mais exigência de dedução.",
  },
  {
    question: "O ranking fica salvo?",
    answer:
      "Sim. O Top 10 fica salvo localmente neste navegador, separado por dificuldade.",
  },
  {
    question: "Como funciona a verificação de progresso?",
    answer:
      "A verificação destaca se ainda existem conflitos editáveis e informa o quanto da grade já foi preenchido.",
  },
] as const;

function createSession(difficulty: SudokuDifficulty) {
  const game = createSudokuGame(difficulty);
  return {
    game,
    board: [...game.puzzle],
    startedAt: Date.now(),
  };
}

function getFirstEditableCell(values: number[]) {
  const index = values.findIndex(value => value === 0);
  return index >= 0 ? index : null;
}

function formatElapsedTime(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getRankTone(index: number) {
  if (index === 0) {
    return "text-amber-500";
  }
  if (index === 1) {
    return "text-slate-500";
  }
  if (index === 2) {
    return "text-orange-500";
  }
  return "text-muted-foreground";
}

export default function Sudoku() {
  const { formatDate, language } = useI18n();
  const navigationLabels = getNavigationLabels(language);
  const [session, setSession] = useState(() => createSession("easy"));
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedTime, setCompletedTime] = useState<number | null>(null);
  const [rankingEntries, setRankingEntries] = useState(() =>
    loadSudokuRanking()
  );
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [savedPosition, setSavedPosition] = useState<number | null>(null);
  const cellRefs = useRef<Array<HTMLInputElement | null>>([]);
  const shouldFocusSelectedCellRef = useRef(false);

  const currentDifficulty = session.game.difficulty;
  const difficultyCopy = DIFFICULTY_COPY[currentDifficulty];
  const selectedValue = selectedCell !== null ? session.board[selectedCell] : 0;
  const filledCount = useMemo(
    () => session.board.filter(value => value !== 0).length,
    [session.board]
  );
  const progress = Math.round((filledCount / 81) * 100);
  const conflictSet = useMemo(
    () => getEditableConflicts(session.board, session.game.puzzle),
    [session.board, session.game.puzzle]
  );
  const ranking = useMemo(
    () => getSudokuRankingForDifficulty(rankingEntries, currentDifficulty),
    [currentDifficulty, rankingEntries]
  );
  const rankingPlacement =
    completedTime !== null && savedPosition === null
      ? getSudokuRankingPlacement(
          rankingEntries,
          currentDifficulty,
          completedTime
        )
      : null;
  const navItems = getToolPageNavItems(language);
  const topLabel = getBackToTopLabel(language);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.games },
    { label: navigationLabels.brainGames, href: "/jogos/" },
    { label: "Sudoku" },
  ];

  usePageSeo({
    title:
      "Sudoku Online Grátis | Fácil, Médio, Difícil e Expert | Datas Úteis",
    description:
      "Jogue Sudoku online grátis com níveis de dificuldade, timer, ranking local, validação de progresso e boa experiência no celular e no computador.",
    path: "/jogos/sudoku/",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Game",
        name: "Sudoku Online Grátis",
        url: "https://datasuteis.com.br/jogos/sudoku/",
        description:
          "Sudoku online com quatro níveis de dificuldade, timer, verificação de progresso e ranking local.",
        genre: "Puzzle",
        playMode: "SinglePlayer",
      },
      {
        ...buildBreadcrumbSchema(
          [
            { label: navigationLabels.home, href: "/" },
            { label: navigationLabels.games, href: "/jogos/" },
            { label: navigationLabels.brainGames, href: "/jogos/" },
            { label: "Sudoku", href: "/jogos/sudoku/" },
          ],
          "/jogos/sudoku/"
        ),
      },
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Sudoku Online Grátis",
        url: "https://datasuteis.com.br/jogos/sudoku/",
      },
      buildFaqPageSchema(FAQ_ITEMS),
    ],
  });

  useEffect(() => {
    if (completedTime !== null) {
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - session.startedAt) / 1000));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [completedTime, session.startedAt]);

  useEffect(() => {
    if (
      completedTime !== null ||
      !isSudokuSolved(session.board, session.game.solution)
    ) {
      return;
    }

    const finalTime = Math.max(
      1,
      Math.floor((Date.now() - session.startedAt) / 1000)
    );
    setCompletedTime(finalTime);
    setElapsedSeconds(finalTime);
    toast.success(`Sudoku concluído em ${formatElapsedTime(finalTime)}.`);
    trackAnalyticsEvent("game_completed", {
      game_name: "sudoku",
      difficulty: currentDifficulty,
      time_seconds: finalTime,
    });
  }, [
    completedTime,
    currentDifficulty,
    session.board,
    session.game.solution,
    session.startedAt,
  ]);

  useEffect(() => {
    if (selectedCell === null) {
      setSelectedCell(getFirstEditableCell(session.game.puzzle));
    }
  }, [selectedCell, session.game.puzzle]);

  useEffect(() => {
    if (selectedCell === null) {
      return;
    }

    if (!shouldFocusSelectedCellRef.current) {
      return;
    }

    shouldFocusSelectedCellRef.current = false;

    const target = cellRefs.current[selectedCell];
    if (!target || document.activeElement === target) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      target.focus({ preventScroll: true });
      if (!target.readOnly) {
        target.select();
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [selectedCell]);

  function updateSelectedCell(index: number | null, focus = false) {
    shouldFocusSelectedCellRef.current = focus;
    setSelectedCell(index);
  }

  function resetState(nextBoard: number[]) {
    setElapsedSeconds(0);
    setCompletedTime(null);
    setNickname("");
    setNicknameError("");
    setSavedPosition(null);
    updateSelectedCell(getFirstEditableCell(nextBoard));
  }

  function startNewGame(difficulty: SudokuDifficulty) {
    const nextSession = createSession(difficulty);
    setSession(nextSession);
    resetState(nextSession.board);
    toast(
      `Novo tabuleiro ${DIFFICULTY_COPY[difficulty].label.toLowerCase()} pronto.`
    );
    trackAnalyticsEvent("game_started", {
      game_name: "sudoku",
      difficulty,
    });
  }

  function restartGame() {
    const nextBoard = [...session.game.puzzle];
    setSession(current => ({
      ...current,
      board: nextBoard,
      startedAt: Date.now(),
    }));
    resetState(nextBoard);
    toast("O tabuleiro foi reiniciado.");
  }

  function moveSelection(rowDelta: number, columnDelta: number) {
    const baseIndex = selectedCell ?? getFirstEditableCell(session.game.puzzle);
    if (baseIndex === null) {
      return;
    }

    const nextRow = Math.min(
      8,
      Math.max(0, getSudokuRow(baseIndex) + rowDelta)
    );
    const nextColumn = Math.min(
      8,
      Math.max(0, getSudokuColumn(baseIndex) + columnDelta)
    );
    updateSelectedCell(nextRow * 9 + nextColumn, true);
  }

  function applyDigit(value: number) {
    if (completedTime !== null) {
      return;
    }

    if (selectedCell === null) {
      toast("Selecione uma célula editável para continuar.");
      return;
    }

    if (session.game.puzzle[selectedCell] !== 0) {
      toast("Essa célula faz parte das pistas iniciais.");
      return;
    }

    setSession(current => {
      const nextBoard = [...current.board];
      nextBoard[selectedCell] = value;
      return {
        ...current,
        board: nextBoard,
      };
    });
  }

  function handleCellChange(index: number, rawValue: string) {
    const nextValue = rawValue.replace(/[^1-9]/g, "").slice(-1);
    updateSelectedCell(index);

    if (!nextValue) {
      applyDigit(0);
      return;
    }

    applyDigit(Number(nextValue));
  }

  function handleCellKeyDown(
    index: number,
    event: ReactKeyboardEvent<HTMLInputElement>
  ) {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    if (session.game.puzzle[index] !== 0) {
      if (event.key.startsWith("Arrow")) {
        updateSelectedCell(index);
      }
    }

    if (
      event.key === "Backspace" ||
      event.key === "Delete" ||
      event.key === "0"
    ) {
      if (session.game.puzzle[index] !== 0) {
        return;
      }
      event.preventDefault();
      updateSelectedCell(index);
      applyDigit(0);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      updateSelectedCell(index);
      moveSelection(-1, 0);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      updateSelectedCell(index);
      moveSelection(1, 0);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      updateSelectedCell(index);
      moveSelection(0, -1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      updateSelectedCell(index);
      moveSelection(0, 1);
    }
  }

  function handleClearErrors() {
    const next = clearEditableConflicts(session.board, session.game.puzzle);
    if (next.clearedCount === 0) {
      toast("Não há erros editáveis para limpar agora.");
      return;
    }

    setSession(current => ({
      ...current,
      board: next.board,
    }));
    toast.success(`${next.clearedCount} célula(s) com conflito foram limpas.`);
  }

  function handleCheckProgress() {
    if (completedTime !== null) {
      toast.success(`Sudoku concluído em ${formatElapsedTime(completedTime)}.`);
      return;
    }

    if (conflictSet.size > 0) {
      toast.error(
        `Ainda existem ${conflictSet.size} conflito(s) editáveis na grade.`
      );
      return;
    }

    toast(
      `Progresso atual: ${filledCount} célula(s) preenchidas e ${81 - filledCount} restantes.`
    );
  }

  function handleSaveRanking() {
    if (completedTime === null || savedPosition !== null) {
      return;
    }

    const validation = validateSudokuNickname(nickname);
    if (!validation.ok) {
      setNicknameError(VALIDATION_MESSAGES[validation.reason]);
      return;
    }

    const result = insertSudokuRankingEntry(rankingEntries, {
      name: validation.value,
      time: completedTime,
      difficulty: currentDifficulty,
      date: new Date().toISOString().slice(0, 10),
    });

    if (!result.position) {
      setNicknameError("Este tempo não entrou no Top 10 desta dificuldade.");
      return;
    }

    setRankingEntries(result.entries);
    setNickname(validation.value);
    setNicknameError("");
    setSavedPosition(result.position);
    toast.success(`Pontuação registrada em ${result.position}º lugar.`);
    trackAnalyticsEvent("ranking_saved", {
      game_name: "sudoku",
      difficulty: currentDifficulty,
      position: result.position,
    });
  }

  const difficultyButtons = (
    <div className="game-difficulty-row">
      {(
        ["easy", "medium", "hard", "expert"] as SudokuDifficulty[]
      ).map(difficulty => (
        <button
          key={difficulty}
          type="button"
          aria-label={`Iniciar Sudoku ${DIFFICULTY_COPY[difficulty].label}`}
          className={cn(
            "game-difficulty-button",
            currentDifficulty === difficulty
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
          onClick={() => startNewGame(difficulty)}
        >
          {DIFFICULTY_COPY[difficulty].label}
        </button>
      ))}
    </div>
  );

  const rankingList = ranking.length ? (
    ranking.map((entry, index) => (
      <div
        key={`${entry.name}-${entry.time}-${entry.date}`}
        className="flex items-center justify-between gap-4 rounded-2xl bg-secondary/60 px-4 py-3"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Medal className={cn("h-4 w-4", getRankTone(index))} />
            <p className="truncate font-semibold">
              {index + 1}. {entry.name}
            </p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDate(entry.date)}
          </p>
        </div>
        <strong className="text-lg">{formatElapsedTime(entry.time)}</strong>
      </div>
    ))
  ) : (
    <p className="rounded-2xl bg-secondary/60 px-4 py-4 text-sm text-muted-foreground">
      Ainda não há partidas registradas nesta dificuldade.
    </p>
  );

  const scoreRegistrationContent =
    savedPosition !== null ? (
      <div className="rounded-2xl bg-accent/10 px-4 py-4 text-sm text-accent">
        Sua partida entrou em <strong>{savedPosition}º lugar</strong> nesta
        dificuldade.
      </div>
    ) : completedTime !== null ? (
      <>
        <p className="text-sm leading-6 text-muted-foreground">
          {rankingPlacement
            ? `Seu tempo entra em ${rankingPlacement}º lugar nesta dificuldade.`
            : "Este tempo não entrou no Top 10 desta dificuldade."}
        </p>

        {rankingPlacement ? (
          <div className="mt-4 space-y-3">
            <label className="block space-y-2">
              <span className="text-sm font-semibold">Nome ou apelido</span>
              <input
                type="text"
                value={nickname}
                onChange={event => {
                  setNickname(sanitizeSudokuNicknameInput(event.target.value));
                  setNicknameError("");
                }}
                maxLength={12}
                className="input-base w-full"
                placeholder="Ex.: Felipe"
              />
            </label>

            {nicknameError ? (
              <p className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/60 dark:text-rose-200">
                {nicknameError}
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleSaveRanking}
              className="btn-primary w-full"
            >
              Registrar pontuação
            </button>
          </div>
        ) : null}
      </>
    ) : (
      <p className="text-sm text-muted-foreground">
        Termine a partida para tentar entrar no Top 10 desta dificuldade.
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
                Sudoku Online Grátis
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground lg:hidden">
                Jogue Sudoku com quatro níveis de dificuldade, timer,
                verificação de progresso e Top 10 salvo neste navegador.
              </p>
            </div>
          </div>
        </section>

        <FloatingSectionNav items={navItems} topLabel={topLabel} />

        <section className="section-game">
          <div className="container mx-auto game-mobile-container game-page-stack">
            <GameLanguageNotice />

            <div
              id="ferramenta"
              className="section-anchor grid gap-3 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start"
            >
              <section className="space-y-3 xl:space-y-4">
                <div className="hidden xl:block card-base game-panel">
                  <div className="game-toolbar">
                    <div className="game-toolbar-row">
                      <div className="game-toolbar-main max-w-2xl">
                        <p className="game-toolbar-title">Tabuleiro atual</p>
                        <div className="game-toolbar-copy">
                          <h2 className="game-toolbar-heading">
                            {difficultyCopy.label}
                          </h2>
                          <p className="game-toolbar-subtitle">
                            {difficultyCopy.teaser}
                          </p>
                        </div>
                      </div>

                      <div className="game-difficulty-row">
                        {(
                          [
                            "easy",
                            "medium",
                            "hard",
                            "expert",
                          ] as SudokuDifficulty[]
                        ).map(difficulty => (
                          <button
                            key={difficulty}
                            type="button"
                            aria-label={`Iniciar Sudoku ${DIFFICULTY_COPY[difficulty].label}`}
                            className={cn(
                              "game-difficulty-button",
                              currentDifficulty === difficulty
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            )}
                            onClick={() => startNewGame(difficulty)}
                          >
                            {DIFFICULTY_COPY[difficulty].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {completedTime !== null ? (
                      <div className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                        Tabuleiro concluído em{" "}
                        <strong>{formatElapsedTime(completedTime)}</strong>.
                      </div>
                    ) : null}
                  </div>
                </div>

                <div
                  className="card-base game-focus-card game-panel"
                  data-game-focus
                >
                  <ConfettiBurst active={completedTime !== null} />
                  <div
                    className="game-interactive-area protected-interactive game-board-shell game-mobile-stage mx-auto"
                    style={
                      {
                        "--game-board-static-max": "35.5rem",
                        "--game-board-vh-offset": "31rem",
                      } as CSSProperties
                    }
                    onContextMenu={event => event.preventDefault()}
                  >
                    <div
                      className="grid grid-cols-9 gap-[2px] rounded-[24px] bg-primary/10 p-2 sm:gap-1 sm:p-3"
                      role="grid"
                      aria-label="Grade de Sudoku"
                    >
                      {session.board.map((value, index) => {
                        const isSelected = selectedCell === index;
                        const isGiven = session.game.puzzle[index] !== 0;
                        const hasConflict = conflictSet.has(index);
                        const sharesGroup =
                          selectedCell !== null &&
                          (getSudokuRow(selectedCell) === getSudokuRow(index) ||
                            getSudokuColumn(selectedCell) ===
                              getSudokuColumn(index) ||
                            getSudokuBlock(selectedCell) ===
                              getSudokuBlock(index));
                        const matchesSelectedValue =
                          selectedValue !== 0 &&
                          value !== 0 &&
                          value === selectedValue;

                        return (
                          <input
                            key={index}
                            ref={element => {
                              cellRefs.current[index] = element;
                            }}
                            type="text"
                            role="gridcell"
                            inputMode="numeric"
                            pattern="[1-9]*"
                            autoComplete="off"
                            aria-selected={isSelected}
                            aria-invalid={hasConflict}
                            aria-readonly={isGiven}
                            aria-label={`Linha ${getSudokuRow(index) + 1}, coluna ${getSudokuColumn(index) + 1}`}
                            value={value === 0 ? "" : String(value)}
                            readOnly={isGiven}
                            maxLength={1}
                            onFocus={() => updateSelectedCell(index)}
                            onClick={() => updateSelectedCell(index)}
                            onChange={event =>
                              !isGiven &&
                              handleCellChange(index, event.target.value)
                            }
                            onKeyDown={event => handleCellKeyDown(index, event)}
                            className={cn(
                              "aspect-square min-h-10 w-full rounded-md border px-0 text-center text-[15px] font-semibold leading-none transition-colors caret-primary sm:min-h-10 sm:text-lg",
                              getSudokuRow(index) % 3 === 0 &&
                                "border-t-2 border-t-primary/35",
                              getSudokuColumn(index) % 3 === 0 &&
                                "border-l-2 border-l-primary/35",
                              (getSudokuRow(index) === 8 ||
                                getSudokuRow(index) % 3 === 2) &&
                                "border-b-2 border-b-primary/35",
                              (getSudokuColumn(index) === 8 ||
                                getSudokuColumn(index) % 3 === 2) &&
                                "border-r-2 border-r-primary/35",
                              isSelected
                                ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                                : hasConflict
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-200"
                                  : sharesGroup
                                    ? "bg-primary/10"
                                    : matchesSelectedValue
                                      ? "bg-accent/10"
                                      : "bg-background hover:bg-secondary/80",
                              isGiven &&
                                !isSelected &&
                                "font-bold text-foreground caret-transparent",
                              !isGiven &&
                                !isSelected &&
                                !hasConflict &&
                                "text-primary dark:text-sky-200"
                            )}
                          />
                        );
                      })}
                    </div>

                    <div className="game-meta-row mt-4 hidden justify-center xl:flex">
                      <span className="game-meta-chip">
                        9x9
                      </span>
                      <span className="game-meta-chip">
                        {getSudokuDifficultyClues(currentDifficulty)} pistas
                        iniciais
                      </span>
                      <span className="game-meta-chip">
                        Toque para abrir o teclado numérico nativo
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 xl:hidden">
                    {completedTime !== null ? (
                      <div className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                        Concluido em{" "}
                        <strong>{formatElapsedTime(completedTime)}</strong>.
                      </div>
                    ) : null}

                    <div className="game-mobile-primary-actions">
                      <button
                        type="button"
                        onClick={() => startNewGame(currentDifficulty)}
                        className="btn-primary"
                      >
                        Novo jogo
                      </button>
                      <button
                        type="button"
                        onClick={handleCheckProgress}
                        className="btn-secondary"
                      >
                        Verificar
                      </button>
                    </div>

                    <div className="game-mobile-status-grid">
                      <div className="compact-stat compact-stat-tight">
                        <span className="compact-stat-label">Tempo</span>
                        <span className="compact-stat-value">
                          {formatElapsedTime(elapsedSeconds)}
                        </span>
                      </div>
                      <div className="compact-stat compact-stat-tight">
                        <span className="compact-stat-label">Progresso</span>
                        <span className="compact-stat-value">{progress}%</span>
                      </div>
                      <div className="compact-stat compact-stat-tight">
                        <span className="compact-stat-label">Preenchidas</span>
                        <span className="compact-stat-value">{filledCount}/81</span>
                      </div>
                      <div className="compact-stat compact-stat-tight">
                        <span className="compact-stat-label">Conflitos</span>
                        <span className="compact-stat-value">
                          {conflictSet.size}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
                      <p className="font-semibold text-foreground">
                        {difficultyCopy.label}
                      </p>
                      <p className="mt-1 leading-6">{difficultyCopy.teaser}</p>
                      <p className="mt-2 text-xs leading-5">
                        {getSudokuDifficultyClues(currentDifficulty)} pistas
                        iniciais e teclado numerico nativo do celular.
                      </p>
                    </div>

                    <ResponsiveSecondarySection
                      title="Mais controles e dificuldades"
                      summaryText="Troque o nivel, reinicie a grade ou limpe erros editaveis."
                      className="xl:hidden"
                    >
                      <div className="space-y-4">
                        {difficultyButtons}
                        <div className="grid gap-2">
                          <button
                            type="button"
                            onClick={restartGame}
                            className="btn-secondary w-full"
                          >
                            Reiniciar jogo
                          </button>
                          <button
                            type="button"
                            onClick={handleClearErrors}
                            className="btn-secondary w-full"
                          >
                            Limpar erros editaveis
                          </button>
                        </div>
                      </div>
                    </ResponsiveSecondarySection>
                  </div>
                </div>
              </section>

              <aside className="hidden space-y-4 xl:block">
                <div className="card-base game-panel">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                    <div className="compact-stat compact-stat-tight">
                      <span className="compact-stat-label">Tempo</span>
                      <span className="compact-stat-value">
                        {formatElapsedTime(elapsedSeconds)}
                      </span>
                    </div>
                    <div className="compact-stat compact-stat-tight">
                      <span className="compact-stat-label">Progresso</span>
                      <span className="compact-stat-value">{progress}%</span>
                    </div>
                    <div className="compact-stat compact-stat-tight">
                      <span className="compact-stat-label">Preenchidas</span>
                      <span className="compact-stat-value">{filledCount}/81</span>
                    </div>
                    <div className="compact-stat compact-stat-tight">
                      <span className="compact-stat-label">Conflitos</span>
                      <span className="compact-stat-value">
                        {conflictSet.size}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-base game-panel">
                  <div className="grid gap-2">
                    <button
                      type="button"
                      onClick={() => startNewGame(currentDifficulty)}
                      className="btn-primary w-full"
                    >
                      Novo jogo
                    </button>
                    <button
                      type="button"
                      onClick={restartGame}
                      className="btn-secondary w-full"
                    >
                      Reiniciar jogo
                    </button>
                    <button
                      type="button"
                      onClick={handleClearErrors}
                      className="btn-secondary w-full"
                    >
                      Limpar erros editáveis
                    </button>
                    <button
                      type="button"
                      onClick={handleCheckProgress}
                      className="btn-secondary w-full"
                    >
                      Verificar progresso
                    </button>
                  </div>
                </div>

                <div className="card-base game-panel">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold">
                      Top 10 neste navegador
                    </h2>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {difficultyCopy.label}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {ranking.length ? (
                      ranking.map((entry, index) => (
                        <div
                          key={`${entry.name}-${entry.time}-${entry.date}`}
                          className="flex items-center justify-between gap-4 rounded-2xl bg-secondary/60 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Medal
                                className={cn("h-4 w-4", getRankTone(index))}
                              />
                              <p className="truncate font-semibold">
                                {index + 1}. {entry.name}
                              </p>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDate(entry.date)}
                            </p>
                          </div>
                          <strong className="text-lg">
                            {formatElapsedTime(entry.time)}
                          </strong>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-2xl bg-secondary/60 px-4 py-4 text-sm text-muted-foreground">
                        Ainda não há partidas registradas nesta dificuldade.
                      </p>
                    )}
                  </div>
                </div>

                <div className="card-base game-panel">
                  <h2 className="text-xl font-bold">Registrar pontuação</h2>

                  {savedPosition !== null ? (
                    <div className="mt-4 rounded-2xl bg-accent/10 px-4 py-4 text-sm text-accent">
                      Sua partida entrou em{" "}
                      <strong>{savedPosition}º lugar</strong> nesta dificuldade.
                    </div>
                  ) : completedTime !== null ? (
                    <>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {rankingPlacement
                          ? `Seu tempo entra em ${rankingPlacement}º lugar nesta dificuldade.`
                          : "Este tempo não entrou no Top 10 desta dificuldade."}
                      </p>

                      {rankingPlacement ? (
                        <div className="mt-4 space-y-3">
                          <label className="block space-y-2">
                            <span className="text-sm font-semibold">
                              Nome ou apelido
                            </span>
                            <input
                              type="text"
                              value={nickname}
                              onChange={event => {
                                setNickname(
                                  sanitizeSudokuNicknameInput(
                                    event.target.value
                                  )
                                );
                                setNicknameError("");
                              }}
                              maxLength={12}
                              className="input-base w-full"
                              placeholder="Ex.: Felipe"
                            />
                          </label>

                          {nicknameError ? (
                            <p className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/60 dark:text-rose-200">
                              {nicknameError}
                            </p>
                          ) : null}

                          <button
                            type="button"
                            onClick={handleSaveRanking}
                            className="btn-primary w-full"
                          >
                            Registrar pontuação
                          </button>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Termine a partida para tentar entrar no Top 10 desta
                      dificuldade.
                    </p>
                  )}
                </div>
              </aside>
            </div>

            <div className="space-y-3 xl:hidden">
              <ResponsiveSecondarySection
                title="Ranking local"
                summaryText={`Top 10 do modo ${difficultyCopy.label} salvo neste navegador.`}
              >
                <div className="space-y-3">{rankingList}</div>
              </ResponsiveSecondarySection>

              <ResponsiveSecondarySection
                title="Registrar pontuacao"
                summaryText="Salve sua melhor partida quando entrar no Top 10."
                defaultOpenMobile={completedTime !== null}
              >
                <div className="space-y-4">{scoreRegistrationContent}</div>
              </ResponsiveSecondarySection>
            </div>

            <div
              id="explicacao"
              className="section-anchor grid gap-3 lg:grid-cols-2"
            >
              <ResponsiveSecondarySection
                title="O que e Sudoku"
                summaryText="Regras da grade, logica do jogo e niveis de dificuldade."
                className="h-full"
              >
                <p className="mt-3 text-muted-foreground">
                  Sudoku é um quebra-cabeça de lógica em que cada linha, coluna
                  e bloco 3x3 deve conter os números de 1 a 9 sem repetição.
                </p>

                <h2 className="mt-6 text-2xl font-bold">
                  Como funciona o Sudoku
                </h2>
                <p className="mt-3 text-muted-foreground">
                  O objetivo é completar a grade com dedução, cruzando
                  informações entre linhas, colunas e blocos. A verificação de
                  progresso ajuda a identificar conflitos editáveis sem resolver
                  o tabuleiro por você.
                </p>

                <h2 className="mt-6 text-2xl font-bold">
                  Níveis de dificuldade
                </h2>
                <div className="mt-4 space-y-3">
                  {(Object.keys(DIFFICULTY_COPY) as SudokuDifficulty[]).map(
                    difficulty => (
                      <div
                        key={difficulty}
                        className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground"
                      >
                        <strong className="text-foreground">
                          {DIFFICULTY_COPY[difficulty].label}:
                        </strong>{" "}
                        {DIFFICULTY_COPY[difficulty].teaser}
                      </div>
                    )
                  )}
                </div>
              </ResponsiveSecondarySection>

              <ResponsiveSecondarySection
                title="Beneficios e como jogar"
                summaryText="Vantagens do Sudoku e passos rapidos para comecar."
                className="h-full"
              >
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                    Ajuda a manter foco, atenção aos detalhes e leitura de
                    padrões.
                  </div>
                  <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                    Funciona bem como exercício mental rápido no celular ou no
                    computador.
                  </div>
                  <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                    Estimula raciocínio lógico sem depender de velocidade
                    extrema.
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/blog/beneficios-dos-jogos-de-logica/"
                    className="btn-secondary"
                  >
                    Ler sobre jogos de lógica
                  </Link>
                  <Link
                    href="/jogos/palavras-cruzadas/"
                    className="btn-secondary"
                  >
                    Testar palavras cruzadas
                  </Link>
                </div>

                <h2 className="mt-6 text-2xl font-bold">Como jogar</h2>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                    1. Selecione uma célula vazia e preencha com um número de 1
                    a 9.
                  </div>
                  <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                    2. Observe os destaques de linha, coluna e bloco para evitar
                    repetições.
                  </div>
                  <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                    3. Use o teclado numérico nativo do celular ou o teclado
                    físico do computador, reinicie o jogo se quiser recomeçar e
                    registre sua pontuação ao entrar no ranking.
                  </div>
                </div>
              </ResponsiveSecondarySection>
            </div>

            <ResponsiveSecondarySection
              id="faq"
              title="Perguntas frequentes"
              summaryText="Respostas rapidas sobre celular, ranking e dificuldades."
              className="section-anchor"
            >
              <div className="mt-4 space-y-3">
                {FAQ_ITEMS.map(item => (
                  <details
                    key={item.question}
                    className="rounded-2xl bg-secondary px-4 py-3"
                  >
                    <summary className="font-semibold">{item.question}</summary>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/jogos/" className="btn-secondary">
                  Todos os jogos
                </Link>
                <Link href="/jogos/caca-palavras/" className="btn-secondary">
                  Caça-Palavras
                </Link>
                <Link
                  href="/jogos/palavras-cruzadas/"
                  className="btn-secondary"
                >
                  Palavras Cruzadas
                </Link>
                <Link href="/blog/" className="btn-secondary">
                  Ir para o blog
                </Link>
              </div>
            </ResponsiveSecondarySection>

            <CoreNavigationBlock />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
