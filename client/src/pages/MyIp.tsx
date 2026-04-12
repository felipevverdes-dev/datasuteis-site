import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  Globe2,
  MapPin,
  MonitorSmartphone,
  RefreshCcw,
  Router,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import AdSlot from "@/components/AdSlot";
import UtilityMetricCard from "@/components/utilities/UtilityMetricCard";
import PageShell from "@/components/layout/PageShell";
import { useI18n } from "@/contexts/LanguageContext";
import { trackAnalyticsEvent } from "@/lib/analytics";
import {
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  getNavigationLabels,
} from "@/lib/navigation";
import { getBackToTopLabel, getToolPageNavItems } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";
import type { IpLookupResponse } from "@shared/connection-tools";

const PAGE_PATH = "/utilitarios/qual-e-meu-ip/";
const softCardClass = "utility-copy-safe rounded-2xl bg-secondary p-3";
const outlineCardClass = "utility-copy-safe rounded-2xl border border-border p-3";

const FAQ_ITEMS = [
  {
    question: "O endereço mostrado aqui é o meu IP público?",
    answer:
      "Sim. Este é o endereço que os sites enxergam quando você acessa a internet.",
  },
  {
    question: "A localização é exata?",
    answer:
      "Não. Ela é uma estimativa baseada no IP e pode apontar para uma cidade próxima.",
  },
  {
    question: "O site guarda meu IP?",
    answer:
      "Não. A consulta é feita na hora e os dados são exibidos apenas para você.",
  },
  {
    question: "O que muda entre IPv4 e IPv6?",
    answer:
      "São dois formatos de IP usados na internet. Hoje muita gente navega com um deles ou com os dois ao mesmo tempo.",
  },
  {
    question: "Quando essa consulta ajuda?",
    answer:
      "Ela ajuda a conferir sua conexão, confirmar a operadora e compartilhar dados básicos com o suporte quando for preciso.",
  },
];

