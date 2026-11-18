import * as THREE from "three";
import type { SharedStageMaterials } from "./materials";
import { COLORWAYS, type DesignMode } from "../designStudioData";

export type { DesignMode };

export type DesignStudio = {
  /** Named attachment points (garment details, BOM parts, measurements, props) for screen annotations. */
  anchors: Record<string, THREE.Object3D>;
  /** Switch the studio view; transitions are animated inside `update`. */
  setMode: (mode: DesignMode) => void;
  /** Advance studio animations; call once per frame. */
  update: (elapsed: number, delta: number) => void;
  /** Turntable sway amplitude, lowered while annotations need to stay readable. */
  getSway: () => number;
};

export type TShirtBuild = {
  tshirtGroup: THREE.Group;
  swatches: THREE.Group;
  designStudio: DesignStudio;
};

/* ────────────────────────────────────────────────────────────────────────────
 * Palette. Shell + binding colours follow the Journey colorway (matTee / matTeeCollar).
 * ──────────────────────────────────────────────────────────────────────────── */
const SHELL_SHEEN = 0x5b6472;
const LINING_COLOR = 0x9aa1aa;
const PLACKET_COLOR = 0xa9b0b9;
const TAPE_COLOR = 0x121417;
const STITCH_COLOR = 0x3f4650;
const PAPER_COLOR = 0xf6f4ef;
const INK_COLOR = 0x1b2333;
const MEASURE_COLOR = 0xef4444;
const SAMPLING_COLOR = 0x60a5fa;
const GRID_COLOR = 0x94a3b8;

/* ────────────────────────────────────────────────────────────────────────────
 * Garment geometry (local units; the group is lifted +0.12 like the original tee).
 * Structured quilted jacket: chest yoke + V front panel, low loft channels.
 * ──────────────────────────────────────────────────────────────────────────── */
const HEM_Y = -0.92;
const HEM_BAND_TOP = -0.835;
const NECK_Y = 0.925;
const COLLAR_TOP_Y = 1.25;
const SLIDER_Y = 0.6;
const OPEN_MAX = 0.36;

const YOKE_Y = 0.4; // horizontal chest yoke seam
const V_APEX_Y = -0.4; // bottom of the front V panel (at centre front)
const V_REACH = 0.78; // |sin(phi)| where the V meets the yoke (near the armhole)
const V_PERP = 0.55; // vertical → perpendicular distance factor for the V seam

const BODY_LOFT = 0.015;
const COLLAR_LOFT = 0.012;
const SLEEVE_LOFT = 0.014;
const SHELL_THICKNESS = 0.026;

const TAU = Math.PI * 2;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const fract = (x: number) => x - Math.floor(x);
/** Quilting channel bulge: 0 on the stitch line, 1 mid-channel (low exponent = flat top). */
const baffle = (q: number, sharpness: number) =>
  Math.pow(Math.sin(Math.PI * fract(q)), sharpness);

/* Silhouette: (half-width, height, half-depth) from hem to collar top. */
const PROFILE = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0.655, -0.92, 0.305),
    new THREE.Vector3(0.66, -0.86, 0.31),
    new THREE.Vector3(0.695, -0.8, 0.33),
    new THREE.Vector3(0.73, -0.66, 0.35),
    new THREE.Vector3(0.735, -0.3, 0.34),
    new THREE.Vector3(0.74, 0.1, 0.345),
    new THREE.Vector3(0.73, 0.42, 0.34),
    new THREE.Vector3(0.715, 0.6, 0.34),
    new THREE.Vector3(0.62, 0.76, 0.305),
    new THREE.Vector3(0.44, 0.86, 0.265),
    new THREE.Vector3(0.285, 0.915, 0.232),
    new THREE.Vector3(0.262, 0.99, 0.222),
    new THREE.Vector3(0.27, 1.12, 0.232),
    new THREE.Vector3(0.288, 1.25, 0.248),
  ],
  false,
  "centripetal",
);

const Y_LUT_SIZE = 512;
const Y_LUT = new Float64Array(Y_LUT_SIZE + 1);
for (let i = 0; i <= Y_LUT_SIZE; i++) {
  Y_LUT[i] = PROFILE.getPointAt(i / Y_LUT_SIZE).y;
}

function uAtY(y: number): number {
  const first = Y_LUT[0] ?? HEM_Y;
  const last = Y_LUT[Y_LUT_SIZE] ?? COLLAR_TOP_Y;
  if (y <= first) return 0;
  if (y >= last) return 1;
  let lo = 0;
  let hi = Y_LUT_SIZE;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if ((Y_LUT[mid] ?? 0) < y) lo = mid;
    else hi = mid;
  }
  const yLo = Y_LUT[lo] ?? 0;
  const span = (Y_LUT[hi] ?? 0) - yLo;
  return (lo + (span > 1e-9 ? (y - yLo) / span : 0)) / Y_LUT_SIZE;
}

const openAt = (y: number) => OPEN_MAX * smoothstep(SLIDER_Y, COLLAR_TOP_Y, y);

/** Column t∈[0,1] → angle (0 = centre front), panels pushed apart to ±open above the slider. */
function columnPhi(t: number, open: number): number {
  const side = t <= 0.5 ? 1 : -1;
  const raw = t <= 0.5 ? t * TAU : t * TAU - TAU;
  return side * open + raw * (1 - open / Math.PI);
}

/**
 * Point on the shell for profile sample c=(halfW, y, halfD) at angle phi.
 * Optionally writes quilting data (channel coord, structural-seam distance, dash coord) to `quilt`.
 */
