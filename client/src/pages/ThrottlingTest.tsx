import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Gauge,
  LoaderCircle,
  Wifi,
} from "lucide-react";
import AdSlot from "@/components/AdSlot";
import ThrottlingVerdictBadge from "@/components/utilities/ThrottlingVerdictBadge";
import UtilityMetricCard from "@/components/utilities/UtilityMetricCard";
import PageShell from "@/components/layout/PageShell";
import { useI18n } from "@/contexts/LanguageContext";
import { trackAnalyticsEvent } from "@/lib/analytics";
import {
  formatLatency,
  formatPercent,
  formatSpeed,
  getVerdictLabel,
  runThrottlingDiagnostics,
  type ThrottlingProgressState,
  type ThrottlingSummary,
} from "@/lib/network-diagnostics";
import {
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  getNavigationLabels,
} from "@/lib/navigation";
import { getBackToTopLabel, getToolPageNavItems } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";

const PAGE_PATH = "/utilitarios/teste-de-throttling/";
const softCardClass = "utility-copy-safe rounded-3xl bg-secondary p-5";
const outlineCardClass = "utility-copy-safe rounded-3xl border border-border p-5";

const FAQ_ITEMS = [
  {
    question: "Esse teste dá certeza de limitação?",
    answer:
      "Não. Ele mostra sinais que merecem atenção, mas não funciona como prova definitiva.",
  },
  {
    question: "Por que o teste roda mais de uma vez?",
    answer:
      "Porque uma medição isolada pode oscilar. Repetir ajuda a mostrar um resultado mais confiável.",
  },
  {
    question: "Wi-Fi pode interferir?",
    answer:
      "Sim. Distância do roteador, outros aparelhos conectados e paredes podem mudar o resultado.",
  },
  {
    question: "O que significa conexão estável?",
    answer:
      "Significa que velocidade e tempo de resposta ficaram parecidos ao longo do teste, sem grandes oscilações.",
  },
  {
    question: "O que fazer se aparecer sinal de limitação?",
    answer:
      "Vale repetir em outro horário, testar mais perto do roteador ou com cabo e, se o padrão continuar, falar com a operadora.",
  },
];

