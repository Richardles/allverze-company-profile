import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";
import { useThemeColors } from "../theme/useThemeColors";
import OrbitalRing from "../components/OrbitalRing";
import ShieldIcon from "../components/ShieldIcon";

const capabilities = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    tag: "Engineering",
    title: "Custom Software Engineering",
    desc: "Production-grade web applications and enterprise systems built on clean architecture, rigorous testing, and long-term maintainability.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" />
      </svg>
    ),
    tag: "Mobile",
    title: "Mobile Application Development",
    desc: "High-performance iOS and Android applications with pixel-perfect UX, offline-first architecture, and seamless API integration.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    tag: "Observability",
    title: "Application Performance Monitoring",
    desc: "End-to-end visibility into application health with real-time metrics, distributed tracing, and intelligent alerting before issues reach your users.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    tag: "Quality Assurance",
    title: "Performance & Automation Testing",
    desc: "Comprehensive test automation frameworks and load testing strategies that validate benchmarks and integrate into your CI/CD pipeline.",
  },
];

const trustItems = [
  "99.9% Platform Reliability",
  "Cross-Platform Mobile Apps",
  "Real-Time APM Dashboards",
  "Automated QA Pipelines",
  "Enterprise-Grade Security",
  "NDA Available On Request",
  "End-to-End Test Automation",
  "24 / 7 Engineering Support",
];

const metrics = [
  { stat: "50+",      label: "Projects Delivered",   sub: "Web, mobile & cloud"        },
  { stat: "< 10 days", label: "Average Onboarding",  sub: "From signed agreement"       },
  { stat: "99.9%",    label: "SLA Maintained",        sub: "Across all production systems"},
  { stat: "0",        label: "Scope Creep Incidents", sub: "Engineering discipline"      },
];

const testimonials = [
  {
    quote: "Allverze delivered our entire platform in under 14 weeks. Their engineering discipline and post-launch support are unlike any vendor relationship we've had. They treated our problems as their own.",
    name: "Lina K.",
    role: "VP of Engineering",
    company: "SaaS Startup",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&auto=format&q=80",
  },
  {
    quote: "The APM system they implemented transformed how we respond to incidents. What used to take hours now resolves in minutes. The visibility we gained is invaluable to our operations team.",
    name: "Jason M.",
    role: "CTO",
    company: "Financial Services Firm",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format&q=80",
  },
  {
    quote: "What sets Allverze apart is their integrity. They told us when our initial architecture was wrong — and saved us six months of rework. That kind of honesty is rare in any vendor relationship.",
    name: "Siti A.",
    role: "CEO",
    company: "Enterprise Platform",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&auto=format&q=80",
  },
];

const trustAvatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop&auto=format&q=80",
];

