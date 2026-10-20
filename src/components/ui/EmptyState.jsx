export function EmptyState({ icon = null, title, description, action = null }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-16 text-center">
      {icon ? (
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
          {icon}
        </span>
      ) : null}
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
