import type { Metadata } from "next";
import { JsonLd } from "../components/JsonLd";
import { SITE } from "../lib/site";
import { showcaseGraph } from "../lib/structured-data";

export const metadata: Metadata = {
  title: "Product Showcase & Apparel Capabilities",
  description:
    "Explore Dojo Design & Sourcing garment builds, 3D tech packs, cut-and-sew production lines, AQL carton packaging, inland trucking, and global ocean freight capabilities.",
  keywords: [
    ...SITE.keywords,
    "apparel product showcase",
    "garment MOQ specs",
    "cut and sew capabilities",
  ],
  alternates: {
    canonical: "/showcase",
  },
  openGraph: {
    url: "/showcase",
    title: "Product Showcase & Apparel Capabilities | Dojo Design & Sourcing",
    description:
      "Browse finished apparel builds, MOQ specs, and end-to-end sourcing capabilities.",
  },
  twitter: {
    title: "Product Showcase | Dojo Design & Sourcing",
    description:
      "Garment builds, factory lines, AQL packing, trucking, and ocean freight capabilities.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={showcaseGraph()} />
      {children}
    </>
  );
}
