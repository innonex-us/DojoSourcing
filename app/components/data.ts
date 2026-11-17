export const projects = [
  {
    title: "HEAVYWEIGHT OUTERWEAR",
    image: "/images/apparel-outerwear.jpg",
    meta: "Design · Tech Pack",
  },
  {
    title: "3D VIRTUAL ATELIER",
    image: "/images/apparel-atelier.jpg",
    meta: "3D Sampling · Fit",
  },
  {
    title: "CUT & SEW LINE 04",
    image: "/images/apparel-factory.jpg",
    meta: "Factory · CMT / FPP",
  },
  {
    title: "QC & CARTON LAB",
    image: "/images/apparel-cartons.jpg",
    meta: "AQL 2.5 · Packaging",
  },
  {
    title: "INLAND CARGO FLEET",
    image: "/images/apparel-truck.jpg",
    meta: "Drayage · Port Run",
  },
  {
    title: "GLOBAL OCEAN FREIGHT",
    image: "/images/apparel-ship.jpg",
    meta: "FCL / LCL · Delivery",
  },
] as const;

export const expertise = [
  {
    id: "design",
    label: "DESIGN & TECH PACKS",
    title: "Apparel Design & Tech Packs",
    bullet: "From silhouette to factory-ready spec.",
    body: "We translate your brand direction into detailed flat sketches, graded measurement charts, fabric BOMs, and stitch callouts ready for immediate sampling.",
  },
  {
    id: "factory",
    label: "FACTORY PRODUCTION",
    title: "Factory Sourcing & Production",
    bullet: "Vetted mills, ethical lines, predictable output.",
    body: "From fabric knitting and dyeing to cutting, sewing, and finishing — we manage vetted garment factories with transparent milestone tracking.",
  },
  {
    id: "packaging",
    label: "QC & READY TO SHIP",
    title: "Quality Control & Export Packing",
    bullet: "Zero surprises at the warehouse.",
    body: "Every batch passes inline and final AQL inspections, garment steaming, custom polybagging, hang-tagging, and barcode cartonization before dispatch.",
  },
  {
    id: "truck",
    label: "CARGO TRUCKING",
    title: "Inland Cargo & Port Drayage",
    bullet: "Factory gate to export terminal.",
    body: "Sealed cargo trucks pick up finished cartons directly from the factory floor, clear export documentation, and deliver on schedule to the port.",
  },
  {
    id: "ship",
    label: "OCEAN FREIGHT",
    title: "Ocean Ship & Final Delivery",
    bullet: "Smooth sailing to your distribution hub.",
    body: "We coordinate FCL and LCL ocean freight, customs clearance, and final-mile delivery straight to your brand's warehouse or 3PL.",
  },
] as const;

export const faqs = [
  {
    num: "01",
    title: "SAMPLING DELAYS",
    body: "Endless back-and-forth with factories wastes entire seasons. Our 3D prototyping and standardized tech packs cut physical sample rounds in half.",
  },
  {
    num: "02",
    title: "FACTORY COMMUNICATION",
    body: "Language and technical gaps cause costly production errors. Our on-ground merchandisers and QA teams manage every stitch and fabric test for you.",
  },
  {
    num: "03",
    title: "QUALITY CONSISTENCY",
    body: "We enforce inline inspections and final AQL 2.5 audits before a single carton is sealed — ensuring your bulk run matches the approved gold sample.",
  },
  {
    num: "04",
    title: "LOGISTICS & CUSTOMS",
    body: "Coordinating truckers, freight forwarders, and customs brokers is overwhelming. We handle factory-to-port trucking and ocean shipment under one roof.",
  },
  {
    num: "05",
    title: "SINGLE PARTNER ACCOUNTABILITY",
    body: "Instead of juggling 5 vendors, you get one dedicated team from initial garment design all the way to container arrival.",
  },
] as const;

export const interestChips = [
  "COMPLETE END-TO-END",
  "DESIGN & TECH PACK",
  "3D SAMPLING",
  "FACTORY PRODUCTION",
  "QC & PACKAGING",
  "CARGO & GLOBAL FREIGHT",
] as const;

export type HeroCard =
  | {
      kind: "photo";
      src: string;
      alt: string;
      label?: string;
      rotate: number;
      x: string;
      y: string;
      z: number;
      w: string;
      delay: number;
      mobile?: boolean;
    }
  | {
      kind: "graphic";
      label: string;
      sub?: string;
      rotate: number;
      x: string;
      y: string;
      z: number;
      w: string;
      delay: number;
      mobile?: boolean;
    };

