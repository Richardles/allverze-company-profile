import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";
import { useThemeColors } from "../theme/useThemeColors";
import { openContactForm, openServiceModule } from "../lib/contactNav";
import OrbitalRing from "../components/OrbitalRing";
import LogoShimmer from "../components/LogoShimmer";
import ProcessFlow from "../components/ProcessFlow";
import logoFull from "../imports/logo-full.png";

const capabilities = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    tag: "Engineering",
    title: "Custom Software Engineering",
    desc: "Web applications and internal systems built to last — clean code, real testing, and a codebase we're happy to hand over and keep supporting.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" />
      </svg>
    ),
    tag: "Mobile",
    title: "Mobile Application Development",
    desc: "iOS and Android apps that feel native on every device — built for real-world networks, with a carefully considered user experience.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    tag: "Observability",
    title: "Application Performance Monitoring",
    desc: "Metrics, logs, and alerts wired together so your team hears about a problem before your customers do.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    tag: "Quality Assurance",
    title: "Performance & Automation Testing",
    desc: "Automated tests and load checks built into your delivery pipeline, so regressions surface early and shipping stays predictable.",
  },
];

const trustItems = [
  "React & TypeScript",
  "iOS + Android Apps",
  "Observability & Alerting",
  "Test Automation",
  "Better Every Day",
  "We Solve — Not Just Sell",
  "One Standard of Excellence",
  "A to Z, Start to Finish",
];

const commitments = [
  { title: "Scope before we quote", desc: "We map the work before we price it, so the number we give you is one we can stand behind." },
  { title: "Build in visible stages", desc: "Milestones with demos along the way. Nothing is a surprise at the end." },
  { title: "Support after launch", desc: "We stay on after go-live — monitoring, fixes, and improvements per agreement." },
  { title: "An honest 'no', early", desc: "If you don't need something, we'll tell you. We'd rather lose a sale than sell the wrong thing." },
];

const engagementSteps = [
  { num: "01", title: "Scope together", desc: "Your goals, your constraints, and an honest estimate before we build anything." },
  { num: "02", title: "Build in stages", desc: "Visible milestones with demos along the way — nothing is a surprise at the end." },
  { num: "03", title: "Test before launch", desc: "Automated checks and load tests, not a quick look. We ship software we're sure about." },
  { num: "04", title: "Stay after go-live", desc: "Monitoring, fixes, and improvements per agreement. We don't disappear at launch." },
];

