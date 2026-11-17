import * as THREE from "three";
import { createSharedMaterials } from "./materials";
import { buildTShirt } from "./buildTShirt";
import { buildFactory } from "./buildFactory";
import { buildCartons } from "./buildCartons";
import { buildCargoTruck } from "./buildCargoTruck";
import { buildOceanShip } from "./buildOceanShip";

export type RealisticStageAssets = {
  tshirtGroup: THREE.Group;
  factoryGroup: THREE.Group;
  steamPuffs: THREE.Mesh[];
  readyGroup: THREE.Group;
  truckGroup: THREE.Group;
  wheels: THREE.Group[];
  shipStageGroup: THREE.Group;
  shipHullGroup: THREE.Group;
  waveGeo: THREE.PlaneGeometry;
  dispose: () => void;
};

/**
 * Composes all 5 individual 3D stage designs onto the shared Three.js anchor.
 */
export function buildRealisticStages(
  stageAnchor: THREE.Group,
  groundClip: THREE.Plane,
): RealisticStageAssets {
  const mats = createSharedMaterials(groundClip);

  const tshirtGroup = buildTShirt(mats);
  const { factoryGroup, steamPuffs } = buildFactory(mats, groundClip);
  const readyGroup = buildCartons(mats);
  const { truckGroup, wheels } = buildCargoTruck(mats);
  const { shipStageGroup, shipHullGroup, waveGeo } = buildOceanShip(mats, groundClip);

  stageAnchor.add(
    tshirtGroup,
    factoryGroup,
    readyGroup,
    truckGroup,
    shipStageGroup,
  );

  return {
    tshirtGroup,
    factoryGroup,
    steamPuffs,
    readyGroup,
    truckGroup,
    wheels,
    shipStageGroup,
    shipHullGroup,
    waveGeo,
    dispose: mats.disposeAll,
  };
}

export {
  createSharedMaterials,
  buildTShirt,
  buildFactory,
  buildCartons,
  buildCargoTruck,
  buildOceanShip,
};
