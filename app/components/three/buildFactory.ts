import * as THREE from "three";
import type { SharedStageMaterials } from "./materials";

export type FactoryBuild = {
  factoryGroup: THREE.Group;
  steamPuffs: THREE.Mesh[];
};

/**
 * Stage 02: Builds a multi-bay sawtooth garment factory with chimneys, dock doors, and steam puffs.
 */
export function buildFactory(
  mats: SharedStageMaterials,
  groundClip: THREE.Plane,
): FactoryBuild {
  const {
    track,
    matObsidian,
    matFactoryWall,
    matGlowWindow,
    matChrome,
    matBrand,
  } = mats;

  const factoryGroup = new THREE.Group();

  const plinth = new THREE.Mesh(
    track(new THREE.BoxGeometry(4.1, 0.25, 2.7)),
    matObsidian,
  );
  plinth.position.y = -1.2;
  plinth.receiveShadow = true;

  const hall = new THREE.Mesh(
    track(new THREE.BoxGeometry(3.7, 1.45, 2.25)),
    matFactoryWall,
  );
  hall.position.y = -0.35;
  hall.castShadow = true;
  hall.receiveShadow = true;

  [-1.15, 0, 1.15].forEach((rx) => {
    const bay = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.01, 0.85, 2.25, 3)),
      matObsidian,
    );
    bay.rotation.x = Math.PI / 2;
    bay.rotation.y = Math.PI / 6;
    bay.position.set(rx, 0.56, 0);
    bay.castShadow = true;
    factoryGroup.add(bay);

    const skylight = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.12, 0.34, 2.1)),
      matGlowWindow,
    );
    skylight.position.set(rx + 0.32, 0.58, 0);
    skylight.rotation.z = -0.45;
    factoryGroup.add(skylight);
  });

  [-0.95, 0, 0.95].forEach((dx) => {
    const door = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.65, 0.72, 0.08)),
      matChrome,
    );
    door.position.set(dx, -0.72, 1.13);
    const doorFrame = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.73, 0.78, 0.05)),
      matBrand,
    );
    doorFrame.position.set(dx, -0.71, 1.11);
    factoryGroup.add(doorFrame, door);
  });

  [-1.25, -0.55, 0.15, 0.85].forEach((wx) => {
    const win = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.45, 0.24, 0.06)),
      matGlowWindow,
    );
    win.position.set(wx, 0.08, 1.13);
    factoryGroup.add(win);
  });

  const steamPuffs: THREE.Mesh[] = [];
  const matSteam = track(
    new THREE.MeshStandardMaterial({
      color: 0xe4e2df,
      transparent: true,
      opacity: 0.45,
      roughness: 1,
      clippingPlanes: [groundClip],
    }),
  );

  [-1.35, -0.82].forEach((cx, ci) => {
    const chimney = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.11, 0.16, 1.55, 20)),
      matChrome,
    );
    chimney.position.set(cx, 1.15, -0.65);
    chimney.castShadow = true;

    const band = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.125, 0.125, 0.18, 20)),
      matBrand,
    );
    band.position.set(cx, 1.78, -0.65);
    factoryGroup.add(chimney, band);

    for (let p = 0; p < 3; p++) {
      const puff = new THREE.Mesh(
        track(new THREE.SphereGeometry(0.12 + p * 0.04, 12, 12)),
        matSteam,
      );
      puff.position.set(cx, 2.0 + p * 0.35 + ci * 0.15, -0.65);
      puff.userData = { baseX: cx, offset: p * 0.33 + ci * 0.5 };
      steamPuffs.push(puff);
      factoryGroup.add(puff);
    }
  });

  const hvac = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.65, 0.55, 0.9)),
    matChrome,
  );
  hvac.position.set(1.35, 0.65, -0.45);

  factoryGroup.add(plinth, hall, hvac);
  factoryGroup.position.set(0, -5.2, 0);
  return { factoryGroup, steamPuffs };
}