const philosophyStats = [
  {
    stat: "A to Z",
    label: "One partner, start to finish",
    icon: "◎",
  },
  {
    stat: "Reliable",
    label: "We keep the timelines we set",
    icon: "◈",
  },
  {
    stat: "Honest",
    label: "The right call, even when it's a no",
    icon: "◇",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const heroRef = useRef<HTMLElement | null>(null);
  const markRef = useRef<HTMLImageElement | null>(null);

  return (
    <main>
      {/* ── HERO ── pure cinematic: the orbital system forms across the
             whole viewport (stars scatter → drift in → whip → settle), then
             scrolling reveals the copy below. ─────────────────────── */}
      <section
        ref={heroRef}
        style={{ paddingTop: 72, background: "#0B1D35" }}
        className="home-hero-height relative overflow-hidden flex items-center justify-center"
      >
        {/* Layered ambient gradients (texture system) */}
        <div aria-hidden="true" className="crown-glow crown-glow--hero" />
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(160deg, rgba(0,85,229,0.10) 0%, transparent 55%)" }} />
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 70% 50%, rgba(56,189,248,0.06) 0%, transparent 70%)" }} />
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none dot-grid dot-grid--fade" style={{ opacity: 0.55 }} />

        {/* Allverze lockup as a faint background silhouette behind the ring */}
        <img
          ref={markRef}
          src={logoFull}
          alt=""
          role="presentation"
          aria-hidden="true"
          draggable={false}
          className="hero-pod__mark"
        />

        {/* Shimmering dot-stars masked to the silhouette (cool white/cyan,
            independent breathing) — the logo glimmers behind the ring. */}
        <LogoShimmer src={logoFull} />

        {/* The ring itself — the birth stars scatter across the Allverze
            silhouette (scatterGuideRef) with a soft spill, then drift in to
            their orbit slots; the hero section remains the fallback field. */}
        <div className="orbital-float" style={{ maxWidth: "min(480px, 82vw)", width: "100%", marginInline: "auto", position: "relative", zIndex: 1 }}>
          <OrbitalRing size={480} variant="constellation" speed="majestic" birth scatterFieldRef={heroRef} scatterGuideRef={markRef} />
        </div>

        {/* Scroll cue: a quiet cyan drip that invites the fold below */}
        <div aria-hidden="true" className="hero-scroll-cue">
          <span className="hero-scroll-cue__track">
            <span className="hero-scroll-cue__dot" />
          </span>
        </div>
      </section>

      {/* ── HERO COPY ── first text on the page, revealed on scroll ── */}
      <section className="relative overflow-hidden" style={{ background: "#0B1D35" }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-12 py-20 lg:py-28 flex flex-col items-center gap-6 text-center">
          {/* Eyebrow */}
          <span
            className="reveal inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] uppercase"
            style={{
              color: "#38BDF8",
              background: "rgba(56,189,248,0.10)",
              border: "1px solid rgba(56,189,248,0.22)",
              borderRadius: 6,
              padding: "5px 12px",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#38BDF8", flexShrink: 0, display: "inline-block" }} />
            Custom Software & Engineering
          </span>

          <h1
            className="reveal"
            style={{
              fontSize: "clamp(2.6rem, 5vw, 3.9rem)",
              fontWeight: 800,
              lineHeight: 1.07,
              letterSpacing: "-0.028em",
              color: "#F8FAFC",
            }}
          >
            Software that solves{" "}
            <span className="hero-gradient">real problems.</span>
          </h1>

          {/* Tagline lockup */}
          <div className="reveal flex items-center justify-center gap-3">
            <span className="h-px w-10 shrink-0" style={{ background: "rgba(248,250,252,0.18)" }} />
            <span
              className="tracking-[0.22em] sm:tracking-[0.32em]"
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                textTransform: "uppercase",
                color: "rgba(248,250,252,0.48)",
              }}
            >
              Connecting Possibilities
            </span>
          </div>

          <p className="reveal" style={{ fontSize: "1.0625rem", lineHeight: 1.78, color: "rgba(248,250,252,0.62)", maxWidth: 520 }}>
            We build the software your business runs on — web and mobile applications, plus the monitoring and testing that keeps them dependable. We scope honestly, build in visible stages, and stay around after launch.
          </p>

          <div className="reveal flex flex-wrap items-center justify-center gap-3 mt-1">
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
              onClick={() => openContactForm(navigate)}
              className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-150 hover:bg-white/5"
              style={{
                color: "rgba(248,250,252,0.80)",
                border: "1px solid rgba(248,250,252,0.18)",
                borderRadius: 9,
                padding: "12px 24px",
              }}
            >
              Start the conversation
            </button>
          </div>

          {/* Slogan divider (brand) */}
          <div className="reveal flex items-center justify-center gap-3 pt-1">
            <div className="h-px" style={{ background: "rgba(248,250,252,0.08)", width: 40 }} />
            <span style={{ fontSize: "0.78rem", color: "rgba(248,250,252,0.38)", fontStyle: "italic" }}>
              We Solve — Not Just Sell &nbsp;&middot;&nbsp; Better Every Day
            </span>
            <div className="h-px" style={{ background: "rgba(248,250,252,0.08)", width: 40 }} />
          </div>

          {/* Honest locality line */}
          <div className="reveal flex items-center justify-center gap-3 pt-1">
            <span className="relative inline-flex" style={{ width: 8, height: 8, flexShrink: 0 }}>
              <span className="absolute inline-flex w-full h-full rounded-full animate-ping" style={{ background: "#38BDF8", opacity: 0.35 }} />
              <span className="relative inline-flex rounded-full" style={{ width: 8, height: 8, background: "#38BDF8" }} />
            </span>
            <p style={{ fontSize: "0.8rem", color: "rgba(248,250,252,0.48)" }}>
              A small team in Jakarta — replies within business hours, works across time zones.
            </p>
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
            <p className="font-bold tracking-[0.14em] uppercase mb-3" style={{ fontSize: "0.6875rem", color: "#38BDF8" }}>
              How We Work
            </p>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)", fontWeight: 700, color: colors.textPrimary, letterSpacing: "-0.022em", lineHeight: 1.15 }}>
              How we keep promises.
            </h2>
            <p style={{ fontSize: "0.95rem", color: colors.textMuted, marginTop: 14 }}>
              Four commitments that shape every engagement — no fine print.
            </p>
          </div>

          <div
            className="relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0B1D35 0%, #060E1A 100%)",
              border: "1px solid rgba(56, 189, 248, 0.14)",
              borderRadius: 28,
              boxShadow: isDark ? "none" : "0 24px 60px rgba(2, 8, 19, 0.28)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 70% 95% at 50% 0%, rgba(56,189,248,0.14), transparent 65%)",
              }}
            />
            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-10 p-8 md:p-12">
              {commitments.map((c) => (
                <div key={c.title} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      style={{
                        width: 26, height: 26, borderRadius: 8,
                        background: "rgba(56,189,248,0.12)",
                        color: "#38BDF8",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#F8FAFC", letterSpacing: "-0.01em" }}>{c.title}</span>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "rgba(248,250,252,0.55)", lineHeight: 1.7 }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE CAPABILITIES ─────────────────────────────────── */}
      <section style={{ background: "#0B1D35", paddingTop: 100, paddingBottom: 100 }} className="px-6 lg:px-12 relative overflow-hidden">
        <div aria-hidden="true" className="rim-glow-r" />
        <div aria-hidden="true" className="grain-iconic" />
        <div className="max-w-7xl mx-auto relative">
          <div className="mb-14 max-w-xl reveal">
            <p className="font-bold tracking-[0.14em] uppercase mb-3" style={{ fontSize: "0.6875rem", color: "#38BDF8" }}>
              What We Do
            </p>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)", fontWeight: 700, color: "#F8FAFC", letterSpacing: "-0.022em", lineHeight: 1.15 }}>
              Four things we're{" "}
              <span style={{ color: "#38BDF8" }}>good at</span>
            </h2>
            <p style={{ marginTop: 12, fontSize: "0.9375rem", color: "rgba(248,250,252,0.55)", lineHeight: 1.7 }}>
              Each one backed by the same discipline — scope first, build in stages, test properly, stay around afterwards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {capabilities.map((cap, i) => (
              <div
                key={cap.title}
                className="card-hover group flex flex-col gap-5"
                style={{
                  background: "#0E2344",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14,
                  padding: "32px 32px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.30), 0 4px 20px rgba(0,0,0,0.18)",
                  cursor: "default",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Top gradient accent line */}
                <div
                  className="absolute top-0 left-0 right-0 opacity-50 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    height: 2,
                    background: "linear-gradient(90deg, #0055E5 0%, #38BDF8 50%, transparent 100%)",
                    borderRadius: "14px 14px 0 0",
                  }}
                />
                <div className="flex items-start justify-between relative">
                  <div
                    style={{
                      width: 42, height: 42, borderRadius: 10,
                      background: "linear-gradient(135deg, rgba(0,85,229,0.22) 0%, rgba(56,189,248,0.10) 100%)",
                      color: "#38BDF8",
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
                      textTransform: "uppercase", color: "#38BDF8", background: "rgba(56,189,248,0.10)",
                      borderRadius: 5, padding: "3px 10px",
                    }}
                  >
                    {cap.tag}
                  </span>
                </div>

                <div className="relative">
                  <h3 style={{ fontSize: "1.075rem", fontWeight: 700, color: "#F8FAFC", marginBottom: 8, letterSpacing: "-0.012em" }}>
                    {cap.title}
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: "rgba(248,250,252,0.55)", lineHeight: 1.72 }}>
                    {cap.desc}
                  </p>
                </div>

                <button
                  onClick={() => openServiceModule(navigate, i)}
                  className="relative self-start flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all duration-200"
                  style={{ color: "#38BDF8" }}
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

      {/* ── SELECTED WORK + WORD OF MOUTH (honest scaffold) ─── */}
      <section style={{ background: colors.pageBg, paddingTop: 96, paddingBottom: 96 }} className="px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
          {/* Selected work */}
          <div className="flex flex-col gap-8 reveal">
            <div>
              <p className="font-bold tracking-[0.14em] uppercase mb-3" style={{ fontSize: "0.6875rem", color: colors.signalAccent }}>
                Selected Work
              </p>
              <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.5rem)", fontWeight: 700, color: colors.textPrimary, letterSpacing: "-0.022em", lineHeight: 1.15 }}>
                Proof we can stand behind.
              </h2>
              <p style={{ marginTop: 10, fontSize: "0.9375rem", color: colors.textSub, lineHeight: 1.75 }}>
                Real projects land here as they ship — scope, timeline, and result, with our name on the line. No invented logos, no borrowed screenshots. Until then, we'd rather show you our work in person.
              </p>
            </div>

            <div className="flex flex-col">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4"
                  style={{
                    padding: "20px 0",
                    borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#E9EEF5"}`,
                    borderBottom: i === 2 ? `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#E9EEF5"}` : "none",
                    opacity: 0.85,
                  }}
                >
                  <div
                    className="tnum shrink-0"
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: isDark ? "rgba(0,85,229,0.12)" : "rgba(0,85,229,0.08)",
                      color: "#0055E5",
                      fontSize: "0.78rem", fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {`0${i + 1}`}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: colors.textPrimary, letterSpacing: "-0.01em" }}>
                      An honest case study — reserved
                    </p>
                    <p style={{ fontSize: "0.8125rem", color: colors.textMuted }}>
                      Filled in once a real engagement ships. Scope, timeline, result — nothing invented.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Word of mouth */}
          <div
            className="reveal flex flex-col gap-5 lg:mt-24"
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 16,
              padding: "28px 26px",
            }}
          >
            <p className="font-bold tracking-[0.14em] uppercase" style={{ fontSize: "0.6875rem", color: colors.signalAccent }}>
              Word of Mouth
            </p>
            <p
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontStyle: "italic",
                fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)",
                lineHeight: 1.5,
                color: colors.textPrimary,
              }}
            >
              "This space is reserved for a client story we've earned — not one we've written ourselves."
            </p>
            <p style={{ fontSize: "0.9rem", color: colors.textSub, lineHeight: 1.75 }}>
              The best proof we can show today is an honest conversation. Ask us for references — we'll point you at clients who've actually worked with us.
            </p>
            <button
              onClick={() => openContactForm(navigate)}
              className="self-start text-sm font-semibold transition-all duration-150 hover:opacity-80 active:scale-[0.98]"
              style={{ color: colors.signalAccent, marginTop: 2 }}
            >
              Request references →
            </button>
          </div>
        </div>
      </section>

      {/* ── HOW ENGAGEMENTS RUN (editorial) ───────────────────── */}
      <section
        style={{
          background: colors.surfaceTrack,
          borderTop: `1px solid ${isDark ? "rgba(0,85,229,0.12)" : "rgba(11,29,53,0.08)"}`,
          borderBottom: `1px solid ${isDark ? "rgba(0,85,229,0.12)" : "rgba(11,29,53,0.08)"}`,
          paddingTop: 96,
          paddingBottom: 96,
        }}
        className="px-6 lg:px-12 relative overflow-hidden"
      >
        <div aria-hidden="true" className="rim-glow-r" />
        <div className="max-w-7xl mx-auto relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div className="flex flex-col gap-6 reveal">
            <p className="font-bold tracking-[0.14em] uppercase mb-1" style={{ fontSize: "0.6875rem", color: colors.signalAccent }}>
              How Engagements Run
            </p>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.5rem)", fontWeight: 700, color: colors.textPrimary, letterSpacing: "-0.022em", lineHeight: 1.15 }}>
              What working with us looks like
            </h2>
            <p
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontStyle: "italic",
                fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)",
                lineHeight: 1.45,
                color: colors.textPrimary,
              }}
            >
              "We'd rather lose a sale than sell you the wrong thing."
            </p>
            <button
              onClick={() => openContactForm(navigate)}
              className="self-start flex items-center gap-2 text-sm font-semibold transition-all hover:opacity-80"
              style={{ color: colors.signalAccent, marginTop: 4 }}
            >
              Start the conversation
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-6">
            <ProcessFlow steps={engagementSteps} variant="editorial" />
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
              We don't claim to be perfect — we aim to get better every day. That's the standard behind
              every decision, every delivery, and every relationship we keep.
            </p>
            <div className="flex flex-wrap gap-3 mt-1">
              <button
                onClick={() => openContactForm(navigate)}
                className="text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                style={{ background: "#0055E5", borderRadius: 9, padding: "11px 24px", boxShadow: "0 2px 12px rgba(0,85,229,0.30)" }}
              >
                Start the conversation
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
            {philosophyStats.map((s) => (
              <div key={s.stat} className="flex flex-col gap-2 p-8" style={{ background: "#0B1D35" }}>
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
        className="px-6 lg:px-12 relative overflow-hidden"
      >
        <div aria-hidden="true" className="crown-glow crown-glow--soft" />
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-7 relative">
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

          <div className="reveal">
            <h2 style={{ fontSize: "clamp(1.9rem, 4vw, 2.8rem)", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.025em", lineHeight: 1.12 }}>
              Ready to build something{" "}
              <span style={{ color: "#38BDF8" }}>that lasts?</span>
            </h2>
            <p style={{ margin: "16px auto 0", fontSize: "1rem", color: "rgba(248,250,252,0.52)", lineHeight: 1.78, maxWidth: 480 }}>
              A 30-minute call is enough to understand your challenge and sketch a way forward. No decks, no pressure — you'll leave with a clear next step either way.
            </p>
          </div>

          <div className="reveal flex flex-wrap justify-center gap-3">
            <button
              onClick={() => openContactForm(navigate)}
              className="group cta-glow inline-flex items-center gap-2 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "#0055E5",
                borderRadius: 9,
                padding: "13px 28px",
                boxShadow: "var(--glow-base, 0 0 0 0 rgba(0,85,229,0), 0 2px 18px rgba(0,85,229,0.40))",
              }}
            >
              Let's Talk
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

          {/* Brand signature close */}
          <div
            className="reveal flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
            style={{ marginTop: 4 }}
          >
            <span className="hidden sm:block h-px" style={{ flex: "1 1 56px", maxWidth: 56, background: "rgba(248,250,252,0.08)" }} />
            <span
              className="whitespace-normal text-center sm:whitespace-nowrap sm:text-left"
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(248,250,252,0.32)",
              }}
            >
              Allverze — Connecting Possibilities
            </span>
            <span className="hidden sm:block h-px" style={{ flex: "1 1 56px", maxWidth: 56, background: "rgba(248,250,252,0.08)" }} />
          </div>
        </div>
      </section>
    </main>
  );
}