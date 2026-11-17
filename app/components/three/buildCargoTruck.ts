import * as THREE from "three";
import type { SharedStageMaterials } from "./materials";

export type CargoTruckBuild = {
  truckGroup: THREE.Group;
  wheels: THREE.Group[];
};

function createAerodynamicCabShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, -0.62);
  s.lineTo(1.55, -0.62);
  s.lineTo(1.55, -0.05);
  s.lineTo(1.12, 0.12);
  s.lineTo(0.86, 0.68);
  s.lineTo(0.0, 0.68);
  s.closePath();
  return s;
}

/**
 * Stage 04: Builds an aerodynamic semi-trailer cargo truck with asphalt road strip and 6 alloy wheels.
 */
export function buildCargoTruck(mats: SharedStageMaterials): CargoTruckBuild {
  const {
    track,
    matTrailer,
    matObsidian,
    matChrome,
    matGlass,
    matHeadlight,
    matBrand,
    matAsphalt,
  } = mats;

  const truckGroup = new THREE.Group();

  const trailer = new THREE.Mesh(
    track(new THREE.BoxGeometry(3.45, 1.48, 1.46)),
    matTrailer,
  );
  trailer.position.set(-0.85, 0.08, 0);
  trailer.castShadow = true;
  trailer.receiveShadow = true;

  [-0.74, 0.74].forEach((sz) => {
    const dotStrip = new THREE.Mesh(
      track(new THREE.BoxGeometry(3.42, 0.05, 0.02)),
      matChrome,
    );
    dotStrip.position.set(-0.85, -0.58, sz);
    truckGroup.add(dotStrip);
  });

  [-0.36, -0.14, 0.14, 0.36].forEach((lz) => {
    const rod = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.018, 0.018, 1.42, 8)),
      matChrome,
    );
    rod.position.set(-2.59, 0.08, lz);
    truckGroup.add(rod);
  });

  const chassis = new THREE.Mesh(
    track(new THREE.BoxGeometry(4.95, 0.18, 1.15)),
    matObsidian,
  );
  chassis.position.set(-0.1, -0.74, 0);
  chassis.castShadow = true;

  const cabGeo = track(
    new THREE.ExtrudeGeometry(createAerodynamicCabShape(), {
      depth: 1.32,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.05,
      bevelSegments: 3,
    }),
  );
  cabGeo.translate(0, 0, -0.66);
  const cab = new THREE.Mesh(cabGeo, matChrome);
  cab.position.set(1.05, -0.02, 0);
  cab.castShadow = true;

  const deflector = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.75, 0.28, 1.24)),
    matBrand,
  );
  deflector.position.set(1.32, 0.76, 0);
  deflector.rotation.z = -0.22;

  const windshield = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.12, 0.44, 1.2)),
    matGlass,
  );
  windshield.position.set(2.04, 0.36, 0);
  windshield.rotation.z = 0.45;

  [-0.78, 0.78].forEach((mz) => {
    const mirrorArm = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.18, 0.03, 0.16)),
      matObsidian,
    );
    mirrorArm.position.set(1.98, 0.32, mz);
    const mirror = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.06, 0.24, 0.1)),
      matChrome,
    );
    mirror.position.set(2.02, 0.24, mz * 1.08);
    truckGroup.add(mirrorArm, mirror);
  });

  const grille = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.06, 0.48, 0.88)),
    matObsidian,
  );
  grille.position.set(2.65, -0.34, 0);

  [-0.48, 0.48].forEach((hz) => {
    const lamp = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.06, 0.14, 0.24)),
      matHeadlight,
    );
    lamp.position.set(2.64, -0.44, hz);

    const stack = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.045, 0.045, 1.45, 14)),
      matChrome,
    );
    stack.position.set(1.0, 0.42, hz * 1.44);

    const tank = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.19, 0.19, 0.78, 18)),
      matChrome,
    );
    tank.rotation.z = Math.PI / 2;
    tank.position.set(1.42, -0.78, hz * 1.28);

    truckGroup.add(lamp, stack, tank);
  });

  const wheels: THREE.Group[] = [];
  const wheelCoords: Array<[number, number, number]> = [
    [-2.0, -0.98, 0.7],
    [-2.0, -0.98, -0.7],
    [-1.18, -0.98, 0.7],
    [-1.18, -0.98, -0.7],
    [2.05, -0.98, 0.7],
    [2.05, -0.98, -0.7],
  ];
  wheelCoords.forEach(([wx, wy, wz]) => {
    const wg = new THREE.Group();
    const tire = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 28)),
      matObsidian,
    );
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;

    const rim = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.2, 0.2, 0.28, 18)),
      matChrome,
    );
    rim.rotation.x = Math.PI / 2;

    const hub = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.065, 0.065, 0.3, 10)),
      matBrand,
    );
    hub.rotation.x = Math.PI / 2;

    wg.add(tire, rim, hub);
    wg.position.set(wx, wy, wz);
    wheels.push(wg);
    truckGroup.add(wg);
  });

  const roadStrip = new THREE.Mesh(
    track(new THREE.BoxGeometry(6.2, 0.08, 2.4)),
    matAsphalt,
  );
  roadStrip.position.set(0, -1.36, 0);
  roadStrip.receiveShadow = true;

  truckGroup.add(
    trailer,
    chassis,
    cab,
    deflector,
    windshield,
    grille,
    roadStrip,
  );
  truckGroup.position.set(0, -5.4, 0);
  return { truckGroup, wheels };
}
