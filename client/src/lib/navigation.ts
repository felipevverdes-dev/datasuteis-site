import type { SupportedLanguage } from "@/lib/site";
import { normalizeSitePath, SITE_URL } from "@/lib/site";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface HeaderNavigationLink {
  type: "link";
  id: string;
  label: string;
  href: string;
  match: (path: string) => boolean;
}

export interface HeaderNavigationDropdown {
  type: "dropdown";
  id: string;
  label: string;
  match: (path: string) => boolean;
  items: Array<{
    id: string;
    label: string;
    href: string;
  }>;
}

export type HeaderNavigationItem =
  | HeaderNavigationLink
  | HeaderNavigationDropdown;

interface NavigationLabels {
  home: string;
  simulators: string;
  businessDays: string;
  workSchedules: string;
  ageCalculator: string;
  calendar: string;
  blog: string;
  utilities: string;
  games: string;
  brainGames: string;
  about: string;
  contact: string;
  privacy: string;
  terms: string;
  breadcrumb: string;
  back: string;
  backAria: string;
  skipToMain: string;
  openNavigation: string;
  closeNavigation: string;
  toggleTheme: string;
  openDarkTheme: string;
  openLightTheme: string;
  navigationMenu: string;
  primaryNavigation: string;
  mobileNavigation: string;
  submenu: string;
}

const NAVIGATION_LABELS: Record<SupportedLanguage, NavigationLabels> = {
  pt: {
    home: "Início",
    simulators: "Simuladores",
    businessDays: "Dias Úteis",
    workSchedules: "Escalas de Trabalho",
    ageCalculator: "Calculadora de Idade",
    calendar: "Calendário",
    blog: "Blog",
    utilities: "Utilitários",
    games: "Jogos",
    brainGames: "Raciocínio",
    about: "Sobre",
    contact: "Contato",
    privacy: "Política de Privacidade",
    terms: "Termos de Uso",
    breadcrumb: "Breadcrumb",
    back: "Voltar",
    backAria: "Voltar à página anterior",
    skipToMain: "Pular para o conteúdo principal",
    openNavigation: "Abrir menu de navegação",
    closeNavigation: "Fechar menu de navegação",
    toggleTheme: "Alternar tema",
    openDarkTheme: "Alternar tema para modo escuro",
    openLightTheme: "Alternar tema para modo claro",
    navigationMenu: "Menu de navegação",
    primaryNavigation: "Navegação principal",
    mobileNavigation: "Menu mobile",
    submenu: "Submenu",
  },
  en: {
    home: "Home",
    simulators: "Simulators",
    businessDays: "Business Days",
    workSchedules: "Work Schedules",
    ageCalculator: "Age Calculator",
    calendar: "Calendar",
    blog: "Blog",
    utilities: "Utilities",
    games: "Games",
    brainGames: "Brain Games",
    about: "About",
    contact: "Contact",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    breadcrumb: "Breadcrumb",
    back: "Back",
    backAria: "Go back to previous page",
    skipToMain: "Skip to main content",
    openNavigation: "Open navigation menu",
    closeNavigation: "Close navigation menu",
    toggleTheme: "Switch theme",
    openDarkTheme: "Switch theme to dark mode",
    openLightTheme: "Switch theme to light mode",
    navigationMenu: "Navigation menu",
    primaryNavigation: "Primary navigation",
    mobileNavigation: "Mobile menu",
    submenu: "Submenu",
  },
  es: {
    home: "Inicio",
    simulators: "Simuladores",
    businessDays: "Días Hábiles",
    workSchedules: "Turnos de Trabajo",
    ageCalculator: "Calculadora de Edad",
    calendar: "Calendario",
    blog: "Blog",
    utilities: "Utilidades",
    games: "Juegos",
    brainGames: "Razonamiento",
    about: "Sobre",
    contact: "Contacto",
    privacy: "Política de Privacidad",
    terms: "Términos de Uso",
    breadcrumb: "Ruta de navegación",
    back: "Volver",
    backAria: "Volver a la página anterior",
    skipToMain: "Saltar al contenido principal",
    openNavigation: "Abrir menú de navegación",
    closeNavigation: "Cerrar menú de navegación",
    toggleTheme: "Cambiar tema",
    openDarkTheme: "Cambiar tema a modo oscuro",
    openLightTheme: "Cambiar tema a modo claro",
    navigationMenu: "Menú de navegación",
    primaryNavigation: "Navegación principal",
    mobileNavigation: "Menú móvil",
    submenu: "Submenú",
  },
};

function startsWithAny(path: string, prefixes: string[]) {
  return prefixes.some(prefix => path.startsWith(prefix));
}

export function getNavigationLabels(language: SupportedLanguage) {
  return NAVIGATION_LABELS[language] ?? NAVIGATION_LABELS.pt;
}

export function getHeaderNavigation(language: SupportedLanguage) {
  const labels = getNavigationLabels(language);

  return [
    {
      type: "link",
      id: "calendar",
      label: labels.calendar,
      href: "/calendario/",
      match: path => path.startsWith("/calendario/"),
    },
    {
      type: "dropdown",
      id: "simulators",
      label: labels.simulators,
      match: path =>
        startsWithAny(path, [
          "/calcular/",
          "/escala/",
          "/idade/",
          "/dias-uteis/",
          "/quinto-dia-util/",
        ]),
      items: [
        {
          id: "business-days",
          label: labels.businessDays,
          href: "/calcular/",
        },
        {
          id: "work-schedules",
          label: labels.workSchedules,
          href: "/escala/",
        },
        {
          id: "age-calculator",
          label: labels.ageCalculator,
          href: "/idade/",
        },
      ],
    },
    {
      type: "dropdown",
      id: "games",
      label: labels.games,
      match: path => path.startsWith("/jogos/"),
      items: [
        {
          id: "brain-games",
          label: labels.brainGames,
          href: "/jogos/",
        },
      ],
    },
    {
      type: "link",
      id: "utilities",
      label: labels.utilities,
      href: "/utilitarios/",
      match: path =>
        startsWithAny(path, ["/utilitarios/", "/calculadora/"]),
    },
    {
      type: "link",
      id: "blog",
      label: labels.blog,
      href: "/blog/",
      match: path => path.startsWith("/blog/"),
    },
    {
      type: "link",
      id: "about",
      label: labels.about,
      href: "/sobre/",
      match: path =>
        startsWithAny(path, ["/sobre/", "/contato/", "/privacidade/", "/termos/"]),
    },
  ] satisfies HeaderNavigationItem[];
}

function resolveBreadcrumbSchemaHref(
  item: BreadcrumbItem,
  index: number,
  items: BreadcrumbItem[],
  currentPath?: string
) {
  if (item.href) {
    return normalizeSitePath(item.href);
  }

  if (index !== items.length - 1) {
    return null;
  }

  if (currentPath) {
    return normalizeSitePath(currentPath);
  }

  if (typeof window !== "undefined") {
    return normalizeSitePath(window.location.pathname);
  }

  return null;
}

export function buildBreadcrumbSchema(
  items: BreadcrumbItem[],
  currentPath?: string
) {
  const schemaItems = items.flatMap((item, index) => {
    const href = resolveBreadcrumbSchemaHref(item, index, items, currentPath);

    if (!href) {
      return [];
    }

    return [{ label: item.label, href }];
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: schemaItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}
