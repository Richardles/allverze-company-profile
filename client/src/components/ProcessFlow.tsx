import { useTheme } from "../theme/ThemeContext";
import { useThemeColors } from "../theme/useThemeColors";

export interface ProcessStep {
  num: string;
  title: string;
  desc: string;
}

interface ProcessFlowProps {
  steps: ProcessStep[];
  variant?: "grid" | "editorial";
}

export default function ProcessFlow({ steps, variant = "grid" }: ProcessFlowProps) {
  const { isDark } = useTheme();
  const colors = useThemeColors();

  if (variant === "editorial") {
    return (
      <div className="flex flex-col">
        {steps.map((s, i) => (
          <div key={s.num} className="flex gap-4">
            <div className="flex flex-col items-center self-stretch">
              <div
                className="tnum"
                style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: isDark ? "rgba(0,85,229,0.10)" : "rgba(0,85,229,0.08)",
                  color: isDark ? "#38BDF8" : "#0055E5",
                  fontSize: "0.72rem", fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {s.num}
              </div>
              {i < steps.length - 1 && (
                <div
                  style={{
                    width: 1,
                    flex: 1,
                    marginTop: 8,
                    minHeight: 16,
                    background: isDark ? "rgba(56,189,248,0.18)" : "rgba(0,85,229,0.14)",
                  }}
                />
              )}
            </div>
            <div className="pb-8 last:pb-0 flex flex-col gap-1">
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: colors.textPrimary, letterSpacing: "-0.01em" }}>
                {s.title}
              </div>
              <p style={{ fontSize: "0.875rem", color: colors.textSub, lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {steps.map((step, i) => (
        <div
          key={step.num}
          className="card-hover flex flex-col gap-4"
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 14,
            padding: "28px 24px",
            boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.25)" : "0 1px 4px rgba(0,0,0,0.04)",
            position: "relative",
          }}
        >
          {i < steps.length - 1 && (
            <div className="hidden lg:block absolute" style={{ top: 33, right: -18, width: 16, height: 16, zIndex: 2 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke={colors.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          <div className="tnum" style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.06em", color: "#0055E5", background: isDark ? "rgba(0,85,229,0.14)" : "rgba(0,85,229,0.08)", borderRadius: 6, padding: "4px 10px", alignSelf: "flex-start" }}>
            {step.num}
          </div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.textPrimary, letterSpacing: "-0.01em" }}>
            {step.title}
          </h3>
          <p style={{ fontSize: "0.855rem", color: colors.textSub, lineHeight: 1.7 }}>
            {step.desc}
          </p>
        </div>
      ))}
    </div>
  );
}