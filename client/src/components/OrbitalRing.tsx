import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { usePrefersReducedMotion } from "../lib/browser";
import { CONSTELLATIONS, MAX_CONSTELLATION_EDGES } from "../lib/constellations";

interface OrbitalRingProps {
  size?: number;
  className?: string;
  variant?: "tube" | "constellation";
  speed?: "majestic" | "lively";
}

interface Layer {
  w: number;
  o: number;
}

interface Band {
  core: Layer;
  mid: Layer;
  halo: Layer;
}

interface VariantTuning {
  bands: Band[];
  coreS: number;
  midS: number;
  haloS: number;
  guideOpacity: number;
  glowAlpha: number;
  starNodes: boolean;
}

interface Orbit {
  a: number;
  e: number;
  omega: number;
  M0: number;
  theta: number;
  p: number;
  P: number;
}

interface Star extends Orbit {
  k: string;
  x: number;
  y: number;
  coreR: number;
  glowR: number;
  base: number;
  hueIdx: number;
}

const VARIANTS: Record<"tube" | "constellation", VariantTuning> = {
  tube: {
    bands: [
      { core: { w: 0.006, o: 0.6 }, mid: { w: 0.014, o: 0.35 }, halo: { w: 0.032, o: 0.15 } },
      { core: { w: 0.005, o: 0.5 }, mid: { w: 0.012, o: 0.3 }, halo: { w: 0.028, o: 0.12 } },
      { core: { w: 0.004, o: 0.42 }, mid: { w: 0.01, o: 0.25 }, halo: { w: 0.024, o: 0.1 } },
    ],
    coreS: 0.003,
    midS: 0.007,
    haloS: 0.022,
    guideOpacity: 0.05,
    glowAlpha: 0.2,
    starNodes: false,
  },
  constellation: {
    bands: [
      { core: { w: 0.0026, o: 0.42 }, mid: { w: 0.006, o: 0.2 }, halo: { w: 0.016, o: 0.08 } },
      { core: { w: 0.0022, o: 0.35 }, mid: { w: 0.005, o: 0.16 }, halo: { w: 0.014, o: 0.06 } },
      { core: { w: 0.0018, o: 0.28 }, mid: { w: 0.004, o: 0.12 }, halo: { w: 0.012, o: 0.05 } },
    ],
    coreS: 0.0017,
    midS: 0.00425,
    haloS: 0.0119,
    guideOpacity: 0.02,
    glowAlpha: 0.12,
    starNodes: true,
  },
};

/* Star spectral-class colors (photometric tint in the PSF wings; the saturated
   core stays white). B = blue-white (Rigel), A = white (Sirius/Vega), F/G =
   yellow-white (Procyon / the Sun), K = light orange (Arcturus), M = orange-red
   (Betelgeuse). Index range 0..5; corona gradient defs are emitted per index. */
const STAR_PALETTE = [
  "#9BB0FF", // B  blue-white
  "#CAD7FF", // A  white-blue
  "#F8F6F0", // F  yellow-white
  "#FFF4EA", // G  Sun-like
  "#FFE1B0", // K  light orange
  "#FFC08A", // M  orange-red
];

const radians = (deg: number) => (deg * Math.PI) / 180;

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

/* Balanced spectral census (~50% warm): the night sky is M/K-dwarf dominated so the
   faint field skews warm, with enough A/B stars to keep the classic blue-white tint. */
const pickStarHue = (rand: () => number): number => {
  const u = rand();
  const w = [0.12, 0.2, 0.18, 0.08, 0.16, 0.26]; // B A F G K M
  let acc = 0;
  for (let i = 0; i < w.length; i++) {
    acc += w[i];
    if (u < acc) return i;
  }
  return w.length - 1;
};

const BAND_ROTATIONS = [0, 60, -60];
const PLANE_SQUASH = 0.157 / 0.405; // cos(inclination) of the projected orbit plane (~67 deg)
const ORBIT_SPEED: Record<"majestic" | "lively", number> = { majestic: 1, lively: 0.45 };
// Kepler's 3rd law: P = K * a^1.5 (K absorbs 2*pi/sqrt(G*M)); ~29s at a=0.405.
// NOTE: time is compressed for an interactive hero; the Kepler ratios are exact.
const PERIOD_K = 112.5;

interface CometGeo {
  head: [number, number];
  lanes: [number, number][][];
  blowout: [number, number][];
  ionEnd: [number, number];
  sodiumEnd: [number, number];
  motes: [number, number][];
  rRatio: number;
}

const EPOCHS = 18;
const EPOCH_LAG = 0.055; // rad of mean anomaly between sequential emission epochs
const COMET_TRAIL_SCALE = 1.012; // heavy-grain debris-husk: orbit scaled +1.2%
const COMET_TRAIL_OP = 0.05;
const ION_RATIO = 0.28; // straight ion tail length as fraction of size
const ION_ABERRATION = 0.06; // ion tail deviates from exact anti-solar by solar-wind aberration (rad)
const ION_KINK = 0.16; // slow kink amplitude (rad) from draped interplanetary-field structure
const ION_KINK_PERIOD = 9; // seconds per kink cycle
const SODIUM_RATIO = 1.5; // neutral sodium tail ~1.5x the ion tail length (NEOWISE/Hale-Bopp)
const SODIUM_KINK = 0.4; // Na atoms deflect less than ions → dampened share of the ion kink
const SODIUM_OP = 0.055; // very faint — only bright comets show it

/* Finson–Probstein β ladder: ratio of radiation pressure to solar gravity.
   β ≈ 0.574/(ρ·a_µm) (Burns, Lamy & Soter 1979). Low β = mm–cm debris that hugs the
   cometary orbit; mid β = µm grains that form the curved anti-solar dust tail;
   β ≥ 0.5 = sub-µm grains blown onto unbound near-straight streams (NEOWISE β~0.5–0.9). */
