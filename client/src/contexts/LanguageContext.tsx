import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  applyDocumentLanguage,
  readStoredLanguage,
  type SupportedLanguage,
  writeStoredLanguage,
} from "@/lib/site";
import { formatI18nDate, getDateLocale, translate, translateNode, type TranslationParams } from "@/lib/i18n";

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  dateLocale: string;
  t: (key: string, params?: TranslationParams) => string;
  tm: <T>(key: string) => T;
  formatDate: (value: string | Date, options?: Intl.DateTimeFormatOptions) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>(() => readStoredLanguage());

  useEffect(() => {
    applyDocumentLanguage(language);
    writeStoredLanguage(language);
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    dateLocale: getDateLocale(language),
    t: (key, params) => translate(language, key, params),
    tm: (key) => translateNode(language, key),
    formatDate: (value, options) => formatI18nDate(language, value, options),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

export const useI18n = useLanguage;
