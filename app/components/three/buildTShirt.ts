import * as THREE from "three";
import type { SharedStageMaterials } from "./materials";

/**
 * Stage 01: Builds an anatomically sculpted 3D cotton T-shirt with sleeves, collar, and hanger.
 */
export function buildTShirt(mats: SharedStageMaterials): THREE.Group {
  const { track, matTee, matTeeCollar, matTeeInner, matBrand, matChrome } = mats;
  const tshirtGroup = new THREE.Group();

  const torsoGeo = track(new THREE.CylinderGeometry(0.64, 0.58, 1.85, 44, 24, true));
  const pos = torsoGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const ny = (y + 0.925) / 1.85;
    const angle = Math.atan2(z, x);

    const chestBoost = Math.sin(ny * Math.PI) * 0.14;
    const shoulderSlope = ny > 0.82 ? 1 - (ny - 0.82) * 1.45 : 1;
    const fold = Math.sin(angle * 7 + ny * 4) * 0.014 * (1 - ny * 0.5);

    const sx = (1.16 + chestBoost) * shoulderSlope;
    const sz = 0.52 + chestBoost * 0.35;
    pos.setXYZ(i, x * sx + Math.cos(angle) * fold, y, z * sz + Math.sin(angle) * fold);
  }
  torsoGeo.computeVertexNormals();

  const torsoMesh = new THREE.Mesh(torsoGeo, matTee);
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;

  const innerNeck = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.32, 0.42, 0.35, 24)),
    matTeeInner,
  );
  innerNeck.position.y = 0.84;

  const collar = new THREE.Mesh(
    track(new THREE.TorusGeometry(0.28, 0.055, 16, 40)),
    matTeeCollar,
  );
  collar.rotation.x = Math.PI / 2.25;
  collar.scale.set(1.18, 0.72, 1);
  collar.position.set(0, 0.96, 0.02);
  collar.castShadow = true;

  const hem = new THREE.Mesh(
    track(new THREE.TorusGeometry(0.62, 0.035, 12, 44)),
    matTeeCollar,
  );
  hem.rotation.x = Math.PI / 2;
  hem.scale.set(1.12, 0.52, 1);
  hem.position.y = -0.92;

  const makeSleeve = (side: -1 | 1) => {
    const sleeveGroup = new THREE.Group();
    const sGeo = track(new THREE.CylinderGeometry(0.26, 0.21, 0.82, 24, 8));
    sGeo.scale(1, 1, 0.72);
    const sMesh = new THREE.Mesh(sGeo, matTee);
    sMesh.castShadow = true;

    const cuff = new THREE.Mesh(
      track(new THREE.TorusGeometry(0.21, 0.025, 10, 24)),
      matTeeCollar,
    );
    cuff.rotation.x = Math.PI / 2;
    cuff.scale.set(1, 0.72, 1);
    cuff.position.y = -0.4;

    const sleeveShadow = new THREE.Mesh(
      track(new THREE.CircleGeometry(0.19, 20)),
      matTeeInner,
    );
    sleeveShadow.rotation.x = Math.PI / 2;
    sleeveShadow.scale.set(1, 0.72, 1);
    sleeveShadow.position.y = -0.41;

    sleeveGroup.add(sMesh, cuff, sleeveShadow);
    sleeveGroup.position.set(side * 0.92, 0.52, 0);
    sleeveGroup.rotation.z = side * 0.88;
    return sleeveGroup;
  };

  const chestTag = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.26, 0.12, 0.02)),
    matBrand,
  );
  chestTag.position.set(0.28, 0.34, 0.34);
  chestTag.rotation.y = 0.18;

  const hangerBar = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.018, 0.018, 1.35, 12)),
    matChrome,
  );
  hangerBar.rotation.z = Math.PI / 2;
  hangerBar.position.set(0, 1.02, -0.04);

  const hangerHook = new THREE.Mesh(
    track(new THREE.TorusGeometry(0.11, 0.018, 10, 24, Math.PI * 1.4)),
    matChrome,
  );
  hangerHook.position.set(0, 1.24, -0.04);

  tshirtGroup.add(
    torsoMesh,
    innerNeck,
    collar,
    hem,
    makeSleeve(-1),
    makeSleeve(1),
    chestTag,
    hangerBar,
    hangerHook,
  );
  tshirtGroup.position.set(0, 0.15, 0);
  return tshirtGroup;
}
