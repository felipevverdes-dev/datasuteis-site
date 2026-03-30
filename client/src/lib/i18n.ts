import type { SupportedLanguage } from "@/lib/site";

type TranslationPrimitive = string | number | boolean | null;
type TranslationValue =
  | TranslationPrimitive
  | TranslationMap
  | TranslationArray;
interface TranslationMap {
  [key: string]: TranslationValue;
}
interface TranslationArray extends Array<TranslationValue> {}

export interface TranslationParams {
  [key: string]: string | number;
}

export interface PrivacySection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export const DATE_LOCALE_BY_LANGUAGE: Record<SupportedLanguage, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-ES",
};

export const LANGUAGE_OPTIONS = [
  { value: "pt", shortLabel: "PT", label: "Português", flag: "🇧🇷" },
  { value: "en", shortLabel: "EN", label: "English", flag: "🇺🇸" },
  { value: "es", shortLabel: "ES", label: "Español", flag: "🇪🇸" },
] as const satisfies ReadonlyArray<{
  value: SupportedLanguage;
  shortLabel: string;
  label: string;
  flag: string;
}>;

const customTranslations: Record<SupportedLanguage, TranslationMap> = {
  pt: {
    common: {
      yes: "Sim",
      no: "Não",
      copyright: "Todos os direitos reservados.",
    },
    nav_home: "Início",
    nav_calc: "Dias Úteis",
    nav_calculator: "Calculadora",
    nav_calendar: "Calendário",
    nav_scale: "Escalas",
    nav_blog: "Blog",
    nav_menu_label: "Abrir menu",
    theme_toggle: "Alternar tema",
    hero_title:
      "Calcule dias úteis e organize escalas de trabalho com mais precisão",
    hero_subtitle:
      "Consulte feriados nacionais oficiais, conte dias úteis entre datas e simule cobertura operacional em um único fluxo.",
    hero_cta_calc: "Calcular Dias Úteis",
    hero_cta_cal: "Ver Calendário {year}",
    hero_cta_scale: "Simular Escala",
    faq_title: "Perguntas frequentes",
    calc_title: "Calcular Dias Úteis",
    calc_start: "Data inicial",
    calc_end: "Data final",
    calc_intro_copy:
      "Informe o período para calcular dias úteis considerando apenas feriados nacionais oficiais.",
    calc_business_days: "Dias úteis",
    calc_calendar_days: "Dias corridos",
    calc_weekends: "Fins de semana",
    calc_holidays: "Feriados nacionais",
    calendar_title: "Calendário 2026",
    scale_title: "Simulador de Escala de Trabalho",
    scale_page_subtitle:
      "Analise cobertura, quadro mínimo e distribuição mensal da equipe sem perder a leitura do calendário.",
    scale_params_title: "Parâmetros da operação",
    scale_month: "Mês",
    scale_type: "Escala",
    scale_generate_btn: "Gerar simulação",
    scale_result_title: "Resultado da simulação",
    components: {
      header: {
        primaryNavLabel: "Navegação principal",
        mobileMenuLabel: "Menu mobile",
      },
      footer: {
        description:
          "O Datas Úteis é uma ferramenta gratuita para calcular dias úteis, consultar feriados nacionais e simular escalas de trabalho com leitura operacional mais objetiva.",
        tools: "Ferramentas",
        content: "Conteúdo",
        contact: "Contato",
        businessDays: "Dias Úteis",
        calculator: "Calculadora",
        calendar: "Calendário",
        schedule: "Simulador de Escalas",
        blog: "Blog",
        workingDays: "O que são dias úteis",
        cltScales: "Escalas na CLT",
        privacy: "Política de Privacidade",
      },
      adSlot: {
        ariaLabel: "Espaço reservado para anúncios",
      },
      errorBoundary: {
        title: "Ocorreu um erro inesperado.",
        reload: "Recarregar página",
      },
      languageSwitcher: {
        ariaLabel: "Selecionar idioma",
      },
    },
    pages: {
      home: {
        seoTitle:
          "Calcular Dias Úteis Online | Contador de Dias Úteis | Datas Úteis",
        seoDescription:
          "Calcule dias úteis entre datas, consulte calendário com feriados nacionais e utilize simulador de escala de trabalho. Ferramenta gratuita e online.",
        cards: [
          {
            title: "Dias Úteis",
            description:
              "Calcule dias úteis e corridos entre duas datas com feriados nacionais já considerados.",
          },
          {
            title: "Calendário",
            description:
              "Visualize o mês com feriados nacionais, fins de semana e dias úteis em leitura rápida.",
          },
          {
            title: "Escala",
            description:
              "Teste cobertura, quadro mínimo, horas por colaborador e status operacional da escala.",
          },
        ],
        faqItems: [
          {
            question: "O que é um dia útil?",
            answer:
              "Dia útil é o dia considerado operacional para cálculo de prazos, normalmente excluindo sábados, domingos e feriados considerados no período.",
          },
          {
            question: "Sábado entra na conta?",
            answer:
              "Na leitura padrão do Datas Úteis, sábado não entra como dia útil. Em contextos específicos, vale conferir a regra aplicável.",
          },
          {
            question: "A calculadora considera feriados nacionais?",
            answer:
              "Sim. Os feriados nacionais entram no cálculo e também impactam o calendário e o simulador de escala quando o mês é analisado.",
          },
          {
            question: "A página de escala calcula quadro mínimo?",
            answer:
              "Sim. O simulador cruza turnos, cobertura, feriados, sábado, domingo e horas por colaborador para estimar quadro mínimo e status do cenário.",
          },
        ],
      },
      calculator: {
        seoTitle: "Calcular Dias Úteis Entre Datas | Datas Úteis",
        seoDescription:
          "Calcule dias úteis entre datas com feriados nacionais oficiais do Brasil. Contador de dias úteis online gratuito.",
        validationMissingDates: "Preencha as duas datas para continuar.",
        validationOrder:
          "A data inicial precisa ser menor ou igual à data final.",
        calculate: "Calcular período",
        copy: "Copiar",
        downloadCsv: "Baixar CSV",
        csvFileName: "calculo-dias-uteis.csv",
        csvHeaders: [
          "Data Inicial",
          "Data Final",
          "Dias Úteis",
          "Dias Totais",
          "Fins de Semana",
          "Feriados",
        ],
        guideTitle: "O que entra nessa contagem",
        guideIntro:
          "O cálculo desconta fins de semana e feriados nacionais oficiais. Pontos facultativos, como Carnaval e Corpus Christi, ficam fora da conta padrão.",
        guideItems: [
          "O período é contado da data inicial até a data final.",
          "Sábados e domingos saem automaticamente da conta.",
          "Somente feriados nacionais oficiais são abatidos do resultado.",
        ],
        relatedCalendar: "Ver calendário",
        relatedFifthDay: "Entender o quinto dia útil",
        relatedSchedule: "Simular escala de trabalho",
      },
      calendar: {
        seoTitle: "Calendário de Feriados | Datas Úteis",
        seoDescription:
          "Visualize feriados nacionais, estaduais e municipais, pontos facultativos, fins de semana e dias úteis em um calendário interativo.",
        heroSubtitle:
          "Leia o mês com foco em feriados, fins de semana e dias úteis.",
        dayNames: ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"],
        holiday: "Feriado",
        optionalPoint: "Ponto facultativo",
        weekend: "Fim de semana",
        businessDay: "Dia útil",
        holidayListTitle: "Feriados do mês selecionado",
        previousMonth: "Mês anterior",
        nextMonth: "Próximo mês",
      },
      blog: {
        seoTitle:
          "Blog Datas Úteis | Escalas, Dias Úteis e Rotinas de Trabalho",
        seoDescription:
          "Artigos sobre escalas de trabalho, dias úteis, adicional noturno e rotinas CLT. Conteúdo prático para trabalhadores, empresas e profissionais de RH.",
        heroTitle: "Blog Datas Úteis",
        heroSubtitle:
          "Conteúdo direto sobre dias úteis, escalas de trabalho, adicional noturno e decisões operacionais que impactam RH, folha e cobertura.",
        readArticle: "Ler artigo",
        relatedToolsTitle: "Ferramentas relacionadas",
        businessDaysBetweenDates: "Dias úteis entre datas",
        holidayCalendar: "Calendário com feriados",
        scheduleSimulator: "Simulador de escalas",
      },
      blogPost: {
        breadcrumb: "Breadcrumb",
        faqTitle: "Perguntas frequentes",
        relatedToolsTitle: "Ferramentas relacionadas",
        relatedBusinessDays: "Dias úteis",
        relatedCalendar: "Calendário",
        relatedSchedule: "Escala",
        readAlso: "Leia também",
      },
      calculatorApp: {
        seoTitle:
          "Calculadora Online Grátis | Calculadora Simples Responsiva | Datas Úteis",
        seoDescription:
          "Calculadora online com modos simples, financeira, científica e de desenvolvedor em layout rápido e responsivo.",
        heroTitle: "Calculadora Avançada",
        heroSubtitle:
          "Calculadora com múltiplos modos: Simples, Financeira, Desenvolvedor e Científica.",
        modesTitle: "Quatro modos em uma única calculadora",
        modes: [
          { id: "simple", label: "Simples" },
          { id: "financial", label: "Financeira" },
          { id: "developer", label: "Desenvolvedor" },
          { id: "scientific", label: "Científica" },
        ],
        modeCards: [
          {
            id: "simple",
            label: "Simples",
            description:
              "Operações rápidas para contas do dia a dia com foco em velocidade.",
          },
          {
            id: "financial",
            label: "Financeira",
            description:
              "Atalhos para porcentagem e cálculos rápidos de gorjeta ou ajuste de valor.",
          },
          {
            id: "developer",
            label: "Desenvolvedor",
            description:
              "Conversão entre bases e operações bitwise para leitura técnica.",
          },
          {
            id: "scientific",
            label: "Científica",
            description:
              "Funções trigonométricas, logaritmos, potência, raiz e constantes.",
          },
        ],
        tip15: "Gorjeta 15%",
        tip20: "Gorjeta 20%",
      },
      privacy: {
        seoTitle: "Política de Privacidade | Datas Úteis",
        seoDescription:
          "Saiba como o Datas Úteis utiliza cookies técnicos, armazenamento local e integrações de terceiros para funcionamento, preferências e monetização.",
        heroSubtitle: "Entenda como o Datas Úteis coleta, utiliza e protege as informações dos visitantes. Este documento detalha as práticas de privacidade adotadas pelo site.",
        lastUpdated: "Última atualização: 28 de março de 2026",
        sections: [
          {
            title: "1. Informações que Coletamos",
            paragraphs: [
              "O Datas Úteis foi projetado para funcionar sem cadastro e sem coleta de dados pessoais identificáveis. As ferramentas de cálculo, calendário, escala e idade processam as informações diretamente no navegador do usuário, sem enviar dados para servidores externos.",
              "As informações técnicas coletadas automaticamente durante a navegação incluem:",
            ],
            bullets: [
              "Dados agregados de navegação (páginas visitadas, tempo de permanência, origem do acesso) através do Google Analytics",
              "Preferências de idioma e tema visual, armazenadas exclusivamente no navegador do usuário via localStorage",
              "Dados de geolocalização aproximada (cidade e estado) para exibição de feriados locais, obtidos via IP sem armazenamento permanente",
              "Informações técnicas do dispositivo (tipo de navegador, sistema operacional, resolução de tela) para fins de compatibilidade",
            ],
          },
          {
            title: "2. Como Usamos Seus Dados",
            paragraphs: [
              "As informações coletadas são utilizadas exclusivamente para manter e melhorar o funcionamento do site. Não vendemos, alugamos ou compartilhamos dados pessoais com terceiros para fins comerciais além do que está descrito nesta política.",
              "Os principais usos das informações coletadas são:",
            ],
            bullets: [
              "Melhorar a qualidade, a performance e a funcionalidade das ferramentas disponíveis",
              "Compreender quais páginas e funcionalidades são mais acessadas para priorizar melhorias",
              "Otimizar a experiência de navegação em diferentes dispositivos e navegadores",
              "Exibir anúncios contextuais e relevantes através do Google AdSense para viabilizar a manutenção do projeto",
              "Personalizar a experiência do usuário com base no idioma e tema visual escolhidos",
            ],
          },
          {
            title: "3. Cookies e Tecnologias de Rastreamento",
            paragraphs: [
              "O Datas Úteis utiliza cookies e armazenamento local (localStorage) para garantir o funcionamento correto do site e lembrar suas preferências entre visitas. Ao aceitar o banner de consentimento, você autoriza o uso de cookies de medição e publicidade.",
              "Os tipos de cookies utilizados no site incluem:",
            ],
            bullets: [
              "Cookies técnicos: armazenam preferências de idioma, tema visual (claro/escuro) e consentimento de cookies. São essenciais para o funcionamento do site.",
              "Cookies de medição (Google Analytics): coletam dados agregados e anônimos sobre navegação para análise de uso e melhorias do site.",
              "Cookies de publicidade (Google AdSense): permitem a exibição de anúncios personalizados com base nos interesses do visitante.",
              "Cookies de terceiros: serviços como Google Tag Manager podem definir cookies adicionais para gerenciamento de scripts.",
            ],
          },
          {
            title: "4. Consentimento e Controle de Cookies",
            paragraphs: [
              "Na primeira visita ao site, um banner de consentimento é exibido para que o usuário escolha aceitar ou recusar cookies não essenciais. Cookies de medição e publicidade são carregados somente após o consentimento explícito do usuário.",
              "Você pode gerenciar ou desabilitar cookies a qualquer momento nas configurações do seu navegador. A desativação de cookies técnicos pode afetar funcionalidades como a memorização do idioma e do tema visual escolhidos.",
            ],
          },
          {
            title: "5. Armazenamento Local (localStorage)",
            paragraphs: [
              "Além de cookies, o Datas Úteis utiliza o armazenamento local do navegador para salvar preferências que tornam a experiência mais prática. Os dados armazenados localmente incluem o idioma selecionado, o tema visual e o status de consentimento de cookies.",
              "Essas informações ficam apenas no seu dispositivo e não são transmitidas para servidores do Datas Úteis.",
            ],
          },
          {
            title: "6. Segurança de Dados",
            paragraphs: [
              "O Datas Úteis adota medidas técnicas e organizacionais para proteger os dados dos visitantes:",
            ],
            bullets: [
              "Toda comunicação entre o navegador e o servidor é protegida por HTTPS com certificado SSL/TLS válido",
              "O site não armazena dados pessoais sensíveis (CPF, endereço, dados financeiros) em nenhum momento",
              "Os cálculos de datas, idades e escalas são realizados localmente no navegador, sem transmissão de dados pessoais",
              "As integrações com serviços de terceiros seguem os padrões de segurança recomendados por cada plataforma",
            ],
          },
          {
            title: "7. Serviços de Terceiros",
            paragraphs: [
              "O site utiliza serviços de terceiros para medição de audiência, exibição de anúncios e funcionalidades complementares. Cada serviço possui sua própria política de privacidade e práticas de tratamento de dados:",
            ],
            bullets: [
              "Google Analytics (analytics.google.com): coleta dados anônimos de navegação para relatórios de uso do site",
              "Google AdSense (adsense.google.com): exibe anúncios contextuais e personalizados com base no comportamento de navegação",
              "Google Tag Manager: gerencia o carregamento de scripts de terceiros de forma controlada",
              "Open-Meteo: fornece dados meteorológicos para o widget de clima, sem coleta de dados pessoais",
              "IBGE: fornece dados de municípios brasileiros para filtros de localidade nas ferramentas de feriados",
            ],
          },
          {
            title: "8. Seus Direitos (LGPD)",
            paragraphs: [
              "Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), você tem os seguintes direitos em relação aos dados tratados pelo Datas Úteis:",
            ],
            bullets: [
              "Confirmar a existência de tratamento de dados pessoais",
              "Acessar os dados pessoais que eventualmente tenham sido coletados",
              "Solicitar a correção de dados incompletos ou desatualizados",
              "Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários",
              "Revogar o consentimento para cookies de medição e publicidade",
              "Opor-se ao tratamento quando realizado em desconformidade com a legislação",
            ],
          },
          {
            title: "9. Dados de Menores de Idade",
            paragraphs: [
              "O Datas Úteis não coleta intencionalmente dados pessoais de menores de 13 anos. As ferramentas do site são de uso geral e não solicitam informações que identifiquem pessoalmente o visitante, independentemente da idade.",
            ],
          },
          {
            title: "10. Alterações nesta Política",
            paragraphs: [
              "Esta política de privacidade pode ser atualizada periodicamente para refletir mudanças nas práticas do site, em serviços de terceiros ou na legislação aplicável. Alterações relevantes serão comunicadas através do próprio site. Recomendamos que você revise esta página periodicamente.",
            ],
          },
          {
            title: "11. Contato",
            paragraphs: [
              "Para dúvidas, solicitações ou reclamações relacionadas à privacidade e ao tratamento de dados no Datas Úteis, entre em contato pelo canal abaixo:",
              "Email: privacidade@datasuteis.com.br",
            ],
          },
        ],
      },
      notFound: {
        seoTitle: "Página não encontrada | Datas Úteis",
        seoDescription: "A página solicitada não foi encontrada.",
        title: "Página não encontrada",
        description:
          "Desculpe, a página que você está procurando não existe ou foi movida.",
        backHome: "Voltar para Início",
      },
      schedule: {
        seoTitle: "Simulador de Escala de Trabalho | Datas Úteis",
        seoDescription:
          "Simule cobertura operacional, quadro mínimo, horas por colaborador e calendário mensal para escalas 5x2, 6x1, 12x36, 4x2 e 24x48.",
        autoSuggested: "Sugerida automaticamente",
        simultaneousPosts: "Postos simultâneos",
        operationStart: "Início da operação",
        operationEnd: "Fim da operação",
        shiftCount: "Quantidade de turnos",
        shiftOverlap: "Encontro de turnos",
        shiftStart: "Turno {index} início",
        shiftEnd: "Turno {index} fim",
        saturday: "Sábado",
        sunday: "Domingo",
        holidays: "Feriados",
        resultEyebrow: "Resultado executivo",
        suggestedScale: "Escala recomendada",
        simulatedScale: "Escala simulada",
        minimumHeadcount: "Quadro mínimo",
        hoursPerEmployee: "Horas por colaborador",
        coverage: "Cobertura",
        postsSummary: "{count} posto(s)",
        shiftsSummary: "{count} turno(s)",
        selectedVsSuggested:
          "A escala escolhida foi {selected}, mas a leitura mais aderente ficou com {suggested}.",
        alternativeCompatible: "Alternativa compatível",
        alternativeWarning: "Alternativa com alerta",
        adjustmentEyebrow: "Ajuste de jornada",
        adjustmentTitle: "Horas por colaborador consideradas",
        referenceSuggested: "Referência sugerida: {value}",
        minusOneHour: "- 1h",
        plusOneHour: "+ 1h",
        applyAdjustment: "Aplicar ajuste",
        backToSuggested: "Voltar ao sugerido",
        calendarEyebrow: "Calendário",
        calendarTitle: "Calendário da escala",
        alertsEyebrow: "Alertas e observações",
        alertsTitle: "Alertas",
        observationsTitle: "Observações",
        noCriticalAlerts: "Sem alertas críticos para o cenário simulado.",
        legalSummary: "Resumo legal:",
        statusStandard: "Dentro do padrão",
        statusAlert: "Alerta",
        statusIncompatible: "Incompatível",
        dayOff: "Folga",
        deficitOf: "Déficit de {count}",
        hoursUnit: "h/mês",
        weekdayLabels: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        hoursComparison: {
          standard:
            "A carga segue a referência natural da escala. Referência: {reference}.",
          below_reference:
            "As horas informadas ficaram abaixo da referência natural da escala. Referência: {reference}. Considerado: {considered}.",
          above_reference:
            "As horas informadas superaram a referência natural da escala. Referência: {reference}. Considerado: {considered}.",
          incompatible:
            "A jornada informada extrapola a faixa parametrizada da escala. Referência: {reference}. Considerado: {considered}.",
        },
        holidaySummary: {
          withCount: "{count} feriado(s) nacional(is) no período selecionado.",
          none: "Sem feriados nacionais no período selecionado.",
        },
        alertMessages: {
          hours_below_reference:
            "Horas abaixo da referência aumentam a necessidade de equipe para fechar o mês.",
          hours_above_reference:
            "Horas acima da referência podem depender de compensação, horas extras ou ajuste coletivo.",
          hours_incompatible:
            "As horas informadas extrapolam a capacidade natural da escala ou do ciclo.",
          operation_incompatible:
            "O tipo de operação informado não é aderente a esta escala.",
          coverage_manual_review:
            "Mesmo com reforço de quadro, a cobertura ainda pede revisão manual.",
          sunday_control_required:
            "Cobertura aos domingos nesta escala exige controle rigoroso do descanso semanal.",
          high_monthly_hours:
            "A leitura mensal chegou a uma faixa alta de horas e pede validação da jornada real.",
        },
        observationMessages: {
          low_compatibility_monitoring:
            "A combinação entre escala e operação é possível, mas exige monitoramento mais atento.",
          minimum_headcount_expanded:
            "O quadro mínimo foi ampliado pela comparação entre horas consideradas e horas totais da operação.",
          additional_headcount_required:
            "A distribuição do ciclo pediu reforço adicional para fechar todos os dias operados.",
          holidays_discounted:
            "Os feriados do mês foram abatidos da referência mensal e dos dias operados.",
          holidays_maintained:
            "Os feriados do mês foram mantidos dentro da referência e da cobertura do período.",
          continuous_holidays:
            "Nesta escala contínua, feriados não reduzem a referência natural do ciclo.",
          hours_imbalance:
            "Há concentração de horas em parte da equipe e vale revisar a distribuição final.",
        },
        legalMessages: {
          collective_policy_required:
            "Verifique exigência de norma coletiva ou política interna antes da implantação.",
          long_shift_formal_validation:
            "Turnos longos pedem validação formal de jornada, descanso e cobertura real da equipe.",
          weekly_rest_attention:
            "A folga semanal precisa ser acompanhada com atenção para evitar desequilíbrio no ciclo.",
          compensation_required:
            "Acima da referência natural, a viabilidade pode depender de compensação válida e instrumento coletivo.",
        },
        legalProfiles: {
          "5x2":
            "Jornada clássica de dias úteis, com baixa complexidade operacional.",
          "5x1":
            "Precisa de controle mais atento do descanso semanal e da folga rotativa.",
          "6x1": "Escala comum para cobrir sábado com folga semanal rotativa.",
          "6x2":
            "Exige coordenação maior de turnos e da folga rotativa da equipe.",
          "12x36":
            "Normalmente pede atenção a acordo coletivo, política interna e jornada real.",
          "4x2":
            "Escala cíclica com boa aderência a operação contínua, mas com rodízio mais sensível.",
          "12x60":
            "Formato mais específico, normalmente usado com regras internas bem definidas.",
          "24x48":
            "Formato mais restritivo e normalmente tratado como exceção operacional.",
        },
      },
    },
  },
  en: {
    common: {
      yes: "Yes",
      no: "No",
      copyright: "All rights reserved.",
    },
    nav_home: "Home",
    nav_calc: "Business Days",
    nav_calculator: "Calculator",
    nav_calendar: "Calendar",
    nav_scale: "Schedules",
    nav_blog: "Blog",
    nav_menu_label: "Open menu",
    theme_toggle: "Switch theme",
    hero_title:
      "Calculate business days and plan work schedules with more precision",
    hero_subtitle:
      "Review official Brazilian national holidays, count business days between dates and simulate operational coverage in one flow.",
    hero_cta_calc: "Calculate Business Days",
    hero_cta_cal: "Open {year} Calendar",
    hero_cta_scale: "Simulate Schedule",
    faq_title: "Frequently asked questions",
    calc_title: "Calculate Business Days",
    calc_start: "Start date",
    calc_end: "End date",
    calc_intro_copy:
      "Enter the range to count business days using official national holidays only.",
    calc_business_days: "Business days",
    calc_calendar_days: "Calendar days",
    calc_weekends: "Weekends",
    calc_holidays: "National holidays",
    calendar_title: "2026 Calendar",
    scale_title: "Work Schedule Simulator",
    scale_page_subtitle:
      "Review coverage, minimum headcount and monthly workload without losing the calendar context.",
    scale_params_title: "Operation settings",
    scale_month: "Month",
    scale_type: "Schedule",
    scale_generate_btn: "Run simulation",
    scale_result_title: "Simulation result",
    components: {
      header: {
        primaryNavLabel: "Primary navigation",
        mobileMenuLabel: "Mobile menu",
      },
      footer: {
        description:
          "Datas Uteis is a free tool to calculate business days, review Brazilian national holidays and simulate work schedules with a more objective operational view.",
        tools: "Tools",
        content: "Content",
        contact: "Contact",
        businessDays: "Business Days",
        calculator: "Calculator",
        calendar: "Calendar",
        schedule: "Shift Simulator",
        blog: "Blog",
        workingDays: "What are business days",
        cltScales: "CLT work schedules",
        privacy: "Privacy Policy",
      },
      adSlot: {
        ariaLabel: "Ad space reserved for advertising",
      },
      errorBoundary: {
        title: "An unexpected error occurred.",
        reload: "Reload page",
      },
      languageSwitcher: {
        ariaLabel: "Select language",
      },
    },
    pages: {
      home: {
        seoTitle:
          "Calculate Business Days Online | Business Day Counter | Datas Úteis",
        seoDescription:
          "Calculate business days between dates, review a holiday calendar and use the work schedule simulator in one free online tool.",
        cards: [
          {
            title: "Business Days",
            description:
              "Calculate business and calendar days between two dates with Brazilian national holidays already considered.",
          },
          {
            title: "Calendar",
            description:
              "Review the month with national holidays, weekends and business days in a fast executive view.",
          },
          {
            title: "Schedule",
            description:
              "Test coverage, minimum headcount, hours per employee and the operational status of each schedule scenario.",
          },
        ],
        faqItems: [
          {
            question: "What is a business day?",
            answer:
              "A business day is an operational day used to calculate deadlines, usually excluding Saturdays, Sundays and holidays within the period.",
          },
          {
            question: "Does Saturday count?",
            answer:
              "In the default Datas Uteis logic, Saturday does not count as a business day. In specific contexts, check the applicable rule.",
          },
          {
            question: "Does the calculator consider national holidays?",
            answer:
              "Yes. Brazilian national holidays are included in the calculation and also affect the calendar and schedule simulator.",
          },
          {
            question: "Does the schedule page calculate minimum headcount?",
            answer:
              "Yes. The simulator combines shifts, coverage, holidays, Saturdays, Sundays and hours per employee to estimate minimum staffing and scenario status.",
          },
        ],
      },
      calculator: {
        seoTitle: "Calculate Business Days Between Dates | Datas Úteis",
        seoDescription:
          "Calculate business days between dates with official Brazilian national holidays included in a free online tool.",
        validationMissingDates: "Fill both dates to continue.",
        validationOrder:
          "The start date must be earlier than or equal to the end date.",
        calculate: "Calculate period",
        copy: "Copy",
        downloadCsv: "Download CSV",
        csvFileName: "business-days-calculation.csv",
        csvHeaders: [
          "Start Date",
          "End Date",
          "Business Days",
          "Total Days",
          "Weekends",
          "Holidays",
        ],
        guideTitle: "What this calculation includes",
        guideIntro:
          "The counter excludes weekends and official national holidays. Optional observances such as Carnival and Corpus Christi stay out of the default count.",
        guideItems: [
          "The range is counted from the start date through the end date.",
          "Saturdays and Sundays are automatically excluded.",
          "Only official national holidays are discounted from the result.",
        ],
        relatedCalendar: "Open the calendar",
        relatedFifthDay: "See the fifth business day",
        relatedSchedule: "Open the schedule simulator",
      },
      calendar: {
        seoTitle: "Holiday Calendar | Datas Úteis",
        seoDescription:
          "Review national, state and municipal holidays, optional observances, weekends and business days in an interactive calendar.",
        heroSubtitle:
          "Review the month with holidays, weekends and business days in one view.",
        dayNames: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
        holiday: "Holiday",
        optionalPoint: "Optional observance",
        weekend: "Weekend",
        businessDay: "Business day",
        holidayListTitle: "Holidays in the selected month",
        previousMonth: "Previous month",
        nextMonth: "Next month",
      },
      blog: {
        seoTitle:
          "Datas Úteis Blog | Schedules, Business Days and Work Routines",
        seoDescription:
          "Articles about work schedules, business days, night shift differential and CLT routines. Practical content for workers, companies and HR teams.",
        heroTitle: "Datas Uteis Blog",
        heroSubtitle:
          "Straightforward content about business days, work schedules, night shift differential and operational decisions that affect HR, payroll and coverage.",
        readArticle: "Read article",
        relatedToolsTitle: "Related tools",
        businessDaysBetweenDates: "Business days between dates",
        holidayCalendar: "Calendar with holidays",
        scheduleSimulator: "Schedule simulator",
      },
      blogPost: {
        breadcrumb: "Breadcrumb",
        faqTitle: "Frequently asked questions",
        relatedToolsTitle: "Related tools",
        relatedBusinessDays: "Business days",
        relatedCalendar: "Calendar",
        relatedSchedule: "Schedule",
        readAlso: "Read also",
      },
      calculatorApp: {
        seoTitle:
          "Free Online Calculator | Responsive Simple Calculator | Datas Úteis",
        seoDescription:
          "Online calculator with simple, financial, scientific and developer modes in a fast responsive layout.",
        heroTitle: "Advanced Calculator",
        heroSubtitle:
          "Calculator with multiple modes: Simple, Financial, Developer and Scientific.",
        modesTitle: "Four modes, one calculator",
        modes: [
          { id: "simple", label: "Simple" },
          { id: "financial", label: "Financial" },
          { id: "developer", label: "Developer" },
          { id: "scientific", label: "Scientific" },
        ],
        modeCards: [
          {
            id: "simple",
            label: "Simple",
            description:
              "Fast arithmetic for day-to-day calculations with minimal friction.",
          },
          {
            id: "financial",
            label: "Financial",
            description:
              "Quick shortcuts for percentage and tip-based calculations.",
          },
          {
            id: "developer",
            label: "Developer",
            description:
              "Base conversion and bitwise operations for technical use.",
          },
          {
            id: "scientific",
            label: "Scientific",
            description:
              "Trigonometry, logarithms, power, root and constants in one panel.",
          },
        ],
        tip15: "Tip 15%",
        tip20: "Tip 20%",
      },
      notFound: {
        seoTitle: "Page not found | Datas Úteis",
        seoDescription: "The requested page could not be found.",
        title: "Page not found",
        description:
          "Sorry, the page you are looking for does not exist or has been moved.",
        backHome: "Back to Home",
      },
      schedule: {
        seoTitle: "Work Schedule Simulator | Datas Úteis",
        seoDescription:
          "Simulate operational coverage, minimum headcount, hours per employee and monthly calendar for 5x2, 6x1, 12x36, 4x2 and 24x48 schedules.",
        autoSuggested: "Suggested automatically",
        simultaneousPosts: "Simultaneous posts",
        operationStart: "Operation start",
        operationEnd: "Operation end",
        shiftCount: "Number of shifts",
        shiftOverlap: "Shift overlap",
        shiftStart: "Shift {index} start",
        shiftEnd: "Shift {index} end",
        saturday: "Saturday",
        sunday: "Sunday",
        holidays: "Holidays",
        resultEyebrow: "Executive result",
        suggestedScale: "Recommended schedule",
        simulatedScale: "Simulated schedule",
        minimumHeadcount: "Minimum headcount",
        hoursPerEmployee: "Hours per employee",
        coverage: "Coverage",
        postsSummary: "{count} post(s)",
        shiftsSummary: "{count} shift(s)",
        selectedVsSuggested:
          "The selected schedule was {selected}, but the best-fit reading was {suggested}.",
        alternativeCompatible: "Compatible alternative",
        alternativeWarning: "Alternative with warning",
        adjustmentEyebrow: "Journey adjustment",
        adjustmentTitle: "Hours considered per employee",
        referenceSuggested: "Suggested reference: {value}",
        minusOneHour: "- 1h",
        plusOneHour: "+ 1h",
        applyAdjustment: "Apply adjustment",
        backToSuggested: "Back to suggested",
        calendarEyebrow: "Calendar",
        calendarTitle: "Schedule calendar",
        alertsEyebrow: "Alerts and notes",
        alertsTitle: "Alerts",
        observationsTitle: "Notes",
        noCriticalAlerts: "No critical alerts for the simulated scenario.",
        legalSummary: "Legal summary:",
        statusStandard: "Within standard",
        statusAlert: "Alert",
        statusIncompatible: "Incompatible",
        dayOff: "Off",
        deficitOf: "Deficit of {count}",
        hoursUnit: "h/month",
        weekdayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        hoursComparison: {
          standard:
            "The load follows the natural schedule reference. Reference: {reference}.",
          below_reference:
            "The informed hours are below the natural schedule reference. Reference: {reference}. Considered: {considered}.",
          above_reference:
            "The informed hours exceed the natural schedule reference. Reference: {reference}. Considered: {considered}.",
          incompatible:
            "The informed journey exceeds the configured schedule range. Reference: {reference}. Considered: {considered}.",
        },
        holidaySummary: {
          withCount: "{count} national holiday(s) in the selected period.",
          none: "No national holidays in the selected period.",
        },
        alertMessages: {
          hours_below_reference:
            "Hours below the reference increase the headcount needed to close the month.",
          hours_above_reference:
            "Hours above the reference may depend on compensation, overtime or collective adjustment.",
          hours_incompatible:
            "The informed hours exceed the natural capacity of the schedule or cycle.",
          operation_incompatible:
            "The informed operation type is not a good fit for this schedule.",
          coverage_manual_review:
            "Even with extra headcount, coverage still requires manual review.",
          sunday_control_required:
            "Sunday coverage with this schedule requires stricter weekly rest control.",
          high_monthly_hours:
            "The monthly reading reached a high hour range and requires journey validation.",
        },
        observationMessages: {
          low_compatibility_monitoring:
            "This combination of schedule and operation is possible, but demands closer monitoring.",
          minimum_headcount_expanded:
            "The minimum headcount was expanded by comparing considered hours with total operation hours.",
          additional_headcount_required:
            "The cycle distribution required extra staffing to cover all operated days.",
          holidays_discounted:
            "The month's holidays were discounted from the monthly reference and operated days.",
          holidays_maintained:
            "The month's holidays were kept inside the reference and coverage period.",
          continuous_holidays:
            "In this continuous schedule, holidays do not reduce the natural cycle reference.",
          hours_imbalance:
            "There is hour concentration across part of the team and the final distribution deserves review.",
        },
        legalMessages: {
          collective_policy_required:
            "Check whether a collective agreement or internal policy is required before implementation.",
          long_shift_formal_validation:
            "Long shifts require formal validation of journey, rest and actual team coverage.",
          weekly_rest_attention:
            "Weekly rest should be monitored closely to avoid imbalance in the cycle.",
          compensation_required:
            "Above the natural reference, feasibility may depend on valid compensation and collective instruments.",
        },
        legalProfiles: {
          "5x2":
            "Classic business-day schedule with low operational complexity.",
          "5x1":
            "Requires closer control of weekly rest and rotating days off.",
          "6x1":
            "Common schedule to cover Saturdays with rotating weekly days off.",
          "6x2": "Requires stronger coordination of shifts and team rotation.",
          "12x36":
            "Usually requires attention to collective agreements, internal policy and actual working hours.",
          "4x2":
            "Cyclical schedule with good fit for continuous operations, but with more sensitive rotation.",
          "12x60":
            "A more specific model, usually used with well-defined internal rules.",
          "24x48":
            "A more restrictive format, usually treated as an operational exception.",
        },
      },
    },
  },
  es: {
    common: {
      yes: "Sí",
      no: "No",
      copyright: "Todos los derechos reservados.",
    },
    nav_home: "Inicio",
    nav_calc: "Días Hábiles",
    nav_calculator: "Calculadora",
    nav_calendar: "Calendario",
    nav_scale: "Escalas",
    nav_blog: "Blog",
    nav_menu_label: "Abrir menú",
    theme_toggle: "Cambiar tema",
    hero_title:
      "Calcule días hábiles y organice escalas de trabajo con más precisión",
    hero_subtitle:
      "Consulte feriados nacionales oficiales de Brasil, cuente días hábiles entre fechas y simule cobertura operativa en un solo flujo.",
    hero_cta_calc: "Calcular Días Hábiles",
    hero_cta_cal: "Ver Calendario {year}",
    hero_cta_scale: "Simular Escala",
    faq_title: "Preguntas frecuentes",
    calc_title: "Calcular Días Hábiles",
    calc_start: "Fecha inicial",
    calc_end: "Fecha final",
    calc_intro_copy:
      "Indique el período para calcular días hábiles considerando solo feriados nacionales oficiales.",
    calc_business_days: "Días hábiles",
    calc_calendar_days: "Días corridos",
    calc_weekends: "Fines de semana",
    calc_holidays: "Feriados nacionales",
    calendar_title: "Calendario 2026",
    scale_title: "Simulador de Escalas de Trabajo",
    scale_page_subtitle:
      "Revise cobertura, dotación mínima y carga mensual sin perder la lectura del calendario.",
    scale_params_title: "Parámetros de la operación",
    scale_month: "Mes",
    scale_type: "Escala",
    scale_generate_btn: "Generar simulación",
    scale_result_title: "Resultado de la simulación",
    components: {
      header: {
        primaryNavLabel: "Navegación principal",
        mobileMenuLabel: "Menú móvil",
      },
      footer: {
        description:
          "Datas Uteis es una herramienta gratuita para calcular días hábiles, consultar feriados nacionales de Brasil y simular escalas de trabajo con una lectura operativa más objetiva.",
        tools: "Herramientas",
        content: "Contenido",
        contact: "Contacto",
        businessDays: "Días Hábiles",
        calculator: "Calculadora",
        calendar: "Calendario",
        schedule: "Simulador de Escalas",
        blog: "Blog",
        workingDays: "Qué son los días hábiles",
        cltScales: "Escalas en la CLT",
        privacy: "Política de Privacidad",
      },
      adSlot: {
        ariaLabel: "Espacio reservado para anuncios",
      },
      errorBoundary: {
        title: "Ocurrió un error inesperado.",
        reload: "Recargar página",
      },
      languageSwitcher: {
        ariaLabel: "Seleccionar idioma",
      },
    },
    pages: {
      home: {
        seoTitle: "Calcular Días Hábiles Online | Contador | Datas Úteis",
        seoDescription:
          "Calcule días hábiles entre fechas, consulte el calendario con feriados nacionales y use el simulador de escalas en una herramienta gratuita.",
        cards: [
          {
            title: "Días Hábiles",
            description:
              "Calcule días hábiles y corridos entre dos fechas con feriados nacionales ya considerados.",
          },
          {
            title: "Calendario",
            description:
              "Visualice el mes con feriados nacionales, fines de semana y días hábiles en lectura rápida.",
          },
          {
            title: "Escala",
            description:
              "Evalúe cobertura, dotación mínima, horas por colaborador y estado operativo de la escala.",
          },
        ],
        faqItems: [
          {
            question: "¿Qué es un día hábil?",
            answer:
              "Es el día considerado operativo para el cálculo de plazos, normalmente excluyendo sábados, domingos y feriados del período.",
          },
          {
            question: "¿El sábado entra en la cuenta?",
            answer:
              "En la lectura estándar de Datas Uteis, el sábado no cuenta como día hábil. En contextos específicos conviene revisar la regla aplicable.",
          },
          {
            question: "¿La calculadora considera feriados nacionales?",
            answer:
              "Sí. Los feriados nacionales se incluyen en el cálculo y también impactan el calendario y el simulador de escalas.",
          },
          {
            question: "¿La página de escala calcula la dotación mínima?",
            answer:
              "Sí. El simulador cruza turnos, cobertura, feriados, sábados, domingos y horas por colaborador para estimar la dotación mínima y el estado del escenario.",
          },
        ],
      },
      calculator: {
        seoTitle: "Calcular Días Hábiles Entre Fechas | Datas Úteis",
        seoDescription:
          "Calcule días hábiles entre fechas con feriados nacionales oficiales de Brasil incluidos en una herramienta online gratuita.",
        validationMissingDates: "Complete ambas fechas para continuar.",
        validationOrder:
          "La fecha inicial debe ser menor o igual que la fecha final.",
        calculate: "Calcular período",
        copy: "Copiar",
        downloadCsv: "Descargar CSV",
        csvFileName: "calculo-dias-habiles.csv",
        csvHeaders: [
          "Fecha Inicial",
          "Fecha Final",
          "Días Hábiles",
          "Días Totales",
          "Fines de Semana",
          "Feriados",
        ],
        guideTitle: "Qué entra en este cálculo",
        guideIntro:
          "El contador excluye fines de semana y feriados nacionales oficiales. Los puntos facultativos, como Carnaval y Corpus Christi, quedan fuera del conteo estándar.",
        guideItems: [
          "El período se cuenta desde la fecha inicial hasta la fecha final.",
          "Los sábados y domingos se excluyen automáticamente.",
          "Solo los feriados nacionales oficiales se descuentan del resultado.",
        ],
        relatedCalendar: "Ver calendario",
        relatedFifthDay: "Entender el quinto día hábil",
        relatedSchedule: "Abrir simulador de escalas",
      },
      calendar: {
        seoTitle: "Calendario de Feriados | Datas Úteis",
        seoDescription:
          "Visualice feriados nacionales, estatales y municipales, puntos facultativos, fines de semana y días hábiles en un calendario interactivo.",
        heroSubtitle:
          "Lea el mes con foco en feriados, fines de semana y días hábiles.",
        dayNames: ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"],
        holiday: "Feriado",
        optionalPoint: "Punto facultativo",
        weekend: "Fin de semana",
        businessDay: "Día hábil",
        holidayListTitle: "Feriados del mes seleccionado",
        previousMonth: "Mes anterior",
        nextMonth: "Mes siguiente",
      },
      blog: {
        seoTitle:
          "Blog Datas Úteis | Escalas, Días Hábiles y Rutinas de Trabajo",
        seoDescription:
          "Artículos sobre escalas de trabajo, días hábiles, adicional nocturno y rutinas CLT. Contenido práctico para trabajadores, empresas y RR. HH.",
        heroTitle: "Blog Datas Uteis",
        heroSubtitle:
          "Contenido directo sobre días hábiles, escalas de trabajo, adicional nocturno y decisiones operativas que impactan RR. HH., nómina y cobertura.",
        readArticle: "Leer artículo",
        relatedToolsTitle: "Herramientas relacionadas",
        businessDaysBetweenDates: "Días hábiles entre fechas",
        holidayCalendar: "Calendario con feriados",
        scheduleSimulator: "Simulador de escalas",
      },
      blogPost: {
        breadcrumb: "Miga de pan",
        faqTitle: "Preguntas frecuentes",
        relatedToolsTitle: "Herramientas relacionadas",
        relatedBusinessDays: "Días hábiles",
        relatedCalendar: "Calendario",
        relatedSchedule: "Escala",
        readAlso: "Leer también",
      },
      calculatorApp: {
        seoTitle:
          "Calculadora Online Gratis | Calculadora Simple Responsiva | Datas Úteis",
        seoDescription:
          "Calculadora online con modos simple, financiera, científica y de desarrollador en un layout rápido y responsivo.",
        heroTitle: "Calculadora Avanzada",
        heroSubtitle:
          "Calculadora con múltiples modos: Simple, Financiera, Desarrollador y Científica.",
        modesTitle: "Cuatro modos en una sola calculadora",
        modes: [
          { id: "simple", label: "Simple" },
          { id: "financial", label: "Financiera" },
          { id: "developer", label: "Desarrollador" },
          { id: "scientific", label: "Científica" },
        ],
        modeCards: [
          {
            id: "simple",
            label: "Simple",
            description:
              "Aritmética rápida para cuentas del día a día con el menor roce posible.",
          },
          {
            id: "financial",
            label: "Financiera",
            description:
              "Atajos rápidos para porcentajes y cálculos de propina o ajuste.",
          },
          {
            id: "developer",
            label: "Desarrollador",
            description:
              "Conversión entre bases y operaciones bitwise para uso técnico.",
          },
          {
            id: "scientific",
            label: "Científica",
            description:
              "Trigonometría, logaritmos, potencia, raíz y constantes en un solo panel.",
          },
        ],
        tip15: "Propina 15%",
        tip20: "Propina 20%",
      },
      notFound: {
        seoTitle: "Página no encontrada | Datas Úteis",
        seoDescription: "La página solicitada no fue encontrada.",
        title: "Página no encontrada",
        description: "Lo sentimos, la página que busca no existe o fue movida.",
        backHome: "Volver al inicio",
      },
      schedule: {
        seoTitle: "Simulador de Escalas de Trabajo | Datas Úteis",
        seoDescription:
          "Simule cobertura operativa, dotación mínima, horas por colaborador y calendario mensual para escalas 5x2, 6x1, 12x36, 4x2 y 24x48.",
        autoSuggested: "Sugerida automáticamente",
        simultaneousPosts: "Puestos simultáneos",
        operationStart: "Inicio de la operación",
        operationEnd: "Fin de la operación",
        shiftCount: "Cantidad de turnos",
        shiftOverlap: "Cruce de turnos",
        shiftStart: "Turno {index} inicio",
        shiftEnd: "Turno {index} fin",
        saturday: "Sábado",
        sunday: "Domingo",
        holidays: "Feriados",
        resultEyebrow: "Resultado ejecutivo",
        suggestedScale: "Escala recomendada",
        simulatedScale: "Escala simulada",
        minimumHeadcount: "Dotación mínima",
        hoursPerEmployee: "Horas por colaborador",
        coverage: "Cobertura",
        postsSummary: "{count} puesto(s)",
        shiftsSummary: "{count} turno(s)",
        selectedVsSuggested:
          "La escala elegida fue {selected}, pero la lectura de mayor adherencia fue {suggested}.",
        alternativeCompatible: "Alternativa compatible",
        alternativeWarning: "Alternativa con alerta",
        adjustmentEyebrow: "Ajuste de jornada",
        adjustmentTitle: "Horas por colaborador consideradas",
        referenceSuggested: "Referencia sugerida: {value}",
        minusOneHour: "- 1h",
        plusOneHour: "+ 1h",
        applyAdjustment: "Aplicar ajuste",
        backToSuggested: "Volver a la sugerida",
        calendarEyebrow: "Calendario",
        calendarTitle: "Calendario de la escala",
        alertsEyebrow: "Alertas y observaciones",
        alertsTitle: "Alertas",
        observationsTitle: "Observaciones",
        noCriticalAlerts: "Sin alertas críticas para el escenario simulado.",
        legalSummary: "Resumen legal:",
        statusStandard: "Dentro del estándar",
        statusAlert: "Alerta",
        statusIncompatible: "Incompatible",
        dayOff: "Descanso",
        deficitOf: "Déficit de {count}",
        hoursUnit: "h/mes",
        weekdayLabels: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
        hoursComparison: {
          standard:
            "La carga sigue la referencia natural de la escala. Referencia: {reference}.",
          below_reference:
            "Las horas informadas quedaron por debajo de la referencia natural de la escala. Referencia: {reference}. Considerado: {considered}.",
          above_reference:
            "Las horas informadas superaron la referencia natural de la escala. Referencia: {reference}. Considerado: {considered}.",
          incompatible:
            "La jornada informada excede el rango parametrizado de la escala. Referencia: {reference}. Considerado: {considered}.",
        },
        holidaySummary: {
          withCount:
            "{count} feriado(s) nacional(es) en el período seleccionado.",
          none: "Sin feriados nacionales en el período seleccionado.",
        },
        alertMessages: {
          hours_below_reference:
            "Horas por debajo de la referencia aumentan la necesidad de equipo para cerrar el mes.",
          hours_above_reference:
            "Horas por encima de la referencia pueden depender de compensación, horas extras o ajuste colectivo.",
          hours_incompatible:
            "Las horas informadas exceden la capacidad natural de la escala o del ciclo.",
          operation_incompatible:
            "El tipo de operación informado no es adherente a esta escala.",
          coverage_manual_review:
            "Aun con refuerzo de dotación, la cobertura todavía requiere revisión manual.",
          sunday_control_required:
            "La cobertura en domingos con esta escala exige un control más riguroso del descanso semanal.",
          high_monthly_hours:
            "La lectura mensual llegó a una franja alta de horas y requiere validación de la jornada real.",
        },
        observationMessages: {
          low_compatibility_monitoring:
            "La combinación entre escala y operación es posible, pero exige un monitoreo más atento.",
          minimum_headcount_expanded:
            "La dotación mínima se amplió al comparar las horas consideradas con las horas totales de la operación.",
          additional_headcount_required:
            "La distribución del ciclo pidió refuerzo adicional para cubrir todos los días operados.",
          holidays_discounted:
            "Los feriados del mes se descontaron de la referencia mensual y de los días operados.",
          holidays_maintained:
            "Los feriados del mes se mantuvieron dentro de la referencia y de la cobertura del período.",
          continuous_holidays:
            "En esta escala continua, los feriados no reducen la referencia natural del ciclo.",
          hours_imbalance:
            "Hay concentración de horas en parte del equipo y conviene revisar la distribución final.",
        },
        legalMessages: {
          collective_policy_required:
            "Verifique si existe exigencia de norma colectiva o política interna antes de la implantación.",
          long_shift_formal_validation:
            "Los turnos largos exigen validación formal de jornada, descanso y cobertura real del equipo.",
          weekly_rest_attention:
            "El descanso semanal debe acompañarse con atención para evitar desequilibrios en el ciclo.",
          compensation_required:
            "Por encima de la referencia natural, la viabilidad puede depender de una compensación válida e instrumento colectivo.",
        },
        legalProfiles: {
          "5x2":
            "Jornada clásica de días hábiles, con baja complejidad operativa.",
          "5x1":
            "Requiere un control más atento del descanso semanal y del día libre rotativo.",
          "6x1":
            "Escala común para cubrir sábados con descanso semanal rotativo.",
          "6x2":
            "Exige mayor coordinación de turnos y del descanso rotativo del equipo.",
          "12x36":
            "Normalmente requiere atención a convenio colectivo, política interna y jornada real.",
          "4x2":
            "Escala cíclica con buena adherencia a operación continua, pero con rotación más sensible.",
          "12x60":
            "Formato más específico, normalmente usado con reglas internas bien definidas.",
          "24x48":
            "Formato más restrictivo y normalmente tratado como excepción operativa.",
        },
      },
    },
  },
};

