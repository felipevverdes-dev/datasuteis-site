import { useI18n } from "@/contexts/LanguageContext";
import { getNavigationLabels } from "@/lib/navigation";

export default function SkipNavigation() {
  const { language } = useI18n();
  const labels = getNavigationLabels(language);

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
    >
      {labels.skipToMain}
    </a>
  );
}
