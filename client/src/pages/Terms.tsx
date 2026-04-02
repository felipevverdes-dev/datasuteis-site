import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CoreNavigationBlock from "@/components/layout/CoreNavigationBlock";
import CtaFinalBlock from "@/components/layout/CtaFinalBlock";
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
    lastUpdated: string;
    sections: Array<{ title: string; paragraphs: string[] }>;
  }
> = {
  pt: {
    title: "Termos de uso",
    subtitle:
      "Estas regras resumem o uso das ferramentas e do conteúdo publicado no Datas Úteis.",
    lastUpdated: "Última atualização: 28 de março de 2026",
    sections: [
      {
        title: "Uso do site",
        paragraphs: [
          "O Datas Úteis oferece ferramentas e conteúdos informativos para apoiar cálculos de datas, dias úteis, escalas, idade e rotinas relacionadas ao tempo.",
          "O uso do site é gratuito e não exige cadastro para as ferramentas principais.",
        ],
      },
      {
        title: "Limites de responsabilidade",
        paragraphs: [
          "As ferramentas ajudam no planejamento e na conferência de informações, mas resultados ligados a obrigações legais, contratuais, judiciais, fiscais ou trabalhistas devem ser validados no seu contexto específico.",
          "Feriados estaduais, municipais, pontos facultativos e regras internas podem alterar o resultado em cenários reais.",
        ],
      },
      {
        title: "Conteúdo e propriedade",
        paragraphs: [
          "Os textos, layout, marca e organização das ferramentas pertencem ao projeto Datas Úteis, salvo indicação diferente em fontes externas ou dados de terceiros.",
          "Citações curtas e links são permitidos com referência ao site. Reprodução integral de páginas e conteúdos não é autorizada sem permissão.",
        ],
      },
      {
        title: "Serviços de terceiros",
        paragraphs: [
          "O site pode usar serviços externos para medição, anúncios, clima, notícias e cotações. Esses serviços podem ter regras próprias de disponibilidade e uso.",
          "Para mais detalhes sobre cookies, armazenamento local e serviços de medição, consulte a Política de Privacidade.",
        ],
      },
      {
        title: "Natureza informativa",
        paragraphs: [
          "Todas as ferramentas disponíveis no Datas Úteis têm caráter exclusivamente informativo. Os resultados fornecidos pelas calculadoras, simuladores e demais utilidades não constituem aconselhamento jurídico, contábil, financeiro ou de qualquer outra natureza profissional.",
          "Recomendamos que resultados utilizados para fins legais, fiscais, trabalhistas ou contratuais sejam sempre conferidos com as fontes oficiais pertinentes ou validados por um profissional habilitado na área correspondente.",
        ],
      },
      {
        title: "Alterações nos termos",
        paragraphs: [
          "O Datas Úteis pode atualizar estes termos de uso periodicamente para refletir mudanças nas funcionalidades do site, na legislação aplicável ou nas práticas do projeto. Quando houver alterações significativas, a data de última atualização no topo desta página será modificada.",
          "O uso continuado do site após a publicação de alterações indica a aceitação dos novos termos. Recomendamos que esta página seja revisitada ocasionalmente.",
        ],
      },
      {
        title: "Uso aceitável",
        paragraphs: [
          "O Datas Úteis é destinado ao uso pessoal e profissional dentro de parâmetros razoáveis. Não é permitido o uso de robôs, scrapers ou qualquer ferramenta automatizada para extração em massa de dados ou conteúdos do site.",
          "Acessos automatizados que sobrecarreguem a infraestrutura, tentativas de interferir no funcionamento do site ou o uso das ferramentas para fins ilegais são expressamente proibidos. O projeto se reserva o direito de bloquear acessos que violem estas condições.",
        ],
      },
      {
        title: "Dados de feriados",
        paragraphs: [
          "As informações de feriados nacionais exibidas no site são compiladas a partir da legislação federal brasileira e de fontes de referência reconhecidas. No entanto, feriados estaduais, municipais, pontos facultativos e datas comemorativas regionais podem não estar cobertos.",
          "Eventuais alterações na legislação de feriados, decretos de ponto facultativo emitidos após a última atualização da base ou particularidades de convenções coletivas de trabalho podem gerar divergências entre o resultado exibido e a situação real do usuário.",
        ],
      },
      {
        title: "Disponibilidade",
        paragraphs: [
          "O Datas Úteis é oferecido no estado em que se encontra (\"as is\"), sem garantias de disponibilidade ininterrupta. Manutenções programadas, atualizações de infraestrutura ou problemas técnicos podem causar indisponibilidade temporária.",
          "O projeto se empenha em manter o site acessível e funcional, mas não garante tempo de atividade mínimo nem se responsabiliza por perdas decorrentes de eventual indisponibilidade.",
        ],
      },
      {
        title: "Legislação aplicável",
        paragraphs: [
          "Estes termos de uso são regidos pela legislação da República Federativa do Brasil. Quaisquer disputas relacionadas ao uso do site serão submetidas ao foro da comarca de domicílio do responsável pelo projeto, com exclusão de qualquer outro.",
        ],
      },
    ],
  },
  en: {
    title: "Terms of use",
    subtitle:
      "These rules summarize how Datas Úteis tools and published content may be used.",
    lastUpdated: "Last updated: March 28, 2026",
    sections: [
      {
        title: "Site usage",
        paragraphs: [
          "Datas Úteis provides tools and informational content to support date calculations, business days, schedules, age and time-related routines.",
          "Using the site is free and the main tools do not require sign-up.",
        ],
      },
      {
        title: "Responsibility limits",
        paragraphs: [
          "The tools help with planning and checking information, but results related to legal, contractual, judicial, tax or labor obligations must be validated in your specific context.",
          "State and city holidays, optional days and internal rules may change real-world outcomes.",
        ],
      },
      {
        title: "Content and ownership",
        paragraphs: [
          "Texts, layout, brand and tool organization belong to the Datas Úteis project unless a different source is explicitly identified.",
          "Short citations and links are allowed with attribution. Full reproduction of pages and content is not authorized without permission.",
        ],
      },
      {
        title: "Third-party services",
        paragraphs: [
          "The site may rely on external services for measurement, ads, weather, news and quotes. These services may have their own usage and availability rules.",
          "For details about cookies, local storage and measurement services, review the Privacy Policy.",
        ],
      },
      {
        title: "Informational nature",
        paragraphs: [
          "Every tool available on Datas Úteis is strictly informational. The results provided by calculators, simulators and other utilities do not constitute legal, accounting, financial or any other form of professional advice.",
          "We recommend that results used for legal, tax, labor or contractual purposes always be cross-checked with the relevant official sources or validated by a qualified professional in the corresponding field.",
        ],
      },
      {
        title: "Changes to the terms",
        paragraphs: [
          "Datas Úteis may update these terms of use periodically to reflect changes in the site's features, applicable legislation or project practices. When significant changes are made, the last-updated date at the top of this page will be modified.",
          "Continued use of the site after changes are published indicates acceptance of the new terms. We recommend revisiting this page occasionally.",
        ],
      },
      {
        title: "Acceptable use",
        paragraphs: [
          "Datas Úteis is intended for personal and professional use within reasonable parameters. The use of bots, scrapers or any automated tool for bulk extraction of data or content from the site is not permitted.",
          "Automated access that overloads the infrastructure, attempts to interfere with site operations or using the tools for illegal purposes are expressly prohibited. The project reserves the right to block access that violates these conditions.",
        ],
      },
      {
        title: "Holiday data",
        paragraphs: [
          "National holiday information displayed on the site is compiled from Brazilian federal legislation and recognized reference sources. However, state holidays, city holidays, optional days and regional commemorative dates may not be covered.",
          "Changes in holiday legislation, optional-day decrees issued after the last database update, or particularities of collective bargaining agreements may cause differences between the displayed result and the user's actual situation.",
        ],
      },
      {
        title: "Availability",
        paragraphs: [
          "Datas Úteis is offered as-is, with no guarantee of uninterrupted availability. Scheduled maintenance, infrastructure updates or technical issues may cause temporary downtime.",
          "The project strives to keep the site accessible and functional but does not guarantee minimum uptime nor accept liability for losses arising from occasional unavailability.",
        ],
      },
      {
        title: "Applicable law",
        paragraphs: [
          "These terms of use are governed by the laws of the Federative Republic of Brazil. Any disputes related to use of the site shall be submitted to the jurisdiction of the domicile of the project owner, to the exclusion of any other.",
        ],
      },
    ],
  },
  es: {
    title: "Términos de uso",
    subtitle:
      "Estas reglas resumen el uso de las herramientas y del contenido publicado en Datas Úteis.",
    lastUpdated: "Última actualización: 28 de marzo de 2026",
    sections: [
      {
        title: "Uso del sitio",
        paragraphs: [
          "Datas Úteis ofrece herramientas y contenidos informativos para apoyar cálculos de fechas, días hábiles, escalas, edad y rutinas relacionadas con el tiempo.",
          "El uso del sitio es gratuito y las herramientas principales no requieren registro.",
        ],
      },
      {
        title: "Límites de responsabilidad",
        paragraphs: [
          "Las herramientas ayudan en la planificación y verificación de información, pero los resultados relacionados con obligaciones legales, contractuales, judiciales, fiscales o laborales deben validarse en su contexto específico.",
          "Feriados estatales, municipales, puntos facultativos y reglas internas pueden cambiar el resultado real.",
        ],
      },
      {
        title: "Contenido y propiedad",
        paragraphs: [
          "Los textos, el diseño, la marca y la organización de las herramientas pertenecen al proyecto Datas Úteis, salvo indicación diferente.",
          "Se permiten citas breves y enlaces con atribución. La reproducción completa de páginas y contenidos no está autorizada sin permiso.",
        ],
      },
      {
        title: "Servicios de terceros",
        paragraphs: [
          "El sitio puede usar servicios externos para medición, anuncios, clima, noticias y cotizaciones. Estos servicios pueden tener reglas propias.",
          "Para más detalles sobre cookies, almacenamiento local y medición, consulte la Política de Privacidad.",
        ],
      },
      {
        title: "Naturaleza informativa",
        paragraphs: [
          "Todas las herramientas disponibles en Datas Úteis tienen carácter exclusivamente informativo. Los resultados proporcionados por las calculadoras, simuladores y demás utilidades no constituyen asesoramiento jurídico, contable, financiero ni de ninguna otra naturaleza profesional.",
          "Recomendamos que los resultados utilizados para fines legales, fiscales, laborales o contractuales sean siempre verificados con las fuentes oficiales pertinentes o validados por un profesional habilitado en el área correspondiente.",
        ],
      },
      {
        title: "Cambios en los términos",
        paragraphs: [
          "Datas Úteis puede actualizar estos términos de uso periódicamente para reflejar cambios en las funcionalidades del sitio, la legislación aplicable o las prácticas del proyecto. Cuando haya cambios significativos, la fecha de última actualización en la parte superior de esta página será modificada.",
          "El uso continuado del sitio tras la publicación de cambios indica la aceptación de los nuevos términos. Recomendamos que esta página sea revisitada ocasionalmente.",
        ],
      },
      {
        title: "Uso aceptable",
        paragraphs: [
          "Datas Úteis está destinado al uso personal y profesional dentro de parámetros razonables. No se permite el uso de robots, scrapers ni ninguna herramienta automatizada para la extracción masiva de datos o contenidos del sitio.",
          "Los accesos automatizados que sobrecarguen la infraestructura, los intentos de interferir en el funcionamiento del sitio o el uso de las herramientas para fines ilegales están expresamente prohibidos. El proyecto se reserva el derecho de bloquear accesos que violen estas condiciones.",
        ],
      },
      {
        title: "Datos de feriados",
        paragraphs: [
          "La información de feriados nacionales que se muestra en el sitio se recopila a partir de la legislación federal brasileña y fuentes de referencia reconocidas. Sin embargo, los feriados estatales, municipales, puntos facultativos y fechas conmemorativas regionales pueden no estar cubiertos.",
          "Eventuales cambios en la legislación de feriados, decretos de punto facultativo emitidos después de la última actualización de la base o particularidades de convenios colectivos de trabajo pueden generar divergencias entre el resultado mostrado y la situación real del usuario.",
        ],
      },
      {
        title: "Disponibilidad",
        paragraphs: [
          "Datas Úteis se ofrece en el estado en que se encuentra (\"tal cual\"), sin garantías de disponibilidad ininterrumpida. Mantenimientos programados, actualizaciones de infraestructura o problemas técnicos pueden causar indisponibilidad temporal.",
          "El proyecto se esfuerza por mantener el sitio accesible y funcional, pero no garantiza un tiempo de actividad mínimo ni se responsabiliza por pérdidas derivadas de eventual indisponibilidad.",
        ],
      },
      {
        title: "Legislación aplicable",
        paragraphs: [
          "Estos términos de uso se rigen por la legislación de la República Federativa de Brasil. Cualquier disputa relacionada con el uso del sitio será sometida al foro del domicilio del responsable del proyecto, con exclusión de cualquier otro.",
        ],
      },
    ],
  },
};

export default function Terms() {
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
        ? "Terms of use | Datas Úteis"
        : language === "es"
          ? "Términos de uso | Datas Úteis"
          : "Termos de uso | Datas Úteis",
    description: copy.subtitle,
    path: "/termos/",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: copy.title,
        url: "https://datasuteis.com.br/termos/",
        description: copy.subtitle,
      },
      {
        ...buildBreadcrumbSchema([
          { label: navigationLabels.home, href: "/" },
          { label: navigationLabels.about, href: "/sobre/" },
          { label: copy.title, href: "/termos/" },
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
              <p className="mt-3 text-sm text-muted-foreground/70">
                {copy.lastUpdated}
              </p>
            </div>
          </div>
        </section>

        <section className="section-md">
          <div className="container mx-auto space-y-6">
            <section className="card-base p-6 md:p-8">
              <div className="space-y-8">
                {copy.sections.map(section => (
                  <div key={section.title}>
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                    <div className="mt-4 space-y-4">
                      {section.paragraphs.map(paragraph => (
                        <p
                          key={paragraph}
                          className="text-sm leading-7 text-muted-foreground"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
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
