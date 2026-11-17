import * as THREE from "three";
import type { SharedStageMaterials } from "./materials";

export type TShirtBuild = {
  tshirtGroup: THREE.Group;
  swatches: THREE.Group;
};

/**
 * Stage 01: Builds a realistic cotton T-shirt on a studio tailoring stand with orbiting fabric swatches.
 */
export function buildTShirt(mats: SharedStageMaterials): TShirtBuild {
  const {
    track,
    matTee,
    matTeeCollar,
    matTeeInner,
    matWoodStand,
    matBrand,
    matChrome,
    matObsidian,
  } = mats;

  const tshirtGroup = new THREE.Group();

  // Sculpted Anatomical Torso with Organic Chest, Waist Taper & Drape Folds
  const torsoGeo = track(new THREE.CylinderGeometry(0.64, 0.6, 1.88, 56, 32, true));
  const pos = torsoGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const ny = (y + 0.94) / 1.88; // 0 hem -> 1 neck
    const angle = Math.atan2(z, x);

    const chestCurve = Math.sin(ny * Math.PI) * 0.14;
    const waistCincher = -Math.sin(ny * Math.PI * 1.4) * 0.04;
    const shoulderSlope = ny > 0.8 ? 1 - (ny - 0.8) * 1.65 : 1;
    const drapeFold =
      Math.sin(angle * 6 + ny * 3.5) * 0.018 * (1 - ny * 0.6) +
      Math.cos(angle * 11 - ny * 5) * 0.008;

    const sx = (1.16 + chestCurve + waistCincher) * shoulderSlope;
    const sz = 0.54 + chestCurve * 0.35;
    pos.setXYZ(
      i,
      x * sx + Math.cos(angle) * drapeFold,
      y,
      z * sz + Math.sin(angle) * drapeFold,
    );
  }
  torsoGeo.computeVertexNormals();

  const torsoMesh = new THREE.Mesh(torsoGeo, matTee);
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;

  // Inner dark cavity + woven neck label
  const innerNeck = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.3, 0.42, 0.36, 28)),
    matTeeInner,
  );
  innerNeck.position.y = 0.85;

  const neckTag = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.18, 0.1, 0.015)),
    matBrand,
  );
  neckTag.position.set(0, 0.88, -0.18);

  // Ribbed Crew-Neck Collar
  const collar = new THREE.Mesh(
    track(new THREE.TorusGeometry(0.28, 0.055, 20, 48)),
    matTeeCollar,
  );
  collar.rotation.x = Math.PI / 2.25;
  collar.scale.set(1.18, 0.72, 1);
  collar.position.set(0, 0.98, 0.02);
  collar.castShadow = true;

  // Double-stitched bottom hem
  const hem = new THREE.Mesh(
    track(new THREE.TorusGeometry(0.62, 0.032, 14, 52)),
    matTeeCollar,
  );
  hem.rotation.x = Math.PI / 2;
  hem.scale.set(1.13, 0.54, 1);
  hem.position.y = -0.93;

  // Organic Shoulder-Blended Sleeves
  const makeSleeve = (side: -1 | 1) => {
    const sg = new THREE.Group();
    const cap = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.27, 24, 18)),
      matTee,
    );
    cap.scale.set(1, 0.95, 0.72);
    cap.position.y = 0.36;
    cap.castShadow = true;

    const arm = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.26, 0.21, 0.78, 28, 10)),
      matTee,
    );
    arm.scale.set(1, 1, 0.72);
    arm.castShadow = true;

    const cuff = new THREE.Mesh(
      track(new THREE.TorusGeometry(0.21, 0.024, 12, 28)),
      matTeeCollar,
    );
    cuff.rotation.x = Math.PI / 2;
    cuff.scale.set(1, 0.72, 1);
    cuff.position.y = -0.38;

    const darkOpening = new THREE.Mesh(
      track(new THREE.CircleGeometry(0.19, 24)),
      matTeeInner,
    );
    darkOpening.rotation.x = Math.PI / 2;
    darkOpening.scale.set(1, 0.72, 1);
    darkOpening.position.y = -0.39;

    sg.add(cap, arm, cuff, darkOpening);
    sg.position.set(side * 0.9, 0.54, 0);
    sg.rotation.z = side * 0.86;
    return sg;
  };

  // Minimalist Chest Pocket Badge
  const chestTag = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.26, 0.12, 0.022)),
    matBrand,
  );
  chestTag.position.set(0.28, 0.36, 0.35);
  chestTag.rotation.y = 0.18;

  // Tailoring Studio Display Stand (Wooden Base + Brushed Steel Pole + Brass Finial)
  const standGroup = new THREE.Group();
  const standBase = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.55, 0.62, 0.08, 36)),
    matObsidian,
  );
  standBase.position.y = -1.46;
  standBase.receiveShadow = true;

  const pole = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.032, 0.038, 2.5, 16)),
    matChrome,
  );
  pole.position.y = -0.22;

  const woodFinial = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.085, 20, 20)),
    matWoodStand,
  );
  woodFinial.position.y = 1.18;
  standGroup.add(standBase, pole, woodFinial);

  // Orbiting 3D Pantone / Fabric Swatch Cards
  const swatches = new THREE.Group();
  const swatchColors = [0xfe4101, 0x262220, 0xd8d2c9];
  swatchColors.forEach((hex, idx) => {
    const angle = (idx / swatchColors.length) * Math.PI * 2;
    const card = new THREE.Group();
    const plate = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.42, 0.56, 0.03)),
      mats.makePhys({ color: hex, roughness: 0.78, sheen: 0.6 }),
    );
    const chipFooter = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.42, 0.14, 0.034)),
      matChrome,
    );
    chipFooter.position.y = -0.21;
    card.add(plate, chipFooter);
    card.position.set(
      Math.cos(angle) * 1.75,
      Math.sin(idx * 1.7) * 0.4,
      Math.sin(angle) * 1.75,
    );
    card.lookAt(0, card.position.y, 0);
    swatches.add(card);
  });

  tshirtGroup.add(
    torsoMesh,
    innerNeck,
    neckTag,
    collar,
    hem,
    makeSleeve(-1),
    makeSleeve(1),
    chestTag,
    standGroup,
    swatches,
  );
  tshirtGroup.position.set(0, 0.12, 0);
  return { tshirtGroup, swatches };
}
