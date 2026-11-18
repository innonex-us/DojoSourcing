import * as THREE from "three";

export type DisposableTracker = <T extends { dispose: () => void }>(item: T) => T;

export type SharedStageMaterials = {
  track: DisposableTracker;
  makeStd: (params: THREE.MeshStandardMaterialParameters) => THREE.MeshStandardMaterial;
  makePhys: (params: THREE.MeshPhysicalMaterialParameters) => THREE.MeshPhysicalMaterial;
  matTee: THREE.MeshPhysicalMaterial;
  matTeeCollar: THREE.MeshPhysicalMaterial;
  matTeeInner: THREE.MeshStandardMaterial;
  matWoodStand: THREE.MeshStandardMaterial;
  matBrand: THREE.MeshPhysicalMaterial;
  matObsidian: THREE.MeshStandardMaterial;
  matChrome: THREE.MeshPhysicalMaterial;
  matGlass: THREE.MeshPhysicalMaterial;
  matGlowWindow: THREE.MeshStandardMaterial;
  matHeadlight: THREE.MeshStandardMaterial;
  matFactoryWall: THREE.MeshStandardMaterial;
  matCardboard: THREE.MeshStandardMaterial;
  matTape: THREE.MeshPhysicalMaterial;
  matWrapFilm: THREE.MeshPhysicalMaterial;
  matWood: THREE.MeshStandardMaterial;
  matTrailer: THREE.MeshPhysicalMaterial;
  matAsphalt: THREE.MeshStandardMaterial;
  disposeAll: () => void;
};

/**
 * Converts a grayscale height canvas into a tangent-space normal map via Sobel gradients.
 */
function heightToNormalTexture(
  heightCanvas: HTMLCanvasElement,
  strength = 2.2,
  repeatX = 1,
  repeatY = 1,
): THREE.CanvasTexture {
  const w = heightCanvas.width;
  const h = heightCanvas.height;
  const hCtx = heightCanvas.getContext("2d")!;
  const src = hCtx.getImageData(0, 0, w, h).data;

  const outCanvas = document.createElement("canvas");
  outCanvas.width = w;
  outCanvas.height = h;
  const oCtx = outCanvas.getContext("2d")!;
  const out = oCtx.createImageData(w, h);

  const sample = (x: number, y: number) => {
    const cx = (x + w) % w;
    const cy = (y + h) % h;
    return src[(cy * w + cx) * 4] / 255;
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const tl = sample(x - 1, y - 1);
      const t = sample(x, y - 1);
      const tr = sample(x + 1, y - 1);
      const l = sample(x - 1, y);
      const r = sample(x + 1, y);
      const bl = sample(x - 1, y + 1);
      const b = sample(x, y + 1);
      const br = sample(x + 1, y + 1);

      const dx = tr + 2 * r + br - (tl + 2 * l + bl);
      const dy = bl + 2 * b + br - (tl + 2 * t + tr);

      const nx = -dx * strength;
      const ny = -dy * strength;
      const nz = 1.0;
      const len = Math.hypot(nx, ny, nz);

      const idx = (y * w + x) * 4;
      out.data[idx] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      out.data[idx + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      out.data[idx + 2] = Math.round(((nz / len) * 0.5 + 0.5) * 255);
      out.data[idx + 3] = 255;
    }
  }

  oCtx.putImageData(out, 0, 0);
  const tex = new THREE.CanvasTexture(outCanvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  return tex;
}

function createCottonNormalMap() {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  // Interlocking jersey knit V-stitch height pattern
  for (let y = 0; y < size; y += 4) {
    for (let x = 0; x < size; x += 4) {
      const wave = Math.sin(x * 0.78) * 38 + Math.cos((y + (x % 8)) * 0.78) * 28;
      const v = Math.max(0, Math.min(255, Math.round(128 + wave)));
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x, y, 4, 4);
    }
  }
  return heightToNormalTexture(c, 1.6, 10, 10);
}

