import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

type LogoShimmerProps = {
  src: string;
  baseCount?: number;
  minCount?: number;
  seed?: number;
};

type Dot = {
  x: number;
  y: number;
  size: number;
  dur: number;
  delay: number;
  min: number;
  max: number;
};

const REF_W = 1180;
const MIN_W = 360;
const SAMPLE_W = 320;
const SAMPLE_H = 157; // matches the 1280x628 lockup aspect
const POOL_MAX = 320;
const ALPHA_FLOOR = 0.55; // keep dots in the artwork interior so glows aren't clipped

const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const quantize = (n: number) => Math.max(2, Math.round(n / 2) * 2);

export default function LogoShimmer({
  src,
  baseCount = 80,
  minCount = 40,
  seed = 20260921,
}: LogoShimmerProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [pool, setPool] = useState<Dot[] | null>(null);
  const [count, setCount] = useState(baseCount);

  useEffect(() => {
    let cancelled = false;
    let built = false;
    const img = new Image();
    img.decoding = "async";

    const build = () => {
      if (cancelled || built) return;
      built = true;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = SAMPLE_W;
        canvas.height = SAMPLE_H;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, SAMPLE_W, SAMPLE_H);
        const { data } = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);

        const rand = mulberry32(seed);
        const dots: Dot[] = [];
        let attempts = 0;
        while (dots.length < POOL_MAX && attempts < POOL_MAX * 40) {
          attempts++;
          const x = rand();
          const y = rand();
          const px = Math.min(SAMPLE_W - 1, Math.max(0, Math.floor(x * SAMPLE_W)));
          const py = Math.min(SAMPLE_H - 1, Math.max(0, Math.floor(y * SAMPLE_H)));
          const a = data[(py * SAMPLE_W + px) * 4 + 3] / 255;
          if (a < ALPHA_FLOOR) continue;

          const size = 2 + rand() * rand() * 4; // 2-6px, biased small
          const dur = 2.5 + rand() * 4; // 2.5-6.5s per-star pulse
          const delay = rand() * 6.5; // negative offset -> already mid-cycle
          const min = 0.1 + rand() * 0.15;
          const max = 0.55 + rand() * 0.45;
          dots.push({ x, y, size, dur, delay, min, max });
        }
        if (!cancelled) setPool(dots);
      } catch {
        /* canvas unavailable -> nothing renders (graceful no-op) */
      }
    };

    img.onload = build;
    img.src = src;
    if (img.complete && img.naturalWidth > 0) build();

    return () => {
      cancelled = true;
      img.onload = null;
    };
  }, [src, seed]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const compute = () => {
      const w = host.clientWidth || REF_W;
      const t = Math.min(1, Math.max(0, (w - MIN_W) / (REF_W - MIN_W)));
      setCount(quantize(minCount + (baseCount - minCount) * t));
    };
    compute();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(compute);
    ro.observe(host);
    return () => ro.disconnect();
  }, [baseCount, minCount]);

  const dots = useMemo(() => (pool ? pool.slice(0, count) : []), [pool, count]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="logo-shimmer"
      style={{ WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}
    >
      {dots.map((d, i) => (
        <span
          key={i}
          className="logo-shimmer__dot"
          style={
            {
              left: `${d.x * 100}%`,
              top: `${d.y * 100}%`,
              width: `${d.size}px`,
              height: `${d.size}px`,
              "--s-dur": `${d.dur}s`,
              "--s-delay": `${-d.delay}s`,
              "--s-min": d.min,
              "--s-max": d.max,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
