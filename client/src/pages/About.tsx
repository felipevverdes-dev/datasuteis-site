import { Link } from "wouter";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CoreNavigationBlock from "@/components/layout/CoreNavigationBlock";
import CtaFinalBlock from "@/components/layout/CtaFinalBlock";
import FloatingSectionNav from "@/components/layout/FloatingSectionNav";
import { useI18n } from "@/contexts/LanguageContext";
import { getGamesNavLabel } from "@/lib/games-nav";
import PageIntroNavigation from "@/components/layout/PageIntroNavigation";
import { buildBreadcrumbSchema, buildFaqPageSchema, getNavigationLabels } from "@/lib/navigation";
import { getBackToTopLabel } from "@/lib/page-sections";
import { usePageSeo } from "@/lib/seo";
import type { SupportedLanguage } from "@/lib/site";

const ABOUT_COPY: Record<
  SupportedLanguage,
  {
    title: string;
    subtitle: string;
    originTitle: string;
    originText: string;
    purposeTitle: string;
    purposeText: string;
    evolutionTitle: string;
    evolutionText: string;
    audienceTitle: string;
    audienceText1: string;
    audienceText2: string;
    offersTitle: string;
    offersText1: string;
    offersText2: string;
    offersText3: string;
    qualityTitle: string;
    qualityText1: string;
    qualityText2: string;
    techTitle: string;
    techText1: string;
    techText2: string;
    faqTitle: string;
    faq: Array<{ question: string; answer: string }>;
    contactTitle: string;
    contactText: string;
    ideaCta: string;
  }