export const heroCards: HeroCard[] = [
  {
    kind: "photo",
    src: "/images/hero-card-1.jpg",
    alt: "Workshop glow",
    rotate: -18,
    x: "6%",
    y: "12%",
    z: 2,
    w: "min(180px,22vw)",
    delay: 0.05,
    mobile: true,
  },
  {
    kind: "graphic",
    label: "PRACTICE",
    sub: "DAILY",
    rotate: 14,
    x: "78%",
    y: "10%",
    z: 3,
    w: "min(160px,20vw)",
    delay: 0.1,
    mobile: true,
  },
  {
    kind: "photo",
    src: "/images/hero-card-2.jpg",
    alt: "Sketching under lamp",
    rotate: 22,
    x: "12%",
    y: "58%",
    z: 4,
    w: "min(170px,21vw)",
    delay: 0.15,
    mobile: true,
  },
  {
    kind: "graphic",
    label: "BUILD",
    sub: "HARD",
    rotate: -12,
    x: "70%",
    y: "62%",
    z: 2,
    w: "min(150px,19vw)",
    delay: 0.18,
    mobile: true,
  },
  {
    kind: "photo",
    src: "/images/hero-card-3.jpg",
    alt: "Brutalist light",
    rotate: -26,
    x: "82%",
    y: "38%",
    z: 1,
    w: "min(155px,18vw)",
    delay: 0.22,
  },
  {
    kind: "photo",
    src: "/images/hero-card-4.jpg",
    alt: "Server glow",
    rotate: 8,
    x: "2%",
    y: "34%",
    z: 1,
    w: "min(145px,17vw)",
    delay: 0.25,
  },
  {
    kind: "graphic",
    label: "SHIP",
    sub: "NOW",
    rotate: -8,
    x: "48%",
    y: "8%",
    z: 1,
    w: "min(140px,16vw)",
    delay: 0.28,
  },
  {
    kind: "photo",
    src: "/images/project-neural.jpg",
    alt: "Neural interface",
    rotate: 16,
    x: "58%",
    y: "72%",
    z: 3,
    w: "min(165px,20vw)",
    delay: 0.3,
  },
  {
    kind: "graphic",
    label: "LAB",
    sub: "01",
    rotate: 28,
    x: "28%",
    y: "18%",
    z: 2,
    w: "min(130px,15vw)",
    delay: 0.32,
  },
  {
    kind: "photo",
    src: "/images/project-signal.jpg",
    alt: "Signal kit",
    rotate: -20,
    x: "38%",
    y: "68%",
    z: 1,
    w: "min(150px,18vw)",
    delay: 0.35,
  },
  {
    kind: "graphic",
    label: "FOCUS",
    rotate: 6,
    x: "88%",
    y: "70%",
    z: 2,
    w: "min(135px,16vw)",
    delay: 0.38,
  },
  {
    kind: "photo",
    src: "/images/project-forge.jpg",
    alt: "Forge terminal",
    rotate: -14,
    x: "22%",
    y: "78%",
    z: 2,
    w: "min(140px,17vw)",
    delay: 0.4,
  },
  {
    kind: "graphic",
    label: "CRAFT",
    sub: "MODE",
    rotate: -24,
    x: "64%",
    y: "24%",
    z: 4,
    w: "min(145px,17vw)",
    delay: 0.42,
    mobile: true,
  },
  {
    kind: "photo",
    src: "/images/project-pulse.jpg",
    alt: "Pulse waves",
    rotate: 12,
    x: "4%",
    y: "72%",
    z: 3,
    w: "min(155px,18vw)",
    delay: 0.45,
  },
];

export const partnerTiles = [
  { name: "MILAN ATELIER", bg: "#18181b", fg: "#ffffff" },
  { name: "DHAKA MILLS", bg: "#262335", fg: "#e4e2df" },
  { name: "ROTTERDAM PORT", bg: "#fe4101", fg: "#ffffff" },
  { name: "TOKYO DENIM", bg: "#1e1b4b", fg: "#e4e2df" },
  { name: "PORTO KNITS", bg: "#2a2422", fg: "#fe4101" },
  { name: "LOS ANGELES 3PL", bg: "#e4e2df", fg: "#120f0e" },
  { name: "HAMBURG CARGO", bg: "#18181b", fg: "#fe4101" },
  { name: "BUSAN TERMINAL", bg: "#3b1d14", fg: "#fcc3ae" },
  { name: "NY SHOWROOM", bg: "#14261c", fg: "#e4e2df" },
  { name: "ANTWERP FREIGHT", bg: "#120f0e", fg: "#ffffff" },
] as const;

export const expertiseMedia = [
  "/images/apparel-atelier.jpg",
  "/images/apparel-factory.jpg",
  "/images/apparel-cartons.jpg",
  "/images/apparel-truck.jpg",
  "/images/apparel-ship.jpg",
] as const;
