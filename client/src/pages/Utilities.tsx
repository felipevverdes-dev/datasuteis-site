import {
  Calculator,
  Clock3,
  CloudSun,
  Coins,
  Dices,
  Gauge,
  Landmark,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import PageShell from "@/components/layout/PageShell";
import { useI18n } from "@/contexts/LanguageContext";
import { buildBreadcrumbSchema, getNavigationLabels } from "@/lib/navigation";
import { getBackToTopLabel, getToolPageNavItems } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";
import type { SupportedLanguage } from "@/lib/site";

const COPY: Record<
  SupportedLanguage,
  {
    eyebrow: string;
    title: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
    sectionLabel: string;
    cards: Array<{
      href: string;
      title: string;
      description: string;
      cta: string;
    }>;
    explanationTitle: string;
    explanationText: string;
    examplesTitle: string;
    examples: string[];
    faqTitle: string;
    faqItems: Array<{ question: string; answer: string }>;
  }
> = {
  pt: {
    eyebrow: "Utilitários",
    title: "Utilitários de apoio para tarefas rápidas",
    description:
      "Calculadora, clima, teste de internet e outras ferramentas úteis para resolver tarefas rápidas do dia a dia.",
    seoTitle:
      "Utilitários Online | IP, Teste de Internet, Calculadora, Clima e Mais | Datas Úteis",
    seoDescription:
      "Acesse calculadora, verificador de IP, teste de internet, clima, conversor de moeda e outras ferramentas úteis em uma área organizada para tarefas rápidas.",
    sectionLabel: "Área de ferramentas rápidas",
    cards: [
      {
        href: "/utilitarios/qual-e-meu-ip/",
        title: "Qual é meu IP",
        description:
          "Veja seu IP público, localização aproximada, provedor, navegador e sistema em uma consulta rápida.",
        cta: "Abrir utilitário",
      },
      {
        href: "/utilitarios/teste-de-throttling/",
        title: "Teste de Internet e Limitações",
        description:
          "Descubra se sua conexão está estável e se há sinais de limitação de velocidade.",
        cta: "Abrir utilitário",
      },
      {
        href: "/utilitarios/calculadora/",
        title: "Calculadora",
        description:
          "Operações simples, financeiras, científicas e de desenvolvedor em uma única tela.",
        cta: "Abrir utilitário",
      },
      {
        href: "/utilitarios/sorteador/",
        title: "Sorteador",
        description:
          "Sorteie números únicos ou selecione nomes com histórico local do último resultado.",
        cta: "Abrir utilitário",
      },
      {
        href: "/utilitarios/conversor-de-moeda/",
        title: "Conversor de moeda",
        description:
          "Converta entre real, dólar, euro e libra com leitura rápida de câmbio.",
        cta: "Abrir utilitário",
      },
      {
        href: "/utilitarios/clima/",
        title: "Clima",
        description:
          "Consulte a temperatura atual e a previsão curta para apoiar deslocamentos e agenda externa.",
        cta: "Abrir utilitário",
      },
      {
        href: "/utilitarios/horario-mundial/",
        title: "Horário mundial",
        description:
          "Veja países e capitais por continente, com UTC em tempo real e busca rápida por país ou cidade.",
        cta: "Abrir utilitário",
      },
      {
        href: "/utilitarios/horario-mercados/",
        title: "Horário de mercados",
        description:
          "Acompanhe abertura, fechamento e status das principais bolsas globais em uma página própria.",
        cta: "Abrir utilitário",
      },
    ],
    explanationTitle: "Ferramentas simples para tarefas rápidas",
    explanationText:
      "Escolha a ferramenta que precisa para fazer contas, checar o IP, testar a conexão, converter valores, ver o clima ou comparar horários internacionais em poucos passos.",
    examplesTitle: "Quando usar",
    examples: [
      "Use a calculadora para contas rápidas ligadas a orçamento, reajuste, porcentagem e conferência diária.",
      "Use o sorteador para definir ordem de atendimento, rodízio interno, brindes ou seleção simples de nomes.",
      "Use o verificador de IP para conferir endereço público, localização aproximada e provedor antes de pedir ajuda ao suporte.",
      "Use o teste de internet para ver se a conexão está estável quando ela parecer mais lenta do que o normal.",
      "Use o conversor para checar valores em dólar, euro, libra e real antes de aprovar compras ou comparar custos.",
      "Use o clima para ajustar deslocamentos, visitas, entregas e rotinas externas com uma leitura rápida da previsão.",
      "Use o horário mundial para comparar fusos entre países, reuniões remotas e janelas de mercado internacional.",
    ],
    faqTitle: "Perguntas frequentes",
    faqItems: [
      {
        question: "Os utilitários são gratuitos?",
        answer:
          "Sim. Você pode usar calculadora, verificador de IP, teste de internet, sorteador, conversor de moeda, clima e horário mundial sem pagar.",
      },
      {
        question: "As páginas funcionam no celular?",
        answer:
          "Sim. Você pode abrir as ferramentas no celular e usar os controles principais sem depender de aplicativo separado.",
      },
      {
        question: "Preciso criar conta para usar?",
        answer: "Não. Os utilitários funcionam diretamente no navegador.",
      },
    ],
  },
  en: {
    eyebrow: "Utilities",
    title: "Support utilities for quick tasks",
    description:
      "Calculator, internet test, weather and other utilities for quick daily tasks.",
    seoTitle:
      "Utilities | IP lookup, internet test, calculator and more | Datas Úteis",
    seoDescription:
      "Open IP lookup, internet test, calculator, currency conversion, weather and world clock tools in one utility area for quick tasks.",
    sectionLabel: "Quick tools area",
    cards: [
      {
        href: "/utilitarios/qual-e-meu-ip/",
        title: "What is my IP",
        description:
          "Check your public IP, approximate location, provider, browser and operating system quickly.",
        cta: "Open utility",
      },
      {
        href: "/utilitarios/teste-de-throttling/",
        title: "Internet limit test",
        description:
          "Check whether your connection stays stable and whether any signs of speed limitation appear.",
        cta: "Open utility",
      },
      {
        href: "/utilitarios/calculadora/",
        title: "Calculator",
        description:
          "Simple, financial, scientific and developer operations in one screen.",
        cta: "Open utility",
      },
      {
        href: "/utilitarios/sorteador/",
        title: "Random picker",
        description:
          "Draw unique numbers or select names with the latest local result saved in the browser.",
        cta: "Open utility",
      },
      {
        href: "/utilitarios/conversor-de-moeda/",
        title: "Currency converter",
        description:
          "Convert BRL, USD, EUR and GBP with a quick exchange view.",
        cta: "Open utility",
      },
      {
        href: "/utilitarios/clima/",
        title: "Weather",
        description:
          "Check current temperature and a short forecast for visits and outdoor routines.",
        cta: "Open utility",
      },
      {
        href: "/utilitarios/horario-mundial/",
        title: "World clock",
        description:
          "Browse countries and capitals by continent with live UTC offsets and quick search.",
        cta: "Open utility",
      },
      {
        href: "/utilitarios/horario-mercados/",
        title: "Market hours",
        description:
          "Track the opening, closing and live session status of major global exchanges on a dedicated page.",
        cta: "Open utility",
      },
    ],
    explanationTitle: "Simple tools for quick tasks",
    explanationText:
      "Choose the tool you need to calculate, inspect your connection, convert values, check weather or compare international timezones in a few steps.",
    examplesTitle: "When to use it",
    examples: [
      "Use the calculator for quick percentage, budget and daily checking tasks.",
      "Use the random picker for rotation order, internal draws or simple name selection.",
      "Use the IP lookup page before opening a support ticket or checking whether your connection changed.",
      "Use the internet test when a connection feels slower than expected and you want a clearer stability check.",
      "Use the currency converter before comparing costs in USD, EUR, GBP and BRL.",
      "Use the weather page to adjust visits, deliveries and outdoor routines quickly.",
      "Use the world clock to compare countries, meeting slots and global market windows.",
    ],
    faqTitle: "Frequently asked questions",
    faqItems: [
      {
        question: "Are these utilities free?",
        answer:
          "Yes. You can use the calculator, IP lookup, internet test, random picker, currency converter, weather tool and world clock without paying.",
      },
      {
        question: "Do these pages work on mobile?",
        answer:
          "Yes. You can open the tools on mobile and use the main controls without needing a separate app.",
      },
      {
        question: "Do I need an account?",
        answer: "No. The utilities work directly in the browser.",
      },
    ],
  },
  es: {
    eyebrow: "Utilidades",
    title: "Utilidades de apoyo para tareas rápidas",
    description:
      "Calculadora, prueba de internet, clima y otras utilidades para tareas rápidas del día a día.",
    seoTitle:
      "Utilidades | IP, prueba de internet, calculadora y más | Datas Úteis",
    seoDescription:
      "Acceda a verificador de IP, prueba de internet, calculadora, clima, conversor y reloj mundial en una sección organizada para tareas rápidas.",
    sectionLabel: "Área de herramientas rápidas",
    cards: [
      {
        href: "/utilitarios/qual-e-meu-ip/",
        title: "Cuál es mi IP",
        description:
          "Vea su IP pública, ubicación aproximada, proveedor, navegador y sistema rápidamente.",
        cta: "Abrir utilidad",
      },
      {
        href: "/utilitarios/teste-de-throttling/",
        title: "Prueba de internet y límites",
        description:
          "Descubra si la conexión se mantiene estable y si aparecen señales de limitación de velocidad.",
        cta: "Abrir utilidad",
      },
      {
        href: "/utilitarios/calculadora/",
        title: "Calculadora",
        description:
          "Operaciones simples, financieras, científicas y de desarrollador en una sola pantalla.",
        cta: "Abrir utilidad",
      },
      {
        href: "/utilitarios/sorteador/",
        title: "Sorteador",
        description:
          "Sortee números únicos o seleccione nombres con el último resultado guardado localmente.",
        cta: "Abrir utilidad",
      },
      {
        href: "/utilitarios/conversor-de-moeda/",
        title: "Conversor de moneda",
        description:
          "Convierta entre real, dólar, euro y libra con lectura rápida del tipo de cambio.",
        cta: "Abrir utilidad",
      },
      {
        href: "/utilitarios/clima/",
        title: "Clima",
        description:
          "Consulte la temperatura actual y una previsión corta para apoyar desplazamientos y agenda externa.",
        cta: "Abrir utilidad",
      },
      {
        href: "/utilitarios/horario-mundial/",
        title: "Reloj mundial",
        description:
          "Vea países y capitales por continente, con UTC en tiempo real y búsqueda rápida por país o ciudad.",
        cta: "Abrir utilidad",
      },
      {
        href: "/utilitarios/horario-mercados/",
        title: "Horario de mercados",
        description:
          "Siga apertura, cierre y estado de sesión de las principales bolsas globales en una página dedicada.",
        cta: "Abrir utilidad",
      },
    ],
    explanationTitle: "Herramientas simples para tareas rápidas",
    explanationText:
      "Elija la herramienta que necesita para hacer cuentas, revisar la conexión, convertir valores, consultar el clima o comparar horarios internacionales en pocos pasos.",
    examplesTitle: "Cuándo usar",
    examples: [
      "Use la calculadora para porcentajes, presupuesto y conferencias rápidas.",
      "Use el sorteador para orden de atención, rotación interna o selección simple de nombres.",
      "Use el verificador de IP antes de abrir un ticket técnico o revisar si la conexión cambió.",
      "Use la prueba de internet cuando la conexión parezca más lenta de lo normal y quiera revisar su estabilidad.",
      "Use el conversor para comparar valores en USD, EUR, GBP y BRL.",
      "Use el clima para ajustar visitas, entregas y rutinas externas rápidamente.",
      "Use el reloj mundial para comparar países, reuniones remotas y ventanas de mercado global.",
    ],
    faqTitle: "Preguntas frecuentes",
    faqItems: [
      {
        question: "¿Estas utilidades son gratuitas?",
        answer:
          "Sí. Puede usar la calculadora, el verificador de IP, la prueba de internet, el sorteador, el conversor, el clima y el reloj mundial sin pagar.",
      },
      {
        question: "¿Funcionan en el celular?",
        answer:
          "Sí. Puede abrir las herramientas en el celular y usar los controles principales sin una app aparte.",
      },
      {
        question: "¿Necesito cuenta?",
        answer: "No. Funcionan directamente en el navegador.",
      },
    ],
  },
};

export default function Utilities() {
  const { language } = useI18n();
  const copy = COPY[language] ?? COPY.pt;
  const navigationLabels = getNavigationLabels(language);
  const navItems = getToolPageNavItems(language);
  const topLabel = getBackToTopLabel(language);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.utilities },
  ];

  usePageSeo({
    title: copy.seoTitle,
    description: copy.seoDescription,
    path: "/utilitarios/",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: copy.title,
        url: "https://datasuteis.com.br/utilitarios/",
        description: copy.description,
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: copy.cards.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.title,
          url: `https://datasuteis.com.br${item.href}`,
        })),
      },
      buildBreadcrumbSchema([
        { label: navigationLabels.home, href: "/" },
        { label: navigationLabels.utilities, href: "/utilitarios/" },
      ]),
    ],
  });

  return (
    <PageShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      navItems={navItems}
      topLabel={topLabel}
      breadcrumbs={breadcrumbs}
      breadcrumbAriaLabel={navigationLabels.breadcrumb}
      backButtonLabel={navigationLabels.back}
      backButtonAriaLabel={navigationLabels.backAria}
      language={language}
      ctaTitle={
        language === "en"
          ? "Need to calculate business days?"
          : language === "es"
            ? "¿Necesita calcular días hábiles?"
            : "Precisa calcular dias úteis?"
      }
      ctaButtonLabel={
        language === "en"
          ? "Use the calculator"
          : language === "es"
            ? "Usar la calculadora"
            : "Usar a calculadora"
      }
    >
      <div id="ferramenta" className="section-anchor page-stack">
        <div className="section-card">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            {copy.sectionLabel}
          </div>
          <div className="mt-5 page-grid">
            {copy.cards.map(card => {
              const Icon =
                card.href === "/utilitarios/qual-e-meu-ip/"
                  ? ShieldCheck
                  : card.href === "/utilitarios/teste-de-throttling/"
                    ? Gauge
                    : card.href === "/utilitarios/calculadora/"
                  ? Calculator
                  : card.href === "/utilitarios/sorteador/"
                    ? Dices
                    : card.href === "/utilitarios/conversor-de-moeda/"
                      ? Coins
                      : card.href === "/utilitarios/horario-mundial/"
                        ? Clock3
                        : card.href === "/utilitarios/horario-mercados/"
                          ? Landmark
                          : CloudSun;

              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="card-base card-hover block p-6"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-2xl font-bold">{card.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {card.description}
                  </p>
                  <span className="mt-5 inline-flex items-center font-semibold text-primary">
                    {card.cta}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <section id="explicacao" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">{copy.explanationTitle}</h2>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            {copy.explanationText}
          </p>
        </div>
      </section>

      <section id="exemplos" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">{copy.examplesTitle}</h2>
          <div className="mt-5 page-grid">
            {copy.examples.map(example => (
              <article
                key={example}
                className="rounded-2xl bg-secondary p-5 text-sm leading-6 text-muted-foreground"
              >
                {example}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section-anchor">
        <div className="section-card">
          <h2 className="text-3xl font-bold">{copy.faqTitle}</h2>
          <div className="mt-5 space-y-3">
            {copy.faqItems.map(item => (
              <details
                key={item.question}
                className="rounded-2xl bg-secondary px-5 py-4"
              >
                <summary className="font-semibold">{item.question}</summary>
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
