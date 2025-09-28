export function EmptyState({ title, desc, action }: { title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-10 text-center">
      <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-surface flex items-center justify-center text-ink-500">☆</div>
      <h3 className="text-lg font-semibold text-ink-500">{title}</h3>
      <p className="mt-1 text-sm text-text-secondary">{desc}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}