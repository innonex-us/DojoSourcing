import * as THREE from "three";
import { createSharedMaterials, type SharedStageMaterials } from "./materials";
import { buildTShirt, type DesignStudio } from "./buildTShirt";
import { buildFactory } from "./buildFactory";
import { buildSourcing, type SourcingBuild } from "./buildSourcing";
import { buildQualityCheck, type QualityCheckBuild } from "./buildQualityCheck";
import { buildCartons } from "./buildCartons";
import { buildCargoTruck } from "./buildCargoTruck";
import { buildOceanShip } from "./buildOceanShip";

export type RealisticStageAssets = {
  mats: SharedStageMaterials;
  tshirtGroup: THREE.Group;
  swatches: THREE.Group;
  designStudio: DesignStudio;
  sourcingGroup: THREE.Group;
  sourcingStage: Pick<SourcingBuild, "anchors" | "update">;
  factoryGroup: THREE.Group;
  steamPuffs: THREE.Mesh[];
  hvacFans: THREE.Mesh[];
  qaGroup: THREE.Group;
  qaStage: Pick<QualityCheckBuild, "anchors" | "update">;
  readyGroup: THREE.Group;
  laserBeam: THREE.Mesh;
  truckGroup: THREE.Group;
  wheels: THREE.Group[];
  shipStageGroup: THREE.Group;
  shipHullGroup: THREE.Group;
  radarBar: THREE.Mesh;
  waveGeo: THREE.PlaneGeometry;
  dispose: () => void;
};

/**
 * Composes all 5 separated realistic 3D stage designs onto the shared Three.js anchor.
 */
export function buildRealisticStages(
  stageAnchor: THREE.Group,
  groundClip: THREE.Plane,
): RealisticStageAssets {
  const mats = createSharedMaterials(groundClip);

  const { tshirtGroup, swatches, designStudio } = buildTShirt(mats);
  const {
    sourcingGroup,
    anchors: sourcingAnchors,
    update: sourcingUpdate,
  } = buildSourcing(mats, groundClip);
  const { factoryGroup, steamPuffs, hvacFans } = buildFactory(mats, groundClip);
  const { qaGroup, anchors: qaAnchors, update: qaUpdate } = buildQualityCheck(mats, groundClip);
  const { readyGroup, laserBeam } = buildCartons(mats);
  const { truckGroup, wheels } = buildCargoTruck(mats);
  const { shipStageGroup, shipHullGroup, radarBar, waveGeo } = buildOceanShip(
    mats,
    groundClip,
  );

  stageAnchor.add(
    tshirtGroup,
    sourcingGroup,
    factoryGroup,
    qaGroup,
    readyGroup,
    truckGroup,
    shipStageGroup,
  );

  return {
    mats,
    tshirtGroup,
    swatches,
    designStudio,
    sourcingGroup,
    sourcingStage: { anchors: sourcingAnchors, update: sourcingUpdate },
    factoryGroup,
    steamPuffs,
    hvacFans,
    qaGroup,
    qaStage: { anchors: qaAnchors, update: qaUpdate },
    readyGroup,
    laserBeam,
    truckGroup,
    wheels,
    shipStageGroup,
    shipHullGroup,
    radarBar,
    waveGeo,
    dispose: mats.disposeAll,
  };
}

export type { DesignStudio };

export {
  createSharedMaterials,
  buildTShirt,
  buildSourcing,
  buildFactory,
  buildQualityCheck,
  buildCartons,
  buildCargoTruck,
  buildOceanShip,
};
