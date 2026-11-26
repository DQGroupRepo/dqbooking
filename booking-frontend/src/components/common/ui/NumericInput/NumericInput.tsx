import { useEffect, useState, type InputHTMLAttributes, type ChangeEvent, type FocusEvent } from "react";

export type NumericInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Keeps the native numeric keyboard on touch devices without showing spinner controls. */
  decimal?: boolean;
};

/**
 * Text-backed numeric input. It intentionally keeps an editable draft while focused so
 * users can clear an existing value before typing its replacement. The parent remains
 * responsible for parsing and validating the committed value.
 */
export default function NumericInput({
  value, defaultValue, onChange, onBlur, onFocus, decimal, inputMode, step, min, max, ...props
}: NumericInputProps) {
  const externalValue = value ?? defaultValue ?? "";
  const [draft, setDraft] = useState(String(externalValue));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(String(value ?? defaultValue ?? ""));
  }, [value, defaultValue, focused]);

  const validateRange = (input: HTMLInputElement, rawValue: string) => {
    if (!rawValue.trim()) {
      input.setCustomValidity("");
      return;
    }
    const numericValue = Number(rawValue);
    const minimum = min === undefined ? undefined : Number(min);
    const maximum = max === undefined ? undefined : Number(max);
    const belowMinimum = minimum !== undefined && Number.isFinite(minimum) && numericValue < minimum;
    const aboveMaximum = maximum !== undefined && Number.isFinite(maximum) && numericValue > maximum;
    input.setCustomValidity(belowMinimum ? `Enter a value of at least ${minimum}.` : aboveMaximum ? `Enter a value no greater than ${maximum}.` : "");
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    // Permit an empty draft, digits, and an optional decimal point/minus sign.
    const allowDecimal = decimal ?? (step !== undefined && Number(step) > 0 && Number(step) < 1);
    const pattern = allowDecimal ? /^-?\d*(?:\.\d*)?$/ : /^-?\d*$/;
    if (!pattern.test(next)) return;
    setDraft(next);
    validateRange(event.target, next);
    onChange?.(event);
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    setDraft(String(value ?? defaultValue ?? ""));
    validateRange(event.target, event.target.value);
    onBlur?.(event);
  };

  return (
    <input
      {...props}
      type="text"
      inputMode={inputMode ?? ((decimal ?? (step !== undefined && Number(step) > 0 && Number(step) < 1)) ? "decimal" : "numeric")}
      step={step}
      min={min}
      max={max}
      value={focused ? draft : String(externalValue)}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      autoComplete="off"
    />
  );
}
