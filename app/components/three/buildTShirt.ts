import * as THREE from "three";
import type { SharedStageMaterials } from "./materials";

export type TShirtBuild = {
  tshirtGroup: THREE.Group;
  swatches: THREE.Group;
};

/* ────────────────────────────────────────────────────────────────────────────
 * Palette (shell + binding colours follow the Journey colorway via matTee / matTeeCollar)
 * ──────────────────────────────────────────────────────────────────────────── */
const GRAPHITE_SWATCH = 0x2d3137;
const SHELL_SHEEN = 0x9aa3b2;
const LINING_COLOR = 0x8d949d;
const PLACKET_COLOR = 0x9ea5ae;
const TAPE_COLOR = 0x111316;
const STITCH_COLOR = 0x4a5059;

/* ────────────────────────────────────────────────────────────────────────────
 * Garment dimensions (local units, group is lifted by +0.12 like the old tee)
 * ──────────────────────────────────────────────────────────────────────────── */
const HEM_Y = -0.92;
const NECK_Y = 0.93; // body ↔ collar seam
const COLLAR_TOP_Y = 1.24;
const SLIDER_Y = 0.46; // zipper slider rests at the upper chest
const OPEN_MAX = 0.42; // half-angle (rad) of the open collar "V" at the collar top

const BODY_BAFFLE = 0.235; // spacing of the body quilting channels
const CHEVRON = 0.3; // how steeply the front channels rise toward the sides (V-quilt)
const BODY_PUFF = 0.048; // loft of each down chamber
const COLLAR_BAFFLE = 0.155;
const COLLAR_PUFF = 0.03;
const SHELL_THICKNESS = 0.032; // shell → lining gap

const TAU = Math.PI * 2;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const fract = (x: number) => x - Math.floor(x);
/** Rounded down-chamber bulge: 0 on the stitch line, 1 in the middle of a baffle. */
const baffle = (q: number, sharpness: number) =>
  Math.pow(Math.sin(Math.PI * fract(q)), sharpness);

/* ────────────────────────────────────────────────────────────────────────────
 * Body silhouette: (half-width, height, half-depth) from hem up to collar top.
 * Elastic hem → blouson body → rounded drop shoulders → neck seam → stand collar.
 * ──────────────────────────────────────────────────────────────────────────── */
const PROFILE = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0.74, -0.92, 0.38),
    new THREE.Vector3(0.75, -0.86, 0.385),
    new THREE.Vector3(0.8, -0.8, 0.41),
    new THREE.Vector3(0.86, -0.66, 0.45),
    new THREE.Vector3(0.88, -0.3, 0.46),
    new THREE.Vector3(0.885, 0.1, 0.465),
    new THREE.Vector3(0.87, 0.42, 0.46),
    new THREE.Vector3(0.83, 0.62, 0.44),
    new THREE.Vector3(0.7, 0.79, 0.4),
    new THREE.Vector3(0.48, 0.88, 0.34),
    new THREE.Vector3(0.32, 0.93, 0.29),
    new THREE.Vector3(0.295, 1.0, 0.275),
    new THREE.Vector3(0.305, 1.12, 0.285),
    new THREE.Vector3(0.322, 1.24, 0.3),
  ],
  false,
  "centripetal",
);

const Y_LUT_SIZE = 512;
const Y_LUT = new Float64Array(Y_LUT_SIZE + 1);
for (let i = 0; i <= Y_LUT_SIZE; i++) {
  Y_LUT[i] = PROFILE.getPointAt(i / Y_LUT_SIZE).y;
}

/** Inverse of the profile's height: arc-length parameter u for a given y. */
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
  const f = span > 1e-9 ? (y - yLo) / span : 0;
  return (lo + f) / Y_LUT_SIZE;
}

/** Half-angle of the centre-front opening: closed below the slider, a widening V above it. */
const openAt = (y: number) => OPEN_MAX * smoothstep(SLIDER_Y, COLLAR_TOP_Y, y);

/**
 * Maps a mesh column t∈[0,1] to an angle around the body (0 = centre front, +x = wearer's left),
 * squeezing the panels apart so the front edges sit at ±open.
 */
