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
const ORBIT_SPEED: Record<"majestic" | "lively", number> = { majestic: 1.6, lively: 0.45 };
// Kepler's 3rd law: P = K * a^1.5 (K absorbs 2*pi/sqrt(G*M)); ~47s at a=0.405.
// Layout reads as a reduced solar system: guide ring a=0.425 ~= 30 AU (Neptune/Kuiper),
// main stars a=0.38-0.43 ~= 27-30 AU, comet a=0.30 ~= 21 AU, dust a=0.05-0.18 ~= 3.5-13 AU
// (asteroid belt to Uranus). Clock is uniformly compressed (~1e8:1) so the outer ring laps
// in ~47s instead of ~165 yrs; the P^2 ~ a^3 ratios are exact Newtonian two-body physics.
const PERIOD_K = 112.5;

// Constellation pattern-change transition. "crossfade" dissolves the old figure
// into the new one; "drawon" sketches the new figure in with a stroke-dash cascade;
// "both" retracts the old figure in reverse while the new one draws in.
const CONSTELLATION_TRANSITION: "crossfade" | "drawon" | "both" = "both";
const DRAW_STAGGER = 0.06; // s between edge starts
// Per-edge constant-velocity drawing: each edge strokes at ~DRAW_VEL fraction of
// size per second, clamped to [DRAW_DUR_MIN, DRAW_DUR_MAX] so short edges snap and
// long edges keep the same sweep speed.
const DRAW_VEL = 0.5;
const DRAW_DUR_MIN = 0.18;
const DRAW_DUR_MAX = 0.48;
const easeOutQuart = (u: number) => 1 - Math.pow(1 - u, 4);
const easeInOutCubic = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

// Cascading draw rhythm: inter-edge start deltas shrink as the figure completes
// (arpeggio momentum — the last strokes lock in fastest).
const cascadeLag = (k: number, n: number) =>
  DRAW_STAGGER * (1 - 0.3 * (n > 1 ? k / (n - 1) : 0));

// Premium transition flair (Element Map: star ignition, pen-tip, nebula halo,
// light-drain, completion pulse, anticipation coil, anchor echo).
const IGNITE_BOOST = 0.45; // star flare: base opacity x (1 + IGNITE_BOOST * ignite)
// Spring ignition (follow-through): damped velocity spring so stars over-shoot
// ~1.06 then settle in ~0.35s — the "alive" micro-motion after each lock.
const IGNITE_SPRING_K = 0.14; // spring stiffness per frame (velocity += err * K)
const IGNITE_SPRING_D = 0.72; // velocity damping per frame (<1; ~0.72 gives the overshoot)
const IGNITE_SPRING_CUTOFF = 0.006; // freeze the spring once |err| + speed drops below this
const PULSE_PEAK = 0.16; // completion surge: incoming figure alpha x (1 + pulse)
const PULSE_OUTGOING_RATIO = 0.35; // completion surge on the retracting figure = PULSE_PEAK x this (whisper)
const PULSE_DECAY_MULT = 0.945; // per-frame multiplicative settle of the completion pulse (~1s tail)
const PULSE_CUTOFF = 0.004; // hard zero once the surge falls below this (kills the invisible tail)
const EDGE_PULSE_PEAK = 0.2; // per-edge snap (incoming): micro-flash peak on each stroke completion
const EDGE_PULSE_GLOW_BOOST = 2.0; // tip/nebula snap multiplier vs crisp line (x1.4 bloom on lock)
const EDGE_GLOW_FLASH = 1.4; // nebula bloom pop per unit of snap (adds to NEBULA_OP on lock)
const EDGE_WIDTH_PULSE = 4.0; // crisp-line thickness pop per unit of snap (LINE_REST_W -> ~2.25px on lock)
const SNAP_RAMP_MIN = 0.6; // snap crescendo: k-th edge fires at EDGE_PULSE_PEAK x (SNAP_RAMP_MIN + (1-min).k/(n-1))
// Anticipation coil: just before the cascade finishes, hold star brightness ~10%
// down so the completion surge after drawP=1 reads as a breath-release.
const COIL_START = 0.7; // easeDrawP where the coil window opens
const COIL_DIP = 0.9; // star opacity held to this multiple during the window
// Living nebula (scotopic, "through the eyepiece"): three layers on the same
// centroid — a dim far envelope (averted-vision edge), a bright silver→teal
// OIII core, and a dark star hollow (Fish's-Mouth cavity). See -nebula-env /
// -nebula-core filter defs + the Element Map vocabulary.
const NEBULA_BREATH = 0.3; // settled halo shimmer (all layers): x (1 + NEBULA_BREATH * sin)
const NEBULA_BREATH_PERIOD = 3.0; // s per full neon breath cycle
const NEBULA_TURB_FREQ = 0.02; // envelope cloud baseFrequency center, primary axis
const NEBULA_TURB_RATIO = 1.6; // envelope secondary axis = FREQ * RATIO (soft horizontal drift)
const NEBULA_TURB_AMP = 0.001; // slow sine amplitude around the center (10s cycle)
const NEBULA_TURB_PERIOD = 10; // s per full slow frequency-drift cycle
const NEBULA_TURB_CADENCE = 15; // only rewrite baseFrequency every N frames (~250ms) — the slow sine is imperceptible between writes, and animated feTurbulence was boiling into flicker
const NEBULA_LACE_OCTAVES = 3; // core cloud octaves — filaments inside the bright heart (5 created near-pixel grain)
const NEBULA_LANE_FREQ = 0.055; // dark dust-lane turbulence center freq (Fish's-Mouth threads)
const NEBULA_LANE_RATIO = 2.4; // lane anisotropy — silk-thin, strongly directional dust
const NEBULA_LANE_SEED = 23; // lane noise seed (decoupled from the cloud drift)
// Wash geometry/brightness. Envelope = bbox x ENV_BOX, Core = bbox x CORE_BOX, Hollow = bbox x HOLLOW_BOX.
const WASH_ENV_BOX = 1.75; // far halo extends well past the figure (averted-vision range)
const WASH_CORE_BOX = 1.1; // bright heart hugs the drawn strokes
const WASH_HOLLOW_BOX = 0.35; // dark cavity right around the figure centroid (Trapezium hollow)
const WASH_ENV_OP = 0.08; // settled envelope opacity (dim — the faint outer rim)
const WASH_CORE_OP = 0.13; // settled core opacity (silver→teal heart)
const WASH_HOLLOW_OP = 0.5; // cavity peak opacity (quiet ink shadow)
const WASH_DRAWING_RATIO = 0.5; // while strokes arrive, all layers sit at this fraction of full
const WASH_CORE_BLOOM = 0.55; // completion bloom on the core = x (1 + PULSE_PEAK * bloom * pulse)
const ANCHOR_PULL = 0.15; // core heart drifts toward the live anchor star (the ionising region)
// Dark-adaptation gains (rhodopsin): once the figure first settles, the core
// brightens fast and the envelope creeps up slowly. Persistent per mount — so
// re-rolls never make the night-sky "blink".
const ADAPT_ENV_TIME = 6; // s for the envelope to reach full strength
const ADAPT_ENV_FLOOR = 0.55; // envelope floor while a re-roll redraws (never fully blinks)
const ADAPT_CORE_TIME = 1.5; // s for the core to reach full strength
const DRAIN_BOOST = 0.6; // outgoing light-drain bloom relative to retract alpha
const TIP_LEAD = 0.05; // pen-tip bright head rides ahead of the stroke front
const TIP_OP = 0.35; // pen-tip peak opacity
const TIP_PROXIMITY = 1.5; // cursor riding the stroke front brightens the nib up to x(1+TIP_PROXIMITY)
const TIP_PROX_RADIUS = 0.5; // nib proximity falloff radius as fraction of size
const TIP_SW = 2.4; // pen-tip stroke width (vs LINE_REST_W crisp edge)
const NEBULA_OP = 0.055; // settled nebula halo opacity
const LINE_REST_W = 1.25; // crisp constellation edge resting width (snap pops to ~2.25px)
// Anchor echo flare: 3-dot secondary sparkle echoing the roll at the anchor star.
const ECHO_OP = 0.6; // echo dot peak opacity
const ECHO_DECAY = 0.88; // per-frame decay of the echo burst
const ECHO_RADII = [0.045, 0.07, 0.095]; // echo flight radii as fraction of size

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

