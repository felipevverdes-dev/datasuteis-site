import type { SupportedLanguage } from "@/lib/site";

export interface HomeBlogTeaser {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
}

const HOME_BLOG_TEASERS: Record<SupportedLanguage, HomeBlogTeaser[]> = {
  pt: [
    {
      slug: "como-contar-prazos-em-dias-uteis",
      title: "Como Contar Prazos em Dias Uteis",
      excerpt:
        "Prazo mal contado costuma nascer da mesma confusao: usar dia corrido quando a regra real pede dia util.",
      category: "Prazos",
      readTime: "4 min",
    },
    {
      slug: "como-montar-escala-de-trabalho",
      title: "Como Montar Escala de Trabalho",
      excerpt:
        "Uma escala boa nasce de cobertura real, descanso viavel e comparacao entre modelos antes de fechar o calendario.",
      category: "Escalas",
      readTime: "5 min",
    },
    {
      slug: "beneficios-dos-jogos-de-logica",
      title: "Beneficios dos Jogos de Logica",
      excerpt:
        "Jogos de logica funcionam melhor quando entram como pausa curta e organizada, sem promessas exageradas.",
      category: "Jogos",
      readTime: "4 min",
    },
  ],
  en: [
    {
      slug: "como-contar-prazos-em-dias-uteis",
      title: "How to Count Deadlines in Business Days",
      excerpt:
        "Many deadline mistakes come from treating business days and calendar days as if they were the same.",
      category: "Deadlines",
      readTime: "4 min",
    },
    {
      slug: "como-montar-escala-de-trabalho",
      title: "How to Build a Work Schedule",
      excerpt:
        "A solid work schedule starts with real coverage needs, viable time off and model comparison before the calendar is closed.",
      category: "Schedules",
      readTime: "5 min",
    },
    {
      slug: "beneficios-dos-jogos-de-logica",
      title: "Benefits of Logic Games",
      excerpt:
        "Logic games work best as short, organized breaks rather than exaggerated brain-training promises.",
      category: "Games",
      readTime: "4 min",
    },
  ],
  es: [
    {
      slug: "como-contar-prazos-em-dias-uteis",
      title: "Como Contar Plazos en Dias Habiles",
      excerpt:
        "Muchos errores de plazo nacen de tratar dias habiles y dias corridos como si fueran la misma cosa.",
      category: "Plazos",
      readTime: "4 min",
    },
    {
      slug: "como-montar-escala-de-trabalho",
      title: "Como Montar una Escala de Trabajo",
      excerpt:
        "Una buena escala empieza por cobertura real, descanso viable y comparacion de modelos antes de cerrar el calendario.",
      category: "Escalas",
      readTime: "5 min",
    },
    {
      slug: "beneficios-dos-jogos-de-logica",
      title: "Beneficios de los Juegos de Logica",
      excerpt:
        "Los juegos de logica funcionan mejor como pausas cortas y organizadas, sin promesas exageradas.",
      category: "Juegos",
      readTime: "4 min",
    },
  ],
};

export function getHomeBlogTeasers(language: SupportedLanguage) {
  return HOME_BLOG_TEASERS[language] ?? HOME_BLOG_TEASERS.pt;
}
