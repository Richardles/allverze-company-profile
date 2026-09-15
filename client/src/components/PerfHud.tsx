import { useEffect, useRef, useState } from "react";

type Stats = { fps: number; p95: number; max: number; jank: number };

const PARAMS = new URLSearchParams(window.location.search);
const ENABLED = PARAMS.has("perf");
const OFFGRAIN = ENABLED && (PARAMS.get("perf") === "0" || PARAMS.has("grainoff"));

function fmt(ms: number): string {
  return ms >= 100 ? ms.toFixed(0) : ms.toFixed(1);
}

export default function PerfHud() {
  const [stats, setStats] = useState<Stats | null>(null);
  const offGrainRef = useRef(OFFGRAIN);

  useEffect(() => {
    if (!ENABLED) return;
    document.documentElement.setAttribute("data-perf-grain", offGrainRef.current ? "0" : "1");

    const N = 120;
    const dts = new Float64Array(N);
    let idx = 0;
    let count = 0;
    let last = 0;
    let raf = 0;

    const loop = (now: number) => {
      if (last) {
        dts[idx] = now - last;
        idx = (idx + 1) % N;
        if (count < N) count++;
      }
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const timer = window.setInterval(() => {
      if (count === 0) return;
      const frames = dts.subarray(0, count);
      let sum = 0;
      for (let i = 0; i < frames.length; i++) sum += frames[i];
      const mean = sum / frames.length;
      const sorted = frames.slice().sort((a, b) => a - b);
      const p95 = sorted[Math.max(0, Math.floor(sorted.length * 0.95) - 1)];
      let jank = 0;
      for (let i = 0; i < frames.length; i++) if (frames[i] > 33.4) jank++;
      setStats({ fps: 1000 / mean, p95, max: sorted[sorted.length - 1], jank: (jank / frames.length) * 100 });
    }, 500);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(timer);
      document.documentElement.removeAttribute("data-perf-grain");
    };
  }, []);

  if (!ENABLED) return null;

  const color = stats ? (stats.fps >= 55 ? "#4ADE80" : "#FBBF24") : "#94A3B8";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        left: 12,
        bottom: 12,
        zIndex: 1000000,
        background: "rgba(4,10,20,0.82)",
        color,
        font: "11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace",
        padding: "8px 10px",
        borderRadius: 8,
        pointerEvents: "none",
        userSelect: "none",
        whiteSpace: "pre",
        boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
        border: "1px solid rgba(148,163,184,0.25)",
      }}
    >
      {stats
        ? `fps   ${stats.fps.toFixed(0)}\np95   ${fmt(stats.p95)}ms\nmax   ${fmt(stats.max)}ms\n>33ms ${stats.jank.toFixed(0)}%\n${OFFGRAIN ? "grain OFF" : "grain ON"}`
        : "warming\u2026"}
    </div>
  );
}