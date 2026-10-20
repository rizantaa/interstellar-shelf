export function Tabs({ tabs, value, onChange, label = 'Catalog type' }) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-full border border-line bg-surface p-1"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition ${
              isActive
                ? 'bg-accent text-accent-ink'
                : 'text-muted hover:bg-surface-2 hover:text-ink'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
