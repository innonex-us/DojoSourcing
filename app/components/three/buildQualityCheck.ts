import * as THREE from "three";
import type { SharedStageMaterials } from "./materials";

export type QualityCheckBuild = {
  qaGroup: THREE.Group;
  /** Attachment points for screen-space callouts (see QA_CALLOUTS in Journey). */
  anchors: Record<string, THREE.Object3D>;
  /** Advance the inspection animations; call once per frame. */
  update: (elapsed: number) => void;
};

const STITCH_COLOR = 0x0f141c;
const SCAN_COLOR = 0x22c55e;
const PASS_COLOR = "#16a34a";

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/** Flat-lay silhouette of the quilted jacket (sleeves spread), centred on the origin. */
function createFlatLayShape(): THREE.Shape {
  const right: Array<[number, number]> = [
    [0.2, 0.6],
    [0.5, 0.52],
    [0.78, 0.2],
    [1.04, -0.22],
    [0.9, -0.36],
    [0.66, -0.06],
    [0.5, 0.1],
    [0.5, -0.5],
    [0.44, -0.58],
  ];
  const s = new THREE.Shape();
  s.moveTo(0, 0.6);
  right.forEach(([x, y]) => s.lineTo(x, y));
  [...right].reverse().forEach(([x, y]) => s.lineTo(-x, y));
  s.closePath();
  return s;
}

function canvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Stage 03: Builds a garment quality-assurance station — tilted inspection light board with a
 * flat-laid quilted jacket (scan line, magnifier, spec tape, QC-passed stamp), an AQL 2.5
 * inspection report, and a needle-detector conveyor with folded garments passing through.
 */
