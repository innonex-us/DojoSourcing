export const SITE_URL = "https://dojosourcing.com" as const;

export const SITE = {
  name: "Dojo Design & Sourcing",
  shortName: "Dojo",
  legalName: "Dojo Design & Sourcing",
  tagline: "End-to-end apparel design, manufacturing & global shipment",
  description:
    "Dojo Design & Sourcing is a Bangladesh-based complete end-to-end clothing brand partner — from 3D garment design and tech packs to vetted factory production, AQL quality control, cargo trucking, and ocean freight.",
  locale: "en_US",
  language: "en",
  email: "sourcing@dojosourcing.com",
  url: SITE_URL,
  logo: `${SITE_URL}/dojo-sourcing-logo.png`,
  mark: `${SITE_URL}/dojo-crane-mark.png`,
  ogImage: `${SITE_URL}/hero-poster.jpg`,
  sameAs: [] as string[],
  areaServed: ["Worldwide", "United States", "European Union", "United Kingdom", "APAC"],
  foundingLocation: "Bangladesh",
  keywords: [
    "Dojo Design & Sourcing",
    "apparel sourcing Bangladesh",
    "clothing brand manufacturing",
    "garment tech pack design",
    "3D virtual garment sampling",
    "cut and sew factory",
    "AQL 2.5 apparel inspection",
    "global garment ocean freight",
    "end-to-end apparel production",
    "fashion brand sourcing partner",
  ],
} as const;

export const SERVICES = [
  {
    name: "Apparel Design & Tech Packs",
    description:
      "Flat sketches, graded measurement charts, fabric BOMs, stitch callouts, and factory-ready tech packs.",
    path: "/#journey",
  },
  {
    name: "3D Virtual Garment Sampling",
    description:
      "Photorealistic 3D fit rounds, Pantone lab-dip matching, and seam construction specs before physical cutting.",
    path: "/#journey",
  },
  {
    name: "Factory Sourcing & Production",
    description:
      "Vetted knit and fleece cut-and-sew factories with transparent milestone tracking from dyeing to finishing.",
    path: "/showcase#expertise",
  },
  {
    name: "AQL Quality Control & Export Packaging",
    description:
      "Inline and final AQL 2.5 inspections, steaming, polybagging, hang-tagging, and barcode cartonization.",
    path: "/showcase#expertise",
  },
  {
    name: "Inland Cargo Trucking & Port Drayage",
    description:
      "Sealed container trucking from factory loading dock through export customs to the terminal.",
    path: "/showcase#expertise",
  },
  {
    name: "Ocean Freight & Final Delivery",
    description:
      "FCL and LCL ocean freight, customs clearance, and door-to-warehouse delivery into US, EU, UK, and APAC hubs.",
    path: "/showcase#expertise",
  },
] as const;

export const NAV_ROUTES = [
  {
    path: "/",
    title: "Home",
    description: SITE.description,
    changeFrequency: "weekly" as const,
    priority: 1,
  },
  {
    path: "/showcase",
    title: "Product Showcase & Apparel Capabilities",
    description:
      "Explore Dojo Design & Sourcing garment builds, 3D tech packs, cut-and-sew production lines, AQL carton packaging, inland trucking, and global ocean freight capabilities.",
    changeFrequency: "weekly" as const,
    priority: 0.9,
  },
] as const;
