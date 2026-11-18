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
 * Palette. Shell + binding colours follow the Journey colorway (matTee / matTeeCollar);
 * lining and hood interior are a darkened copy of the shell colour.
 * ──────────────────────────────────────────────────────────────────────────── */
const SHELL_SHEEN = 0x2a3240;
const TRIM_BLACK = 0x0d0f12;
const PAPER_COLOR = 0xf6f4ef;
const INK_COLOR = 0x1b2333;
const MEASURE_COLOR = 0xef4444;
const SAMPLING_COLOR = 0x60a5fa;
const GRID_COLOR = 0x94a3b8;

/* ────────────────────────────────────────────────────────────────────────────
 * Garment geometry (local units). Hooded woven softshell: smooth shell with raglan
 * seams, chin-guard collar, attached structured hood, straight topstitched hem.
 * ──────────────────────────────────────────────────────────────────────────── */
const HEM_Y = -0.92;
const HEM_STITCH_Y = -0.87;
const NECK_Y = 0.93;
const COLLAR_TOP_Y = 1.18;
const UNDERARM_Y = 0.32;
const SHELL_THICKNESS = 0.022;

/** Whole garment rig scale/offset so the hood stays clear of the stage HUD. */
const RIG_SCALE = 0.9;
const RIG_Y = -0.08;

const TAU = Math.PI * 2;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

/* Body silhouette: (half-width, height, half-depth) from hem up to chin-guard top. */
const PROFILE = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0.68, -0.92, 0.341),
    new THREE.Vector3(0.685, -0.8, 0.3465),
    new THREE.Vector3(0.69, -0.5, 0.352),
    new THREE.Vector3(0.7, -0.1, 0.3575),
    new THREE.Vector3(0.705, 0.25, 0.363),
    new THREE.Vector3(0.69, 0.5, 0.352),
    new THREE.Vector3(0.62, 0.68, 0.3245),
    new THREE.Vector3(0.47, 0.82, 0.2882),
    new THREE.Vector3(0.31, 0.9, 0.235),
    new THREE.Vector3(0.272, 0.97, 0.226),
    new THREE.Vector3(0.264, 1.08, 0.228),
    new THREE.Vector3(0.268, 1.18, 0.234),
  ],
  false,
  "centripetal",
);

/* Hood silhouette: (half-width, height, half-depth); leans back over the head. */
const HOOD_PROFILE = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0.324, 0.92, 0.2625),
    new THREE.Vector3(0.351, 1.02, 0.3045),
    new THREE.Vector3(0.3618, 1.16, 0.3465),
    new THREE.Vector3(0.3564, 1.32, 0.3727),
    new THREE.Vector3(0.3294, 1.46, 0.3622),
    new THREE.Vector3(0.2592, 1.57, 0.3045),
    new THREE.Vector3(0.1404, 1.645, 0.189),
    new THREE.Vector3(0.0216, 1.672, 0.0315),
  ],
  false,
  "centripetal",
);
const HOOD_BRIM_Y = 1.585;
const hoodCenterZ = (y: number) =>
  -0.075 * smoothstep(0.92, 1.3, y) + 0.03 * smoothstep(1.45, 1.67, y);
/** Half-angle of the face opening: wide around the chin guard, closing into the brim. */
const hoodOpen = (y: number) => {
  const e = (Math.max(y, 1.28) - 1.28) / (HOOD_BRIM_Y - 1.28);
  return 1.02 * Math.sqrt(Math.max(0, 1 - e * e));
};

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

/** Column t∈[0,1] → angle (0 = centre front), with an optional front opening of ±open. */
function columnPhi(t: number, open: number): number {
  const side = t <= 0.5 ? 1 : -1;
  const raw = t <= 0.5 ? t * TAU : t * TAU - TAU;
  return side * open + raw * (1 - open / Math.PI);
}

/** Front raglan seam angle at height y (back seam mirrors it with a slightly wider sweep). */
const raglanFront = (y: number) =>
  THREE.MathUtils.lerp(1.45, 0.62, clamp01((y - UNDERARM_Y) / (NECK_Y - UNDERARM_Y)));
const raglanBack = (y: number) =>
  Math.PI - THREE.MathUtils.lerp(1.45, 0.78, clamp01((y - UNDERARM_Y) / (NECK_Y - UNDERARM_Y)));

