import Link from "@docusaurus/Link";
import CodePreview from "@site/src/components/CodePreview";
import FeatureCard from "@site/src/components/FeatureCard";
import Hero from "@site/src/components/Hero";
import Layout from "@theme/Layout";
import type { ReactNode } from "react";

const features = [
  {
    title: "Behavioral Capture",
    description:
      "Capture keystroke dynamics, focus events, and paste detection in real-time during experiments.",
    icon: "⌨️",
  },
  {
    title: "Multiple Analyzers",
    description:
      "Combine evidence from independent analyzers for robust AI-assisted response detection.",
    icon: "🔍",
  },
  {
    title: "Platform Integrations",
    description:
      "Seamless integration with jsPsych, JATOS, and Prolific for end-to-end research workflows.",
    icon: "🔗",
  },
  {
    title: "Real-time Dashboard",
    description:
      "Web-based monitoring with live analysis, session management, and batch operations.",
    icon: "📊",
  },
  {
    title: "Pipeline Orchestration",
    description:
      "Configure aggregation strategies, confidence thresholds, and custom analysis pipelines.",
    icon: "⚙️",
  },
  {
    title: "Extensible Architecture",
    description: "Build custom analyzers and integrate with your existing research infrastructure.",
    icon: "🧩",
  },
];

function Features(): ReactNode {
  return (
    <section className="section-alt py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Features</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to detect AI-assisted responses in your crowdsourced behavioral
            research
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickStart(): ReactNode {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Quick Start</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Get up and running with TypeScript or Python
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <CodePreview />
        </div>
      </div>
    </section>
  );
}

function Documentation(): ReactNode {
  return (
    <section className="section-alt py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Documentation</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Comprehensive guides for both TypeScript and Python packages
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="feature-card rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              TypeScript Packages
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">
              Client-side behavioral capture with @slopit/core, @slopit/behavioral, and platform
              adapters
            </p>
            <Link className="btn-primary inline-block" to="/docs/typescript/intro">
              TypeScript Docs
            </Link>
          </div>
          <div className="feature-card rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">🐍</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              Python Package
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">
              Server-side analysis with analyzers, pipelines, dashboard, and CLI tools
            </p>
            <Link className="btn-primary inline-block" href="https://slopit.github.io/docs/python/">
              Python Docs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function AuthorFooter(): ReactNode {
  return (
    <section className="py-12 border-t border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-6 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Created by{" "}
          <Link
            href="https://aaronstevenwhite.io"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Aaron Steven White
          </Link>
        </p>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="AI Response Detection Toolkit"
      description="A modular toolkit for detecting AI-assisted responses in crowdsourced behavioral research"
    >
      <Hero />
      <main>
        <Features />
        <QuickStart />
        <Documentation />
        <AuthorFooter />
      </main>
    </Layout>
  );
}
