/** Hand-illustrated SVG egg icons for chicken, duck, and goose */

interface EggProps {
  size?: number
  className?: string
}

/** Brown speckled chicken egg */
export function ChickenEgg({ size = 32, className = '' }: EggProps) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 32 40" className={className}>
      <ellipse cx="16" cy="22" rx="12" ry="16" fill="#D4A574" />
      <ellipse cx="16" cy="22" rx="12" ry="16" fill="url(#chicken-grad)" />
      {/* Speckles */}
      <circle cx="10" cy="17" r="0.8" fill="#B8895A" opacity="0.5" />
      <circle cx="20" cy="14" r="0.6" fill="#B8895A" opacity="0.4" />
      <circle cx="14" cy="27" r="0.7" fill="#B8895A" opacity="0.45" />
      <circle cx="22" cy="24" r="0.5" fill="#B8895A" opacity="0.35" />
      <circle cx="12" cy="32" r="0.6" fill="#B8895A" opacity="0.4" />
      <circle cx="18" cy="20" r="0.5" fill="#B8895A" opacity="0.3" />
      {/* Highlight */}
      <ellipse cx="13" cy="16" rx="4" ry="5" fill="white" opacity="0.15" />
      <defs>
        <radialGradient id="chicken-grad" cx="0.4" cy="0.35">
          <stop offset="0%" stopColor="#E8C09A" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#C4935E" stopOpacity="0.2" />
        </radialGradient>
      </defs>
    </svg>
  )
}

/** Blue-green duck egg */
export function DuckEgg({ size = 32, className = '' }: EggProps) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 32 40" className={className}>
      <ellipse cx="16" cy="22" rx="12.5" ry="16" fill="#B8D4D2" />
      <ellipse cx="16" cy="22" rx="12.5" ry="16" fill="url(#duck-grad)" />
      {/* Subtle color variation */}
      <ellipse cx="14" cy="20" rx="6" ry="8" fill="#C8E0DE" opacity="0.3" />
      {/* Highlight */}
      <ellipse cx="12" cy="15" rx="4" ry="6" fill="white" opacity="0.2" />
      <defs>
        <radialGradient id="duck-grad" cx="0.4" cy="0.35">
          <stop offset="0%" stopColor="#D0E8E6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#9CC0BC" stopOpacity="0.15" />
        </radialGradient>
      </defs>
    </svg>
  )
}

/** Large white goose egg */
export function GooseEgg({ size = 32, className = '' }: EggProps) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 32 42" className={className}>
      <ellipse cx="16" cy="23" rx="13" ry="17" fill="#F5F0E8" />
      <ellipse cx="16" cy="23" rx="13" ry="17" fill="url(#goose-grad)" />
      <ellipse cx="16" cy="23" rx="13" ry="17" stroke="#E0D8CA" strokeWidth="0.5" fill="none" />
      {/* Highlight */}
      <ellipse cx="12" cy="16" rx="5" ry="7" fill="white" opacity="0.35" />
      <defs>
        <radialGradient id="goose-grad" cx="0.4" cy="0.3">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#E8DFD0" stopOpacity="0.2" />
        </radialGradient>
      </defs>
    </svg>
  )
}

/** Tiny inline egg icon for order cards / lists */
export function EggDot({ type, size = 14 }: { type: 'chicken' | 'duck' | 'goose'; size?: number }) {
  const colors = {
    chicken: { fill: '#D4A574', stroke: '#C49060' },
    duck: { fill: '#B8D4D2', stroke: '#9CC0BC' },
    goose: { fill: '#F5F0E8', stroke: '#E0D8CA' },
  }
  const c = colors[type]
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 14 17" className="inline-block align-middle" style={{ marginTop: -2 }}>
      <ellipse cx="7" cy="9.5" rx="5.5" ry="7" fill={c.fill} stroke={c.stroke} strokeWidth="0.5" />
      <ellipse cx="5.5" cy="7" rx="2" ry="3" fill="white" opacity="0.2" />
    </svg>
  )
}
