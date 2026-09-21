import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";
import { useThemeColors } from "../theme/useThemeColors";
import { openContactForm, openServiceModule } from "../lib/contactNav";
import { WHATSAPP_URL } from "../config";
import ProcessFlow from "../components/ProcessFlow";

const modules = [
  {
    tag: "01 — Engineering",
    title: "Custom Software Engineering",
    sub: "Web Applications · APIs · Enterprise Systems",
    desc: "We design and build the software your business runs on — workflow tools, integrations, internal systems, multi-tenant platforms. Clean code, real tests, and a codebase that stays maintainable long after handover.",
    bullets: [
      "Scalable web applications built with React and TypeScript",
      "RESTful and GraphQL API development with OpenAPI standards",
      "Microservices architecture on Kubernetes and serverless platforms",
      "CI/CD pipelines with automated quality gates and staged, safe deploys",
    ],
    dark: false,
  },
  {
    tag: "02 — Mobile",
    title: "Mobile Application Development",
    sub: "iOS · Android · Cross-Platform",
    desc: "iOS and Android apps that feel native on every device — from a first version to something used by thousands. Built for real-world networks and held to a careful standard of UX.",
    bullets: [
      "Native iOS (Swift) and Android (Kotlin) development",
      "Cross-platform builds with React Native and Expo",
      "Apps built for real networks, with offline sync when connectivity drops",
      "App Store and Google Play submission and full lifecycle management",
    ],
    dark: true,
  },
  {
    tag: "03 — Observability",
    title: "Application Performance Monitoring",
    sub: "Real-Time Metrics · Distributed Tracing · Alerting",
    desc: "We set up metrics, logs, and traceability so problems surface before your customers notice — with alerts that reach the right people and the context to respond fast.",
    bullets: [
      "Full-stack observability: metrics, logs, and distributed tracing",
      "Custom real-time dashboards with performance KPIs",
      "Alerting with escalation policies and on-call integration",
      "Anomaly detection and incident response playbooks",
    ],
    dark: false,
  },
  {
    tag: "04 — Quality Assurance",
    title: "Performance & Automation Testing",
    sub: "Load Testing · Test Automation · CI Integration",
    desc: "Automated tests and load checks built into your pipeline, so regressions surface early and launches stay predictable. 'It works' means it's actually been verified.",
    bullets: [
      "End-to-end test automation with Playwright and Cypress",
      "Load and stress testing with k6, JMeter, and Gatling",
      "Performance benchmarking and regression tracking over releases",
      "CI/CD integrated quality gates with automated reporting",
    ],
    dark: true,
  },
];

const steps = [
  { num: "01", title: "Discovery & Audit",       desc: "We map your current state — systems, gaps, risks, and opportunities — before a single line of code is written." },
  { num: "02", title: "Solution Architecture",    desc: "We design the right solution, not the most expensive one. Every blueprint ties back to the outcome you want." },
  { num: "03", title: "Execution & Hardening",    desc: "We build, test, and secure in visible stages — with demos along the way and staged, careful deploys." },
  { num: "04", title: "Continuous Optimization",  desc: "After go-live we monitor, iterate, and improve — because Better Every Day doesn't stop at launch." },
];

const roleOptions: { label: string; to: number[] | null }[] = [
  { label: "Starting something new",   to: [0, 1] },
  { label: "Scaling what works",       to: [2, 3] },
  { label: "Internal systems & integrations", to: [0] },
  { label: "Platform at scale",        to: [2, 3] },
  { label: "Long-term partner",        to: [0, 1, 2, 3] },
  { label: "Not sure yet",             to: null },
];

