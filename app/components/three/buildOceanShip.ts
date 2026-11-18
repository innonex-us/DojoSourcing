import * as THREE from "three";
import type { SharedStageMaterials } from "./materials";

export type OceanShipBuild = {
  shipStageGroup: THREE.Group;
  shipHullGroup: THREE.Group;
  radarBar: THREE.Mesh;
  waveGeo: THREE.PlaneGeometry;
};

/**
 * Stage 07: Builds an ocean container vessel with 24 corrugated containers and wide fog-blended waves.
 */
export function buildOceanShip(
  mats: SharedStageMaterials,
  groundClip: THREE.Plane,
): OceanShipBuild {
  const {
    track,
    matObsidian,
    matRedHull,
    matChrome,
    matGlass,
    matBrand,
    matGlowWindow,
    containerMats,
    waterNormal,
  } = mats;

  const shipStageGroup = new THREE.Group();
  const shipHullGroup = new THREE.Group();

  const hullShape = new THREE.Shape();
  hullShape.moveTo(-2.55, -0.35);
  hullShape.lineTo(2.25, -0.35);
  hullShape.lineTo(3.15, 0.36);
  hullShape.lineTo(-2.68, 0.36);
  hullShape.closePath();

  const upperHullGeo = track(
    new THREE.ExtrudeGeometry(hullShape, {
      depth: 1.52,
      bevelEnabled: true,
      bevelThickness: 0.14,
      bevelSize: 0.08,
      bevelSegments: 4,
    }),
  );
  upperHullGeo.center();
  const upperHull = new THREE.Mesh(upperHullGeo, matObsidian);
  upperHull.position.set(0, -0.42, 0);
  upperHull.castShadow = true;
  upperHull.receiveShadow = true;

  const bulb = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.32, 20, 16)),
    matRedHull,
  );
  bulb.scale.set(1.9, 0.75, 0.75);
  bulb.position.set(2.55, -0.8, 0);

  const lowerHull = new THREE.Mesh(
    track(new THREE.BoxGeometry(4.95, 0.28, 1.54)),
    matRedHull,
  );
  lowerHull.position.set(-0.1, -0.82, 0);

  const waterline = new THREE.Mesh(
    track(new THREE.BoxGeometry(5.1, 0.05, 1.58)),
    matChrome,
  );
  waterline.position.set(-0.08, -0.68, 0);

  const deck1 = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.92, 0.75, 1.38)),
    matChrome,
  );
  deck1.position.set(-1.82, 0.32, 0);
  deck1.castShadow = true;

  const deck2 = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.74, 0.48, 1.72)),
    matChrome,
  );
  deck2.position.set(-1.78, 0.88, 0);
  deck2.castShadow = true;

  const bridgeWindows = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.76, 0.18, 1.74)),
    matGlass,
  );
  bridgeWindows.position.set(-1.78, 0.94, 0);

  const radarMast = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.025, 0.045, 0.72, 8)),
    matChrome,
  );
  radarMast.position.set(-1.78, 1.44, 0);

  const radarBar = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.45, 0.045, 0.06)),
    matBrand,
  );
  radarBar.position.set(-1.78, 1.78, 0);

  const funnel = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.18, 0.24, 0.62, 16)),
    matBrand,
  );
  funnel.position.set(-2.15, 0.96, 0);

  const mastBeacon = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.05, 10, 10)),
    matGlowWindow,
  );
  mastBeacon.position.set(-1.78, 1.84, 0);

  // 24 Corrugated Shipping Containers in 3 Tiers
  const cols = [-0.75, 0.15, 1.05, 1.95];
  const rowsZ = [-0.38, 0.38];
  cols.forEach((cx, ci) => {
    rowsZ.forEach((cz, zi) => {
      const tiers = ci === 3 ? 2 : 3;
      for (let t = 0; t < tiers; t++) {
        const box = new THREE.Mesh(
          track(new THREE.BoxGeometry(0.84, 0.42, 0.62)),
          containerMats[(ci + zi + t) % containerMats.length],
        );
        box.position.set(cx, 0.14 + t * 0.44, cz);
        box.castShadow = true;
        box.receiveShadow = true;
        shipHullGroup.add(box);
      }
    });
  });

  shipHullGroup.add(
    upperHull,
    bulb,
    lowerHull,
    waterline,
    deck1,
    deck2,
    bridgeWindows,
    radarMast,
    radarBar,
    mastBeacon,
    funnel,
  );

  // Wide Glossy Shaded Ocean Surface Blending Smoothly Into Fog
  const waveGeo = track(new THREE.PlaneGeometry(36, 20, 64, 32));
  waveGeo.rotateX(-Math.PI / 2);
  const waveMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x0a1720,
      roughness: 0.12,
      metalness: 0.18,
      clearcoat: 0.95,
      clearcoatRoughness: 0.1,
      normalMap: waterNormal,
      normalScale: new THREE.Vector2(0.75, 0.75),
      clippingPlanes: [groundClip],
    }),
  );
  const waveMesh = new THREE.Mesh(waveGeo, waveMat);
  waveMesh.position.y = -0.92;
  waveMesh.receiveShadow = true;

  shipStageGroup.add(shipHullGroup, waveMesh);
  shipStageGroup.position.set(0, -5.4, 0);
  return { shipStageGroup, shipHullGroup, radarBar, waveGeo };
}
