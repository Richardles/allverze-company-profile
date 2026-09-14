import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";
import { openContactForm } from "../lib/contactNav";
import allverzeLogo from "../imports/logo.webp";

const navLinks = [
  { label: "Home",     path: "/" },
  { label: "About Us",    path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Contact",  path: "/contact" },
];

export default function Header() {
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerBg = isDark
    ? scrolled ? "rgba(6,14,26,0.98)" : "rgba(6,14,26,0.92)"
    : scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.90)";

  const headerBorder = isDark
    ? scrolled ? "1px solid rgba(56,189,248,0.14)" : "1px solid rgba(56,189,248,0.08)"
    : scrolled ? "1px solid rgba(14,30,54,0.12)" : "1px solid rgba(14,30,54,0.06)";

  const navColor = isDark ? "rgba(248,250,252,0.75)" : "#1E3A5F";
  const mobileMenuBg = isDark ? "rgba(6,14,26,0.99)" : "rgba(255,255,255,0.99)";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: headerBg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: headerBorder,
        boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,0.10)" : "none",
      }}
    >
      <div
        className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between"
        style={{ height: 72 }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center focus-visible:outline-none"
          aria-label="Allverze Corporation — home"
        >
          <img
            src={allverzeLogo}
            alt="Allverze Corporation"
            style={{
              height: 48,
              width: "auto",
              objectFit: "contain",
              filter: isDark ? "brightness(0) invert(1)" : "none",
            }}
          />
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={() =>
                `nav-link relative px-4 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none`
              }
              style={({ isActive }) => ({
                color: isActive ? "#0055E5" : navColor,
                borderRadius: 6,
              })}
            >
              {({ isActive }) => (
                <>
                  {label}
                  <span className={`nav-underline${isActive ? " nav-underline-on" : ""}`} aria-hidden="true" />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="flex items-center justify-center transition-all duration-200 hover:opacity-80"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: isDark ? "rgba(56,189,248,0.06)" : "rgba(0,85,229,0.04)",
              border: isDark ? "1px solid rgba(56,189,248,0.14)" : "1px solid rgba(0,85,229,0.10)",
              color: isDark ? "#38BDF8" : "#0055E5",
            }}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <span key="light" className="animate-theme-pop" style={{ display: "flex" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              </span>
            ) : (
              <span key="dark" className="animate-theme-pop" style={{ display: "flex" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </span>
            )}
          </button>

          <button
            onClick={() => openContactForm(navigate)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "#0055E5",
              borderRadius: 9,
              padding: "9px 22px",
              boxShadow: "0 2px 12px rgba(0,85,229,0.32)",
            }}
          >
            Let's Talk
          </button>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => { openContactForm(navigate); setMenuOpen(false); }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "#0055E5",
              borderRadius: 8,
              padding: "8px 16px",
              boxShadow: "0 2px 12px rgba(0,85,229,0.32)",
            }}
          >
            Let's Talk
          </button>
          <button
            className="p-2 focus-visible:outline-none"
            style={{ color: isDark ? "#F8FAFC" : "#0B1D35", borderRadius: 6 }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden flex flex-col px-6 py-5 gap-1"
          style={{
            borderTop: isDark ? "1px solid rgba(56,189,248,0.10)" : "1px solid rgba(14,30,54,0.08)",
            background: mobileMenuBg,
          }}
        >
          <button
            role="switch"
            aria-checked={isDark}
            onClick={toggle}
            className="menu-link touch-manipulation flex items-center justify-between w-full px-3 py-2.5 text-sm font-semibold transition-colors"
            style={{ color: navColor, borderRadius: 6, WebkitTapHighlightColor: "transparent" }}
          >
            <span className="flex items-center gap-2.5">
              {isDark ? (
                <span key="dark" className="animate-theme-pop" style={{ display: "flex", color: "#38BDF8" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </span>
              ) : (
                <span key="light" className="animate-theme-pop" style={{ display: "flex", color: "#0055E5" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                </span>
              )}
              Dark mode
            </span>
            <span
              className="theme-switch"
              data-on={isDark ? "true" : "false"}
              style={{
                background: isDark ? "#0055E5" : "transparent",
                borderColor: isDark ? "#0055E5" : "rgba(0,85,229,0.22)",
              }}
              aria-hidden="true"
            >
              <span className="theme-switch-thumb" style={{ background: isDark ? "#F8FAFC" : "#0055E5" }} />
            </span>
          </button>
          {navLinks.map(({ label, path }, i) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              className={() =>
                `menu-link text-sm font-semibold text-left px-3 py-2.5 transition-colors`
              }
              style={({ isActive }) => ({
                color: isActive ? "#0055E5" : navColor,
                borderRadius: 6,
                background: isActive
                  ? (isDark ? "rgba(0,85,229,0.12)" : "rgba(0,85,229,0.06)")
                  : "transparent",
                textDecoration: "none",
                animationDelay: `${60 + i * 35}ms`,
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
      <span className="sr-only" role="status" aria-live="polite">
        {isDark ? "Dark mode" : "Light mode"}
      </span>
    </header>
  );
}
