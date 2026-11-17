import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border px-5 py-16 md:px-8">
      <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 items-center justify-center rounded-full bg-white px-2.5 shadow-sm">
              <Image
                src="/dojo-sourcing-logo.png"
                alt="Dojo Sourcing logo"
                width={60}
                height={20}
                className="h-5 w-[60px] object-contain"
              />
            </span>
            <p className="text-lg font-extrabold uppercase tracking-[0.18em] text-chrome">
              Dojo <span className="text-brand">Sourcing</span>
            </p>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            End-to-end apparel sourcing and global logistics for clothing brands
            — from 3D garment design and tech packs to factory production,
            cargo trucking, and ocean freight.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">
            Pipeline
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li>
              <Link href="/#journey" className="focus-ring transition-colors hover:text-chrome">
                3D Supply Journey
              </Link>
            </li>
            <li>
              <Link href="/#estimator" className="focus-ring transition-colors hover:text-chrome">
                Run Estimator
              </Link>
            </li>
            <li>
              <Link href="/showcase" className="focus-ring transition-colors hover:text-chrome">
                Product Showcase
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">
            Support
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li>
              <a
                href="mailto:sourcing@dojosourcing.com"
                className="focus-ring transition-colors hover:text-chrome"
              >
                sourcing@dojosourcing.com
              </a>
            </li>
            <li>
              <Link href="/showcase#expertise" className="focus-ring transition-colors hover:text-chrome">
                Capabilities
              </Link>
            </li>
            <li>
              <Link href="/#friction" className="focus-ring transition-colors hover:text-chrome">
                Supply Chain FAQ
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 border-t border-border pt-6 text-center text-[11px] uppercase tracking-[0.18em] text-muted">
        ©2026 All rights reserved by Dojo Sourcing
      </div>
    </footer>
  );
}