function getNestedValue(
  source: TranslationMap | TranslationValue,
  key: string
): TranslationValue | undefined {
  return key
    .split(".")
    .reduce<TranslationValue | undefined>((current, segment) => {
      if (!current || Array.isArray(current) || typeof current !== "object") {
        return undefined;
      }

      return (current as TranslationMap)[segment];
    }, source);
}

function interpolate(value: string, params?: TranslationParams) {
  if (!params) {
    return value;
  }

  return value.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ""));
}

export function translate(
  language: SupportedLanguage,
  key: string,
  params?: TranslationParams
) {
  const custom = getNestedValue(customTranslations[language], key);
  const customFallback = getNestedValue(customTranslations.pt, key);
  const resolved =
    typeof custom === "string"
      ? custom
      : typeof customFallback === "string"
        ? customFallback
        : key;

  return interpolate(resolved, params);
}

export function translateNode<T>(language: SupportedLanguage, key: string): T {
  const custom = getNestedValue(customTranslations[language], key);
  const customFallback = getNestedValue(customTranslations.pt, key);
  return (custom ?? customFallback) as T;
}

function parseDateInput(value: string | Date) {
  if (value instanceof Date) {
    return value;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  return new Date(value);
}

export function formatI18nDate(
  language: SupportedLanguage,
  value: string | Date,
  options?: Intl.DateTimeFormatOptions
) {
  return new Intl.DateTimeFormat(
    DATE_LOCALE_BY_LANGUAGE[language],
    options
  ).format(parseDateInput(value));
}

export function getDateLocale(language: SupportedLanguage) {
  return DATE_LOCALE_BY_LANGUAGE[language];
}
