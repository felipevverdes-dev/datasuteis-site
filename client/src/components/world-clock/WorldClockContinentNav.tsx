import { useRef, type KeyboardEvent } from "react";
import {
  CONTINENT_ORDER,
  type Continent,
} from "@/lib/world-clock-countries";
import { getWorldClockPageCopy } from "@/lib/world-clock-copy";
import type { SupportedLanguage } from "@/lib/site";

interface WorldClockContinentNavProps {
  language: SupportedLanguage;
  activeContinent: Continent;
  onChange: (continent: Continent) => void;
}

export default function WorldClockContinentNav({
  language,
  activeContinent,
  onChange,
}: WorldClockContinentNavProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const labels = getWorldClockPageCopy(language).continents;

  function focusAndSelect(index: number) {
    const continent = CONTINENT_ORDER[index];
    if (!continent) {
      return;
    }

    buttonRefs.current[index]?.focus();
    onChange(continent);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusAndSelect((index + 1) % CONTINENT_ORDER.length);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusAndSelect(
          (index - 1 + CONTINENT_ORDER.length) % CONTINENT_ORDER.length
        );
        break;
      case "Home":
        event.preventDefault();
        focusAndSelect(0);
        break;
      case "End":
        event.preventDefault();
        focusAndSelect(CONTINENT_ORDER.length - 1);
        break;
      default:
        break;
    }
  }

  return (
    <div
      className="flex gap-1.5 overflow-x-auto pb-1"
      role="tablist"
      aria-label={getWorldClockPageCopy(language).continentNavLabel}
    >
      {CONTINENT_ORDER.map((continent, index) => (
        <button
          key={continent}
          ref={element => {
            buttonRefs.current[index] = element;
          }}
          id={`continent-tab-${continent}`}
          type="button"
          role="tab"
          aria-selected={activeContinent === continent}
          aria-controls="world-clock-country-grid"
          tabIndex={activeContinent === continent ? 0 : -1}
          className={`inline-flex min-h-9 items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeContinent === continent
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
          onClick={() => onChange(continent)}
          onKeyDown={event => handleKeyDown(event, index)}
        >
          {labels[continent]}
        </button>
      ))}
    </div>
  );
}
