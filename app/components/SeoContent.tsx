import Link from "next/link";
import { expertise, faqs, projects } from "./data";
import { SERVICES, SITE } from "../lib/site";

/**
 * Server-rendered, indexable copy for crawlers and AI agents.
 * Kept visually compact so it does not compete with the interactive hero,
 * while remaining fully readable (not cloaked).
 */
export function HomeSeoContent() {
  return (
    <section
      id="about-dojo"
      aria-labelledby="about-dojo-heading"
      className="border-t border-border bg-surface-deep px-5 py-16 md:px-8 md:py-20"
    >
      <div className="mx-auto max-w-[900px]">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand">
          About {SITE.shortName}
        </p>
        <h2
          id="about-dojo-heading"
          className="mt-3 text-2xl font-extrabold uppercase tracking-[0.06em] text-chrome md:text-3xl"
        >
          {SITE.name}
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
          {SITE.description} Based in {SITE.foundingLocation}, we partner with
          clothing brands and retailers worldwide — covering design, product
          development, sourcing, production follow-up, quality assurance, and
          factory-to-warehouse logistics under one accountable team.
        </p>

        <h3 className="mt-10 text-xs font-bold uppercase tracking-[0.22em] text-brand">
          Services
        </h3>
        <ul className="mt-4 space-y-3">
          {SERVICES.map((service) => (
            <li key={service.name} className="text-sm leading-relaxed text-muted">
              <Link
                href={service.path}
                className="font-semibold text-chrome underline-offset-4 hover:underline"
              >
                {service.name}
              </Link>
              {" — "}
              {service.description}
            </li>
          ))}
        </ul>

        <h3 className="mt-10 text-xs font-bold uppercase tracking-[0.22em] text-brand">
          Supply-chain FAQ
        </h3>
        <dl className="mt-4 space-y-4">
          {faqs.map((faq) => (
            <div key={faq.num}>
              <dt className="text-sm font-bold uppercase tracking-[0.12em] text-chrome">
                {faq.title}
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted">
                {faq.body}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 text-sm text-muted">
          Contact{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="font-semibold text-chrome underline-offset-4 hover:underline"
          >
            {SITE.email}
          </a>{" "}
          or browse the{" "}
          <Link
            href="/showcase"
            className="font-semibold text-chrome underline-offset-4 hover:underline"
          >
            product showcase
          </Link>
          . Machine-readable summary:{" "}
          <a
            href="/llms.txt"
            className="font-semibold text-chrome underline-offset-4 hover:underline"
          >
            llms.txt
          </a>
          .
        </p>
      </div>
    </section>
  );
}

export function ShowcaseSeoContent() {
  return (
    <section
      id="showcase-overview"
      aria-labelledby="showcase-overview-heading"
      className="border-t border-border bg-surface-deep px-5 py-14 md:px-8"
    >
      <div className="mx-auto max-w-[1100px]">
        <h2
          id="showcase-overview-heading"
          className="text-xl font-extrabold uppercase tracking-[0.08em] text-chrome md:text-2xl"
        >
          Apparel capabilities at a glance
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
          {SITE.name} delivers design-to-delivery apparel programs. Below is a
          text summary of showcase builds and core expertise for search engines
          and AI assistants.
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-brand">
              Showcase builds
            </h3>
            <ul className="mt-4 space-y-3">
              {projects.map((project) => (
                <li key={project.title} className="text-sm leading-relaxed text-muted">
                  <span className="font-semibold text-chrome">
                    {project.title}
                  </span>
                  {" — "}
                  {project.summary} MOQ {project.moq}; QC {project.qc}; freight{" "}
                  {project.freight}.
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-brand">
              Expertise
            </h3>
            <ul className="mt-4 space-y-3">
              {expertise.map((item) => (
                <li key={item.id} className="text-sm leading-relaxed text-muted">
                  <span className="font-semibold text-chrome">{item.title}</span>
                  {" — "}
                  {item.body}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
