export function Footer() {
  return (
    <footer className="border-t border-border px-5 py-16 md:px-8">
      <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-xl font-extrabold uppercase tracking-[0.2em] text-brand">
            DOJO
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            Practice studio for product teams. We design, architect, and ship
            interfaces with editorial precision and engineering discipline.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">
            Company
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li>
              <a href="#work" className="focus-ring transition-colors hover:text-chrome">
                Work
              </a>
            </li>
            <li>
              <a href="#expertise" className="focus-ring transition-colors hover:text-chrome">
                Expertise
              </a>
            </li>
            <li>
              <a href="#contact" className="focus-ring transition-colors hover:text-chrome">
                Contact
              </a>
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
                href="mailto:hello@dojo.dev"
                className="focus-ring transition-colors hover:text-chrome"
              >
                hello@dojo.dev
              </a>
            </li>
            <li>
              <a href="#friction" className="focus-ring transition-colors hover:text-chrome">
                FAQ
              </a>
            </li>
            <li>
              <span>Remote · Worldwide</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 border-t border-border pt-6 text-center text-[11px] uppercase tracking-[0.18em] text-muted">
        ©2026 All rights reserved by DOJO
      </div>
    </footer>
  );
}
