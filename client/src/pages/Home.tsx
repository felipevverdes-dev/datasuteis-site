import { useMemo } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
  Clock3,
  Gamepad2,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HomeMomentSummary from "@/components/home/HomeMomentSummary";
import FloatingSectionNav from "@/components/layout/FloatingSectionNav";
import { useI18n } from "@/contexts/LanguageContext";
import { getGamesNavLabel, getUtilitiesNavLabel } from "@/lib/games-nav";
import { getHomeBlogTeasers } from "@/lib/home-blog-teasers";
import { getBackToTopLabel, type PageSectionNavItem } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";
import type { SupportedLanguage } from "@/lib/site";

const COPY: Record<
  SupportedLanguage,
  {
    seoTitle: string;
    seoDescription: string;
    title: string;
    description: string;
    primaryTitle: string;
    snapshotTitle: string;
    supportTitle: string;
    supportDescription: string;
    aboutTitle: string;
    aboutItems: Array<{ title: string; text: string }>;
    blogTitle: string;
    faqTitle: string;
    faqItems: Array<{ question: string; answer: string }>;
    open: string;
  }
> = {
  pt: {
    seoTitle: "Datas Úteis: dias úteis, calendário, feriados, ferramentas",
    seoDescription:
      "Calcule dias úteis, consulte o calendário com feriados, simule escalas de trabalho, descubra sua idade exata, jogue e use ferramentas online grátis.",
    title: "Dias úteis, calendário, feriados, escalas, idade e ferramentas",
    description:
      "Calculadoras, simuladores, utilitários, jogos e conteúdo prático para prazos, trabalho, planejamento e datas.",
    primaryTitle: "Ferramentas principais",
    snapshotTitle: "Resumo do momento",
    supportTitle: "Mais recursos úteis",
    supportDescription:
      "Use utilitários, jogos e conteúdos de apoio quando quiser complementar o planejamento do dia com consulta rápida ou uma pausa curta.",
    aboutTitle: "O que é o Datas Úteis",
    aboutItems: [
      {
        title: "Ferramentas práticas para o dia a dia",
        text: "O Datas Úteis reúne calculadora de dias úteis, calendário com feriados, simulador de escalas de trabalho e ferramentas de idade em um único lugar. Todas as ferramentas funcionam diretamente no navegador, sem cadastro e sem custo.",
      },
      {
        title: "Dados confiáveis e atualizados",
        text: "Os feriados nacionais seguem a legislação federal brasileira. Na calculadora, é possível selecionar estado e município para incluir feriados locais. Os dados de localidade são obtidos do IBGE e de bases públicas oficiais.",
      },
      {
        title: "Para profissionais e uso pessoal",
        text: "O site é usado por profissionais de RH, departamento pessoal, contabilidade, advocacia, logística e por qualquer pessoa que precise calcular prazos, planejar rotinas ou conferir datas. O simulador de escalas ajuda a comparar modelos como 5x2, 6x1 e 12x36 antes de aplicar em operações reais.",
      },
    ],
    blogTitle: "Conteúdos de apoio",
    faqTitle: "Perguntas frequentes",
    faqItems: [
      { question: "O Datas Úteis é totalmente gratuito?", answer: "Sim. As ferramentas principais podem ser usadas gratuitamente e sem cadastro." },
      { question: "A calculadora de dias úteis considera feriados?", answer: "Sim. A leitura padrão considera feriados nacionais e ajuda no planejamento de prazos." },
      { question: "Posso calcular datas de anos passados e futuros?", answer: "Sim. As páginas e ferramentas foram organizadas para aceitar anos anteriores, o ano atual e anos futuros." },
      { question: "Quais escalas posso simular?", answer: "Você pode simular escalas como 5x2, 6x1, 12x36 e outras variações usadas em operações reais." },
      { question: "Posso usar o site no celular?", answer: "Sim. As páginas principais foram organizadas para toque e leitura em telas menores." },
      { question: "Sábado conta como dia útil?", answer: "Na leitura padrão do site, sábado não entra como dia útil." },
      { question: "Como saber em que dia da semana eu nasci?", answer: "Use a área de idade para informar sua data de nascimento e ver o dia da semana correspondente." },
      { question: "Como calcular minha idade exata?", answer: "Na área de idade, a ferramenta mostra anos, meses e dias com base na data informada." },
      { question: "O site mostra feriados estaduais e municipais?", answer: "Na calculadora, você pode selecionar estado e município para incluir feriados locais no cálculo." },
      { question: "Posso usar a ferramenta para planejar prazos?", answer: "Sim. O site ajuda a planejar prazos e rotinas, mas regras legais específicas devem ser validadas no seu contexto." },
    ],
    open: "Abrir página",
  },
  en: {
    seoTitle: "Datas Úteis: business days, calendar, holidays, tools",
    seoDescription:
      "Calculate business days, check holiday calendars, simulate work schedules, find your exact age, play and use free online tools.",
    title: "Business days, calendar, holidays, schedules, age and tools",
    description:
      "Calculators, simulators, utilities, games and practical content for deadlines, work planning and date-based tasks.",
    primaryTitle: "Main tools",
    snapshotTitle: "Today snapshot",
    supportTitle: "More useful resources",
    supportDescription:
      "Use utilities, games and support content when you want quick consultation, a short break or extra context for planning.",
    aboutTitle: "What is Datas Úteis",
    aboutItems: [
      {
        title: "Practical tools for everyday tasks",
        text: "Datas Úteis brings together a business-day calculator, a holiday calendar, a work schedule simulator and age tools in one place. Every tool runs directly in the browser, with no sign-up and no cost.",
      },
      {
        title: "Reliable and up-to-date data",
        text: "National holidays follow Brazilian federal legislation. In the calculator, you can select a state and municipality to include local holidays. Location data comes from IBGE and official public sources.",
      },
      {
        title: "For professionals and personal use",
        text: "The site is used by HR professionals, payroll departments, accountants, lawyers, logistics teams and anyone who needs to calculate deadlines, plan routines or check dates. The schedule simulator helps compare models like 5x2, 6x1 and 12x36 before applying them.",
      },
    ],
    blogTitle: "Support content",
    faqTitle: "Frequently asked questions",
    faqItems: [
      { question: "Is Datas Úteis completely free?", answer: "Yes. The main tools can be used for free and without sign-up." },
      { question: "Does the business-day calculator consider holidays?", answer: "Yes. The standard reading considers national holidays and supports deadline planning." },
      { question: "Can I calculate past and future years?", answer: "Yes. The tools accept previous years, the current year and future years." },
      { question: "Which schedules can I simulate?", answer: "You can simulate 5x2, 6x1, 12x36 and other work-pattern variations." },
      { question: "Can I use the site on mobile?", answer: "Yes. The main pages were organized for touch and smaller screens." },
      { question: "Does Saturday count as a business day?", answer: "In the standard reading of the site, Saturday is not counted as a business day." },
      { question: "How do I find the weekday I was born on?", answer: "Use the age area and enter your birth date to see the corresponding weekday." },
      { question: "How do I calculate my exact age?", answer: "In the age area, the result shows years, months and days from the informed date." },
      { question: "Does the site show state and city holidays?", answer: "In the calculator, you can select state and municipality to include local holidays in the calculation." },
      { question: "Can I use the tools to plan deadlines?", answer: "Yes. The site helps with deadline and routine planning, but formal legal rules must be checked in your context." },
    ],
    open: "Open page",
  },
  es: {
    seoTitle: "Datas Úteis: días hábiles, calendario y herramientas",
    seoDescription:
      "Calcule días hábiles, consulte el calendario con feriados, simule turnos de trabajo, descubra su edad exacta, juegue y use herramientas gratis.",
    title: "Días hábiles, calendario, feriados, turnos, edad y herramientas",
    description:
      "Calculadoras, simuladores, utilidades, juegos y contenido práctico para plazos, trabajo, planificación y fechas.",
    primaryTitle: "Herramientas principales",
    snapshotTitle: "Resumen del momento",
    supportTitle: "Más recursos útiles",
    supportDescription:
      "Use utilidades, juegos y contenidos de apoyo cuando necesite una consulta rápida, una pausa corta o más contexto para planear.",
    aboutTitle: "Qué es Datas Úteis",
    aboutItems: [
      {
        title: "Herramientas prácticas para el día a día",
        text: "Datas Úteis reúne calculadora de días hábiles, calendario con feriados, simulador de escalas de trabajo y herramientas de edad en un solo lugar. Todas las herramientas funcionan directamente en el navegador, sin registro y sin costo.",
      },
      {
        title: "Datos confiables y actualizados",
        text: "Los feriados nacionales siguen la legislación federal brasileña. En la calculadora, es posible seleccionar estado y municipio para incluir feriados locales. Los datos de localidad provienen del IBGE y de fuentes públicas oficiales.",
      },
      {
        title: "Para profesionales y uso personal",
        text: "El sitio es utilizado por profesionales de RH, departamento de personal, contabilidad, abogacía, logística y cualquier persona que necesite calcular plazos, planificar rutinas o consultar fechas. El simulador de escalas ayuda a comparar modelos como 5x2, 6x1 y 12x36.",
      },
    ],
    blogTitle: "Contenidos de apoyo",
    faqTitle: "Preguntas frecuentes",
    faqItems: [
      { question: "¿Datas Úteis es totalmente gratuito?", answer: "Sí. Las herramientas principales se pueden usar gratis y sin registro." },
      { question: "¿La calculadora de días hábiles considera feriados?", answer: "Sí. La lectura estándar considera feriados nacionales y ayuda con plazos." },
      { question: "¿Puedo calcular años pasados y futuros?", answer: "Sí. Las herramientas aceptan años anteriores, el año actual y años futuros." },
      { question: "¿Qué escalas puedo simular?", answer: "Puede simular 5x2, 6x1, 12x36 y otras variaciones de jornada." },
      { question: "¿Puedo usar el sitio en el celular?", answer: "Sí. Las páginas principales fueron organizadas para toque y pantallas menores." },
      { question: "¿El sábado cuenta como día hábil?", answer: "En la lectura estándar del sitio, el sábado no cuenta como día hábil." },
      { question: "¿Cómo saber en qué día nací?", answer: "Use el área de edad e ingrese la fecha de nacimiento para ver el día correspondiente." },
      { question: "¿Cómo calcular mi edad exacta?", answer: "En el área de edad, el resultado muestra años, meses y días." },
      { question: "¿El sitio muestra feriados estatales y municipales?", answer: "En la calculadora, puede seleccionar estado y municipio para incluir feriados locales en el cálculo." },
      { question: "¿Puedo usar la herramienta para planear plazos?", answer: "Sí. El sitio ayuda a planear plazos y rutinas, pero las reglas legales deben validarse en su contexto." },
    ],
    open: "Abrir página",
  },
};

