import { getBlogArticleHtml } from "@/lib/blog-content";
import type { SupportedLanguage } from "@/lib/site";

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface LocalizedBlogPostData {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  modifiedAt: string;
  readTime: string;
  keywords: string[];
  articleHtml: string;
  faqs: BlogFaq[];
  relatedSlugs: string[];
}

interface BlogTranslationData {
  title: string;
  description: string;
  excerpt: string;
  category: string;
  keywords: string[];
  articleHtmlKey: string;
}

interface BlogPostCatalogItem {
  slug: string;
  publishedAt: string;
  modifiedAt: string;
  readTimeMinutes: number;
  relatedSlugs: string[];
  translations: Record<SupportedLanguage, BlogTranslationData>;
}

const HTML_ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&apos;": "'",
  "&#39;": "'",
  "&gt;": ">",
  "&lt;": "<",
  "&middot;": "·",
  "&nbsp;": " ",
  "&quot;": '"',
  "&rarr;": "→",
  "&rsaquo;": "›",
};

const BLOG_CATALOG: BlogPostCatalogItem[] = [
  {
    slug: "como-contar-prazos-em-dias-uteis",
    publishedAt: "2026-03-14",
    modifiedAt: "2026-03-14",
    readTimeMinutes: 4,
    relatedSlugs: ["dias-uteis-o-que-sao", "sabado-conta-como-dia-util"],
    translations: {
      pt: {
        title: "Como Contar Prazos em Dias Uteis",
        description:
          "Aprenda um passo a passo simples para contar prazos em dias uteis sem misturar dias corridos, feriados e regra de sabado.",
        excerpt:
          "Prazo mal contado costuma nascer da mesma confusao: usar dia corrido quando a regra real pede dia util.",
        category: "Prazos",
        keywords: ["como contar prazos em dias uteis", "contagem de prazo", "dias uteis e prazos"],
        articleHtmlKey: "blog_deadline_counting_article_html",
      },
      en: {
        title: "How to Count Deadlines in Business Days",
        description:
          "Learn a simple way to count deadlines in business days without mixing calendar days, holidays and Saturday rules.",
        excerpt:
          "Many deadline mistakes come from treating business days and calendar days as if they were the same.",
        category: "Deadlines",
        keywords: ["how to count deadlines in business days", "deadline counting", "business day deadline"],
        articleHtmlKey: "blog_deadline_counting_article_html",
      },
      es: {
        title: "Como Contar Plazos en Dias Habiles",
        description:
          "Aprenda un paso a paso simple para contar plazos en dias habiles sin mezclar dias corridos, feriados y regla del sabado.",
        excerpt:
          "Muchos errores de plazo nacen de tratar dias habiles y dias corridos como si fueran la misma cosa.",
        category: "Plazos",
        keywords: ["como contar plazos en dias habiles", "conteo de plazos", "plazo en dias habiles"],
        articleHtmlKey: "blog_deadline_counting_article_html",
      },
    },
  },
  {
    slug: "como-montar-escala-de-trabalho",
    publishedAt: "2026-03-14",
    modifiedAt: "2026-03-14",
    readTimeMinutes: 5,
    relatedSlugs: ["escalas-de-trabalho-clt", "escala-12x36-como-funciona"],
    translations: {
      pt: {
        title: "Como Montar Escala de Trabalho",
        description:
          "Veja o que definir antes de montar uma escala de trabalho e como comparar cobertura, folgas e feriados com mais clareza.",
        excerpt:
          "Uma escala boa nasce de cobertura real, descanso viavel e comparacao entre modelos antes de fechar o calendario.",
        category: "Escalas",
        keywords: ["como montar escala de trabalho", "montar escala", "simulador de escala"],
        articleHtmlKey: "blog_schedule_building_article_html",
      },
      en: {
        title: "How to Build a Work Schedule",
        description:
          "See what to define before building a work schedule and how to compare coverage, days off and holidays more clearly.",
        excerpt:
          "A solid work schedule starts with real coverage needs, viable time off and model comparison before the calendar is closed.",
        category: "Schedules",
        keywords: ["how to build a work schedule", "schedule planning", "shift coverage"],
        articleHtmlKey: "blog_schedule_building_article_html",
      },
      es: {
        title: "Como Montar una Escala de Trabajo",
        description:
          "Vea que definir antes de montar una escala de trabajo y como comparar cobertura, descansos y feriados con mas claridad.",
        excerpt:
          "Una buena escala empieza por cobertura real, descanso viable y comparacion de modelos antes de cerrar el calendario.",
        category: "Escalas",
        keywords: ["como montar una escala de trabajo", "montar escala", "cobertura de turnos"],
        articleHtmlKey: "blog_schedule_building_article_html",
      },
    },
  },
  {
    slug: "beneficios-dos-jogos-de-logica",
    publishedAt: "2026-03-14",
    modifiedAt: "2026-03-14",
    readTimeMinutes: 4,
    relatedSlugs: ["como-contar-prazos-em-dias-uteis", "como-montar-escala-de-trabalho"],
    translations: {
      pt: {
        title: "Beneficios dos Jogos de Logica",
        description:
          "Entenda como Sudoku, palavras cruzadas e caca-palavras funcionam como pausas curtas com foco em atencao, leitura e padroes.",
        excerpt:
          "Jogos de logica funcionam melhor quando entram como pausa curta e organizada, sem promessas exageradas.",
        category: "Jogos",
        keywords: ["beneficios dos jogos de logica", "sudoku e logica", "palavras cruzadas beneficios"],
        articleHtmlKey: "blog_logic_games_benefits_article_html",
      },
      en: {
        title: "Benefits of Logic Games",
        description:
          "Understand how Sudoku, crosswords and word search work as short breaks focused on attention, reading and pattern recognition.",
        excerpt:
          "Logic games work best as short, organized breaks rather than exaggerated brain-training promises.",
        category: "Games",
        keywords: ["benefits of logic games", "sudoku benefits", "crossword benefits"],
        articleHtmlKey: "blog_logic_games_benefits_article_html",
      },
      es: {
        title: "Beneficios de los Juegos de Logica",
        description:
          "Entienda como Sudoku, crucigramas y sopa de letras funcionan como pausas cortas con foco en atencion, lectura y patrones.",
        excerpt:
          "Los juegos de logica funcionan mejor como pausas cortas y organizadas, sin promesas exageradas.",
        category: "Juegos",
        keywords: ["beneficios de los juegos de logica", "beneficios sudoku", "beneficios crucigrama"],
        articleHtmlKey: "blog_logic_games_benefits_article_html",
      },
    },
  },
  {
    slug: "quantos-dias-uteis-tem-cada-mes-de-2026",
    publishedAt: "2026-03-14",
    modifiedAt: "2026-03-27",
    readTimeMinutes: 7,
    relatedSlugs: ["tabela-feriados-2026", "quinto-dia-util-2026"],
    translations: {
      pt: {
        title: "Quantos Dias Uteis Tem Cada Mes de 2026",
        description:
          "Veja um guia rapido para entender quantos dias uteis tem cada mes de 2026 e quando os feriados nacionais afetam a contagem.",
        excerpt:
          "Ano a ano, alguns meses parecem iguais, mas a conta muda quando o feriado nacional cai em dia util. Em 2026 isso pesa bastante em abril, maio, setembro, outubro, novembro e dezembro.",
        category: "Dias Uteis",
        keywords: ["quantos dias uteis tem cada mes de 2026", "dias uteis 2026", "meses de 2026"],
        articleHtmlKey: "blog_business_days_2026_months_article_html",
      },
      en: {
        title: "How Many Business Days Are in Each Month of 2026",
        description:
          "Review how many business days each month of 2026 has and when national holidays change the monthly count.",
        excerpt:
          "Monthly business-day totals change whenever a national holiday falls on a weekday, and 2026 has several months affected by that.",
        category: "Business Days",
        keywords: ["business days in each month of 2026", "business days 2026", "2026 months"],
        articleHtmlKey: "blog_business_days_2026_months_article_html",
      },
      es: {
        title: "Cuantos Dias Habiles Tiene Cada Mes de 2026",
        description:
          "Revise cuantos dias habiles tiene cada mes de 2026 y cuando los feriados nacionales cambian esa cuenta.",
        excerpt:
          "La cantidad de dias habiles por mes cambia cuando un feriado nacional cae en dia de semana, y 2026 tiene varios meses afectados.",
        category: "Dias Habiles",
        keywords: ["cuantos dias habiles tiene cada mes de 2026", "dias habiles 2026", "meses de 2026"],
        articleHtmlKey: "blog_business_days_2026_months_article_html",
      },
    },
  },
  {
    slug: "feriados-prolongados-de-2026",
    publishedAt: "2026-03-14",
    modifiedAt: "2026-03-14",
    readTimeMinutes: 4,
    relatedSlugs: ["quantos-dias-uteis-tem-cada-mes-de-2026", "dias-uteis-o-que-sao"],
    translations: {
      pt: {
        title: "Feriados Prolongados de 2026",
        description:
          "Veja quais feriados nacionais de 2026 caem em segunda ou sexta-feira e quais datas merecem atencao no planejamento.",
        excerpt:
          "Em 2026, varias folgas nacionais criam fins de semana prolongados e alteram cobertura, prazo e calendario comercial.",
        category: "Calendario",
        keywords: ["feriados prolongados de 2026", "feriados 2026", "calendario 2026 com feriados"],
        articleHtmlKey: "blog_long_holidays_2026_article_html",
      },
      en: {
        title: "Long Holiday Weekends in 2026",
        description:
          "Review which 2026 holidays create longer weekends and why they matter for planning and operations.",
        excerpt:
          "Several national holidays in 2026 fall on Monday or Friday, creating longer breaks and shorter workweeks.",
        category: "Calendar",
        keywords: ["long holiday weekends 2026", "holidays 2026", "2026 calendar holidays"],
        articleHtmlKey: "blog_long_holidays_2026_article_html",
      },
      es: {
        title: "Feriados Prolongados de 2026",
        description:
          "Revise que feriados nacionales de 2026 crean fines de semana mas largos y por que importan para la planificacion.",
        excerpt:
          "Varios feriados nacionales de 2026 caen en lunes o viernes y reducen semanas laborales enteras.",
        category: "Calendario",
        keywords: ["feriados prolongados de 2026", "feriados 2026", "calendario 2026"],
        articleHtmlKey: "blog_long_holidays_2026_article_html",
      },
    },
  },
  {
    slug: "como-calcular-dias-uteis-no-excel",
    publishedAt: "2026-03-14",
    modifiedAt: "2026-03-14",
    readTimeMinutes: 5,
    relatedSlugs: ["dias-uteis-o-que-sao", "sabado-conta-como-dia-util"],
    translations: {
      pt: {
        title: "Como Calcular Dias Uteis no Excel",
        description:
          "Aprenda como calcular dias uteis no Excel com formulas simples e veja quando vale conferir o resultado em uma calculadora online.",
        excerpt:
          "A planilha ajuda, mas a formula so fica confiavel quando voce trata feriados e regra de sabado do jeito certo.",
        category: "Produtividade",
        keywords: ["como calcular dias uteis no excel", "excel dias uteis", "formula dias uteis"],
        articleHtmlKey: "blog_business_days_excel_article_html",
      },
      en: {
        title: "How to Calculate Business Days in Excel",
        description:
          "Learn the main Excel formulas for business-day counting and when it makes sense to verify the result in an online calculator.",
        excerpt:
          "Spreadsheets help, but business-day formulas only become reliable when holidays and Saturday rules are handled correctly.",
        category: "Productivity",
        keywords: ["how to calculate business days in excel", "excel business days", "business day formula"],
        articleHtmlKey: "blog_business_days_excel_article_html",
      },
      es: {
        title: "Como Calcular Dias Habiles en Excel",
        description:
          "Aprenda las formulas mas comunes para calcular dias habiles en Excel y cuando conviene validar el resultado en una calculadora online.",
        excerpt:
          "La hoja de calculo ayuda, pero la formula solo queda confiable cuando feriados y sabado se tratan correctamente.",
        category: "Productividad",
        keywords: ["como calcular dias habiles en excel", "excel dias habiles", "formula dias habiles"],
        articleHtmlKey: "blog_business_days_excel_article_html",
      },
    },
  },
  {
    slug: "sabado-conta-como-dia-util",
    publishedAt: "2026-03-14",
    modifiedAt: "2026-03-14",
    readTimeMinutes: 4,
    relatedSlugs: ["dias-uteis-o-que-sao", "como-calcular-dias-uteis-no-excel"],
    translations: {
      pt: {
        title: "Sabado Conta Como Dia Util",
        description:
          "Entenda quando o sabado entra ou nao entra na contagem de dias uteis e como comparar os dois cenarios sem erro.",
        excerpt:
          "A pergunta parece simples, mas a resposta muda conforme o processo, o contrato e a operacao usada como referencia.",
        category: "Dias Uteis",
        keywords: ["sabado conta como dia util", "sabado e dia util", "contagem de dias uteis"],
        articleHtmlKey: "blog_saturday_business_day_article_html",
      },
      en: {
        title: "Does Saturday Count as a Business Day",
        description:
          "Understand when Saturday counts as a business day and how to compare both scenarios correctly.",
        excerpt:
          "The answer depends on the process, the contract and the operational rule being used.",
        category: "Business Days",
        keywords: ["does saturday count as a business day", "saturday business day", "business day counting"],
        articleHtmlKey: "blog_saturday_business_day_article_html",
      },
      es: {
        title: "El Sabado Cuenta Como Dia Habil",
        description:
          "Entienda cuando el sabado entra o no entra en la cuenta de dias habiles y como comparar ambos escenarios.",
        excerpt:
          "La respuesta cambia segun el proceso, el contrato y la regla operativa aplicada.",
        category: "Dias Habiles",
        keywords: ["el sabado cuenta como dia habil", "sabado dia habil", "dias habiles"],
        articleHtmlKey: "blog_saturday_business_day_article_html",
      },
    },
  },
  {
    slug: "escalas-de-trabalho-clt",
    publishedAt: "2026-03-06",
    modifiedAt: "2026-03-08",
    readTimeMinutes: 6,
    relatedSlugs: ["escala-12x36-como-funciona", "escala-6x1-como-funciona"],
    translations: {
      pt: {
        title: "Escalas de Trabalho na CLT: Guia Completo",
        description:
          "Conheça os principais tipos de escala de trabalho previstos na CLT: 5x2, 6x1, 12x36 e 24x48. Entenda como funcionam e como escolher a escala adequada.",
        excerpt:
          "Entenda quando cada escala faz sentido, quais são os pontos de atenção legais e como avaliar cobertura, descanso e produtividade.",
        category: "Escalas",
        keywords: ["escalas de trabalho", "CLT", "5x2", "6x1", "12x36", "24x48"],
        articleHtmlKey: "blog_scales_clt_article_html",
      },
      en: {
        title: "Work Schedules Under Brazil's CLT: Complete Guide",
        description:
          "Learn the main work schedule types recognized under Brazil's CLT, including 5x2, 6x1, 12x36 and 24x48, and how to compare them in practice.",
        excerpt:
          "See when each schedule makes sense, which legal points need attention, and how to evaluate coverage, rest and productivity.",
        category: "Schedules",
        keywords: ["work schedules", "Brazil CLT", "5x2", "6x1", "12x36", "24x48"],
        articleHtmlKey: "blog_scales_clt_article_html",
      },
      es: {
        title: "Escalas de Trabajo en la CLT: Guía Completa",
        description:
          "Conozca los principales tipos de escala de trabajo previstos en la CLT de Brasil, como 5x2, 6x1, 12x36 y 24x48, y cómo compararlos.",
        excerpt:
          "Vea cuándo cada escala tiene sentido, qué puntos legales exigen atención y cómo evaluar cobertura, descanso y productividad.",
        category: "Escalas",
        keywords: ["escalas de trabajo", "CLT Brasil", "5x2", "6x1", "12x36", "24x48"],
        articleHtmlKey: "blog_scales_clt_article_html",
      },
    },
  },
  {
    slug: "escala-12x36-como-funciona",
    publishedAt: "2026-03-06",
    modifiedAt: "2026-03-08",
    readTimeMinutes: 5,
    relatedSlugs: ["escalas-de-trabalho-clt", "adicional-noturno"],
    translations: {
      pt: {
        title: "Escala 12x36: Como Funciona na Prática",
        description:
          "Entenda como funciona a escala 12x36: jornada de 12 horas com 36 horas de descanso. Veja o que a CLT prevê, direitos e dúvidas frequentes.",
        excerpt:
          "A 12x36 é eficiente para plantões, mas só funciona bem quando jornada, cobertura e descanso são tratados como um sistema.",
        category: "Escalas",
        keywords: ["escala 12x36", "plantão", "CLT", "jornada 12x36"],
        articleHtmlKey: "blog_scale_12x36_article_html",
      },
      en: {
        title: "12x36 Schedule: How It Works in Practice",
        description:
          "Understand the 12x36 schedule, a 12-hour shift followed by 36 hours of rest, and the main CLT points, rights and practical questions around it.",
        excerpt:
          "The 12x36 model works well for duty-based operations, but only when hours, coverage and rest are handled as one system.",
        category: "Schedules",
        keywords: ["12x36 schedule", "duty shifts", "Brazil CLT", "night schedule"],
        articleHtmlKey: "blog_scale_12x36_article_html",
      },
      es: {
        title: "Escala 12x36: Cómo Funciona en la Práctica",
        description:
          "Entienda cómo funciona la escala 12x36, con jornadas de 12 horas y 36 horas de descanso, y los principales puntos de la CLT sobre este modelo.",
        excerpt:
          "La 12x36 funciona bien en guardias y operaciones continuas, pero solo cuando jornada, cobertura y descanso se tratan como un sistema.",
        category: "Escalas",
        keywords: ["escala 12x36", "guardias", "CLT Brasil", "jornada 12x36"],
        articleHtmlKey: "blog_scale_12x36_article_html",
      },
    },
  },
  {
    slug: "escala-6x1-como-funciona",
    publishedAt: "2026-03-06",
    modifiedAt: "2026-03-08",
    readTimeMinutes: 5,
    relatedSlugs: ["escalas-de-trabalho-clt", "quinto-dia-util"],
    translations: {
      pt: {
        title: "Escala 6x1: Como Funciona no Dia a Dia",
        description:
          "Saiba como funciona a escala 6x1: seis dias de trabalho e um de folga. Entenda descanso semanal, domingos e pontos de atenção para empresas e trabalhadores.",
        excerpt:
          "A 6x1 é uma escala de alta utilização em comércio e serviços, mas pede atenção a domingo, folga rotativa e carga mensal.",
        category: "Escalas",
        keywords: ["escala 6x1", "folga rotativa", "descanso semanal", "CLT"],
        articleHtmlKey: "blog_scale_6x1_article_html",
      },
      en: {
        title: "6x1 Schedule: How It Works Day to Day",
        description:
          "See how the 6x1 schedule works in practice, with six workdays and one day off, including weekly rest, Sundays and key attention points.",
        excerpt:
          "The 6x1 model is common in retail and services, but it requires tighter control of Sundays, rotating time off and monthly workload.",
        category: "Schedules",
        keywords: ["6x1 schedule", "weekly rest", "Sunday work", "Brazil CLT"],
        articleHtmlKey: "blog_scale_6x1_article_html",
      },
      es: {
        title: "Escala 6x1: Cómo Funciona en el Día a Día",
        description:
          "Sepa cómo funciona la escala 6x1, con seis días de trabajo y uno de descanso, y qué observar sobre descanso semanal y domingos.",
        excerpt:
          "La 6x1 es muy usada en comercio y servicios, pero exige atención especial a domingos, descansos rotativos y carga mensual.",
        category: "Escalas",
        keywords: ["escala 6x1", "descanso semanal", "domingo", "CLT Brasil"],
        articleHtmlKey: "blog_scale_6x1_article_html",
      },
    },
  },
  {
    slug: "dias-uteis-o-que-sao",
    publishedAt: "2026-03-06",
    modifiedAt: "2026-03-08",
    readTimeMinutes: 4,
    relatedSlugs: ["quinto-dia-util", "escalas-de-trabalho-clt"],
    translations: {
      pt: {
        title: "Dias Úteis: O Que São e Como Contar",
        description:
          "Entenda o que são dias úteis, a diferença entre dias úteis e corridos, como contar e onde essa informação é usada na prática.",
        excerpt:
          "Dias úteis seguem sendo a base de prazos, pagamentos e rotinas operacionais. O erro mais comum é ignorar feriados e a regra concreta do período.",
        category: "Dias Úteis",
        keywords: ["dias úteis", "contagem de dias úteis", "prazos", "feriados"],
        articleHtmlKey: "blog_business_days_article_html",
      },
      en: {
        title: "Business Days: What They Are and How to Count Them",
        description:
          "Understand what business days are, how they differ from calendar days, and where this counting logic is used in practice.",
        excerpt:
          "Business days remain the basis for deadlines, payments and operational routines. The usual mistake is ignoring holidays and the actual rule in force.",
        category: "Business Days",
        keywords: ["business days", "business day counting", "deadlines", "holidays"],
        articleHtmlKey: "blog_business_days_article_html",
      },
      es: {
        title: "Días Hábiles: Qué Son y Cómo Contarlos",
        description:
          "Entienda qué son los días hábiles, la diferencia frente a los días corridos y cómo hacer un conteo correcto en la práctica.",
        excerpt:
          "Los días hábiles siguen siendo la base de plazos, pagos y rutinas operativas. El error más común es ignorar feriados y la regla concreta del período.",
        category: "Días Hábiles",
        keywords: ["días hábiles", "conteo de días hábiles", "plazos", "feriados"],
        articleHtmlKey: "blog_business_days_article_html",
      },
    },
  },
  {
    slug: "quinto-dia-util",
    publishedAt: "2026-03-06",
    modifiedAt: "2026-03-08",
    readTimeMinutes: 4,
    relatedSlugs: ["dias-uteis-o-que-sao", "adicional-noturno"],
    translations: {
      pt: {
        title: "Quinto Dia Útil: O Que É e Por Que Importa",
        description:
          "Entenda o que é o quinto dia útil, por que ele é importante para o pagamento de salários e como identificá-lo no calendário.",
        excerpt:
          "O quinto dia útil parece simples, mas muda bastante quando o mês começa em fim de semana ou feriado e quando a empresa precisa fechar a folha com segurança.",
        category: "Dias Úteis",
        keywords: ["quinto dia útil", "pagamento de salário", "folha", "CLT"],
        articleHtmlKey: "blog_fifth_business_day_article_html",
      },
      en: {
        title: "Fifth Business Day: What It Is and Why It Matters",
        description:
          "Understand what the fifth business day is, why it matters for payroll in Brazil, and how to identify it correctly in the calendar.",
        excerpt:
          "The fifth business day looks simple, but it shifts a lot when the month starts with a weekend or holiday and payroll needs to close safely.",
        category: "Business Days",
        keywords: ["fifth business day", "payroll deadline", "salary payment", "Brazil CLT"],
        articleHtmlKey: "blog_fifth_business_day_article_html",
      },
      es: {
        title: "Quinto Día Hábil: Qué Es y Por Qué Importa",
        description:
          "Entienda qué es el quinto día hábil, por qué importa para el pago de salarios en Brasil y cómo identificarlo en el calendario.",
        excerpt:
          "El quinto día hábil parece simple, pero cambia bastante cuando el mes empieza con fin de semana o feriado y la empresa debe cerrar nómina con seguridad.",
        category: "Días Hábiles",
        keywords: ["quinto día hábil", "pago de salario", "nómina", "CLT Brasil"],
        articleHtmlKey: "blog_fifth_business_day_article_html",
      },
    },
  },
  {
    slug: "adicional-noturno",
    publishedAt: "2026-03-06",
    modifiedAt: "2026-03-08",
    readTimeMinutes: 5,
    relatedSlugs: ["escala-12x36-como-funciona", "escalas-de-trabalho-clt"],
    translations: {
      pt: {
        title: "Adicional Noturno: O Que É e Como Funciona",
        description:
          "Entenda o que é o adicional noturno, qual é o horário noturno urbano, hora noturna reduzida e como ele se relaciona com escalas de trabalho.",
        excerpt:
          "Adicional noturno não é só um percentual. Ele afeta o desenho da jornada, a leitura de horas e a análise da escala aplicada.",
        category: "Legislação",
        keywords: ["adicional noturno", "hora noturna reduzida", "trabalho noturno"],
        articleHtmlKey: "blog_night_additional_article_html",
      },
      en: {
        title: "Night Shift Differential: What It Is and How It Works",
        description:
          "Understand the Brazilian night shift differential, the urban night period, the reduced night hour and how all of this connects to work schedules.",
        excerpt:
          "The night shift differential is more than a percentage. It changes how shifts, hours and schedule analysis need to be read.",
        category: "Labor Law",
        keywords: ["night shift differential", "reduced night hour", "night work", "Brazil labor law"],
        articleHtmlKey: "blog_night_additional_article_html",
      },
      es: {
        title: "Adicional Nocturno: Qué Es y Cómo Funciona",
        description:
          "Entienda qué es el adicional nocturno en Brasil, cuál es el horario nocturno urbano, la hora nocturna reducida y su relación con las escalas.",
        excerpt:
          "El adicional nocturno es más que un porcentaje. Cambia cómo se leen la jornada, las horas y el análisis de la escala aplicada.",
        category: "Legislación",
        keywords: ["adicional nocturno", "hora nocturna reducida", "trabajo nocturno", "legislación laboral brasileña"],
        articleHtmlKey: "blog_night_additional_article_html",
      },
    },
  },
].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));

