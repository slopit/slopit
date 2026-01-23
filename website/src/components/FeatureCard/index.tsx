import type { ReactNode } from "react";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
};

export default function FeatureCard({ title, description, icon }: FeatureCardProps): ReactNode {
  return (
    <div className="feature-card rounded-xl p-6">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
