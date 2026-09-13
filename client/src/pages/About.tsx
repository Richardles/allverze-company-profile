import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";
import { useThemeColors } from "../theme/useThemeColors";
import OrbitalRing from "../components/OrbitalRing";

const coreValues = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Customer Centricity",
    quote: "We Solve — Not Just Sell",
    desc: "Every recommendation starts with your outcome, not our portfolio. We never prescribe technology for technology's sake.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Trust & Respect",
    quote: "Partnerships built on integrity",
    desc: "We treat every client, partner, and colleague as a long-term relationship worth protecting — not a contract to fulfill.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Integrity",
    quote: "Honest, always",
    desc: "No unnecessary tech inflation. Honest recommendations, transparent pricing, and rigorous data protection at every layer.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "Excellence",
    quote: "Better Every Day",
    desc: "We hold ourselves to a single, uncompromising standard across every engagement, regardless of project size.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
    title: "Innovation",
    quote: "A to Z problem-solving",
    desc: "We draw on our full universe of expertise to design solutions that are practical, fresh, and future-ready.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Reliability",
    quote: "99.9% SLA commitment",
    desc: "When we commit to uptime, performance, or delivery timelines, those commitments are backed by engineering discipline.",
  },
];

const team = [
  {
    name: "Sarah Chen",
    title: "Chief Executive Officer",
    domain: "Corporate Strategy & Growth",
    photo: "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=480&h=480&fit=crop&auto=format&q=80",
  },
  {
    name: "Marcus Wei",
    title: "Chief Technology Officer",
    domain: "Engineering & Architecture",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=480&h=480&fit=crop&auto=format&q=80",
  },
  {
    name: "Priya Anand",
    title: "Chief Operating Officer",
    domain: "Operations & Client Delivery",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=480&h=480&fit=crop&auto=format&q=80",
  },
];

const pillars = ["Best Service", "Best Quality", "Integrity", "Reliability", "Professionalism"];

const orbitalStory = [
  { label: "Connected Ecosystem",   desc: "The infinite loop represents our commitment to unbroken partnership — no hand-offs, no gaps, no disappearing acts post-launch." },
  { label: "The Color of Trust",    desc: "Blue stands for trust, reliability, professionalism, stability, and technology — the foundation of every solution we build." },
  { label: "Technology & Collaboration", desc: "One unbroken orbit uniting technology and collaboration — always in motion, always together." },
  { label: "Better Every Day",      desc: "The ring never ends, just as our pursuit of continuous improvement never stops. Every orbit brings new insight — and unlimited possibilities." },
];

const missionPillars = [
  "Empower businesses with reliable technology, practical solutions, and continuous innovation.",
  "Connect diverse expertise, technologies, and ideas from A to Z to solve real-world business challenges.",
  "Build long-term relationships through integrity, excellence, reliability, and professionalism.",
  "Continuously improve our people, solutions, and services — becoming better every day.",
];

