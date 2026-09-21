import type { CSSProperties, FocusEvent } from "react";
import { useTheme } from "./ThemeContext";

export interface ThemeColors {
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  surfaceTrack: string;
  signalAccent: string;
  textPrimary: string;
  textSub: string;
  textMuted: string;
  inputBorder: string;
  inputActiveBorder: string;
  inputBase: CSSProperties;
  tagBg: string;
  tagColor: string;
}

export function useThemeColors(): ThemeColors {
  const { isDark } = useTheme();

  const textPrimary = isDark ? "#F8FAFC" : "#0B1D35";
  const inputBorder = isDark ? "rgba(255,255,255,0.10)" : "#DDE4EE";

  return {
    pageBg: isDark ? "#060E1A" : "#F8FAFC",
    cardBg: isDark ? "#0B1D35" : "#FFFFFF",
    cardBorder: isDark ? "rgba(255,255,255,0.07)" : "#E2E8F0",
    surfaceTrack: isDark ? "#071526" : "#F1F5F9",
    signalAccent: isDark ? "#38BDF8" : "#0055E5",
    textPrimary,
    textSub: isDark ? "rgba(248,250,252,0.60)" : "#4A6080",
    textMuted: isDark ? "rgba(248,250,252,0.38)" : "#64748B",
    inputBorder,
    inputActiveBorder: "#0055E5",
    tagBg: isDark ? "rgba(0,85,229,0.15)" : "#EFF4FF",
    tagColor: isDark ? "#7AABFF" : "#6B8CAE",
    inputBase: {
      width: "100%",
      background: isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC",
      border: `1px solid ${inputBorder}`,
      borderRadius: 9,
      padding: "11px 14px",
      fontSize: "0.9rem",
      color: textPrimary,
      outline: "none",
      transition: "border-color 150ms",
      fontFamily: "inherit",
    },
  };
}

export function inputFocusHandlers(colors: ThemeColors) {
  return {
    onFocus: (e: FocusEvent<HTMLElement>) => {
      e.currentTarget.style.borderColor = colors.inputActiveBorder;
    },
    onBlur: (e: FocusEvent<HTMLElement>) => {
      e.currentTarget.style.borderColor = colors.inputBorder;
    },
  };
}