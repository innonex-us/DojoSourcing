import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dojosourcing.com"),
  title: {
    default:
      "Dojo Sourcing — Apparel Design, Factory Manufacturing & Global Shipment",
    template: "%s | Dojo Sourcing",
  },
  description:
    "Dojo Sourcing is a complete end-to-end clothing brand partner — from 3D garment design and tech packs to vetted factory production, AQL quality control, cargo trucking, and ocean freight.",
  keywords: [
    "Dojo Sourcing",
    "apparel sourcing",
    "clothing brand manufacturing",
    "garment tech pack design",
    "3D virtual garment sampling",
    "cut and sew factory",
    "AQL 2.5 apparel inspection",
    "global garment ocean freight",
  ],
  authors: [{ name: "Dojo Sourcing" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/dojo-crane-mark.png", type: "image/png" },
    ],
    apple: "/dojo-crane-mark.png",
  },
  openGraph: {
    type: "website",
    siteName: "Dojo Sourcing",
    title:
      "Dojo Sourcing — End-to-End Apparel Design, Manufacturing & Global Shipment",
    description:
      "Complete apparel production pipeline for clothing brands: 3D garment design, factory manufacturing, AQL packing, inland trucking, and ocean freight.",
    images: [
      {
        url: "/images/apparel-outerwear.jpg",
        width: 1200,
        height: 1600,
        alt: "Dojo Sourcing Apparel Design & Manufacturing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dojo Sourcing — Apparel Design, Manufacturing & Shipment",
    description:
      "Complete end-to-end apparel solution for clothing brands: Design, Factory, Ready to Ship, Cargo Truck, Ocean Ship.",
    images: ["/images/apparel-outerwear.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Dojo Sourcing",
  url: "https://dojosourcing.com",
  logo: "https://dojosourcing.com/dojo-sourcing-logo.png",
  email: "sourcing@dojosourcing.com",
  description:
    "Complete end-to-end apparel sourcing, garment design, factory production, quality control, and global logistics for clothing brands.",
  serviceType: [
    "Apparel Design & Tech Packs",
    "3D Virtual Garment Sampling",
    "Garment Factory Manufacturing",
    "AQL Quality Control & Export Packaging",
    "Cargo Trucking & Global Ocean Freight",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        {children}
      </body>
    </html>
  );
}