> = {
  pt: {
    title: "Sobre o Datas Úteis",
    subtitle:
      "Conheça a origem do projeto, o propósito do site e a ideia de reunir ferramentas realmente úteis para rotina pessoal e profissional.",
    originTitle: "Origem",
    originText:
      "O Datas Úteis nasceu de uma necessidade real: calcular o prazo de entrega de uma encomenda. A partir disso, ficou claro que o problema não era apenas um cálculo pontual, e sim a falta de um lugar simples para reunir ferramentas úteis do cotidiano.",
    purposeTitle: "Propósito",
    purposeText:
      "O site foi criado para oferecer utilidades práticas para dias úteis, prazos, cálculos, escalas, calendário, jogos leves e outras tarefas que fazem parte da rotina de trabalho e da vida pessoal.",
    evolutionTitle: "Evolução",
    evolutionText:
      "O projeto segue em evolução contínua. Novas ferramentas podem entrar conforme a utilidade real para o usuário, sempre com foco em clareza, performance e boa experiência em desktop e mobile.",
    audienceTitle: "Para quem é o Datas Úteis",
    audienceText1:
      "O site foi pensado para profissionais que lidam diariamente com prazos e datas: equipes de recursos humanos que precisam calcular férias, rescisões e períodos de experiência; departamentos contábeis e fiscais que dependem de contagens exatas de dias úteis para obrigações acessórias; advogados e escritórios jurídicos que acompanham prazos processuais; e profissionais de logística que gerenciam entregas e despachos com datas limites.",
    audienceText2:
      "Além do público corporativo, o Datas Úteis também atende estudantes que organizam cronogramas de estudo e prazos de inscrição, além de qualquer pessoa que precise responder perguntas simples do cotidiano — quantos dias úteis faltam para o próximo feriado, qual a data de vencimento de um prazo, ou quantos anos e meses se passaram desde uma data específica.",
    offersTitle: "O que o site oferece",
    offersText1:
      "A principal ferramenta é a calculadora de dias úteis, que permite adicionar ou subtrair dias úteis a partir de qualquer data, considerando feriados nacionais brasileiros. Junto a ela, o calendário interativo mostra feriados e fins de semana do ano inteiro, facilitando o planejamento visual de períodos e compromissos.",
    offersText2:
      "O simulador de escalas de trabalho ajuda quem trabalha em regimes alternados (como 12×36, 5×1 ou 6×1) a visualizar folgas e dias de trabalho ao longo dos meses. A calculadora de idade fornece a idade exata em anos, meses e dias, além de curiosidades como o total de dias vividos. Também há utilitários complementares para tarefas rápidas do dia a dia.",
    offersText3:
      "Para momentos de pausa, a seção de jogos oferece opções leves como jogo da memória, quiz de datas históricas e outros passatempos rápidos. Todas as ferramentas funcionam diretamente no navegador, sem necessidade de instalação ou cadastro.",
    qualityTitle: "Compromisso com qualidade",
    qualityText1:
      "Os dados de feriados nacionais utilizados pelo Datas Úteis são baseados em fontes oficiais, incluindo a legislação federal brasileira e bases de referência como o IBGE. Feriados fixos (como Natal, Ano Novo, Tiradentes) e móveis (como Carnaval, Sexta-feira Santa e Corpus Christi) são atualizados a cada ano para garantir resultados corretos nas calculadoras.",
    qualityText2:
      "O acesso a todas as ferramentas é gratuito e sem restrições. Não exigimos login, não limitamos o número de cálculos e não ocultamos funcionalidades atrás de planos pagos. A transparência sobre como os resultados são calculados é parte central do projeto.",
    techTitle: "Tecnologia e privacidade",
    techText1:
      "O Datas Úteis é construído com tecnologias modernas da web, priorizando carregamento rápido e experiência fluida tanto em desktop quanto em dispositivos móveis. O design responsivo garante que todas as ferramentas sejam utilizáveis em qualquer tamanho de tela, do celular ao monitor widescreen.",
    techText2:
      "Respeitamos a privacidade dos visitantes. O site não exige criação de conta, não armazena dados pessoais e não compartilha informações individuais com terceiros. Para saber mais sobre cookies e serviços de medição utilizados, consulte nossa Política de Privacidade.",
    faqTitle: "Perguntas frequentes",
    faq: [
      {
        question: "O Datas Úteis é gratuito?",
        answer:
          "Sim. Todas as ferramentas do site são gratuitas e de acesso livre. Não há planos pagos, assinaturas ou funcionalidades bloqueadas. O projeto se mantém por meio de publicidade não intrusiva.",
      },
      {
        question: "Preciso criar conta para usar?",
        answer:
          "Não. Nenhuma ferramenta exige cadastro ou login. Você pode acessar qualquer calculadora, simulador ou jogo diretamente pelo navegador, sem fornecer dados pessoais.",
      },
      {
        question: "De onde vêm os dados de feriados?",
        answer:
          "Os feriados nacionais são baseados na legislação federal brasileira. Feriados fixos seguem as leis vigentes e feriados móveis (Carnaval, Corpus Christi, Sexta-feira Santa) são recalculados anualmente conforme o calendário eclesiástico e civil.",
      },
      {
        question: "O site funciona no celular?",
        answer:
          "Sim. O Datas Úteis foi projetado com abordagem mobile-first. Todas as páginas e ferramentas se adaptam automaticamente a telas de celulares, tablets e desktops.",
      },
      {
        question: "Como posso contribuir com sugestões?",
        answer:
          "Envie um e-mail para contato@datasuteis.com.br com sua ideia de ferramenta ou melhoria. Todas as sugestões são lidas e avaliadas para possíveis implementações futuras.",
      },
    ],
    contactTitle: "Contato",
    contactText:
      "Tem uma ideia de ferramenta útil? Envie sua sugestão por e-mail. O canal de contato do projeto é contato@datasuteis.com.br.",
    ideaCta: "Enviar sugestão por e-mail",
  },
  en: {
    title: "About Datas Úteis",
    subtitle:
      "Learn how the project started and why it was designed to gather useful day-to-day tools in one place.",
    originTitle: "Origin",
    originText:
      "Datas Úteis started from a real need: calculating a delivery deadline. That need showed there was room for a simple place that gathers useful tools instead of solving just one isolated calculation.",
    purposeTitle: "Purpose",
    purposeText:
      "The site exists to offer practical utilities for business days, deadlines, calculations, schedules, calendars, light games and other routine tasks.",
    evolutionTitle: "Evolution",
    evolutionText:
      "The project keeps evolving. New tools can be added whenever they solve real user needs without sacrificing clarity, performance or mobile usability.",
    audienceTitle: "Who is Datas Úteis for",
    audienceText1:
      "The site was designed for professionals who deal with deadlines and dates every day: HR teams calculating vacation periods, termination dates and probation intervals; accounting and tax departments that rely on precise business-day counts for filing obligations; lawyers and legal offices tracking procedural deadlines; and logistics professionals managing deliveries and shipments with strict cutoff dates.",
    audienceText2:
      "Beyond the corporate audience, Datas Úteis also serves students organizing study schedules and application deadlines, as well as anyone who needs quick answers to everyday questions — how many business days until the next holiday, when a specific deadline expires, or exactly how many years and months have passed since a given date.",
    offersTitle: "What the site offers",
    offersText1:
      "The main tool is the business day calculator, which lets you add or subtract business days from any date while accounting for Brazilian national holidays. Alongside it, the interactive calendar displays holidays and weekends for the entire year, making it easy to visually plan periods and commitments.",
    offersText2:
      "The work schedule simulator helps anyone on rotating shifts (such as 12×36, 5×1 or 6×1) to visualize days off and working days across the months. The age calculator provides your exact age in years, months and days, along with curiosities like the total number of days lived. There are also complementary utilities for quick everyday tasks.",
    offersText3:
      "For break moments, the games section offers light options such as a memory game, a historical dates quiz and other quick pastimes. Every tool runs directly in the browser with no installation or sign-up required.",
    qualityTitle: "Quality commitment",
    qualityText1:
      "The national holiday data used by Datas Úteis comes from official sources, including Brazilian federal legislation and reference databases such as IBGE. Fixed holidays (like Christmas, New Year and Tiradentes Day) and moveable ones (like Carnival, Good Friday and Corpus Christi) are updated every year to ensure accurate calculator results.",
    qualityText2:
      "Access to every tool is free and unrestricted. We do not require login, we do not limit the number of calculations, and we do not hide features behind paid plans. Transparency about how results are computed is a core part of the project.",
    techTitle: "Technology and privacy",
    techText1:
      "Datas Úteis is built with modern web technologies, prioritizing fast loading and a smooth experience on both desktop and mobile devices. The responsive design ensures every tool is usable at any screen size, from smartphones to widescreen monitors.",
    techText2:
      "We respect our visitors' privacy. The site does not require account creation, does not store personal data, and does not share individual information with third parties. To learn more about cookies and measurement services, please review our Privacy Policy.",
    faqTitle: "Frequently asked questions",
    faq: [
      {
        question: "Is Datas Úteis free?",
        answer:
          "Yes. Every tool on the site is free and openly accessible. There are no paid plans, subscriptions or locked features. The project is supported through non-intrusive advertising.",
      },
      {
        question: "Do I need to create an account?",
        answer:
          "No. None of the tools require sign-up or login. You can access any calculator, simulator or game directly in your browser without providing personal data.",
      },
      {
        question: "Where does the holiday data come from?",
        answer:
          "National holidays are based on Brazilian federal legislation. Fixed holidays follow current laws, and moveable holidays (Carnival, Corpus Christi, Good Friday) are recalculated annually according to the ecclesiastical and civil calendar.",
      },
      {
        question: "Does the site work on mobile?",
        answer:
          "Yes. Datas Úteis was designed with a mobile-first approach. All pages and tools adapt automatically to phone, tablet and desktop screens.",
      },
      {
        question: "How can I submit suggestions?",
        answer:
          "Send an email to contato@datasuteis.com.br with your tool idea or improvement. Every suggestion is read and evaluated for possible future implementation.",
      },
    ],
    contactTitle: "Contact",
    contactText:
      "Have an idea for a useful tool? Send your suggestion by email to contato@datasuteis.com.br.",
    ideaCta: "Send an email suggestion",
  },
  es: {
    title: "Sobre Datas Úteis",
    subtitle:
      "Conozca el origen del proyecto y la propuesta de reunir herramientas útiles del día a día en un solo lugar.",
    originTitle: "Origen",
    originText:
      "Datas Úteis nació de una necesidad real: calcular el plazo de entrega de una encomienda. Eso mostró que el problema no era solo un cálculo puntual, sino la falta de un sitio simple con utilidades prácticas.",
    purposeTitle: "Propósito",
    purposeText:
      "El sitio fue creado para ofrecer utilidades prácticas para días hábiles, plazos, cálculos, escalas, calendario, juegos ligeros y otras tareas de la rutina diaria.",
    evolutionTitle: "Evolución",
    evolutionText:
      "El proyecto sigue en evolución continua. Nuevas herramientas pueden entrar cuando aporten utilidad real, sin perder claridad, rendimiento ni buena experiencia móvil.",
    audienceTitle: "Para quién es Datas Úteis",
    audienceText1:
      "El sitio fue pensado para profesionales que trabajan diariamente con plazos y fechas: equipos de recursos humanos que necesitan calcular vacaciones, rescisiones y períodos de prueba; departamentos contables y fiscales que dependen de conteos exactos de días hábiles para obligaciones accesorias; abogados y oficinas jurídicas que siguen plazos procesales; y profesionales de logística que gestionan entregas y despachos con fechas límite.",
    audienceText2:
      "Además del público corporativo, Datas Úteis también atiende a estudiantes que organizan cronogramas de estudio y plazos de inscripción, así como a cualquier persona que necesite respuestas rápidas a preguntas cotidianas: cuántos días hábiles faltan para el próximo feriado, cuándo vence un plazo determinado o exactamente cuántos años y meses han pasado desde una fecha específica.",
    offersTitle: "Qué ofrece el sitio",
    offersText1:
      "La herramienta principal es la calculadora de días hábiles, que permite sumar o restar días hábiles a partir de cualquier fecha, considerando los feriados nacionales brasileños. Junto a ella, el calendario interactivo muestra feriados y fines de semana de todo el año, facilitando la planificación visual de períodos y compromisos.",
    offersText2:
      "El simulador de escalas de trabajo ayuda a quienes trabajan en regímenes alternados (como 12×36, 5×1 o 6×1) a visualizar descansos y días laborales a lo largo de los meses. La calculadora de edad proporciona la edad exacta en años, meses y días, además de curiosidades como el total de días vividos. También hay utilidades complementarias para tareas rápidas del día a día.",
    offersText3:
      "Para momentos de pausa, la sección de juegos ofrece opciones ligeras como un juego de memoria, un quiz de fechas históricas y otros pasatiempos rápidos. Todas las herramientas funcionan directamente en el navegador, sin necesidad de instalación ni registro.",
    qualityTitle: "Compromiso con la calidad",
    qualityText1:
      "Los datos de feriados nacionales utilizados por Datas Úteis provienen de fuentes oficiales, incluyendo la legislación federal brasileña y bases de referencia como el IBGE. Los feriados fijos (como Navidad, Año Nuevo y Tiradentes) y los móviles (como Carnaval, Viernes Santo y Corpus Christi) se actualizan cada año para garantizar resultados correctos en las calculadoras.",
    qualityText2:
      "El acceso a todas las herramientas es gratuito y sin restricciones. No exigimos inicio de sesión, no limitamos la cantidad de cálculos y no ocultamos funcionalidades detrás de planes pagos. La transparencia sobre cómo se calculan los resultados es parte central del proyecto.",
    techTitle: "Tecnología y privacidad",
    techText1:
      "Datas Úteis está construido con tecnologías web modernas, priorizando la carga rápida y una experiencia fluida tanto en escritorio como en dispositivos móviles. El diseño responsivo garantiza que todas las herramientas sean utilizables en cualquier tamaño de pantalla, desde el celular hasta el monitor panorámico.",
    techText2:
      "Respetamos la privacidad de los visitantes. El sitio no exige creación de cuenta, no almacena datos personales y no comparte información individual con terceros. Para saber más sobre cookies y servicios de medición, consulte nuestra Política de Privacidad.",
    faqTitle: "Preguntas frecuentes",
    faq: [
      {
        question: "¿Datas Úteis es gratuito?",
        answer:
          "Sí. Todas las herramientas del sitio son gratuitas y de acceso libre. No hay planes pagos, suscripciones ni funcionalidades bloqueadas. El proyecto se mantiene mediante publicidad no intrusiva.",
      },
      {
        question: "¿Necesito crear una cuenta para usar?",
        answer:
          "No. Ninguna herramienta exige registro ni inicio de sesión. Puede acceder a cualquier calculadora, simulador o juego directamente desde el navegador, sin proporcionar datos personales.",
      },
      {
        question: "¿De dónde provienen los datos de feriados?",
        answer:
          "Los feriados nacionales se basan en la legislación federal brasileña. Los feriados fijos siguen las leyes vigentes y los móviles (Carnaval, Corpus Christi, Viernes Santo) se recalculan anualmente según el calendario eclesiástico y civil.",
      },
      {
        question: "¿El sitio funciona en el celular?",
        answer:
          "Sí. Datas Úteis fue diseñado con enfoque mobile-first. Todas las páginas y herramientas se adaptan automáticamente a pantallas de celulares, tablets y escritorios.",
      },
      {
        question: "¿Cómo puedo enviar sugerencias?",
        answer:
          "Envíe un correo electrónico a contato@datasuteis.com.br con su idea de herramienta o mejora. Todas las sugerencias son leídas y evaluadas para posibles implementaciones futuras.",
      },
    ],
    contactTitle: "Contacto",
    contactText:
      "¿Tiene una idea de herramienta útil? Envíe su sugerencia por e-mail a contato@datasuteis.com.br.",
    ideaCta: "Enviar sugerencia por e-mail",
  },
};