function createCardboardTextures() {
  const w = 1024;
  const h = 1024;
  const albedo = document.createElement("canvas");
  albedo.width = w;
  albedo.height = h;
  const ctx = albedo.getContext("2d")!;

  const heightC = document.createElement("canvas");
  heightC.width = 512;
  heightC.height = 512;
  const hCtx = heightC.getContext("2d")!;

  ctx.fillStyle = "#b98e62";
  ctx.fillRect(0, 0, w, h);
  hCtx.fillStyle = "#808080";
  hCtx.fillRect(0, 0, 512, 512);

  for (let y = 0; y < h; y += 6) {
    ctx.fillStyle = y % 12 === 0 ? "rgba(75,48,22,0.08)" : "rgba(255,232,204,0.05)";
    ctx.fillRect(0, y, w, 3);
  }
  for (let y = 0; y < 512; y += 6) {
    const v = y % 12 === 0 ? 116 : 140;
    hCtx.fillStyle = `rgb(${v},${v},${v})`;
    hCtx.fillRect(0, y, 512, 3);
  }
  for (let i = 0; i < 3200; i++) {
    ctx.fillStyle = i % 2 === 0 ? "rgba(65,42,20,0.12)" : "rgba(245,215,180,0.09)";
    ctx.fillRect(Math.random() * w, Math.random() * h, 4, 1.5);
  }

  // Printed Crisp Shipping Manifest & Barcode Sticker
  ctx.fillStyle = "#f5f2eb";
  ctx.fillRect(92, 110, 420, 290);
  ctx.strokeStyle = "#161311";
  ctx.lineWidth = 5;
  ctx.strokeRect(92, 110, 420, 290);

  ctx.fillStyle = "#dc2626";
  ctx.fillRect(110, 128, 384, 52);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 25px monospace";
  ctx.fillText("DOJO DESIGN & SOURCING", 122, 164);

  ctx.fillStyle = "#161311";
  ctx.font = "bold 22px monospace";
  ctx.fillText("SKU: DJ-HJ-01 · JACKET", 116, 218);
  ctx.fillText("QTY: 120 PCS · AQL 2.5 PASS", 116, 250);

  let bx = 118;
  while (bx < 480) {
    const bw = 4 + ((bx * 7) % 10);
    ctx.fillRect(bx, 276, bw, 94);
    bx += bw + 6 + ((bx * 3) % 7);
  }

  // Handling Stencils on Carton Face
  ctx.strokeStyle = "rgba(35,24,14,0.65)";
  ctx.lineWidth = 5;
  ctx.strokeRect(640, 130, 260, 110);
  ctx.fillStyle = "rgba(35,24,14,0.75)";
  ctx.font = "bold 30px monospace";
  ctx.fillText("QC PASSED", 686, 196);

  const map = new THREE.CanvasTexture(albedo);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const normalMap = heightToNormalTexture(heightC, 1.5);
  return { map, normalMap };
}

function createCorrugatedTextures(baseColor: string, accentText?: string) {
  const w = 1024;
  const h = 512;
  const albedo = document.createElement("canvas");
  albedo.width = w;
  albedo.height = h;
  const ctx = albedo.getContext("2d")!;

  const heightC = document.createElement("canvas");
  heightC.width = 512;
  heightC.height = 256;
  const hCtx = heightC.getContext("2d")!;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, w, h);
  hCtx.fillStyle = "#808080";
  hCtx.fillRect(0, 0, 512, 256);

  for (let x = 0; x < w; x += 24) {
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(x, 0, 8, h);
    ctx.fillStyle = "rgba(255,255,255,0.09)";
    ctx.fillRect(x + 9, 0, 4, h);
  }
  for (let x = 0; x < 512; x += 12) {
    hCtx.fillStyle = "#303030";
    hCtx.fillRect(x, 0, 5, 256);
    hCtx.fillStyle = "#e0e0e0";
    hCtx.fillRect(x + 6, 0, 5, 256);
  }

  if (accentText) {
    ctx.fillStyle = "rgba(255,255,255,0.94)";
    // Fit the wordmark to the panel width.
    let size = 74;
    ctx.font = `800 ${size}px sans-serif`;
    while (size > 30 && ctx.measureText(accentText).width > w - 128) {
      size -= 2;
      ctx.font = `800 ${size}px sans-serif`;
    }
    ctx.fillText(accentText, 64, 275);
    ctx.font = "bold 24px monospace";
    ctx.fillText("GLOBAL LOGISTICS · CONTAINER 40HC", 68, 322);
  }

  const map = new THREE.CanvasTexture(albedo);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const normalMap = heightToNormalTexture(heightC, 2.4);
  return { map, normalMap };
}

function createAsphaltTextures() {
  const size = 512;
  const albedo = document.createElement("canvas");
  albedo.width = size;
  albedo.height = size;
  const ctx = albedo.getContext("2d")!;

  const heightC = document.createElement("canvas");
  heightC.width = size;
  heightC.height = size;
  const hCtx = heightC.getContext("2d")!;

  ctx.fillStyle = "#1d1b1a";
  ctx.fillRect(0, 0, size, size);
  hCtx.fillStyle = "#808080";
  hCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const shade = 20 + Math.floor(Math.random() * 28);
    ctx.fillStyle = `rgb(${shade},${shade - 1},${shade - 2})`;
    ctx.fillRect(x, y, 2, 2);

    const hv = 100 + Math.floor(Math.random() * 56);
    hCtx.fillStyle = `rgb(${hv},${hv},${hv})`;
    hCtx.fillRect(x, y, 2, 2);
  }

  // Center dashed road markings
  ctx.fillStyle = "#e4e2df";
  for (let x = 20; x < size; x += 128) {
    ctx.fillRect(x, size / 2 - 5, 72, 10);
  }

  const map = new THREE.CanvasTexture(albedo);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(4, 1);

  const normalMap = heightToNormalTexture(heightC, 1.4, 4, 1);
  return { map, normalMap };
}


