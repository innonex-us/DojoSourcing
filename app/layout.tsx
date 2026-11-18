import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { SITE, SITE_URL } from "./lib/site";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#091122" },
    { media: "(prefers-color-scheme: light)", color: "#f4f7fb" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Dojo Design & Sourcing — Apparel Design, Factory Manufacturing & Global Shipment",
    template: "%s | Dojo Design & Sourcing",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "Apparel sourcing",
  classification: "Business",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/dojo-crane-mark.png", type: "image/png" },
    ],
    apple: "/dojo-crane-mark.png",
  },
  alternates: {
    canonical: "/",
    types: {
      "text/plain": "/llms.txt",
    },
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE_URL,
    siteName: SITE.name,
    title:
      "Dojo Design & Sourcing — End-to-End Apparel Design, Manufacturing & Global Shipment",
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Dojo Design & Sourcing — Apparel Design, Manufacturing & Shipment",
    description:
      "Complete end-to-end apparel solution for clothing brands: Design, Factory, Ready to Ship, Cargo Truck, Ocean Ship.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "ai-content": "human-authored",
    "ai:summary": SITE.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <head>
        <link
          rel="alternate"
          type="text/plain"
          href="/llms.txt"
          title="LLM guidance"
        />
        <link rel="author" href="/humans.txt" />
      </head>
      <body className="min-h-full font-sans bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
