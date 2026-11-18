/**
 * Content for the Stage 01 "Product Design" studio: the five design services shown
 * around the 3D quilted jacket (tech pack, BOM, 3D sampling, development, presentation).
 * Shared by the Journey UI and the Three.js jacket build (anchor keys must match).
 */

export type DesignMode =
  | "techpack"
  | "bom"
  | "sampling"
  | "development"
  | "presentation";

export const DESIGN_SERVICES: ReadonlyArray<{
  mode: DesignMode;
  label: string;
  blurb: string;
}> = [
  {
    mode: "techpack",
    label: "Tech Pack",
    blurb:
      "Construction-ready flat sketch with every detail called out — collar, placket, zipper, pockets, cuffs and hem.",
  },
  {
    mode: "bom",
    label: "BOM Sheet",
    blurb:
      "Every fabric, fill and trim specified with colour and consumption, so costing and sourcing start from one sheet.",
  },
  {
    mode: "sampling",
    label: "3D Sampling",
    blurb:
      "Digital patterns are simulated in 3D for drape, loft and fit — fewer physical sample rounds, faster approvals.",
  },
  {
    mode: "development",
    label: "Development",
    blurb:
      "Points of measure, tolerances, lab dips and trim approvals locked in before the bulk order is cut.",
  },
  {
    mode: "presentation",
    label: "Presentation",
    blurb:
      "Line-sheet ready front, back and side views in every colourway — switch the colour live below.",
  },
];

export const COLORWAYS = [
  { name: "Midnight Navy", hex: "#1f2a44", spec: "Quilted Woven · 100% Nylon" },
  { name: "Stone Taupe", hex: "#7c766d", spec: "Quilted Woven · Recycled Poly" },
  { name: "Fog Grey", hex: "#b8bcc2", spec: "Quilted Woven · Matte Finish" },
  { name: "Ivory", hex: "#e9e3d6", spec: "Quilted Woven · Peached Hand" },
] as const;

export const DEFAULT_COLORWAY_LABEL = `${COLORWAYS[0].name} (${COLORWAYS[0].spec})`;

/** Tech-pack callouts: `anchor` is a key of `designStudio.anchors`. */
export const TECH_CALLOUTS: ReadonlyArray<{ anchor: string; label: string }> = [
  { anchor: "collar", label: "Shell fabric collar" },
  { anchor: "placket", label: "Zigzag-quilted inner placket" },
  { anchor: "zipper", label: "#5 center-front zipper" },
  { anchor: "pocket", label: "Welt pocket with concealed snap" },
  { anchor: "sleeve", label: "Quilted sleeve" },
  { anchor: "cuff", label: '¼" elasticated cuff' },
  { anchor: "hem", label: '¼" elasticated hem' },
];

export const TECHPACK_SPECS: ReadonlyArray<[string, string]> = [
  ["Style", "DJ-QJ-01 Quilted Jacket"],
  ["Season", "FW26 · Outerwear"],
  ["Fit", "Relaxed · Stand collar"],
  ["Shell", "Quilted woven, V-yoke"],
];

export const BOM_ROWS: ReadonlyArray<{
  no: number;
  component: string;
  spec: string;
  color: string;
  qty: string;
  anchor: string;
}> = [
  { no: 1, component: "Shell Fabric", spec: "Quilted Woven", color: "#1f2a44", qty: "1.00", anchor: "bomShell" },
  { no: 2, component: "Lining", spec: "Polyester Taffeta", color: "#9aa1aa", qty: "1.00", anchor: "bomLining" },
  { no: 3, component: "Interlining", spec: "Polyester Fill", color: "#f4f2ee", qty: "1.00", anchor: "bomFill" },
  { no: 4, component: "Center-Front Zipper", spec: "#5 Molded Zipper", color: "#111316", qty: "1.00", anchor: "bomZipper" },
  { no: 5, component: "Pocket Snap", spec: "Concealed Snap", color: "#8b9099", qty: "2.00", anchor: "bomSnap" },
  { no: 6, component: "Elastic (Cuff/Hem)", spec: "Elastic Webbing", color: "#1a1c20", qty: "2.00", anchor: "bomElastic" },
];

/** Points of measure (cm). `anchor` places the value tag on the 3D dimension line. */
export const POM_ROWS: ReadonlyArray<{
  point: string;
  spec: string;
  tol: string;
  anchor?: string;
}> = [
  { point: "½ Chest (1 cm below armhole)", spec: "58.0", tol: "±1.0", anchor: "pomChest" },
  { point: "Body Length (HPS)", spec: "66.0", tol: "±1.0", anchor: "pomLength" },
  { point: "Sleeve Length (from shoulder)", spec: "62.0", tol: "±1.0", anchor: "pomSleeve" },
  { point: "½ Hem (relaxed)", spec: "51.0", tol: "±1.0" },
  { point: "Collar Height (CB)", spec: "9.0", tol: "±0.5" },
];

export const SAMPLING_STATS: ReadonlyArray<[string, string]> = [
  ["Pattern pieces", "14"],
  ["Fit simulation", "Drape + loft"],
  ["Sample rounds", "1 physical"],
];

/** Small annotations shown for the sampling, development and presentation modes. */
export const MODE_TAGS: Partial<
  Record<DesignMode, ReadonlyArray<{ anchor: string; label: string; leader?: boolean }>>
> = {
  sampling: [
    { anchor: "ghost", label: "Digital pattern grid · back", leader: true },
    { anchor: "scan", label: "Drape & loft simulation", leader: true },
  ],
  development: [
    { anchor: "pomChest", label: "½ Chest 58 cm" },
    { anchor: "pomLength", label: "Body length 66 cm" },
    { anchor: "pomSleeve", label: "Sleeve 62 cm" },
    { anchor: "labDips", label: "Lab dips & trims approved", leader: true },
  ],
  presentation: [
    { anchor: "viewFront", label: "Front" },
    { anchor: "viewBack", label: "Back" },
    { anchor: "viewSide", label: "Side" },
  ],
};
