interface NewsCardProps {
  title: string;
  summary: string;
  category: string;
  date: string;
}

export default function NewsCard({ title, summary, category, date }: NewsCardProps) {
  return (
    <article className="rounded-[20px] border border-white/10 bg-bml-surface p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-glass">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm uppercase tracking-[0.25em] text-blue-300">{category}</p>
        <span className="text-xs text-bml-muted">{date}</span>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-bml-muted">{summary}</p>
    </article>
  );
}