export function buildQualityCheck(
  mats: SharedStageMaterials,
  groundClip: THREE.Plane,
): QualityCheckBuild {
  const {
    track,
    makeStd,
    makePhys,
    matTee,
    matTeeCollar,
    matObsidian,
    matChrome,
    matGlass,
    matBrand,
  } = mats;
  const clip = [groundClip];

  const qaGroup = new THREE.Group();
  const anchors: Record<string, THREE.Object3D> = {};
  const addAnchor = (key: string, parent: THREE.Object3D, x: number, y: number, z: number) => {
    const a = new THREE.Object3D();
    a.position.set(x, y, z);
    parent.add(a);
    anchors[key] = a;
  };

  /* ── Floor plinth ─────────────────────────────────────────────────────── */
  const plinth = new THREE.Mesh(track(new THREE.BoxGeometry(4.9, 0.12, 2.9)), matObsidian);
  plinth.position.set(0.35, -1.29, 0);
  plinth.receiveShadow = true;
  qaGroup.add(plinth);

  /* ── Tilted inspection light board ────────────────────────────────────── */
  const board = new THREE.Group();
  const matFrame = makeStd({ color: 0x1f2937, roughness: 0.45, metalness: 0.4 });
  const matLightPanel = makeStd({
    color: 0xf8fafc,
    emissive: 0xeef2ff,
    emissiveIntensity: 0.55,
    roughness: 0.7,
  });
  const frame = new THREE.Mesh(track(new THREE.BoxGeometry(2.62, 1.74, 0.08)), matFrame);
  frame.castShadow = true;
  const panel = new THREE.Mesh(track(new THREE.BoxGeometry(2.46, 1.58, 0.012)), matLightPanel);
  panel.position.z = 0.042;
  board.add(frame, panel);

  // Flat-laid jacket (shell follows the live colorway via matTee).
  const garment = new THREE.Group();
  const flatGeo = track(
    new THREE.ExtrudeGeometry(createFlatLayShape(), {
      depth: 0.03,
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.018,
      bevelSegments: 3,
    }),
  );
  const flat = new THREE.Mesh(flatGeo, matTee);
  flat.castShadow = true;
  const collar = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 32, 1, false, -Math.PI / 2, Math.PI)),
    matTeeCollar,
  );
  collar.rotation.x = Math.PI / 2;
  collar.scale.set(1, 1, 0.75);
  collar.position.set(0, 0.6, 0.03);
  garment.add(flat, collar);

  // Stitch lines: chest yoke, V panel, body + sleeve channels, elastic bands, zipper, welts.
  const topZ = 0.05;
  const matStitch = makeStd({ color: STITCH_COLOR, roughness: 0.9 });
  const seg = (x1: number, y1: number, x2: number, y2: number, w = 0.008, mat: THREE.Material = matStitch) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const m = new THREE.Mesh(track(new THREE.BoxGeometry(len, w, 0.004)), mat);
    m.position.set((x1 + x2) / 2, (y1 + y2) / 2, topZ);
    m.rotation.z = Math.atan2(y2 - y1, x2 - x1);
    garment.add(m);
  };
  seg(-0.48, 0.3, 0.48, 0.3);
  seg(-0.46, 0.3, 0, -0.3);
  seg(0.46, 0.3, 0, -0.3);
  [-0.12, -0.32].forEach((y) => {
    seg(-0.49, y, -Math.max(0.02, (y + 0.3) * 0.77), y);
    seg(Math.max(0.02, (y + 0.3) * 0.77), y, 0.49, y);
  });
  [0.1, -0.06].forEach((y) => {
    const inset = (y + 0.3) * 0.77;
    seg(-0.46, y, -inset - 0.05, y + 0.0);
    seg(inset + 0.05, y, 0.46, y);
  });
  seg(-0.48, 0.45, 0.48, 0.45);
  seg(-0.48, -0.47, 0.48, -0.47, 0.01);
  [1, -1].forEach((side) => {
    // Sleeve channels perpendicular to the sleeve axis.
    [0.25, 0.45, 0.65].forEach((t) => {
      const ax = side * (0.55 + t * 0.4);
      const ay = 0.35 - t * 0.56;
      seg(ax - side * 0.12, ay - 0.12, ax + side * 0.12, ay + 0.12);
    });
    seg(side * 0.86, -0.28, side * 0.96, -0.18, 0.01);
    seg(side * 0.36, -0.42, side * 0.4, -0.18, 0.012);
  });
  const matZip = makePhys({ color: 0x111316, roughness: 0.7 });
  seg(0, 0.6, 0, -0.58, 0.022, matZip);
  const pull = new THREE.Mesh(track(new THREE.BoxGeometry(0.03, 0.08, 0.012)), matChrome);
  pull.position.set(0, 0.36, topZ + 0.008);
  garment.add(pull);

  // Spec measuring tape across the chest.
  const tapeTex = track(
    canvasTexture(1024, 48, (ctx) => {
      ctx.fillStyle = "#f2c94c";
      ctx.fillRect(0, 0, 1024, 48);
      ctx.fillStyle = "#1f2937";
      for (let i = 0; i <= 100; i++) {
        const x = 8 + i * 10.08;
        const h = i % 10 === 0 ? 26 : i % 5 === 0 ? 18 : 10;
        ctx.fillRect(x, 0, 2, h);
        if (i % 10 === 0) {
          ctx.font = "bold 14px sans-serif";
          ctx.fillText(String(i / 2 + 10), x + 3, 44);
        }
      }
    }),
  );
  const tape = new THREE.Mesh(
    track(new THREE.PlaneGeometry(1.08, 0.055)),
    track(new THREE.MeshStandardMaterial({ map: tapeTex, roughness: 0.5, clippingPlanes: clip })),
  );
  tape.position.set(0, 0.2, topZ + 0.012);
  tape.rotation.z = -0.02;
  garment.add(tape);

  // Defect-check sticker (orange arrow) on a cuff.
  const matSticker = makeStd({ color: 0xf97316, roughness: 0.6 });
  const sticker = new THREE.Mesh(track(new THREE.CircleGeometry(0.035, 3)), matSticker);
  sticker.position.set(-0.86, -0.18, topZ + 0.01);
  sticker.rotation.z = -0.6;
  garment.add(sticker);

  // "QC PASSED" stamp that lands on the garment each inspection cycle.
  const stampTex = track(
    canvasTexture(256, 256, (ctx) => {
      ctx.strokeStyle = PASS_COLOR;
      ctx.fillStyle = PASS_COLOR;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(128, 128, 112, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(128, 128, 92, 0, Math.PI * 2);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.font = "bold 30px sans-serif";
      ctx.fillText("QC", 128, 98);
      ctx.font = "bold 46px sans-serif";
      ctx.fillText("PASSED", 128, 146);
      ctx.font = "bold 22px sans-serif";
      ctx.fillText("AQL 2.5", 128, 182);
    }),
  );
  const matStamp = track(
    new THREE.MeshBasicMaterial({
      map: stampTex,
      transparent: true,
      depthWrite: false,
      clippingPlanes: clip,
    }),
  );
  const stamp = new THREE.Mesh(track(new THREE.PlaneGeometry(0.42, 0.42)), matStamp);
  stamp.position.set(0.26, -0.3, topZ + 0.02);
  stamp.rotation.z = 0.22;
  garment.add(stamp);

  garment.position.z = 0.05;
  board.add(garment);

  // Sweeping inspection scan line.
  const matScan = track(
    new THREE.MeshBasicMaterial({
      color: SCAN_COLOR,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      clippingPlanes: clip,
    }),
  );
  const matScanGlow = track(matScan.clone());
  matScanGlow.opacity = 0.18;
  const scanLine = new THREE.Group();
  scanLine.add(
    new THREE.Mesh(track(new THREE.PlaneGeometry(2.3, 0.012)), matScan),
    new THREE.Mesh(track(new THREE.PlaneGeometry(2.3, 0.12)), matScanGlow),
  );
  scanLine.position.z = 0.14;
  board.add(scanLine);

  // Workmanship magnifier gliding over seams.
  const magnifier = new THREE.Group();
  const lensRing = new THREE.Mesh(track(new THREE.TorusGeometry(0.15, 0.016, 12, 40)), matChrome);
  const lens = new THREE.Mesh(track(new THREE.CircleGeometry(0.145, 40)), matGlass);
  const handle = new THREE.Mesh(track(new THREE.CylinderGeometry(0.022, 0.026, 0.3, 12)), matObsidian);
  handle.position.set(0.17, -0.2, 0);
  handle.rotation.z = 0.7;
  magnifier.add(lensRing, lens, handle);
  magnifier.position.z = 0.24;
  magnifier.traverse((o) => {
    o.castShadow = true;
  });
  board.add(magnifier);

  // A-frame legs.
  [-1.0, 1.0].forEach((lx) => {
    const leg = new THREE.Mesh(track(new THREE.BoxGeometry(0.06, 1.25, 0.06)), matFrame);
    leg.position.set(lx, -0.62, -0.42);
    leg.rotation.x = 0.55;
    leg.castShadow = true;
    board.add(leg);
  });

  board.position.set(-0.45, -0.05, 0);
  board.rotation.x = -0.5;
  qaGroup.add(board);

  addAnchor("qaBoard", board, 0.98, 0.62, 0.1);
  addAnchor("qaMeasure", garment, 0.5, 0.2, topZ + 0.02);
  addAnchor("qaMagnifier", magnifier, 0.15, 0.04, 0);
  addAnchor("qaStamp", stamp, 0.18, 0, 0);

  /* ── AQL inspection report on a clipboard ─────────────────────────────── */
  const reportTex = track(
    canvasTexture(512, 680, (ctx) => {
      ctx.fillStyle = "#fbfaf7";
      ctx.fillRect(0, 0, 512, 680);
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 34px sans-serif";
      ctx.fillText("INSPECTION REPORT", 34, 70);
      ctx.font = "22px sans-serif";
      ctx.fillStyle = "#475569";
      ctx.fillText("Style DJ-QJ-01 · Final random inspection", 34, 108);
      ctx.fillText("AQL 2.5 · General level II", 34, 138);
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(34, 158, 444, 2);
      const rows = [
        "Measurements vs. spec",
        "Workmanship & seams",
        "Needle detection",
        "Shade vs. approved lab dip",
        "Trims, labels & zipper",
        "Packing & carton marks",
      ];
      rows.forEach((row, i) => {
        const y = 210 + i * 62;
        ctx.fillStyle = "#16a34a";
        ctx.fillRect(34, y - 26, 32, 32);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(41, y - 10);
        ctx.lineTo(48, y - 2);
        ctx.lineTo(60, y - 20);
        ctx.stroke();
        ctx.fillStyle = "#0f172a";
        ctx.font = "24px sans-serif";
        ctx.fillText(row, 84, y);
      });
      ctx.fillStyle = PASS_COLOR;
      ctx.fillRect(34, 590, 444, 60);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px sans-serif";
      ctx.fillText("RESULT: PASSED", 112, 632);
    }),
  );
  const clipboard = new THREE.Group();
  const clipBoardBack = new THREE.Mesh(track(new THREE.BoxGeometry(0.62, 0.8, 0.025)), mats.matWoodStand);
  const sheet = new THREE.Mesh(
    track(new THREE.PlaneGeometry(0.54, 0.72)),
    track(new THREE.MeshStandardMaterial({ map: reportTex, roughness: 0.85, clippingPlanes: clip })),
  );
  sheet.position.set(0, -0.02, 0.014);
  const clipTop = new THREE.Mesh(track(new THREE.BoxGeometry(0.22, 0.06, 0.04)), matChrome);
  clipTop.position.set(0, 0.39, 0.02);
  clipboard.add(clipBoardBack, sheet, clipTop);
  const easel = new THREE.Mesh(track(new THREE.BoxGeometry(0.05, 0.9, 0.05)), matFrame);
  easel.position.set(0, -0.32, -0.22);
  easel.rotation.x = 0.4;
  clipboard.add(easel);
  clipboard.position.set(1.42, -0.62, 0.78);
  clipboard.rotation.set(-0.28, -0.42, 0);
  clipboard.traverse((o) => {
    o.castShadow = true;
  });
  qaGroup.add(clipboard);
  addAnchor("qaReport", clipboard, 0.3, 0.15, 0.02);

  /* ── Needle-detector conveyor ─────────────────────────────────────────── */
  const detector = new THREE.Group();
  const belt = new THREE.Mesh(track(new THREE.BoxGeometry(2.1, 0.08, 0.62)), matObsidian);
  belt.position.y = -0.62;
  belt.receiveShadow = true;
  const beltBase = new THREE.Mesh(track(new THREE.BoxGeometry(2.1, 0.5, 0.56)), matFrame);
  beltBase.position.y = -0.92;
  detector.add(belt, beltBase);
  [-1.02, 1.02].forEach((rx) => {
    const roller = new THREE.Mesh(track(new THREE.CylinderGeometry(0.05, 0.05, 0.64, 16)), matChrome);
    roller.rotation.x = Math.PI / 2;
    roller.position.set(rx, -0.62, 0);
    detector.add(roller);
  });
  const matHousing = makePhys({ color: 0xe5e7eb, roughness: 0.35, metalness: 0.2, clearcoat: 0.6 });
  const tunnel = new THREE.Group();
  [-0.36, 0.36].forEach((pz) => {
    const post = new THREE.Mesh(track(new THREE.BoxGeometry(0.62, 0.62, 0.1)), matHousing);
    post.position.set(0, -0.3, pz);
    post.castShadow = true;
    tunnel.add(post);
  });
  const roof = new THREE.Mesh(track(new THREE.BoxGeometry(0.62, 0.14, 0.82)), matHousing);
  roof.position.y = 0.04;
  roof.castShadow = true;
  const brandStrip = new THREE.Mesh(track(new THREE.BoxGeometry(0.63, 0.04, 0.83)), matBrand);
  brandStrip.position.y = -0.04;
  const screenTex = track(
    canvasTexture(256, 96, (ctx) => {
      ctx.fillStyle = "#03140a";
      ctx.fillRect(0, 0, 256, 96);
      ctx.fillStyle = "#4ade80";
      ctx.font = "bold 30px monospace";
      ctx.fillText("Fe 0.0mm", 18, 42);
      ctx.font = "bold 22px monospace";
      ctx.fillText("NEEDLE OK", 18, 78);
    }),
  );
  const screen = new THREE.Mesh(
    track(new THREE.PlaneGeometry(0.34, 0.13)),
    track(new THREE.MeshBasicMaterial({ map: screenTex, clippingPlanes: clip })),
  );
  screen.position.set(0, -0.12, 0.415);
  const matBeacon = makeStd({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.6 });
  const beacon = new THREE.Mesh(track(new THREE.SphereGeometry(0.05, 16, 12)), matBeacon);
  beacon.position.y = 0.16;
  tunnel.add(roof, brandStrip, screen, beacon);
  detector.add(tunnel);

  // Folded garments riding the belt through the detector.
  const folded: THREE.Group[] = [];
  for (let i = 0; i < 3; i++) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(track(new THREE.BoxGeometry(0.36, 0.07, 0.3)), matTee);
    body.castShadow = true;
    const band = new THREE.Mesh(track(new THREE.BoxGeometry(0.37, 0.072, 0.05)), matBrand);
    const polybag = new THREE.Mesh(track(new THREE.BoxGeometry(0.4, 0.085, 0.34)), mats.matWrapFilm);
    g.add(body, band, polybag);
    g.position.y = -0.54;
    folded.push(g);
    detector.add(g);
  }
  detector.position.set(1.75, 0, -0.75);
  detector.rotation.y = -0.18;
  qaGroup.add(detector);
  addAnchor("qaDetector", tunnel, 0.31, 0.04, 0);

  qaGroup.position.set(0, -5.4, 0);

  /* ── Animation ────────────────────────────────────────────────────────── */
  const update = (t: number) => {
    // Scan line sweeps hem → collar every 4 s.
    const sweep = (t / 4) % 1;
    scanLine.position.y = THREE.MathUtils.lerp(-0.62, 0.72, sweep);
    matScan.opacity = 0.85 * Math.sin(Math.PI * sweep);
    matScanGlow.opacity = 0.18 * Math.sin(Math.PI * sweep);

    // Magnifier traces seams in a slow figure-eight.
    magnifier.position.x = Math.sin(t * 0.45) * 0.62;
    magnifier.position.y = Math.sin(t * 0.9) * 0.28 + 0.02;

    // Stamp lands at the end of each 6 s inspection cycle.
    const cycle = (t / 6) % 1;
    const land = smoothstep(0.62, 0.68, cycle);
    const fade = 1 - smoothstep(0.94, 1, cycle);
    const pop = 1 + (1 - land) * 0.6;
    stamp.scale.setScalar(Math.max(0.001, pop * land));
    matStamp.opacity = land * fade * 0.92;

    // Garments ride the belt; beacon flashes as each passes the detector head.
    let flash = 0;
    folded.forEach((g, i) => {
      const u = (t * 0.16 + i / folded.length) % 1;
      g.position.x = THREE.MathUtils.lerp(-0.95, 0.95, u);
      g.visible = u > 0.02 && u < 0.98;
      flash = Math.max(flash, 1 - Math.min(1, Math.abs(g.position.x) / 0.18));
    });
    matBeacon.emissiveIntensity = 0.6 + flash * 2.2;
  };

  return { qaGroup, anchors, update };
}
