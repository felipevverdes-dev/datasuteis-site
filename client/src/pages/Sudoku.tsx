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
import GameMobileProgress from "@/components/games/GameMobileProgress";
import GamePageHero from "@/components/games/GamePageHero";
import ResponsiveSecondarySection from "@/components/games/ResponsiveSecondarySection";
import Footer from "@/components/Footer";
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
  clearEditableConflicts,
  createSudokuGame,
  getEditableConflicts,
  getSudokuBlock,
  getSudokuColumn,
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
  allowedCharacters: "Use apenas letras, números e espaço.",
  reservedTerms: "Esse nome não pode ser usado no ranking.",
  offensiveTerms: "Escolha um nome mais apropriado para o ranking.",
  repeatedCharacters: "Escolha um nome menos repetitivo.",
} as const;

const FAQ_ITEMS = [
  {
    question: "Como jogar sudoku?",
    answer:
      "Preencha as células vazias com números de 1 a 9 sem repetir valores na mesma linha, coluna ou bloco 3x3.",
  },
  {
    question: "Tem níveis?",
    answer:
      "Sim. Há modos Fácil, Médio, Difícil e Expert, com menos pistas iniciais e mais exigência de dedução conforme o nível sobe.",
  },
  {
    question: "Funciona no celular?",
    answer:
      "Sim. Toque em uma célula editável para abrir o teclado numérico nativo do aparelho.",
  },
  {
    question: "Posso errar?",
    answer:
      "Sim. Você pode testar números livremente, verificar conflitos editáveis e limpar os erros quando quiser reorganizar a grade.",
  },
  {
    question: "Existe ranking?",
    answer:
      "Sim. O Top 10 fica salvo localmente neste navegador, separado por dificuldade.",
  },
  {
    question: "Como funciona verificação e notas?",
    answer:
      "A verificação destaca conflitos editáveis e informa o progresso da grade. Esta versão foca em preenchimento direto, sem um modo de notas separado.",
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
  const clueCount = session.game.clueCount;
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
  const errorCount = conflictSet.size;
  const remainingCount = 81 - filledCount;
  const score = Math.max(
    0,
    2200 +
      filledCount * 12 +
      (40 - clueCount) * 18 -
      elapsedSeconds * 3 -
      errorCount * 45
  );
  const selectedCellSummary =
    selectedCell !== null
      ? `Linha ${getSudokuRow(selectedCell) + 1}, coluna ${getSudokuColumn(selectedCell) + 1}`
      : "Nenhuma célula selecionada";
  const selectedCellValueLabel =
    selectedValue !== 0 ? String(selectedValue) : "vazio";
  const boardStatusText =
    completedTime !== null
      ? `Concluído em ${formatElapsedTime(completedTime)}.`
      : errorCount > 0
        ? `${errorCount} conflito(s) editáveis exigem revisão.`
        : "Grade em andamento sem conflitos editáveis detectados.";
  const boardSizing = {
    staticMax: "35.5rem",
    vhOffset: "31rem",
  };
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
      {(["easy", "medium", "hard", "expert"] as SudokuDifficulty[]).map(
        difficulty => (
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
        )
      )}
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
                placeholder="Nome ou apelido"
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

      <main id="main-content" className="relative">
        <GamePageHero
          breadcrumbs={breadcrumbs}
          breadcrumbAriaLabel={navigationLabels.breadcrumb}
          backLabel={navigationLabels.back}
          backAriaLabel={navigationLabels.backAria}
          title="Sudoku Online Grátis"
          mobileSummary="Jogue Sudoku com quatro níveis de dificuldade, acompanhe progresso, erros e pontuação e salve seu melhor tempo por dificuldade."
        />

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
                      {difficultyButtons}
                      <div className="game-theme-chip game-theme-chip-compact">
                        Grade 9x9 • {clueCount} pistas iniciais
                      </div>
                    </div>

                    <div className="game-meta-row">
                      <span className="game-meta-chip">
                        Tempo: {formatElapsedTime(elapsedSeconds)}
                      </span>
                      <span className="game-meta-chip">
                        Progresso: {progress}%
                      </span>
                      <span className="game-meta-chip">
                        Erros: {errorCount}
                      </span>
                      <span className="game-meta-chip">Pontos: {score}</span>
                      <span className="game-meta-chip">
                        Pistas: {clueCount}
                      </span>
                    </div>
                  </div>

                  {completedTime !== null ? (
                    <div className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                      {boardStatusText}
                    </div>
                  ) : null}
                </div>

                <GameMobileProgress
                  value={progress}
                  label="Progresso do sudoku"
                />

                <div className="game-standard-main-grid">
                  <div className="game-standard-main-column">
                    <div
                      className="game-interactive-area protected-interactive game-board-shell game-mobile-stage mx-auto"
                      style={
                        {
                          "--game-board-static-max": boardSizing.staticMax,
                          "--game-board-vh-offset": boardSizing.vhOffset,
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
                            (getSudokuRow(selectedCell) ===
                              getSudokuRow(index) ||
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
                              onKeyDown={event =>
                                handleCellKeyDown(index, event)
                              }
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

                      <div className="game-meta-row mt-4 hidden justify-center lg:flex">
                        <span className="game-meta-chip">9x9</span>
                        <span className="game-meta-chip">
                          {clueCount} pistas iniciais
                        </span>
                        <span className="game-meta-chip">
                          Toque para abrir o teclado numérico nativo
                        </span>
                      </div>
                    </div>

                    <div className="game-mobile-primary-actions lg:flex lg:flex-wrap lg:gap-2">
                      <button
                        type="button"
                        onClick={handleCheckProgress}
                        className="btn-secondary"
                      >
                        Verificar
                      </button>
                      <button
                        type="button"
                        onClick={handleClearErrors}
                        className="btn-secondary"
                      >
                        Limpar erros
                      </button>
                      <button
                        type="button"
                        onClick={restartGame}
                        className="btn-secondary"
                      >
                        Reiniciar
                      </button>
                      <button
                        type="button"
                        onClick={() => startNewGame(currentDifficulty)}
                        className="btn-primary"
                      >
                        Novo jogo
                      </button>
                    </div>
                    <div className="hidden lg:block game-secondary-note">
                      {boardStatusText} Toque em uma célula editável para abrir
                      o teclado numérico nativo. No desktop, use as setas para
                      navegar pela grade.
                    </div>

                    <div className="space-y-3 lg:hidden">
                      <div className="game-context-card-muted">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Status da partida
                        </p>
                        <p className="mt-2 font-semibold text-foreground">
                          {difficultyCopy.label}
                        </p>
                        <p className="mt-1 leading-6">{boardStatusText}</p>
                        <p className="mt-2 text-xs leading-5">
                          Progresso {progress}% • Restam {remainingCount} casas
                          para concluir a grade.
                        </p>
                      </div>

                      <div className="game-context-card">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-base font-bold">
                            Leitura da grade
                          </h2>
                          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                            9x9
                          </span>
                        </div>
                        <div className="game-context-list">
                          <div className="game-context-item text-foreground">
                            <strong>Selecionada:</strong> {selectedCellSummary}
                          </div>
                          <div className="game-context-item text-foreground">
                            <strong>Valor atual:</strong>{" "}
                            {selectedCellValueLabel}
                          </div>
                          <div className="game-context-item text-foreground">
                            <strong>Pistas iniciais:</strong> {clueCount}
                          </div>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-muted-foreground">
                          Toque em uma célula editável para preencher números de
                          1 a 9 sem repetir linha, coluna ou bloco.
                        </p>
                      </div>

                      <div className="game-mobile-status-grid">
                        <div className="compact-stat compact-stat-tight">
                          <span className="compact-stat-label">Tempo</span>
                          <span className="compact-stat-value">
                            {formatElapsedTime(elapsedSeconds)}
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
                          <span className="compact-stat-label">Erros</span>
                          <span className="compact-stat-value">
                            {errorCount}
                          </span>
                        </div>
                      </div>

                      <ResponsiveSecondarySection
                        title="Nivel e ajuda"
                        summaryText="Troque a dificuldade, reinicie a grade e revise os controles."
                        className="lg:hidden"
                      >
                        <div className="space-y-4">
                          {difficultyButtons}
                          <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                            {difficultyCopy.teaser} {clueCount} pistas iniciais
                            nesta rodada.
                          </div>
                        </div>
                      </ResponsiveSecondarySection>
                    </div>
                  </div>

                  <aside className="game-standard-context-sidebar">
                    <div className="game-context-card">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-bold">Status da partida</h2>
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                          {difficultyCopy.label}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        Andamento atual da grade e leitura do tabuleiro.
                      </p>
                      <div className="game-context-list">
                        <div className="game-context-item text-foreground">
                          <strong>Status:</strong> {boardStatusText}
                        </div>
                        <div className="game-context-item text-foreground">
                          <strong>Erros atuais:</strong> {errorCount}
                        </div>
                        <div className="game-context-item text-foreground">
                          <strong>Preenchidas:</strong> {filledCount}/81
                        </div>
                        <div className="game-context-item text-foreground">
                          <strong>Restantes:</strong> {remainingCount}
                        </div>
                      </div>
                    </div>

                    <div className="game-context-card">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-bold">Ajuda rápida</h2>
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                          9x9
                        </span>
                      </div>
                      <div className="game-context-list">
                        <div className="game-context-item text-foreground">
                          <strong>Selecionada:</strong> {selectedCellSummary}
                        </div>
                        <div className="game-context-item text-foreground">
                          <strong>Valor atual:</strong> {selectedCellValueLabel}
                        </div>
                        <div className="game-context-item text-foreground">
                          <strong>Bloco:</strong>{" "}
                          {selectedCell !== null
                            ? getSudokuBlock(selectedCell) + 1
                            : "-"}
                        </div>
                        <div className="game-context-item text-foreground">
                          <strong>Pistas iniciais:</strong> {clueCount}
                        </div>
                      </div>
                      <div className="mt-3 rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                        Toque em uma célula editável para abrir o teclado
                        numérico nativo. No desktop, use as setas para navegar
                        pela grade.
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </div>

            <div className="space-y-3 lg:hidden">
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
              className="section-anchor game-standard-editorial-grid"
            >
              <div className="game-standard-editorial-main">
                <ResponsiveSecondarySection
                  title="Como jogar sudoku"
                  summaryText="Regras da grade, leitura dos destaques e fluxo da partida."
                >
                  <p className="mt-3 text-muted-foreground">
                    Sudoku é um quebra-cabeça de lógica em que cada linha,
                    coluna e bloco 3x3 deve conter os números de 1 a 9 sem
                    repetição.
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    Selecione uma célula vazia, preencha com um número e use os
                    destaques da própria grade para conferir grupos relacionados
                    antes de avançar.
                  </p>
                </ResponsiveSecondarySection>
                <ResponsiveSecondarySection
                  id="exemplos"
                  title="Como a partida varia"
                  summaryText="Diferenças entre dificuldades, pistas iniciais e ritmo da grade."
                  className="section-anchor"
                >
                  <p className="mt-3 text-muted-foreground">
                    O modo atual é <strong>{difficultyCopy.label}</strong>. Cada
                    dificuldade altera a quantidade de pistas iniciais e muda a
                    profundidade da dedução necessária para concluir a grade.
                  </p>
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
                  title="Recursos da partida"
                  summaryText="Verificacao, limpeza de erros, pontuacao e beneficios do jogo."
                >
                  <p className="mt-3 text-muted-foreground">
                    A partida reúne timer, progresso, erros atuais, pontuação de
                    desempenho, verificação de conflitos editáveis e reinício
                    rápido da grade sem sair da mesma tela.
                  </p>
                  <h3 className="mt-6 text-xl font-bold">
                    Beneficios do sudoku
                  </h3>
                  <p className="mt-3 text-muted-foreground">
                    Sudoku ajuda a manter atenção a padrões, leitura analítica e
                    raciocínio lógico em pausas curtas no celular ou no
                    computador.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href="/jogos/palavras-cruzadas/"
                      className="btn-secondary"
                    >
                      Testar palavras cruzadas
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
                  summaryText="Respostas rapidas sobre celular, verificacao e ranking."
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

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/jogos/" className="btn-secondary">
                      Todos os jogos
                    </Link>
                    <Link
                      href="/jogos/caca-palavras/"
                      className="btn-secondary"
                    >
                      Caça-Palavras
                    </Link>
                    <Link
                      href="/jogos/palavras-cruzadas/"
                      className="btn-secondary"
                    >
                      Palavras Cruzadas
                    </Link>
                    <Link
                      href="/jogos/jogo-da-velha/"
                      className="btn-secondary"
                    >
                      Jogo da Velha
                    </Link>
                    <Link href="/blog/" className="btn-secondary">
                      Ir para o blog
                    </Link>
                  </div>
                </ResponsiveSecondarySection>
              </div>

              <aside className="game-standard-editorial-sidebar">
                <div className="card-base p-6">
                  <h2 className="text-xl font-bold">Top 10 por dificuldade</h2>
                  <div className="mt-4 rounded-2xl bg-secondary px-4 py-3 text-sm font-medium">
                    Dificuldade: {difficultyCopy.label}
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
