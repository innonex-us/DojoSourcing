import * as THREE from "three";
import type { SharedStageMaterials } from "./materials";

export type OceanShipBuild = {
  shipStageGroup: THREE.Group;
  shipHullGroup: THREE.Group;
  waveGeo: THREE.PlaneGeometry;
};

/**
 * Stage 05: Builds an ocean container vessel with 18 containers and a glossy undulating sea mesh.
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
    containerMats,
    waterBump,
  } = mats;

  const shipStageGroup = new THREE.Group();
  const shipHullGroup = new THREE.Group();

  const hullShape = new THREE.Shape();
  hullShape.moveTo(-2.4, -0.35);
  hullShape.lineTo(2.15, -0.35);
  hullShape.lineTo(2.95, 0.32);
  hullShape.lineTo(-2.55, 0.32);
  hullShape.closePath();

  const upperHullGeo = track(
    new THREE.ExtrudeGeometry(hullShape, {
      depth: 1.45,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.08,
      bevelSegments: 3,
    }),
  );
  upperHullGeo.center();
  const upperHull = new THREE.Mesh(upperHullGeo, matObsidian);
  upperHull.position.set(0, -0.45, 0);
  upperHull.castShadow = true;
  upperHull.receiveShadow = true;

  const lowerHull = new THREE.Mesh(
    track(new THREE.BoxGeometry(4.7, 0.28, 1.46)),
    matRedHull,
  );
  lowerHull.position.set(-0.08, -0.82, 0);

  const deck1 = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.9, 0.7, 1.32)),
    matChrome,
  );
  deck1.position.set(-1.75, 0.28, 0);
  deck1.castShadow = true;

  const deck2 = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.72, 0.45, 1.56)),
    matChrome,
  );
  deck2.position.set(-1.72, 0.82, 0);
  deck2.castShadow = true;

  const bridgeWindows = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.74, 0.18, 1.58)),
    matGlass,
  );
  bridgeWindows.position.set(-1.72, 0.88, 0);

  const radarMast = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.025, 0.04, 0.65, 8)),
    matChrome,
  );
  radarMast.position.set(-1.72, 1.35, 0);

  const funnel = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.18, 0.24, 0.55, 16)),
    matBrand,
  );
  funnel.position.set(-2.05, 0.92, 0);

  const cols = [-0.65, 0.25, 1.15, 2.0];
  const rowsZ = [-0.36, 0.36];
  cols.forEach((cx, ci) => {
    rowsZ.forEach((cz, zi) => {
      const tiers = ci === 3 ? 2 : 3;
      for (let t = 0; t < tiers; t++) {
        const box = new THREE.Mesh(
          track(new THREE.BoxGeometry(0.84, 0.42, 0.62)),
          containerMats[(ci + zi + t) % containerMats.length],
        );
        box.position.set(cx, 0.12 + t * 0.44, cz);
        box.castShadow = true;
        box.receiveShadow = true;
        shipHullGroup.add(box);
      }
    });
  });

  shipHullGroup.add(
    upperHull,
    lowerHull,
    deck1,
    deck2,
    bridgeWindows,
    radarMast,
    funnel,
  );

  const waveGeo = track(new THREE.PlaneGeometry(14, 7, 48, 24));
  waveGeo.rotateX(-Math.PI / 2);
  const waveMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x0d1c26,
      roughness: 0.14,
      metalness: 0.18,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
      bumpMap: waterBump,
      bumpScale: 0.08,
      clippingPlanes: [groundClip],
    }),
  );
  const waveMesh = new THREE.Mesh(waveGeo, waveMat);
  waveMesh.position.y = -0.92;
  waveMesh.receiveShadow = true;

  shipStageGroup.add(shipHullGroup, waveMesh);
  shipStageGroup.position.set(0, -5.2, 0);
  return { shipStageGroup, shipHullGroup, waveGeo };
}
