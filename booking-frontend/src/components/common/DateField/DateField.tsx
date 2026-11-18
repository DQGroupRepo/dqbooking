import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaCalendarAlt } from "react-icons/fa";
import "./DateField.css";

export interface DateFieldProps {
  id?: string;
  value: string;
  onChange?: (value: string) => void;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

const parseDate = (value?: string): Date | undefined => {
  if (!value) return undefined;
  const parts = value.slice(0, 10).split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return undefined;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const displayDate = (value: string): string => {
  const date = parseDate(value);
  return date ? `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}` : "";
};

export default function DateField({
  id, value, onChange, minDate, maxDate, disabled = false, readOnly = false,
  placeholder = "dd-mm-yyyy", className = "", ariaLabel
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({ visibility: "hidden" });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const selectedDate = parseDate(value);

  useLayoutEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const trigger = triggerRef.current;
      const popup = popoverRef.current;
      if (!trigger || !popup) return;
      const rect = trigger.getBoundingClientRect();
      const margin = 12;
      const width = Math.min(360, window.innerWidth - margin * 2);
      const left = Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin));
      const popupHeight = popup.getBoundingClientRect().height || 410;
      const below = rect.bottom + 6;
      const top = below + popupHeight <= window.innerHeight - margin
        ? below
        : Math.max(margin, rect.top - popupHeight - 6);
      setPopoverStyle({ position: "fixed", top, left, width, visibility: "visible" });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !rootRef.current?.contains(target) && !popoverRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const calendarPopup = open && !disabled && !readOnly ? createPortal(
    <div ref={popoverRef} className="date-field__popover" role="dialog" aria-label="Choose date" style={popoverStyle}>
      <Calendar
        value={selectedDate || null}
        minDate={parseDate(minDate)}
        maxDate={parseDate(maxDate)}
        locale="en-GB"
        onChange={(nextValue) => {
          if (nextValue instanceof Date) {
            onChange?.(toDateKey(nextValue));
            setOpen(false);
          }
        }}
      />
      {value && <button type="button" className="date-field__clear" onClick={() => { onChange?.(""); setOpen(false); }}>Clear date</button>}
    </div>,
    document.body
  ) : null;

  return (
    <div className={`date-field ${className}`} ref={rootRef}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className="date-field__trigger"
        disabled={disabled || readOnly}
        aria-label={ariaLabel || placeholder}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(current => !current)}
      >
        <span className={value ? "date-field__value" : "date-field__placeholder"}>
          {value ? displayDate(value) : placeholder}
        </span>
        <FaCalendarAlt aria-hidden="true" />
      </button>
      {calendarPopup}
    </div>
  );
}