// Above this rolling-average frame interval the rAF loop paints every other
// frame (~30fps) — extreme panic fallback only; normal phones should not trip.
const SLOW_FRAME_MS = 40;

// Hostile-path throttles (quality-preserving, research-backed): the comet
// re-solves ~210 Kepler orbits per frame, and SVG-on-SVG filters run on the CPU
// main thread (Chromium image-filters) — the nebula re-rasterises at the full
// filter-region cost every time its geometry *or* opacity changes. The static-
// smoke model below cuts both without visible change: filtered geometry is fixed
// once per roll, turbulence freezes at settle, and only unwrapped <g> CSS
// transforms carry the motion (compositor-promoted, never re-filtered).
const COMET_SUB_STEP = 3; // recompute dust lanes every 3rd frame (~20Hz solve)
const FIG_SUB_STEP = 2; // settled figure (no transitions/pulses) paints every 2nd frame (~30Hz)
const FIG_SETTLE_S = 1.2; // s after a roll before figure painting may sub-step (covers draw-in, completion pulse, edge snaps, echo burst)
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

/* Per-frame geometry is written straight to the DOM; skip a write when the
   rounded value is unchanged (sub-pixel motion) to cut attribute churn. */
const attrCache = new WeakMap<Element, Map<string, string>>();
function setAttr(el: Element | null, name: string, value: string): void {
  if (!el) return;
  let m = attrCache.get(el);
  if (!m) {
    m = new Map();
    attrCache.set(el, m);
  }
  if (m.get(name) === value) return;
  m.set(name, value);
  el.setAttribute(name, value);
}

/* Newton iterates on the eccentric anomaly; seeded from the previous frame's
   solution per orbit (WeakMap keyed by the stable orbit object) it converges in
   one or two passes instead of a fixed five. */
const keplerSeedCache = new WeakMap<object, number>();
function keplerSolve(M: number, e: number, seed?: number): number {
  let E = seed ?? M + e * Math.sin(M);
  for (let i = 0; i < 4; i++) {
    const f = E - e * Math.sin(E) - M;
    E -= f / (1 - e * Math.cos(E));
    if (Math.abs(f) < 1e-7) break;
  }
  return E;
}

/* Constant per-comet grain orbits (a/(1−β)), memoised so the Kepler seed cache
   keyed by orbit identity survives across frames. */
const grainOrbitCache = new WeakMap<Orbit, Orbit[]>();
function grainOrbitsFor(o: Orbit): Orbit[] {
  let arr = grainOrbitCache.get(o);
  if (!arr) {
    arr = [...BETA_LADDER, BLOWOUT_BETA].map((beta) => ({
      a: o.a / (1 - beta),
      e: o.e + beta * 0.3,
      omega: o.omega,
      M0: 0,
      theta: o.theta,
      p: o.p,
      P: 0,
    }));
    grainOrbitCache.set(o, arr);
  }
  return arr;
}