function columnPhi(t: number, open: number): number {
  const side = t <= 0.5 ? 1 : -1;
  const raw = t <= 0.5 ? t * TAU : t * TAU - TAU;
  return side * open + raw * (1 - open / Math.PI);
}

/**
 * Point on the jacket shell for a profile sample c = (halfW, y, halfD) at angle phi.
 * `inset` pushes inward along the surface normal (used for the lining & bindings),
 * `puffScale` scales the quilted loft.
 */
function shellPointFromProfile(
  c: THREE.Vector3,
  phi: number,
  inset: number,
  puffScale: number,
  out: THREE.Vector3,
): THREE.Vector3 {
  const w = c.x;
  const y = c.y;
  const d = c.z;
  const s = Math.sin(phi);
  const co = Math.cos(phi);

  // Outward normal of the elliptical cross-section.
  let nx = s / w;
  let nz = co / d;
  const nl = Math.hypot(nx, nz) || 1;
  nx /= nl;
  nz /= nl;

  // Arc distance from the centre-front (or from the open zipper edge above the slider).
  const open = openAt(y);
  const edgeArc = (Math.abs(phi) - open) * w;
  const edgeMask = smoothstep(0.035, 0.11, edgeArc);

  // Collar lapels roll outward as the zipper opens.
  const lapel =
    0.045 * smoothstep(0.75, COLLAR_TOP_Y, y) * (1 - smoothstep(0, 0.28, edgeArc));

  let puff = 0;
  if (y < NECK_Y) {
    // Chevron (V) quilting on the front, horizontal channels on the back.
    const lat = co > 0 ? Math.abs(s) : 1;
    const q = (y + 0.06 - CHEVRON * lat) / BODY_BAFFLE;
    const variance = 1 + 0.12 * Math.sin(phi * 3 + y * 5);
    puff =
      BODY_PUFF *
      variance *
      baffle(q, 0.62) *
      smoothstep(-0.84, -0.74, y) *
      (1 - smoothstep(0.86, NECK_Y, y)) *
      edgeMask;

    // ¼" elastic hem: tight gathers in the band + soft blouson pleats just above it.
    const band = 1 - smoothstep(-0.865, -0.835, y);
    puff += band * 0.011 * (0.5 + 0.5 * Math.sin(phi * 48));
    puff +=
      (1 - smoothstep(-0.86, -0.6, y)) * (1 - band) * 0.012 * Math.sin(phi * 21 + 0.6);
  } else {
    // Stand collar: two horizontal down channels.
    const q = (y - NECK_Y) / COLLAR_BAFFLE;
    puff =
      COLLAR_PUFF *
      baffle(q, 0.6) *
      smoothstep(NECK_Y, NECK_Y + 0.03, y) *
      (1 - smoothstep(COLLAR_TOP_Y - 0.03, COLLAR_TOP_Y, y)) *
      edgeMask;
  }

  const r = puff * puffScale + lapel - inset;
  return out.set(w * s + nx * r, y, d * co + nz * r);
}

const _profileTmp = new THREE.Vector3();
function shellPoint(
  u: number,
  phi: number,
  inset: number,
  puffScale: number,
  out: THREE.Vector3,
): THREE.Vector3 {
  PROFILE.getPointAt(clamp01(u), _profileTmp);
  return shellPointFromProfile(_profileTmp, phi, inset, puffScale, out);
}

