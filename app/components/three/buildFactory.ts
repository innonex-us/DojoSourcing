import * as THREE from "three";
import type { SharedStageMaterials } from "./materials";

export type FactoryBuild = {
  factoryGroup: THREE.Group;
  steamPuffs: THREE.Mesh[];
  hvacFans: THREE.Mesh[];
};

/**
 * Stage 02: Builds a multi-wing industrial garment plant with glass office wing, HVAC fans, water tower, and steam.
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
    matGlass,
  } = mats;

  const factoryGroup = new THREE.Group();

  // Concrete Foundation Apron
  const plinth = new THREE.Mesh(
    track(new THREE.BoxGeometry(4.6, 0.22, 3.1)),
    matObsidian,
  );
  plinth.position.y = -1.24;
  plinth.receiveShadow = true;

  // Main Double-Height Garment Production Hall
  const hall = new THREE.Mesh(
    track(new THREE.BoxGeometry(3.4, 1.5, 2.2)),
    matFactoryWall,
  );
  hall.position.set(-0.35, -0.38, -0.1);
  hall.castShadow = true;
  hall.receiveShadow = true;

  // Glazed 2-Story Design & QA Office Wing on Right Side
  const officeCore = new THREE.Mesh(
    track(new THREE.BoxGeometry(1.05, 1.28, 1.85)),
    matGlowWindow,
  );
  officeCore.position.set(1.62, -0.49, 0.05);

  const officeGlass = new THREE.Mesh(
    track(new THREE.BoxGeometry(1.16, 1.38, 1.96)),
    matGlass,
  );
  officeGlass.position.set(1.62, -0.49, 0.05);

  // Horizontal Steel Mullions on Glass Office
  [-0.85, -0.45, -0.05].forEach((my) => {
    const mullion = new THREE.Mesh(
      track(new THREE.BoxGeometry(1.2, 0.05, 2.0)),
      matObsidian,
    );
    mullion.position.set(1.62, my, 0.05);
    factoryGroup.add(mullion);
  });

  // External Steel I-Beam Columns along Front Facade
  [-1.9, -1.1, -0.3, 0.5, 1.1].forEach((bx) => {
    const beam = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.08, 1.56, 0.1)),
      matBrand,
    );
    beam.position.set(bx, -0.36, 1.03);
    factoryGroup.add(beam);
  });

  // North-Light Sawtooth Skylight Bays
  [-1.4, -0.35, 0.7].forEach((rx) => {
    const bay = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.01, 0.78, 2.2, 3)),
      matObsidian,
    );
    bay.rotation.x = Math.PI / 2;
    bay.rotation.y = Math.PI / 6;
    bay.position.set(rx, 0.56, -0.1);
    bay.castShadow = true;
    factoryGroup.add(bay);

    const skylight = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.1, 0.3, 2.08)),
      matGlowWindow,
    );
    skylight.position.set(rx + 0.28, 0.58, -0.1);
    skylight.rotation.z = -0.45;
    factoryGroup.add(skylight);
  });

  // 3 Loading Bay Doors + Safety Bollards
  [-1.45, -0.7, 0.05].forEach((dx) => {
    const door = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.56, 0.68, 0.06)),
      matChrome,
    );
    door.position.set(dx, -0.78, 1.01);
    const dockPad = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.68, 0.08, 0.22)),
      matBrand,
    );
    dockPad.position.set(dx, -1.11, 1.12);
    factoryGroup.add(door, dockPad);
  });

  // Rooftop HVAC Units with Spinning Cooling Fans
  const hvacFans: THREE.Mesh[] = [];
  [-0.9, 0.15].forEach((hx) => {
    const box = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.65, 0.34, 0.65)),
      matChrome,
    );
    box.position.set(hx, 0.54, 0.62);
    const fan = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.42, 0.03, 0.08)),
      matBrand,
    );
    fan.position.set(hx, 0.72, 0.62);
    hvacFans.push(fan);
    factoryGroup.add(box, fan);
  });

  // Elevated Water / Dye Tower on Steel Frame
  const towerTank = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.32, 0.32, 0.55, 20)),
    matBrand,
  );
  towerTank.position.set(1.65, 0.92, -0.65);
  towerTank.castShadow = true;
  const towerStand = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.24, 0.32, 0.52, 4)),
    matObsidian,
  );
  towerStand.position.set(1.65, 0.42, -0.65);

  // Twin Chimneys + Volumetric Steam Puffs
  const steamPuffs: THREE.Mesh[] = [];
  const matSteam = track(
    new THREE.MeshStandardMaterial({
      color: 0xeae6df,
      transparent: true,
      opacity: 0.42,
      roughness: 1,
      clippingPlanes: [groundClip],
    }),
  );

  [-1.65, -1.15].forEach((cx, ci) => {
    const chimney = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.1, 0.16, 1.65, 20)),
      matChrome,
    );
    chimney.position.set(cx, 1.18, -0.78);
    chimney.castShadow = true;

    const band = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.115, 0.115, 0.18, 20)),
      matBrand,
    );
    band.position.set(cx, 1.85, -0.78);
    factoryGroup.add(chimney, band);

    for (let p = 0; p < 4; p++) {
      const puff = new THREE.Mesh(
        track(new THREE.SphereGeometry(0.11 + p * 0.045, 14, 14)),
        matSteam,
      );
      puff.position.set(cx, 2.0 + p * 0.32 + ci * 0.12, -0.78);
      puff.userData = { baseX: cx, offset: p * 0.25 + ci * 0.5 };
      steamPuffs.push(puff);
      factoryGroup.add(puff);
    }
  });

  factoryGroup.add(plinth, hall, officeCore, officeGlass, towerTank, towerStand);
  factoryGroup.position.set(0, -5.4, 0);
  return { factoryGroup, steamPuffs, hvacFans };
}
