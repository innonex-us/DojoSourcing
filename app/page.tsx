import type { Metadata } from "next";
import { Landing } from "./components/Landing";
import { HomeSeoContent } from "./components/SeoContent";
import { JsonLd } from "./components/JsonLd";
import { SITE } from "./lib/site";
import { homeGraph } from "./lib/structured-data";

export const metadata: Metadata = {
  title: {
    absolute:
      "Dojo Design & Sourcing — Apparel Design, Factory Manufacturing & Global Shipment",
  },
  description: SITE.description,
  alternates: {
    canonical: "/",
    types: {
      "text/plain": [
        { url: "/llms.txt", title: "LLM summary" },
        { url: "/llms-full.txt", title: "LLM full context" },
      ],
    },
  },
  openGraph: {
    url: "/",
    title:
      "Dojo Design & Sourcing — End-to-End Apparel Design, Manufacturing & Global Shipment",
    description: SITE.description,
  },
};

export default function Home() {
  return (
    <>
      <JsonLd data={homeGraph()} />
      <Landing seoSlot={<HomeSeoContent />} />
    </>
  );
}