function orbitScreenPos(
  o: Pick<Orbit, "a" | "e" | "omega" | "theta" | "p">,
  M: number,
  cx: number,
  cy: number,
): [number, number] {
  const seed = keplerSeedCache.get(o as object);
  const E = keplerSolve(M, o.e, seed);
  keplerSeedCache.set(o as object, E);
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

  const grainOrbits = grainOrbitsFor(o);

  // Emission point (nucleus at epoch k) is independent of β — solve once per k.
  const emitByK: [number, number][] = new Array(EPOCHS);
  for (let k = 0; k < EPOCHS; k++) {
    emitByK[k] = orbitScreenPos(o, M - k * EPOCH_LAG, cx, cy);
  }

  const grainPoint = (bi: number, beta: number, k: number): [number, number] => {
    const dM = k * EPOCH_LAG;
    const Mg = M - dM * (1 - Math.pow(1 - beta, 1.5));
    const g = orbitScreenPos(grainOrbits[bi], Mg, cx, cy);
    const emit = emitByK[k];
    return [head[0] + (g[0] - emit[0]), head[1] + (g[1] - emit[1])];
  };

  const lanes: [number, number][][] = BETA_LADDER.map((beta, lane) => {
    const pts: [number, number][] = [];
    for (let k = 0; k < EPOCHS; k++) {
      const [x, y] = grainPoint(lane, beta, k);
      const jx = Math.sin(k * 12.9898 + lane * 78.233) * EJECT_JITTER * size * Math.max(beta, 0.03);
      const jy = Math.cos(k * 39.7101 + lane * 27.439) * EJECT_JITTER * size * Math.max(beta, 0.03);
      pts.push([x + jx, y + jy]);
    }
    return pts;
  });

  const blowout: [number, number][] = [];
  for (let k = 0; k < 12; k++) {
    blowout.push(grainPoint(BETA_LADDER.length, BLOWOUT_BETA, k));
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
  const constellationOutLineRefs = useRef<(SVGLineElement | null)[]>([]);
  const constellationOutRef = useRef<{ edges: Array<[number, number]>; alpha: number; start: number; bornAt: number } | null>(null);
  const leaderRef = useRef<SVGLineElement | null>(null);
  const constellationLabelRef = useRef<SVGTextElement | null>(null);
  const timeRef = useRef(0);
  const constellationStateRef = useRef<{
    name: string;
    starIdx: number[];
    edges: Array<[number, number]>;
    anchor: number;
    alpha: number;
    drawnAt: number;
  } | null>(null);
  const constellationTargetAlphaRef = useRef(0.85);
  const constellationTipRefs = useRef<(SVGLineElement | null)[]>([]);
  const constellationGlowRefs = useRef<(SVGLineElement | null)[]>([]);
  const constellationGlowOutRefs = useRef<(SVGLineElement | null)[]>([]);
  const constellationWashRef = useRef<SVGEllipseElement | null>(null);
  const constellationCoreWashRef = useRef<SVGEllipseElement | null>(null);
  const constellationHollowRef = useRef<SVGEllipseElement | null>(null);
  const washTurbRef = useRef<SVGFETurbulenceElement | null>(null);
  const washCoreTurbRef = useRef<SVGFETurbulenceElement | null>(null);
  const turbFrameRef = useRef(0);
  const washWrapRef = useRef<SVGGElement | null>(null);
  const coreWrapRef = useRef<SVGGElement | null>(null);
  const hollowWrapRef = useRef<SVGGElement | null>(null);
  const turbActiveRef = useRef(false);
  const figSubRef = useRef(0);
  const adaptStartRef = useRef(-1);
  const adaptDoneRef = useRef(false);
  const igniteRef = useRef<Float32Array | null>(null);
  const igniteTargetRef = useRef<Float32Array | null>(null);
  const igniteVelRef = useRef<Float32Array | null>(null);
  const coilRef = useRef(1);
  const pulseRef = useRef(0);
  const pulseFiredRef = useRef(false);
  const edgePulseRef = useRef<Float32Array | null>(null);
  const constellationEchoRef = useRef<SVGGElement | null>(null);
  const echoDotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const burstRef = useRef(0);
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
      else c.alpha += (constellationTargetAlphaRef.current - c.alpha) * 0.1;
    }
    const t = timeRef.current;
    const drawOn = c && !instant && CONSTELLATION_TRANSITION !== "crossfade";

    // Pre-pass: per-edge constant-velocity progress (cascade rhythm via cascadeLag —
    // a 30% accelerating taper so later strokes fall in faster once the sweep is warm).
    const edgeProg: number[] = [];
    let maxProg = 0;
    if (c) {
      for (let k = 0; k < MAX_CONSTELLATION_EDGES; k++) {
        if (k < c.edges.length) {
          const e = c.edges[k];
          const p0 = pos[e[0]];
          const p1 = pos[e[1]];
          const len = p0 && p1 ? Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) : 0;
          const dur = Math.max(DRAW_DUR_MIN, Math.min(DRAW_DUR_MAX, len / (size * DRAW_VEL)));
          const prog = drawOn
            ? Math.min(1, Math.max(0, (t - c.drawnAt - cascadeLag(k, c.edges.length)) / dur))
            : 1;
          edgeProg[k] = prog;
          if (prog > maxProg) maxProg = prog;
        } else {
          edgeProg[k] = 1;
        }
      }
    }
    const drawP = drawOn ? maxProg : 1;
    const easeDrawP = easeInOutCubic(drawP);
    // Anticipation coil: hold star brightness slightly down through the final
    // strokes so the completion surge after drawP=1 lands like a breath-release.
    coilRef.current = drawOn && easeDrawP >= COIL_START && easeDrawP < 1
      ? 1 - (1 - COIL_DIP) * Math.min(1, (1 - easeDrawP) / (1 - COIL_START))
      : 1;
    // Alpha envelope: figure only materialises where strokes have landed.
    const a = c ? Math.min(c.alpha, 0.25 + 0.75 * easeDrawP) : 0;

    // Completion pulse: one-shot surge when the cascade finishes.
    if (drawOn && drawP >= 1 && !pulseFiredRef.current) {
      pulseFiredRef.current = true;
      pulseRef.current = PULSE_PEAK;
    }
    const pBoost = 1 + pulseRef.current;
    // Incoming-first: the retracting figure only feels a whisper of the surge.
    const pBoostOut = 1 + pulseRef.current * PULSE_OUTGOING_RATIO;

    const out = constellationOutRef.current;
    if (out && !instant) {
      if (CONSTELLATION_TRANSITION === "both") {
        const retractLen = DRAW_DUR_MAX + (out.edges.length > 1 ? cascadeLag(out.edges.length - 1, out.edges.length) : 0);
        out.alpha = t - out.bornAt < retractLen ? out.start : out.alpha * 0.82;
      } else {
        out.alpha *= 0.86;
      }
      if (out.alpha <= 0.012) constellationOutRef.current = null;
    }
    const oa = out && !instant ? out.alpha : 0;
    const retract = out && !instant && CONSTELLATION_TRANSITION === "both";
    const outEls = constellationOutLineRefs.current;
    const glowOutEls = constellationGlowOutRefs.current;
    for (let k = 0; k < MAX_CONSTELLATION_EDGES; k++) {
      const el = outEls[k];
      const glowOut = glowOutEls[k];
      if (!el) continue;
      if (oa > 0 && out && k < out.edges.length) {
        const e = out.edges[k];
        const p0 = pos[e[0]];
        const p1 = pos[e[1]];
        let len = 0;
        if (p0 && p1) {
          el.setAttribute("x1", p0[0].toFixed(2));
          el.setAttribute("y1", p0[1].toFixed(2));
          el.setAttribute("x2", p1[0].toFixed(2));
          el.setAttribute("y2", p1[1].toFixed(2));
          if (glowOut) {
            glowOut.setAttribute("x1", p0[0].toFixed(2));
            glowOut.setAttribute("y1", p0[1].toFixed(2));
            glowOut.setAttribute("x2", p1[0].toFixed(2));
            glowOut.setAttribute("y2", p1[1].toFixed(2));
          }
          len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
        }
        const rk = out.edges.length - 1 - k;
        const dur = Math.max(DRAW_DUR_MIN, Math.min(DRAW_DUR_MAX, len / (size * DRAW_VEL)));
        const prog = Math.min(1, Math.max(0, (t - out.bornAt - cascadeLag(rk, out.edges.length)) / dur));
        const easeProg = easeOutQuart(prog);
        if (retract) {
          el.setAttribute("stroke-dashoffset", easeProg.toFixed(4));
          if (glowOut) glowOut.setAttribute("stroke-dashoffset", easeOutQuart(Math.min(1, prog + TIP_LEAD)).toFixed(4));
        } else {
          el.setAttribute("stroke-dashoffset", "0");
          if (glowOut) glowOut.setAttribute("stroke-dashoffset", "0");
        }
        el.setAttribute("opacity", (oa * 0.85 * pBoostOut).toFixed(3));
        if (glowOut) glowOut.setAttribute("opacity", (DRAIN_BOOST * oa * pBoostOut).toFixed(3));
      } else {
        el.setAttribute("opacity", "0");
        if (glowOut) glowOut.setAttribute("opacity", "0");
      }
    }
    const tipEls = constellationTipRefs.current;
    const glowEls = constellationGlowRefs.current;
    const igniteT = igniteTargetRef.current;
    for (let k = 0; k < MAX_CONSTELLATION_EDGES; k++) {
      const el = constellationLineRefs.current[k];
      if (!el) continue;
      if (c && k < c.edges.length) {
        const e = c.edges[k];
        const p0 = pos[e[0]];
        const p1 = pos[e[1]];
        if (p0 && p1) {
          el.setAttribute("x1", p0[0].toFixed(2));
          el.setAttribute("y1", p0[1].toFixed(2));
          el.setAttribute("x2", p1[0].toFixed(2));
          el.setAttribute("y2", p1[1].toFixed(2));
        }
        const prog = edgeProg[k];
        if (prog >= 1 && igniteT) {
          igniteT[e[0]] = 1;
          igniteT[e[1]] = 1;
        }
        const edgePulseArr = edgePulseRef.current;
        let edgeP = edgePulseArr ? edgePulseArr[k] : 0;
        if (drawOn && edgePulseArr && edgeP === 0 && prog >= 1) {
          // Snap crescendo: early strokes snap quieter, the last edge owns the full flash.
          const n = c.edges.length;
          edgeP = EDGE_PULSE_PEAK * (SNAP_RAMP_MIN + (1 - SNAP_RAMP_MIN) * (n > 1 ? k / (n - 1) : 1));
          edgePulseArr[k] = edgeP;
        }
        const ePulse = 1 + edgeP;
        const ePulseGlow = 1 + edgeP * EDGE_PULSE_GLOW_BOOST;
        const tip = tipEls[k];
        const glow = glowEls[k];
        if (drawOn) {
          const eDraw = easeOutQuart(prog);
          const snapW = LINE_REST_W * (1 + edgeP * EDGE_WIDTH_PULSE);
          el.setAttribute("stroke-dashoffset", (1 - eDraw).toFixed(4));
          if (edgeP > 0.03) el.setAttribute("stroke", "#EAF8FF");
          else el.setAttribute("stroke", "#9BD4FF");
          el.setAttribute("stroke-width", snapW.toFixed(3));
          el.setAttribute("opacity", (a * 0.85 * pBoost * ePulse * Math.min(1, eDraw * 2)).toFixed(3));
          if (tip) {
            tip.setAttribute("stroke-dashoffset", (1 - Math.min(1, eDraw + TIP_LEAD)).toFixed(4));
            // Cursor-proximity draw power: riding close to the stroke front brightens the nib.
            let prox = 0;
            if (ptr && p0 && p1) {
              const leadT = Math.min(1, eDraw + TIP_LEAD);
              const tx = p0[0] + (p1[0] - p0[0]) * leadT;
              const ty = p0[1] + (p1[1] - p0[1]) * leadT;
              prox = Math.max(0, 1 - Math.hypot(ptr.x - tx, ptr.y - ty) / (TIP_PROX_RADIUS * size));
            }
            tip.setAttribute(
              "opacity",
              (TIP_OP * a * pBoost * ePulseGlow * Math.min(1, eDraw * 2) * (1 + TIP_PROXIMITY * prox)).toFixed(3),
            );
          }
          if (glow && p0 && p1) {
            glow.setAttribute("x1", p0[0].toFixed(2));
            glow.setAttribute("y1", p0[1].toFixed(2));
            glow.setAttribute("x2", p1[0].toFixed(2));
            glow.setAttribute("y2", p1[1].toFixed(2));
            const breath = 1 + NEBULA_BREATH * Math.sin((2 * Math.PI * t) / NEBULA_BREATH_PERIOD);
            glow.setAttribute(
              "opacity",
              prog >= 1
                ? Math.min(0.42, (NEBULA_OP * breath + edgeP * EDGE_GLOW_FLASH) * a * pBoost).toFixed(3)
                : "0",
            );
          }
        } else {
          el.setAttribute("stroke-dashoffset", "0");
          el.setAttribute("stroke", "#9BD4FF");
          el.setAttribute("stroke-width", LINE_REST_W.toFixed(2));
          el.setAttribute("opacity", (a * 0.85 * pBoost * ePulse).toFixed(3));
          if (tip) {
            tip.setAttribute("stroke-dashoffset", "0");
            tip.setAttribute("opacity", "0");
          }
          if (glow && p0 && p1) {
            glow.setAttribute("x1", p0[0].toFixed(2));
            glow.setAttribute("y1", p0[1].toFixed(2));
            glow.setAttribute("x2", p1[0].toFixed(2));
            glow.setAttribute("y2", p1[1].toFixed(2));
            glow.setAttribute("opacity", (NEBULA_OP * a * pBoost).toFixed(3));
          }
        }
      } else {
        el.setAttribute("opacity", "0");
        const tipEl = tipEls[k];
        if (tipEl) tipEl.setAttribute("opacity", "0");
        const glowEl = glowEls[k];
        if (glowEl) glowEl.setAttribute("opacity", "0");
      }
    }
    const lead = leaderRef.current;
    if (lead) {
      if (c && ptr && a > 0.02) {
        const p = pos[c.anchor];
        if (p) {
          lead.setAttribute("x1", p[0].toFixed(2));
          lead.setAttribute("y1", p[1].toFixed(2));
          lead.setAttribute("x2", ptr.x.toFixed(2));
          lead.setAttribute("y2", ptr.y.toFixed(2));
          const leadVis = (drawOn ? Math.min(1, easeDrawP / 0.5) : 1) * Math.min(1, a * 1.4) * 0.75;
          lead.setAttribute("opacity", leadVis.toFixed(3));
        }
      } else {
        lead.setAttribute("opacity", "0");
      }
    }
    const lab = constellationLabelRef.current;
    if (lab) {
      if (c && a > 0.02) {
        const p = pos[c.anchor];
        if (p) {
          lab.setAttribute("x", (p[0] + size * 0.024).toFixed(2));
          lab.setAttribute("y", (p[1] - size * 0.026).toFixed(2));
          const labVis = (drawOn ? Math.min(1, easeDrawP / 0.7) : 1) * a * 0.98;
          lab.setAttribute("opacity", labVis.toFixed(3));
          lab.setAttribute("letter-spacing", `${(0.34 - 0.08 * Math.min(1, labVis)).toFixed(3)}em`);
        }
      } else {
        lab.setAttribute("opacity", "0");
        lab.setAttribute("letter-spacing", "0.34em");
      }
    }

    const envWrap = washWrapRef.current;
    const coreWrap = coreWrapRef.current;
    const hollowWrap = hollowWrapRef.current;
    if (envWrap && coreWrap && hollowWrap) {
      if (c && !instant && drawOn && drawP > 0 && c.edges.length > 0) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (let ei = 0; ei < c.edges.length; ei++) {
          const paA = pos[c.edges[ei][0]];
          const paB = pos[c.edges[ei][1]];
          if (!paA || !paB) continue;
          if (paA[0] < minX) minX = paA[0];
          if (paB[0] < minX) minX = paB[0];
          if (paA[0] > maxX) maxX = paA[0];
          if (paB[0] > maxX) maxX = paB[0];
          if (paA[1] < minY) minY = paA[1];
          if (paB[1] < minY) minY = paB[1];
          if (paA[1] > maxY) maxY = paA[1];
          if (paB[1] > maxY) maxY = paB[1];
        }
        if (isFinite(minX) && isFinite(minY)) {
          const bw = maxX - minX;
          const bh = maxY - minY;
          const wcx = minX + bw / 2;
          const wcy = minY + bh / 2;
          // Anchor-pull the bright heart toward the live anchor star — the ionising cluster.
          const ap = pos[c.anchor];
          const hcx = ap ? wcx + (ap[0] - wcx) * ANCHOR_PULL : wcx;
          const hcy = ap ? wcy + (ap[1] - wcy) * ANCHOR_PULL : wcy;
          const wBreath = 1 + NEBULA_BREATH * Math.sin((2 * Math.PI * t) / NEBULA_BREATH_PERIOD);
          const settled = drawP >= 1;
          const wProgress = settled ? 1 : Math.min(1, drawP * 2);
          const drawingScale = settled ? 1 : WASH_DRAWING_RATIO;
          // Dark adaptation (rhodopsin): on first settle the core opens fast, the
          // envelope creeps up slowly. Persistent per mount, so re-rolls never blink.
          if (!adaptDoneRef.current && settled) {
            if (adaptStartRef.current < 0) adaptStartRef.current = t;
            if ((t - adaptStartRef.current) / ADAPT_ENV_TIME >= 1) adaptDoneRef.current = true;
          }
          const adaptT = adaptDoneRef.current
            ? 1
            : adaptStartRef.current < 0 || !settled
              ? 0
              : Math.min(1, (t - adaptStartRef.current) / ADAPT_ENV_TIME);
          const envAdapt = easeInOutCubic(adaptT);
          const coreAdapt = settled
            ? easeInOutCubic(Math.min(1, adaptT / (ADAPT_CORE_TIME / ADAPT_ENV_TIME)))
            : 0;
          const envFloor = settled ? 1 : ADAPT_ENV_FLOOR;
          const envOp = WASH_ENV_OP * drawingScale * wProgress * wBreath * a * envAdapt * envFloor;
          const coreOp =
            WASH_CORE_OP *
            drawingScale *
            wProgress *
            wBreath *
            a *
            (0.25 + 0.75 * coreAdapt) *
            (1 + pulseRef.current * WASH_CORE_BLOOM);
          const hollowOp = WASH_HOLLOW_OP * wBreath * a;

          // Turbulence freeze-at-settle: while cloud-drift is live the filters
          // re-rasterise on the cadence (~4x/s). Once the figure has settled AND
          // adapted, stop rewriting entirely — the last baseFrequency phase holds
          // forever (static smoke, per the user-approved tier-3 plan). A re-roll
          // re-arms the drift in rollConstellation.
          if (settled && adaptDoneRef.current && turbActiveRef.current) turbActiveRef.current = false;

          // Composited motion only: geometry was fixed by setWashArt at the roll.
          // These per-frame writes are CSS transforms/opacity on the unwrapped
          // filter layer → Chromium promotes the layer to the compositor, so the
          // nebula NEVER re-rasterises on the idle/breath path.
          envWrap.style.transform = `translate(${wcx.toFixed(2)}px,${wcy.toFixed(2)}px)`;
          coreWrap.style.transform = `translate(${hcx.toFixed(2)}px,${hcy.toFixed(2)}px)`;
          hollowWrap.style.transform = `translate(${wcx.toFixed(2)}px,${wcy.toFixed(2)}px)`;
          envWrap.style.opacity = Math.min(WASH_ENV_OP, envOp).toFixed(3);
          coreWrap.style.opacity = Math.min(WASH_CORE_OP, coreOp).toFixed(3);
          hollowWrap.style.opacity = Math.min(WASH_HOLLOW_OP, hollowOp).toFixed(3);
        }
      } else {
        envWrap.style.opacity = "0";
        coreWrap.style.opacity = "0";
        hollowWrap.style.opacity = "0";
      }
    }
    },
    [size],
  );

  // Static-smoke geometry: the filtered wash ellipses are centred on the local
  // origin and sized exactly once per roll (final figure bbox). From here on the
  // rAF loop never touches their geometry — the nebula re-rasterises only when a
  // NEW figure rolls, and all motion is carried by the composited wrapper
  // translates/opacity in paintConstellation.
  const setWashArt = useCallback(
    (edges: Array<[number, number]>, pos: [number, number][]) => {
      const wash = constellationWashRef.current;
      const coreWash = constellationCoreWashRef.current;
      const hollow = constellationHollowRef.current;
      if (!wash || !coreWash || !hollow) return;
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (let ei = 0; ei < edges.length; ei++) {
        const paA = pos[edges[ei][0]];
        const paB = pos[edges[ei][1]];
        if (!paA || !paB) continue;
        if (paA[0] < minX) minX = paA[0];
        if (paB[0] < minX) minX = paB[0];
        if (paA[0] > maxX) maxX = paA[0];
        if (paB[0] > maxX) maxX = paB[0];
        if (paA[1] < minY) minY = paA[1];
        if (paB[1] < minY) minY = paB[1];
        if (paA[1] > maxY) maxY = paA[1];
        if (paB[1] > maxY) maxY = paB[1];
      }
      if (!isFinite(minX) || !isFinite(minY)) return;
      const bw = maxX - minX;
      const bh = maxY - minY;
      const baseRx = Math.max(size * 0.05, bw / 2);
      const baseRy = Math.max(size * 0.05, bh / 2);
      setAttr(wash, "rx", (baseRx * WASH_ENV_BOX).toFixed(2));
      setAttr(wash, "ry", (baseRy * WASH_ENV_BOX).toFixed(2));
      setAttr(coreWash, "rx", (baseRx * WASH_CORE_BOX).toFixed(2));
      setAttr(coreWash, "ry", (baseRy * WASH_CORE_BOX).toFixed(2));
      setAttr(hollow, "rx", (baseRx * WASH_HOLLOW_BOX).toFixed(2));
      setAttr(hollow, "ry", (baseRy * WASH_HOLLOW_BOX).toFixed(2));
    },
    [size],
  );

  useEffect(() => {
    if (!interactive || !comet || reducedEff) return;
    const t0 = performance.now();
    let raf = 0;
    let running = false;
    let pausedMs = 0;
    let pauseBegan = 0;
    let last = 0;
    let ema = 16.7;
    let skip = false;
    let cometSub = 0;

    const frame = (now: number) => {
      const dt = last ? now - last : 16.7;
      last = now;
      ema = ema * 0.9 + dt * 0.1;
      // Adaptive cadence: extreme panic only — if a device averages >40ms per
      // frame, paint every other frame to halve GPU pressure.  Normal phones
      // never trip this; sub-stepping handles the rest.
      if (ema > SLOW_FRAME_MS) {
        skip = !skip;
        if (skip) {
          raf = requestAnimationFrame(frame);
          return;
        }
      } else {
        skip = false;
      }
      const t = (now - t0 - pausedMs) / 1000;
      timeRef.current = t;
      const M = comet.M0 + (2 * Math.PI * t) / comet.P;

      // Sub-step: recompute AND rewrite the comet only every COMET_SUB_STEP
      // frames. At a ~29s orbital period the single-frame lag is sub-pixel, but
      // it halves the ~210 Kepler dust solves and the lane-string building.
      if (cometSub++ % COMET_SUB_STEP === 0) {
        const geo = cometGeometry(comet, M, cx, cy, size, (2 * Math.PI * t) / ION_KINK_PERIOD);
        const boost = Math.min(1.35, Math.max(0.6, 0.55 + geo.rRatio * 0.45));

        if (headRef.current) {
          headRef.current.style.transform = `translate(${geo.head[0].toFixed(2)}px,${geo.head[1].toFixed(2)}px)`;
          setAttr(headRef.current, "opacity", cometHeadOpacity(geo.rRatio).toFixed(3));
        }
        const laneEls = laneRefs.current;
        for (let i = 0; i < laneEls.length; i++) {
          const el = laneEls[i];
          if (el) {
            setAttr(el, "points", geo.lanes[i].map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" "));
            setAttr(el, "opacity", (LANE_OP[i] * boost).toFixed(3));
          }
        }
        if (blowoutRef.current) {
          setAttr(
            blowoutRef.current,
            "points",
            geo.blowout.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" "),
          );
        }
        if (fanPathRef.current) {
          setAttr(fanPathRef.current, "d", fanPath(geo));
          setAttr(fanPathRef.current, "opacity", (0.1 * boost).toFixed(3));
        }
        if (fanGradRef.current) {
          const gx = geo.head[0];
          const gy = geo.head[1];
          const gL = Math.hypot(cx - gx, cy - gy) || 1;
          setAttr(fanGradRef.current, "x1", gx.toFixed(2));
          setAttr(fanGradRef.current, "y1", gy.toFixed(2));
          setAttr(fanGradRef.current, "x2", (gx + ((cx - gx) / gL) * 0.42 * size).toFixed(2));
          setAttr(fanGradRef.current, "y2", (gy + ((cy - gy) / gL) * 0.42 * size).toFixed(2));
          setAttr(fanGradRef.current, "opacity", (0.1 * boost).toFixed(3));
        }

        const comag = comaglowRef.current;
        if (comag) {
          const hx = geo.head[0];
          const hy = geo.head[1];
          const sdl = Math.hypot(cx - hx, cy - hy) || 1;
          const shx = hx + ((cx - hx) / sdl) * size * 0.02;
          const shy = hy + ((cy - hy) / sdl) * size * 0.02;
          setAttr(comag, "cx", hx.toFixed(2));
          setAttr(comag, "cy", hy.toFixed(2));
          setAttr(comag, "fx", shx.toFixed(2));
          setAttr(comag, "fy", shy.toFixed(2));
        }

        const ion = ionLineRefs.current;
        if (ion[0]) {
          setAttr(ion[0], "x1", geo.head[0].toFixed(2));
          setAttr(ion[0], "y1", geo.head[1].toFixed(2));
          setAttr(ion[0], "x2", geo.ionEnd[0].toFixed(2));
          setAttr(ion[0], "y2", geo.ionEnd[1].toFixed(2));
        }
        if (ion[1]) {
          setAttr(ion[1], "x1", geo.head[0].toFixed(2));
          setAttr(ion[1], "y1", geo.head[1].toFixed(2));
          setAttr(ion[1], "x2", geo.ionEnd[0].toFixed(2));
          setAttr(ion[1], "y2", geo.ionEnd[1].toFixed(2));
        }
        if (sodiumRef.current) {
          setAttr(sodiumRef.current, "x1", geo.head[0].toFixed(2));
          setAttr(sodiumRef.current, "y1", geo.head[1].toFixed(2));
          setAttr(sodiumRef.current, "x2", geo.sodiumEnd[0].toFixed(2));
          setAttr(sodiumRef.current, "y2", geo.sodiumEnd[1].toFixed(2));
        }

        geo.motes.forEach(([x, y], i) => {
          const g = moteRefs.current[i];
          if (g) g.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px)`;
        });
      }

      const ptr = pointerRef.current;
      const loopPos: [number, number][] = new Array(stars.length);
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const t2 = s.M0 + (2 * Math.PI * t) / s.P;
        const [x, y] = orbitScreenPos(s, t2, cx, cy);
        loopPos[i] = [x, y];
        const g = starRefs.current[i];
        if (g) {
          g.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px)`;
          const ignite = igniteRef.current?.[i] ?? 0;
          const tgt = igniteTargetRef.current?.[i] ?? 0;
          const velArr = igniteVelRef.current;
          // Damped velocity spring: overshoots ~1.06 then settles (follow-through).
          let vel = velArr?.[i] ?? 0;
          if (vel !== 0 || Math.abs(tgt - ignite) > IGNITE_SPRING_CUTOFF) {
            vel = (vel + (tgt - ignite) * IGNITE_SPRING_K) * IGNITE_SPRING_D;
            if (velArr) velArr[i] = vel;
            if (igniteRef.current) igniteRef.current[i] = ignite + vel;
          }
          const current = igniteRef.current?.[i] ?? ignite;
          setAttr(g, "opacity", (s.base * (1 + IGNITE_BOOST * current) * coilRef.current).toFixed(3));
        }
        const line = lineRefs.current[i];
        if (line) {
          if (!ptr) {
            setAttr(line, "opacity", "0");
            continue;
          }
          const d = Math.hypot(ptr.x - x, ptr.y - y);
          const a = d <= reactRadius && d > 0.01 ? Math.pow(1 - d / reactRadius, 2) * 0.8 : 0;
          setAttr(line, "x1", x.toFixed(2));
          setAttr(line, "y1", y.toFixed(2));
          setAttr(line, "x2", ptr.x.toFixed(2));
          setAttr(line, "y2", ptr.y.toFixed(2));
          setAttr(line, "opacity", a.toFixed(3));
        }
      }

      // Settled figure sub-step: once no transition is running and the post-roll
      // pulses/echo have lapsed, paint every 2nd frame (~30Hz). The fade/breath
      // smoothness loss is imperceptible and it halves the settled figure's
      // filter-pass cost (the filtered haloblur glows).
      const cstFig = constellationStateRef.current;
      const figSettled =
        cstFig !== null && !constellationOutRef.current && t - cstFig.drawnAt > FIG_SETTLE_S;
      if (figSettled) {
        if (figSubRef.current++ % FIG_SUB_STEP === 0) paintConstellation(ptr, loopPos);
      } else {
        paintConstellation(ptr, loopPos);
      }

      // Anchor echo flare: 3-dot secondary sparkle flying out from the anchor as the burst fades.
      const echo = constellationEchoRef.current;
      if (echo) {
        if (burstRef.current > 0.01) {
          const cst = constellationStateRef.current;
          const ap = cst ? loopPos[cst.anchor] : null;
          if (ap) {
            echo.style.transform = `translate(${ap[0].toFixed(2)}px,${ap[1].toFixed(2)}px)`;
            const be = burstRef.current;
            const dir = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
            for (let i = 0; i < echoDotRefs.current.length; i++) {
              const d = echoDotRefs.current[i];
              if (d) {
                const r = ECHO_RADII[i] * size * (1 - be);
                d.setAttribute("cx", (Math.cos(dir[i]) * r).toFixed(2));
                d.setAttribute("cy", (Math.sin(dir[i]) * r).toFixed(2));
              }
            }
            echo.setAttribute("opacity", (ECHO_OP * be).toFixed(3));
            burstRef.current *= ECHO_DECAY;
            if (burstRef.current < 0.01) burstRef.current = 0;
          }
        } else {
          echo.setAttribute("opacity", "0");
        }
      }

      if (
        turbActiveRef.current &&
        (washTurbRef.current || washCoreTurbRef.current) &&
        turbFrameRef.current++ % NEBULA_TURB_CADENCE === 0
      ) {
        const f = NEBULA_TURB_FREQ + NEBULA_TURB_AMP * Math.sin((2 * Math.PI * t) / NEBULA_TURB_PERIOD);
        if (washTurbRef.current) {
          washTurbRef.current.setAttribute("baseFrequency", `${f.toFixed(5)} ${(f * NEBULA_TURB_RATIO).toFixed(5)}`);
        }
        if (washCoreTurbRef.current) {
          const fc = NEBULA_TURB_FREQ * 1.5 + NEBULA_TURB_AMP * Math.sin((2 * Math.PI * t) / NEBULA_TURB_PERIOD);
          washCoreTurbRef.current.setAttribute("baseFrequency", `${fc.toFixed(5)} ${(fc * NEBULA_TURB_RATIO).toFixed(5)}`);
        }
      }

      if (pulseRef.current > 0) {
        pulseRef.current *= PULSE_DECAY_MULT;
        if (pulseRef.current < PULSE_CUTOFF) pulseRef.current = 0;
      }
      const edgePulseArr = edgePulseRef.current;
      if (edgePulseArr) {
        for (let i = 0; i < edgePulseArr.length; i++) {
          if (edgePulseArr[i] > 0) edgePulseArr[i] *= 0.92;
        }
      }

      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      if (pauseBegan) {
        pausedMs += performance.now() - pauseBegan;
        pauseBegan = 0;
      }
      last = 0;
      ema = 16.7;
      skip = false;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      pauseBegan = performance.now();
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      if (dwellRef.current) {
        clearTimeout(dwellRef.current);
        dwellRef.current = null;
      }
    };

    // Pause the whole simulation when the ring scrolls out of view — the single
    // biggest always-on drain, and invisible by definition (it's off-screen).
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) start();
        else stop();
      },
      { threshold: 0 },
    );
    if (wrapRef.current) io.observe(wrapRef.current);
    start();

    return () => {
      io.disconnect();
      stop();
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

    const prev = constellationStateRef.current;
    if (prev && !reducedEff) {
      constellationOutRef.current = { edges: prev.edges, alpha: Math.max(prev.alpha, 0.04), start: Math.max(prev.alpha, CONSTELLATION_TRANSITION === "both" ? 0.55 : 0.04), bornAt: timeRef.current };
    }

    const anchorIdx = starIdx[vAnchor];
    if (CONSTELLATION_TRANSITION !== "crossfade") {
      const ap = pos[anchorIdx];
      if (ap) {
        edges.sort(([a1, b1], [a2, b2]) => {
          const d1 = Math.min(Math.hypot(pos[a1][0] - ap[0], pos[a1][1] - ap[1]), Math.hypot(pos[b1][0] - ap[0], pos[b1][1] - ap[1]));
          const d2 = Math.min(Math.hypot(pos[a2][0] - ap[0], pos[a2][1] - ap[1]), Math.hypot(pos[b2][0] - ap[0], pos[b2][1] - ap[1]));
          return d1 - d2;
        });
      }
    }

    constellationStateRef.current = {
      name: entry.name,
      starIdx,
      edges,
      anchor: anchorIdx,
      alpha: 0.12,
      drawnAt: timeRef.current,
    };
    constellationTargetAlphaRef.current = 0.85;
    const freshIgnite = new Float32Array(stars.length);
    igniteTargetRef.current = freshIgnite;
    igniteRef.current = new Float32Array(stars.length);
    igniteVelRef.current = new Float32Array(stars.length);
    freshIgnite[anchorIdx] = 1;
    burstRef.current = 1;
    pulseFiredRef.current = false;
    edgePulseRef.current = new Float32Array(edges.length);
    // Static smoke + drift re-arm: fix the filtered wash geometry for this figure
    // and resume the slow cloud-drift (paintConstellation freezes it at settle).
    turbActiveRef.current = true;
    setWashArt(edges, pos);
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
    if (igniteTargetRef.current) igniteTargetRef.current.fill(0);
    if (igniteVelRef.current) igniteVelRef.current.fill(0);
    if (edgePulseRef.current) edgePulseRef.current.fill(0);
    coilRef.current = 1;
    burstRef.current = 0;
    turbFrameRef.current = 0;
    turbActiveRef.current = false;
    if (constellationEchoRef.current) constellationEchoRef.current.setAttribute("opacity", "0");
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
      style={{ maxWidth: size, width: "100%", marginInline: "auto", position: "relative", willChange: "transform" }}
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
          <radialGradient id={`${id}-washglow`} colorInterpolation="linearRGB">
            <stop offset="0%" stopColor="#E6EDF4" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#C3D4E2" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#8FA6BF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-washcoreglow`} colorInterpolation="linearRGB">
            <stop offset="0%" stopColor="#F0F6F8" stopOpacity="0.85" />
            <stop offset="38%" stopColor="#C9ECDE" stopOpacity="0.38" />
            <stop offset="75%" stopColor="#B7CBDD" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#93A8BE" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-washdark`} colorInterpolation="linearRGB">
            <stop offset="0%" stopColor="#03070C" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#09121D" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#09121D" stopOpacity="0" />
          </radialGradient>
          <filter id={`${id}-coreblur`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="linearRGB">
            <feGaussianBlur stdDeviation={size * tuning.coreS} />
          </filter>
          <filter id={`${id}-midblur`} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="linearRGB">
            <feGaussianBlur stdDeviation={size * tuning.midS} />
          </filter>
          <filter id={`${id}-haloblur`} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="linearRGB">
            <feGaussianBlur stdDeviation={size * tuning.haloS} />
          </filter>
          {/* The feTurbulence noise is masked by operator="in" to the ellipse disc,
              so a 340% filter region was generating (and discarding) ~4.5x the
              visible area every pass. 160% still leaves >30% blur margin — the
              visible cloud texture is bit-identical, only off-disc noise is gone. */}
          <filter id={`${id}-nebula-env`} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
            <feTurbulence ref={washTurbRef} type="fractalNoise" baseFrequency={NEBULA_TURB_FREQ} numOctaves="3" seed="7" result="noise" />
            <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 5 -1.2" result="cloud" />
            <feComposite in="SourceGraphic" in2="cloud" operator="in" result="env" />
            <feGaussianBlur in="env" stdDeviation={size * 0.005} />
          </filter>
          <filter id={`${id}-nebula-core`} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
            <feTurbulence ref={washCoreTurbRef} type="fractalNoise" baseFrequency={NEBULA_TURB_FREQ * 1.5} numOctaves={NEBULA_LACE_OCTAVES} seed="7" result="noise" />
            <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 5 -1.2" result="cloud" />
            <feComposite in="SourceGraphic" in2="cloud" operator="in" result="core" />
            <feTurbulence type="fractalNoise" baseFrequency={`${NEBULA_LANE_FREQ} ${(NEBULA_LANE_FREQ * NEBULA_LANE_RATIO).toFixed(5)}`} numOctaves="3" seed={NEBULA_LANE_SEED} result="laneNoise" />
            <feColorMatrix in="laneNoise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 6 -1.5" result="lanes" />
            <feComposite in="core" in2="lanes" operator="out" result="carved" />
            <feGaussianBlur in="carved" stdDeviation={size * 0.003} />
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
            key={`glowout-${i}`}
            ref={(el) => { constellationGlowOutRefs.current[i] = el; }}
            x1={0} y1={0} x2={0} y2={0}
            stroke="#E2F4FF"
            strokeWidth={3.8}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            filter={`url(#${id}-haloblur)`}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset="1"
            opacity="0"
          />
        ))}
        <g ref={washWrapRef} style={{ opacity: 0 }}>
          <ellipse
            ref={constellationWashRef}
            cx={0} cy={0}
            rx={0} ry={0}
            fill={`url(#${id}-washglow)`}
            filter={`url(#${id}-nebula-env)`}
            opacity="1"
          />
        </g>
        <g ref={coreWrapRef} style={{ opacity: 0 }}>
          <ellipse
            ref={constellationCoreWashRef}
            cx={0} cy={0}
            rx={0} ry={0}
            fill={`url(#${id}-washcoreglow)`}
            filter={`url(#${id}-nebula-core)`}
            opacity="1"
          />
        </g>
        <g ref={hollowWrapRef} style={{ opacity: 0 }}>
          <ellipse
            ref={constellationHollowRef}
            cx={0} cy={0}
            rx={0} ry={0}
            fill={`url(#${id}-washdark)`}
            opacity="1"
          />
        </g>
        {Array.from({ length: MAX_CONSTELLATION_EDGES }, (_, i) => (
          <line
            key={`ocline-${i}`}
            ref={(el) => { constellationOutLineRefs.current[i] = el; }}
            x1={0} y1={0} x2={0} y2={0}
            stroke="#9BD4FF"
            strokeWidth={LINE_REST_W}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset="1"
            opacity="0"
          />
        ))}
        {Array.from({ length: MAX_CONSTELLATION_EDGES }, (_, i) => (
          <line
            key={`glow-${i}`}
            ref={(el) => { constellationGlowRefs.current[i] = el; }}
            x1={0} y1={0} x2={0} y2={0}
            stroke="#9BD4FF"
            strokeWidth={4}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            filter={`url(#${id}-haloblur)`}
            opacity="0"
          />
        ))}
        {Array.from({ length: MAX_CONSTELLATION_EDGES }, (_, i) => (
          <line
            key={`tip-${i}`}
            ref={(el) => { constellationTipRefs.current[i] = el; }}
            x1={0} y1={0} x2={0} y2={0}
            stroke="#E2F4FF"
            strokeWidth={TIP_SW}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            filter={`url(#${id}-haloblur)`}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset="1"
            opacity="0"
          />
        ))}
        {Array.from({ length: MAX_CONSTELLATION_EDGES }, (_, i) => (
          <line
            key={`cline-${i}`}
            ref={(el) => { constellationLineRefs.current[i] = el; }}
            x1={0} y1={0} x2={0} y2={0}
            stroke="#9BD4FF"
            strokeWidth={LINE_REST_W}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset="1"
            opacity="0"
          />
        ))}
        <g ref={constellationEchoRef} opacity="0">
          {ECHO_RADII.map((_, i) => (
            <circle
              key={`echo-${i}`}
              ref={(el) => { echoDotRefs.current[i] = el; }}
              cx={0} cy={0}
              r={size * 0.008}
              fill="#EAF8FF"
              filter={`url(#${id}-coreblur)`}
            />
          ))}
        </g>
        <line
          ref={leaderRef}
          x1={0} y1={0} x2={0} y2={0}
          stroke="#FFD894"
          strokeWidth={0.9}
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