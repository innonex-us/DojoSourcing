import * as THREE from "three";
import type { SharedStageMaterials } from "./materials";

/**
 * Stage 03: Builds stacked export cartons with shipping labels on a wooden Euro pallet.
 */
export function buildCartons(mats: SharedStageMaterials): THREE.Group {
  const { track, matWood, matCardboard, matBrand, matTee } = mats;
  const readyGroup = new THREE.Group();

  const palletGroup = new THREE.Group();
  [-1.05, 0, 1.05].forEach((px) => {
    const runner = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.18, 0.16, 1.95)),
      matWood,
    );
    runner.position.set(px, -1.24, 0);
    runner.castShadow = true;
    palletGroup.add(runner);
  });
  [-0.78, -0.4, 0, 0.4, 0.78].forEach((pz) => {
    const slat = new THREE.Mesh(
      track(new THREE.BoxGeometry(2.45, 0.06, 0.22)),
      matWood,
    );
    slat.position.set(0, -1.13, pz);
    slat.castShadow = true;
    slat.receiveShadow = true;
    palletGroup.add(slat);
  });

  const makeCarton = (w: number, h: number, d: number) => {
    const g = new THREE.Group();
    const box = new THREE.Mesh(
      track(new THREE.BoxGeometry(w, h, d)),
      matCardboard,
    );
    box.castShadow = true;
    box.receiveShadow = true;

    const tape = new THREE.Mesh(
      track(new THREE.BoxGeometry(w + 0.02, 0.03, 0.16)),
      matBrand,
    );
    tape.position.y = h / 2 + 0.005;

    const tapeFront = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.16, 0.25, 0.02)),
      matBrand,
    );
    tapeFront.position.set(0, h / 2 - 0.12, d / 2 + 0.01);

    g.add(box, tape, tapeFront);
    return g;
  };

  const cLeft = makeCarton(1.05, 0.92, 1.35);
  cLeft.position.set(-0.56, -0.64, 0.02);

  const cRight = makeCarton(1.05, 0.92, 1.35);
  cRight.position.set(0.56, -0.64, -0.02);

  const cTop = makeCarton(1.25, 0.88, 1.15);
  cTop.position.set(-0.04, 0.26, 0);
  cTop.rotation.y = 0.12;

  const foldedTee = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.68, 0.09, 0.82)),
    matTee,
  );
  foldedTee.position.set(-0.04, 0.75, 0);
  foldedTee.rotation.y = 0.12;
  foldedTee.castShadow = true;

  readyGroup.add(palletGroup, cLeft, cRight, cTop, foldedTee);
  readyGroup.position.set(0, -5.2, 0);
  return readyGroup;
}
