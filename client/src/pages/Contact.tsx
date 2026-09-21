import { useState, type CSSProperties } from "react";
import { useTheme } from "../theme/ThemeContext";
import { inputFocusHandlers, useThemeColors } from "../theme/useThemeColors";
import { useContactForm } from "../contact/ContactFormContext";
import { CONTACT_INTENTS } from "../data/contact";
import { WHATSAPP_URL, PUBLIC_EMAIL } from "../config";
import { CONTACT_FORM_ID } from "../lib/contactNav";
import ShieldIcon from "../components/ShieldIcon";

const faqs = [
  {
    q: "How quickly can Allverze onboard a new project?",
    a: "Most engagements kick off within a few weeks of a signed agreement, with expedited onboarding for urgent timelines. We always start with a Discovery & Audit session before building anything — so the plan we give you is based on your situation, not a template.",
  },
  {
    q: "Does Allverze handle security and data protection?",
    a: "Yes. We follow common information-security practices — signed confidentiality agreements, restricted access, and careful handling of your data from day one. If your organisation works under a specific compliance framework, we'll map to it early in the engagement.",
  },
  {
    q: "What are typical project timelines?",
    a: "Discovery and advisory work usually takes 2 to 4 weeks. Custom software builds range from 8 to 24 weeks depending on complexity. We publish milestone-based delivery schedules up front, so expectations are set early and checked as we go.",
  },
  {
    q: "Can we establish an NDA before discussing details?",
    a: "Absolutely — and we encourage it. A mutual NDA can be signed before any technical or business details are shared. Just ask for one in your inquiry and we'll get it in place quickly, usually within a day.",
  },
  {
    q: "Do you work with early-stage startups or only enterprises?",
    a: "Both. Whether you're a funded startup building your first product or an established team improving what you already run, we tailor the engagement to your stage, budget, and goals — and we'll tell you honestly if you don't need our help yet.",
  },
];

const projectStages = [
  "Concept — just an idea",
  "In development",
  "Live, needs improvement",
  "Maintenance & support",
  "Not sure yet",
];

