import * as THREE from "three";
import type { SharedStageMaterials } from "./materials";
import { COLORWAYS } from "../designStudioData";

export type SourcingBuild = {
  sourcingGroup: THREE.Group;
  /** Attachment points for screen-space callouts (see SOURCING_CALLOUTS in Journey). */
  anchors: Record<string, THREE.Object3D>;
  /** Advance the sourcing animations; call once per frame. */
  update: (elapsed: number) => void;
};

const GLOBE_RADIUS = 0.82;
const OCEAN_COLOR = 0x0b1a33;
const LAND_COLOR = 0x93c5fd;
const GRID_COLOR = 0x3b82f6;
const ARC_COLOR = 0xef4444;
const HUB_COLOR = 0x22c55e;

/** Rough continent masks (lat/lon ellipses) for the dot-matrix globe. */
const LAND_BLOBS: Array<[number, number, number, number]> = [
  // [centre lat, centre lon, half-height, half-width] in degrees
  [48, -100, 22, 42],
  [62, -120, 12, 38],
  [-15, -60, 30, 20],
  [52, 15, 14, 24],
  [8, 20, 28, 24],
  [-20, 25, 15, 16],
  [50, 90, 22, 55],
  [28, 80, 14, 22],
  [32, 110, 16, 18],
  [12, 103, 10, 8],
  [-25, 134, 11, 17],
  [64, 160, 8, 20],
];

const isLand = (lat: number, lon: number) =>
  LAND_BLOBS.some(([cLat, cLon, hLat, hLon]) => {
    const dLat = (lat - cLat) / hLat;
    const dLon = (lon - cLon) / hLon;
    return dLat * dLat + dLon * dLon < 1;
  });

/** Lat/lon (degrees) → point on a sphere; lon 0 faces +z, lon 90 faces +x. */
function latLon(lat: number, lon: number, r: number): THREE.Vector3 {
  const la = THREE.MathUtils.degToRad(lat);
  const lo = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo));
}

/** Illustrative sourcing network (regions only, no specific suppliers). */
const SUPPLIERS: Array<{ key: string; lat: number; lon: number }> = [
  { key: "srcMill", lat: 31, lon: 121 },
  { key: "srcTrims", lat: 22.5, lon: 113 },
  { key: "srcEurope", lat: 45, lon: 9 },
  { key: "srcTurkey", lat: 40, lon: 29 },
];
const HUB = { key: "srcHub", lat: 23.8, lon: 90.4 };

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
 * Stage 02: Builds the sourcing hub — a dot-matrix globe with supplier pins and animated
 * sourcing routes into the production hub, a rack of bulk fabric rolls (one in the live
 * colorway), and an approved trim card with the jacket's zippers, cords, toggles and tabs.
 */
