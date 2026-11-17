import * as THREE from "three";
import type { SharedStageMaterials } from "./materials";

export type CartonsBuild = {
  readyGroup: THREE.Group;
  laserBeam: THREE.Mesh;
};

/**
 * Stage 03: Builds a detailed Euro pallet, strapped/stretch-wrapped cartons, folded garment sample, and barcode laser scanner.
 */
export function buildCartons(mats: SharedStageMaterials): CartonsBuild {
  const {
    track,
    matWood,
    matCardboard,
    matTape,
    matWrapFilm,
    matObsidian,
    matChrome,
    matTee,
    matBrand,
  } = mats;

  const readyGroup = new THREE.Group();

  // 4-Way Euro Wooden Pallet
  const palletGroup = new THREE.Group();
  [-1.12, 0, 1.12].forEach((px) => {
    [-0.78, 0, 0.78].forEach((pz) => {
      const block = new THREE.Mesh(
        track(new THREE.BoxGeometry(0.22, 0.16, 0.22)),
        matWood,
      );
      block.position.set(px, -1.24, pz);
      block.castShadow = true;
      palletGroup.add(block);
    });
    const runner = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.2, 0.05, 1.98)),
      matWood,
    );
    runner.position.set(px, -1.34, 0);
    palletGroup.add(runner);
  });

  [-0.78, -0.4, 0, 0.4, 0.78].forEach((pz) => {
    const slat = new THREE.Mesh(
      track(new THREE.BoxGeometry(2.55, 0.055, 0.24)),
      matWood,
    );
    slat.position.set(0, -1.13, pz);
    slat.castShadow = true;
    slat.receiveShadow = true;
    palletGroup.add(slat);
  });

  const makeCarton = (w: number, h: number, d: number, strapped = true) => {
    const g = new THREE.Group();
    const box = new THREE.Mesh(
      track(new THREE.BoxGeometry(w, h, d)),
      matCardboard,
    );
    box.castShadow = true;
    box.receiveShadow = true;

    // 3D Folded Top Flaps Seam + Glossy Tape
    const tape = new THREE.Mesh(
      track(new THREE.BoxGeometry(w + 0.015, 0.024, 0.16)),
      matTape,
    );
    tape.position.y = h / 2 + 0.008;

    const tapeDropL = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.015, 0.22, 0.16)),
      matTape,
    );
    tapeDropL.position.set(-w / 2 - 0.004, h / 2 - 0.1, 0);

    const tapeDropR = tapeDropL.clone();
    tapeDropR.position.x = w / 2 + 0.004;
    g.add(box, tape, tapeDropL, tapeDropR);

    if (strapped) {
      [-w * 0.28, w * 0.28].forEach((sx) => {
        const strap = new THREE.Mesh(
          track(new THREE.BoxGeometry(0.04, h + 0.02, d + 0.02)),
          matObsidian,
        );
        strap.position.x = sx;
        const crimp = new THREE.Mesh(
          track(new THREE.BoxGeometry(0.055, 0.04, 0.08)),
          matChrome,
        );
        crimp.position.set(sx, h / 2 + 0.012, 0);
        g.add(strap, crimp);
      });
    }
    return g;
  };

  const cLeft = makeCarton(1.06, 0.94, 1.38);
  cLeft.position.set(-0.56, -0.63, 0.02);

  const cRight = makeCarton(1.06, 0.94, 1.38);
  cRight.position.set(0.56, -0.63, -0.02);

  // Translucent Stretch-Wrap Film Shroud around Lower Tier
  const shrinkWrap = new THREE.Mesh(
    track(new THREE.BoxGeometry(2.26, 0.86, 1.48)),
    matWrapFilm,
  );
  shrinkWrap.position.set(0, -0.66, 0);

  // Top Inspection Carton + Folded Cotton Sample Tee
  const cTop = makeCarton(1.26, 0.88, 1.15);
  cTop.position.set(-0.04, 0.28, 0);
  cTop.rotation.y = 0.12;

  const foldedTee = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.72, 0.11, 0.86)),
    matTee,
  );
  foldedTee.position.set(-0.04, 0.77, 0);
  foldedTee.rotation.y = 0.12;
  foldedTee.castShadow = true;

  const teeBand = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.74, 0.12, 0.14)),
    matBrand,
  );
  teeBand.position.copy(foldedTee.position);
  teeBand.rotation.y = 0.12;

  // Floating Handheld Scanner + Laser Beam Sweeping the Shipping Label
  const scannerGroup = new THREE.Group();
  const scannerHead = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.24, 0.12, 0.14)),
    matObsidian,
  );
  const scannerHandle = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.04, 0.05, 0.24, 12)),
    matBrand,
  );
  scannerHandle.position.set(0.06, -0.15, 0);
  scannerHandle.rotation.z = -0.3;

  const laserBeam = new THREE.Mesh(
    track(new THREE.ConeGeometry(0.22, 0.95, 4, 1, true)),
    track(
      new THREE.MeshBasicMaterial({
        color: 0xfe4101,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      }),
    ),
  );
  laserBeam.rotation.z = -Math.PI / 2;
  laserBeam.position.set(-0.55, 0, 0);

  scannerGroup.add(scannerHead, scannerHandle, laserBeam);
  scannerGroup.position.set(1.38, 0.25, 0.65);
  scannerGroup.rotation.y = 0.45;

  readyGroup.add(
    palletGroup,
    cLeft,
    cRight,
    shrinkWrap,
    cTop,
    foldedTee,
    teeBand,
    scannerGroup,
  );
  readyGroup.position.set(0, -5.4, 0);
  return { readyGroup, laserBeam };
}