const philosophyStats = [
  {
    stat: "A to Z",
    label: "Full-Spectrum Coverage",
    icon: "◎",
  },
  {
    stat: "99.9%",
    label: "Platform Reliability SLA",
    icon: "◈",
  },
  {
    stat: "Zero",
    label: "Scope Creep. Ever.",
    icon: "◇",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const colors = useThemeColors();

  const tagBg = colors.tagBg;
  const tagColor = colors.tagColor;

  return (
    <main>
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section
        style={{ minHeight: "100vh", paddingTop: 72, background: "#0B1D35" }}
        className="relative overflow-hidden flex items-center"
      >
        {/* Layered ambient gradients */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(160deg, rgba(0,85,229,0.10) 0%, transparent 55%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 70% 50%, rgba(56,189,248,0.06) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none dot-grid" style={{ opacity: 0.45 }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            {/* Eyebrow */}
            <span
              className="inline-flex items-center gap-2 self-start text-xs font-bold tracking-[0.14em] uppercase fade-in-up"
              style={{
                color: "#38BDF8",
                background: "rgba(56,189,248,0.10)",
                border: "1px solid rgba(56,189,248,0.22)",
                borderRadius: 6,
                padding: "5px 12px",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#38BDF8", flexShrink: 0, display: "inline-block" }} />
              Technology Solutions Partner
            </span>

            <h1
              className="fade-in-up fade-in-up-1"
              style={{
                fontSize: "clamp(2.6rem, 5vw, 3.9rem)",
                fontWeight: 800,
                lineHeight: 1.07,
                letterSpacing: "-0.028em",
                color: "#F8FAFC",
              }}
            >
              Technology that moves{" "}
              <span className="hero-gradient">your business</span>{" "}
              forward.
            </h1>

            {/* Tagline lockup */}
            <div className="flex items-center gap-3 fade-in-up fade-in-up-2">
              <span className="h-px w-10 shrink-0" style={{ background: "rgba(248,250,252,0.18)" }} />
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  color: "rgba(248,250,252,0.48)",
                }}
              >
                Connecting Possibilities
              </span>
            </div>

            <p className="fade-in-up fade-in-up-3" style={{ fontSize: "1.0625rem", lineHeight: 1.78, color: "rgba(248,250,252,0.62)", maxWidth: 520 }}>
              Allverze delivers end-to-end technology solutions — custom software, mobile applications, performance monitoring, and quality engineering — with the discipline and integrity modern business demands.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-1 fade-in-up fade-in-up-4">
              <button
                onClick={() => navigate("/services")}
                className="group cta-glow inline-flex items-center gap-2 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "#0055E5",
                  borderRadius: 9,
                  padding: "12px 24px",
                  boxShadow: "var(--glow-base, 0 0 0 0 rgba(0,85,229,0), 0 2px 16px rgba(0,85,229,0.38))",
                }}
              >
                Explore Services
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="transition-transform duration-200 group-hover:translate-x-0.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-150 hover:bg-white/5"
                style={{
                  color: "rgba(248,250,252,0.80)",
                  border: "1px solid rgba(248,250,252,0.18)",
                  borderRadius: 9,
                  padding: "12px 24px",
                }}
              >
                Start the Conversation
              </button>
            </div>

            {/* Slogan divider (brand) */}
            <div className="flex items-center gap-3 pt-1 fade-in-up fade-in-up-4">
              <div className="h-px flex-1" style={{ background: "rgba(248,250,252,0.08)", maxWidth: 40 }} />
              <span style={{ fontSize: "0.78rem", color: "rgba(248,250,252,0.38)", fontStyle: "italic" }}>
                We Solve — Not Just Sell &nbsp;&middot;&nbsp; Better Every Day
              </span>
            </div>

            {/* Social proof row */}
            <div className="flex items-center gap-4 pt-2 fade-in-up fade-in-up-5">
              <div className="flex -space-x-2">
                {trustAvatars.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid rgba(11,29,53,0.9)", objectFit: "cover" }}
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill="#FBBF24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize: "0.72rem", color: "rgba(248,250,252,0.40)", marginTop: 1 }}>Trusted by growing teams · 100% confidential</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="orbital-float" style={{ maxWidth: "min(420px, 82vw)", width: "100%" }}>
              <OrbitalRing size={420} variant="constellation" speed="majestic" />
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST TICKER ──────────────────────────────────────── */}
      <div
        className="overflow-hidden py-4 select-none"
        style={{
          background: "#071526",
          borderTop: "1px solid rgba(0,85,229,0.16)",
          borderBottom: "1px solid rgba(0,85,229,0.16)",
        }}
      >
        <div className="ticker-track">
          {[...trustItems, ...trustItems].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-8">
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#38BDF8", flexShrink: 0, display: "inline-block" }} />
              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "rgba(248,250,252,0.55)", whiteSpace: "nowrap", letterSpacing: "0.02em" }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── IMPACT METRICS ────────────────────────────────────── */}
      <section
        style={{
          background: isDark ? "#060F1C" : "#FFFFFF",
          borderBottom: `1px solid ${isDark ? "rgba(0,85,229,0.10)" : "rgba(11,29,53,0.08)"}`,
          paddingTop: "clamp(4rem, 7vw, 6rem)",
          paddingBottom: "clamp(4rem, 7vw, 6rem)",
        }}
        className="px-6 lg:px-12"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12 reveal">
            <p className="font-bold tracking-[0.14em] uppercase mb-3" style={{ fontSize: "0.6875rem", color: "#0055E5" }}>
              Impact
            </p>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)", fontWeight: 700, color: colors.textPrimary, letterSpacing: "-0.022em", lineHeight: 1.15 }}>
              Proof, not promises.
            </h2>
            <p style={{ fontSize: "0.95rem", color: colors.textMuted, marginTop: 14 }}>
              Four commitments, measured daily — every number is a promise we stand behind.
            </p>
          </div>
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: isDark ? "#0B1D35" : "#FFFFFF",
              border: `1px solid ${isDark ? "rgba(248,250,252,0.08)" : "#E2E8F0"}`,
              boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.04) inset" : "0 1px 2px rgba(11,29,53,0.04)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background: isDark
                  ? "radial-gradient(ellipse 70% 95% at 50% 0%, rgba(56,189,248,0.14), transparent 65%)"
                  : "radial-gradient(ellipse 70% 95% at 50% 0%, rgba(0,85,229,0.07), transparent 65%)",
              }}
            />
            <div className="relative grid grid-cols-2 lg:flex gap-y-8">
              {metrics.map((m, i) => (
                <Fragment key={m.stat}>
                  {i > 0 && (
                    <div
                      aria-hidden
                      className="hidden lg:block self-center h-12 w-px shrink-0"
                      style={{ background: isDark ? "rgba(248,250,252,0.12)" : "#E2E8F0" }}
                    />
                  )}
                  <div
                    className="reveal flex flex-col items-center justify-center text-center gap-1.5 lg:flex-1"
                    data-reveal-delay={`${i * 70}`}
                    style={{ padding: "clamp(2rem, 3.5vw, 2.6rem) 1rem" }}
                  >
                    <span
                      className={isDark ? "stat-gradient" : "stat-gradient-light"}
                      style={{
                        fontSize: "clamp(2rem, 4vw, 2.8rem)",
                        fontWeight: 800,
                        letterSpacing: "-0.04em",
                        lineHeight: 1.15,
                      }}
                    >
                      {m.stat}
                    </span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: isDark ? "#F8FAFC" : "#0B1D35", marginTop: 4 }}>{m.label}</span>
                    <span style={{ fontSize: "0.75rem", color: isDark ? "rgba(248,250,252,0.35)" : "#64748B" }}>{m.sub}</span>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE CAPABILITIES ─────────────────────────────────── */}
      <section style={{ background: colors.pageBg, paddingTop: 100, paddingBottom: 100 }} className="px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14 max-w-xl reveal">
            <p className="font-bold tracking-[0.14em] uppercase mb-3" style={{ fontSize: "0.6875rem", color: "#0055E5" }}>
              What We Do
            </p>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)", fontWeight: 700, color: colors.textPrimary, letterSpacing: "-0.022em", lineHeight: 1.15 }}>
              Capability built for real{" "}
              <span style={{ color: "#0055E5" }}>business momentum</span>
            </h2>
            <p style={{ marginTop: 12, fontSize: "0.9375rem", color: colors.textSub, lineHeight: 1.7 }}>
              End-to-end technology solutions built on precision engineering, not promises.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {capabilities.map((cap, i) => (
              <div
                key={cap.title}
                className="card-hover group reveal flex flex-col gap-5"
                data-reveal-delay={`${i * 70}`}
                style={{
                  background: colors.cardBg,
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: 14,
                  padding: "32px 32px",
                  boxShadow: isDark
                    ? "0 1px 4px rgba(0,0,0,0.30), 0 4px 20px rgba(0,0,0,0.18)"
                    : "0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)",
                  cursor: "default",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Subtle top-left glow accent */}
                <div
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{
                    width: 120, height: 120,
                    background: "radial-gradient(circle at 0% 0%, rgba(0,85,229,0.10) 0%, transparent 70%)",
                    borderRadius: "0 0 120px 0",
                  }}
                />
                <div className="flex items-start justify-between relative">
                  <div
                    style={{
                      width: 48, height: 48, borderRadius: 11,
                      background: "linear-gradient(135deg, rgba(0,85,229,0.14) 0%, rgba(56,189,248,0.08) 100%)",
                      color: "#0055E5",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                    className="transition-transform duration-200 group-hover:scale-105"
                  >
                    {cap.icon}
                  </div>
                  <span
                    style={{
                      fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.12em",
                      textTransform: "uppercase", color: tagColor, background: tagBg,
                      borderRadius: 5, padding: "3px 10px",
                    }}
                  >
                    {cap.tag}
                  </span>
                </div>

                <div className="relative">
                  <h3 style={{ fontSize: "1.075rem", fontWeight: 700, color: colors.textPrimary, marginBottom: 8, letterSpacing: "-0.012em" }}>
                    {cap.title}
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: colors.textSub, lineHeight: 1.72 }}>
                    {cap.desc}
                  </p>
                </div>

                <button
                  onClick={() => navigate("/services")}
                  className="relative self-start flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all duration-200"
                  style={{ color: "#0055E5" }}
                >
                  Learn more
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section
        style={{
          background: "#071526",
          borderTop: "1px solid rgba(0,85,229,0.12)",
          borderBottom: "1px solid rgba(0,85,229,0.12)",
          paddingTop: 96,
          paddingBottom: 96,
        }}
        className="px-6 lg:px-12"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-14 reveal flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="font-bold tracking-[0.14em] uppercase mb-3" style={{ fontSize: "0.6875rem", color: "#38BDF8" }}>
                Client Outcomes
              </p>
              <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.5rem)", fontWeight: 700, color: "#F8FAFC", letterSpacing: "-0.022em", lineHeight: 1.15 }}>
                What our clients say
              </h2>
            </div>
            <button
              onClick={() => navigate("/contact")}
              className="self-start sm:self-auto flex-shrink-0 text-sm font-semibold transition-all hover:opacity-80"
              style={{ color: "#38BDF8", display: "flex", alignItems: "center", gap: 6 }}
            >
              Start your engagement
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="card-hover reveal flex flex-col gap-5"
                data-reveal-delay={`${i * 70}`}
                style={{
                  background: "#0B1D35",
                  border: "1px solid rgba(56,189,248,0.12)",
                  borderRadius: 16,
                  padding: "32px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative quote mark */}
                <div
                  className="absolute top-4 right-5 pointer-events-none"
                  style={{
                    fontSize: "5rem", fontWeight: 800, lineHeight: 1,
                    color: "rgba(56,189,248,0.07)",
                    fontFamily: "Georgia, serif",
                    userSelect: "none",
                  }}
                >
                  "
                </div>

                {/* Stars */}
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="#FBBF24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>

                <p style={{ fontSize: "0.9rem", color: "rgba(248,250,252,0.68)", lineHeight: 1.78, flex: 1 }}>
                  "{t.quote}"
                </p>

                <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <img
                    src={t.photo}
                    alt={t.name}
                    loading="lazy"
                    style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(56,189,248,0.25)", flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F8FAFC" }}>{t.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(248,250,252,0.40)" }}>{t.role}, {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHILOSOPHY BANNER ─────────────────────────────────── */}
      <section
        style={{
          background: "#0B1D35",
          paddingTop: 100,
          paddingBottom: 100,
        }}
        className="px-6 lg:px-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 80% at 100% 50%, rgba(56,189,248,0.05) 0%, transparent 65%)" }} />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative">
          <div className="flex flex-col gap-6 reveal">
            <p className="font-bold tracking-[0.14em] uppercase" style={{ fontSize: "0.6875rem", color: "#38BDF8" }}>
              Our Philosophy
            </p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.1rem)", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.025em", lineHeight: 1.12 }}>
              Better Every Day.
            </h2>
            <p style={{ fontSize: "1rem", color: "rgba(248,250,252,0.58)", lineHeight: 1.78, maxWidth: 480 }}>
              At Allverze, continuous improvement is the engine behind every decision, every delivery, and every
              relationship. We measure success by the compounding value we create for clients over time.
            </p>
            <div className="flex flex-wrap gap-3 mt-1">
              <button
                onClick={() => navigate("/contact")}
                className="text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                style={{ background: "#0055E5", borderRadius: 9, padding: "11px 24px", boxShadow: "0 2px 12px rgba(0,85,229,0.30)" }}
              >
                Start the Conversation
              </button>
              <button
                onClick={() => navigate("/about")}
                className="text-sm font-semibold transition-all duration-150 hover:opacity-80"
                style={{ color: "rgba(248,250,252,0.65)", border: "1px solid rgba(248,250,252,0.14)", borderRadius: 9, padding: "11px 20px" }}
              >
                Our Story
              </button>
            </div>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-px"
            style={{ background: "rgba(248,250,252,0.08)", borderRadius: 16, overflow: "hidden" }}
          >
            {philosophyStats.map((s, i) => (
              <div key={s.stat} className="reveal flex flex-col gap-2 p-8" data-reveal-delay={`${i * 70}`} style={{ background: "#0B1D35" }}>
                <span style={{ fontSize: "0.85rem", color: "rgba(56,189,248,0.55)" }}>{s.icon}</span>
                <span style={{ fontSize: "2rem", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {s.stat}
                </span>
                <span style={{ fontSize: "0.8rem", color: "rgba(248,250,252,0.40)", lineHeight: 1.5 }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section
        style={{
          background: "#060E1A",
          paddingTop: 96,
          paddingBottom: 96,
          borderTop: "1px solid rgba(0,85,229,0.10)",
        }}
        className="px-6 lg:px-12"
      >
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-7">
          <div
            className="reveal"
            style={{
              width: 52, height: 52, borderRadius: 13,
              background: "linear-gradient(135deg, rgba(0,85,229,0.20), rgba(56,189,248,0.12))",
              border: "1px solid rgba(56,189,248,0.20)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.7" strokeLinecap="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.9-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.39 16l.53.92z" />
            </svg>
          </div>

          <div className="reveal" data-reveal-delay="70">
            <h2 style={{ fontSize: "clamp(1.9rem, 4vw, 2.8rem)", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.025em", lineHeight: 1.12 }}>
              Ready to build something{" "}
              <span style={{ color: "#38BDF8" }}>that lasts?</span>
            </h2>
            <p style={{ margin: "16px auto 0", fontSize: "1rem", color: "rgba(248,250,252,0.52)", lineHeight: 1.78, maxWidth: 480 }}>
              A 30-minute strategy call is all it takes to understand your challenge and outline a path forward. No decks, no pressure — just engineers who listen first.
            </p>
          </div>

          <div className="reveal flex flex-wrap justify-center gap-3" data-reveal-delay="140">
            <button
              onClick={() => navigate("/contact")}
              className="group cta-glow inline-flex items-center gap-2 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "#0055E5",
                borderRadius: 9,
                padding: "13px 28px",
                boxShadow: "var(--glow-base, 0 0 0 0 rgba(0,85,229,0), 0 2px 18px rgba(0,85,229,0.40))",
              }}
            >
              Request a Strategy Call
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="transition-transform duration-200 group-hover:translate-x-0.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => navigate("/services")}
              className="inline-flex items-center gap-2 text-sm font-semibold transition-all hover:opacity-80"
              style={{ color: "rgba(248,250,252,0.65)", border: "1px solid rgba(248,250,252,0.14)", borderRadius: 9, padding: "13px 24px" }}
            >
              View Services
            </button>
          </div>

          <p
            className="reveal"
            data-reveal-delay="210"
            style={{
              fontSize: "0.75rem",
              color: "rgba(248,250,252,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <ShieldIcon size={12} strokeWidth={2.2} />
            100% Confidential &nbsp;·&nbsp; NDA Available &nbsp;·&nbsp; No commitment required
          </p>

          {/* Brand signature close */}
          <div className="reveal flex items-center gap-4" data-reveal-delay="280" style={{ marginTop: 4 }}>
            <span className="h-px" style={{ flex: 1, maxWidth: 56, background: "rgba(248,250,252,0.08)" }} />
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(248,250,252,0.32)",
                whiteSpace: "nowrap",
              }}
            >
              Allverze — Connecting Possibilities
            </span>
            <span className="h-px" style={{ flex: 1, maxWidth: 56, background: "rgba(248,250,252,0.08)" }} />
          </div>
        </div>
      </section>
    </main>
  );
}