function getVerdictTone(summary: ThrottlingSummary | null) {
  if (!summary) {
    return "default" as const;
  }

  switch (summary.verdict) {
    case "strong_indication":
      return "danger" as const;
    case "moderate_indication":
      return "warning" as const;
    case "no_relevant_evidence":
      return "success" as const;
    default:
      return "default" as const;
  }
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function getStabilitySummary(summary: ThrottlingSummary | null) {
  if (!summary) {
    return {
      value: "Aguardando teste",
      helper: "Quando o teste terminar, mostramos aqui como a conexão se comportou.",
    };
  }

  const packetLoss = summary.overallPacketLossPercent;
  const jitter = summary.overallJitterMs;

  if (packetLoss >= 8 || jitter >= 45) {
    return {
      value: "Instável",
      helper: "A conexão oscilou bastante durante a medição.",
    };
  }

  if (packetLoss >= 3 || jitter >= 18) {
    return {
      value: "Oscilando",
      helper: "Houve alguma variação, mas ainda dá para observar o padrão geral.",
    };
  }

  return {
    value: "Boa",
    helper: "A conexão ficou consistente na maior parte do teste.",
  };
}

export default function ThrottlingTest() {
  const { language } = useI18n();
  const navigationLabels = getNavigationLabels(language);
  const navItems = getToolPageNavItems(language);
  const topLabel = getBackToTopLabel(language);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.utilities, href: "/utilitarios/" },
    { label: "Teste de Internet e Limitações" },
  ];

  const [summary, setSummary] = useState<ThrottlingSummary | null>(null);
  const [progress, setProgress] = useState<ThrottlingProgressState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");

  usePageSeo({
    title: "Teste de Internet e Limitações | Veja estabilidade e sinais de limitação",
    description:
      "Descubra se sua conexão está estável e se há indícios de limitação de velocidade.",
    path: PAGE_PATH,
    keywords: [
      "teste de internet",
      "internet limitada",
      "sinais de limitação",
      "velocidade da internet",
      "tempo de resposta",
      "estabilidade da conexão",
    ],
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Teste de Internet e Limitações",
        url: `https://datasuteis.com.br${PAGE_PATH}`,
        description:
          "Ferramenta para medir a estabilidade da conexão e procurar sinais de limitação de velocidade.",
      },
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Teste de Internet e Limitações",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        url: `https://datasuteis.com.br${PAGE_PATH}`,
        description:
          "Teste online para comparar sua conexão em algumas rodadas e mostrar um resumo simples.",
      },
      buildBreadcrumbSchema([
        { label: navigationLabels.home, href: "/" },
        { label: navigationLabels.utilities, href: "/utilitarios/" },
        { label: "Teste de Internet e Limitações", href: PAGE_PATH },
      ]),
      buildFaqPageSchema(FAQ_ITEMS),
    ],
  });

  async function handleStartTest() {
    setIsRunning(true);
    setError("");
    setSummary(null);
    setProgress({
      currentRound: 1,
      currentStep: 0,
      totalSteps: 18,
      percent: 0,
      label: "Preparando o teste...",
    });

    trackAnalyticsEvent("utility_throttling_started");

    try {
      const result = await runThrottlingDiagnostics(nextProgress => {
        setProgress(nextProgress);
      });

      setSummary(result);
      trackAnalyticsEvent("utility_throttling_finished", {
        verdict: result.verdict,
        download_gap_percent: result.normalVsObfuscatedDownloadGapPercent,
        upload_gap_percent: result.normalVsObfuscatedUploadGapPercent,
        latency_gap_percent: result.normalVsObfuscatedLatencyGapPercent,
      });
    } catch {
      setError(
        "O teste não conseguiu terminar agora. Tente novamente em instantes."
      );
      trackAnalyticsEvent("utility_throttling_error");
    } finally {
      setIsRunning(false);
    }
  }

  const verdictTone = getVerdictTone(summary);
  const stability = getStabilitySummary(summary);

  const headlineMetrics = useMemo(() => {
    if (!summary) {
      return null;
    }

    return {
      download: average([
        summary.averageNormal.downloadMbps,
        summary.averageObfuscated.downloadMbps,
      ]),
      upload: average([
        summary.averageNormal.uploadMbps,
        summary.averageObfuscated.uploadMbps,
      ]),
      responseTime: summary.overallPingMs,
      stability,
    };
  }, [stability, summary]);

  const comparisonCards = useMemo(() => {
    if (!summary) {
      return null;
    }

    return [
      {
        label: "Download",
        main: formatSpeed(summary.averageNormal.downloadMbps),
        comparison: formatSpeed(summary.averageObfuscated.downloadMbps),
        difference: formatPercent(summary.normalVsObfuscatedDownloadGapPercent),
      },
      {
        label: "Upload",
        main: formatSpeed(summary.averageNormal.uploadMbps),
        comparison: formatSpeed(summary.averageObfuscated.uploadMbps),
        difference: formatPercent(summary.normalVsObfuscatedUploadGapPercent),
      },
      {
        label: "Tempo de resposta com uso",
        main: formatLatency(summary.averageNormal.loadedLatencyMs),
        comparison: formatLatency(summary.averageObfuscated.loadedLatencyMs),
        difference: formatPercent(summary.normalVsObfuscatedLatencyGapPercent),
      },
    ];
  }, [summary]);

  return (
    <PageShell
      eyebrow="Utilitários"
      title="Teste de Internet e Limitações"
      description="Descubra se sua conexão está estável e se há indícios de limitação de velocidade."
      navItems={navItems}
      topLabel={topLabel}
      breadcrumbs={breadcrumbs}
      breadcrumbAriaLabel={navigationLabels.breadcrumb}
      backButtonLabel={navigationLabels.back}
      backButtonAriaLabel={navigationLabels.backAria}
      language={language}
      ctaTitle="Quer ver os dados básicos da sua conexão também?"
      ctaButtonLabel="Abrir Qual é meu IP"
      ctaHref="/utilitarios/qual-e-meu-ip/"
    >
      <section id="ferramenta" className="section-anchor">
        <div className="section-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="utility-copy-safe max-w-2xl">
              <p className="text-sm font-semibold text-primary">Análise da conexão</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                O teste leva poucos instantes e compara sua conexão em três rodadas para mostrar um resumo simples.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleStartTest()}
              className="btn-primary"
              disabled={isRunning}
            >
              {isRunning ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Gauge className="mr-2 h-4 w-4" />
              )}
              Iniciar teste
            </button>
          </div>

          {progress ? (
            <div className="mt-5 rounded-3xl border border-border p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="utility-copy-safe">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Progresso
                  </p>
                  <p className="mt-2 font-semibold text-foreground">
                    {progress.label}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold">
                  {progress.currentStep}/{progress.totalSteps}
                </span>
              </div>
              <div className="mt-4 h-3 rounded-full bg-secondary">
                <div
                  className="h-3 rounded-full bg-primary transition-[width]"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-3xl bg-rose-100 px-5 py-4 text-sm leading-6 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </div>
          ) : null}

          {summary && headlineMetrics ? (
            <div className="mt-6 space-y-6">
              <div className="rounded-3xl border border-border p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="utility-copy-safe max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Resultado final
                    </p>
                    <h2 className="mt-2 text-3xl font-bold">
                      {getVerdictLabel(summary.verdict)}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {summary.explanation}
                    </p>
                  </div>
                  <ThrottlingVerdictBadge verdict={summary.verdict} />
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {summary.reasons.map(reason => (
                    <div
                      key={reason}
                      className="utility-copy-safe rounded-2xl bg-secondary px-4 py-3 text-sm leading-6 text-muted-foreground"
                    >
                      {reason}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <UtilityMetricCard
                  label="Download"
                  value={formatSpeed(headlineMetrics.download)}
                  helper="Velocidade média observada durante o teste."
                  icon={<ArrowDownToLine className="h-5 w-5" />}
                  tone={verdictTone}
                />
                <UtilityMetricCard
                  label="Upload"
                  value={formatSpeed(headlineMetrics.upload)}
                  helper="Envio médio medido ao longo das rodadas."
                  icon={<ArrowUpFromLine className="h-5 w-5" />}
                  tone={verdictTone}
                />
                <UtilityMetricCard
                  label="Tempo de resposta"
                  value={formatLatency(headlineMetrics.responseTime)}
                  helper="Quanto tempo a conexão levou para responder."
                  icon={<Activity className="h-5 w-5" />}
                  tone={verdictTone}
                />
                <UtilityMetricCard
                  label="Estabilidade"
                  value={headlineMetrics.stability.value}
                  helper={headlineMetrics.stability.helper}
                  icon={<Wifi className="h-5 w-5" />}
                  tone={verdictTone}
                />
              </div>

              {comparisonCards ? (
                <details className="utility-copy-safe rounded-3xl border border-border p-5 md:p-6">
                  <summary className="cursor-pointer text-lg font-semibold">
                    Ver comparação da conexão
                  </summary>
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {comparisonCards.map(item => (
                      <article key={item.label} className={softCardClass}>
                        <h3 className="text-lg font-bold">{item.label}</h3>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          Medição principal: <strong className="text-foreground">{item.main}</strong>
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Medição de comparação:{" "}
                          <strong className="text-foreground">{item.comparison}</strong>
                        </p>
                        <p className="mt-3 text-sm font-semibold text-foreground">
                          Diferença: {item.difference}
                        </p>
                      </article>
                    ))}
                  </div>
                </details>
              ) : null}

              <details className="utility-copy-safe rounded-3xl border border-border p-5 md:p-6">
                <summary className="cursor-pointer text-lg font-semibold">
                  Ver cada rodada
                </summary>
                <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
                  {summary.rounds.map(round => (
                    <article key={round.round} className={softCardClass}>
                      <h3 className="text-lg font-bold">Rodada {round.round}</h3>
                      <div className="mt-4 space-y-3 text-sm leading-6">
                        <div>
                          <p className="font-semibold text-foreground">
                            Medição principal
                          </p>
                          <p className="text-muted-foreground">
                            Download {formatSpeed(round.normal.downloadMbps)} • Upload{" "}
                            {formatSpeed(round.normal.uploadMbps)}
                          </p>
                          <p className="text-muted-foreground">
                            Tempo de resposta {formatLatency(round.normal.pingMs)}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            Medição de comparação
                          </p>
                          <p className="text-muted-foreground">
                            Download {formatSpeed(round.obfuscated.downloadMbps)} • Upload{" "}
                            {formatSpeed(round.obfuscated.uploadMbps)}
                          </p>
                          <p className="text-muted-foreground">
                            Tempo de resposta {formatLatency(round.obfuscated.pingMs)}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </details>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className={softCardClass}>
                <h2 className="text-xl font-bold">O que o teste mostra</h2>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  <li>Velocidade de download</li>
                  <li>Velocidade de upload</li>
                  <li>Tempo de resposta e estabilidade</li>
                </ul>
              </div>
              <div className={outlineCardClass}>
                <h2 className="text-xl font-bold">Antes de começar</h2>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  <li>Se puder, fique perto do roteador.</li>
                  <li>Evite vídeos e downloads paralelos durante a medição.</li>
                  <li>Se o resultado chamar atenção, repita em outro horário.</li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-6">
            <AdSlot
              id="ads-throttling-top"
              minHeight={120}
              format="horizontal"
              className="rounded-2xl"
            />
          </div>
        </div>
      </section>

      <section id="explicacao" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">Como o teste funciona</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <article className={softCardClass}>
              <h3 className="text-xl font-bold">Mede a velocidade</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                O teste observa como sua conexão se sai no download e no upload ao longo de algumas rodadas.
              </p>
            </article>
            <article className={softCardClass}>
              <h3 className="text-xl font-bold">Mede o tempo de resposta</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Também verificamos quanto tempo a conexão leva para responder enquanto está sendo usada.
              </p>
            </article>
            <article className={softCardClass}>
              <h3 className="text-xl font-bold">Compara os resultados</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Depois, a ferramenta compara as medições para ver se apareceu um padrão que mereça atenção.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="exemplos" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">Como entender o resultado</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <article className={outlineCardClass}>
              <h3 className="text-xl font-bold">Sua conexão está estável</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Não encontramos sinais de limitação na sua internet durante este teste.
              </p>
            </article>
            <article className={outlineCardClass}>
              <h3 className="text-xl font-bold">Pode haver limitação</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Se a diferença entre as medições aparecer mais de uma vez, vale repetir o teste e observar o padrão.
              </p>
            </article>
            <article className={outlineCardClass}>
              <h3 className="text-xl font-bold">Não deu para concluir</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Quando a conexão oscila demais, o melhor é rodar de novo em outro horário para comparar.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="faq" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">Perguntas frequentes</h2>
          <div className="mt-6 space-y-3">
            {FAQ_ITEMS.map(item => (
              <details
                key={item.question}
                className="utility-copy-safe rounded-2xl bg-secondary px-4 py-3"
              >
                <summary className="cursor-pointer font-semibold">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