export default function Home() {
  const { language, t } = useI18n();
  const copy = COPY[language];
  const topLabel = getBackToTopLabel(language);
  const posts = useMemo(() => getHomeBlogTeasers(language), [language]);
  const gamesNavLabel = getGamesNavLabel(language);
  const utilitiesNavLabel = getUtilitiesNavLabel(language);

  const primaryCards = [
    { href: "/calcular/", title: language === "en" ? "Calculate business days" : language === "es" ? "Calcular días hábiles" : "Calcular dias úteis", description: language === "en" ? "Count business days, add or subtract working days and review holidays." : language === "es" ? "Cuente días hábiles, sume o reste días y revise feriados." : "Conte dias úteis, some ou subtraia dias e revise feriados.", icon: Clock3 },
    { href: "/calendario/", title: t("nav_calendar"), description: language === "en" ? "Review months, weekends and holidays with a faster calendar view." : language === "es" ? "Consulte meses, fines de semana y feriados en una vista rápida." : "Consulte meses, finais de semana e feriados em uma leitura rápida.", icon: CalendarDays },
    { href: "/escala/", title: t("nav_scale"), description: language === "en" ? "Simulate teams, shifts and monthly coverage scenarios." : language === "es" ? "Simule equipos, turnos y cobertura mensual." : "Simule equipes, turnos e cobertura mensal.", icon: BriefcaseBusiness },
    { href: "/idade/", title: language === "en" ? "Calculate age" : language === "es" ? "Calcular edad" : "Calcular idade", description: language === "en" ? "Discover exact age, birth weekday, days alive and next birthday." : language === "es" ? "Descubra edad exacta, día de nacimiento, días de vida y próximo cumpleaños." : "Descubra idade exata, dia da semana de nascimento, dias de vida e próximo aniversário.", icon: CalendarClock },
  ];

  const supportCards = [
    { href: "/utilitarios/", title: utilitiesNavLabel, description: language === "en" ? "Calculator, random picker, weather and currency tools." : language === "es" ? "Calculadora, sorteador, clima y cambio." : "Calculadora, sorteador, clima e câmbio.", icon: Wrench },
    { href: "/jogos/", title: gamesNavLabel, description: language === "en" ? "Sudoku, word search and crosswords for short breaks." : language === "es" ? "Sudoku, sopa de letras y crucigramas para pausas cortas." : "Sudoku, caça-palavras e palavras cruzadas para pausas curtas.", icon: Gamepad2 },
    { href: "/blog/", title: t("nav_blog"), description: language === "en" ? "Support content about business days, schedules and work routines." : language === "es" ? "Contenidos sobre días hábiles, escalas y rutina laboral." : "Conteúdos sobre dias úteis, escalas e rotina de trabalho.", icon: Sparkles },
  ];
  const homeNavItems: PageSectionNavItem[] = language === "en"
    ? [
        { id: "principais", label: "Main tools" },
        { id: "momento", label: "Today" },
        { id: "adicionais", label: "More" },
        { id: "sobre", label: "About" },
        { id: "blog", label: "Blog" },
        { id: "faq", label: "FAQ" },
      ]
    : language === "es"
      ? [
          { id: "principais", label: "Principales" },
          { id: "momento", label: "Hoy" },
          { id: "adicionais", label: "Más" },
          { id: "sobre", label: "Sobre" },
          { id: "blog", label: "Blog" },
          { id: "faq", label: "FAQ" },
        ]
      : [
          { id: "principais", label: "Principais" },
          { id: "momento", label: "Hoje" },
          { id: "adicionais", label: "Mais" },
          { id: "sobre", label: "Sobre" },
          { id: "blog", label: "Blog" },
          { id: "faq", label: "FAQ" },
        ];

  usePageSeo({
    title: copy.seoTitle,
    description: copy.seoDescription,
    path: "/",
    keywords: [
      "dias úteis",
      "calendário",
      "feriados",
      "ferramentas",
      "escala",
      "idade",
    ],
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          name: copy.title,
          url: "https://datasuteis.com.br/",
          description: copy.seoDescription,
        },
        {
          "@type": "FAQPage",
          mainEntity: copy.faqItems.map(item => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        },
      ],
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" role="main" className="relative">
        <section className="hero border-b border-border bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto">
            <div className="mx-auto max-w-5xl text-center">
              <h1 className="hero-title mt-5 text-primary">{copy.title}</h1>
              <p className="hero-subtitle mt-6">{copy.description}</p>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {primaryCards.map(card => (
                  <Link key={card.href} href={card.href} className={card.href === "/calcular/" ? "btn-primary" : "btn-outline"}>
                    {card.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <FloatingSectionNav items={homeNavItems} topLabel={topLabel} />

        <section className="section-md">
          <div className="container mx-auto page-stack">
            <section id="principais" className="section-anchor section-card">
              <h2 className="text-3xl font-bold">{copy.primaryTitle}</h2>
              <div className="mt-6 page-grid">
                {primaryCards.map(card => {
                  const Icon = card.icon;
                  return (
                    <Link key={card.href} href={card.href} className="card-base card-hover block p-6">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 text-2xl font-bold">{card.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.description}</p>
                      <span className="mt-5 inline-flex items-center gap-2 font-semibold text-primary">{copy.open}<ArrowRight className="h-4 w-4" /></span>
                    </Link>
                  );
                })}
              </div>
            </section>

            <HomeMomentSummary />

            <section id="adicionais" className="section-anchor section-card">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" />
                {copy.supportTitle}
              </div>
              <p className="mt-3 max-w-3xl text-muted-foreground">{copy.supportDescription}</p>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {supportCards.map(card => {
                  const Icon = card.icon;
                  return (
                    <Link key={card.href} href={card.href} className="card-base card-hover block p-5">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
                      <h3 className="mt-4 text-xl font-bold">{card.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.description}</p>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section id="sobre" className="section-anchor section-card">
              <h2 className="text-3xl font-bold">{copy.aboutTitle}</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                {copy.aboutItems.map(item => (
                  <article key={item.title} className="rounded-3xl bg-secondary p-5">
                    <h3 className="text-lg font-bold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</p>
                  </article>
                ))}
              </div>
            </section>

            <section id="blog" className="section-anchor section-card">
              <h2 className="text-3xl font-bold">{copy.blogTitle}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {posts.map(post => (
                  <Link key={post.slug} href={`/blog/${post.slug}/`} className="block rounded-3xl bg-secondary px-5 py-4 transition-colors hover:bg-secondary/80">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><span>{post.category}</span><span>•</span><span>{post.readTime}</span></div>
                    <h3 className="mt-3 text-xl font-bold">{post.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section id="faq" className="section-anchor section-card">
              <h2 className="text-3xl font-bold">{copy.faqTitle}</h2>
              <div className="mt-5 space-y-3">
                {copy.faqItems.map(item => (
                  <details key={item.question} className="rounded-2xl bg-secondary px-5 py-4">
                    <summary className="font-semibold">{item.question}</summary>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
