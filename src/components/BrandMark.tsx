/**
 * BrandMark — the AI Builder Atlas logo (Direction 2: stacked catalog bars).
 *
 * Kept as inline SVG (not an <img>) so it inherits color via CSS custom properties
 * and doesn't flash while loading. Size defaults to 36 to match the sidebar slot;
 * pass `size` to override.
 */
interface BrandMarkProps {
  size?: number;
  className?: string;
  /** When true, use the more legible favicon-style proportions (no hairline border). */
  compact?: boolean;
}

export function BrandMark({ size = 36, className, compact = false }: BrandMarkProps) {
  if (compact) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width={size}
        height={size}
        className={className}
        role="img"
        aria-label="AI Builder Atlas"
      >
        <rect width="32" height="32" rx="7" fill="#fafafa" />
        <circle cx="7" cy="10.25" r="1.25" fill="#c8a96e" />
        <rect x="10" y="9" width="12" height="2.5" rx="1.25" fill="#c8a96e" />
        <rect x="10" y="14.75" width="8" height="2.5" rx="1.25" fill="#c8a96e" fillOpacity="0.7" />
        <rect x="10" y="20.5" width="14" height="2.5" rx="1.25" fill="#c8a96e" fillOpacity="0.5" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 36 36"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="AI Builder Atlas"
    >
      <rect
        x="0.5"
        y="0.5"
        width="35"
        height="35"
        rx="9"
        fill="#fafafa"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth="1"
      />
      <circle cx="8" cy="11.75" r="1.25" fill="#c8a96e" />
      <rect x="11" y="10.5" width="13" height="2.5" rx="1.25" fill="#c8a96e" />
      <rect x="11" y="16.5" width="9" height="2.5" rx="1.25" fill="#c8a96e" fillOpacity="0.7" />
      <rect x="11" y="22.5" width="16" height="2.5" rx="1.25" fill="#c8a96e" fillOpacity="0.5" />
    </svg>
  );
}
