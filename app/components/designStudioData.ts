/**
 * Content for the Stage 01 "Design and Innovation" studio: the five design services shown
 * around the 3D hooded shell jacket (tech pack, BOM, 3D sampling, development, presentation).
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
      "Construction-ready flat sketch with every detail called out — hood, drawcords, zipper, pockets, cuffs and hem.",
  },
  {
    mode: "bom",
    label: "Graphic",
    blurb:
      "Develop placement prints, all-over repeat patterns, and garment graphics, along with branding artwork for labels, trims, and embellishments.",
  },
  {
    mode: "sampling",
    label: "3D Sampling",
    blurb:
      "DOJO turns your CAD flats and garment specifications into realistic 3D samples that show silhouette, proportions, fabric drape, and construction details. View the garment from the front, back, and side, and compare colorways, fabric textures, print placements, and trims on the same design. We create presentation-ready renders for collection reviews, buyer meetings, and factory communication, helping you refine design details before physical sampling.",
  },
  {
    mode: "development",
    label: "Development",
    blurb:
      "DOJO takes your apparel design from concept to an approved pre-production sample. We source fabrics and trims to meet your performance, cost, and lead-time requirements, then work with factories to develop prototypes and fit samples. At each sample round, we review fit, measurements, garment construction, and workmanship, document corrections, and update the tech pack and bill of materials (BOM). The approved sample and final specifications give the factory a clear reference for bulk production.",
  },
  {
    mode: "presentation",
    label: "Presentation",
    blurb:
      "DOJO creates line sheets, colorway boards, and buyer-ready decks that make it easy to review your collection and compare styles. We combine garment visuals with style numbers, fabric details, available colorways, and key design features. From a single product to a full seasonal range, we tailor each presentation to your brand and the needs of buyer meetings, range reviews, or sales appointments.",
  },
];

export const COLORWAYS = [
  { name: "Midnight Navy", hex: "#1f2a44", spec: "Woven Softshell · Matte" },
  { name: "Stone Taupe", hex: "#7c766d", spec: "Woven Softshell · Recycled Poly" },
  { name: "Fog Grey", hex: "#b8bcc2", spec: "Woven Softshell · Brushed Back" },
  { name: "Ivory", hex: "#e9e3d6", spec: "Woven Softshell · Peached Hand" },
] as const;

export const DEFAULT_COLORWAY_LABEL = `${COLORWAYS[0].name} (${COLORWAYS[0].spec})`;

/** Tech-pack callouts: `anchor` is a key of `designStudio.anchors`. */
export const TECH_CALLOUTS: ReadonlyArray<{ anchor: string; label: string }> = [
  { anchor: "hood", label: "Structured hood · centre-back seam" },
  { anchor: "drawcord", label: "Hood drawcords with toggles" },
  { anchor: "zipper", label: "#5 coil center-front zipper" },
  { anchor: "pocket", label: "Zippered hand pocket" },
  { anchor: "sleeve", label: "Raglan sleeve" },
  { anchor: "cuff", label: "Hook-and-loop cuff tab" },
  { anchor: "hem", label: "Topstitched straight hem" },
];

export const TECHPACK_SPECS: ReadonlyArray<[string, string]> = [
  ["Style", "DJ-HJ-01 Hooded Shell Jacket"],
  ["Season", "FW26 · Outerwear"],
  ["Fit", "Regular · Attached hood"],
  ["Shell", "Woven softshell, raglan"],
];

export const BOM_ROWS: ReadonlyArray<{
  no: number;
  component: string;
  spec: string;
  color: string;
  qty: string;
  anchor: string;
}> = [
  { no: 1, component: "Shell Fabric", spec: "Woven Softshell", color: "#1f2a44", qty: "1.00", anchor: "bomShell" },
  { no: 2, component: "Lining", spec: "Polyester Mesh", color: "#1b2131", qty: "1.00", anchor: "bomLining" },
  { no: 3, component: "Center-Front Zipper", spec: "#5 Coil Zipper", color: "#111316", qty: "1.00", anchor: "bomZipper" },
  { no: 4, component: "Pocket Zippers", spec: "#3 Coil Zipper", color: "#111316", qty: "2.00", anchor: "bomPocketZip" },
  { no: 5, component: "Hood Drawcord", spec: "Cord + Toggle", color: "#0d0f12", qty: "2.00", anchor: "bomDrawcord" },
  { no: 6, component: "Cuff Tab", spec: "Hook & Loop", color: "#0d0f12", qty: "2.00", anchor: "bomCuffTab" },
];

/** Points of measure (cm). `anchor` places the value tag on the 3D dimension line. */
export const POM_ROWS: ReadonlyArray<{
  point: string;
  spec: string;
  tol: string;
  anchor?: string;
}> = [
  { point: "½ Chest (1 cm below armhole)", spec: "56.0", tol: "±1.0", anchor: "pomChest" },
  { point: "Body Length (HPS)", spec: "70.0", tol: "±1.0", anchor: "pomLength" },
  { point: "Sleeve Length (from shoulder)", spec: "63.0", tol: "±1.0", anchor: "pomSleeve" },
  { point: "½ Hem (straight)", spec: "54.0", tol: "±1.0" },
  { point: "Hood Height (HPS to crown)", spec: "36.0", tol: "±1.0" },
];

export const SAMPLING_STATS: ReadonlyArray<[string, string]> = [
  ["Pattern pieces", "14"],
  ["Fit simulation", "Drape + fit"],
  ["Sample rounds", "1 physical"],
];

/** Small annotations shown for the sampling, development and presentation modes. */
export const MODE_TAGS: Partial<
  Record<DesignMode, ReadonlyArray<{ anchor: string; label: string; leader?: boolean }>>
> = {
  sampling: [
    { anchor: "ghost", label: "Digital pattern grid · back", leader: true },
    { anchor: "scan", label: "Drape & fit simulation", leader: true },
  ],
  development: [
    { anchor: "pomChest", label: "½ Chest 56 cm" },
    { anchor: "pomLength", label: "Body length 70 cm" },
    { anchor: "pomSleeve", label: "Sleeve 63 cm" },
    { anchor: "labDips", label: "Lab dips & trims approved", leader: true },
  ],
  presentation: [
    { anchor: "viewFront", label: "Front" },
    { anchor: "viewBack", label: "Back" },
    { anchor: "viewSide", label: "Side" },
  ],
};