/** Builds the whole jacket body + collar as one parametric surface. */
function buildShellGeometry(
  rows: number,
  cols: number,
  inset: number,
  puffScale: number,
): THREE.BufferGeometry {
  const positions = new Float32Array((rows + 1) * (cols + 1) * 3);
  const uvs = new Float32Array((rows + 1) * (cols + 1) * 2);
  const c = new THREE.Vector3();
  const p = new THREE.Vector3();

  let k = 0;
  for (let i = 0; i <= rows; i++) {
    const u = i / rows;
    PROFILE.getPointAt(u, c);
    const open = openAt(c.y);
    for (let j = 0; j <= cols; j++) {
      const t = j / cols;
      shellPointFromProfile(c, columnPhi(t, open), inset, puffScale, p);
      positions[k * 3] = p.x;
      positions[k * 3 + 1] = p.y;
      positions[k * 3 + 2] = p.z;
      uvs[k * 2] = t;
      uvs[k * 2 + 1] = u;
      k++;
    }
  }

  const indices: number[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const a = i * (cols + 1) + j;
      const b = a + 1;
      const cc = a + cols + 1;
      const dd = cc + 1;
      indices.push(a, b, cc, b, dd, cc);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

type SurfaceFrame = {
  p: THREE.Vector3; // position (already lifted off the surface)
  t: THREE.Vector3; // tangent around the body (+phi)
  b: THREE.Vector3; // tangent up the body (+y)
  n: THREE.Vector3; // outward normal
};

/** Local frame on the shell surface, for placing hardware & trims flush on the quilting. */
function surfaceFrame(
  y: number,
  phi: number,
  lift: number,
  inset = 0,
  puffScale = 1,
): SurfaceFrame {
  const u = uAtY(y);
  const du = 0.002;
  const dPhi = 0.004;
  const pa = shellPoint(Math.max(0, u - du), phi, inset, puffScale, new THREE.Vector3());
  const pb = shellPoint(Math.min(1, u + du), phi, inset, puffScale, new THREE.Vector3());
  const pl = shellPoint(u, phi - dPhi, inset, puffScale, new THREE.Vector3());
  const pr = shellPoint(u, phi + dPhi, inset, puffScale, new THREE.Vector3());
  const p = shellPoint(u, phi, inset, puffScale, new THREE.Vector3());

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
  puffScale = 1,
): SurfaceFrame[] {
  const frames: SurfaceFrame[] = [];
  for (let i = 0; i <= steps; i++) {
    const y = THREE.MathUtils.lerp(y0, y1, i / steps);
    frames.push(surfaceFrame(y, phiOf(y), lift, inset, puffScale));
  }
  return frames;
}

/** Flat strip laid along a list of surface frames (zipper tape, welts, placket…). */
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

/**
 * Stage 01: Builds a realistic quilted puffer jacket from the tech-pack reference on a
 * ghost-mannequin display stand — chevron-quilted body, puffy stand collar unzipped into a
 * V with a zigzag-quilted inner placket, #5 centre-front zipper with slider & pull, welt
 * pockets with concealed snaps, diagonally-quilted balloon sleeves, ¼" elasticated cuffs
 * and hem — plus a floor fabric-swatch rack.
 */
export function buildTShirt(mats: SharedStageMaterials): TShirtBuild {
  const { track, matTee, matTeeCollar, matBrand, matChrome, matObsidian } = mats;

  const tshirtGroup = new THREE.Group();

  /* ── Materials ─────────────────────────────────────────────────────────── */
  const matShell = mats.makePhys({
    roughness: 0.46,
    metalness: 0,
    sheen: 0.7,
    sheenRoughness: 0.42,
    sheenColor: new THREE.Color(SHELL_SHEEN),
    clearcoat: 0.22,
    clearcoatRoughness: 0.5,
  });
  const matBinding = mats.makePhys({
    roughness: 0.62,
    sheen: 0.5,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color(SHELL_SHEEN),
  });
  // Share the colour objects with the tee materials so the Journey colorway picker
  // (which tweens matTee / matTeeCollar colours) recolours the jacket shell & bindings.
  matShell.color = matTee.color;
  matBinding.color = matTeeCollar.color;

  const matLining = mats.makePhys({
    color: LINING_COLOR,
    roughness: 0.55,
    sheen: 0.45,
    sheenRoughness: 0.4,
    sheenColor: new THREE.Color(0xd5dae0),
    side: THREE.BackSide,
  });
  const matPlacket = mats.makePhys({
    color: PLACKET_COLOR,
    roughness: 0.58,
    sheen: 0.4,
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

  const tubeThrough = (
    pts: THREE.Vector3[],
    radius: number,
    closed = false,
    radial = 10,
  ) =>
    track(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(pts, closed, "centripetal"),
      pts.length * 3,
      radius,
      radial,
      closed,
    ),
    );

  const placeOnFrame = (obj: THREE.Object3D, f: SurfaceFrame) => {
    obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(f.t, f.b, f.n));
    obj.position.copy(f.p);
    return obj;
  };

  /* ── Quilted shell (body + stand collar) and inner lining ─────────────── */
  const shell = new THREE.Mesh(track(buildShellGeometry(300, 288, 0, 1)), matShell);
  shell.castShadow = true;
  shell.receiveShadow = true;

  const lining = new THREE.Mesh(
    track(buildShellGeometry(110, 100, SHELL_THICKNESS, 0.3)),
    matLining,
  );
  lining.receiveShadow = true;

  /* ── Bindings: elastic hem, collar top edge, open front edges ─────────── */
  const bindInset = SHELL_THICKNESS / 2;
  const tmp = new THREE.Vector3();

  const hemPts: THREE.Vector3[] = [];
  for (let j = 0; j < 160; j++) {
    hemPts.push(shellPoint(0, columnPhi(j / 160, 0), bindInset, 1, tmp).clone());
  }
  const hemBinding = new THREE.Mesh(tubeThrough(hemPts, 0.022, true, 12), matBinding);
  hemBinding.castShadow = true;

  const topOpen = openAt(COLLAR_TOP_Y);
  const rimPts: THREE.Vector3[] = [];
  for (let j = 0; j <= 90; j++) {
    rimPts.push(shellPoint(1, columnPhi(j / 90, topOpen), bindInset, 1, tmp).clone());
  }
  const collarRim = new THREE.Mesh(tubeThrough(rimPts, 0.019), matBinding);

  const edgeBindings = [1, -1].map((side) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
    const y = THREE.MathUtils.lerp(SLIDER_Y, COLLAR_TOP_Y, i / 40);
    pts.push(shellPoint(uAtY(y), side * openAt(y), bindInset, 1, tmp).clone());
    }
    return new THREE.Mesh(tubeThrough(pts, 0.017), matBinding);
  });

  /* ── #5 centre-front zipper ───────────────────────────────────────────── */
  const zipperGroup = new THREE.Group();
  const toothGeo = track(new THREE.BoxGeometry(0.024, 0.0075, 0.011));
  const halfToothGeo = track(new THREE.BoxGeometry(0.018, 0.0075, 0.011));

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

  // Closed section: hem → slider, interlocking teeth on a single tape.
  const lowerTape = new THREE.Mesh(
    track(ribbonGeometry(framesAlong(HEM_Y + 0.01, SLIDER_Y, 140, () => 0, 0.004), 0.075)),
    matTape,
  );
  const lowerTeeth: Array<[SurfaceFrame, number]> = [];
  let toothIdx = 0;
  for (let y = HEM_Y + 0.035; y < SLIDER_Y; y += 0.0125, toothIdx++) {
    lowerTeeth.push([surfaceFrame(y, 0, 0.01), toothIdx % 2 === 0 ? 0.0045 : -0.0045]);
  }
  zipperGroup.add(lowerTape, buildTeeth(toothGeo, lowerTeeth));

  // Open section: each half follows its own front edge up into the collar.
  const upperTeeth: Array<[SurfaceFrame, number]> = [];
  [1, -1].forEach((side) => {
    const edgePhi = (y: number) => side * openAt(y);
    const tape = new THREE.Mesh(
      track(
        ribbonGeometry(
          framesAlong(SLIDER_Y, COLLAR_TOP_Y - 0.012, 70, edgePhi, 0.005),
          0.04,
          -side * 0.008,
        ),
      ),
      matTape,
    );
    zipperGroup.add(tape);
    const start = SLIDER_Y + 0.03 + (side > 0 ? 0 : 0.0125);
    for (let y = start; y < COLLAR_TOP_Y - 0.02; y += 0.025) {
      upperTeeth.push([surfaceFrame(y, edgePhi(y), 0.011), -side * 0.022]);
    }
  });
  zipperGroup.add(buildTeeth(halfToothGeo, upperTeeth));

  // Slider + hanging pull tab with branded cord loop.
  const slider = placeOnFrame(new THREE.Group(), surfaceFrame(SLIDER_Y, 0, 0.016));
  const sliderBody = new THREE.Mesh(track(new THREE.BoxGeometry(0.052, 0.075, 0.022)), matChrome);
  const sliderCap = new THREE.Mesh(track(new THREE.BoxGeometry(0.064, 0.018, 0.026)), matChrome);
  sliderCap.position.y = 0.032;
  const pullPivot = new THREE.Group();
  pullPivot.position.set(0, -0.022, 0.016);
  pullPivot.rotation.x = -0.24;
  const pullTab = new THREE.Mesh(track(new THREE.BoxGeometry(0.042, 0.135, 0.01)), matChrome);
  pullTab.position.y = -0.07;
  pullTab.castShadow = true;
  const pullWindow = new THREE.Mesh(track(new THREE.BoxGeometry(0.016, 0.032, 0.012)), matTape);
  pullWindow.position.y = -0.108;
  const pullCord = new THREE.Mesh(track(new THREE.TorusGeometry(0.02, 0.0045, 8, 24)), matBrand);
  pullCord.position.y = -0.15;
  pullPivot.add(pullTab, pullWindow, pullCord);
  slider.add(sliderBody, sliderCap, pullPivot);
  zipperGroup.add(slider);

  /* ── Zigzag-quilted inner placket (storm flap behind the open zip) ────── */
  const placketFrames = framesAlong(SLIDER_Y - 0.02, COLLAR_TOP_Y - 0.01, 70, () => 0, 0, 0.04, 0);
  const placket = new THREE.Mesh(track(ribbonGeometry(placketFrames, 0.12)), matPlacket);

  const zigzag = new THREE.CurvePath<THREE.Vector3>();
  let prev: THREE.Vector3 | null = null;
  let zi = 0;
  for (let y = SLIDER_Y + 0.01; y < COLLAR_TOP_Y - 0.02; y += 0.034, zi++) {
    const f = surfaceFrame(y, 0, 0.003, 0.04, 0);
    const pt = f.p.clone().addScaledVector(f.t, zi % 2 === 0 ? 0.038 : -0.038);
    if (prev) zigzag.add(new THREE.LineCurve3(prev, pt));
    prev = pt;
  }
  const zigzagStitch = new THREE.Mesh(
    track(new THREE.TubeGeometry(zigzag, zi * 8, 0.0032, 5, false)),
    matStitch,
  );

  /* ── Welt pockets with concealed snaps ────────────────────────────────── */
  const pocketGroup = new THREE.Group();
  [1, -1].forEach((side) => {
    const pocketPhi = (y: number) =>
      side * THREE.MathUtils.lerp(0.84, 0.76, (y + 0.52) / 0.32);
    const weltFrames = framesAlong(-0.52, -0.2, 32, pocketPhi, 0.007);
    const welt = new THREE.Mesh(track(ribbonGeometry(weltFrames, 0.05)), matBinding);
    const slitFrames = framesAlong(-0.51, -0.21, 32, pocketPhi, 0.0105);
    const slit = new THREE.Mesh(track(ribbonGeometry(slitFrames, 0.008, -side * 0.02)), matTape);
    pocketGroup.add(welt, slit);

    // Bar-tacks at both ends of the welt.
    [-0.52, -0.2].forEach((by) => {
      const tack = new THREE.Mesh(track(new THREE.BoxGeometry(0.056, 0.007, 0.006)), matStitch);
      pocketGroup.add(placeOnFrame(tack, surfaceFrame(by, pocketPhi(by), 0.011)));
    });

    const snap = placeOnFrame(new THREE.Group(), surfaceFrame(-0.36, side * 0.62, 0.008));
    const snapCap = new THREE.Mesh(track(new THREE.CylinderGeometry(0.027, 0.027, 0.012, 24)), matChrome);
    snapCap.rotation.x = Math.PI / 2;
    const snapDome = new THREE.Mesh(track(new THREE.SphereGeometry(0.015, 16, 8)), matChrome);
    snapDome.position.z = 0.006;
    snapDome.scale.z = 0.5;
    snap.add(snapCap, snapDome);
    pocketGroup.add(snap);
  });

  /* ── Diagonally-quilted balloon sleeves with ¼" elasticated cuffs ─────── */
  const makeSleeve = (side: -1 | 1) => {
    const sg = new THREE.Group();
    const path = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(side * 0.6, 0.5, 0),
        new THREE.Vector3(side * 0.93, 0.4, 0),
        new THREE.Vector3(side * 1.12, 0.12, 0.03),
        new THREE.Vector3(side * 1.19, -0.33, 0.06),
        new THREE.Vector3(side * 1.14, -0.76, 0.09),
      ],
      false,
      "centripetal",
    );
    const TS = 160;
    const RS = 56;
    const R0 = 0.28;
    const geo = track(new THREE.TubeGeometry(path, TS, R0, RS, false));
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const nor = geo.attributes.normal as THREE.BufferAttribute;
    const len = path.getLength();
    const center = new THREE.Vector3();
    const n = new THREE.Vector3();

    for (let k = 0; k < pos.count; k++) {
      const i = Math.floor(k / (RS + 1));
      const j = k % (RS + 1);
      const u = i / TS;
      const v = (j / RS) * TAU;
      n.fromBufferAttribute(nor, k);
      center.fromBufferAttribute(pos, k).addScaledVector(n, -R0);

      const base = 0.265 + 0.03 * Math.sin(Math.PI * Math.min(1, u / 0.85));
      const radius = THREE.MathUtils.lerp(base, 0.155, smoothstep(0.84, 0.93, u));
      const q = (u * len) / 0.21 + side * 0.18 * Math.sin(v);
      const puff =
        0.04 * baffle(q, 0.6) * smoothstep(0.03, 0.09, u) * (1 - smoothstep(0.8, 0.87, u));
      const cuff = smoothstep(0.9, 0.93, u);
      const gathers =
        cuff * 0.009 * (0.5 + 0.5 * Math.sin(v * 30)) +
        smoothstep(0.78, 0.88, u) * (1 - cuff) * 0.012 * Math.sin(v * 16);

      center.addScaledVector(n, radius + puff + gathers);
      pos.setXYZ(k, center.x, center.y, center.z);
    }
    geo.computeVertexNormals();

    const arm = new THREE.Mesh(geo, matShell);
    arm.castShadow = true;
    arm.receiveShadow = true;

    const end = path.getPointAt(1);
    const dir = path.getTangentAt(1).normalize();
    const facing = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);

    const cuffBinding = new THREE.Mesh(track(new THREE.TorusGeometry(0.16, 0.02, 12, 56)), matBinding);
    cuffBinding.quaternion.copy(facing);
    cuffBinding.position.copy(end);

    const opening = new THREE.Mesh(track(new THREE.CircleGeometry(0.152, 40)), matInterior);
    opening.quaternion.copy(facing);
    opening.position.copy(end).addScaledVector(dir, -0.006);

    sg.add(arm, cuffBinding, opening);
    return sg;
  };

  /* ── Matte studio display stand (base + steel pole, ghost mannequin) ──── */
  const standGroup = new THREE.Group();
  const standBase = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.52, 0.58, 0.07, 40)),
    matObsidian,
  );
  standBase.position.y = -1.46;
  standBase.receiveShadow = true;

  const pole = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.03, 0.035, 1.5, 16)),
    matChrome,
  );
  pole.position.y = -0.72;
  standGroup.add(standBase, pole);

  /* ── Floor fabric-swatch rack beside the stand ─────────────────────────── */
  const swatches = new THREE.Group();
  const rackBase = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.95, 0.05, 0.36)),
    matObsidian,
  );
  rackBase.position.y = -1.46;
  swatches.add(rackBase);

  const swatchColors = [GRAPHITE_SWATCH, 0x1e3a8a, 0xdc2626];
  swatchColors.forEach((hex, idx) => {
    const card = new THREE.Group();
    const plate = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.24, 0.34, 0.025)),
      mats.makePhys({ color: hex, roughness: 0.5, sheen: 0.6 }),
    );
    plate.castShadow = true;
    const footer = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.24, 0.07, 0.028)),
      matChrome,
    );
    footer.position.y = -0.14;
    card.add(plate, footer);
    card.position.set((idx - 1) * 0.28, -1.26, 0);
    card.rotation.x = -0.22;
    swatches.add(card);
  });
  swatches.position.set(1.5, 0, 0.5);
  swatches.rotation.y = -0.45;

  tshirtGroup.add(
    shell,
    lining,
    hemBinding,
    collarRim,
    ...edgeBindings,
    zipperGroup,
    placket,
    zigzagStitch,
    pocketGroup,
    makeSleeve(-1),
    makeSleeve(1),
    standGroup,
    swatches,
  );
  tshirtGroup.position.set(0, 0.12, 0);
  return { tshirtGroup, swatches };
}
