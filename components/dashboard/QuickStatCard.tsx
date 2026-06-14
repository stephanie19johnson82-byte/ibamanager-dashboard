import { LucideIcon } from "lucide-react";

interface QuickStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  accent: string;
}

export default function QuickStatCard({ icon: Icon, label, value, accent }: QuickStatCardProps) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-bml-surface p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-glass">
      <div className="flex items-center justify-between gap-3">
        <Icon className={`h-7 w-7 text-${accent}`} />
        <span className="rounded-2xl bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-blue-300">Live</span>
      </div>
      <div className="mt-6">
        <p className="text-4xl font-semibold text-white">{value}</p>
        <p className="mt-2 text-sm text-bml-muted">{label}</p>
      </div>
    </div>
  );
}
