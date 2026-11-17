import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Showcase & Apparel Capabilities",
  description:
    "Explore Dojo Sourcing garment builds, 3D tech packs, cut-and-sew production lines, AQL carton packaging, inland trucking, and global ocean freight capabilities.",
  openGraph: {
    title: "Product Showcase & Apparel Capabilities | Dojo Sourcing",
    description:
      "Browse finished apparel builds, MOQ specs, and end-to-end sourcing capabilities.",
  },
};

export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