type SurfacePointFn = (
  c: THREE.Vector3,
  phi: number,
  inset: number,
  detail: number,
  out: THREE.Vector3,
  quilt?: THREE.Vector4,
) => THREE.Vector3;

/**
 * Body + chin-guard point. `quilt` carries data for the seam shader:
 * x = channel coord (0.5 = no channel lines), y = distance to structural seams, z = dash coord.
 */
const bodyPoint: SurfacePointFn = (c, phi, inset, detail, out, quilt) => {
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

  const aphi = Math.abs(phi);
  let structural = Math.abs(y - HEM_STITCH_Y);
  if (y >= UNDERARM_Y && y <= NECK_Y) {
    structural = Math.min(
      structural,
      Math.abs(aphi - raglanFront(y)) * w,
      Math.abs(aphi - raglanBack(y)) * w,
    );
  } else if (y < UNDERARM_Y) {
    structural = Math.min(structural, Math.abs(aphi - Math.PI / 2) * w);
  } else {
    structural = Math.min(structural, Math.abs(y - (COLLAR_TOP_Y - 0.03)));
  }

  // Soft woven drape: gentle low-frequency wrinkles, a little stronger at the underarms.
  const underarm = Math.exp(-(((aphi - Math.PI / 2) / 0.5) ** 2)) * smoothstep(-0.2, 0.3, y) * (1 - smoothstep(0.3, 0.5, y));
  const wrinkle =
    0.0035 * Math.sin(phi * 5 + y * 7) * Math.sin(y * 3.1 + 0.4) +
    0.006 * underarm * Math.sin(y * 34 + aphi * 6);
  const centreFront = smoothstep(0.02, 0.08, aphi * w); // keep the zipper line flat

  if (quilt) quilt.set(0.5, structural, aphi * w, 0);
  const r = wrinkle * detail * centreFront - inset;
  return out.set(w * s + nx * r, y, d * co + nz * r);
};

const hoodPoint: SurfacePointFn = (c, phi, inset, detail, out, quilt) => {
  const w = Math.max(c.x, 0.004);
  const y = c.y;
  const d = Math.max(c.z, 0.004);
  const s = Math.sin(phi);
  const co = Math.cos(phi);
  let nx = s / w;
  let nz = co / d;
  const nl = Math.hypot(nx, nz) || 1;
  nx /= nl;
  nz /= nl;

  const aphi = Math.abs(phi);
  const edgeArc = (aphi - hoodOpen(y)) * w;
  // Centre-back seam + topstitch running parallel to the face opening.
  const structural = Math.min(Math.abs(aphi - Math.PI) * w, Math.abs(edgeArc - 0.028));
  const lip = 0.008 * (1 - smoothstep(0, 0.05, edgeArc));
  const wrinkle = 0.004 * Math.sin(phi * 4 + y * 10) * smoothstep(0.95, 1.1, y);

  if (quilt) quilt.set(0.5, structural, aphi * w, 0);
  const r = (wrinkle + lip) * detail - inset;
  return out.set(w * s + nx * r, y, hoodCenterZ(y) + d * co + nz * r);
};

