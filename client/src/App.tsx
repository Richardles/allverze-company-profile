import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppWidget from './components/WhatsAppWidget';
import PerfHud from './components/PerfHud';
import { ContactFormProvider } from './contact/ContactFormProvider';
import { observeReveals } from './lib/reveal';
import { CONTACT_FORM_ID } from './lib/contactNav';
import { usePrefersReducedMotion } from './lib/browser';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';

function ScrollToTop() {
  const location = useLocation();
  const reducedMotion = usePrefersReducedMotion();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const samePage = prevPathRef.current === location.pathname;
    prevPathRef.current = location.pathname;

    if (!samePage) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    const targetId = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!targetId) return;

    let cancelled = false;
    let rafId = 0;
    let spotlightTimer: number | undefined;

    const addSpotlight = (card: HTMLElement) => {
      if (cancelled || card.id !== CONTACT_FORM_ID || card.classList.contains("form-spotlight")) return;
      card.classList.add("form-spotlight");
      spotlightTimer = window.setTimeout(() => card.classList.remove("form-spotlight"), 1700);
    };

    const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

    const scrollToForm = () => {
      const card = document.getElementById(targetId);
      if (!card) return;
      const isForm = targetId === CONTACT_FORM_ID;
      const el = (isForm ? card.querySelector("form") : null) ?? card;
      const rect = el.getBoundingClientRect();
      const targetY = isForm
        ? window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2
        : window.scrollY + rect.top - (parseFloat(getComputedStyle(card).scrollMarginTop) || 0);

      if (reducedMotion) {
        window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
        addSpotlight(card);
        return;
      }

      const startY = window.scrollY;
      const deltaY = targetY - startY;
      const t0 = performance.now();

      const step = (now: number) => {
        if (cancelled) return;
        const p = Math.min((now - t0) / 700, 1);
        window.scrollTo({ top: startY + deltaY * easeInOutCubic(p), left: 0, behavior: "auto" });
        if (p < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          addSpotlight(card);
        }
      };
      rafId = requestAnimationFrame(step);
    };

    const dwellTimer = window.setTimeout(scrollToForm, reducedMotion ? 0 : 180);

    return () => {
      cancelled = true;
      window.clearTimeout(dwellTimer);
      if (rafId) cancelAnimationFrame(rafId);
      if (spotlightTimer !== undefined) window.clearTimeout(spotlightTimer);
    };
  }, [location, reducedMotion]);

  return null;
}

function RevealObserver() {
  const { pathname } = useLocation();

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const root = document.getElementById('root');
      if (root) {
        observeReveals(root);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <div className="min-h-screen font-sans overflow-x-hidden">
      <Header />
      <ScrollToTop />
      <RevealObserver />
      <ContactFormProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ContactFormProvider>
      <Footer />
      <WhatsAppWidget />
      <div aria-hidden="true" className="grain" />
      <PerfHud />
    </div>
  );
}