function shellPointFromProfile(
  c: THREE.Vector3,
  phi: number,
  inset: number,
  loftScale: number,
  out: THREE.Vector3,
  quilt?: THREE.Vector4,
): THREE.Vector3 {
  const w = c.x;
  const y = c.y;
  const d = c.z;
  const s = Math.sin(phi);
  const co = Math.cos(phi);
  let nx = s / w;
  let nz = co / d;
  const nl = Math.hypot(nx, nz) || 1;
  nx /= nl;
  nz /= nl;

  const open = openAt(y);
  const edgeArc = (Math.abs(phi) - open) * w;
  const edgeMask = smoothstep(0.03, 0.09, edgeArc);
  const lapel =
    0.03 * smoothstep(0.85, COLLAR_TOP_Y, y) * (1 - smoothstep(0, 0.22, edgeArc));
  const along = Math.abs(phi) * w;

  let loft = 0;
  let gathers = 0;
  let q = 0;
  let structural = 1;
  let dashCoord = along;

  if (y < HEM_BAND_TOP) {
    // ¼" elasticated hem band: shirring gathers, no quilting.
    gathers = 0.008 * (0.5 + 0.5 * Math.sin(phi * 52));
    q = along / 0.035;
    structural = Math.abs(y - HEM_BAND_TOP);
    dashCoord = -1;
  } else if (y < NECK_Y) {
    const lat = co > 0 ? Math.abs(s) : 1;
    const latN = Math.min(1, lat / V_REACH);
    const vY = V_APEX_Y + (YOKE_Y - V_APEX_Y) * latN;
    const dYoke = Math.abs(y - YOKE_Y);
    const dV = latN < 1 ? Math.abs(y - vY) * V_PERP : 1;
    structural = Math.min(dYoke, dV, Math.abs(y - HEM_BAND_TOP));

    if (y >= YOKE_Y) q = (y - YOKE_Y) / 0.19;
    else if (y >= vY) q = (y - vY) / 0.21;
    else q = (y - HEM_BAND_TOP) / 0.235;

    loft =
      BODY_LOFT *
      (1 + 0.1 * Math.sin(phi * 3 + y * 5)) *
      baffle(q, 0.3) *
      smoothstep(0, 0.035, structural) *
      (1 - smoothstep(0.87, NECK_Y, y)) *
      edgeMask;
    // Soft blouson pleats just above the elastic hem.
    gathers = (1 - smoothstep(-0.83, -0.65, y)) * 0.006 * Math.sin(phi * 21 + 0.6);
  } else {
    q = (y - NECK_Y) / 0.16;
    structural = Math.abs(y - NECK_Y);
    loft =
      COLLAR_LOFT *
      baffle(q, 0.45) *
      smoothstep(NECK_Y, NECK_Y + 0.025, y) *
      (1 - smoothstep(COLLAR_TOP_Y - 0.03, COLLAR_TOP_Y, y)) *
      edgeMask;
  }

  if (quilt) quilt.set(q, structural, dashCoord, 0);
  const r = (loft + gathers) * loftScale + lapel - inset;
  return out.set(w * s + nx * r, y, d * co + nz * r);
}

const _profileTmp = new THREE.Vector3();
function shellPoint(
  u: number,
  phi: number,
  inset: number,
  loftScale: number,
  out: THREE.Vector3,
): THREE.Vector3 {
  PROFILE.getPointAt(clamp01(u), _profileTmp);
  return shellPointFromProfile(_profileTmp, phi, inset, loftScale, out);
}

function gridIndices(rows: number, cols: number): number[] {
  const indices: number[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const a = i * (cols + 1) + j;
      const b = a + 1;
      const c = a + cols + 1;
      indices.push(a, b, c, b, c + 1, c);
    }
  }
  return indices;
}