function decodeHtmlEntities(value: string) {
  return value.replace(/&[a-z0-9#]+;/gi, (entity) => HTML_ENTITY_MAP[entity] ?? entity);
}

function stripHtml(value: string) {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function extractFaqsFromArticleHtml(articleHtml: string) {
  const faqs: BlogFaq[] = [];
  const detailsPattern = /<details[^>]*>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>\s*<\/details>/gi;

  let match = detailsPattern.exec(articleHtml);
  while (match) {
    faqs.push({
      question: stripHtml(match[1]),
      answer: stripHtml(match[2]),
    });
    match = detailsPattern.exec(articleHtml);
  }

  return faqs;
}

function localizeBlogPost(post: BlogPostCatalogItem, language: SupportedLanguage): LocalizedBlogPostData {
  const translation = post.translations[language] ?? post.translations.pt;
  const articleHtml = getBlogArticleHtml(language, translation.articleHtmlKey);

  return {
    slug: post.slug,
    title: translation.title,
    description: translation.description,
    excerpt: translation.excerpt,
    category: translation.category,
    publishedAt: post.publishedAt,
    modifiedAt: post.modifiedAt,
    readTime: `${post.readTimeMinutes} min`,
    keywords: translation.keywords,
    articleHtml,
    faqs: extractFaqsFromArticleHtml(articleHtml),
    relatedSlugs: post.relatedSlugs,
  };
}

export function getLocalizedBlogPosts(language: SupportedLanguage) {
  return BLOG_CATALOG.map((post) => localizeBlogPost(post, language));
}

export function getLocalizedBlogPostBySlug(slug: string, language: SupportedLanguage) {
  const post = BLOG_CATALOG.find((item) => item.slug === slug);
  return post ? localizeBlogPost(post, language) : null;
}