function formatLocation(data: IpLookupResponse) {
  const parts = [data.city, data.region, data.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "Localização aproximada indisponível";
}

export default function MyIp() {
  const { language } = useI18n();
  const navigationLabels = getNavigationLabels(language);
  const navItems = getToolPageNavItems(language);
  const topLabel = getBackToTopLabel(language);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.utilities, href: "/utilitarios/" },
    { label: "Qual é meu IP?" },
  ];

  const [data, setData] = useState<IpLookupResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  usePageSeo({
    title: "Qual é meu IP? Veja seu IP público, localização e provedor",
    description:
      "Descubra seu IP público, localização aproximada e provedor de internet de forma rápida e gratuita.",
    path: PAGE_PATH,
    keywords: [
      "qual é meu ip",
      "meu ip público",
      "descobrir ip",
      "ip público",
      "ipv4 e ipv6",
      "provedor de internet",
    ],
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Qual é meu IP?",
        url: `https://datasuteis.com.br${PAGE_PATH}`,
        description:
          "Veja seu IP público, localização aproximada e detalhes simples da sua conexão.",
      },
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Qual é meu IP?",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        url: `https://datasuteis.com.br${PAGE_PATH}`,
        description:
          "Consulta rápida para mostrar o IP público, a região aproximada e o provedor.",
      },
      buildBreadcrumbSchema([
        { label: navigationLabels.home, href: "/" },
        { label: navigationLabels.utilities, href: "/utilitarios/" },
        { label: "Qual é meu IP?", href: PAGE_PATH },
      ]),
      buildFaqPageSchema(FAQ_ITEMS),
    ],
  });

  async function loadIpData() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ip", {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`ip_lookup_failed_${response.status}`);
      }

      const payload = (await response.json()) as IpLookupResponse;
      setData(payload);
      trackAnalyticsEvent("utility_ip_lookup_success", {
        ip_version: payload.ipVersion,
        has_location: Boolean(payload.city || payload.region || payload.country),
      });
    } catch {
      setError(
        "Não conseguimos carregar seus dados agora. Tente novamente em instantes."
      );
      trackAnalyticsEvent("utility_ip_lookup_error");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadIpData();
  }, []);

  const copyText = useMemo(() => {
    if (!data) {
      return "";
    }

    return [
      `IP público: ${data.ip}`,
      `Tipo do IP: ${data.ipVersion}`,
      `Localização aproximada: ${formatLocation(data)}`,
      `Provedor: ${data.isp ?? "Não identificado"}`,
      `Navegador: ${data.browser}`,
      `Sistema operacional: ${data.os}`,
    ].join("\n");
  }, [data]);

  async function handleCopy() {
    if (!copyText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(copyText);
      toast.success("Dados copiados.");
      trackAnalyticsEvent("utility_ip_lookup_copied");
    } catch {
      toast.error("Não foi possível copiar agora.");
    }
  }

  return (
    <PageShell
      eyebrow="Utilitários"
      title="Qual é meu IP?"
      description="Veja seu IP público, localização aproximada e informações da sua conexão de forma simples e rápida."
      navItems={navItems}
      topLabel={topLabel}
      breadcrumbs={breadcrumbs}
      breadcrumbAriaLabel={navigationLabels.breadcrumb}
      backButtonLabel={navigationLabels.back}
      backButtonAriaLabel={navigationLabels.backAria}
      language={language}
      ctaTitle="Quer entender melhor a estabilidade da sua conexão?"
      ctaButtonLabel="Abrir teste de internet"
      ctaHref="/utilitarios/teste-de-throttling/"
    >
      <section id="ferramenta" className="section-anchor">
        <div className="section-card">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="utility-copy-safe">
              <p className="text-sm font-semibold text-primary">Consulta rápida</p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Veja como sua conexão aparece na internet neste momento.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void loadIpData()}
                className="btn-secondary"
                disabled={isLoading}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Atualizar
              </button>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="btn-primary"
                disabled={!data}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar dados
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <UtilityMetricCard
              label="IP público"
              value={
                isLoading
                  ? "Consultando..."
                  : data?.ip ?? "Não foi possível identificar"
              }
              helper={
                error ||
                "Endereço que identifica sua conexão na internet."
              }
              icon={<Globe2 className="h-4 w-4" />}
              tone="primary"
              compact
            />
            <UtilityMetricCard
              label="Localização aproximada"
              value={
                data
                  ? formatLocation(data)
                  : isLoading
                    ? "Consultando..."
                    : "Indisponível"
              }
              helper="Baseada no seu IP. Pode não ser exata."
              icon={<MapPin className="h-4 w-4" />}
              compact
            />
            <UtilityMetricCard
              label="Provedor"
              value={
                data?.isp ?? (isLoading ? "Consultando..." : "Não identificado")
              }
              helper="Empresa responsável pela sua internet."
              icon={<Router className="h-4 w-4" />}
              compact
            />
            <UtilityMetricCard
              label="Navegador"
              value={
                data?.browser ?? (isLoading ? "Consultando..." : "Não identificado")
              }
              helper="Aplicativo usado para acessar o site."
              icon={<MonitorSmartphone className="h-4 w-4" />}
              compact
            />
            <UtilityMetricCard
              label="Sistema"
              value={data?.os ?? (isLoading ? "Consultando..." : "Não identificado")}
              helper="Sistema operacional do dispositivo."
              icon={<ShieldCheck className="h-4 w-4" />}
              compact
            />
            <UtilityMetricCard
              label="Tipo do IP"
              value={data?.ipVersion ?? (isLoading ? "Consultando..." : "Indisponível")}
              helper="IPv4 ou IPv6."
              icon={<Globe2 className="h-4 w-4" />}
              compact
            />
          </div>

          <div className="mt-3">
            <div className={softCardClass}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Privacidade
              </p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                A localização é aproximada e nenhum dado é armazenado pelo site.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <AdSlot
              id="ads-ip-tool-top"
              minHeight={120}
              format="horizontal"
              className="rounded-2xl"
            />
          </div>
        </div>
      </section>

      <section id="explicacao" className="section-anchor">
        <div className="section-card">
          <h2 className="text-xl font-bold">O que esses dados mostram</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <article className={softCardClass}>
              <h3 className="text-sm font-semibold">O que é um IP</h3>
              <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                É o endereço que ajuda a identificar sua conexão quando você abre um site ou usa um serviço online.
              </p>
            </article>
            <article className={softCardClass}>
              <h3 className="text-sm font-semibold">IP público e IP privado</h3>
              <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                O IP público é o que aparece para a internet. O IP privado é usado dentro da sua rede, entre roteador, celular e computador.
              </p>
            </article>
            <article className={softCardClass}>
              <h3 className="text-sm font-semibold">IPv4 e IPv6</h3>
              <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                Os dois servem para identificar conexões. A diferença está no formato e na quantidade de endereços disponíveis.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="exemplos" className="section-anchor">
        <div className="section-card">
          <h2 className="text-xl font-bold">Quando essa consulta ajuda</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <article className={outlineCardClass}>
              <h3 className="text-sm font-semibold">Conferir sua conexão</h3>
              <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                Você vê rapidamente se o IP mudou e qual região está sendo reconhecida.
              </p>
            </article>
            <article className={outlineCardClass}>
              <h3 className="text-sm font-semibold">Falar com o suporte</h3>
              <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                Ter IP, provedor e navegador em mãos ajuda a explicar melhor o problema.
              </p>
            </article>
            <article className={outlineCardClass}>
              <h3 className="text-sm font-semibold">Confirmar a operadora</h3>
              <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                A página mostra qual empresa aparece ligada à sua conexão naquele momento.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="faq" className="section-anchor">
        <div className="section-card">
          <h2 className="text-xl font-bold">Perguntas frequentes</h2>
          <div className="mt-4 space-y-2">
            {FAQ_ITEMS.map(item => (
              <details
                key={item.question}
                className="utility-copy-safe rounded-xl bg-secondary px-3 py-2.5"
              >
                <summary className="cursor-pointer text-sm font-semibold">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">
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
