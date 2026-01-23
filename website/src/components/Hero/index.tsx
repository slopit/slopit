import Link from "@docusaurus/Link";
import Logo from "@site/src/components/Logo";
import type { ReactNode } from "react";

export default function Hero(): ReactNode {
  return (
    <header className="hero-section py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="logo-glow mb-10">
            <Logo size="xl" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
            slopit
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl leading-relaxed">
            A modular toolkit for detecting AI-assisted responses in crowdsourced behavioral
            research
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link className="btn-primary text-center" to="/docs/typescript/intro">
              Get Started
            </Link>
            <Link className="btn-secondary text-center" href="https://github.com/slopit/slopit">
              View on GitHub
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