const _profileTmp = new THREE.Vector3();
function shellPoint(
  u: number,
  phi: number,
  inset: number,
  detail: number,
  out: THREE.Vector3,
): THREE.Vector3 {
  PROFILE.getPointAt(clamp01(u), _profileTmp);
  return bodyPoint(_profileTmp, phi, inset, detail, out);
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

/** Parametric surface (rows along a profile, columns around it) with optional seam data. */
function buildSurfaceGeometry(
  profile: THREE.Curve<THREE.Vector3>,
  openAt: (y: number) => number,
  point: SurfacePointFn,
  rows: number,
  cols: number,
  inset: number,
  detail: number,
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
    profile.getPointAt(u, c);
    const open = openAt(c.y);
    for (let j = 0; j <= cols; j++) {
      const t = j / cols;
      point(c, columnPhi(t, open), inset, detail, p, qv);
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

/** Quad-grid wireframe of a surface (the "digital pattern" look of the sampling view). */
function buildSurfaceGridLines(
  profile: THREE.Curve<THREE.Vector3>,
  openAt: (y: number) => number,
  point: SurfacePointFn,
  rows: number,
  cols: number,
): THREE.BufferGeometry {
  const grid: THREE.Vector3[][] = [];
  const c = new THREE.Vector3();
  for (let i = 0; i <= rows; i++) {
    profile.getPointAt(i / rows, c);
    const open = openAt(c.y);
    const row: THREE.Vector3[] = [];
    for (let j = 0; j <= cols; j++) {
      row.push(point(c, columnPhi(j / cols, open), 0, 0, new THREE.Vector3()));
    }
    grid.push(row);
  }
  const pts: number[] = [];
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

/** Local frame on the body surface, for placing trims flush on the shell. */
function surfaceFrame(y: number, phi: number, lift: number, inset = 0): SurfaceFrame {
  const u = uAtY(y);
  const du = 0.002;
  const dPhi = 0.004;
  const pa = shellPoint(Math.max(0, u - du), phi, inset, 1, new THREE.Vector3());
  const pb = shellPoint(Math.min(1, u + du), phi, inset, 1, new THREE.Vector3());
  const pl = shellPoint(u, phi - dPhi, inset, 1, new THREE.Vector3());
  const pr = shellPoint(u, phi + dPhi, inset, 1, new THREE.Vector3());
  const p = shellPoint(u, phi, inset, 1, new THREE.Vector3());
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
): SurfaceFrame[] {
  const frames: SurfaceFrame[] = [];
  for (let i = 0; i <= steps; i++) {
    const y = THREE.MathUtils.lerp(y0, y1, i / steps);
    frames.push(surfaceFrame(y, phiOf(y), lift));
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
 * Raglan sleeves: parametric tube along a curve with drape wrinkles and seam data.
 * ──────────────────────────────────────────────────────────────────────────── */
const SLEEVE_TS = 150;
const SLEEVE_RS = 48;
const CUFF_STITCH_U = 0.955;

function sleevePath(side: -1 | 1): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(side * 0.48, 0.56, 0),
      new THREE.Vector3(side * 0.74, 0.44, 0),
      new THREE.Vector3(side * 0.87, 0.1, 0.02),
      new THREE.Vector3(side * 0.91, -0.32, 0.05),
      new THREE.Vector3(side * 0.88, -0.78, 0.08),
    ],
    false,
    "centripetal",
  );
}

const sleeveBaseRadius = (u: number) => 0.18 - 0.042 * smoothstep(0.05, 0.95, u);

function buildSleeveGeometry(path: THREE.CatmullRomCurve3): THREE.BufferGeometry {
  const ts = SLEEVE_TS;
  const rs = SLEEVE_RS;
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
    const elbow = Math.exp(-(((u - 0.56) / 0.11) ** 2));
    const stack = smoothstep(0.8, 0.88, u) * (1 - smoothstep(0.93, 0.96, u));
    for (let j = 0; j <= rs; j++) {
      const v = (j / rs) * TAU;
      n.copy(N).multiplyScalar(-Math.cos(v)).addScaledVector(B, Math.sin(v));
      const r =
        sleeveBaseRadius(u) +
        0.007 * elbow * Math.sin(v * 2 + u * 30) +
        0.005 * stack * Math.sin(v * 3 + u * 70) +
        0.002 * Math.sin(v * 5 + u * 12);
      const k = i * (rs + 1) + j;
      positions.set([P.x + n.x * r, P.y + n.y * r, P.z + n.z * r], k * 3);
      quilts.set([0.5, Math.abs(u - CUFF_STITCH_U) * len, v * r, 0], k * 4);
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
      row.push(P.clone().addScaledVector(N, -Math.cos(v) * r).addScaledVector(B, Math.sin(v) * r));
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
 * Shader hook: seam/topstitch lines + "tech-pack sketch" crossfade (paper + ink)
 * on the existing physical materials, driven by one shared uniform.
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
        .replace("#include <common>", "#include <common>\nattribute vec4 aQuilt;\nvarying vec4 vQuilt;")
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
diffuseColor.rgb *= 1.0 - 0.38 * designStitch * (1.0 - uSketch);
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
 * Stage 01 — Product Design studio. Builds a hooded woven softshell jacket (structured
 * hood with drawcords, raglan sleeves, full-length coil zipper to a chin guard, zippered
 * hand pockets, hook-and-loop cuff tabs, straight topstitched hem) and the props for five
 * design-service views: tech-pack sketch, BOM material stack, 3D-sampling pattern grid,
 * development measurements, and a presentation line sheet.
 */
export function buildTShirt(
  mats: SharedStageMaterials,
  options: { detail?: number } = {},
): TShirtBuild {
  // Mesh density (1 = desktop; lower on phones/tablets).
  const detail = Math.min(1, Math.max(0.3, options.detail ?? 1));
  const res = (n: number) => Math.max(24, Math.round(n * detail));
  const { track, matTee, matTeeCollar, matChrome, matObsidian } = mats;
  const clipPlanes = matTee.clippingPlanes;

  const tshirtGroup = new THREE.Group();
  const jacketRig = new THREE.Group(); // animated offset per studio mode
  jacketRig.scale.setScalar(RIG_SCALE);
  jacketRig.position.y = RIG_Y;
  const jacket = new THREE.Group(); // the garment itself (cloned for the line sheet)
  jacketRig.add(jacket);

  const sketch: SketchUniform = { value: 0 };

  /* ── Materials ─────────────────────────────────────────────────────────── */
  const matShell = mats.makePhys({
    roughness: 0.82,
    metalness: 0,
    sheen: 0.15,
    sheenRoughness: 0.7,
    sheenColor: new THREE.Color(SHELL_SHEEN),
  });
  const matBinding = mats.makePhys({
    roughness: 0.85,
    sheen: 0.12,
    sheenRoughness: 0.7,
    sheenColor: new THREE.Color(SHELL_SHEEN),
  });
  // Share colour objects with the tee materials so the colorway picker drives the jacket.
  matShell.color = matTee.color;
  matBinding.color = matTeeCollar.color;

  // Interior (body lining + hood inside): darkened shell colour, refreshed every frame.
  const interiorColor = new THREE.Color();
  const syncInterior = () => interiorColor.copy(matTee.color).multiplyScalar(0.42);
  syncInterior();
  const matInterior = mats.makePhys({ roughness: 0.9, side: THREE.BackSide });
  matInterior.color = interiorColor;
  const matOpening = mats.makePhys({ roughness: 0.95, side: THREE.DoubleSide });
  matOpening.color = interiorColor;

  const matTrim = mats.makePhys({ color: TRIM_BLACK, roughness: 0.6, side: THREE.DoubleSide });
  const matCoil = mats.makePhys({ color: 0x15171b, roughness: 0.45, metalness: 0.1 });
  const matSliderMetal = mats.makePhys({ color: 0x2b2e33, roughness: 0.35, metalness: 0.8 });
  const matVelcro = mats.makePhys({ color: TRIM_BLACK, roughness: 0.95 });

  installDesignShader(matShell, sketch, true);
  installDesignShader(matBinding, sketch, false);
  installDesignShader(matInterior, sketch, false);

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

  const noOpening = () => 0;
  const outlineGroup = new THREE.Group();

  /* ── Body shell + chin guard, lining ───────────────────────────────────── */
  const shellGeo = track(buildSurfaceGeometry(PROFILE, noOpening, bodyPoint, res(300), res(280), 0, 1, true));
  const shell = new THREE.Mesh(shellGeo, matShell);
  shell.castShadow = true;
  shell.receiveShadow = true;
  const lining = new THREE.Mesh(
    track(buildSurfaceGeometry(PROFILE, noOpening, bodyPoint, 90, 90, SHELL_THICKNESS, 0, false)),
    matInterior,
  );
  outlineGroup.add(new THREE.Mesh(track(inflatedHull(shellGeo, 0.008)), matOutline));
  jacket.add(shell, lining);

  /* ── Structured hood ───────────────────────────────────────────────────── */
  const hoodGeo = track(buildSurfaceGeometry(HOOD_PROFILE, hoodOpen, hoodPoint, res(120), res(160), 0, 1, true));
  const hood = new THREE.Mesh(hoodGeo, matShell);
  hood.castShadow = true;
  hood.receiveShadow = true;
  const hoodLining = new THREE.Mesh(
    track(buildSurfaceGeometry(HOOD_PROFILE, hoodOpen, hoodPoint, 60, 80, SHELL_THICKNESS, 0, false)),
    matInterior,
  );
  outlineGroup.add(new THREE.Mesh(track(inflatedHull(hoodGeo, 0.008)), matOutline));

  // Rolled binding around the face opening (bottom-left → brim → bottom-right).
  const hoodRimPts: THREE.Vector3[] = [];
  const hoodC = new THREE.Vector3();
  const rimSamples = 40;
  const sampleHoodEdge = (i: number, side: number) => {
    const y = THREE.MathUtils.lerp(0.94, HOOD_BRIM_Y + 0.004, i / rimSamples);
    HOOD_PROFILE.getPointAt(uAtHoodY(y), hoodC);
    return hoodPoint(hoodC, side * hoodOpen(hoodC.y), SHELL_THICKNESS / 2, 1, new THREE.Vector3());
  };
  for (let i = 0; i <= rimSamples; i++) hoodRimPts.push(sampleHoodEdge(i, -1));
  for (let i = rimSamples; i >= 0; i--) hoodRimPts.push(sampleHoodEdge(i, 1));
  const hoodRim = new THREE.Mesh(tubeThrough(hoodRimPts, 0.014), matBinding);
  jacket.add(hood, hoodLining, hoodRim);

  /* ── Hem + chin-guard bindings ─────────────────────────────────────────── */
  const tmp = new THREE.Vector3();
  const ringPoints = (u: number, n: number) => {
    const pts: THREE.Vector3[] = [];
    for (let j = 0; j < n; j++) pts.push(shellPoint(u, columnPhi(j / n, 0), SHELL_THICKNESS / 2, 1, tmp).clone());
    return pts;
  };
  const hemBinding = new THREE.Mesh(tubeThrough(ringPoints(0, 160), 0.012, true, 10), matBinding);
  const collarRim = new THREE.Mesh(tubeThrough(ringPoints(1, 90), 0.012, true, 10), matBinding);
  jacket.add(hemBinding, collarRim);

  /* ── Full-length coil zipper to the chin guard ─────────────────────────── */
  const zipperGroup = new THREE.Group();
  const zipTop = COLLAR_TOP_Y - 0.008;
  zipperGroup.add(
    new THREE.Mesh(
      track(ribbonGeometry(framesAlong(HEM_Y + 0.005, zipTop, 170, () => 0, 0.003), 0.05)),
      matTrim,
    ),
  );
  const coilGeo = track(new THREE.BoxGeometry(0.016, 0.0045, 0.008));
  const coilFrames: SurfaceFrame[] = [];
  for (let y = HEM_Y + 0.02; y < zipTop - 0.01; y += 0.0075) coilFrames.push(surfaceFrame(y, 0, 0.006));
  const coil = new THREE.InstancedMesh(coilGeo, matCoil, coilFrames.length);
  const m4 = new THREE.Matrix4();
  const cpos = new THREE.Vector3();
  coilFrames.forEach((f, i) => {
    cpos.copy(f.p).addScaledVector(f.t, i % 2 === 0 ? 0.003 : -0.003);
    m4.makeBasis(f.t, f.b, f.n).setPosition(cpos);
    coil.setMatrixAt(i, m4);
  });
  coil.instanceMatrix.needsUpdate = true;
  zipperGroup.add(coil);

  const makePuller = (scale: number) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(track(new THREE.BoxGeometry(0.036, 0.05, 0.016)), matSliderMetal);
    const pivot = new THREE.Group();
    pivot.position.set(0, -0.012, 0.012);
    pivot.rotation.x = -0.18;
    const tab = new THREE.Mesh(track(new THREE.BoxGeometry(0.03, 0.1, 0.008)), matTrim);
    tab.position.y = -0.055;
    tab.castShadow = true;
    pivot.add(tab);
    g.add(body, pivot);
    g.scale.setScalar(scale);
    return g;
  };
  zipperGroup.add(placeOnFrame(makePuller(1), surfaceFrame(COLLAR_TOP_Y - 0.07, 0, 0.012)));
  jacket.add(zipperGroup);

  /* ── Hood drawcords exiting either side of the chin guard ─────────────── */
  const cordGroup = new THREE.Group();
  const cordAnchors: Record<number, THREE.Vector3> = {};
  [1, -1].forEach((side) => {
    const f = surfaceFrame(COLLAR_TOP_Y - 0.05, side * 0.2, 0.004);
    const p0 = f.p;
    const pts = [
      p0.clone(),
      p0.clone().add(new THREE.Vector3(side * 0.01, -0.06, 0.03)),
      p0.clone().add(new THREE.Vector3(side * 0.018, -0.15, 0.04)),
      p0.clone().add(new THREE.Vector3(side * 0.02, -0.22, 0.035)),
    ];
    cordGroup.add(new THREE.Mesh(tubeThrough(pts, 0.0055, false, 8), matTrim));
    const eyelet = placeOnFrame(
      new THREE.Mesh(track(new THREE.TorusGeometry(0.011, 0.004, 8, 18)), matSliderMetal),
      f,
    );
    const toggle = new THREE.Mesh(track(new THREE.CylinderGeometry(0.014, 0.014, 0.045, 14)), matTrim);
    toggle.position.copy(pts[2] ?? p0);
    const tip = new THREE.Mesh(track(new THREE.CylinderGeometry(0.008, 0.007, 0.03, 10)), matTrim);
    tip.position.copy(pts[3] ?? p0).add(new THREE.Vector3(0, -0.012, 0));
    cordGroup.add(eyelet, toggle, tip);
    cordAnchors[side] = (pts[2] ?? p0).clone();
  });
  jacket.add(cordGroup);

  /* ── Slanted zippered hand pockets ─────────────────────────────────────── */
  const pocketGroup = new THREE.Group();
  const pocketY0 = -0.52;
  const pocketY1 = -0.08;
  const pocketPhi = (side: number) => (y: number) =>
    side * THREE.MathUtils.lerp(0.58, 0.47, (y - pocketY0) / (pocketY1 - pocketY0));
  const pocketMid: Record<number, THREE.Vector3> = {};
  [1, -1].forEach((side) => {
    const phiOf = pocketPhi(side);
    pocketGroup.add(
      new THREE.Mesh(track(ribbonGeometry(framesAlong(pocketY0, pocketY1, 40, phiOf, 0.003), 0.03)), matTrim),
      new THREE.Mesh(track(ribbonGeometry(framesAlong(pocketY0 + 0.01, pocketY1 - 0.01, 40, phiOf, 0.0055), 0.008)), matCoil),
    );
    pocketGroup.add(placeOnFrame(makePuller(0.7), surfaceFrame(pocketY1 - 0.03, phiOf(pocketY1 - 0.03), 0.01)));
    pocketMid[side] = surfaceFrame(-0.3, phiOf(-0.3), 0.01).p;
  });
  jacket.add(pocketGroup);

  /* ── Raglan sleeves with hook-and-loop cuff tabs ───────────────────────── */
  const sleevePaths = { left: sleevePath(-1), right: sleevePath(1) };
  const cuffTabPos: Record<number, THREE.Vector3> = {};
  ([[-1, sleevePaths.left], [1, sleevePaths.right]] as const).forEach(([side, path]) => {
    const geo = track(buildSleeveGeometry(path));
    const arm = new THREE.Mesh(geo, matShell);
    arm.castShadow = true;
    arm.receiveShadow = true;
    outlineGroup.add(new THREE.Mesh(track(inflatedHull(geo, 0.007)), matOutline));

    const end = path.getPointAt(1);
    const dir = path.getTangentAt(1).normalize();
    const facing = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    const endR = sleeveBaseRadius(1);
    const cuffBinding = new THREE.Mesh(track(new THREE.TorusGeometry(endR, 0.01, 10, 56)), matBinding);
    cuffBinding.quaternion.copy(facing);
    cuffBinding.position.copy(end);
    const opening = new THREE.Mesh(track(new THREE.CircleGeometry(endR - 0.006, 40)), matOpening);
    opening.quaternion.copy(facing);
    opening.position.copy(end).addScaledVector(dir, -0.004);

    // Cuff tab on the outer, front-facing side of the cuff.
    const u = 0.93;
    const P = path.getPointAt(u);
    const T = path.getTangentAt(u).normalize();
    const out = new THREE.Vector3(side, 0, 0.55).normalize();
    out.addScaledVector(T, -out.dot(T)).normalize();
    const tab = new THREE.Mesh(track(new THREE.BoxGeometry(0.075, 0.12, 0.012)), matVelcro);
    const xAxis = new THREE.Vector3().crossVectors(T, out).normalize();
    tab.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAxis, T, out));
    tab.position.copy(P).addScaledVector(out, sleeveBaseRadius(u) + 0.006);
    tab.castShadow = true;
    cuffTabPos[side] = tab.position.clone().addScaledVector(out, 0.01);
    jacket.add(arm, cuffBinding, opening, tab);
  });
  jacket.add(outlineGroup);

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

  // Presentation clones must be taken after every garment part and before anchors are added.
  const backView = jacket.clone(true);
  const sideView = jacket.clone(true);

  /* BOM: material stack (woven shell over mesh lining) */
  const stack = new THREE.Group();
  const shellSwatch = new THREE.Mesh(track(new THREE.BoxGeometry(0.44, 0.02, 0.44)), matShell);
  const swatchQuilt = new Float32Array((shellSwatch.geometry.getAttribute("position") as THREE.BufferAttribute).count * 4);
  for (let i = 0; i < swatchQuilt.length; i += 4) swatchQuilt.set([0.5, 1, 1, 0], i);
  shellSwatch.geometry.setAttribute("aQuilt", new THREE.BufferAttribute(swatchQuilt, 4));
  shellSwatch.position.y = 0.09;
  shellSwatch.castShadow = true;
  const matMesh = mats.makePhys({ roughness: 0.9, side: THREE.DoubleSide });
  matMesh.color = interiorColor;
  const liningSwatch = new THREE.Mesh(track(new THREE.BoxGeometry(0.44, 0.008, 0.44)), matMesh);
  liningSwatch.position.y = -0.09;
  const zipSample = new THREE.Mesh(track(new THREE.BoxGeometry(0.05, 0.012, 0.5)), matTrim);
  zipSample.position.set(0, 0.107, 0);
  stack.add(shellSwatch, liningSwatch, zipSample);
  stack.position.set(1.55, 0.3, 0.1);
  stack.rotation.set(0.55, -0.5, 0.1);
  addAnchor("bomLining", liningSwatch, new THREE.Vector3(0.22, 0, 0.1));

  /* 3D sampling: pattern-grid ghost (back view) + simulation scan ring */
  const samplingGroup = new THREE.Group();
  const matGrid = track(
    new THREE.LineBasicMaterial({ color: GRID_COLOR, transparent: true, opacity: 0.75, clippingPlanes: clipPlanes }),
  );
  const ghost = new THREE.Group();
  ghost.add(new THREE.LineSegments(track(buildSurfaceGridLines(PROFILE, noOpening, bodyPoint, 26, 40)), matGrid));
  ghost.add(new THREE.LineSegments(track(buildSurfaceGridLines(HOOD_PROFILE, hoodOpen, hoodPoint, 12, 32)), matGrid));
  ghost.add(new THREE.LineSegments(track(buildSleeveGridLines(sleevePaths.left)), matGrid));
  ghost.add(new THREE.LineSegments(track(buildSleeveGridLines(sleevePaths.right)), matGrid));
  ghost.scale.setScalar(0.48);
  ghost.position.set(1.72, 0.22, -0.8);
  ghost.rotation.y = Math.PI + 0.35;
  addAnchor("ghost", ghost, new THREE.Vector3(-0.75, 0.55, 0));

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
    addAnchor(labelKey, measureGroup, new THREE.CatmullRomCurve3(pts).getPointAt(labelAt));
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
    [new THREE.Vector3(lengthX, 0.86, 0.32), new THREE.Vector3(lengthX, -0.4, 0.42), new THREE.Vector3(lengthX, HEM_Y, 0.38)],
    "pomLength",
    0.62,
  );
  const sleevePts: THREE.Vector3[] = [];
  for (let i = 0; i <= 16; i++) {
    const u = THREE.MathUtils.lerp(0.1, 1, i / 16);
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
      mats.makePhys({ color: new THREE.Color(cw.hex).getHex(), roughness: 0.8, sheen: 0.2 }),
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
  backView.scale.setScalar(0.3);
  backView.rotation.y = Math.PI;
  backView.position.set(-0.42, 0.06, 0.2);
  sideView.scale.setScalar(0.3);
  sideView.rotation.y = Math.PI / 2;
  sideView.position.set(0.45, 0.06, 0.2);
  board.add(backView, sideView);
  COLORWAYS.forEach((cw, i) => {
    const chip = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.26, 0.09, 0.02)),
      mats.makePhys({ color: new THREE.Color(cw.hex).getHex(), roughness: 0.8 }),
    );
    chip.position.set(-0.48 + i * 0.32, -0.52, 0.03);
    board.add(chip);
  });
  addAnchor("viewBack", board, new THREE.Vector3(-0.42, -0.36, 0.1));
  addAnchor("viewSide", board, new THREE.Vector3(0.45, -0.36, 0.1));
  board.position.set(1.62, -0.2, -0.75);
  board.rotation.y = -0.42;

  /* Garment anchors (tech pack + BOM pins), parented to the jacket so they follow it */
  HOOD_PROFILE.getPointAt(uAtHoodY(1.42), hoodC);
  addAnchor("hood", jacket, hoodPoint(hoodC, 1.25, -0.01, 1, new THREE.Vector3()));
  addAnchor("drawcord", jacket, cordAnchors[1] ?? new THREE.Vector3());
  addAnchor("zipper", jacket, surfaceFrame(0.3, 0, 0.012).p);
  addAnchor("pocket", jacket, pocketMid[1] ?? new THREE.Vector3());
  addAnchor("sleeve", jacket, sleevePaths.right.getPointAt(0.45).add(new THREE.Vector3(0.1, 0, 0.14)));
  addAnchor("cuff", jacket, cuffTabPos[1] ?? new THREE.Vector3());
  addAnchor("hem", jacket, surfaceFrame(-0.88, 0.35, 0.012).p);
  addAnchor("bomShell", jacket, surfaceFrame(0.1, -0.35, 0.01).p);
  addAnchor("bomZipper", jacket, surfaceFrame(-0.2, 0, 0.012).p);
  addAnchor("bomPocketZip", jacket, pocketMid[-1] ?? new THREE.Vector3());
  addAnchor("bomDrawcord", jacket, cordAnchors[-1] ?? new THREE.Vector3());
  addAnchor("bomCuffTab", jacket, cuffTabPos[-1] ?? new THREE.Vector3());
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
      syncInterior();
      const preset = MODE_PRESETS[mode];
      const k = 1 - Math.exp(-Math.min(delta, 0.1) * 5);
      sketch.value += (preset.sketch - sketch.value) * k;
      matOutline.opacity = sketch.value;
      outlineGroup.visible = sketch.value > 0.01;
      sway += (preset.sway - sway) * k;
      offsetTarget.set(preset.offset[0], preset.offset[1] + RIG_Y, preset.offset[2]);
      jacketRig.position.lerp(offsetTarget, k);
      (Object.keys(propObjects) as PropKey[]).forEach((key) => {
        const target = preset.props.includes(key) ? 1 : 0;
        propWeight[key] += (target - propWeight[key]) * k;
      });
      applyProps();

      stack.position.y = 0.3 + Math.sin(elapsed * 1.2) * 0.03;
      shellSwatch.position.y = 0.09 + propWeight.stack * 0.04;
      zipSample.position.y = 0.107 + propWeight.stack * 0.06;
      liningSwatch.position.y = -0.09 - propWeight.stack * 0.04;
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

/* Hood profile height → arc parameter (hood profile is monotonic in y). */
const HOOD_LUT_SIZE = 256;
const HOOD_LUT = new Float64Array(HOOD_LUT_SIZE + 1);
for (let i = 0; i <= HOOD_LUT_SIZE; i++) {
  HOOD_LUT[i] = HOOD_PROFILE.getPointAt(i / HOOD_LUT_SIZE).y;
}
function uAtHoodY(y: number): number {
  for (let i = 1; i <= HOOD_LUT_SIZE; i++) {
    const hi = HOOD_LUT[i] ?? 0;
    if (hi >= y) {
      const lo = HOOD_LUT[i - 1] ?? 0;
      const f = hi - lo > 1e-9 ? (y - lo) / (hi - lo) : 0;
      return clamp01((i - 1 + f) / HOOD_LUT_SIZE);
    }
  }
  return 1;
}