export default function About() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const colors = useThemeColors();

  const pillabBg = isDark ? "#0B1D35" : "#FFFFFF";
  const pillBorder = isDark ? "rgba(255,255,255,0.07)" : "#E2E8F0";
  const missionBg = isDark ? "#0E2344" : "#FFFFFF";

  return (
    <main style={{ paddingTop: 72 }}>
      {/* ── HEADER BANNER ─────────────────────────────────────── */}
      <section style={{ background: "#0B1D35", paddingTop: 88, paddingBottom: 88 }} className="px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="font-bold tracking-[0.14em] uppercase mb-5 fade-in-up" style={{ fontSize: "0.6875rem", color: "#38BDF8" }}>
            About Allverze
          </p>
          <h1
            className="fade-in-up fade-in-up-1"
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
              fontWeight: 800,
              color: "#F8FAFC",
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              maxWidth: 680,
            }}
          >
            A Universe of Unlimited{" "}
            <span style={{ color: "#38BDF8" }}>Possibilities</span>
          </h1>
          <p className="fade-in-up fade-in-up-2" style={{ marginTop: 20, fontSize: "1.0625rem", color: "rgba(248,250,252,0.58)", lineHeight: 1.75, maxWidth: 560 }}>
            <strong style={{ color: "rgba(248,250,252,0.82)", fontWeight: 600 }}>All</strong> — all-encompassing solutions for every business.{" "}
            <strong style={{ color: "rgba(248,250,252,0.82)", fontWeight: 600 }}>Verze</strong> — a universe of unlimited possibilities, boundless and ever-expanding.
            Together: your partner from A to Z.
          </p>
          <p className="fade-in-up fade-in-up-3" style={{ marginTop: 14, fontSize: "1.0625rem", color: "rgba(248,250,252,0.42)", lineHeight: 1.75, maxWidth: 600 }}>
            Allverze represents a universe of solutions — bringing different technologies, expertise, and ideas together to solve real business challenges.
          </p>
        </div>
      </section>

      {/* ── ORBITAL RING STORY ────────────────────────────────── */}
      <section style={{ background: colors.pageBg, paddingTop: 96, paddingBottom: 96 }} className="px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="flex justify-center reveal">
            <div className="orbital-float" style={{ maxWidth: "min(320px, 82vw)", width: "100%" }}>
              <OrbitalRing size={320} variant="constellation" />
            </div>
          </div>

          <div className="flex flex-col gap-7">
            <div className="reveal" data-reveal-delay="70">
              <p className="font-bold tracking-[0.14em] uppercase mb-3" style={{ fontSize: "0.6875rem", color: "#0055E5" }}>
                The Orbital Ring
              </p>
              <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.3rem)", fontWeight: 700, color: colors.textPrimary, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                A Symbol of the Connected Ecosystem
              </h2>
            </div>

            <div className="flex flex-col gap-6">
              {orbitalStory.map((item, i) => (
                <div key={item.label} className="flex gap-4 reveal" data-reveal-delay={`${140 + i * 60}`}>
                  <div
                    style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#0055E5", flexShrink: 0, marginTop: 8,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: colors.textPrimary, marginBottom: 4 }}>{item.label}</div>
                    <p style={{ fontSize: "0.875rem", color: colors.textSub, lineHeight: 1.7 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION & VISION ──────────────────────────────────── */}
      <section style={{ background: "#0B1D35", paddingTop: 96, paddingBottom: 96 }} className="px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14 reveal">
            <p className="font-bold tracking-[0.14em] uppercase mb-3" style={{ fontSize: "0.6875rem", color: "#38BDF8" }}>
              Purpose & Direction
            </p>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.5rem)", fontWeight: 700, color: "#F8FAFC", letterSpacing: "-0.02em" }}>
              Mission & Vision
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Vision */}
            <div
              style={{ background: "#0E2344", border: "1px solid rgba(56,189,248,0.20)", borderRadius: 16, padding: "40px" }}
              className="card-hover reveal flex flex-col gap-5"
            >
              <div className="flex items-center gap-3">
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(56,189,248,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#38BDF8" }}>Vision</span>
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#F8FAFC", lineHeight: 1.45, letterSpacing: "-0.01em" }}>
                A trusted business partner that connects innovation, expertise, and integrity to create meaningful value for businesses and the community.
              </h3>
              <p style={{ fontSize: "0.875rem", color: "rgba(248,250,252,0.50)", lineHeight: 1.75 }}>
                Every business, regardless of size, deserves enterprise-grade technology delivered with honesty, precision, and genuine care for outcomes.
              </p>
            </div>

            {/* Mission */}
            <div
              style={{ background: missionBg, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0"}`, borderRadius: 16, padding: "40px" }}
              className="card-hover reveal flex flex-col gap-5"
              data-reveal-delay="80"
            >
              <div className="flex items-center gap-3">
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(0,85,229,0.09)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0055E5" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                  </svg>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0055E5" }}>Mission</span>
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: isDark ? "#F8FAFC" : "#0B1D35", lineHeight: 1.45, letterSpacing: "-0.01em" }}>
                Four commitments that define how we show up for every client, every day.
              </h3>
              <ol className="flex flex-col gap-3.5">
                {missionPillars.map((pillar, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span
                      style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: "rgba(0,85,229,0.09)", color: "#0055E5",
                        fontSize: "0.7rem", fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginTop: 1,
                      }}
                    >
                      {i + 1}
                    </span>
                    <p style={{ fontSize: "0.875rem", color: isDark ? "rgba(248,250,252,0.62)" : "#475569", lineHeight: 1.65 }}>{pillar}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── ONE STANDARD OF EXCELLENCE ────────────────────────── */}
      <section style={{ background: colors.pageBg, paddingTop: 72, paddingBottom: 72 }} className="px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center reveal">
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.1rem)", fontWeight: 700, color: colors.textPrimary, letterSpacing: "-0.02em" }}>
              One Standard of Excellence
            </h2>
            <p style={{ marginTop: 8, fontSize: "0.875rem", color: colors.textMuted }}>Five pillars. Indivisible.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {pillars.map((pillar, i) => (
              <div key={pillar} className="flex items-center gap-3">
                <div
                  className="pillar-chip reveal"
                  data-reveal-delay={`${i * 50}`}
                  style={{
                    background: pillabBg,
                    border: `1px solid ${pillBorder}`,
                    borderRadius: 10,
                    padding: "14px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.20)" : "0 1px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg, #0055E5, #38BDF8)", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: colors.textPrimary }}>{pillar}</span>
                </div>
                {i < pillars.length - 1 && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ───────────────────────────────────────── */}
      <section style={{ background: "#0B1D35", paddingTop: 96, paddingBottom: 96 }} className="px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14 reveal">
            <p className="font-bold tracking-[0.14em] uppercase mb-3" style={{ fontSize: "0.6875rem", color: "#38BDF8" }}>
              What We Stand For
            </p>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.5rem)", fontWeight: 700, color: "#F8FAFC", letterSpacing: "-0.02em" }}>
              6 Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreValues.map((v, i) => (
              <div
                key={v.title}
                className="card-hover group reveal flex flex-col gap-4 relative overflow-hidden"
                data-reveal-delay={`${i * 70}`}
                style={{
                  background: "#0E2344",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14,
                  padding: "28px",
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
                <div
                  className="transition-transform duration-200 group-hover:scale-105"
                  style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg, rgba(0,85,229,0.22) 0%, rgba(56,189,248,0.10) 100%)", color: "#38BDF8", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {v.icon}
                </div>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "#F8FAFC", marginBottom: 3, letterSpacing: "-0.01em" }}>{v.title}</div>
                  <div style={{ fontSize: "0.74rem", color: "#38BDF8", fontStyle: "italic", marginBottom: 10, opacity: 0.85 }}>"{v.quote}"</div>
                  <p style={{ fontSize: "0.855rem", color: "rgba(248,250,252,0.50)", lineHeight: 1.72 }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ──────────────────────────────────────────────── */}
      <section style={{ background: colors.pageBg, paddingTop: 96, paddingBottom: 96 }} className="px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14 reveal">
            <p className="font-bold tracking-[0.14em] uppercase mb-3" style={{ fontSize: "0.6875rem", color: "#0055E5" }}>
              Leadership & Governance
            </p>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.5rem)", fontWeight: 700, color: colors.textPrimary, letterSpacing: "-0.02em" }}>
              Our Team
            </h2>
            <p style={{ marginTop: 10, fontSize: "0.9375rem", color: colors.textSub }}>
              Seasoned leaders with the depth to solve, not just advise.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl">
            {team.map((member, i) => (
              <div
                key={member.name}
                className="group reveal flex flex-col overflow-hidden card-hover"
                data-reveal-delay={`${i * 80}`}
                style={{
                  background: colors.cardBg,
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: 18,
                  boxShadow: isDark
                    ? "0 2px 16px rgba(0,0,0,0.35)"
                    : "0 1px 4px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ height: 240, background: isDark ? "#0E2344" : "#DBEAFE", overflow: "hidden", position: "relative" }}>
                  <img
                    src={member.photo}
                    alt={member.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Gradient overlay on bottom of photo */}
                  <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{
                      height: 60,
                      background: `linear-gradient(to top, ${isDark ? "rgba(11,29,53,0.85)" : "rgba(255,255,255,0.6)"} 0%, transparent 100%)`,
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2.5 p-5 flex-1">
                  <div>
                    <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: colors.textPrimary, letterSpacing: "-0.01em" }}>{member.name}</div>
                    <div style={{ fontSize: "0.775rem", fontWeight: 600, color: "#0055E5", marginTop: 2 }}>{member.title}</div>
                  </div>
                  <div
                    style={{
                      fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em",
                      color: colors.tagColor,
                      background: colors.tagBg,
                      borderRadius: 5, padding: "3px 9px", alignSelf: "flex-start",
                    }}
                  >
                    {member.domain}
                  </div>
                  <button
                    className="mt-auto flex items-center gap-1.5 text-xs font-semibold transition-all hover:gap-2.5 focus-visible:outline-none"
                    style={{ color: "#0055E5" }}
                    onClick={() => window.open("https://linkedin.com", "_blank", "noopener")}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                    LinkedIn Profile
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ─────────────────────────────────────────── */}
      <section
        style={{ background: "#0B1D35", borderTop: "1px solid rgba(0,85,229,0.14)", paddingTop: 72, paddingBottom: 72 }}
        className="px-6 lg:px-12"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <h2 className="reveal" style={{ fontSize: "clamp(1.6rem, 3vw, 2.1rem)", fontWeight: 700, color: "#F8FAFC", letterSpacing: "-0.02em" }}>
            Ready to work with a team that solves, not just sells?
          </h2>
          <button
            onClick={() => navigate("/contact")}
            className="flex-shrink-0 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
            style={{ background: "#0055E5", borderRadius: 9, padding: "12px 28px", boxShadow: "0 2px 12px rgba(0,85,229,0.28)", whiteSpace: "nowrap" }}
          >
            Start the Conversation →
          </button>
        </div>
      </section>
    </main>
  );
}