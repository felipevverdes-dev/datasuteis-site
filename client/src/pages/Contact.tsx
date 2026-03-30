import { Link } from "wouter";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CoreNavigationBlock from "@/components/layout/CoreNavigationBlock";
import PageIntroNavigation from "@/components/layout/PageIntroNavigation";
import { useI18n } from "@/contexts/LanguageContext";
import { buildBreadcrumbSchema, getNavigationLabels } from "@/lib/navigation";
import { usePageSeo } from "@/lib/seo";
import type { SupportedLanguage } from "@/lib/site";

const COPY: Record<
  SupportedLanguage,
  {
    title: string;
    subtitle: string;
    introTitle: string;
    introText: string;
    emailTitle: string;
    emailText: string;
    supportTitle: string;
    supportItems: string[];
    contactCta: string;
    aboutCta: string;
  }
> = {
  pt: {
    title: "Contato",
    subtitle:
      "Use este canal para sugestões, correções e dúvidas sobre as ferramentas do Datas Úteis.",
    introTitle: "Quando entrar em contato",
    introText:
      "Envie mensagem se encontrar erro de cálculo, link quebrado, problema de visualização, dúvida sobre uso das ferramentas ou sugestão de nova funcionalidade.",
    emailTitle: "E-mail do projeto",
    emailText:
      "O contato principal do Datas Úteis é feito por e-mail. Esse canal é usado para suporte geral, feedback e assuntos institucionais básicos.",
    supportTitle: "Assuntos mais comuns",
    supportItems: [
      "Correção de datas, feriados ou textos.",
      "Dúvidas sobre uso da calculadora, calendário, idade ou escalas.",
      "Sugestões de novas ferramentas e melhorias de navegação.",
    ],
    contactCta: "Enviar e-mail",
    aboutCta: "Ver página Sobre",
  },
  en: {
    title: "Contact",
    subtitle:
      "Use this channel for suggestions, fixes and questions about Datas Úteis tools.",
    introTitle: "When to contact us",
    introText:
      "Send a message if you find a calculation error, a broken link, a display problem, a question about how to use a tool or a suggestion for a new feature.",
    emailTitle: "Project email",
    emailText:
      "Datas Úteis uses email as its main contact channel for general support, feedback and basic institutional matters.",
    supportTitle: "Common topics",
    supportItems: [
      "Corrections for dates, holidays or text.",
      "Questions about calculator, calendar, age or schedule tools.",
      "Suggestions for new tools and navigation improvements.",
    ],
    contactCta: "Send email",
    aboutCta: "Open About page",
  },
  es: {
    title: "Contacto",
    subtitle:
      "Use este canal para sugerencias, correcciones y dudas sobre las herramientas de Datas Úteis.",
    introTitle: "Cuándo contactarnos",
    introText:
      "Envíe un mensaje si encuentra un error de cálculo, un enlace roto, un problema de visualización, una duda de uso o una sugerencia de nueva funcionalidad.",
    emailTitle: "Correo del proyecto",
    emailText:
      "Datas Úteis utiliza el correo electrónico como canal principal de contacto para soporte general, feedback y asuntos institucionales básicos.",
    supportTitle: "Temas más comunes",
    supportItems: [
      "Correcciones de fechas, feriados o textos.",
      "Dudas sobre calculadora, calendario, edad o escalas.",
      "Sugerencias de nuevas herramientas y mejoras de navegación.",
    ],
    contactCta: "Enviar correo",
    aboutCta: "Abrir Sobre",
  },
};

export default function Contact() {
  const { language } = useI18n();
  const copy = COPY[language] ?? COPY.pt;
  const navigationLabels = getNavigationLabels(language);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.about, href: "/sobre/" },
    { label: copy.title },
  ];

  usePageSeo({
    title:
      language === "en"
        ? "Contact | Datas Úteis"
        : language === "es"
          ? "Contacto | Datas Úteis"
          : "Contato | Datas Úteis",
    description: copy.subtitle,
    path: "/contato/",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: copy.title,
        url: "https://datasuteis.com.br/contato/",
        description: copy.subtitle,
      },
      {
        ...buildBreadcrumbSchema([
          { label: navigationLabels.home, href: "/" },
          { label: navigationLabels.about, href: "/sobre/" },
          { label: copy.title, href: "/contato/" },
        ]),
      },
    ],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" role="main">
        <section className="hero border-b border-border bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto">
            <div className="max-w-4xl">
              <PageIntroNavigation
                breadcrumbs={breadcrumbs}
                breadcrumbAriaLabel={navigationLabels.breadcrumb}
                backLabel={navigationLabels.back}
                backAriaLabel={navigationLabels.backAria}
              />
              <h1 className="mt-4 text-4xl font-bold text-primary md:text-5xl">
                {copy.title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                {copy.subtitle}
              </p>
            </div>
          </div>
        </section>

        <section className="section-md">
          <div className="container mx-auto space-y-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_0.9fr]">
              <section className="card-base p-6">
                <h2 className="text-2xl font-bold">{copy.introTitle}</h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {copy.introText}
                </p>

                <h2 className="mt-8 text-2xl font-bold">{copy.supportTitle}</h2>
                <div className="mt-4 space-y-3">
                  {copy.supportItems.map(item => (
                    <div
                      key={item}
                      className="rounded-2xl bg-secondary px-4 py-3 text-sm leading-6 text-muted-foreground"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              <aside className="card-base p-6">
                <h2 className="text-2xl font-bold">{copy.emailTitle}</h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {copy.emailText}
                </p>
                <a
                  href="mailto:contato@datasuteis.com.br"
                  className="btn-primary mt-6 inline-flex"
                >
                  {copy.contactCta}
                </a>
                <div className="mt-4">
                  <Link href="/sobre/" className="btn-secondary inline-flex">
                    {copy.aboutCta}
                  </Link>
                </div>
                <p className="mt-5 text-sm font-semibold text-foreground">
                  contato@datasuteis.com.br
                </p>
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
