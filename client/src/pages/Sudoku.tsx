import { useEffect, useMemo, useState } from "react";
import { Medal } from "lucide-react";
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
import { buildBreadcrumbSchema, getNavigationLabels } from "@/lib/navigation";
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
      "Sim. A grade, o teclado numérico e as ações principais foram ajustados para toque e leitura em tela menor.",
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
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map(item => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      {
        ...buildBreadcrumbSchema([
          { label: navigationLabels.home, href: "/" },
          { label: navigationLabels.games },
          { label: navigationLabels.brainGames, href: "/jogos/" },
          { label: "Sudoku", href: "/jogos/sudoku/" },
        ]),
      },
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Sudoku Online Grátis",
        url: "https://datasuteis.com.br/jogos/sudoku/",
      },
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
    function handleKeyboard(event: KeyboardEvent) {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        selectedCell === null
      ) {
        return;
      }

      if (event.key >= "1" && event.key <= "9") {
        event.preventDefault();
        applyDigit(Number(event.key));
        return;
      }

      if (
        event.key === "Backspace" ||
        event.key === "Delete" ||
        event.key === "0"
      ) {
        event.preventDefault();
        applyDigit(0);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        moveSelection(-1, 0);
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        moveSelection(1, 0);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveSelection(0, -1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveSelection(0, 1);
      }
    }

    window.addEventListener("keydown", handleKeyboard);
    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [completedTime, selectedCell, session.board, session.game.puzzle]);

  function resetState(nextBoard: number[]) {
    setElapsedSeconds(0);
    setCompletedTime(null);
    setNickname("");
    setNicknameError("");
    setSavedPosition(null);
    setSelectedCell(getFirstEditableCell(nextBoard));
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
    setSelectedCell(nextRow * 9 + nextColumn);
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

  function renderKeypad() {
    return (
      <div className="card-base p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Teclado numérico</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Toque ou digite de 1 a 9
          </p>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-5 xl:grid-cols-3">
          {Array.from({ length: 9 }, (_, index) => index + 1).map(value => (
            <button
              key={value}
              type="button"
              aria-label={`Inserir número ${value}`}
              className="btn-secondary px-0 py-3 text-base sm:text-lg"
              onClick={() => applyDigit(value)}
            >
              {value}
            </button>
          ))}
          <button
            type="button"
            aria-label="Limpar célula selecionada"
            className="btn-outline col-span-full py-3 text-sm"
            onClick={() => applyDigit(0)}
          >
            Limpar
          </button>
        </div>
      </div>
    );
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
              <h1 className="text-3xl font-bold text-primary md:text-4xl">
                Sudoku Online Grátis
              </h1>
              <p className="mt-3 max-w-3xl text-muted-foreground md:text-lg">
                Jogue Sudoku com quatro níveis de dificuldade, timer,
                verificação de progresso e Top 10 salvo neste navegador.
              </p>
            </div>
          </div>
        </section>

        <FloatingSectionNav items={navItems} topLabel={topLabel} />

        <section className="section-md">
          <div className="container mx-auto page-stack">
            <GameLanguageNotice />

            <div
              id="ferramenta"
              className="section-anchor grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start"
            >
              <section className="space-y-5">
                <div className="card-base p-5 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-2xl">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Tabuleiro atual
                      </p>
                      <h2 className="mt-2 text-2xl font-bold">
                        {difficultyCopy.label}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {difficultyCopy.teaser}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
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
                            "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
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

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl bg-secondary p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Tempo
                      </p>
                      <p className="mt-2 text-xl font-bold">
                        {formatElapsedTime(elapsedSeconds)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-secondary p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Progresso
                      </p>
                      <p className="mt-2 text-xl font-bold">{progress}%</p>
                    </div>
                    <div className="rounded-2xl bg-secondary p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Preenchidas
                      </p>
                      <p className="mt-2 text-xl font-bold">{filledCount}/81</p>
                    </div>
                    <div className="rounded-2xl bg-secondary p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Conflitos
                      </p>
                      <p className="mt-2 text-xl font-bold">
                        {conflictSet.size}
                      </p>
                    </div>
                  </div>

                  {completedTime !== null ? (
                    <div className="mt-5 rounded-2xl bg-emerald-100 px-4 py-4 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                      Tabuleiro concluído em{" "}
                      <strong>{formatElapsedTime(completedTime)}</strong>.
                    </div>
                  ) : null}
                </div>

                <div
                  className="card-base relative overflow-hidden p-4 sm:p-5"
                  data-game-focus
                >
                  <ConfettiBurst active={completedTime !== null} />
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px] xl:items-start">
                    <div
                      className="game-interactive-area protected-interactive mx-auto w-full max-w-[620px]"
                      onContextMenu={event => event.preventDefault()}
                    >
                      <div
                        className="grid grid-cols-9 gap-[2px] rounded-[28px] bg-primary/10 p-2 sm:gap-1 sm:p-3"
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
                            <button
                              key={index}
                              type="button"
                              role="gridcell"
                              aria-selected={isSelected}
                              aria-invalid={hasConflict}
                              aria-label={`Linha ${getSudokuRow(index) + 1}, coluna ${getSudokuColumn(index) + 1}`}
                              onClick={() => setSelectedCell(index)}
                              className={cn(
                                "aspect-square min-h-10 rounded-md border text-sm font-semibold transition-colors sm:text-xl",
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
                                  "font-bold text-foreground",
                                !isGiven &&
                                  !isSelected &&
                                  !hasConflict &&
                                  "text-primary dark:text-sky-200"
                              )}
                            >
                              {value === 0 ? "" : value}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground sm:text-sm">
                        <span className="rounded-full bg-secondary px-3 py-1">
                          9x9
                        </span>
                        <span className="rounded-full bg-secondary px-3 py-1">
                          {getSudokuDifficultyClues(currentDifficulty)} pistas
                          iniciais
                        </span>
                        <span className="rounded-full bg-secondary px-3 py-1">
                          Linha, coluna e bloco destacados
                        </span>
                      </div>
                    </div>

                    <div className="xl:sticky xl:top-24">{renderKeypad()}</div>
                  </div>
                </div>

                <div className="card-base p-5 sm:p-6">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <button
                      type="button"
                      onClick={() => startNewGame(currentDifficulty)}
                      className="btn-primary"
                    >
                      Novo jogo
                    </button>
                    <button
                      type="button"
                      onClick={restartGame}
                      className="btn-secondary"
                    >
                      Reiniciar jogo
                    </button>
                    <button
                      type="button"
                      onClick={handleClearErrors}
                      className="btn-secondary"
                    >
                      Limpar erros editáveis
                    </button>
                    <button
                      type="button"
                      onClick={handleCheckProgress}
                      className="btn-secondary"
                    >
                      Verificar progresso
                    </button>
                  </div>
                </div>
              </section>

              <aside className="space-y-5">
                <div className="card-base p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold">
                      Top 10 neste navegador
                    </h2>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {difficultyCopy.label}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
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

                <div className="card-base p-6">
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

            <div
              id="explicacao"
              className="section-anchor grid gap-6 lg:grid-cols-2"
            >
              <section className="card-base p-6">
                <h2 className="text-2xl font-bold">O que é Sudoku</h2>
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
              </section>

              <section className="card-base p-6">
                <h2 className="text-2xl font-bold">Benefícios do Sudoku</h2>
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
                    3. Use o teclado numérico, reinicie o jogo se quiser
                    recomeçar e registre sua pontuação ao entrar no ranking.
                  </div>
                </div>
              </section>
            </div>

            <section id="faq" className="section-anchor card-base p-6">
              <h2 className="text-2xl font-bold">Perguntas frequentes</h2>
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
            </section>

            <CoreNavigationBlock />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
