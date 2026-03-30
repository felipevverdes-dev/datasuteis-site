import { useI18n } from "@/contexts/LanguageContext";

const COPY = {
  pt: "",
  en: "This game is available only in Portuguese at the moment.",
  es: "Este juego está disponible solo en portugués por el momento.",
} as const;

export default function GameLanguageNotice() {
  const { language } = useI18n();
  const message = COPY[language] ?? "";

  if (!message) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
      {message}
    </div>
  );
}