export default function Contact() {
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const inputHandlers = inputFocusHandlers(colors);
  const {
    form,
    intent,
    sending,
    error,
    submitted,
    confirmation,
    leadRef,
    updateField,
    setIntent,
    handleSubmit,
    reset,
  } = useContactForm();

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [stage, setStage] = useState("");

  const { pageBg, cardBg, cardBorder, textPrimary, textSub, textMuted, inputBase } = colors;

  return (
    <main style={{ paddingTop: 72 }}>
      {/* ── HEADER BANNER ─────────────────────────────────────── */}
      <section
        style={{ background: "#0B1D35", paddingTop: 88, paddingBottom: 88, position: "relative", overflow: "hidden" }}
        className="px-6 lg:px-12"
      >
        <div aria-hidden="true" className="crown-glow" />
        <div className="absolute inset-0 pointer-events-none dot-grid dot-grid--fade" style={{ opacity: 0.5 }} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(160deg, rgba(0,85,229,0.08) 0%, transparent 60%)" }}
        />
        <div className="max-w-7xl mx-auto relative">
          <p className="font-bold tracking-[0.14em] uppercase mb-5 fade-in-up" style={{ fontSize: "0.6875rem", color: "#38BDF8" }}>
            Get in Touch
          </p>
          <h1
            className="fade-in-up fade-in-up-1"
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
              fontWeight: 800,
              color: "#F8FAFC",
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              maxWidth: 640,
            }}
          >
            {"Tell us what you're "}
            <span style={{ color: "#38BDF8" }}>facing.</span>
          </h1>
          <p className="fade-in-up fade-in-up-2" style={{ marginTop: 18, fontSize: "1.0625rem", color: "rgba(248,250,252,0.55)", lineHeight: 1.75, maxWidth: 480 }}>
            No sales scripts, no pressure — just a direct line to the people who'd actually do the work. We'll give you an honest read on it.
          </p>
          <div className="flex items-center gap-2 mt-7 fade-in-up fade-in-up-3">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", flexShrink: 0 }} />
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "rgba(248,250,252,0.55)" }}>
              A real person replies within business hours
            </span>
          </div>
        </div>
      </section>

      {/* ── ENGAGEMENT HUB ────────────────────────────────────── */}
      <section style={{ background: pageBg, paddingTop: 80, paddingBottom: 80 }} className="px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* Left: channels */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="mb-2 reveal">
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: textPrimary, letterSpacing: "-0.01em" }}>
                Direct Channels
              </h2>
              <p style={{ marginTop: 4, fontSize: "0.875rem", color: textMuted }}>
                Reach us on the channel you like best. We're a small team in Jakarta (GMT+7) and happy to work across time zones.
              </p>
            </div>

            {/* Email */}
            <a
              href={`mailto:${PUBLIC_EMAIL}`}
              className="reveal flex items-center gap-4 card-hover"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: 12,
                padding: "18px 20px",
                textDecoration: "none",
                boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.25)" : "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 9, background: "rgba(0,85,229,0.09)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0055E5", flexShrink: 0 }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: textMuted, marginBottom: 2 }}>Email</div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0055E5" }}>{PUBLIC_EMAIL}</div>
              </div>
            </a>

            {/* WhatsApp card */}
            <div
              className="card-hover reveal"
              style={{
                background: "#0B1D35",
                border: "1px solid rgba(56,189,248,0.18)",
                borderRadius: 14,
                padding: "22px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,rgba(37,211,102,0.20),rgba(18,140,126,0.15))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F8FAFC" }}>WhatsApp Business</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(248,250,252,0.40)" }}>A real person, not a bot</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E" }} />
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#22C55E" }}>Online</span>
                </div>
              </div>
              <button
                onClick={() => window.open(WHATSAPP_URL, "_blank", "noopener")}
                className="w-full text-sm font-bold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", borderRadius: 9, padding: "11px" }}
              >
                Open WhatsApp chat
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <p style={{ fontSize: "0.72rem", textAlign: "center", color: "rgba(248,250,252,0.30)" }}>
                Usually replies within business hours
              </p>
            </div>

            {/* Social links */}
            <div className="reveal flex flex-wrap gap-3">
              {[
                {
                  label: "Instagram",
                  href: "https://instagram.com",
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="#0055E5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>,
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold card-hover grow basis-[130px] justify-center"
                  style={{
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: 9,
                    padding: "10px 16px",
                    color: textPrimary,
                    textDecoration: "none",
                    boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.20)" : "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  {s.icon}
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div
            id={CONTACT_FORM_ID}
            className="lg:col-span-3"
            style={{
              position: "relative",
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: 18,
              padding: "40px",
              boxShadow: isDark ? "0 2px 32px rgba(0,0,0,0.35)" : "0 2px 24px rgba(0,0,0,0.07)",
            }}
          >
            {submitted ? (
              <div className="flex flex-col items-center gap-6 py-10 text-center">
                <div
                  className="animate-pop-in"
                  style={{
                    width: 68, height: 68, borderRadius: "50%",
                    background: "linear-gradient(135deg, #0055E5 0%, #38BDF8 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(0,85,229,0.35)",
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: textPrimary, letterSpacing: "-0.01em" }}>Message Received</h3>
                  <p style={{ marginTop: 8, fontSize: "0.9rem", color: textSub, maxWidth: 320, lineHeight: 1.7 }}>
                    We'll reply within one business day. Check your inbox for confirmation.
                  </p>
                </div>
                {leadRef && (
                  <div
                    className="animate-pop-in"
                    style={{
                      background: isDark ? "rgba(0,85,229,0.08)" : "#EFF4FF",
                      border: `1px solid ${isDark ? "rgba(0,85,229,0.22)" : "rgba(0,85,229,0.15)"}`,
                      borderRadius: 10,
                      padding: "14px 24px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      minWidth: "min(240px, 100%)",
                      animationDelay: "80ms",
                    }}
                  >
                    <span style={{ fontSize: "0.67rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: textMuted }}>Reference Number</span>
                    <span
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: 700,
                        letterSpacing: "0.02em",
                        fontFamily: "'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace",
                        color: "#0055E5",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {leadRef}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: textMuted }}>Your reference — we'll reply shortly.</span>
                    {confirmation === "sent" && (
                      <span style={{ fontSize: "0.75rem", color: textMuted, marginTop: 2 }}>
                        Confirmation email sent to {form.email}.
                      </span>
                    )}
                    {confirmation === "failed" && (
                      <span style={{ fontSize: "0.75rem", color: textMuted, marginTop: 2 }}>
                        Inbound received, but our confirmation email could not be delivered.
                      </span>
                    )}
                  </div>
                )}
                <button onClick={reset} className="text-sm font-semibold hover:underline transition-colors" style={{ color: "#0055E5" }}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }} className="flex flex-col gap-6" aria-busy={sending || undefined}>
                <div>
                  <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: textPrimary, letterSpacing: "-0.012em" }}>
                    Start the Conversation
                  </h2>
                  <p style={{ marginTop: 5, fontSize: "0.875rem", color: textSub }}>
                    Tell us what you're building — we'll take it from there.
                  </p>
                </div>

                {/* Intent chips */}
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: textMuted }}>
                    What can we help you build?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CONTACT_INTENTS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        disabled={sending}
                        onClick={() => setIntent(opt)}
                        className={
                          intent === opt
                            ? "text-xs font-semibold transition-all duration-150 active:scale-[0.97]"
                            : "intent-chip transition-all duration-150 active:scale-[0.97]"
                        }
                        style={
                          intent === opt
                            ? { background: "#0055E5", color: "#FFFFFF", borderRadius: 7, padding: "7px 14px", border: "1px solid #0055E5", boxShadow: "0 2px 8px rgba(0,85,229,0.28)", opacity: sending ? 0.55 : 1 }
                            : {
                                "--chip-border": isDark ? "rgba(255,255,255,0.12)" : "#DDE4EE",
                                "--chip-color": isDark ? "rgba(248,250,252,0.55)" : "#4A6080",
                                "--chip-hover-border": "rgba(0,85,229,0.5)",
                                "--chip-hover-color": "#0055E5",
                                opacity: sending ? 0.55 : 1,
                              } as CSSProperties
                        }
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name + Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-name" style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: textMuted }}>Full Name *</label>
                    <input
                      id="contact-name"
                      type="text" required placeholder="Jane Smith"
                      disabled={sending}
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      style={{ ...inputBase, opacity: sending ? 0.55 : 1, cursor: sending ? "not-allowed" : undefined }}
                      {...inputHandlers}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-email" style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: textMuted }}>Email *</label>
                    <input
                      id="contact-email"
                      type="email" required placeholder="jane@company.com"
                      disabled={sending}
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      style={{ ...inputBase, opacity: sending ? 0.55 : 1, cursor: sending ? "not-allowed" : undefined }}
                      {...inputHandlers}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-phone" style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: textMuted }}>Phone Number *</label>
                  <input
                    id="contact-phone"
                    type="tel" required placeholder="+62 812 345 6789"
                    disabled={sending}
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    style={{ ...inputBase, opacity: sending ? 0.55 : 1, cursor: sending ? "not-allowed" : undefined }}
                    {...inputHandlers}
                  />
                  <p style={{ fontSize: "0.72rem", color: textMuted }}>International format preferred</p>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-message" style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: textMuted }}>Message *</label>
                  <textarea
                    id="contact-message"
                    required rows={4}
                    disabled={sending}
                    placeholder="Describe what you're looking to solve — the more context, the faster we can help..."
                    value={form.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    style={{ ...inputBase, resize: "none", opacity: sending ? 0.55 : 1, cursor: sending ? "not-allowed" : undefined }}
                    {...inputHandlers}
                  />
                </div>

                {/* Project stage (optional) */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-stage" style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: textMuted }}>
                    Where is your project today? <span style={{ opacity: 0.6 }}>(optional)</span>
                  </label>
                  <div className="relative">
                    <select
                      id="contact-stage"
                      disabled={sending}
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      style={{
                        ...inputBase,
                        appearance: "none",
                        WebkitAppearance: "none",
                        cursor: sending ? "not-allowed" : "pointer",
                        opacity: sending ? 0.55 : 1,
                        paddingRight: 40,
                        color: stage ? undefined : textMuted,
                      }}
                      {...inputHandlers}
                    >
                      <option value="" disabled>
                        Select a stage
                      </option>
                      {projectStages.map((s) => (
                        <option key={s} value={s} style={{ background: isDark ? "#0B1D35" : "#FFFFFF", color: isDark ? "#F8FAFC" : "#0B1D35" }}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <svg
                      aria-hidden="true"
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"
                      style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: isDark ? "#7AABFF" : "#0055E5", pointerEvents: "none" }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-1">
                  {error && (
                    <p style={{ fontSize: "0.85rem", color: "#EF4444", textAlign: "center" }}>
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={sending}
                    className="group cta-glow w-full text-sm font-bold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2"
                    style={{
                      background: sending ? "rgba(0,85,229,0.70)" : "#0055E5",
                      borderRadius: 10,
                      padding: "13px",
                      boxShadow: sending ? "none" : "var(--glow-base, 0 0 0 0 rgba(0,85,229,0), 0 2px 14px rgba(0,85,229,0.32))",
                      cursor: sending ? "not-allowed" : "pointer",
                    }}
                  >
                    {sending ? (
                      <>
                        <Spinner />
                        Sending your inquiry…
                      </>
                    ) : (
                      <>
Send Message
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" className="transition-transform duration-200 group-hover:translate-x-0.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                  {sending && (
                    <p role="status" aria-live="polite" className="text-center" style={{ fontSize: "0.8125rem", color: textSub }}>
                      We're sending your inquiry — this takes a few seconds.
                    </p>
                  )}
                  <p style={{ fontSize: "0.72rem", textAlign: "center", color: textMuted, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <ShieldIcon size={12} strokeWidth={2.2} />
                    100% Confidential &nbsp;·&nbsp; NDA Available &nbsp;·&nbsp; No commitment required
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section style={{ background: "#0B1D35", borderTop: "1px solid rgba(0,85,229,0.12)", paddingTop: 80, paddingBottom: 80 }} className="px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <p className="font-bold tracking-[0.14em] uppercase mb-3" style={{ fontSize: "0.6875rem", color: "#38BDF8" }}>
              Common Questions
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.3rem)", fontWeight: 700, color: "#F8FAFC", letterSpacing: "-0.022em" }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="faq-item"
                style={{
                  background: "#0E2344",
                  border: openFaq === i ? "1px solid rgba(56,189,248,0.30)" : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                  style={{ background: "transparent" }}
                >
                  <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#F8FAFC", lineHeight: 1.5, paddingRight: 24 }}>
                    {faq.q}
                  </span>
                  <span
                    style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: openFaq === i ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.06)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      transition: "background 200ms, transform 200ms",
                      transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={openFaq === i ? "#38BDF8" : "rgba(248,250,252,0.5)"} strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </button>
                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: openFaq === i ? "1fr" : "0fr",
                    transition: "grid-template-rows 220ms cubic-bezier(0.22, 1, 0.36, 1)",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ overflow: "hidden", minHeight: 0 }}>
                    <p style={{ padding: "0 24px 22px", fontSize: "0.875rem", color: "rgba(248,250,252,0.55)", lineHeight: 1.78 }}>{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Spinner() {
  return (
    <span
      style={{
        width: 16, height: 16, borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.35)",
        borderTopColor: "#fff",
        display: "inline-block",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}