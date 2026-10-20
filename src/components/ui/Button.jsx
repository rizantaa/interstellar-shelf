const VARIANTS = {
  primary: 'bg-accent text-accent-ink hover:brightness-110 active:brightness-95',
  outline: 'border border-line bg-surface text-ink hover:bg-surface-2',
  ghost: 'text-muted hover:bg-surface-2 hover:text-ink',
}

const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  icon: 'h-10 w-10 justify-center',
}

/**
 * Renders a <button> by default. Pass `as={Link}` (plus `to`) or `as="a"` to reuse
 * the same styling for navigation without nesting interactive elements.
 */
export function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const classes = [
    'inline-flex items-center rounded-full font-medium transition',
    'disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <Tag className={classes} {...props} />
}
