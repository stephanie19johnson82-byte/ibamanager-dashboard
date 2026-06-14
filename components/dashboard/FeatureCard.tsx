import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  cta: string;
}

export default function FeatureCard({ icon: Icon, title, description, href, cta }: FeatureCardProps) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-bml-surface p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-glass">
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-500/15 text-blue-300">
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-sm text-bml-muted">Featured</span>
      </div>
      <div className="mt-6 space-y-3">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-sm leading-6 text-bml-muted">{description}</p>
      </div>
      <Link href={href} className="mt-6 inline-flex items-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
        {cta}
      </Link>
    </div>
  );
}
