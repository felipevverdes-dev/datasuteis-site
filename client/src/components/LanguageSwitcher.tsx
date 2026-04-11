import { useEffect, useId, useRef, useState } from "react";
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
  const optionsId = useId();
  const radioGroupName = useId();

  const activeOption =
    LANGUAGE_OPTIONS.find(o => o.value === language) || LANGUAGE_OPTIONS[0];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

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
  }, [isOpen]);

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
        aria-controls={optionsId}
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
        id={optionsId}
        hidden={!isOpen}
        className="absolute right-0 top-full z-50 mt-2 min-w-[140px] origin-top-right overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-xl"
      >
        <fieldset
          className="flex min-w-[140px] flex-col gap-0.5 border-0 p-0"
          aria-label={label}
        >
          {LANGUAGE_OPTIONS.map(option => (
            <label
              key={option.value}
              className={cn(
                "inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                language === option.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              title={option.label}
            >
              <input
                type="radio"
                name={radioGroupName}
                value={option.value}
                checked={language === option.value}
                onChange={() => {
                  setLanguage(option.value);
                  setIsOpen(false);
                }}
                className="sr-only"
              />
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
            </label>
          ))}
        </fieldset>
      </div>
    </div>
  );
}
