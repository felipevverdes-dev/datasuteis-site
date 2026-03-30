import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import {
  formatLocalizedDateInputValue,
  getLocalizedDateInputPattern,
  getLocalizedDatePlaceholder,
  maskLocalizedDateInput,
  parseLocalizedDateInput,
} from "@/lib/date-utils";
import type { SupportedLanguage } from "@/lib/site";

interface LocalizedDateInputProps {
  label: string;
  language: SupportedLanguage;
  value: string;
  onChange: (nextValue: string) => void;
  onValidityChange?: (isValid: boolean) => void;
  placeholderLabel: string;
  max?: string;
  min?: string;
  autoComplete?: string;
  disabled?: boolean;
}

export default function LocalizedDateInput({
  label,
  language,
  value,
  onChange,
  onValidityChange,
  placeholderLabel,
  max,
  min,
  autoComplete,
  disabled,
}: LocalizedDateInputProps) {
  const [displayValue, setDisplayValue] = useState(() =>
    formatLocalizedDateInputValue(value, language)
  );
  const pickerRef = useRef<HTMLInputElement | null>(null);
  const pickerAriaLabel =
    language === "en"
      ? `${label}: open calendar`
      : language === "es"
        ? `${label}: abrir calendario`
        : `${label}: abrir calendário`;

  useEffect(() => {
    setDisplayValue(formatLocalizedDateInputValue(value, language));
  }, [language, value]);

  function handleChange(rawValue: string) {
    const maskedValue = maskLocalizedDateInput(rawValue, language);
    setDisplayValue(maskedValue);

    if (!maskedValue) {
      onValidityChange?.(false);
      onChange("");
      return;
    }

    const parsedIsoValue = parseLocalizedDateInput(maskedValue, language);
    if (!parsedIsoValue) {
      onValidityChange?.(false);
      return;
    }

    if (min && parsedIsoValue < min) {
      onValidityChange?.(false);
      return;
    }

    if (max && parsedIsoValue > max) {
      onValidityChange?.(false);
      return;
    }

    onValidityChange?.(true);
    onChange(parsedIsoValue);
  }

  function handleBlur() {
    const parsedIsoValue = parseLocalizedDateInput(displayValue, language);
    if (!displayValue) {
      onValidityChange?.(false);
      return;
    }

    if (parsedIsoValue) {
      onValidityChange?.(true);
      return;
    }

    setDisplayValue(formatLocalizedDateInputValue(value, language));
    onValidityChange?.(Boolean(value));
  }

  function openPicker() {
    const input = pickerRef.current;
    if (!input || disabled) {
      return;
    }

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  }

  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold">{label}</span>
      <div className="localized-picker-field">
        <input
          type="text"
          inputMode="numeric"
          autoComplete={autoComplete}
          value={displayValue}
          onChange={event => handleChange(event.target.value)}
          onBlur={handleBlur}
          placeholder={getLocalizedDatePlaceholder(language)}
          aria-label={`${label} (${placeholderLabel})`}
          className="input-base localized-picker-input w-full"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={openPicker}
          className="localized-picker-button"
          aria-label={pickerAriaLabel}
          title={pickerAriaLabel}
          disabled={disabled}
        >
          <CalendarDays className="h-4 w-4" />
        </button>
        <input
          ref={pickerRef}
          type="date"
          value={value}
          onChange={event => {
            onValidityChange?.(Boolean(event.target.value));
            onChange(event.target.value);
          }}
          min={min}
          max={max}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          className="localized-native-picker"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {getLocalizedDateInputPattern(language)}
      </p>
    </label>
  );
}
