import { type CSSProperties, useEffect, useMemo, useState } from "react";
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
  clearTicTacToeStats,
  getComputerMove,
  getWinningLine,
  isBoardFull,
  loadTicTacToeStats,
  recordTicTacToeResult,
  type TicTacToeCell,
  type TicTacToeHistoryEntry,
  type TicTacToeMode,
  type TicTacToePlayer,
  type TicTacToeResult,
} from "@/lib/tic-tac-toe";
import { cn } from "@/lib/utils";

const GAME_MODE_COPY: Record<
  TicTacToeMode,
  {
    label: string;
    shortLabel: string;
    helper: string;
    switchMessage: string;
  }
> = {
  pvp: {
    label: "2 jogadores",
    shortLabel: "2 jogadores",
    helper: "Chame alguém para dividir a rodada.",
    switchMessage: "Agora a rodada é para 2 jogadores.",
  },
  cpu: {
    label: "Contra o computador",
    shortLabel: "Computador",
    helper: "Você joga com X e o computador responde com O.",
    switchMessage: "Agora é você contra o computador.",
  },
};

const FAQ_ITEMS = [
  {
    question: "Posso jogar sozinho?",
    answer:
      "Sim. Escolha a opção contra o computador e jogue com X enquanto ele responde com O.",
  },
  {
    question: "Dá para jogar contra o computador?",
    answer:
      "Dá sim. Depois da sua jogada, o computador faz a dele automaticamente.",
  },
  {
    question: "Quem começa a rodada?",
    answer:
      "Contra o computador, você começa com X. Em 2 jogadores, a abertura alterna a cada nova rodada.",
  },
  {
    question: "Como funciona o empate?",
    answer:
      "Se ninguém fechar linha, coluna ou diagonal até a última casa, dá velha.",
  },
  {
    question: "Posso reiniciar sem perder o placar?",
    answer:
      "Sim. Recomeçar limpa só a rodada atual. Se quiser apagar a contagem, use zerar placar.",
  },
] as const;

function createEmptyBoard(): TicTacToeCell[] {
  return Array.from({ length: 9 }, () => null);
}

function getWinningLineLabel(line: number[] | null) {
  const key = line?.join("-");
  switch (key) {
    case "0-1-2":
      return "linha de cima";
    case "3-4-5":
      return "linha do meio";
    case "6-7-8":
      return "linha de baixo";
    case "0-3-6":
      return "coluna da esquerda";
    case "1-4-7":
      return "coluna do meio";
    case "2-5-8":
      return "coluna da direita";
    case "0-4-8":
      return "diagonal principal";
    case "2-4-6":
      return "diagonal cruzada";
    default:
      return null;
  }
}

function getRoundResultLabel(result: TicTacToeResult, mode: TicTacToeMode) {
  if (result === "draw") {
    return "Deu velha";
  }

  if (mode === "cpu") {
    return result === "X" ? "Você ganhou" : "Computador ganhou";
  }

  return `${result} venceu`;
}

function getHistoryModeLabel(mode: TicTacToeMode) {
  return mode === "cpu" ? "Contra o computador" : "2 jogadores";
}

