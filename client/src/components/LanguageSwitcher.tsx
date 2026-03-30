import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/contexts/LanguageContext";
import { LANGUAGE_OPTIONS } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  ariaLabel?: string;
}

const FLAG_ICON_PATH_BY_LANGUAGE = {
  pt: "/assets/flags/br.svg",
  en: "/assets/flags/us.svg",
  es: "/assets/flags/es.svg",
} as const;

export default function LanguageSwitcher({
  className,
  ariaLabel,
}: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useI18n();
  const label = ariaLabel ?? t("components.languageSwitcher.ariaLabel");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption =
    LANGUAGE_OPTIONS.find(o => o.value === language) || LANGUAGE_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex shrink-0", className)}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/90 px-2 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur transition-colors hover:bg-secondary sm:px-3 sm:py-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={activeOption.label}
        aria-label={label}
      >
        <img
          src={
            FLAG_ICON_PATH_BY_LANGUAGE[
              activeOption.value as keyof typeof FLAG_ICON_PATH_BY_LANGUAGE
            ]
          }
          alt=""
          aria-hidden="true"
          width={16}
          height={12}
          className="language-flag"
          decoding="async"
        />
        <span>{activeOption.shortLabel}</span>
        <ChevronDown
          className={cn(
            "ml-0.5 h-3.5 w-3.5 transition-transform duration-200",
            isOpen ? "rotate-180" : ""
          )}
        />
      </button>

      <div
        className={cn(
          "absolute right-0 top-full z-50 mt-2 min-w-[140px] origin-top-right overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-xl transition-all duration-200",
          isOpen
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        )}
        role="menu"
      >
        <div className="flex flex-col gap-0.5">
          {LANGUAGE_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              role="menuitem"
              onClick={() => {
                setLanguage(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                language === option.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              aria-pressed={language === option.value}
              aria-label={`${label}: ${option.label}`}
              title={option.label}
            >
              <img
                src={
                  FLAG_ICON_PATH_BY_LANGUAGE[
                    option.value as keyof typeof FLAG_ICON_PATH_BY_LANGUAGE
                  ]
                }
                alt=""
                aria-hidden="true"
                width={16}
                height={12}
                className="language-flag shrink-0"
                decoding="async"
              />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