const BETA_LADDER = [0.004, 0.03, 0.09, 0.18, 0.34, 0.55];
const BLOWOUT_BETA = 0.85;
const EJECT_JITTER = 0.014; // ε ejection-velocity spread as fraction of size (Combi & Smyth)

/* Dust shines by reflected sunlight → yellow-white, reddening with age/processing:
   fresh low-β lanes hang near-white at the orbit; old high-β lanes read amber at the
   anti-solar tip. µm-grain scattering dominates the visible tail → mid-ladder lanes
   are brightest; heavy (low-β) grains are IR-dominated and faint at visible wavelengths. */
const LANE_COLOR = ["#FFF6E0", "#FFEFD2", "#FFE7C0", "#FFE0AC", "#FFD897", "#FFCC6E"];
const LANE_W = [0.005, 0.007, 0.009, 0.011, 0.008, 0.006];
const LANE_OP = [0.035, 0.07, 0.119, 0.14, 0.091, 0.056];
const LANE_FILTER = ["haloblur", "haloblur", "midblur", "midblur", "midblur", "coreblur"];

function keplerSolve(M: number, e: number): number {
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 5; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}

function orbitScreenPos(
  o: Pick<Orbit, "a" | "e" | "omega" | "theta" | "p">,
  M: number,
  cx: number,
  cy: number,
): [number, number] {
  const E = keplerSolve(M, o.e);
  const r = o.a * (1 - o.e * Math.cos(E));
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + o.e) * Math.sin(E / 2),
    Math.sqrt(1 - o.e) * Math.cos(E / 2),
  );
  const w = nu + o.omega;
  const u = r * Math.cos(w);
  const v = r * Math.sin(w);
  const th = o.theta;
  return [
    cx + u * Math.cos(th) - v * Math.sin(th),
    cy + (u * Math.sin(th) + v * Math.cos(th)) * o.p,
  ];
}

/* True comet model (Finson–Probstein): grains are emitted at the nucleus with each
   grain on its OWN orbit — radiation pressure enlarges the effective semi-major axis
   (a/(1−β)) and since P ∝ a^1.5 the grain advances slower, so it lags the head and the
   tail curves (Kepler 3). Grain positions are anchored so the stream base always
   emanates from the nucleus. Ion tail streams anti-solar with a solar-wind
   aberration + a slow magnetic kink. */
function cometGeometry(
  o: Orbit,
  M: number,
  cx: number,
  cy: number,
  size: number,
  kinkPhase = 0,
): CometGeo {
  const head: [number, number] = orbitScreenPos(o, M, cx, cy);

  const grainPoint = (beta: number, k: number): [number, number] => {
    const dM = k * EPOCH_LAG;
    const aG = o.a / (1 - beta);
    const eG = o.e + beta * 0.3;
    const Mg = M - dM * (1 - Math.pow(1 - beta, 1.5));
    const emit = orbitScreenPos(o, M - dM, cx, cy);
    const g = orbitScreenPos({ a: aG, e: eG, omega: o.omega, theta: o.theta, p: o.p }, Mg, cx, cy);
    return [head[0] + (g[0] - emit[0]), head[1] + (g[1] - emit[1])];
  };

  const lanes: [number, number][][] = BETA_LADDER.map((beta, lane) => {
    const pts: [number, number][] = [];
    for (let k = 0; k < EPOCHS; k++) {
      const [x, y] = grainPoint(beta, k);
      const jx = Math.sin(k * 12.9898 + lane * 78.233) * EJECT_JITTER * size * Math.max(beta, 0.03);
      const jy = Math.cos(k * 39.7101 + lane * 27.439) * EJECT_JITTER * size * Math.max(beta, 0.03);
      pts.push([x + jx, y + jy]);
    }
    return pts;
  });

  const blowout: [number, number][] = [];
  for (let k = 0; k < 12; k++) {
    blowout.push(grainPoint(BLOWOUT_BETA, k));
  }

  const [hx, hy] = head;
  const aDx = cx - hx;
  const aDy = cy - hy;
  const aDl = Math.hypot(aDx, aDy) || 1;
  const bend = ION_ABERRATION + ION_KINK * Math.sin(kinkPhase);
  const cosB = Math.cos(bend);
  const sinB = Math.sin(bend);
  const dx = (aDx * cosB - aDy * sinB) / aDl;
  const dy = (aDx * sinB + aDy * cosB) / aDl;
  const ionEnd: [number, number] = [hx + dx * ION_RATIO * size, hy + dy * ION_RATIO * size];

  const bendNa = ION_ABERRATION + ION_KINK * SODIUM_KINK * Math.sin(kinkPhase);
  const cosNb = Math.cos(bendNa);
  const sinNb = Math.sin(bendNa);
  const naDx = (aDx * cosNb - aDy * sinNb) / aDl;
  const naDy = (aDx * sinNb + aDy * cosNb) / aDl;
  const sodiumEnd: [number, number] = [
    hx + naDx * ION_RATIO * SODIUM_RATIO * size,
    hy + naDy * ION_RATIO * SODIUM_RATIO * size,
  ];

  const motes: [number, number][] = [2, 5, 8, 11, 14].map((k) => {
    const [px, py] = lanes[2][k];
    return [
      px + Math.sin(k * 12.9898) * 0.02 * size,
      py + Math.cos(k * 78.233) * 0.02 * size,
    ];
  });

  const E = keplerSolve(M, o.e);
  const r = Math.max(o.a * (1 - o.e * Math.cos(E)), 0.0001);
  const rRatio = (o.a / r) * (o.a / r);

  return { head, lanes, blowout, ionEnd, sodiumEnd, motes, rRatio };
}

const cometHeadOpacity = (rRatio: number) => Math.min(1, rRatio * 0.92);

