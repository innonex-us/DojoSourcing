import * as THREE from "three";
import type { SharedStageMaterials } from "./materials";

export type TShirtBuild = {
  tshirtGroup: THREE.Group;
  swatches: THREE.Group;
};

/**
 * Stage 01: Builds a sculpted cotton crewneck T-shirt on a studio mannequin stand with a floor swatch rack.
 */
export function buildTShirt(mats: SharedStageMaterials): TShirtBuild {
  const {
    track,
    matTee,
    matTeeCollar,
    matTeeInner,
    matBrand,
    matChrome,
    matObsidian,
  } = mats;

  const tshirtGroup = new THREE.Group();

  // Sculpted Anatomical Torso with Smooth Shoulder Taper & Natural Drape Folds
  const torsoGeo = track(new THREE.CylinderGeometry(0.62, 0.58, 1.84, 64, 36, false));
  const pos = torsoGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const ny = (y + 0.92) / 1.84; // 0 hem -> 1 neck
    const angle = Math.atan2(z, x);

    const chestCurve = Math.sin(ny * Math.PI) * 0.13;
    const waistCincher = -Math.sin(ny * Math.PI * 1.35) * 0.035;
    const shoulderSlope = ny > 0.78 ? 1 - (ny - 0.78) * 1.55 : 1;
    const drapeFold =
      Math.sin(angle * 6 + ny * 3.2) * 0.02 * (1 - ny * 0.65) +
      Math.cos(angle * 10 - ny * 4.5) * 0.009;

    const sx = (1.14 + chestCurve + waistCincher) * shoulderSlope;
    const sz = 0.5 + chestCurve * 0.34;
    // Slight front collar scoop dip
    const collarDip = ny > 0.94 && z > 0.02 ? -0.14 * (z / 0.34) : 0;

    pos.setXYZ(
      i,
      x * sx + Math.cos(angle) * drapeFold,
      y + collarDip,
      z * sz + Math.sin(angle) * drapeFold,
    );
  }
  torsoGeo.computeVertexNormals();

  const torsoMesh = new THREE.Mesh(torsoGeo, matTee);
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;

  // Tailored Mannequin Neck Pillar Rising Cleanly Out of Collar
  const mannequinNeck = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.18, 0.24, 0.42, 32)),
    matObsidian,
  );
  mannequinNeck.position.y = 0.98;
  mannequinNeck.castShadow = true;

  // Ribbed Crew-Neck Collar Ring Seated Flush Around Neck
  const collar = new THREE.Mesh(
    track(new THREE.TorusGeometry(0.28, 0.048, 20, 48)),
    matTeeCollar,
  );
  collar.rotation.x = Math.PI / 2.25;
  collar.scale.set(1.16, 0.72, 1);
  collar.position.set(0, 0.91, 0.02);
  collar.castShadow = true;

  // Double-Stitched Bottom Hem
  const hem = new THREE.Mesh(
    track(new THREE.TorusGeometry(0.61, 0.028, 14, 56)),
    matTeeCollar,
  );
  hem.rotation.x = Math.PI / 2;
  hem.scale.set(1.12, 0.5, 1);
  hem.position.y = -0.92;

  // Clean Fitted Sleeves Blended Under Shoulder Line
  const makeSleeve = (side: -1 | 1) => {
    const sg = new THREE.Group();
    const arm = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.27, 0.21, 0.72, 32, 12)),
      matTee,
    );
    arm.scale.set(1, 1, 0.68);
    arm.castShadow = true;
    arm.receiveShadow = true;

    const cuff = new THREE.Mesh(
      track(new THREE.TorusGeometry(0.21, 0.02, 12, 32)),
      matTeeCollar,
    );
    cuff.rotation.x = Math.PI / 2;
    cuff.scale.set(1, 0.68, 1);
    cuff.position.y = -0.35;

    const darkOpening = new THREE.Mesh(
      track(new THREE.CircleGeometry(0.19, 24)),
      matTeeInner,
    );
    darkOpening.rotation.x = Math.PI / 2;
    darkOpening.scale.set(1, 0.68, 1);
    darkOpening.position.y = -0.36;

    sg.add(arm, cuff, darkOpening);
    sg.position.set(side * 0.82, 0.51, 0);
    sg.rotation.z = side * 0.96;
    return sg;
  };

  // Minimalist Woven Chest Label
  const chestTag = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.22, 0.1, 0.018)),
    matBrand,
  );
  chestTag.position.set(0.26, 0.36, 0.34);
  chestTag.rotation.y = 0.16;

  // Matte Studio Display Stand (Base + Steel Pole)
  const standGroup = new THREE.Group();
  const standBase = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.52, 0.58, 0.07, 40)),
    matObsidian,
  );
  standBase.position.y = -1.46;
  standBase.receiveShadow = true;

  const pole = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.03, 0.035, 1.5, 16)),
    matChrome,
  );
  pole.position.y = -0.72;
  standGroup.add(standBase, pole);

  // Tabletop / Floor Fabric Swatch Rack Beside Mannequin (no floating mid-air cards)
  const swatches = new THREE.Group();
  const rackBase = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.95, 0.05, 0.36)),
    matObsidian,
  );
  rackBase.position.y = -1.46;
  swatches.add(rackBase);

  const swatchColors = [0xdc2626, 0x1e3a8a, 0xe2e8f0];
  swatchColors.forEach((hex, idx) => {
    const card = new THREE.Group();
    const plate = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.24, 0.34, 0.025)),
      mats.makePhys({ color: hex, roughness: 0.85, sheen: 0.55 }),
    );
    plate.castShadow = true;
    const footer = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.24, 0.07, 0.028)),
      matChrome,
    );
    footer.position.y = -0.14;
    card.add(plate, footer);
    card.position.set((idx - 1) * 0.28, -1.26, 0);
    card.rotation.x = -0.22;
    swatches.add(card);
  });
  swatches.position.set(1.38, 0, 0.45);
  swatches.rotation.y = -0.45;

  tshirtGroup.add(
    torsoMesh,
    mannequinNeck,
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