export default function About() {
  const { language, t } = useI18n();
  const copy = ABOUT_COPY[language] ?? ABOUT_COPY.pt;
  const gamesNavLabel = getGamesNavLabel(language);
  const navigationLabels = getNavigationLabels(language);
  const topLabel = getBackToTopLabel(language);
  const breadcrumbs = [
    { label: navigationLabels.home, href: "/" },
    { label: navigationLabels.about },
  ];
  const navItems = [
    {
      id: "historia",
      label:
        language === "en"
          ? "About"
          : language === "es"
            ? "Sobre"
            : "Sobre",
    },
    {
      id: "publico",
      label:
        language === "en"
          ? "Audience"
          : language === "es"
            ? "Público"
            : "Público",
    },
    {
      id: "ferramentas",
      label:
        language === "en"
          ? "Tools"
          : language === "es"
            ? "Herramientas"
            : "Ferramentas",
    },
    {
      id: "qualidade",
      label:
        language === "en"
          ? "Quality"
          : language === "es"
            ? "Calidad"
            : "Qualidade",
    },
    {
      id: "tecnologia",
      label:
        language === "en"
          ? "Technology"
          : language === "es"
            ? "Tecnología"
            : "Tecnologia",
    },
    {
      id: "faq",
      label: "FAQ",
    },
    {
      id: "contato",
      label:
        language === "en"
          ? "Contact"
          : language === "es"
            ? "Contacto"
            : "Contato",
    },
  ];

  usePageSeo({
    title: "Sobre o Datas Úteis | Ferramentas úteis para o dia a dia",
    description:
      "Conheça a história do Datas Úteis, um site criado para reunir ferramentas úteis como cálculo de dias úteis, calendário, escalas, jogos e outras utilidades do cotidiano.",
    path: "/sobre/",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: copy.title,
        url: "https://datasuteis.com.br/sobre/",
        description:
          "Conheça a história do Datas Úteis e o propósito do site de reunir ferramentas úteis do cotidiano.",
      },
      {
        ...buildBreadcrumbSchema([
          { label: navigationLabels.home, href: "/" },
          { label: navigationLabels.about, href: "/sobre/" },
        ]),
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Datas Úteis",
        url: "https://datasuteis.com.br/",
        email: "contato@datasuteis.com.br",
      },
      buildFaqPageSchema(copy.faq),
    ],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" role="main">
        <section className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-background py-8 md:py-10">
          <div className="container mx-auto">
            <PageIntroNavigation
              breadcrumbs={breadcrumbs}
              breadcrumbAriaLabel={navigationLabels.breadcrumb}
              backLabel={navigationLabels.back}
              backAriaLabel={navigationLabels.backAria}
            />

            <div className="mt-5 max-w-4xl">
              <h1 className="text-4xl font-bold text-primary md:text-5xl">
                {copy.title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                {copy.subtitle}
              </p>
            </div>
          </div>
        </section>

        <FloatingSectionNav items={navItems} topLabel={topLabel} />

        <section className="section-md">
          <div className="container mx-auto space-y-6">
            <div id="historia" className="section-anchor grid gap-6 lg:grid-cols-3">
              <article className="card-base p-6">
                <h2 className="text-2xl font-bold">{copy.originTitle}</h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {copy.originText}
                </p>
              </article>

              <article className="card-base p-6">
                <h2 className="text-2xl font-bold">{copy.purposeTitle}</h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {copy.purposeText}
                </p>
              </article>

              <article className="card-base p-6">
                <h2 className="text-2xl font-bold">{copy.evolutionTitle}</h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {copy.evolutionText}
                </p>
              </article>
            </div>

            <section id="publico" className="section-anchor card-base p-6">
              <h2 className="text-2xl font-bold">{copy.audienceTitle}</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {copy.audienceText1}
              </p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {copy.audienceText2}
              </p>
            </section>

            <section id="ferramentas" className="section-anchor card-base p-6">
              <h2 className="text-2xl font-bold">{copy.offersTitle}</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {copy.offersText1}
              </p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {copy.offersText2}
              </p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {copy.offersText3}
              </p>
            </section>

            <section id="qualidade" className="section-anchor card-base p-6">
              <h2 className="text-2xl font-bold">{copy.qualityTitle}</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {copy.qualityText1}
              </p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {copy.qualityText2}
              </p>
            </section>

            <section id="tecnologia" className="section-anchor card-base p-6">
              <h2 className="text-2xl font-bold">{copy.techTitle}</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {copy.techText1}
              </p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {copy.techText2}
              </p>
            </section>

            <section id="faq" className="section-anchor card-base p-6">
              <h2 className="text-2xl font-bold">{copy.faqTitle}</h2>
              <div className="mt-6 space-y-3">
                {copy.faq.map((item) => (
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
            </section>

            <section id="contato" className="section-anchor card-base p-6">
              <h2 className="text-2xl font-bold">{copy.contactTitle}</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                {copy.contactText}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="mailto:contato@datasuteis.com.br"
                  className="btn-primary"
                >
                  {copy.ideaCta}
                </a>
                <Link href="/contato/" className="btn-secondary">
                  {language === "en"
                    ? "Contact"
                    : language === "es"
                      ? "Contacto"
                      : "Contato"}
                </Link>
                <Link href="/termos/" className="btn-secondary">
                  {language === "en"
                    ? "Terms"
                    : language === "es"
                      ? "Términos"
                      : "Termos"}
                </Link>
                <Link href="/" className="btn-secondary">
                  {t("nav_home")}
                </Link>
                <Link href="/jogos/" className="btn-secondary">
                  {gamesNavLabel}
                </Link>
              </div>
            </section>

            <CoreNavigationBlock />

            <CtaFinalBlock
              language={language}
              title={language === "en" ? "Explore our tools" : language === "es" ? "Explore nuestras herramientas" : "Conheça nossas ferramentas"}
              buttonLabel={language === "en" ? "Open tools" : language === "es" ? "Abrir herramientas" : "Abrir ferramentas"}
              href="/"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