const fanPath = (geo: CometGeo): string => {
  const [hx, hy] = geo.head;
  const hi = geo.lanes[geo.lanes.length - 1];
  const lo = geo.lanes[0];
  const parts: string[] = [`M ${hx.toFixed(2)} ${hy.toFixed(2)}`];
  for (let k = 1; k < hi.length; k++) parts.push(`L ${hi[k][0].toFixed(2)} ${hi[k][1].toFixed(2)}`);
  for (let k = lo.length - 2; k >= 1; k--) parts.push(`L ${lo[k][0].toFixed(2)} ${lo[k][1].toFixed(2)}`);
  parts.push("Z");
  return parts.join(" ");
};

const MOTE_R = [0.014, 0.011, 0.009, 0.007, 0.005];
const MOTE_OP = [0.3, 0.24, 0.18, 0.12, 0.08];

export default function OrbitalRing({
  size = 480,
  className = "",
  variant = "tube",
  speed = "majestic",
}: OrbitalRingProps) {
  const reduced = usePrefersReducedMotion();
  const [forcePlay, setForcePlay] = useState(false);
  const reducedEff = reduced && !forcePlay;
  const tuning = VARIANTS[variant];
  const cx = size / 2;
  const cy = size / 2;
  const id = `orb-${size}-${variant}-${speed}`;
  const rx = size * 0.405;
  const ry = size * 0.157;
  const reactRadius = size * 0.24;
  const interactive = tuning.starNodes;

  const stars = useMemo<Star[]>(() => {
    const list: Star[] = [];
    if (!tuning.starNodes) return list;
    const rand = mulberry32(size * 7919 + 37);
    const scale = ORBIT_SPEED[speed];

    const add = (orb: { aN: number; e: number; theta: number; p: number; dust?: boolean }) => {
      const u = rand();
      let base: number;
      let core: number;
      if (orb.dust) {
        base = 0.22 + rand() * 0.1;
        core = 0.0028 + rand() * 0.0012;
      } else if (u < 0.6) {
        base = 0.42 + rand() * 0.13;
        core = 0.0035 + rand() * 0.0015;
      } else if (u < 0.85) {
        base = 0.62 + rand() * 0.13;
        core = 0.0052 + rand() * 0.002;
      } else if (u < 0.97) {
        base = 0.82 + rand() * 0.1;
        core = 0.0074 + rand() * 0.0022;
      } else {
        base = 0.95;
        core = 0.0096 + rand() * 0.0014;
      }
      const s: Star = {
        k: list.length.toString(),
        x: 0,
        y: 0,
        coreR: core * size,
        glowR: Math.max(core * size * 2.6, size * 0.02),
        base,
        hueIdx: pickStarHue(rand),
        a: orb.aN * size,
        e: orb.e,
        omega: radians(rand() * 360),
        M0: radians(rand() * 360),
        theta: orb.theta,
        p: orb.p,
        P: PERIOD_K * Math.pow(orb.aN, 1.5) * scale,
      };
      [s.x, s.y] = orbitScreenPos(s, s.M0, cx, cy);
      list.push(s);
    };

    for (let b = 0; b < 3; b++) {
      const theta = radians(BAND_ROTATIONS[b]);
      for (let j = 0; j < 6; j++) {
        add({ aN: 0.38 + rand() * 0.05, e: 0.02 + rand() * 0.1, theta, p: PLANE_SQUASH });
      }
    }
    for (let j = 0; j < 6; j++) {
      add({ aN: 0.425, e: 0.02 + rand() * 0.03, theta: 0, p: 1 });
    }
    for (let j = 0; j < 3; j++) {
      add({
        aN: 0.05 + rand() * 0.13,
        e: 0.05 + rand() * 0.3,
        theta: radians(rand() * 360),
        p: 0.6 + rand() * 0.35,
        dust: true,
      });
    }

    const ranked = [...list].sort((a, b) => b.coreR - a.coreR);
    // Great-comet two-tone pair: brightest = A blue-white, second = M orange.
    if (ranked[0]) ranked[0].hueIdx = 1;
    if (ranked[1]) ranked[1].hueIdx = 5;
    return list;
  }, [size, tuning.starNodes, cx, cy, speed]);

  const comet = useMemo(
    () => {
      if (!tuning.starNodes) return null;
      return {
        a: size * 0.3,
        e: 0.06,
        omega: 0,
        M0: 0,
        theta: 0,
        p: PLANE_SQUASH,
        P: PERIOD_K * Math.pow(0.3, 1.5) * ORBIT_SPEED[speed],
      };
    },
    [size, tuning.starNodes, speed],
  );

  const cometGeo = useMemo(() => {
    if (!comet) return null;
    return cometGeometry(comet, comet.M0, cx, cy, size);
  }, [comet, cx, cy, size]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const starRefs = useRef<(SVGGElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const headRef = useRef<SVGGElement | null>(null);
  const laneRefs = useRef<(SVGPolylineElement | null)[]>([]);
  const blowoutRef = useRef<SVGPolylineElement | null>(null);
  const fanPathRef = useRef<SVGPathElement | null>(null);
  const fanGradRef = useRef<SVGLinearGradientElement | null>(null);
  const ionLineRefs = useRef<(SVGLineElement | null)[]>([]);
  const sodiumRef = useRef<SVGLineElement | null>(null);
  const comaglowRef = useRef<SVGRadialGradientElement | null>(null);
  const moteRefs = useRef<(SVGGElement | null)[]>([]);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const constellationLineRefs = useRef<(SVGLineElement | null)[]>([]);
  const leaderRef = useRef<SVGLineElement | null>(null);
  const constellationLabelRef = useRef<SVGTextElement | null>(null);
  const timeRef = useRef(0);
  const constellationStateRef = useRef<{
    name: string;
    starIdx: number[];
    edges: Array<[number, number]>;
    anchor: number;
    alpha: number;
  } | null>(null);
  const constellationTargetAlphaRef = useRef(0.85);
  const lastNearestRef = useRef(-1);
  const dwellRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hovering, setHovering] = useState(false);

  const paintConstellation = useCallback(
    (
      ptr: { x: number; y: number } | null,
      pos: [number, number][],
      instant = false,
    ) => {
    const c = constellationStateRef.current;
    if (c) {
      if (instant) c.alpha = constellationTargetAlphaRef.current;
      else c.alpha += (constellationTargetAlphaRef.current - c.alpha) * 0.14;
    }
    const a = c ? c.alpha : 0;
    for (let k = 0; k < MAX_CONSTELLATION_EDGES; k++) {
      const el = constellationLineRefs.current[k];
      if (!el) continue;
      if (c && k < c.edges.length) {
        const e = c.edges[k];
        const p0 = pos[c.starIdx[e[0]]];
        const p1 = pos[c.starIdx[e[1]]];
        if (p0 && p1) {
          el.setAttribute("x1", p0[0].toFixed(2));
          el.setAttribute("y1", p0[1].toFixed(2));
          el.setAttribute("x2", p1[0].toFixed(2));
          el.setAttribute("y2", p1[1].toFixed(2));
        }
        el.setAttribute("opacity", (a * 0.85).toFixed(3));
      } else {
        el.setAttribute("opacity", "0");
      }
    }
    const lead = leaderRef.current;
    if (lead) {
      if (c && ptr && a > 0.02) {
        const p = pos[c.starIdx[c.anchor]];
        if (p) {
          lead.setAttribute("x1", p[0].toFixed(2));
          lead.setAttribute("y1", p[1].toFixed(2));
          lead.setAttribute("x2", ptr.x.toFixed(2));
          lead.setAttribute("y2", ptr.y.toFixed(2));
          lead.setAttribute("opacity", (Math.min(1, a * 1.4) * 0.75).toFixed(3));
        }
      } else {
        lead.setAttribute("opacity", "0");
      }
    }
    const lab = constellationLabelRef.current;
    if (lab) {
      if (c && a > 0.02) {
        const p = pos[c.starIdx[c.anchor]];
        if (p) {
          lab.setAttribute("x", (p[0] + size * 0.024).toFixed(2));
          lab.setAttribute("y", (p[1] - size * 0.026).toFixed(2));
          lab.setAttribute("opacity", (a * 0.98).toFixed(3));
        }
      } else {
        lab.setAttribute("opacity", "0");
      }
    }
    },
    [size],
  );

  useEffect(() => {
    if (!interactive || !comet || reducedEff) return;
    const t0 = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const t = (now - t0) / 1000;
      timeRef.current = t;
      const M = comet.M0 + (2 * Math.PI * t) / comet.P;

      const geo = cometGeometry(comet, M, cx, cy, size, (2 * Math.PI * t) / ION_KINK_PERIOD);
      const boost = Math.min(1.35, Math.max(0.6, 0.55 + geo.rRatio * 0.45));

      if (headRef.current) {
        headRef.current.setAttribute("transform", `translate(${geo.head[0].toFixed(2)},${geo.head[1].toFixed(2)})`);
        headRef.current.setAttribute("opacity", cometHeadOpacity(geo.rRatio).toFixed(3));
      }
      const laneEls = laneRefs.current;
      for (let i = 0; i < laneEls.length; i++) {
        const el = laneEls[i];
        if (el) {
          el.setAttribute("points", geo.lanes[i].map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" "));
          el.setAttribute("opacity", (LANE_OP[i] * boost).toFixed(3));
        }
      }
      if (blowoutRef.current) {
        blowoutRef.current.setAttribute(
          "points",
          geo.blowout.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" "),
        );
      }
      if (fanPathRef.current) {
        fanPathRef.current.setAttribute("d", fanPath(geo));
        fanPathRef.current.setAttribute("opacity", (0.1 * boost).toFixed(3));
      }
      if (fanGradRef.current) {
        const gx = geo.head[0];
        const gy = geo.head[1];
        const gL = Math.hypot(cx - gx, cy - gy) || 1;
        fanGradRef.current.setAttribute("x1", gx.toFixed(2));
        fanGradRef.current.setAttribute("y1", gy.toFixed(2));
        fanGradRef.current.setAttribute("x2", (gx + ((cx - gx) / gL) * 0.42 * size).toFixed(2));
        fanGradRef.current.setAttribute("y2", (gy + ((cy - gy) / gL) * 0.42 * size).toFixed(2));
        fanGradRef.current.setAttribute("opacity", (0.1 * boost).toFixed(3));
      }

      const comag = comaglowRef.current;
      if (comag) {
        const hx = geo.head[0];
        const hy = geo.head[1];
        const sdl = Math.hypot(cx - hx, cy - hy) || 1;
        const shx = hx + ((cx - hx) / sdl) * size * 0.02;
        const shy = hy + ((cy - hy) / sdl) * size * 0.02;
        comag.setAttribute("cx", hx.toFixed(2));
        comag.setAttribute("cy", hy.toFixed(2));
        comag.setAttribute("fx", shx.toFixed(2));
        comag.setAttribute("fy", shy.toFixed(2));
      }

      const ion = ionLineRefs.current;
      if (ion[0]) {
        ion[0].setAttribute("x1", geo.head[0].toFixed(2));
        ion[0].setAttribute("y1", geo.head[1].toFixed(2));
        ion[0].setAttribute("x2", geo.ionEnd[0].toFixed(2));
        ion[0].setAttribute("y2", geo.ionEnd[1].toFixed(2));
      }
      if (ion[1]) {
        ion[1].setAttribute("x1", geo.head[0].toFixed(2));
        ion[1].setAttribute("y1", geo.head[1].toFixed(2));
        ion[1].setAttribute("x2", geo.ionEnd[0].toFixed(2));
        ion[1].setAttribute("y2", geo.ionEnd[1].toFixed(2));
      }
      if (sodiumRef.current) {
        sodiumRef.current.setAttribute("x1", geo.head[0].toFixed(2));
        sodiumRef.current.setAttribute("y1", geo.head[1].toFixed(2));
        sodiumRef.current.setAttribute("x2", geo.sodiumEnd[0].toFixed(2));
        sodiumRef.current.setAttribute("y2", geo.sodiumEnd[1].toFixed(2));
      }

      geo.motes.forEach(([x, y], i) => {
        const g = moteRefs.current[i];
        if (g) g.setAttribute("transform", `translate(${x.toFixed(2)},${y.toFixed(2)})`);
      });

      const ptr = pointerRef.current;
      const loopPos: [number, number][] = new Array(stars.length);
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const t2 = s.M0 + (2 * Math.PI * t) / s.P;
        const [x, y] = orbitScreenPos(s, t2, cx, cy);
        loopPos[i] = [x, y];
        const g = starRefs.current[i];
        if (g) g.setAttribute("transform", `translate(${x.toFixed(2)},${y.toFixed(2)})`);
        const line = lineRefs.current[i];
        if (line) {
          if (!ptr) {
            line.setAttribute("opacity", "0");
            continue;
          }
          const d = Math.hypot(ptr.x - x, ptr.y - y);
          const a = d <= reactRadius && d > 0.01 ? Math.pow(1 - d / reactRadius, 2) * 0.8 : 0;
          line.setAttribute("x1", x.toFixed(2));
          line.setAttribute("y1", y.toFixed(2));
          line.setAttribute("x2", ptr.x.toFixed(2));
          line.setAttribute("y2", ptr.y.toFixed(2));
          line.setAttribute("opacity", a.toFixed(3));
        }
      }

      paintConstellation(ptr, loopPos);

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      if (dwellRef.current) {
        clearTimeout(dwellRef.current);
        dwellRef.current = null;
      }
    };
  }, [stars, comet, reducedEff, interactive, cx, cy, reactRadius, size, paintConstellation]);

  const applyLines = (ptr: { x: number; y: number }) => {
    for (let i = 0; i < stars.length; i++) {
      const line = lineRefs.current[i];
      if (!line) continue;
      const s = stars[i];
      const d = Math.hypot(ptr.x - s.x, ptr.y - s.y);
      const a = d <= reactRadius && d > 0.01 ? Math.pow(1 - d / reactRadius, 2) * 0.8 : 0;
      line.setAttribute("x1", s.x.toFixed(2));
      line.setAttribute("y1", s.y.toFixed(2));
      line.setAttribute("x2", ptr.x.toFixed(2));
      line.setAttribute("y2", ptr.y.toFixed(2));
      line.setAttribute("opacity", a.toFixed(3));
    }
  };

  const computeLivePositions = (t: number): [number, number][] => {
    const out: [number, number][] = new Array(stars.length);
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      out[i] = orbitScreenPos(s, s.M0 + (2 * Math.PI * t) / s.P, cx, cy);
    }
    return out;
  };

  const rollConstellation = (ptr: { x: number; y: number }, posIn?: [number, number][]) => {
    if (!interactive || stars.length < 2) return;
    const pos = posIn ?? computeLivePositions(timeRef.current);
    const usable = CONSTELLATIONS.filter((cn) => cn.vertices.length <= stars.length);
    const curName = constellationStateRef.current?.name;
    const pickable = curName ? usable.filter((cn) => cn.name !== curName) : usable;
    if (pickable.length === 0) return;
    const entry = pickable[Math.floor(Math.random() * pickable.length)];

    const scale = size * 0.36;
    let cxm = 0;
    let cym = 0;
    for (const [vx, vy] of entry.vertices) {
      cxm += vx;
      cym += vy;
    }
    cxm /= entry.vertices.length;
    cym /= entry.vertices.length;
    let tx = ptr.x - cxm * scale;
    let ty = ptr.y - cym * scale;
    const minT = size * 0.05;
    tx = Math.min(Math.max(tx, minT), size - scale - minT);
    ty = Math.min(Math.max(ty, minT), size - scale - minT);

    const targets = entry.vertices.map(
      ([vx, vy]) => [tx + vx * scale, ty + vy * scale] as [number, number],
    );
    const starIdx: number[] = new Array(entry.vertices.length).fill(-1);
    const used = new Set<number>();

    let vAnchor = 0;
    let vdBest = Infinity;
    for (let i = 0; i < targets.length; i++) {
      const dx = targets[i][0] - ptr.x;
      const dy = targets[i][1] - ptr.y;
      const d = dx * dx + dy * dy;
      if (d < vdBest) {
        vdBest = d;
        vAnchor = i;
      }
    }
    let sAnchor = -1;
    let sdBest = Infinity;
    for (let i = 0; i < stars.length; i++) {
      const dx = pos[i][0] - ptr.x;
      const dy = pos[i][1] - ptr.y;
      const d = dx * dx + dy * dy;
      if (d < sdBest) {
        sdBest = d;
        sAnchor = i;
      }
    }
    if (sAnchor === -1) return;
    starIdx[vAnchor] = sAnchor;
    used.add(sAnchor);

    const maxAssign = size * 0.42;
    for (const [a, b] of entry.edges) {
      for (const vi of [a, b]) {
        if (starIdx[vi] !== -1) continue;
        let bi = -1;
        let bd = Infinity;
        for (let i = 0; i < stars.length; i++) {
          if (used.has(i)) continue;
          const dx = pos[i][0] - targets[vi][0];
          const dy = pos[i][1] - targets[vi][1];
          const d = dx * dx + dy * dy;
          if (d < bd) {
            bd = d;
            bi = i;
          }
        }
        if (bi !== -1 && bd <= maxAssign * maxAssign) {
          starIdx[vi] = bi;
          used.add(bi);
        }
      }
    }

    const edges: Array<[number, number]> = [];
    for (const [a, b] of entry.edges) {
      if (starIdx[a] !== -1 && starIdx[b] !== -1) edges.push([starIdx[a], starIdx[b]]);
    }
    if (edges.length === 0) return;

    constellationStateRef.current = {
      name: entry.name,
      starIdx,
      edges,
      anchor: starIdx[vAnchor],
      alpha: 0.12,
    };
    constellationTargetAlphaRef.current = 0.85;
    if (constellationLabelRef.current) {
      constellationLabelRef.current.textContent = entry.name.toUpperCase();
    }
    lastNearestRef.current = sAnchor;
    paintConstellation(ptr, pos, reducedEff);
  };

  const updateTargetAlpha = (ptr: { x: number; y: number }, pos: [number, number][]) => {
    const c = constellationStateRef.current;
    if (!c) {
      constellationTargetAlphaRef.current = 0;
      return;
    }
    let ax = 0;
    let ay = 0;
    let n = 0;
    for (const si of c.starIdx) {
      const p = pos[si];
      if (p) {
        ax += p[0];
        ay += p[1];
        n++;
      }
    }
    if (n === 0) {
      constellationTargetAlphaRef.current = 0;
      return;
    }
    ax /= n;
    ay /= n;
    const d = Math.hypot(ptr.x - ax, ptr.y - ay);
    const r = reactRadius * 2.4;
    let a = 1 - Math.max(0, d - r * 0.25) / (r * 1.15);
    a = Math.max(0, Math.min(1, a));
    constellationTargetAlphaRef.current = Math.pow(a, 1.5);
  };

  const handleMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const ptr = {
      x: ((e.clientX - rect.left) / rect.width) * size,
      y: ((e.clientY - rect.top) / rect.height) * size,
    };
    pointerRef.current = ptr;
    const pos = computeLivePositions(timeRef.current);
    let ni = -1;
    let nd = Infinity;
    for (let i = 0; i < stars.length; i++) {
      const dx = pos[i][0] - ptr.x;
      const dy = pos[i][1] - ptr.y;
      const d = dx * dx + dy * dy;
      if (d < nd) {
        nd = d;
        ni = i;
      }
    }
    if (ni !== -1 && ni !== lastNearestRef.current) {
      rollConstellation(ptr, pos);
    } else {
      updateTargetAlpha(ptr, pos);
      if (reducedEff) paintConstellation(ptr, pos, true);
    }
    if (dwellRef.current) clearTimeout(dwellRef.current);
    dwellRef.current = setTimeout(() => {
      const p = pointerRef.current;
      if (p) rollConstellation(p);
    }, 2000);
    if (reducedEff) applyLines(ptr);
  };

  const handleEnter = () => {
    if (!interactive) return;
    setHovering(true);
    const ptr = pointerRef.current ?? { x: cx, y: cy };
    rollConstellation(ptr, computeLivePositions(timeRef.current));
  };

  const handleLeave = () => {
    pointerRef.current = null;
    setHovering(false);
    constellationTargetAlphaRef.current = 0;
    lastNearestRef.current = -1;
    if (dwellRef.current) {
      clearTimeout(dwellRef.current);
      dwellRef.current = null;
    }
  };

  const staticLanesMemo = cometGeo
    ? BETA_LADDER.map((_, i) =>
        cometGeo.lanes[i].map(([x, y]) => `${x},${y}`).join(" "),
      )
    : [];

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ maxWidth: size, width: "100%", marginInline: "auto", position: "relative" }}
      {...(interactive
        ? { onMouseEnter: handleEnter, onMouseMove: handleMove, onMouseLeave: handleLeave }
        : {})}
    >
      <svg
        width="100%"
        height="auto"
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: "visible", display: "block" }}
        shapeRendering="geometricPrecision"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}-g1`} x1="0%" y1="0%" x2="100%" y2="100%" colorInterpolation="linearRGB">
            <stop offset="0%" stopColor="#0B1D35" />
            <stop offset="22%" stopColor="#0E2A55" />
            <stop offset="50%" stopColor="#0066FF" />
            <stop offset="78%" stopColor="#2EA8F8" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient id={`${id}-g2`} x1="100%" y1="0%" x2="0%" y2="100%" colorInterpolation="linearRGB">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="25%" stopColor="#2EA8F8" />
            <stop offset="55%" stopColor="#0066FF" />
            <stop offset="80%" stopColor="#0E2A55" />
            <stop offset="100%" stopColor="#0B1D35" />
          </linearGradient>
          <linearGradient id={`${id}-g3`} x1="0%" y1="100%" x2="100%" y2="0%" colorInterpolation="linearRGB">
            <stop offset="0%" stopColor="#0B1D35" />
            <stop offset="35%" stopColor="#0F3E8F" />
            <stop offset="70%" stopColor="#1688F0" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%" colorInterpolation="linearRGB">
            <stop offset="0%" stopColor="#0066FF" stopOpacity={tuning.glowAlpha} />
            <stop offset="45%" stopColor="#0066FF" stopOpacity={tuning.glowAlpha * 0.38} />
            <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-starglow`} colorInterpolation="linearRGB">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#9BD4FF" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#9BD4FF" stopOpacity="0" />
          </radialGradient>
          <linearGradient
            id={`${id}-fan`}
            gradientUnits="userSpaceOnUse"
            x1="0" y1="0" x2="1" y2="0"
            colorInterpolation="linearRGB"
          >
            <stop offset="0%" stopColor="#FFF6E0" stopOpacity="0.09" />
            <stop offset="40%" stopColor="#FFD894" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#FFC060" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${id}-solar-disk`} colorInterpolation="linearRGB">
            <stop offset="0%" stopColor="#FFFDF6" stopOpacity="1" />
            <stop offset="55%" stopColor="#FFF7E9" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFEDD6" stopOpacity="0.88" />
          </radialGradient>
          <radialGradient id={`${id}-solar-corona`} colorInterpolation="linearRGB">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#F4FAFF" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#F4FAFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient
            id={`${id}-comaglow`}
            ref={comaglowRef}
            gradientUnits="userSpaceOnUse"
            cx={cometGeo ? cometGeo.head[0] : 0}
            cy={cometGeo ? cometGeo.head[1] : 0}
            fx={cometGeo ? cometGeo.head[0] : 0}
            fy={cometGeo ? cometGeo.head[1] : 0}
            r={size * 0.05}
            colorInterpolation="linearRGB"
          >
            <stop offset="0%" stopColor="#7CFCA8" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#49E08C" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#49E08C" stopOpacity="0" />
          </radialGradient>
          {STAR_PALETTE.map((hue, i) => (
            <radialGradient key={hue} id={`${id}-cor-${i}`} colorInterpolation="linearRGB">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="32%" stopColor={hue} />
              <stop offset="100%" stopColor={hue} stopOpacity="0" />
            </radialGradient>
          ))}
          <filter id={`${id}-coreblur`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="linearRGB">
            <feGaussianBlur stdDeviation={size * tuning.coreS} />
          </filter>
          <filter id={`${id}-midblur`} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="linearRGB">
            <feGaussianBlur stdDeviation={size * tuning.midS} />
          </filter>
          <filter id={`${id}-haloblur`} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="linearRGB">
            <feGaussianBlur stdDeviation={size * tuning.haloS} />
          </filter>
          <filter id={`${id}-softglow`} x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="linearRGB">
            <feGaussianBlur stdDeviation={size * 0.05} />
          </filter>
        </defs>

        <circle cx={cx} cy={cy} r={size * 0.42} fill={`url(#${id}-glow)`} className="glow-pulse" />

        <circle
          cx={cx} cy={cy}
          r={size * 0.425}
          fill="none"
          stroke="#38BDF8"
          strokeWidth={size * 0.0025}
          opacity={tuning.guideOpacity}
          filter={`url(#${id}-haloblur)`}
        />

        {tuning.bands.map((band, i) => {
          const rotate = BAND_ROTATIONS[i];
          const stroke = `url(#${id}-g${i + 1})`;
          const layers = [
            { layer: band.halo, f: `${id}-haloblur` },
            { layer: band.mid, f: `${id}-midblur` },
            { layer: band.core, f: `${id}-coreblur` },
          ];
          if (variant === "constellation") {
            return (
              <g key={i} transform={`rotate(${rotate},${cx},${cy})`}>
                {layers.map(({ layer, f }) => (
                  <ellipse
                    key={f}
                    cx={cx} cy={cy} rx={rx} ry={ry}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={size * layer.w}
                    strokeLinecap="round"
                    opacity={layer.o}
                    filter={`url(#${f})`}
                  />
                ))}
              </g>
            );
          }
          const from = rotate === 0 ? `0 ${cx} ${cy}` : `${rotate} ${cx} ${cy}`;
          const to = rotate === 0 ? `360 ${cx} ${cy}` : rotate === 60 ? `-300 ${cx} ${cy}` : `300 ${cx} ${cy}`;
          const duration = i === 0 ? "14s" : i === 1 ? "20s" : "10s";
          const transform = rotate === 0 ? undefined : `rotate(${rotate},${cx},${cy})`;
          return (
            <g key={i} style={{ transformOrigin: `${cx}px ${cy}px` }}>
              {layers.map(({ layer, f }) => (
                <ellipse
                  key={f}
                  cx={cx} cy={cy} rx={rx} ry={ry}
                  transform={transform}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={size * layer.w}
                  strokeLinecap="round"
                  opacity={layer.o}
                  filter={`url(#${f})`}
                >
                  {!reducedEff && (
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from={from}
                      to={to}
                      dur={duration}
                      repeatCount="indefinite"
                      additive="replace"
                    />
                  )}
                </ellipse>
              ))}
            </g>
          );
        })}

        {interactive && (
          <ellipse
            cx={cx} cy={cy}
            rx={size * 0.3 * COMET_TRAIL_SCALE}
            ry={size * 0.3 * PLANE_SQUASH * COMET_TRAIL_SCALE}
            fill="none"
            stroke="#D4C8A2"
            strokeWidth={size * 0.0022}
            opacity={COMET_TRAIL_OP}
            filter={`url(#${id}-haloblur)`}
          />
        )}

        {stars.map((s, i) => (
          <g
            key={s.k}
            ref={(el) => { starRefs.current[i] = el; }}
            opacity={s.base}
            transform={`translate(${s.x},${s.y})`}
          >
            <circle cx={0} cy={0} r={s.glowR} fill={`url(#${id}-starglow)`} />
            <circle cx={0} cy={0} r={s.coreR} fill={`url(#${id}-cor-${s.hueIdx})`} />
            <circle cx={0} cy={0} r={s.coreR * 0.45} fill="#FFFFFF" />
          </g>
        ))}

        <circle cx={cx} cy={cy} r={size * 0.075} fill={`url(#${id}-solar-corona)`} />
        <circle cx={cx} cy={cy} r={size * 0.024} fill={`url(#${id}-solar-disk)`} />
        <circle cx={cx} cy={cy} r={size * 0.011} fill="#FFFDF8" opacity="0.9" filter={`url(#${id}-coreblur)`} />

        {interactive && comet && cometGeo && (
          <>
            <path
              ref={fanPathRef}
              d={cometGeo ? fanPath(cometGeo) : ""}
              fill={`url(#${id}-fan)`}
              opacity="0.1"
              filter={`url(#${id}-haloblur)`}
            />

            {BETA_LADDER.map((_, i) => (
              <polyline
                key={`lane-${i}`}
                ref={(el) => { laneRefs.current[i] = el; }}
                points={staticLanesMemo[i]}
                fill="none"
                stroke={LANE_COLOR[i]}
                strokeWidth={size * LANE_W[i]}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={LANE_OP[i]}
                filter={`url(#${id}-${LANE_FILTER[i]})`}
              />
            ))}

            <polyline
              ref={blowoutRef}
              points={cometGeo
                ? cometGeo.blowout.map(([x, y]) => `${x},${y}`).join(" ")
                : ""}
              fill="none"
              stroke="#CFE9FF"
              strokeWidth={size * 0.0035}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.05"
              filter={`url(#${id}-haloblur)`}
            />

            <line
              ref={(el) => { ionLineRefs.current[0] = el; }}
              x1={cometGeo.head[0]} y1={cometGeo.head[1]}
              x2={cometGeo.ionEnd[0]} y2={cometGeo.ionEnd[1]}
              stroke="#9BD4FF"
              strokeWidth={size * 0.004}
              strokeLinecap="round"
              opacity="0.06"
              filter={`url(#${id}-haloblur)`}
            />
            <line
              ref={(el) => { ionLineRefs.current[1] = el; }}
              x1={cometGeo.head[0]} y1={cometGeo.head[1]}
              x2={cometGeo.ionEnd[0]} y2={cometGeo.ionEnd[1]}
              stroke="#CFE9FF"
              strokeWidth={size * 0.0016}
              strokeLinecap="round"
              opacity="0.15"
              filter={`url(#${id}-coreblur)`}
            />

            <line
              ref={sodiumRef}
              x1={cometGeo.head[0]} y1={cometGeo.head[1]}
              x2={cometGeo.sodiumEnd[0]} y2={cometGeo.sodiumEnd[1]}
              stroke="#FFC24D"
              strokeWidth={size * 0.0025}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={SODIUM_OP}
              filter={`url(#${id}-haloblur)`}
            />

            {cometGeo.motes.map(([x, y], i) => (
              <g
                key={`mote-${i}`}
                ref={(el) => { moteRefs.current[i] = el; }}
                transform={`translate(${x},${y})`}
              >
                <circle cx={0} cy={0} r={MOTE_R[i] * size} fill="#FFD08A" opacity={MOTE_OP[i]} filter={`url(#${id}-coreblur)`} />
              </g>
            ))}

            <g ref={headRef} transform={`translate(${cometGeo.head[0]},${cometGeo.head[1]})`} opacity={cometHeadOpacity(cometGeo.rRatio)}>
              <circle cx={0} cy={0} r={size * 0.05} fill={`url(#${id}-comaglow)`} opacity="0.3" />
              <circle cx={0} cy={0} r={size * 0.032} fill={`url(#${id}-starglow)`} />
              <circle cx={0} cy={0} r={size * 0.016} fill="#7CFCA8" opacity="0.26" filter={`url(#${id}-coreblur)`} />
              <circle cx={0} cy={0} r={size * 0.0085} fill="#FFF3DC" />
            </g>
          </>
        )}

        {!reducedEff && !interactive && (
          <>
            <g>
              <circle r={size * 0.02} fill="#38BDF8" filter={`url(#${id}-coreblur)`}>
                <animateMotion dur="12s" repeatCount="indefinite">
                  <mpath href={`#${id}-path1`} />
                </animateMotion>
              </circle>
            </g>
            <g>
              <circle r={size * 0.013} fill="#38BDF8" opacity="0.45" filter={`url(#${id}-coreblur)`}>
                <animateMotion dur="12s" repeatCount="indefinite" begin="0.6s">
                  <mpath href={`#${id}-path1`} />
                </animateMotion>
              </circle>
            </g>
            <g>
              <circle r={size * 0.008} fill="#38BDF8" opacity="0.25" filter={`url(#${id}-coreblur)`}>
                <animateMotion dur="12s" repeatCount="indefinite" begin="1.2s">
                  <mpath href={`#${id}-path1`} />
                </animateMotion>
              </circle>
            </g>
          </>
        )}

        {hovering && interactive && (
          <g>
            {stars.map((s, i) => (
              <line
                key={`line-${s.k}`}
                ref={(el) => { lineRefs.current[i] = el; }}
                x1={s.x} y1={s.y}
                x2={s.x} y2={s.y}
                stroke="#38BDF8"
                strokeWidth={1.25}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                opacity="0"
              />
            ))}
          </g>
        )}

        {Array.from({ length: MAX_CONSTELLATION_EDGES }, (_, i) => (
          <line
            key={`cline-${i}`}
            ref={(el) => { constellationLineRefs.current[i] = el; }}
            x1={0} y1={0} x2={0} y2={0}
            stroke="#9BD4FF"
            strokeWidth={1.15}
            strokeDasharray="5 5"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            opacity="0"
          />
        ))}
        <line
          ref={leaderRef}
          x1={0} y1={0} x2={0} y2={0}
          stroke="#FFD894"
          strokeWidth={0.9}
          strokeDasharray="3 4"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          opacity="0"
        />
        <text
          ref={constellationLabelRef}
          x={0} y={0}
          opacity="0"
          fill="#A8CCFF"
          fontSize={size * 0.022}
          letterSpacing="0.26em"
          textAnchor="start"
          style={{ fontFamily: "inherit", userSelect: "none", pointerEvents: "none" }}
        >
          ORION
        </text>

        <path
          id={`${id}-path1`}
          d={`M ${cx + size * 0.4},${cy} A ${size * 0.4},${size * 0.155} 0 1 1 ${cx + size * 0.4 - 0.001},${cy}`}
          fill="none" stroke="none"
        />
      </svg>

      {reducedEff && (
        <button
          type="button"
          onClick={() => setForcePlay(true)}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: 44,
            height: 44,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(6,14,26,0.55)",
            border: "1px solid rgba(56,189,248,0.30)",
            color: "#38BDF8",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            cursor: "pointer",
            zIndex: 1,
          }}
          aria-label="Play orbital animation"
          title="Play orbital animation"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}
    </div>
  );
}