export default function TicTacToe() {
  const { formatDate, language } = useI18n();
  const navigationLabels = getNavigationLabels(language);
  const [mode, setMode] = useState<TicTacToeMode>("pvp");
  const [board, setBoard] = useState<TicTacToeCell[]>(() => createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<TicTacToePlayer>("X");
  const [startingPlayer, setStartingPlayer] = useState<TicTacToePlayer>("X");
  const [winner, setWinner] = useState<TicTacToePlayer | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [computerThinking, setComputerThinking] = useState(false);
  const [stats, setStats] = useState(() => loadTicTacToeStats());
  const [resultSaved, setResultSaved] = useState(false);

  const filledCount = useMemo(
    () => board.filter(cell => cell !== null).length,
    [board]
  );
  const progress = Math.round((filledCount / 9) * 100);
  const winnerLineLabel = getWinningLineLabel(winningLine);
  const recentMatches = stats.history.slice(0, 5);
  const modeCopy = GAME_MODE_COPY[mode];
  const navItems = getToolPageNavItems(language);
  const topLabel = getBackToTopLabel(language);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.games },
    { label: navigationLabels.brainGames, href: "/jogos/" },
    { label: "Jogo da Velha" },
  ];
  const boardSizing = {
    staticMax: "27rem",
    vhOffset: "28rem",
  };

  const turnChipText = winner
    ? mode === "cpu"
      ? winner === "X"
        ? "Você venceu"
        : "Computador venceu"
      : `${winner} venceu`
    : isDraw
      ? "Deu velha"
      : computerThinking
        ? "Computador pensando..."
        : mode === "cpu"
          ? currentPlayer === "X"
            ? "Sua vez"
            : "Vez do computador"
          : `Vez de ${currentPlayer}`;

  const statusText = winner
    ? mode === "cpu"
      ? winner === "X"
        ? `Você fechou a ${winnerLineLabel ?? "linha"} e levou essa.`
        : `O computador fechou a ${winnerLineLabel ?? "linha"} e venceu a rodada.`
      : `${winner} fechou a ${winnerLineLabel ?? "linha"} e venceu a rodada.`
    : isDraw
      ? "Deu velha. Ninguém conseguiu fechar a linha desta vez."
      : computerThinking
        ? "O computador está escolhendo a próxima jogada."
        : mode === "cpu"
          ? "Sua vez. Tente fechar uma linha antes do computador."
          : `Agora é a vez de ${currentPlayer}. Quem fechar uma linha primeiro leva a rodada.`;

  usePageSeo({
    title:
      "Jogo da Velha Online | 2 Jogadores ou Contra o Computador | Datas Úteis",
    description:
      "Jogue sozinho contra o computador ou chame outra pessoa para uma rodada rápida de jogo da velha. Feche linha, coluna ou diagonal e jogue de novo quando quiser.",
    path: "/jogos/jogo-da-velha/",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Game",
        name: "Jogo da Velha Online",
        url: "https://datasuteis.com.br/jogos/jogo-da-velha/",
        description:
          "Escolha entre jogar com outra pessoa ou enfrentar o computador em partidas rápidas de jogo da velha.",
        genre: "Strategy",
      },
      {
        ...buildBreadcrumbSchema(
          [
            { label: navigationLabels.home, href: "/" },
            { label: navigationLabels.games, href: "/jogos/" },
            { label: navigationLabels.brainGames, href: "/jogos/" },
            { label: "Jogo da Velha", href: "/jogos/jogo-da-velha/" },
          ],
          "/jogos/jogo-da-velha/"
        ),
      },
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Jogo da Velha Online",
        url: "https://datasuteis.com.br/jogos/jogo-da-velha/",
        description:
          "Partidas rápidas de jogo da velha para jogar com outra pessoa ou contra o computador.",
      },
      buildFaqPageSchema(FAQ_ITEMS),
    ],
  });

  function resetBoard(nextStarter: TicTacToePlayer) {
    setBoard(createEmptyBoard());
    setCurrentPlayer(nextStarter);
    setWinner(null);
    setWinningLine(null);
    setIsDraw(false);
    setComputerThinking(false);
    setResultSaved(false);
  }

  function saveMatchResult(result: TicTacToeResult, moves: number) {
    if (resultSaved) {
      return;
    }

    setStats(current =>
      recordTicTacToeResult(current, result, moves, startingPlayer, mode)
    );
    setResultSaved(true);
    trackAnalyticsEvent("game_completed", {
      game_name: "tic_tac_toe",
      result,
      moves,
      starter: startingPlayer,
      mode,
    });
  }

  function applyMove(index: number, player: TicTacToePlayer) {
    if (board[index] !== null || winner !== null || isDraw) {
      return;
    }

    const nextBoard = [...board];
    nextBoard[index] = player;

    const nextWinningLine = getWinningLine(nextBoard);
    const boardNowFull = isBoardFull(nextBoard);

    setBoard(nextBoard);

    if (nextWinningLine) {
      setWinner(player);
      setWinningLine([...nextWinningLine]);
      setIsDraw(false);
      setComputerThinking(false);
      if (mode === "cpu" && player === "O") {
        toast.success("O computador venceu.");
      } else if (mode === "cpu" && player === "X") {
        toast.success("Você venceu.");
      } else {
        toast.success(`${player} venceu.`);
      }
      saveMatchResult(player, filledCount + 1);
      return;
    }

    if (boardNowFull) {
      setWinner(null);
      setWinningLine(null);
      setIsDraw(true);
      setComputerThinking(false);
      toast("Deu velha.");
      saveMatchResult("draw", filledCount + 1);
      return;
    }

    const nextPlayer: TicTacToePlayer = player === "X" ? "O" : "X";
    setCurrentPlayer(nextPlayer);
    setComputerThinking(mode === "cpu" && nextPlayer === "O");
  }

  function switchMode(nextMode: TicTacToeMode) {
    if (nextMode === mode) {
      return;
    }

    setMode(nextMode);
    setStartingPlayer("X");
    resetBoard("X");
    toast(GAME_MODE_COPY[nextMode].switchMessage);
    trackAnalyticsEvent("game_mode_changed", {
      game_name: "tic_tac_toe",
      mode: nextMode,
    });
  }

  useEffect(() => {
    if (
      mode !== "cpu" ||
      currentPlayer !== "O" ||
      winner !== null ||
      isDraw ||
      !computerThinking
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      const move = getComputerMove(board, "O", "X");

      if (move === null) {
        setComputerThinking(false);
        return;
      }

      applyMove(move, "O");
    }, 380);

    return () => {
      window.clearTimeout(timer);
    };
  }, [board, computerThinking, currentPlayer, isDraw, mode, winner]);

  function restartRound() {
    const nextStarter = mode === "cpu" ? "X" : startingPlayer;
    resetBoard(nextStarter);
    toast("Rodada recomeçada.");
    trackAnalyticsEvent("game_restarted", {
      game_name: "tic_tac_toe",
      starter: nextStarter,
      mode,
    });
  }

  function startNewGame() {
    const nextStarter =
      mode === "cpu" ? "X" : startingPlayer === "X" ? "O" : "X";
    setStartingPlayer(nextStarter);
    resetBoard(nextStarter);
    toast(
      mode === "cpu"
        ? "Nova rodada pronta. Você começa com X."
        : `${nextStarter} abre a próxima rodada.`
    );
    trackAnalyticsEvent("game_started", {
      game_name: "tic_tac_toe",
      starter: nextStarter,
      mode,
    });
  }

  function clearScoreboard() {
    setStats(clearTicTacToeStats());
    toast("Placar zerado.");
    trackAnalyticsEvent("score_reset", {
      game_name: "tic_tac_toe",
      mode,
    });
  }

  const modeButtons = (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(GAME_MODE_COPY) as TicTacToeMode[]).map(modeKey => (
        <button
          key={modeKey}
          type="button"
          className={cn(
            "game-difficulty-button",
            mode === modeKey
              ? "bg-primary text-primary-foreground"
              : "bg-secondary hover:bg-secondary/80"
          )}
          onClick={() => switchMode(modeKey)}
        >
          {GAME_MODE_COPY[modeKey].label}
        </button>
      ))}
    </div>
  );

  function renderHistoryCard(entry: TicTacToeHistoryEntry) {
    return (
      <div key={entry.id} className="game-context-card">
        <div className="flex items-center justify-between gap-3">
          <strong className="text-foreground">
            {getRoundResultLabel(entry.result, entry.mode)}
          </strong>
          <span className="text-xs text-muted-foreground">
            {entry.moves} jogadas
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {getHistoryModeLabel(entry.mode)} • Começou com {entry.starter} •{" "}
          {formatDate(entry.date, {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" role="main" className="relative">
        <GamePageHero
          breadcrumbs={breadcrumbs}
          breadcrumbAriaLabel={navigationLabels.breadcrumb}
          backLabel={navigationLabels.back}
          backAriaLabel={navigationLabels.backAria}
          title="Jogo da Velha Online"
          mobileSummary="Escolha entre jogar com outra pessoa ou encarar o computador. Feche uma linha, coluna ou diagonal e emende outra rodada quando quiser."
        />

        <FloatingSectionNav items={navItems} topLabel={topLabel} />

        <section className="section-game">
          <div className="container mx-auto game-mobile-container game-page-stack">
            <GameLanguageNotice />

            <section id="ferramenta" className="section-anchor">
              <div
                className="card-base game-focus-card game-panel"
                data-game-focus
              >
                <ConfettiBurst active={winner !== null} />
                <div className="hidden lg:block game-toolbar">
                  <div className="game-toolbar-row">
                    <div className="flex flex-wrap items-center gap-2">
                      {modeButtons}
                      <div className="game-theme-chip game-theme-chip-compact">
                        {mode === "cpu"
                          ? "Você joga com X"
                          : `${startingPlayer} começa esta rodada`}
                      </div>
                    </div>

                    <div className="game-meta-row">
                      <span className="game-meta-chip">{turnChipText}</span>
                      <span className="game-meta-chip">
                        Rodadas: {stats.gamesPlayed}
                      </span>
                      <span className="game-meta-chip">X: {stats.xWins}</span>
                      <span className="game-meta-chip">O: {stats.oWins}</span>
                      <span className="game-meta-chip">
                        Empates: {stats.draws}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
                    {statusText}
                  </div>
                </div>
                <GameMobileProgress
                  value={progress}
                  label="Andamento da rodada"
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
                    >
                      <div
                        className="grid grid-cols-3 gap-3 rounded-[28px] bg-primary/10 p-3 sm:gap-4 sm:p-4"
                        role="grid"
                        aria-label="Tabuleiro da rodada"
                      >
                        {board.map((cell, index) => {
                          const isWinningCell =
                            winningLine?.includes(index) ?? false;

                          return (
                            <button
                              key={index}
                              type="button"
                              role="gridcell"
                              aria-label={`Casa ${index + 1}, ${cell ?? "vazia"}`}
                              className={cn(
                                "aspect-square rounded-[22px] border border-border bg-background text-4xl font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-6xl",
                                cell === null &&
                                  winner === null &&
                                  !isDraw &&
                                  !computerThinking &&
                                  "hover:bg-secondary/80",
                                cell === "X" &&
                                  !isWinningCell &&
                                  "text-primary dark:text-sky-200",
                                cell === "O" &&
                                  !isWinningCell &&
                                  "text-amber-600 dark:text-amber-300",
                                isWinningCell &&
                                  "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200"
                              )}
                              onClick={() => applyMove(index, currentPlayer)}
                              disabled={
                                cell !== null ||
                                winner !== null ||
                                isDraw ||
                                computerThinking ||
                                (mode === "cpu" && currentPlayer === "O")
                              }
                            >
                              {cell ?? "·"}
                            </button>
                          );
                        })}
                      </div>

                      <div className="game-meta-row mt-4 hidden justify-center lg:flex">
                        <span className="game-meta-chip">
                          Casas livres: {9 - filledCount}
                        </span>
                        <span className="game-meta-chip">
                          {mode === "cpu"
                            ? "Você joga com X"
                            : `${startingPlayer} abriu a rodada`}
                        </span>
                        <span className="game-meta-chip">
                          {winnerLineLabel
                            ? `Destaque: ${winnerLineLabel}`
                            : "Feche linha, coluna ou diagonal"}
                        </span>
                      </div>
                    </div>

                    <div className="game-mobile-primary-actions lg:flex lg:flex-wrap lg:gap-2">
                      <button
                        type="button"
                        onClick={startNewGame}
                        className="btn-primary"
                      >
                        Nova rodada
                      </button>
                      <button
                        type="button"
                        onClick={restartRound}
                        className="btn-secondary"
                      >
                        Recomeçar
                      </button>
                      <button
                        type="button"
                        onClick={clearScoreboard}
                        className="btn-secondary"
                      >
                        Zerar placar
                      </button>
                    </div>

                    <div className="hidden lg:block game-secondary-note">
                      Escolha como quer jogar, marque uma casa vazia e tente
                      fechar a linha antes do outro lado.
                    </div>

                    <div className="space-y-3 lg:hidden">
                      <div className="game-context-card-muted">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Rodada atual
                        </p>
                        <p className="mt-2 font-semibold text-foreground">
                          {turnChipText}
                        </p>
                        <p className="mt-1 leading-6">{statusText}</p>
                        <p className="mt-2 text-xs leading-5">
                          Faltam {9 - filledCount} casas para terminar a rodada.
                        </p>
                      </div>

                      <div className="game-context-card">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-base font-bold">
                            Placar da sequência
                          </h2>
                          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                            {modeCopy.shortLabel}
                          </span>
                        </div>
                        <div className="game-context-list">
                          <div className="game-context-item text-foreground">
                            <strong>Rodadas:</strong> {stats.gamesPlayed}
                          </div>
                          <div className="game-context-item text-foreground">
                            <strong>X:</strong> {stats.xWins}
                          </div>
                          <div className="game-context-item text-foreground">
                            <strong>O:</strong> {stats.oWins}
                          </div>
                          <div className="game-context-item text-foreground">
                            <strong>Empates:</strong> {stats.draws}
                          </div>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-muted-foreground">
                          Essa contagem continua por aqui até você zerar o
                          placar.
                        </p>
                      </div>
                    </div>
                  </div>

                  <aside className="game-standard-context-sidebar">
                    <div className="game-context-card">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-bold">Rodada atual</h2>
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                          {modeCopy.label}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {modeCopy.helper}
                      </p>
                      <div className="game-context-list">
                        <div className="game-context-item text-foreground">
                          <strong>Agora:</strong> {turnChipText}
                        </div>
                        <div className="game-context-item text-foreground">
                          <strong>Começa com:</strong> {startingPlayer}
                        </div>
                        <div className="game-context-item text-foreground">
                          <strong>Casas livres:</strong> {9 - filledCount}
                        </div>
                        <div className="game-context-item text-foreground">
                          <strong>Resumo:</strong> {statusText}
                        </div>
                      </div>
                    </div>

                    <div className="game-context-card">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-bold">
                          Placar da sequência
                        </h2>
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                          {stats.gamesPlayed} rodadas
                        </span>
                      </div>
                      <div className="game-context-list">
                        <div className="game-context-item text-foreground">
                          <strong>X:</strong> {stats.xWins}
                        </div>
                        <div className="game-context-item text-foreground">
                          <strong>O:</strong> {stats.oWins}
                        </div>
                        <div className="game-context-item text-foreground">
                          <strong>Empates:</strong> {stats.draws}
                        </div>
                        <div className="game-context-item text-foreground">
                          <strong>Última rodada:</strong>{" "}
                          {recentMatches[0]
                            ? getRoundResultLabel(
                                recentMatches[0].result,
                                recentMatches[0].mode
                              )
                            : "Ainda não há resultado salvo"}
                        </div>
                      </div>
                      <div className="mt-3 rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                        Troque o modo quando quiser e continue jogando. Se
                        preferir começar do zero, basta zerar o placar.
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </section>

            <div className="space-y-3 lg:hidden">
              <div className="game-mobile-status-grid">
                <div className="compact-stat compact-stat-tight">
                  <span className="compact-stat-label">Modo</span>
                  <span className="compact-stat-value">
                    {modeCopy.shortLabel}
                  </span>
                </div>
                <div className="compact-stat compact-stat-tight">
                  <span className="compact-stat-label">Agora</span>
                  <span className="compact-stat-value">{turnChipText}</span>
                </div>
                <div className="compact-stat compact-stat-tight">
                  <span className="compact-stat-label">Rodadas</span>
                  <span className="compact-stat-value">
                    {stats.gamesPlayed}
                  </span>
                </div>
                <div className="compact-stat compact-stat-tight">
                  <span className="compact-stat-label">Empates</span>
                  <span className="compact-stat-value">{stats.draws}</span>
                </div>
              </div>

              <ResponsiveSecondarySection
                title="Escolha a partida"
                summaryText="Jogue com outra pessoa ou encare o computador."
              >
                <div className="space-y-4">
                  {modeButtons}
                  <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                    {modeCopy.helper}
                  </div>
                </div>
              </ResponsiveSecondarySection>

              <ResponsiveSecondarySection
                title="Placar da sequência"
                summaryText="Veja quantas rodadas já terminaram e quem está na frente."
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="compact-stat">
                    <span className="compact-stat-label">Rodadas</span>
                    <span className="compact-stat-value">
                      {stats.gamesPlayed}
                    </span>
                  </div>
                  <div className="compact-stat">
                    <span className="compact-stat-label">Vitórias X</span>
                    <span className="compact-stat-value">{stats.xWins}</span>
                  </div>
                  <div className="compact-stat">
                    <span className="compact-stat-label">Vitórias O</span>
                    <span className="compact-stat-value">{stats.oWins}</span>
                  </div>
                  <div className="compact-stat">
                    <span className="compact-stat-label">Empates</span>
                    <span className="compact-stat-value">{stats.draws}</span>
                  </div>
                </div>
              </ResponsiveSecondarySection>

              <ResponsiveSecondarySection
                title="Últimas rodadas"
                summaryText="Acompanhe como as partidas mais recentes terminaram."
              >
                <div className="space-y-3">
                  {recentMatches.length ? (
                    recentMatches.map(renderHistoryCard)
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Jogue algumas rodadas e os resultados vão aparecer aqui.
                    </p>
                  )}
                </div>
              </ResponsiveSecondarySection>
            </div>

            <div id="explicacao" className="game-standard-editorial-grid">
              <section className="game-standard-editorial-main">
                <ResponsiveSecondarySection
                  title="Como jogar jogo da velha"
                  summaryText="Escolha o modo, marque sua casa e tente fechar a linha primeiro."
                >
                  <p className="mt-3 text-muted-foreground">
                    Você pode jogar com outra pessoa ou seguir sozinho contra o
                    computador. Quem está com <strong>X</strong> abre a rodada,
                    e depois as jogadas se alternam até alguém fechar a linha.
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    Vale linha, coluna ou diagonal. Se o tabuleiro encher antes
                    disso, a rodada termina em empate.
                  </p>
                </ResponsiveSecondarySection>

                <ResponsiveSecondarySection
                  id="exemplos"
                  title="Regras da partida"
                  summaryText="Vitória, empate e o que muda em cada modo."
                  className="section-anchor"
                >
                  <p className="mt-3 text-muted-foreground">
                    Em <strong>2 jogadores</strong>, X e O se revezam e a
                    abertura alterna a cada nova rodada. Em{" "}
                    <strong>Contra o computador</strong>, você joga com X e o
                    computador responde com O.
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    Quem fechar uma linha, coluna ou diagonal primeiro vence. Se
                    faltar espaço para isso, dá velha.
                  </p>
                </ResponsiveSecondarySection>

                <ResponsiveSecondarySection
                  title="Recursos da partida"
                  summaryText="Troca de modo, placar da sequência e recomeço rápido."
                >
                  <p className="mt-3 text-muted-foreground">
                    Dá para trocar entre 2 jogadores e contra o computador a
                    qualquer momento, recomeçar a rodada atual ou começar outra
                    sem perder a contagem.
                  </p>
                  <h3 className="mt-6 text-xl font-bold">
                    Benefícios do jogo da velha
                  </h3>
                  <p className="mt-3 text-muted-foreground">
                    É um bom jogo para uma pausa curta, porque pede atenção,
                    leitura rápida das possibilidades e um pouco de antecipação.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href="/jogos/sudoku/" className="btn-secondary">
                      Alternar para Sudoku
                    </Link>
                    <Link
                      href="/jogos/palavras-cruzadas/"
                      className="btn-secondary"
                    >
                      Abrir Palavras Cruzadas
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
                  summaryText="Respostas rápidas sobre modos, empate e placar."
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
                    <Link href="/jogos/sudoku/" className="btn-secondary">
                      Sudoku
                    </Link>
                    <Link
                      href="/jogos/palavras-cruzadas/"
                      className="btn-secondary"
                    >
                      Palavras Cruzadas
                    </Link>
                  </div>
                </ResponsiveSecondarySection>
              </section>

              <aside className="game-standard-editorial-sidebar">
                <div className="card-base p-6">
                  <h2 className="text-xl font-bold">Placar da sequência</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="compact-stat">
                      <span className="compact-stat-label">Rodadas</span>
                      <span className="compact-stat-value">
                        {stats.gamesPlayed}
                      </span>
                    </div>
                    <div className="compact-stat">
                      <span className="compact-stat-label">Vitórias X</span>
                      <span className="compact-stat-value">{stats.xWins}</span>
                    </div>
                    <div className="compact-stat">
                      <span className="compact-stat-label">Vitórias O</span>
                      <span className="compact-stat-value">{stats.oWins}</span>
                    </div>
                    <div className="compact-stat">
                      <span className="compact-stat-label">Empates</span>
                      <span className="compact-stat-value">{stats.draws}</span>
                    </div>
                  </div>
                </div>

                <div className="card-base p-6">
                  <h2 className="text-xl font-bold">Últimas rodadas</h2>
                  <div className="mt-4 space-y-3">
                    {recentMatches.length ? (
                      recentMatches.map(renderHistoryCard)
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Quando você terminar algumas rodadas, os resultados vão
                        aparecer aqui.
                      </p>
                    )}
                  </div>
                </div>
              </aside>
            </div>

            <CoreNavigationBlock />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