function buildShellGeometry(
  rows: number,
  cols: number,
  inset: number,
  loftScale: number,
  withQuilt: boolean,
): THREE.BufferGeometry {
  const count = (rows + 1) * (cols + 1);
  const positions = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const quilts = withQuilt ? new Float32Array(count * 4) : null;
  const c = new THREE.Vector3();
  const p = new THREE.Vector3();
  const qv = new THREE.Vector4();

  let k = 0;
  for (let i = 0; i <= rows; i++) {
    const u = i / rows;
    PROFILE.getPointAt(u, c);
    const open = openAt(c.y);
    for (let j = 0; j <= cols; j++) {
      const t = j / cols;
      shellPointFromProfile(c, columnPhi(t, open), inset, loftScale, p, qv);
      positions.set([p.x, p.y, p.z], k * 3);
      uvs.set([t, u], k * 2);
      quilts?.set([qv.x, qv.y, qv.z, qv.w], k * 4);
      k++;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  if (quilts) geo.setAttribute("aQuilt", new THREE.BufferAttribute(quilts, 4));
  geo.setIndex(gridIndices(rows, cols));
  geo.computeVertexNormals();
  return geo;
}

/** Quad-grid wireframe of the shell (the "digital pattern" look of the 3D sampling view). */
function buildShellGridLines(rows: number, cols: number): THREE.BufferGeometry {
  const pts: number[] = [];
  const grid: THREE.Vector3[][] = [];
  const c = new THREE.Vector3();
  for (let i = 0; i <= rows; i++) {
    PROFILE.getPointAt(i / rows, c);
    const row: THREE.Vector3[] = [];
    for (let j = 0; j <= cols; j++) {
      row.push(
        shellPointFromProfile(c, columnPhi(j / cols, openAt(c.y)), 0, 1, new THREE.Vector3()),
      );
    }
    grid.push(row);
  }
  for (let i = 0; i <= rows; i++) {
    for (let j = 0; j <= cols; j++) {
      const p = grid[i]?.[j];
      const right = grid[i]?.[j + 1];
      const up = grid[i + 1]?.[j];
      if (p && right) pts.push(p.x, p.y, p.z, right.x, right.y, right.z);
      if (p && up) pts.push(p.x, p.y, p.z, up.x, up.y, up.z);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return geo;
}

/** Copy of a surface pushed out along its normals — rendered back-faced as an ink outline. */
function inflatedHull(geo: THREE.BufferGeometry, amount: number): THREE.BufferGeometry {
  const hull = new THREE.BufferGeometry();
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const nor = geo.getAttribute("normal") as THREE.BufferAttribute;
  const out = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    out[i * 3] = pos.getX(i) + nor.getX(i) * amount;
    out[i * 3 + 1] = pos.getY(i) + nor.getY(i) * amount;
    out[i * 3 + 2] = pos.getZ(i) + nor.getZ(i) * amount;
  }
  hull.setAttribute("position", new THREE.BufferAttribute(out, 3));
  const index = geo.getIndex();
  if (index) hull.setIndex(index.clone());
  return hull;
}

type SurfaceFrame = {
  p: THREE.Vector3;
  t: THREE.Vector3;
  b: THREE.Vector3;
  n: THREE.Vector3;
};

function surfaceFrame(
  y: number,
  phi: number,
  lift: number,
  inset = 0,
  loftScale = 1,
): SurfaceFrame {
  const u = uAtY(y);
  const du = 0.002;
  const dPhi = 0.004;
  const pa = shellPoint(Math.max(0, u - du), phi, inset, loftScale, new THREE.Vector3());
  const pb = shellPoint(Math.min(1, u + du), phi, inset, loftScale, new THREE.Vector3());
  const pl = shellPoint(u, phi - dPhi, inset, loftScale, new THREE.Vector3());
  const pr = shellPoint(u, phi + dPhi, inset, loftScale, new THREE.Vector3());
  const p = shellPoint(u, phi, inset, loftScale, new THREE.Vector3());
  const b = pb.sub(pa).normalize();
  const t = pr.sub(pl).normalize();
  const n = new THREE.Vector3().crossVectors(t, b).normalize();
  t.crossVectors(b, n).normalize();
  p.addScaledVector(n, lift);
  return { p, t, b, n };
}

function framesAlong(
  y0: number,
  y1: number,
  steps: number,
  phiOf: (y: number) => number,
  lift: number,
  inset = 0,
  loftScale = 1,
): SurfaceFrame[] {
  const frames: SurfaceFrame[] = [];
  for (let i = 0; i <= steps; i++) {
    const y = THREE.MathUtils.lerp(y0, y1, i / steps);
    frames.push(surfaceFrame(y, phiOf(y), lift, inset, loftScale));
  }
  return frames;
}

function ribbonGeometry(
  frames: SurfaceFrame[],
  width: number,
  offset = 0,
): THREE.BufferGeometry {
  const positions = new Float32Array(frames.length * 2 * 3);
  const v = new THREE.Vector3();
  frames.forEach((f, i) => {
    [-1, 1].forEach((side, s) => {
      v.copy(f.p).addScaledVector(f.t, offset + (side * width) / 2);
      positions.set([v.x, v.y, v.z], (i * 2 + s) * 3);
    });
  });
  const indices: number[] = [];
  for (let i = 0; i < frames.length - 1; i++) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Sleeves: parametric tube along a curve, with quilting data for the stitch shader.
 * ──────────────────────────────────────────────────────────────────────────── */
const SLEEVE_TS = 150;
const SLEEVE_RS = 48;

function sleevePath(side: -1 | 1): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(side * 0.52, 0.5, 0),
      new THREE.Vector3(side * 0.8, 0.42, 0),
      new THREE.Vector3(side * 0.96, 0.1, 0.02),
      new THREE.Vector3(side * 1.02, -0.32, 0.05),
      new THREE.Vector3(side * 0.98, -0.74, 0.08),
    ],
    false,
    "centripetal",
  );
}

const sleeveBaseRadius = (u: number) => {
  const body = 0.182 + 0.016 * Math.sin(Math.PI * Math.min(1, u / 0.85));
  return THREE.MathUtils.lerp(body, 0.118, smoothstep(0.85, 0.93, u));
};

function buildSleeveGeometry(
  path: THREE.CatmullRomCurve3,
  ts: number,
  rs: number,
  detailed: boolean,
): THREE.BufferGeometry {
  const frames = path.computeFrenetFrames(ts, false);
  const len = path.getLength();
  const count = (ts + 1) * (rs + 1);
  const positions = new Float32Array(count * 3);
  const quilts = new Float32Array(count * 4);
  const P = new THREE.Vector3();
  const n = new THREE.Vector3();

  for (let i = 0; i <= ts; i++) {
    const u = i / ts;
    path.getPointAt(u, P);
    const N = frames.normals[i] ?? new THREE.Vector3(0, 1, 0);
    const B = frames.binormals[i] ?? new THREE.Vector3(0, 0, 1);
    const cuffSeam = 0.9;
    for (let j = 0; j <= rs; j++) {
      const v = (j / rs) * TAU;
      n.copy(N).multiplyScalar(-Math.cos(v)).addScaledVector(B, Math.sin(v));
      let r = sleeveBaseRadius(u);
      let q: number;
      let dash = v * r;
      const structural = Math.abs(u - cuffSeam) * len;
      if (u > cuffSeam) {
        q = (v * r) / 0.03;
        dash = -1;
        if (detailed) r += 0.006 * (0.5 + 0.5 * Math.sin(v * 30)) * smoothstep(0.9, 0.93, u);
      } else {
        q = (u * len) / 0.2 + 0.06 * Math.sin(v);
        if (detailed) {
          r +=
            SLEEVE_LOFT *
            baffle(q, 0.38) *
            smoothstep(0.03, 0.09, u) *
            (1 - smoothstep(0.82, 0.88, u));
          r += smoothstep(0.78, 0.88, u) * 0.008 * Math.sin(v * 16);
        }
      }
      const k = i * (rs + 1) + j;
      positions.set([P.x + n.x * r, P.y + n.y * r, P.z + n.z * r], k * 3);
      quilts.set([q, structural, dash, 0], k * 4);
    }
  }

  const indices: number[] = [];
  for (let i = 1; i <= ts; i++) {
    for (let j = 1; j <= rs; j++) {
      const a = (rs + 1) * (i - 1) + (j - 1);
      const b = (rs + 1) * i + (j - 1);
      const c = (rs + 1) * i + j;
      const d = (rs + 1) * (i - 1) + j;
      indices.push(a, b, d, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aQuilt", new THREE.BufferAttribute(quilts, 4));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function buildSleeveGridLines(path: THREE.CatmullRomCurve3): THREE.BufferGeometry {
  const ts = 18;
  const rs = 14;
  const frames = path.computeFrenetFrames(ts, false);
  const ring: THREE.Vector3[][] = [];
  for (let i = 0; i <= ts; i++) {
    const u = i / ts;
    const P = path.getPointAt(u);
    const N = frames.normals[i] ?? new THREE.Vector3(0, 1, 0);
    const B = frames.binormals[i] ?? new THREE.Vector3(0, 0, 1);
    const row: THREE.Vector3[] = [];
    for (let j = 0; j <= rs; j++) {
      const v = (j / rs) * TAU;
      const r = sleeveBaseRadius(u);
      row.push(
        P.clone()
          .addScaledVector(N, -Math.cos(v) * r)
          .addScaledVector(B, Math.sin(v) * r),
      );
    }
    ring.push(row);
  }
  const pts: number[] = [];
  for (let i = 0; i <= ts; i++) {
    for (let j = 0; j <= rs; j++) {
      const p = ring[i]?.[j];
      const right = ring[i]?.[j + 1];
      const up = ring[i + 1]?.[j];
      if (p && right) pts.push(p.x, p.y, p.z, right.x, right.y, right.z);
      if (p && up) pts.push(p.x, p.y, p.z, up.x, up.y, up.z);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return geo;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Shader hook: stitch lines + "tech-pack sketch" crossfade (paper + ink) on the
 * existing physical materials, driven by one shared uniform.
 * ──────────────────────────────────────────────────────────────────────────── */
type SketchUniform = { value: number };

const STITCH_GLSL = /* glsl */ `
  float dqLine = abs(fract(vQuilt.x + 0.5) - 0.5);
  float wqLine = max(fwidth(vQuilt.x), 1e-4);
  float chanLine = 1.0 - smoothstep(0.55, 1.5, dqLine / wqLine);
  float dashLine = vQuilt.z < 0.0 ? 1.0 : step(fract(vQuilt.z / 0.03), 0.62);
  float wsLine = max(fwidth(vQuilt.y), 1e-4);
  float structLine = 1.0 - smoothstep(0.9, 2.2, vQuilt.y / wsLine);
  designStitch = max(chanLine * dashLine, structLine);
  designInk = max(chanLine * dashLine * 0.6, structLine);
`;

function installDesignShader(
  mat: THREE.MeshPhysicalMaterial,
  sketch: SketchUniform,
  lines: boolean,
): void {
  const paper = new THREE.Color(PAPER_COLOR);
  const ink = new THREE.Color(INK_COLOR);
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uSketch = sketch;
    shader.uniforms.uPaper = { value: paper };
    shader.uniforms.uInk = { value: ink };
    if (lines) {
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nattribute vec4 aQuilt;\nvarying vec4 vQuilt;",
        )
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvQuilt = aQuilt;");
    }
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform float uSketch;
uniform vec3 uPaper;
uniform vec3 uInk;
${lines ? "varying vec4 vQuilt;" : ""}`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
float designStitch = 0.0;
float designInk = 0.0;
${lines ? STITCH_GLSL : ""}
diffuseColor.rgb *= 1.0 - 0.32 * designStitch * (1.0 - uSketch);
diffuseColor.rgb = mix(diffuseColor.rgb, uPaper, uSketch);
diffuseColor.rgb = mix(diffuseColor.rgb, uInk, uSketch * designInk);`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.95, uSketch);",
      );
  };
  mat.customProgramCacheKey = () => (lines ? "dj-design-lines" : "dj-design-plain");
}

/** Box with planar quilting data so the stitch shader draws channels on a fabric swatch. */
function quiltedSwatchGeometry(w: number, h: number, d: number): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(w, h, d, 1, 1, 1);
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const quilts = new Float32Array(pos.count * 4);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    quilts.set([(x + z * 0.6) / 0.09 + 0.5, 1, z + 1, 0], i * 4);
  }
  geo.setAttribute("aQuilt", new THREE.BufferAttribute(quilts, 4));
  return geo;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Studio mode presets.
 * ──────────────────────────────────────────────────────────────────────────── */
type PropKey = "stack" | "sampling" | "measure" | "devProps" | "board";

const MODE_PRESETS: Record<
  DesignMode,
  { sketch: number; sway: number; offset: [number, number, number]; props: PropKey[] }
> = {
  techpack: { sketch: 1, sway: 0.1, offset: [0, 0, 0], props: [] },
  bom: { sketch: 0, sway: 0.12, offset: [-0.15, 0, 0], props: ["stack"] },
  sampling: { sketch: 0, sway: 0.28, offset: [-0.35, 0, 0], props: ["sampling"] },
  development: { sketch: 0, sway: 0.06, offset: [-0.1, 0, 0], props: ["measure", "devProps"] },
  presentation: { sketch: 0, sway: 0.14, offset: [-0.75, 0, 0], props: ["board"] },
};

/**
 * Stage 01 — Product Design studio. Builds a structured quilted jacket from the
 * Dojo tech pack (V-yoke quilting, stand collar with zigzag-quilted placket, #5
 * centre-front zipper, welt pockets with concealed snaps, ¼" elasticated cuffs & hem)
 * and the props for five design-service views: tech-pack sketch, BOM material stack,
 * 3D-sampling pattern grid, development measurements, and a presentation line sheet.
 */
export function buildTShirt(mats: SharedStageMaterials): TShirtBuild {
  const { track, matTee, matTeeCollar, matBrand, matChrome, matObsidian } = mats;
  const clipPlanes = matTee.clippingPlanes;

  const tshirtGroup = new THREE.Group();
  const jacketRig = new THREE.Group(); // animated offset per studio mode
  const jacket = new THREE.Group(); // the garment itself (cloned for the line sheet)
  jacketRig.add(jacket);

  const sketch: SketchUniform = { value: 0 };

  /* ── Materials ─────────────────────────────────────────────────────────── */
  const matShell = mats.makePhys({
    roughness: 0.58,
    metalness: 0,
    sheen: 0.35,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color(SHELL_SHEEN),
    clearcoat: 0.08,
    clearcoatRoughness: 0.6,
  });
  const matBinding = mats.makePhys({
    roughness: 0.66,
    sheen: 0.3,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color(SHELL_SHEEN),
  });
  // Share colour objects with the tee materials so the colorway picker drives the jacket.
  matShell.color = matTee.color;
  matBinding.color = matTeeCollar.color;

  const matLining = mats.makePhys({
    color: LINING_COLOR,
    roughness: 0.55,
    sheen: 0.4,
    sheenRoughness: 0.4,
    sheenColor: new THREE.Color(0xd5dae0),
    side: THREE.BackSide,
  });
  const matPlacket = mats.makePhys({
    color: PLACKET_COLOR,
    roughness: 0.6,
    sheen: 0.35,
    side: THREE.DoubleSide,
  });
  const matTape = mats.makePhys({
    color: TAPE_COLOR,
    roughness: 0.78,
    side: THREE.DoubleSide,
  });
  const matInterior = mats.makePhys({
    color: 0x15171b,
    roughness: 0.95,
    side: THREE.DoubleSide,
  });
  const matStitch = mats.makePhys({ color: STITCH_COLOR, roughness: 0.8 });

  installDesignShader(matShell, sketch, true);
  installDesignShader(matBinding, sketch, false);
  installDesignShader(matLining, sketch, false);
  installDesignShader(matPlacket, sketch, false);

  const matOutline = track(
    new THREE.MeshBasicMaterial({
      color: INK_COLOR,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      clippingPlanes: clipPlanes,
    }),
  );

  const tubeThrough = (pts: THREE.Vector3[], radius: number, closed = false, radial = 10) =>
    track(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(pts, closed, "centripetal"),
        pts.length * 3,
        radius,
        radial,
        closed,
      ),
    );

  const placeOnFrame = <T extends THREE.Object3D>(obj: T, f: SurfaceFrame): T => {
    obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(f.t, f.b, f.n));
    obj.position.copy(f.p);
    return obj;
  };

  /* ── Shell (body + stand collar), lining, outline ─────────────────────── */
  const shellGeo = track(buildShellGeometry(300, 280, 0, 1, true));
  const shell = new THREE.Mesh(shellGeo, matShell);
  shell.castShadow = true;
  shell.receiveShadow = true;

  const lining = new THREE.Mesh(
    track(buildShellGeometry(110, 100, SHELL_THICKNESS, 0.3, false)),
    matLining,
  );
  lining.receiveShadow = true;

  const outlineGroup = new THREE.Group();
  outlineGroup.add(new THREE.Mesh(track(inflatedHull(shellGeo, 0.009)), matOutline));
  jacket.add(shell, lining, outlineGroup);

  /* ── Bindings: hem, collar rim, open front edges ──────────────────────── */
  const bindInset = SHELL_THICKNESS / 2;
  const tmp = new THREE.Vector3();

  const hemPts: THREE.Vector3[] = [];
  for (let j = 0; j < 160; j++) {
    hemPts.push(shellPoint(0, columnPhi(j / 160, 0), bindInset, 1, tmp).clone());
  }
  const hemBinding = new THREE.Mesh(tubeThrough(hemPts, 0.018, true, 12), matBinding);
  hemBinding.castShadow = true;

  const topOpen = openAt(COLLAR_TOP_Y);
  const rimPts: THREE.Vector3[] = [];
  for (let j = 0; j <= 90; j++) {
    rimPts.push(shellPoint(1, columnPhi(j / 90, topOpen), bindInset, 1, tmp).clone());
  }
  const collarRim = new THREE.Mesh(tubeThrough(rimPts, 0.015), matBinding);

  const edgeBindings = [1, -1].map((side) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const y = THREE.MathUtils.lerp(SLIDER_Y, COLLAR_TOP_Y, i / 40);
      pts.push(shellPoint(uAtY(y), side * openAt(y), bindInset, 1, tmp).clone());
    }
    return new THREE.Mesh(tubeThrough(pts, 0.014), matBinding);
  });
  jacket.add(hemBinding, collarRim, ...edgeBindings);

  /* ── #5 centre-front zipper ───────────────────────────────────────────── */
  const zipperGroup = new THREE.Group();
  const toothGeo = track(new THREE.BoxGeometry(0.022, 0.007, 0.01));
  const halfToothGeo = track(new THREE.BoxGeometry(0.016, 0.007, 0.01));

  const buildTeeth = (geo: THREE.BufferGeometry, placements: Array<[SurfaceFrame, number]>) => {
    const teeth = new THREE.InstancedMesh(geo, matChrome, placements.length);
    const m = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    placements.forEach(([f, offset], i) => {
      pos.copy(f.p).addScaledVector(f.t, offset);
      m.makeBasis(f.t, f.b, f.n).setPosition(pos);
      teeth.setMatrixAt(i, m);
    });
    teeth.instanceMatrix.needsUpdate = true;
    teeth.castShadow = true;
    return teeth;
  };

  const lowerTape = new THREE.Mesh(
    track(ribbonGeometry(framesAlong(HEM_Y + 0.01, SLIDER_Y, 150, () => 0, 0.004), 0.066)),
    matTape,
  );
  const lowerTeeth: Array<[SurfaceFrame, number]> = [];
  let toothIdx = 0;
  for (let y = HEM_Y + 0.035; y < SLIDER_Y; y += 0.0115, toothIdx++) {
    lowerTeeth.push([surfaceFrame(y, 0, 0.009), toothIdx % 2 === 0 ? 0.004 : -0.004]);
  }
  zipperGroup.add(lowerTape, buildTeeth(toothGeo, lowerTeeth));

  const upperTeeth: Array<[SurfaceFrame, number]> = [];
  [1, -1].forEach((side) => {
    const edgePhi = (y: number) => side * openAt(y);
    zipperGroup.add(
      new THREE.Mesh(
        track(
          ribbonGeometry(
            framesAlong(SLIDER_Y, COLLAR_TOP_Y - 0.012, 60, edgePhi, 0.005),
            0.036,
            -side * 0.007,
          ),
        ),
        matTape,
      ),
    );
    const start = SLIDER_Y + 0.03 + (side > 0 ? 0 : 0.0115);
    for (let y = start; y < COLLAR_TOP_Y - 0.02; y += 0.023) {
      upperTeeth.push([surfaceFrame(y, edgePhi(y), 0.01), -side * 0.02]);
    }
  });
  zipperGroup.add(buildTeeth(halfToothGeo, upperTeeth));

  // Slider + metal pull tab (as in the reference photo) with a branded cord.
  const sliderFrame = surfaceFrame(SLIDER_Y, 0, 0.015);
  const slider = placeOnFrame(new THREE.Group(), sliderFrame);
  const sliderBody = new THREE.Mesh(track(new THREE.BoxGeometry(0.048, 0.07, 0.02)), matChrome);
  const sliderCap = new THREE.Mesh(track(new THREE.BoxGeometry(0.058, 0.016, 0.024)), matChrome);
  sliderCap.position.y = 0.03;
  const pullPivot = new THREE.Group();
  pullPivot.position.set(0, -0.02, 0.014);
  pullPivot.rotation.x = -0.2;
  const pullTab = new THREE.Mesh(track(new THREE.BoxGeometry(0.04, 0.13, 0.009)), matChrome);
  pullTab.position.y = -0.068;
  pullTab.castShadow = true;
  const pullWindow = new THREE.Mesh(track(new THREE.BoxGeometry(0.015, 0.03, 0.011)), matTape);
  pullWindow.position.y = -0.105;
  const pullCord = new THREE.Mesh(track(new THREE.TorusGeometry(0.018, 0.004, 8, 24)), matBrand);
  pullCord.position.y = -0.145;
  pullPivot.add(pullTab, pullWindow, pullCord);
  slider.add(sliderBody, sliderCap, pullPivot);
  zipperGroup.add(slider);
  jacket.add(zipperGroup);

  /* ── Zigzag-quilted inner placket ─────────────────────────────────────── */
  const placketFrames = framesAlong(SLIDER_Y - 0.02, COLLAR_TOP_Y - 0.01, 60, () => 0, 0, 0.034, 0);
  const placket = new THREE.Mesh(track(ribbonGeometry(placketFrames, 0.11)), matPlacket);
  const zigzag = new THREE.CurvePath<THREE.Vector3>();
  let prev: THREE.Vector3 | null = null;
  let zi = 0;
  for (let y = SLIDER_Y + 0.01; y < COLLAR_TOP_Y - 0.02; y += 0.032, zi++) {
    const f = surfaceFrame(y, 0, 0.003, 0.034, 0);
    const pt = f.p.clone().addScaledVector(f.t, zi % 2 === 0 ? 0.034 : -0.034);
    if (prev) zigzag.add(new THREE.LineCurve3(prev, pt));
    prev = pt;
  }
  const zigzagStitch = new THREE.Mesh(
    track(new THREE.TubeGeometry(zigzag, zi * 8, 0.003, 5, false)),
    matStitch,
  );
  jacket.add(placket, zigzagStitch);

  /* ── Welt pockets with concealed snaps ────────────────────────────────── */
  const pocketGroup = new THREE.Group();
  const pocketY0 = -0.6;
  const pocketY1 = -0.22;
  const pocketPhi = (side: number) => (y: number) =>
    side * THREE.MathUtils.lerp(0.9, 0.8, (y - pocketY0) / (pocketY1 - pocketY0));
  [1, -1].forEach((side) => {
    const phiOf = pocketPhi(side);
    const welt = new THREE.Mesh(
      track(ribbonGeometry(framesAlong(pocketY0, pocketY1, 32, phiOf, 0.006), 0.042)),
      matBinding,
    );
    const slit = new THREE.Mesh(
      track(
        ribbonGeometry(
          framesAlong(pocketY0 + 0.01, pocketY1 - 0.01, 32, phiOf, 0.0095),
          0.007,
          -side * 0.016,
        ),
      ),
      matTape,
    );
    pocketGroup.add(welt, slit);
    [pocketY0, pocketY1].forEach((by) => {
      const tack = new THREE.Mesh(track(new THREE.BoxGeometry(0.05, 0.006, 0.006)), matStitch);
      pocketGroup.add(placeOnFrame(tack, surfaceFrame(by, phiOf(by), 0.01)));
    });
    const snap = placeOnFrame(new THREE.Group(), surfaceFrame(-0.52, side * 0.7, 0.007));
    const snapCap = new THREE.Mesh(track(new THREE.CylinderGeometry(0.022, 0.022, 0.01, 24)), matChrome);
    snapCap.rotation.x = Math.PI / 2;
    const snapDome = new THREE.Mesh(track(new THREE.SphereGeometry(0.012, 16, 8)), matChrome);
    snapDome.position.z = 0.005;
    snapDome.scale.z = 0.5;
    snap.add(snapCap, snapDome);
    pocketGroup.add(snap);
  });
  jacket.add(pocketGroup);

  /* ── Quilted sleeves with ¼" elasticated cuffs ─────────────────────────── */
  const sleevePaths = { left: sleevePath(-1), right: sleevePath(1) };
  [sleevePaths.left, sleevePaths.right].forEach((path) => {
    const geo = track(buildSleeveGeometry(path, SLEEVE_TS, SLEEVE_RS, true));
    const arm = new THREE.Mesh(geo, matShell);
    arm.castShadow = true;
    arm.receiveShadow = true;
    outlineGroup.add(new THREE.Mesh(track(inflatedHull(geo, 0.008)), matOutline));

    const end = path.getPointAt(1);
    const dir = path.getTangentAt(1).normalize();
    const facing = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    const cuffBinding = new THREE.Mesh(track(new THREE.TorusGeometry(0.12, 0.015, 12, 56)), matBinding);
    cuffBinding.quaternion.copy(facing);
    cuffBinding.position.copy(end);
    const opening = new THREE.Mesh(track(new THREE.CircleGeometry(0.114, 40)), matInterior);
    opening.quaternion.copy(facing);
    opening.position.copy(end).addScaledVector(dir, -0.005);
    jacket.add(arm, cuffBinding, opening);
  });

  /* ── Display stand ────────────────────────────────────────────────────── */
  const standGroup = new THREE.Group();
  const standBase = new THREE.Mesh(track(new THREE.CylinderGeometry(0.5, 0.56, 0.07, 40)), matObsidian);
  standBase.position.y = -1.46;
  standBase.receiveShadow = true;
  const pole = new THREE.Mesh(track(new THREE.CylinderGeometry(0.03, 0.035, 1.5, 16)), matChrome);
  pole.position.y = -0.72;
  standGroup.add(standBase, pole);

  /* ══ Studio props ═════════════════════════════════════════════════════════ */
  const anchors: Record<string, THREE.Object3D> = {};
  const addAnchor = (key: string, parent: THREE.Object3D, pos: THREE.Vector3) => {
    const a = new THREE.Object3D();
    a.position.copy(pos);
    parent.add(a);
    anchors[key] = a;
    return a;
  };

  // Presentation clones must be taken before anchors are added to the jacket.
  const backView = jacket.clone(true);
  const sideView = jacket.clone(true);

  /* BOM: exploded material stack (shell / fill / lining) */
  const stack = new THREE.Group();
  const shellSwatch = new THREE.Mesh(track(quiltedSwatchGeometry(0.44, 0.022, 0.44)), matShell);
  shellSwatch.position.y = 0.13;
  shellSwatch.castShadow = true;
  const matFill = mats.makePhys({ color: 0xf4f2ee, roughness: 1, sheen: 0.8, sheenColor: new THREE.Color(0xffffff) });
  const fill = new THREE.Group();
  const puffGeo = track(new THREE.IcosahedronGeometry(0.075, 1));
  for (let i = 0; i < 16; i++) {
    const puff = new THREE.Mesh(puffGeo, matFill);
    puff.position.set(((i % 4) - 1.5) * 0.1 + Math.sin(i * 2.1) * 0.015, 0, (Math.floor(i / 4) - 1.5) * 0.1 + Math.cos(i * 1.7) * 0.015);
    puff.scale.set(0.95 + 0.15 * Math.sin(i), 0.42, 0.95 + 0.15 * Math.cos(i * 1.3));
    fill.add(puff);
  }
  const matLiningSwatch = mats.makePhys({ color: LINING_COLOR, roughness: 0.5, sheen: 0.4, side: THREE.DoubleSide });
  const liningSwatch = new THREE.Mesh(track(new THREE.BoxGeometry(0.44, 0.01, 0.44)), matLiningSwatch);
  liningSwatch.position.y = -0.13;
  stack.add(shellSwatch, fill, liningSwatch);
  stack.position.set(1.62, 0.3, 0.1);
  stack.rotation.set(0.55, -0.5, 0.1);
  addAnchor("bomFill", stack, new THREE.Vector3(0.24, 0, 0));

  /* 3D sampling: pattern-grid ghost (back view) + simulation scan ring */
  const samplingGroup = new THREE.Group();
  const matGrid = track(
    new THREE.LineBasicMaterial({ color: GRID_COLOR, transparent: true, opacity: 0.75, clippingPlanes: clipPlanes }),
  );
  const ghost = new THREE.Group();
  ghost.add(new THREE.LineSegments(track(buildShellGridLines(26, 40)), matGrid));
  ghost.add(new THREE.LineSegments(track(buildSleeveGridLines(sleevePaths.left)), matGrid));
  ghost.add(new THREE.LineSegments(track(buildSleeveGridLines(sleevePaths.right)), matGrid));
  ghost.scale.setScalar(0.52);
  ghost.position.set(1.75, 0.25, -0.8);
  ghost.rotation.y = Math.PI + 0.35;
  addAnchor("ghost", ghost, new THREE.Vector3(-0.8, 0.5, 0));

  const ringPts: THREE.Vector3[] = [];
  for (let i = 0; i < 96; i++) {
    const a = (i / 96) * TAU;
    ringPts.push(new THREE.Vector3(Math.sin(a) * 0.8, 0, Math.cos(a) * 0.42));
  }
  const matScan = track(
    new THREE.MeshBasicMaterial({
      color: SAMPLING_COLOR,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      clippingPlanes: clipPlanes,
    }),
  );
  const scanRing = new THREE.Mesh(tubeThrough(ringPts, 0.006, true, 6), matScan);
  addAnchor("scan", scanRing, new THREE.Vector3(0.8, 0, 0));
  samplingGroup.add(ghost);
  jacketRig.add(scanRing);

  /* Development: points-of-measure dimension lines + lab-dip swatches + tape */
  const measureGroup = new THREE.Group();
  const matMeasure = track(new THREE.MeshBasicMaterial({ color: MEASURE_COLOR, clippingPlanes: clipPlanes }));
  const tickGeo = track(new THREE.SphereGeometry(0.016, 12, 8));
  const dimension = (pts: THREE.Vector3[], labelKey: string, labelAt: number) => {
    measureGroup.add(new THREE.Mesh(tubeThrough(pts, 0.005, false, 6), matMeasure));
    [pts[0], pts[pts.length - 1]].forEach((p) => {
      if (!p) return;
      const tick = new THREE.Mesh(tickGeo, matMeasure);
      tick.position.copy(p);
      measureGroup.add(tick);
    });
    const curve = new THREE.CatmullRomCurve3(pts);
    addAnchor(labelKey, measureGroup, curve.getPointAt(labelAt));
  };
  const chestY = 0.14;
  const chestFrontZ = shellPoint(uAtY(chestY), 0, 0, 1, new THREE.Vector3()).z + 0.1;
  const chestW = shellPoint(uAtY(chestY), Math.PI / 2, 0, 1, new THREE.Vector3()).x;
  dimension(
    [new THREE.Vector3(-chestW, chestY, chestFrontZ), new THREE.Vector3(chestW, chestY, chestFrontZ)],
    "pomChest",
    0.3,
  );
  const lengthX = -0.36;
  dimension(
    [new THREE.Vector3(lengthX, 0.86, 0.34), new THREE.Vector3(lengthX, -0.4, 0.42), new THREE.Vector3(lengthX, HEM_Y, 0.38)],
    "pomLength",
    0.62,
  );
  const sleevePts: THREE.Vector3[] = [];
  for (let i = 0; i <= 16; i++) {
    const u = THREE.MathUtils.lerp(0.14, 1, i / 16);
    const p = sleevePaths.right.getPointAt(u);
    sleevePts.push(p.add(new THREE.Vector3(1, 0.15, 0.25).normalize().multiplyScalar(sleeveBaseRadius(u) + 0.07)));
  }
  dimension(sleevePts, "pomSleeve", 0.55);
  jacketRig.add(measureGroup);

  const devProps = new THREE.Group();
  const swatches = new THREE.Group();
  const rackBase = new THREE.Mesh(track(new THREE.BoxGeometry(0.95, 0.05, 0.36)), matObsidian);
  rackBase.position.y = -1.46;
  swatches.add(rackBase);
  COLORWAYS.slice(0, 3).forEach((cw, idx) => {
    const card = new THREE.Group();
    const plate = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.24, 0.34, 0.025)),
      mats.makePhys({ color: new THREE.Color(cw.hex).getHex(), roughness: 0.6, sheen: 0.4 }),
    );
    plate.castShadow = true;
    const footer = new THREE.Mesh(track(new THREE.BoxGeometry(0.24, 0.07, 0.028)), matChrome);
    footer.position.y = -0.14;
    card.add(plate, footer);
    card.position.set((idx - 1) * 0.28, -1.26, 0);
    card.rotation.x = -0.22;
    swatches.add(card);
  });
  swatches.position.set(1.45, 0, 0.55);
  swatches.rotation.y = -0.45;
  addAnchor("labDips", swatches, new THREE.Vector3(0.3, -1.1, 0));

  const matTapeMeasure = mats.makePhys({ color: 0xf2c94c, roughness: 0.45 });
  const tapeCoil = new THREE.Mesh(track(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 32)), matTapeMeasure);
  tapeCoil.position.set(-1.25, -1.44, 0.55);
  const tapeStrip = new THREE.Mesh(track(new THREE.BoxGeometry(0.62, 0.004, 0.05)), matTapeMeasure);
  tapeStrip.position.set(-0.92, -1.465, 0.72);
  tapeStrip.rotation.y = -0.5;
  devProps.add(swatches, tapeCoil, tapeStrip);

  /* Presentation: line-sheet board with back & side views and colour chips */
  const board = new THREE.Group();
  const matBoard = mats.makePhys({ color: 0xf3f1ec, roughness: 0.9 });
  const boardPanel = new THREE.Mesh(track(new THREE.BoxGeometry(1.75, 1.42, 0.03)), matBoard);
  boardPanel.receiveShadow = true;
  const boardFoot = new THREE.Mesh(track(new THREE.BoxGeometry(1.75, 0.04, 0.4)), matObsidian);
  boardFoot.position.set(0, -0.73, 0.12);
  board.add(boardPanel, boardFoot);
  backView.scale.setScalar(0.34);
  backView.rotation.y = Math.PI;
  backView.position.set(-0.42, 0.12, 0.2);
  sideView.scale.setScalar(0.34);
  sideView.rotation.y = Math.PI / 2;
  sideView.position.set(0.45, 0.12, 0.2);
  board.add(backView, sideView);
  COLORWAYS.forEach((cw, i) => {
    const chip = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.26, 0.09, 0.02)),
      mats.makePhys({ color: new THREE.Color(cw.hex).getHex(), roughness: 0.7 }),
    );
    chip.position.set(-0.48 + i * 0.32, -0.5, 0.03);
    board.add(chip);
  });
  addAnchor("viewBack", board, new THREE.Vector3(-0.42, -0.33, 0.1));
  addAnchor("viewSide", board, new THREE.Vector3(0.45, -0.33, 0.1));
  board.position.set(1.62, -0.2, -0.75);
  board.rotation.y = -0.42;

  /* Garment anchors (tech pack + BOM pins), parented to the jacket so they follow it */
  const sleeveMid = sleevePaths.right.getPointAt(0.45);
  const cuffEnd = sleevePaths.right.getPointAt(0.96);
  addAnchor("collar", jacket, surfaceFrame(1.12, -0.95, 0).p);
  addAnchor("placket", jacket, surfaceFrame(0.98, 0, 0, 0.034, 0).p);
  addAnchor("zipper", jacket, surfaceFrame(SLIDER_Y - 0.12, 0, 0.012).p);
  addAnchor("pocket", jacket, surfaceFrame(-0.4, 0.86, 0.01).p);
  addAnchor("sleeve", jacket, sleeveMid.clone().add(new THREE.Vector3(0.12, 0, 0.17)));
  addAnchor("cuff", jacket, cuffEnd.clone().add(new THREE.Vector3(0.06, -0.02, 0.1)));
  addAnchor("hem", jacket, surfaceFrame(-0.88, 0.35, 0.012).p);
  addAnchor("bomShell", jacket, surfaceFrame(0.02, -0.42, 0.01).p);
  addAnchor("bomLining", jacket, shellPoint(uAtY(1.08), Math.PI, SHELL_THICKNESS, 0, new THREE.Vector3()));
  addAnchor("bomZipper", jacket, surfaceFrame(-0.1, 0, 0.012).p);
  addAnchor("bomSnap", jacket, surfaceFrame(-0.52, 0.7, 0.012).p);
  addAnchor("bomElastic", jacket, surfaceFrame(-0.89, -0.5, 0.012).p);
  addAnchor("viewFront", jacket, new THREE.Vector3(0, HEM_Y - 0.12, 0.4));

  tshirtGroup.add(jacketRig, standGroup, stack, samplingGroup, devProps, board);
  tshirtGroup.position.set(0, 0.12, 0);

  /* ══ Studio state machine ═════════════════════════════════════════════════ */
  const propObjects: Record<PropKey, THREE.Object3D[]> = {
    stack: [stack],
    sampling: [samplingGroup, scanRing],
    measure: [measureGroup],
    devProps: [devProps],
    board: [board],
  };
  const propBaseScale = new Map<THREE.Object3D, number>();
  Object.values(propObjects).flat().forEach((o) => propBaseScale.set(o, o.scale.x));
  const propWeight: Record<PropKey, number> = { stack: 0, sampling: 0, measure: 0, devProps: 0, board: 0 };

  let mode: DesignMode = "techpack";
  let sway = MODE_PRESETS.techpack.sway;
  const offsetTarget = new THREE.Vector3();

  const applyProps = () => {
    (Object.keys(propObjects) as PropKey[]).forEach((key) => {
      const w = propWeight[key];
      const eased = w * w * (3 - 2 * w);
      propObjects[key].forEach((o) => {
        o.visible = w > 0.002;
        o.scale.setScalar((propBaseScale.get(o) ?? 1) * Math.max(0.001, eased));
      });
    });
  };
  applyProps();

  const designStudio: DesignStudio = {
    anchors,
    setMode: (next) => {
      mode = next;
    },
    getSway: () => sway,
    update: (elapsed, delta) => {
      const preset = MODE_PRESETS[mode];
      const k = 1 - Math.exp(-Math.min(delta, 0.1) * 5);
      sketch.value += (preset.sketch - sketch.value) * k;
      matOutline.opacity = sketch.value;
      outlineGroup.visible = sketch.value > 0.01;
      sway += (preset.sway - sway) * k;
      offsetTarget.set(...preset.offset);
      jacketRig.position.lerp(offsetTarget, k);
      (Object.keys(propObjects) as PropKey[]).forEach((key) => {
        const target = preset.props.includes(key) ? 1 : 0;
        propWeight[key] += (target - propWeight[key]) * k;
      });
      applyProps();

      // Idle animation for visible props.
      stack.position.y = 0.3 + Math.sin(elapsed * 1.2) * 0.03;
      shellSwatch.position.y = 0.13 + propWeight.stack * 0.04;
      liningSwatch.position.y = -0.13 - propWeight.stack * 0.04;
      ghost.rotation.y = Math.PI + 0.35 + Math.sin(elapsed * 0.5) * 0.25;
      const sweep = (elapsed * 0.35) % 1;
      const yScan = THREE.MathUtils.lerp(HEM_Y + 0.05, COLLAR_TOP_Y - 0.05, sweep);
      scanRing.position.y = yScan;
      const prof = PROFILE.getPointAt(uAtY(yScan));
      const scanScale = propBaseScale.get(scanRing) ?? 1;
      const sw = Math.max(0.001, propWeight.sampling);
      scanRing.scale.set((prof.x / 0.8 + 0.06) * scanScale * sw, scanScale * sw, (prof.z / 0.42 + 0.1) * scanScale * sw);
      matScan.opacity = 0.9 * Math.sin(Math.PI * sweep);
    },
  };

  return { tshirtGroup, swatches, designStudio };
}
