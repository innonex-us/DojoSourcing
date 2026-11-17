import * as THREE from "three";
import type { SharedStageMaterials } from "./materials";

export type CargoTruckBuild = {
  truckGroup: THREE.Group;
  wheels: THREE.Group[];
};

/**
 * Stage 04: Builds a semi-trailer cargo truck with sleeper cab, exhaust stacks, and 6 alloy wheels.
 */
export function buildCargoTruck(mats: SharedStageMaterials): CargoTruckBuild {
  const {
    track,
    matTrailer,
    matObsidian,
    matChrome,
    matGlass,
    matGlowWindow,
    matBrand,
  } = mats;

  const truckGroup = new THREE.Group();

  const trailer = new THREE.Mesh(
    track(new THREE.BoxGeometry(3.35, 1.42, 1.42)),
    matTrailer,
  );
  trailer.position.set(-0.72, 0.05, 0);
  trailer.castShadow = true;
  trailer.receiveShadow = true;

  const chassis = new THREE.Mesh(
    track(new THREE.BoxGeometry(4.65, 0.18, 1.18)),
    matObsidian,
  );
  chassis.position.set(-0.05, -0.72, 0);
  chassis.castShadow = true;

  const sleeper = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.95, 1.34, 1.36)),
    matChrome,
  );
  sleeper.position.set(1.42, 0.0, 0);
  sleeper.castShadow = true;

  const nose = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.75, 0.78, 1.28)),
    matChrome,
  );
  nose.position.set(2.15, -0.26, 0);
  nose.castShadow = true;

  const grille = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.06, 0.56, 0.85)),
    matObsidian,
  );
  grille.position.set(2.54, -0.24, 0);

  const windshield = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.16, 0.44, 1.2)),
    matGlass,
  );
  windshield.position.set(1.88, 0.34, 0);
  windshield.rotation.z = 0.25;

  const bumper = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.14, 0.22, 1.38)),
    matChrome,
  );
  bumper.position.set(2.56, -0.62, 0);

  [-0.48, 0.48].forEach((hz) => {
    const lamp = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.06, 0.14, 0.22)),
      matGlowWindow,
    );
    lamp.position.set(2.54, -0.42, hz);
    truckGroup.add(lamp);

    const stack = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.045, 0.045, 1.35, 12)),
      matChrome,
    );
    stack.position.set(1.02, 0.42, hz * 1.42);
    truckGroup.add(stack);

    const tank = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.18, 0.18, 0.75, 16)),
      matChrome,
    );
    tank.rotation.z = Math.PI / 2;
    tank.position.set(1.38, -0.78, hz * 1.25);
    truckGroup.add(tank);
  });

  const wheels: THREE.Group[] = [];
  const wheelCoords: Array<[number, number, number]> = [
    [-1.85, -0.98, 0.68],
    [-1.85, -0.98, -0.68],
    [-1.05, -0.98, 0.68],
    [-1.05, -0.98, -0.68],
    [1.92, -0.98, 0.68],
    [1.92, -0.98, -0.68],
  ];
  wheelCoords.forEach(([wx, wy, wz]) => {
    const wg = new THREE.Group();
    const tire = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.35, 0.35, 0.24, 24)),
      matObsidian,
    );
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;

    const rim = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.19, 0.19, 0.26, 16)),
      matChrome,
    );
    rim.rotation.x = Math.PI / 2;

    const hubBolt = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.06, 0.06, 0.28, 8)),
      matBrand,
    );
    hubBolt.rotation.x = Math.PI / 2;

    wg.add(tire, rim, hubBolt);
    wg.position.set(wx, wy, wz);
    wheels.push(wg);
    truckGroup.add(wg);
  });

  truckGroup.add(trailer, chassis, sleeper, nose, grille, windshield, bumper);
  truckGroup.position.set(0, -5.2, 0);
  return { truckGroup, wheels };
}