export function buildSourcing(
  mats: SharedStageMaterials,
  groundClip: THREE.Plane,
): SourcingBuild {
  const { track, makeStd, makePhys, matTee, matObsidian, matChrome, matBrand } = mats;
  const clip = [groundClip];

  const sourcingGroup = new THREE.Group();
  const anchors: Record<string, THREE.Object3D> = {};
  const addAnchor = (key: string, parent: THREE.Object3D, pos: THREE.Vector3) => {
    const a = new THREE.Object3D();
    a.position.copy(pos);
    parent.add(a);
    anchors[key] = a;
  };

  /* ── Round dais ───────────────────────────────────────────────────────── */
  const dais = new THREE.Mesh(track(new THREE.CylinderGeometry(2.35, 2.45, 0.12, 72)), matObsidian);
  dais.position.set(0.1, -1.29, 0);
  dais.receiveShadow = true;
  sourcingGroup.add(dais);

  /* ── Dot-matrix globe on a pedestal ───────────────────────────────────── */
  const globeRig = new THREE.Group();
  const globe = new THREE.Group();
  const ocean = new THREE.Mesh(
    track(new THREE.SphereGeometry(GLOBE_RADIUS, 64, 48)),
    makePhys({ color: OCEAN_COLOR, roughness: 0.35, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.3 }),
  );
  ocean.castShadow = true;
  globe.add(ocean);

  // Lat/long graticule.
  const gridPts: number[] = [];
  const gr = GLOBE_RADIUS * 1.003;
  for (let lat = -60; lat <= 60; lat += 30) {
    for (let lon = 0; lon < 360; lon += 4) {
      const a = latLon(lat, lon, gr);
      const b = latLon(lat, lon + 4, gr);
      gridPts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  for (let lon = 0; lon < 360; lon += 30) {
    for (let lat = -88; lat < 88; lat += 4) {
      const a = latLon(lat, lon, gr);
      const b = latLon(lat + 4, lon, gr);
      gridPts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  const gridGeo = track(new THREE.BufferGeometry());
  gridGeo.setAttribute("position", new THREE.Float32BufferAttribute(gridPts, 3));
  globe.add(
    new THREE.LineSegments(
      gridGeo,
      track(new THREE.LineBasicMaterial({ color: GRID_COLOR, transparent: true, opacity: 0.28, clippingPlanes: clip })),
    ),
  );

  // Land as instanced dots.
  const dots: THREE.Vector3[] = [];
  for (let lat = -56; lat <= 76; lat += 3.2) {
    const step = 3.2 / Math.max(0.25, Math.cos(THREE.MathUtils.degToRad(lat)));
    for (let lon = -180; lon < 180; lon += step) {
      if (isLand(lat, lon)) dots.push(latLon(lat, lon, GLOBE_RADIUS * 1.006));
    }
  }
  const dotMesh = new THREE.InstancedMesh(
    track(new THREE.CircleGeometry(0.0085, 8)),
    track(new THREE.MeshBasicMaterial({ color: LAND_COLOR, side: THREE.DoubleSide, clippingPlanes: clip })),
    dots.length,
  );
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const zAxis = new THREE.Vector3(0, 0, 1);
  const one = new THREE.Vector3(1, 1, 1);
  dots.forEach((p, i) => {
    q.setFromUnitVectors(zAxis, p.clone().normalize());
    m4.compose(p, q, one);
    dotMesh.setMatrixAt(i, m4);
  });
  dotMesh.instanceMatrix.needsUpdate = true;
  globe.add(dotMesh);

  // Supplier pins + sourcing routes into the production hub.
  const matArc = track(
    new THREE.MeshBasicMaterial({ color: ARC_COLOR, transparent: true, opacity: 0.85, clippingPlanes: clip }),
  );
  const matPin = makeStd({ color: ARC_COLOR, emissive: ARC_COLOR, emissiveIntensity: 0.6 });
  const matHub = makeStd({ color: HUB_COLOR, emissive: HUB_COLOR, emissiveIntensity: 0.9 });
  const matPulse = track(new THREE.MeshBasicMaterial({ color: 0xffffff, clippingPlanes: clip }));
  const pinGeo = track(new THREE.CylinderGeometry(0.006, 0.006, 0.09, 8));
  const headGeo = track(new THREE.SphereGeometry(0.024, 14, 10));
  const pulseGeo = track(new THREE.SphereGeometry(0.016, 10, 8));

  const addPin = (lat: number, lon: number, mat: THREE.Material, key: string, scale = 1) => {
    const base = latLon(lat, lon, GLOBE_RADIUS);
    const n = base.clone().normalize();
    const pin = new THREE.Group();
    const stem = new THREE.Mesh(pinGeo, mat);
    stem.position.y = 0.045;
    const head = new THREE.Mesh(headGeo, mat);
    head.position.y = 0.095;
    pin.add(stem, head);
    pin.scale.setScalar(scale);
    pin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
    pin.position.copy(base);
    globe.add(pin);
    addAnchor(key, pin, new THREE.Vector3(0, 0.1, 0));
    return head;
  };
  const hubHead = addPin(HUB.lat, HUB.lon, matHub, HUB.key, 1.35);
  const hubPos = latLon(HUB.lat, HUB.lon, GLOBE_RADIUS);

  const routes: Array<{ curve: THREE.QuadraticBezierCurve3; pulse: THREE.Mesh; offset: number }> = [];
  SUPPLIERS.forEach((s, i) => {
    addPin(s.lat, s.lon, matPin, s.key);
    const from = latLon(s.lat, s.lon, GLOBE_RADIUS);
    const mid = from.clone().add(hubPos).multiplyScalar(0.5);
    const lift = GLOBE_RADIUS + 0.12 + from.distanceTo(hubPos) * 0.35;
    const ctrl = mid.normalize().multiplyScalar(lift);
    const curve = new THREE.QuadraticBezierCurve3(from, ctrl, hubPos.clone());
    globe.add(new THREE.Mesh(track(new THREE.TubeGeometry(curve, 48, 0.0045, 6, false)), matArc));
    const pulse = new THREE.Mesh(pulseGeo, matPulse);
    globe.add(pulse);
    routes.push({ curve, pulse, offset: i / SUPPLIERS.length });
  });

  globeRig.add(globe);
  // Pedestal: chrome meridian half-ring + column + base.
  const meridian = new THREE.Mesh(
    track(new THREE.TorusGeometry(GLOBE_RADIUS + 0.06, 0.012, 10, 96, Math.PI)),
    matChrome,
  );
  meridian.rotation.z = Math.PI / 2;
  meridian.rotation.y = Math.PI / 2;
  const column = new THREE.Mesh(track(new THREE.CylinderGeometry(0.03, 0.045, 0.5, 16)), matChrome);
  column.position.y = -GLOBE_RADIUS - 0.3;
  const base = new THREE.Mesh(track(new THREE.CylinderGeometry(0.28, 0.34, 0.07, 40)), matObsidian);
  base.position.y = -GLOBE_RADIUS - 0.56;
  base.castShadow = true;
  globeRig.add(meridian, column, base);
  globeRig.position.set(0.25, 0.37, -0.35);
  sourcingGroup.add(globeRig);
  globe.rotation.x = 0.3;

  /* ── Bulk fabric roll rack ────────────────────────────────────────────── */
  const rack = new THREE.Group();
  const endTex = track(
    canvasTexture(256, 256, (ctx) => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = "rgba(0,0,0,0.28)";
      for (let r = 26; r < 128; r += 5) {
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(128, 128, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "#2b2b2b";
      ctx.beginPath();
      ctx.arc(128, 128, 22, 0, Math.PI * 2);
      ctx.fill();
    }),
  );
  const rollColors: Array<THREE.MeshPhysicalMaterial> = [
    matTee,
    ...COLORWAYS.slice(1).map((c) => makePhys({ color: new THREE.Color(c.hex).getHex(), roughness: 0.82, sheen: 0.2 })),
    makePhys({ color: 0x2b3346, roughness: 0.85 }),
  ];
  const rollGeo = track(new THREE.CylinderGeometry(0.12, 0.12, 0.86, 36));
  const rollSlots: Array<[number, number]> = [
    [-0.27, 0],
    [0, 0],
    [0.27, 0],
    [-0.135, 0.225],
    [0.135, 0.225],
  ];
  rollSlots.forEach(([rx, ry], i) => {
    const sideMat = rollColors[i % rollColors.length] ?? matTee;
    const tint = sideMat.color.getHex();
    const endMat = makeStd({ map: endTex, color: tint, roughness: 0.9 });
    const roll = new THREE.Mesh(rollGeo, [sideMat, endMat, endMat]);
    roll.rotation.z = Math.PI / 2;
    roll.rotation.y = Math.PI / 2;
    roll.position.set(rx, ry, 0);
    roll.castShadow = true;
    rack.add(roll);
  });
  const matRack = makeStd({ color: 0x1f2937, roughness: 0.45, metalness: 0.5 });
  [-0.46, 0.46].forEach((z) => {
    const cradle = new THREE.Mesh(track(new THREE.BoxGeometry(0.86, 0.06, 0.06)), matRack);
    cradle.position.set(0, -0.15, z);
    rack.add(cradle);
    [-0.4, 0.4].forEach((x) => {
      const leg = new THREE.Mesh(track(new THREE.BoxGeometry(0.05, 0.3, 0.05)), matRack);
      leg.position.set(x, -0.3, z);
      rack.add(leg);
    });
  });
  rack.position.set(-1.45, -0.98, 0.65);
  rack.rotation.y = 0.5;
  sourcingGroup.add(rack);
  addAnchor("srcFabric", rack, new THREE.Vector3(0.2, 0.36, 0));

  /* ── Approved trim card on an easel ───────────────────────────────────── */
  const card = new THREE.Group();
  const cardTex = track(
    canvasTexture(512, 360, (ctx) => {
      ctx.fillStyle = "#fbfaf7";
      ctx.fillRect(0, 0, 512, 360);
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText("TRIM CARD", 28, 48);
      ctx.font = "18px sans-serif";
      ctx.fillStyle = "#475569";
      ctx.fillText("Style DJ-HJ-01 · Approved accessories", 28, 78);
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(28, 92, 456, 2);
      ctx.fillStyle = "#475569";
      ctx.font = "15px sans-serif";
      [
        ["#5 coil zip", 40],
        ["Drawcord", 160],
        ["Toggle", 260],
        ["Cuff tab", 350],
        ["Label", 430],
      ].forEach(([t, x]) => ctx.fillText(String(t), Number(x), 330));
    }),
  );
  const board = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.8, 0.56, 0.02)),
    [
      matRack,
      matRack,
      matRack,
      matRack,
      track(new THREE.MeshStandardMaterial({ map: cardTex, roughness: 0.85, clippingPlanes: clip })),
      matRack,
    ],
  );
  card.add(board);
  const matBlack = makePhys({ color: 0x0d0f12, roughness: 0.6 });
  const trimZ = 0.018;
  const zip = new THREE.Mesh(track(new THREE.BoxGeometry(0.04, 0.3, 0.01)), matBlack);
  zip.position.set(-0.3, -0.02, trimZ);
  const zipPull = new THREE.Mesh(track(new THREE.BoxGeometry(0.03, 0.06, 0.012)), matChrome);
  zipPull.position.set(-0.3, 0.1, trimZ + 0.008);
  const cordCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.17, 0.1, trimZ),
    new THREE.Vector3(-0.1, 0.02, trimZ),
    new THREE.Vector3(-0.15, -0.06, trimZ),
    new THREE.Vector3(-0.08, -0.14, trimZ),
  ]);
  const cord = new THREE.Mesh(track(new THREE.TubeGeometry(cordCurve, 32, 0.007, 8, false)), matBlack);
  const toggle = new THREE.Mesh(track(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 14)), matBlack);
  toggle.position.set(0.05, -0.02, trimZ + 0.01);
  const tab = new THREE.Mesh(track(new THREE.BoxGeometry(0.06, 0.14, 0.012)), matBlack);
  tab.position.set(0.18, -0.02, trimZ);
  const label = new THREE.Mesh(track(new THREE.BoxGeometry(0.11, 0.05, 0.006)), matBrand);
  label.position.set(0.31, -0.02, trimZ);
  card.add(zip, zipPull, cord, toggle, tab, label);
  const easel = new THREE.Mesh(track(new THREE.BoxGeometry(0.05, 0.75, 0.05)), matRack);
  easel.position.set(0, -0.36, -0.2);
  easel.rotation.x = 0.4;
  card.add(easel);
  card.position.set(1.62, -0.66, 0.72);
  card.rotation.set(-0.2, -0.5, 0);
  card.traverse((o) => {
    o.castShadow = true;
  });
  sourcingGroup.add(card);
  addAnchor("srcTrimCard", card, new THREE.Vector3(0.4, 0.2, 0.02));

  sourcingGroup.position.set(0, -5.4, 0);

  /* ── Animation ────────────────────────────────────────────────────────── */
  const BASE_YAW = THREE.MathUtils.degToRad(-100);
  const update = (t: number) => {
    globe.rotation.y = BASE_YAW + Math.sin(t * 0.22) * 0.22;
    routes.forEach(({ curve, pulse, offset }) => {
      const u = (t * 0.28 + offset) % 1;
      curve.getPointAt(u, pulse.position);
      pulse.scale.setScalar(0.6 + Math.sin(Math.PI * u) * 0.6);
    });
    hubHead.scale.setScalar(1 + Math.sin(t * 3) * 0.15);
    matHub.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.4;
  };

  return { sourcingGroup, anchors, update };
}
