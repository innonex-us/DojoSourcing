import { faqs, expertise, projects } from "../components/data";
import { SERVICES, SITE, SITE_URL } from "./site";

type JsonLd = Record<string, unknown>;

function withContext(data: JsonLd | { "@graph": JsonLd[] }): JsonLd {
  return {
    "@context": "https://schema.org",
    ...data,
  };
}

export function organizationSchema(): JsonLd {
  return {
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: {
      "@type": "ImageObject",
      url: SITE.logo,
    },
    image: SITE.ogImage,
    email: SITE.email,
    description: SITE.description,
    slogan: SITE.tagline,
    foundingLocation: {
      "@type": "Place",
      name: SITE.foundingLocation,
    },
    areaServed: SITE.areaServed.map((name) => ({
      "@type": "Place",
      name,
    })),
    knowsAbout: [
      "Apparel design",
      "Tech packs",
      "3D garment sampling",
      "Cut and sew manufacturing",
      "AQL quality control",
      "Ocean freight logistics",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: SITE.email,
        availableLanguage: ["English"],
        areaServed: "Worldwide",
      },
    ],
    sameAs: SITE.sameAs,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Apparel sourcing services",
      itemListElement: SERVICES.map((service, index) => ({
        "@type": "Offer",
        position: index + 1,
        itemOffered: {
          "@type": "Service",
          name: service.name,
          description: service.description,
          url: `${SITE_URL}${service.path}`,
          provider: { "@id": `${SITE_URL}/#organization` },
          areaServed: "Worldwide",
        },
      })),
    },
  };
}

export function websiteSchema(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE.name,
    description: SITE.description,
    inLanguage: SITE.language,
    publisher: { "@id": `${SITE_URL}/#organization` },
    about: { "@id": `${SITE_URL}/#organization` },
  };
}

export function webPageSchema({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}): JsonLd {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  return {
    "@type": "WebPage",
    "@id": `${url}/#webpage`,
    url,
    name: title,
    description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    inLanguage: SITE.language,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: SITE.ogImage,
    },
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; path: string }>,
): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

export function faqSchema(): JsonLd {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.title
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.body,
      },
    })),
  };
}

export function serviceListSchema(): JsonLd {
  return {
    "@type": "ItemList",
    "@id": `${SITE_URL}/#services`,
    name: "Dojo apparel sourcing services",
    itemListElement: expertise.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: item.title,
        description: item.body,
        provider: { "@id": `${SITE_URL}/#organization` },
        url: `${SITE_URL}/showcase#expertise`,
      },
    })),
  };
}

export function showcaseItemListSchema(): JsonLd {
  return {
    "@type": "ItemList",
    "@id": `${SITE_URL}/showcase#products`,
    name: "Dojo apparel capability showcase",
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: project.title
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        description: project.summary,
        image: `${SITE_URL}${project.image}`,
        brand: { "@id": `${SITE_URL}/#organization` },
        category: project.category,
        additionalProperty: [
          { "@type": "PropertyValue", name: "MOQ", value: project.moq },
          { "@type": "PropertyValue", name: "Spec", value: project.gsm },
          { "@type": "PropertyValue", name: "QC", value: project.qc },
          {
            "@type": "PropertyValue",
            name: "Freight",
            value: project.freight,
          },
        ],
      },
    })),
  };
}

export function homeGraph(): JsonLd {
  return withContext({
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      webPageSchema({
        path: "/",
        title: `${SITE.name} — Apparel Design, Factory Manufacturing & Global Shipment`,
        description: SITE.description,
      }),
      breadcrumbSchema([{ name: "Home", path: "/" }]),
      faqSchema(),
      serviceListSchema(),
    ],
  });
}

export function showcaseGraph(): JsonLd {
  return withContext({
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      webPageSchema({
        path: "/showcase",
        title: "Product Showcase & Apparel Capabilities",
        description:
          "Browse finished apparel builds, MOQ specs, and end-to-end sourcing capabilities from Dojo Design & Sourcing.",
      }),
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Showcase", path: "/showcase" },
      ]),
      showcaseItemListSchema(),
      serviceListSchema(),
    ],
  });
}
