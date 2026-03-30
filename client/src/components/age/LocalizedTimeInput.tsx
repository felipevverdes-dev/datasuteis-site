import { useEffect, useMemo, useRef, useState } from "react";
import { Clock3, X } from "lucide-react";
import {
  formatLocalizedTimeInputValue,
  getLocalizedTimeInputPattern,
  getLocalizedTimePlaceholder,
  maskLocalizedTimeInput,
  parseLocalizedTimeInput,
} from "@/lib/date-utils";

interface LocalizedTimeInputProps {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  onValidityChange?: (isValid: boolean) => void;
  placeholderLabel: string;
  pickerLabel?: string;
  hourLabel?: string;
  minuteLabel?: string;
  applyLabel?: string;
  closeLabel?: string;
  autoComplete?: string;
  disabled?: boolean;
}

function getTimeParts(value: string) {
  const parsedValue = parseLocalizedTimeInput(value);
  if (!parsedValue) {
    return { hour: "08", minute: "00" };
  }

  const [hour, minute] = parsedValue.split(":");
  return { hour, minute };
}

export default function LocalizedTimeInput({
  label,
  value,
  onChange,
  onValidityChange,
  placeholderLabel,
  pickerLabel,
  hourLabel = "Hora",
  minuteLabel = "Minuto",
  applyLabel = "Aplicar",
  closeLabel = "Fechar",
  autoComplete,
  disabled,
}: LocalizedTimeInputProps) {
  const [displayValue, setDisplayValue] = useState(() =>
    formatLocalizedTimeInputValue(value)
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { hour: initialHour, minute: initialMinute } = getTimeParts(value);
  const [draftHour, setDraftHour] = useState(initialHour);
  const [draftMinute, setDraftMinute] = useState(initialMinute);

  useEffect(() => {
    setDisplayValue(formatLocalizedTimeInputValue(value));
    const nextParts = getTimeParts(value);
    setDraftHour(nextParts.hour);
    setDraftMinute(nextParts.minute);
  }, [value]);

  useEffect(() => {
    if (!panelOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setPanelOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPanelOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [panelOpen]);

  const hourOptions = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0")),
    []
  );
  const minuteOptions = useMemo(
    () =>
      Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0")),
    []
  );

  function handleChange(rawValue: string) {
    const maskedValue = maskLocalizedTimeInput(rawValue);
    setDisplayValue(maskedValue);

    if (!maskedValue) {
      onValidityChange?.(false);
      onChange("");
      return;
    }

    const parsedValue = parseLocalizedTimeInput(maskedValue);
    if (!parsedValue) {
      onValidityChange?.(false);
      return;
    }

    const [hour, minute] = parsedValue.split(":");
    setDraftHour(hour);
    setDraftMinute(minute);
    onValidityChange?.(true);
    onChange(parsedValue);
  }

  function handleBlur() {
    const parsedValue = parseLocalizedTimeInput(displayValue);
    if (!displayValue) {
      onValidityChange?.(false);
      return;
    }

    if (parsedValue) {
      onValidityChange?.(true);
      return;
    }

    setDisplayValue(formatLocalizedTimeInputValue(value));
    onValidityChange?.(Boolean(value));
  }

  function applyPanelValue() {
    const nextValue = `${draftHour}:${draftMinute}`;
    onValidityChange?.(true);
    onChange(nextValue);
    setDisplayValue(nextValue);
    setPanelOpen(false);
  }

  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold">{label}</span>
      <div ref={containerRef} className="localized-picker-field">
        <input
          type="text"
          inputMode="numeric"
          autoComplete={autoComplete}
          value={displayValue}
          onChange={event => handleChange(event.target.value)}
          onBlur={handleBlur}
          placeholder={getLocalizedTimePlaceholder()}
          aria-label={`${label} (${placeholderLabel})`}
          className="input-base localized-picker-input w-full"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => setPanelOpen(current => !current)}
          className="localized-picker-button"
          aria-label={pickerLabel ?? `${label}: abrir seletor de hora`}
          title={pickerLabel ?? `${label}: abrir seletor de hora`}
          disabled={disabled}
        >
          <Clock3 className="h-4 w-4" />
        </button>

        {panelOpen ? (
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-4 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{label}</p>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label={closeLabel}
                title={closeLabel}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {hourLabel}
                </span>
                <select
                  value={draftHour}
                  onChange={event => setDraftHour(event.target.value)}
                  className="input-base w-full"
                >
                  {hourOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {minuteLabel}
                </span>
                <select
                  value={draftMinute}
                  onChange={event => setDraftMinute(event.target.value)}
                  className="input-base w-full"
                >
                  {minuteOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="button"
              onClick={applyPanelValue}
              className="btn-primary mt-4 w-full"
            >
              {applyLabel}
            </button>
          </div>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        {getLocalizedTimeInputPattern()}
      </p>
    </label>
  );
}