export default function Services() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const [activeModule, setActiveModule] = useState(-1);
  const [activeRole, setActiveRole] = useState<number | null>(null);
  const [navStuck, setNavStuck] = useState(false);
  const bannerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const sections = modules
      .map((_, i) => document.getElementById(`module-${i + 1}`))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = sections.indexOf(entry.target as HTMLElement);
            setActiveModule(idx);
          }
        }
      },
      { rootMargin: "0px 0px -62% 0px", threshold: 0 },
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setNavStuck(!entry.isIntersecting);
        }
      },
      { threshold: 0 },
    );
    io.observe(banner);
    return () => io.disconnect();
  }, []);

  return (
    <main style={{ paddingTop: 72 }}>
      {/* ── HEADER BANNER ─────────────────────────────────────── */}
      <section ref={bannerRef} style={{ background: "#0B1D35", paddingTop: 88, paddingBottom: 88 }} className="px-6 lg:px-12 relative overflow-hidden">
        <div aria-hidden="true" className="crown-glow" />
        <div className="absolute inset-0 pointer-events-none dot-grid dot-grid--fade" style={{ opacity: 0.5 }} />
        <div className="max-w-7xl mx-auto relative">
          <p className="font-bold tracking-[0.14em] uppercase mb-5 fade-in-up" style={{ fontSize: "0.6875rem", color: "#38BDF8" }}>
            What We Build
          </p>
          <h1
            className="fade-in-up fade-in-up-1"
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
              fontWeight: 800,
              color: "#F8FAFC",
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              maxWidth: 700,
            }}
          >
            Software work we're{" "}
            <span style={{ color: "#38BDF8" }}>glad to put our name on.</span>
          </h1>
          <p className="fade-in-up fade-in-up-2" style={{ marginTop: 20, fontSize: "1.0625rem", color: "rgba(248,250,252,0.58)", lineHeight: 1.75, maxWidth: 520 }}>
            Four areas of focus, one team behind them — scoped honestly, built in visible stages, and supported after launch.
          </p>
        </div>
      </section>

      {/* ── SERVICE QUICK-NAV (fixed overlay, appears after banner) ─ */}
      <div
        inert={!navStuck}
        className="fixed left-0 right-0 z-40 px-6 lg:px-12"
        style={{
          top: 72,
          background: isDark ? "rgba(6,14,26,0.82)" : "rgba(255,255,255,0.86)",
          WebkitBackdropFilter: "blur(14px) saturate(1.3)",
          backdropFilter: "blur(14px) saturate(1.3)",
          borderTop: `1px solid ${isDark ? "rgba(0,85,229,0.14)" : "rgba(11,29,53,0.08)"}`,
          borderBottom: `1px solid ${isDark ? "rgba(0,85,229,0.14)" : "rgba(11,29,53,0.08)"}`,
          transform: navStuck ? "translateY(0)" : "translateY(-100%)",
          opacity: navStuck ? 1 : 0,
          pointerEvents: navStuck ? "auto" : "none",
          transition: "transform 220ms var(--ease-premium), opacity 220ms ease, border-color 150ms ease",
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 py-3">
          {modules.map((m, i) => (
            <button
              key={i}
              type="button"
              onClick={() => openServiceModule(navigate, i)}
              className="tnum transition-all duration-150 active:scale-[0.97]"
              style={
                activeModule === i
                  ? {
                      fontSize: "0.75rem", fontWeight: 600,
                      color: "#FFFFFF",
                      background: "#0055E5",
                      border: "1px solid #0055E5",
                      borderRadius: 6,
                      padding: "5px 12px",
                      boxShadow: "0 2px 8px rgba(0,85,229,0.28)",
                      whiteSpace: "nowrap",
                    }
                  : {
                      fontSize: "0.75rem", fontWeight: 600,
                      color: isDark ? "rgba(248,250,252,0.55)" : "#4A6080",
                      background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)"}`,
                      borderRadius: 6,
                      padding: "5px 12px",
                      cursor: "pointer",
                      transition: "background 150ms, color 150ms, border-color 150ms",
                      whiteSpace: "nowrap",
                    }
              }
            >
              {m.tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── ALTERNATING MODULES ───────────────────────────────── */}
      {modules.map((mod, i) => {
        const sectionBg = mod.dark
          ? "#0B1D35"
          : colors.pageBg;
        const modText   = mod.dark ? "#F8FAFC" : colors.textPrimary;
        const modSub    = mod.dark ? "rgba(248,250,252,0.55)" : colors.textSub;
        const modAccent = mod.dark ? "#38BDF8" : "#0055E5";
        const modTagSub = mod.dark ? "rgba(248,250,252,0.38)" : colors.textMuted;
        const panelBg   = mod.dark ? "#0E2344" : (isDark ? colors.cardBg : "#EFF4FF");
        const panelBorder = mod.dark
          ? "1px solid rgba(56,189,248,0.14)"
          : `1px solid ${isDark ? "rgba(0,85,229,0.18)" : "rgba(0,85,229,0.12)"}`;
        const lit = activeRole !== null && roleOptions[activeRole]?.to?.includes(i);

        return (
          <section
            key={mod.tag}
            id={`module-${i + 1}`}
            style={{
              background: sectionBg,
              paddingTop: 88,
              paddingBottom: 88,
              borderTop: mod.dark
                ? "1px solid rgba(0,85,229,0.12)"
                : `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#E9EEF5"}`,
            }}
            className="px-6 lg:px-12 scroll-mt-24"
          >
            <div className="max-w-7xl mx-auto">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${i % 2 === 1 ? "lg:grid-flow-dense" : ""}`}>
                {/* Visual pane */}
                <div className={i % 2 === 1 ? "lg:col-start-2" : ""}>
                  <div
                    className={`module-pane card-hover${lit ? " module-pane--lit" : ""}`}
                    style={{
                      borderRadius: 18,
                      overflow: "hidden",
                      background: panelBg,
                      border: panelBorder,
                      height: 320,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      padding: "32px",
                      position: "relative",
                    }}
                  >
                    {/* Corner bracket accent */}
                    <div className="pane-bracket-l" style={{ position: "absolute", top: 20, left: 20, width: 32, height: 3, borderRadius: 2, background: modAccent }} />
                    <div className="pane-bracket-l" style={{ position: "absolute", top: 20, left: 20, width: 3, height: 32, borderRadius: 2, background: modAccent }} />
                    <div className="pane-bracket-s" style={{ position: "absolute", bottom: 20, right: 20, width: 28, height: 2, borderRadius: 2, background: modAccent }} />
                    <div className="pane-bracket-s" style={{ position: "absolute", bottom: 20, right: 20, width: 2, height: 28, borderRadius: 2, background: modAccent }} />

                    {/* Index badge */}
                    <div style={{ alignSelf: "flex-end" }}>
                      <span
                        style={{
                          fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.12em",
                          color: modAccent, background: mod.dark ? "rgba(56,189,248,0.10)" : "rgba(0,85,229,0.10)",
                          border: `1px solid ${mod.dark ? "rgba(56,189,248,0.22)" : "rgba(0,85,229,0.18)"}`,
                          borderRadius: 5, padding: "4px 10px",
                        }}
                      >
                        {mod.tag}
                      </span>
                    </div>

                    {/* Tech stack chips */}
                    <div className="flex flex-wrap gap-2 relative z-10">
                      {[mod.sub.split(" · ")[0], mod.sub.split(" · ")[1], mod.sub.split(" · ")[2]].filter(Boolean).map((chip) => (
                        <span
                          key={chip}
                          style={{
                            fontSize: "0.7rem", fontWeight: 600,
                            color: mod.dark ? "rgba(248,250,252,0.55)" : (isDark ? "rgba(248,250,252,0.60)" : "#4A6080"),
                            background: mod.dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                            border: `1px solid ${mod.dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)"}`,
                            borderRadius: 5, padding: "3px 9px",
                          }}
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`reveal flex flex-col gap-5 ${i % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}`}>
                  <div>
                    <p style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: modAccent, marginBottom: 4 }}>
                      {mod.tag}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: modTagSub }}>
                      {mod.sub}
                    </p>
                  </div>

                  <h2 style={{ fontSize: "clamp(1.65rem, 2.8vw, 2.15rem)", fontWeight: 700, color: modText, letterSpacing: "-0.02em", lineHeight: 1.22 }}>
                    {mod.title}
                  </h2>

                  <p style={{ fontSize: "0.9375rem", color: modSub, lineHeight: 1.75 }}>
                    {mod.desc}
                  </p>

                  <ul className="flex flex-col gap-2.5 mt-1">
                    {mod.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={modAccent} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 3 }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span style={{ fontSize: "0.875rem", color: mod.dark ? "rgba(248,250,252,0.62)" : (isDark ? "rgba(248,250,252,0.70)" : "#334155"), lineHeight: 1.65 }}>
                          {b}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => openContactForm(navigate)}
                    className="self-start text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                    style={{ background: "#0055E5", borderRadius: 9, padding: "10px 22px", marginTop: 4, boxShadow: "0 2px 10px rgba(0,85,229,0.22)" }}
                  >
                    Discuss This Capability
                  </button>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ── WHO'S IT FOR (role selector) ─────────────────────── */}
      <section
        style={{
          background: "#0B1D35",
          borderTop: "1px solid rgba(0,85,229,0.12)",
          paddingTop: 88,
          paddingBottom: 88,
        }}
        className="px-6 lg:px-12 relative overflow-hidden"
      >
        <div aria-hidden="true" className="rim-glow-r" />
        <div className="max-w-7xl mx-auto relative reveal">
          <div className="max-w-2xl mb-12">
            <p className="font-bold tracking-[0.14em] uppercase mb-3" style={{ fontSize: "0.6875rem", color: "#38BDF8" }}>
              Who's It For
            </p>
            <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.4rem)", fontWeight: 700, color: "#F8FAFC", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Where are you today?
            </h2>
            <p style={{ marginTop: 10, fontSize: "0.9375rem", color: "rgba(248,250,252,0.55)", lineHeight: 1.7 }}>
              Pick what fits — we'll light up the work that matches and hand you a place to start. Honest maps, not sales funnels.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {roleOptions.map((opt, ri) => {
              const active = activeRole === ri;
              return (
                <button
                  key={opt.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    if (opt.to === null) {
                      setActiveRole(null);
                      openContactForm(navigate);
                      return;
                    }
                    setActiveRole(ri);
                    openServiceModule(navigate, opt.to[0]);
                  }}
                  className="transition-all duration-150 active:scale-[0.97]"
                  style={
                    active
                      ? {
                          fontSize: "0.8125rem", fontWeight: 600,
                          color: "#FFFFFF",
                          background: "#0055E5",
                          border: "1px solid #0055E5",
                          borderRadius: 8,
                          padding: "9px 16px",
                          boxShadow: "0 2px 12px rgba(0,85,229,0.30)",
                        }
                      : {
                          fontSize: "0.8125rem", fontWeight: 600,
                          color: "rgba(248,250,252,0.75)",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 8,
                          padding: "9px 16px",
                          cursor: "pointer",
                          transition: "background 150ms, color 150ms, border-color 150ms",
                        }
                  }
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {activeRole !== null && (() => {
            const targets = roleOptions[activeRole]?.to ?? [];
            return (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-6">
                <span style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#38BDF8" }}>
                  Pointing you at
                </span>
                <span style={{ fontSize: "0.875rem", color: "rgba(248,250,252,0.60)" }}>
                  {targets.map((t) => modules[t].title).join(" · ")}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveRole(null)}
                  className="text-sm underline underline-offset-2 transition-opacity hover:opacity-70"
                  style={{ color: "rgba(248,250,252,0.45)" }}
                >
                  Clear
                </button>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── A TO Z WORKFLOW ───────────────────────────────────── */}
      <section
        style={{
          background: colors.pageBg,
          paddingTop: 96,
          paddingBottom: 96,
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#E9EEF5"}`,
        }}
        className="px-6 lg:px-12"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 max-w-xl reveal">
            <p className="font-bold tracking-[0.14em] uppercase mb-3" style={{ fontSize: "0.6875rem", color: "#0055E5" }}>
              How We Work
            </p>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.5rem)", fontWeight: 700, color: colors.textPrimary, letterSpacing: "-0.022em" }}>
              The A to Z Workflow
            </h2>
            <p style={{ marginTop: 10, fontSize: "0.9375rem", color: colors.textSub, lineHeight: 1.7 }}>
              The same four phases on every engagement — so you always know where we are and what comes next.
            </p>
          </div>

          <ProcessFlow steps={steps} variant="grid" />
        </div>
      </section>

      {/* ── CTA CLOSING BANNER ────────────────────────────────── */}
      <section
        style={{ background: "#0B1D35", borderTop: "1px solid rgba(0,85,229,0.14)", paddingTop: 88, paddingBottom: 88 }}
        className="px-6 lg:px-12"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10">
          <div className="max-w-xl reveal">
            <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 700, color: "#F8FAFC", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Want to talk it through first?
            </h2>
            <p style={{ marginTop: 10, fontSize: "0.9375rem", color: "rgba(248,250,252,0.50)", lineHeight: 1.7 }}>
              A direct conversation with the people who'd actually do the work. Tell us where you're stuck — you'll leave with a clear next step.
            </p>
          </div>
          <div className="reveal flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <button
              onClick={() => openContactForm(navigate)}
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90"
              style={{ background: "#0055E5", borderRadius: 9, padding: "12px 24px", boxShadow: "0 2px 12px rgba(0,85,229,0.30)", whiteSpace: "nowrap" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Email us
            </button>
            <button
              onClick={() => window.open(WHATSAPP_URL, "_blank", "noopener")}
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-150"
              style={{ border: "1px solid rgba(248,250,252,0.20)", borderRadius: 9, padding: "12px 24px", color: "rgba(248,250,252,0.80)", whiteSpace: "nowrap" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp Chat
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}