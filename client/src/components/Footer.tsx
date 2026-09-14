import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { openContactForm } from "../lib/contactNav";
import allverzeLogo from "../imports/logo.webp";
import { WHATSAPP_URL, WHATSAPP_NUMBER, PUBLIC_EMAIL } from "../config";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Contact", path: "/contact" },
];

const socialLinks = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
];

function formatPhoneDisplay(num: string): string {
  const digits = num.replace(/\D/g, "");
  if (digits.startsWith("62") && digits.length >= 13) {
    return `+62 ${digits.slice(2, 5)}-${digits.slice(5, 9)}-${digits.slice(9, 13)}`;
  }
  return digits;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="flex items-center rounded transition-all focus-visible:outline-none"
      style={{
        flexShrink: 0,
        cursor: "pointer",
        color: copied ? "#22C55E" : "rgba(248,250,252,0.30)",
        background: copied ? "rgba(34,197,94,0.10)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${copied ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.08)"}`,
        padding: "5px 9px",
        fontSize: "0.68rem",
        fontWeight: 600,
        letterSpacing: "0.04em",
      }}
      aria-label={copied ? "Copied" : label}
      title={copied ? "Copied" : label}
    >
      {copied ? (
        <span className="flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Copied
        </span>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

export default function Footer() {
  const navigate = useNavigate();
  const whatsappDisplay = formatPhoneDisplay(WHATSAPP_NUMBER);

  return (
    <footer style={{ background: "#071526", borderTop: "1px solid rgba(0,85,229,0.12)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-4 flex flex-col gap-5">
            <NavLink to="/" className="self-start focus-visible:outline-none" aria-label="Allverze Corporation home">
              <img
                src={allverzeLogo}
                alt="Allverze Corporation"
                style={{ height: 48, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }}
              />
            </NavLink>
            <p style={{ fontSize: "0.855rem", color: "rgba(248,250,252,0.36)", lineHeight: 1.72, maxWidth: 300 }}>
              Connecting possibilities through technology, ideas, and dependable execution. We Solve — Not Just Sell.
            </p>
            <div className="flex items-center gap-2">
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
              <span style={{ fontSize: "0.74rem", color: "rgba(248,250,252,0.30)" }}>
                Currently accepting new engagements
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(56,189,248,0.65)", marginBottom: 4 }}>
              Navigation
            </div>
            {navLinks.map(({ label, path }) => (
              <NavLink
                key={path}
                to={path}
                className="footer-link text-sm text-left transition-colors"
                style={({ isActive }) => ({
                  color: isActive ? "rgba(248,250,252,0.85)" : "rgba(248,250,252,0.38)",
                  textDecoration: "none",
                })}
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Contact */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(56,189,248,0.65)", marginBottom: 4 }}>
              Get in Touch
            </div>
            <div className="flex items-center justify-between gap-2">
              <a
                href={`mailto:${PUBLIC_EMAIL}`}
                className="flex items-center gap-2 transition-opacity hover:opacity-90"
                style={{ textDecoration: "none", color: "rgba(248,250,252,0.38)" }}
                aria-label={`Email Allverze at ${PUBLIC_EMAIL}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0 }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span className="flex flex-col leading-tight">
                  <span style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.05em", color: "rgba(248,250,252,0.50)" }}>
                    Email us at
                  </span>
                  <span className="contact-accent-email" style={{ fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.01em", userSelect: "text" }}>
                    {PUBLIC_EMAIL}
                  </span>
                </span>
              </a>
              <CopyButton value={PUBLIC_EMAIL} label="Copy email address" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-opacity hover:opacity-90"
                style={{ textDecoration: "none", color: "rgba(248,250,252,0.38)" }}
                aria-label={`Chat with us on WhatsApp: ${whatsappDisplay}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366" style={{ flexShrink: 0 }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="flex flex-col leading-tight">
                  <span style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.05em", color: "rgba(248,250,252,0.50)" }}>
                    Chat with us on WhatsApp
                  </span>
                  <span className="contact-accent-wa" style={{ fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.01em", userSelect: "text" }}>
                    {whatsappDisplay}
                  </span>
                </span>
              </a>
              <CopyButton value={whatsappDisplay} label="Copy WhatsApp number" />
            </div>
            <div className="flex gap-2 mt-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center transition-all hover:scale-105"
                  style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.06)", color: "rgba(248,250,252,0.40)", border: "1px solid rgba(255,255,255,0.06)" }}
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Connect */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(56,189,248,0.65)", marginBottom: 4 }}>
              Quick Connect
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 card-hover group"
              style={{
                background: "rgba(37,211,102,0.06)",
                border: "1px solid rgba(37,211,102,0.18)",
                borderRadius: 11,
                padding: "14px 16px",
                textDecoration: "none",
              }}
              aria-label="Talk to a real person on WhatsApp"
            >
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(37,211,102,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#E2FFF0" }}>Talk to a real person</div>
                <div style={{ fontSize: "0.72rem", color: "rgba(248,250,252,0.35)" }}>Your message is pre-written — just press send</div>
              </div>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(37,211,102,0.55)" strokeWidth="2.5" strokeLinecap="round" className="transition-transform group-hover:translate-x-0.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <p style={{ fontSize: "0.72rem", color: "rgba(248,250,252,0.35)", lineHeight: 1.6 }}>
              We'd love to hear about your project — reaching out takes one tap.
            </p>
            <button
              onClick={() => openContactForm(navigate)}
              className="text-sm font-semibold text-white transition-opacity hover:opacity-85"
              style={{ background: "#0055E5", borderRadius: 9, padding: "10px 16px", boxShadow: "0 2px 10px rgba(0,85,229,0.22)" }}
            >
              Let's Talk
            </button>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p style={{ fontSize: "0.78rem", color: "rgba(248,250,252,0.34)" }}>
            © 2026 Allverze Corporation. All rights reserved.
          </p>
          <div style={{ fontSize: "0.74rem", color: "rgba(248,250,252,0.34)", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            NDA Available · 100% Confidential
          </div>
        </div>
      </div>
    </footer>
  );
}