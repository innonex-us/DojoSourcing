import * as THREE from "three";

export type DisposableTracker = <T extends { dispose: () => void }>(item: T) => T;

export type SharedStageMaterials = {
  track: DisposableTracker;
  makeStd: (params: THREE.MeshStandardMaterialParameters) => THREE.MeshStandardMaterial;
  matTee: THREE.MeshStandardMaterial;
  matTeeCollar: THREE.MeshStandardMaterial;
  matTeeInner: THREE.MeshStandardMaterial;
  matBrand: THREE.MeshStandardMaterial;
  matObsidian: THREE.MeshStandardMaterial;
  matChrome: THREE.MeshStandardMaterial;
  matGlass: THREE.MeshPhysicalMaterial;
  matGlowWindow: THREE.MeshStandardMaterial;
  matFactoryWall: THREE.MeshStandardMaterial;
  matCardboard: THREE.MeshStandardMaterial;
  matWood: THREE.MeshStandardMaterial;
  matTrailer: THREE.MeshStandardMaterial;
  matRedHull: THREE.MeshStandardMaterial;
  containerMats: THREE.MeshStandardMaterial[];
  waterBump: THREE.CanvasTexture;
  disposeAll: () => void;
};

function createCottonTextures() {
  const size = 256;
  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext("2d")!;
  bCtx.fillStyle = "#808080";
  bCtx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      const v = 112 + ((x + y) % 4 === 0 ? 28 : -16) + Math.sin(x * 0.4) * 8;
      bCtx.fillStyle = `rgb(${v},${v},${v})`;
      bCtx.fillRect(x, y, 2, 2);
    }
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(6, 6);
  return { bumpMap };
}

function createCardboardTexture() {
  const w = 512;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#b89068";
  ctx.fillRect(0, 0, w, h);

  for (let y = 0; y < h; y += 4) {
    ctx.fillStyle = y % 8 === 0 ? "rgba(80,55,30,0.08)" : "rgba(255,235,210,0.05)";
    ctx.fillRect(0, y, w, 2);
  }
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = i % 2 === 0 ? "rgba(60,40,20,0.12)" : "rgba(240,215,180,0.1)";
    ctx.fillRect(Math.random() * w, Math.random() * h, 3, 1);
  }

  ctx.fillStyle = "#f2efe9";
  ctx.fillRect(46, 56, 210, 145);
  ctx.strokeStyle = "#181513";
  ctx.lineWidth = 3;
  ctx.strokeRect(46, 56, 210, 145);

  ctx.fillStyle = "#fe4101";
  ctx.fillRect(56, 66, 190, 26);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px monospace";
  ctx.fillText("DOJO APPAREL · AQL", 64, 84);

  ctx.fillStyle = "#181513";
  ctx.font = "bold 12px monospace";
  ctx.fillText("LOT #DJ-402 · 100 PCS", 58, 114);
  ctx.fillText("STATUS: QC PASSED", 58, 134);

  let bx = 58;
  while (bx < 235) {
    const bw = 2 + ((bx * 7) % 5);
    ctx.fillRect(bx, 148, bw, 40);
    bx += bw + 3 + ((bx * 3) % 4);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}

function createCorrugatedTexture(baseColor: string, accentText?: string) {
  const w = 512;
  const h = 256;
  const albedo = document.createElement("canvas");
  albedo.width = w;
  albedo.height = h;
  const ctx = albedo.getContext("2d")!;

  const bump = document.createElement("canvas");
  bump.width = w;
  bump.height = h;
  const bCtx = bump.getContext("2d")!;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, w, h);

  bCtx.fillStyle = "#808080";
  bCtx.fillRect(0, 0, w, h);

  for (let x = 0; x < w; x += 16) {
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(x, 0, 5, h);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(x + 6, 0, 3, h);

    bCtx.fillStyle = "#353535";
    bCtx.fillRect(x, 0, 6, h);
    bCtx.fillStyle = "#d5d5d5";
    bCtx.fillRect(x + 7, 0, 6, h);
  }

  if (accentText) {
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText(accentText, 36, 138);
  }

  const map = new THREE.CanvasTexture(albedo);
  map.colorSpace = THREE.SRGBColorSpace;
  const bumpMap = new THREE.CanvasTexture(bump);
  return { map, bumpMap };
}

function createWaterBumpTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 450; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 8 + Math.random() * 24;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, "rgba(210,210,210,0.22)");
    grad.addColorStop(1, "rgba(128,128,128,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  return tex;
}

/**
 * Creates shared procedural PBR textures, clipped studio materials, and a disposal tracker.
 */
export function createSharedMaterials(groundClip: THREE.Plane): SharedStageMaterials {
  const disposables: Array<{ dispose: () => void }> = [];
  const track: DisposableTracker = (item) => {
    disposables.push(item);
    return item;
  };

  const makeStd = (params: THREE.MeshStandardMaterialParameters) =>
    track(
      new THREE.MeshStandardMaterial({
        ...params,
        clippingPlanes: [groundClip],
        clipShadows: true,
      }),
    );

  const cotton = createCottonTextures();
  track(cotton.bumpMap);
  const cardboardMap = track(createCardboardTexture());

  const containerBrand = createCorrugatedTexture("#fe4101", "DOJO CARGO");
  track(containerBrand.map);
  track(containerBrand.bumpMap);
  const containerDark = createCorrugatedTexture("#24292e");
  track(containerDark.map);
  track(containerDark.bumpMap);
  const containerSteel = createCorrugatedTexture("#343a40");
  track(containerSteel.map);
  track(containerSteel.bumpMap);
  const containerCream = createCorrugatedTexture("#d8d3ca");
  track(containerCream.map);
  track(containerCream.bumpMap);

  const waterBump = track(createWaterBumpTexture());

  const matTrailer = makeStd({
    map: containerBrand.map,
    bumpMap: containerBrand.bumpMap,
    bumpScale: 0.035,
    roughness: 0.42,
    metalness: 0.25,
  });

  const containerMats = [
    matTrailer,
    makeStd({ map: containerDark.map, bumpMap: containerDark.bumpMap, bumpScale: 0.03, roughness: 0.5 }),
    makeStd({ map: containerCream.map, bumpMap: containerCream.bumpMap, bumpScale: 0.03, roughness: 0.5 }),
    makeStd({ map: containerSteel.map, bumpMap: containerSteel.bumpMap, bumpScale: 0.03, roughness: 0.5 }),
  ];

  return {
    track,
    makeStd,
    matTee: makeStd({
      color: 0xe6e2dc,
      roughness: 0.88,
      metalness: 0.02,
      bumpMap: cotton.bumpMap,
      bumpScale: 0.015,
    }),
    matTeeCollar: makeStd({
      color: 0xd4cfc7,
      roughness: 0.92,
      bumpMap: cotton.bumpMap,
      bumpScale: 0.02,
    }),
    matTeeInner: makeStd({
      color: 0x1a1614,
      roughness: 0.95,
      side: THREE.DoubleSide,
    }),
    matBrand: makeStd({
      color: 0xfe4101,
      roughness: 0.32,
      metalness: 0.18,
    }),
    matObsidian: makeStd({
      color: 0x1b1817,
      roughness: 0.45,
      metalness: 0.45,
    }),
    matChrome: makeStd({
      color: 0xdedad4,
      roughness: 0.18,
      metalness: 0.92,
    }),
    matGlass: track(
      new THREE.MeshPhysicalMaterial({
        color: 0x8fb4cc,
        roughness: 0.08,
        metalness: 0.15,
        clearcoat: 1,
        transparent: true,
        opacity: 0.78,
        clippingPlanes: [groundClip],
      }),
    ),
    matGlowWindow: makeStd({
      color: 0xffc699,
      emissive: 0xff6a2b,
      emissiveIntensity: 1.35,
      roughness: 0.25,
    }),
    matFactoryWall: makeStd({
      map: containerSteel.map,
      bumpMap: containerSteel.bumpMap,
      bumpScale: 0.03,
      roughness: 0.55,
      metalness: 0.4,
    }),
    matCardboard: makeStd({
      map: cardboardMap,
      roughness: 0.85,
      metalness: 0.02,
    }),
    matWood: makeStd({
      color: 0x8d6741,
      roughness: 0.9,
      metalness: 0.02,
    }),
    matTrailer,
    matRedHull: makeStd({
      color: 0x7a1f16,
      roughness: 0.5,
      metalness: 0.2,
    }),
    containerMats,
    waterBump,
    disposeAll: () => {
      disposables.forEach((d) => d.dispose());
    },
  };
}
