export const projects = [
  {
    title: "NEURAL DASHBOARD",
    image: "/images/project-neural.jpg",
    meta: "Analytics · Product",
  },
  {
    title: "ATELIER OS",
    image: "/images/project-atelier.jpg",
    meta: "Platform · Systems",
  },
  {
    title: "SIGNAL KIT",
    image: "/images/project-signal.jpg",
    meta: "Design System",
  },
  {
    title: "FORGE CLI",
    image: "/images/project-forge.jpg",
    meta: "Developer Tools",
  },
  {
    title: "CANVAS OPS",
    image: "/images/project-canvas.jpg",
    meta: "Creative Ops",
  },
  {
    title: "PULSE PROTOCOL",
    image: "/images/project-pulse.jpg",
    meta: "Motion · AI",
  },
] as const;

export const expertise = [
  {
    id: "product",
    label: "PRODUCT DESIGN",
    title: "Product Design",
    bullet: "Clarity under pressure.",
    body: "We shape product surfaces that feel inevitable — from early discovery frames to launch-ready flows. Every decision maps to a measurable shipping outcome.",
  },
  {
    id: "motion",
    label: "MOTION SYSTEMS",
    title: "Motion Systems",
    bullet: "Motion with intention.",
    body: "Timelines, scroll choreography, and micro-interactions that reinforce hierarchy instead of decorating it. Built for performance and reduced-motion paths.",
  },
  {
    id: "frontend",
    label: "FRONTEND ARCHITECTURE",
    title: "Frontend Architecture",
    bullet: "Structure that scales.",
    body: "Component systems, routing strategy, and performance budgets that keep creative interfaces maintainable as the product grows.",
  },
  {
    id: "systems",
    label: "DESIGN SYSTEMS",
    title: "Design Systems",
    bullet: "Tokens that travel.",
    body: "Language, density, and interaction rules shared across product, marketing, and tooling — so teams stop renegotiating the basics every sprint.",
  },
  {
    id: "ai",
    label: "AI WORKFLOWS",
    title: "AI Workflows",
    bullet: "Assistive, not noisy.",
    body: "Practical AI integrations for research synthesis, content ops, and design acceleration — always with human review in the loop.",
  },
] as const;

export const faqs = [
  {
    num: "01",
    title: "SHIP VELOCITY",
    body: "Teams stall between Figma and production. We collapse the gap with shared primitives, motion specs, and a build cadence that favors shipping over ceremony.",
  },
  {
    num: "02",
    title: "DESIGN DEBT",
    body: "Inconsistent patterns compound quietly. We audit the surface, define a tighter system, and migrate high-traffic paths first so debt stops leaking into every feature.",
  },
  {
    num: "03",
    title: "HANDOFF FRICTION",
    body: "Pixel leftovers and vague annotations create rework. Our process pairs designers and engineers on the same artifacts — tokens, states, and acceptance criteria.",
  },
  {
    num: "04",
    title: "DIRECTION DRIFT",
    body: "Without a clear product thesis, every sprint invents a new aesthetic. We lock a directional north star and pressure-test it against real user journeys.",
  },
  {
    num: "05",
    title: "MOTION OVERLOAD",
    body: "Animation without hierarchy feels noisy. We define a motion language with timing, easing, and reduced-motion fallbacks so energy never costs clarity.",
  },
] as const;

export const interestChips = [
  "PRODUCT LAUNCH",
  "REDESIGN",
  "DESIGN SYSTEM",
  "MOTION",
  "AI INTEGRATION",
  "OTHER",
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
  { name: "VERCEL", bg: "#18181b", fg: "#ffffff" },
  { name: "LINEAR", bg: "#262335", fg: "#e4e2df" },
  { name: "FIGMA", bg: "#fe4101", fg: "#ffffff" },
  { name: "STRIPE", bg: "#1e1b4b", fg: "#e4e2df" },
  { name: "RAYCAST", bg: "#2a2422", fg: "#fe4101" },
  { name: "NOTION", bg: "#e4e2df", fg: "#120f0e" },
  { name: "FRAMER", bg: "#18181b", fg: "#fe4101" },
  { name: "ARC", bg: "#3b1d14", fg: "#fcc3ae" },
  { name: "SUPABASE", bg: "#14261c", fg: "#e4e2df" },
  { name: "RESEND", bg: "#120f0e", fg: "#ffffff" },
] as const;

export const expertiseMedia = [
  "/images/project-atelier.jpg",
  "/images/project-pulse.jpg",
  "/images/project-forge.jpg",
  "/images/project-signal.jpg",
  "/images/project-neural.jpg",
] as const;
