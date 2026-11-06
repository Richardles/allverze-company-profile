import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { usePrefersReducedMotion } from "../lib/browser";
import { useTheme } from "../theme/ThemeContext";
import { useThemeColors } from "../theme/useThemeColors";

const PANEL_GAP = 8;
const PANEL_MAX = 288;
const PANEL_FLOOR = 120;
const TYPE_AHEAD_MS = 500;

const EASE = "cubic-bezier(0.22,1,0.36,1)";

type Placement = "bottom" | "top";

export interface SelectFieldProps {
  labelId: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}

/**
 * Branded select-only combobox (W3C APG pattern).
 *
 * Deliberately generic — it owns no domain data, so any future select
 * (budget band, timeline, role) can drop straight in. Theme comes from the
 * palette hook, not props, so consumers pass only data.
 *
 * The panel flips above the trigger when the space below cannot fit it and
 * the space above is larger, then caps its height to whatever room remains and
 * scrolls — so it never runs off a short viewport.
 */
export default function SelectField({
  labelId,
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
}: SelectFieldProps) {
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const reducedMotion = usePrefersReducedMotion();
  const listboxId = useId();

  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [placement, setPlacement] = useState<Placement>("bottom");
  const [maxHeight, setMaxHeight] = useState(PANEL_MAX);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const typeBufRef = useRef({ text: "", at: 0 });

  const selectedIndex = value ? options.indexOf(value) : -1;
  const interactive = !disabled && options.length > 0;

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    setActiveIndex(-1);
    if (refocus) triggerRef.current?.focus();
  }, []);

  const openPanel = useCallback(
    (index?: number) => {
      if (!interactive) return;
      const start = index ?? selectedIndex;
      setActiveIndex(start >= 0 ? start : 0);
      setOpen(true);
    },
    [interactive, selectedIndex]
  );

  const commit = useCallback(
    (index: number) => {
      const option = options[index];
      if (option === undefined) return;
      onChange(option);
      close(true);
    },
    [close, onChange, options]
  );

  const move = useCallback(
    (delta: number) => {
      const len = options.length;
      if (len === 0) return;
      setActiveIndex((prev) => {
        const base = prev >= 0 ? prev : selectedIndex >= 0 ? selectedIndex : 0;
        return (base + delta + len) % len;
      });
    },
    [options.length, selectedIndex]
  );

  useLayoutEffect(() => {
    if (!open) return;

    const measure = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const below = window.innerHeight - rect.bottom - PANEL_GAP;
      const above = rect.top - PANEL_GAP;
      const needed = panelRef.current?.scrollHeight ?? 0;

      const next: Placement = below < needed && above > below ? "top" : "bottom";
      setPlacement(next);
      setMaxHeight(Math.max(PANEL_FLOOR, Math.min(PANEL_MAX, next === "bottom" ? below : above)));
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) close(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [close, open]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (open) move(1);
        else openPanel();
        return;
      case "ArrowUp":
        event.preventDefault();
        if (open) move(-1);
        else openPanel(options.length - 1);
        return;
      case "Home":
        if (!open) return;
        event.preventDefault();
        setActiveIndex(0);
        return;
      case "End":
        if (!open) return;
        event.preventDefault();
        setActiveIndex(options.length - 1);
        return;
      case "Escape":
        if (!open) return;
        event.preventDefault();
        close(false);
        return;
      case "Tab":
        if (open) close(false);
        return;
      default:
        break;
    }

    if (event.key.length !== 1 || event.metaKey || event.ctrlKey || event.altKey) return;

    const buf = typeBufRef.current;
    const now = Date.now();
    buf.text = now - buf.at > TYPE_AHEAD_MS ? event.key : buf.text + event.key;
    buf.at = now;

    const query = buf.text.toLowerCase();
    const found = options.findIndex((option) => option.toLowerCase().startsWith(query));
    if (found < 0) return;
    if (!open) openPanel(found);
    else setActiveIndex(found);
  };

  const active = open || focused;

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={labelId}
        aria-activedescendant={open && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={() => (open ? close(true) : openPanel())}
        onKeyDown={onTriggerKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...colors.inputBase,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          textAlign: "left",
          cursor: interactive ? "pointer" : disabled ? "not-allowed" : "default",
          opacity: disabled ? 0.55 : 1,
          borderColor: active ? colors.inputActiveBorder : colors.inputBorder,
          boxShadow: active ? "0 0 0 3px rgba(0,85,229,0.16)" : "none",
          transition: reducedMotion ? "none" : "border-color 150ms, box-shadow 150ms",
        }}
      >
        <span
          style={{
            color: selectedIndex >= 0 ? colors.textPrimary : colors.textMuted,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selectedIndex >= 0 ? value : placeholder}
        </span>
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            color: active ? colors.signalAccent : colors.textMuted,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: reducedMotion ? "none" : `transform 200ms ${EASE}, color 150ms`,
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        ref={panelRef}
        id={listboxId}
        role="listbox"
        aria-labelledby={labelId}
        aria-hidden={!open}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          zIndex: 40,
          padding: "4px 0",
          maxHeight,
          overflowY: "auto",
          overscrollBehavior: "contain",
          background: colors.cardBg,
          border: `1px solid ${active ? colors.inputActiveBorder : colors.cardBorder}`,
          borderRadius: 10,
          boxShadow: isDark
            ? "0 20px 48px rgba(0,0,0,0.58), 0 2px 8px rgba(0,0,0,0.4)"
            : "0 20px 48px rgba(11,29,53,0.16), 0 2px 8px rgba(11,29,53,0.08)",
          opacity: open ? 1 : 0,
          transform: open
            ? "translateY(0) scale(1)"
            : placement === "bottom"
              ? "translateY(-6px) scale(0.985)"
              : "translateY(6px) scale(0.985)",
          transformOrigin: placement === "bottom" ? "top center" : "bottom center",
          pointerEvents: open ? "auto" : "none",
          transition: reducedMotion
            ? "none"
            : `opacity 150ms ${EASE}, transform 150ms ${EASE}, border-color 150ms`,
          ...(placement === "bottom"
            ? { top: `calc(100% + ${PANEL_GAP}px)` }
            : { bottom: `calc(100% + ${PANEL_GAP}px)` }),
        }}
      >
        {options.map((option, index) => {
          const isSelected = option === value;
          const isActive = open && index === activeIndex;
          return (
            <div
              key={option}
              id={`${listboxId}-opt-${index}`}
              role="option"
              aria-selected={isSelected}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => commit(index)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 10,
                minHeight: 42,
                padding: "10px 14px",
                fontSize: "0.9rem",
                cursor: "pointer",
                background: isSelected
                  ? isDark
                    ? "rgba(0,85,229,0.20)"
                    : "rgba(0,85,229,0.07)"
                  : isActive
                    ? isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(11,29,53,0.04)"
                    : "transparent",
                color: isSelected ? colors.textPrimary : colors.textSub,
                fontWeight: isSelected ? 600 : 400,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 7,
                  bottom: 7,
                  width: 2,
                  borderRadius: 2,
                  background: colors.signalAccent,
                  opacity: isSelected || isActive ? 1 : 0,
                  transition: reducedMotion ? "none" : `opacity 120ms ${EASE}`,
                }}
              />
              <span style={{ flex: 1 }}>{option}</span>
              {isSelected && (
                <svg
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0, color: colors.signalAccent }}
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