/**
 * Creates shared procedural PBR normal/albedo maps, clipped studio materials, and disposal tracker.
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

  const makePhys = (params: THREE.MeshPhysicalMaterialParameters) =>
    track(
      new THREE.MeshPhysicalMaterial({
        ...params,
        clippingPlanes: [groundClip],
        clipShadows: true,
      }),
    );

  const cottonNormal = track(createCottonNormalMap());
  const cardboard = createCardboardTextures();
  track(cardboard.map);
  track(cardboard.normalMap);

  const containerBrand = createCorrugatedTextures("#dc2626", "DOJO DESIGN & SOURCING");
  track(containerBrand.map);
  track(containerBrand.normalMap);
  // Corrugated steel cladding for the factory walls.
  const containerSteel = createCorrugatedTextures("#1e3a8a");
  track(containerSteel.map);
  track(containerSteel.normalMap);

  const asphalt = createAsphaltTextures();
  track(asphalt.map);
  track(asphalt.normalMap);

  const matTrailer = makePhys({
    map: containerBrand.map,
    normalMap: containerBrand.normalMap,
    normalScale: new THREE.Vector2(0.8, 0.8),
    roughness: 0.34,
    metalness: 0.25,
    clearcoat: 0.45,
    clearcoatRoughness: 0.28,
  });


  return {
    track,
    makeStd,
    makePhys,
    matTee: makePhys({
      color: 0xdad5cc,
      roughness: 0.92,
      metalness: 0.0,
      sheen: 0.7,
      sheenRoughness: 0.72,
      sheenColor: new THREE.Color(0xffffff),
      normalMap: cottonNormal,
      normalScale: new THREE.Vector2(0.75, 0.75),
    }),
    matTeeCollar: makePhys({
      color: 0xc9c3b8,
      roughness: 0.94,
      sheen: 0.75,
      sheenRoughness: 0.75,
      sheenColor: new THREE.Color(0xffffff),
      normalMap: cottonNormal,
      normalScale: new THREE.Vector2(0.85, 0.85),
    }),
    matTeeInner: makeStd({
      color: 0x141110,
      roughness: 0.96,
      side: THREE.DoubleSide,
    }),
    matWoodStand: makeStd({
      color: 0x5c3e26,
      roughness: 0.65,
      metalness: 0.05,
    }),
    matBrand: makePhys({
      color: 0xdc2626,
      roughness: 0.3,
      metalness: 0.14,
      clearcoat: 0.45,
      clearcoatRoughness: 0.25,
    }),
    matObsidian: makeStd({
      color: 0x0f1c38,
      roughness: 0.52,
      metalness: 0.28,
    }),
    matChrome: makePhys({
      color: 0xd0ccc5,
      roughness: 0.22,
      metalness: 0.92,
      clearcoat: 0.3,
    }),
    matGlass: makePhys({
      color: 0x628099,
      roughness: 0.08,
      metalness: 0.18,
      clearcoat: 1,
      transparent: true,
      opacity: 0.65,
    }),
    matGlowWindow: makeStd({
      color: 0x93c5fd,
      emissive: 0x2563eb,
      emissiveIntensity: 0.55,
      roughness: 0.35,
    }),
    matHeadlight: makeStd({
      color: 0xffffff,
      emissive: 0xe0f2fe,
      emissiveIntensity: 0.9,
      roughness: 0.15,
    }),
    matFactoryWall: makeStd({
      map: containerSteel.map,
      normalMap: containerSteel.normalMap,
      normalScale: new THREE.Vector2(0.7, 0.7),
      roughness: 0.52,
      metalness: 0.42,
    }),
    matCardboard: makeStd({
      map: cardboard.map,
      normalMap: cardboard.normalMap,
      normalScale: new THREE.Vector2(0.6, 0.6),
      roughness: 0.86,
      metalness: 0.02,
    }),
    matTape: makePhys({
      color: 0xdc2626,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    }),
    matWrapFilm: makePhys({
      color: 0xffffff,
      roughness: 0.08,
      metalness: 0.0,
      clearcoat: 1,
      transparent: true,
      opacity: 0.16,
    }),
    matWood: makeStd({
      color: 0x8d6741,
      roughness: 0.88,
      metalness: 0.02,
    }),
    matTrailer,
    matAsphalt: makeStd({
      map: asphalt.map,
      normalMap: asphalt.normalMap,
      roughness: 0.9,
      metalness: 0.05,
    }),
    disposeAll: () => {
      disposables.forEach((d) => d.dispose());
    },
  };
}
