import * as THREE from "three";
import type { SharedStageMaterials } from "./materials";

export type FactoryBuild = {
  factoryGroup: THREE.Group;
  steamPuffs: THREE.Mesh[];
  hvacFans: THREE.Mesh[];
};

/**
 * Stage 02: Builds a multi-wing industrial garment plant with architectural glass office, HVAC fans, and subtle exhaust wisps.
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

  const plinth = new THREE.Mesh(
    track(new THREE.BoxGeometry(4.6, 0.22, 3.1)),
    matObsidian,
  );
  plinth.position.y = -1.24;
  plinth.receiveShadow = true;

  // Main Corrugated Garment Production Hall
  const hall = new THREE.Mesh(
    track(new THREE.BoxGeometry(3.4, 1.5, 2.2)),
    matFactoryWall,
  );
  hall.position.set(-0.35, -0.38, -0.1);
  hall.castShadow = true;
  hall.receiveShadow = true;

  // Glazed 2-Story Office Wing (Dark Structural Core + Warm Window Strips + Outer Glass)
  const officeCore = new THREE.Mesh(
    track(new THREE.BoxGeometry(1.02, 1.24, 1.82)),
    matObsidian,
  );
  officeCore.position.set(1.62, -0.49, 0.05);

  [-0.75, -0.22].forEach((wy) => {
    const strip = new THREE.Mesh(
      track(new THREE.BoxGeometry(1.06, 0.16, 1.86)),
      matGlowWindow,
    );
    strip.position.set(1.62, wy, 0.05);
    factoryGroup.add(strip);
  });

  const officeGlass = new THREE.Mesh(
    track(new THREE.BoxGeometry(1.16, 1.38, 1.96)),
    matGlass,
  );
  officeGlass.position.set(1.62, -0.49, 0.05);

  [-0.95, -0.49, -0.02].forEach((my) => {
    const mullion = new THREE.Mesh(
      track(new THREE.BoxGeometry(1.2, 0.05, 2.0)),
      matObsidian,
    );
    mullion.position.set(1.62, my, 0.05);
    factoryGroup.add(mullion);
  });

  // External Steel I-Beam Columns
  [-1.9, -1.1, -0.3, 0.5, 1.1].forEach((bx) => {
    const beam = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.08, 1.56, 0.1)),
      matBrand,
    );
    beam.position.set(bx, -0.36, 1.03);
    factoryGroup.add(beam);
  });

  // North-Light Sawtooth Skylights
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
      track(new THREE.BoxGeometry(0.08, 0.24, 2.04)),
      matGlowWindow,
    );
    skylight.position.set(rx + 0.28, 0.56, -0.1);
    skylight.rotation.z = -0.45;
    factoryGroup.add(skylight);
  });

  // Loading Bay Roll-Up Doors
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

  // Grounded Dye / Water Tank Tower on Office Roof
  const towerTank = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.3, 0.3, 0.52, 24)),
    matBrand,
  );
  towerTank.position.set(1.65, 0.72, -0.45);
  towerTank.castShadow = true;
  const towerLegs = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.22, 0.28, 0.35, 8, 1, true)),
    matObsidian,
  );
  towerLegs.position.set(1.65, 0.35, -0.45);

  // Twin Chimneys + Soft Translucent Steam Wisps (no solid grey balloons)
  const steamPuffs: THREE.Mesh[] = [];
  const matSteam = track(
    new THREE.MeshBasicMaterial({
      color: 0xe4e2df,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
      clippingPlanes: [groundClip],
    }),
  );

  [-1.65, -1.15].forEach((cx, ci) => {
    const chimney = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.1, 0.15, 1.35, 20)),
      matChrome,
    );
    chimney.position.set(cx, 1.05, -0.78);
    chimney.castShadow = true;

    const band = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.115, 0.115, 0.16, 20)),
      matBrand,
    );
    band.position.set(cx, 1.62, -0.78);
    factoryGroup.add(chimney, band);

    for (let p = 0; p < 3; p++) {
      const puff = new THREE.Mesh(
        track(new THREE.SphereGeometry(0.14 + p * 0.05, 12, 12)),
        matSteam.clone(),
      );
      puff.scale.set(1.3, 0.55, 1.3);
      puff.position.set(cx, 1.82 + p * 0.24 + ci * 0.1, -0.78);
      puff.userData = { baseX: cx, offset: p * 0.33 + ci * 0.5 };
      steamPuffs.push(puff);
      factoryGroup.add(puff);
    }
  });

  factoryGroup.add(plinth, hall, officeCore, officeGlass, towerTank, towerLegs);
  factoryGroup.position.set(0, -5.4, 0);
  return { factoryGroup, steamPuffs, hvacFans };
}
