import type { SupportedLanguage } from "@/lib/site";

export interface PageSectionNavItem {
  id: string;
  label: string;
}

const PAGE_SECTION_NAV_LABELS: Record<SupportedLanguage, PageSectionNavItem[]> = {
  pt: [
    { id: "ferramenta", label: "Ferramenta" },
    { id: "explicacao", label: "Explicação" },
    { id: "exemplos", label: "Exemplos" },
    { id: "faq", label: "FAQ" },
  ],
  en: [
    { id: "ferramenta", label: "Tool" },
    { id: "explicacao", label: "How it works" },
    { id: "exemplos", label: "Examples" },
    { id: "faq", label: "FAQ" },
  ],
  es: [
    { id: "ferramenta", label: "Herramienta" },
    { id: "explicacao", label: "Explicación" },
    { id: "exemplos", label: "Ejemplos" },
    { id: "faq", label: "FAQ" },
  ],
};

const BACK_TO_TOP_LABELS: Record<SupportedLanguage, string> = {
  pt: "Topo",
  en: "Top",
  es: "Inicio",
};

export function getToolPageNavItems(language: SupportedLanguage) {
  return PAGE_SECTION_NAV_LABELS[language] ?? PAGE_SECTION_NAV_LABELS.pt;
}

export function getBackToTopLabel(language: SupportedLanguage) {
  return BACK_TO_TOP_LABELS[language] ?? BACK_TO_TOP_LABELS.pt;
}
