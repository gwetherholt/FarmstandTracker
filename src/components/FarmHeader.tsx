import { memo } from 'react'

interface Props {
  onSettings: () => void
  onHistory: () => void
}

/** Small barn/farm scene SVG illustration */
function FarmScene() {
  return (
    <svg width="60" height="48" viewBox="0 0 60 48" className="flex-shrink-0">
      {/* Sky */}
      {/* Ground */}
      <rect x="0" y="36" width="60" height="12" rx="2" fill="#8BAF7B" opacity="0.25" />
      {/* Barn */}
      <rect x="8" y="20" width="20" height="18" rx="1" fill="#C24444" opacity="0.8" />
      <polygon points="8,20 18,10 28,20" fill="#9B3333" opacity="0.8" />
      {/* Barn door */}
      <rect x="14" y="28" width="8" height="10" rx="1" fill="#8B2E2E" />
      <rect x="14" y="28" width="8" height="1" fill="#A03535" />
      {/* Barn X */}
      <line x1="15" y1="29" x2="21" y2="37" stroke="#A03535" strokeWidth="0.7" />
      <line x1="21" y1="29" x2="15" y2="37" stroke="#A03535" strokeWidth="0.7" />
      {/* Fence */}
      <rect x="30" y="30" width="1" height="8" fill="#B8A080" />
      <rect x="36" y="30" width="1" height="8" fill="#B8A080" />
      <rect x="42" y="30" width="1" height="8" fill="#B8A080" />
      <rect x="30" y="32" width="13" height="1" rx="0.5" fill="#B8A080" />
      <rect x="30" y="35" width="13" height="1" rx="0.5" fill="#B8A080" />
      {/* Sun */}
      <circle cx="52" cy="10" r="5" fill="#F0C96D" opacity="0.6" />
      <circle cx="52" cy="10" r="3.5" fill="#F0C96D" opacity="0.8" />
      {/* Small chicken */}
      <ellipse cx="48" cy="35" rx="3" ry="2.5" fill="#D4A574" />
      <circle cx="50.5" cy="33" r="1.5" fill="#D4A574" />
      <polygon points="52,33 53.5,32.8 52,33.5" fill="#D4943A" />
      <circle cx="51" cy="32.5" r="0.4" fill="#3D3929" />
      {/* Grass tufts */}
      <path d="M2,37 Q3,33 4,37" stroke="#7DA47D" strokeWidth="0.8" fill="none" />
      <path d="M5,37 Q6,34 7,37" stroke="#7DA47D" strokeWidth="0.8" fill="none" />
      <path d="M50,37 Q51,34 52,37" stroke="#7DA47D" strokeWidth="0.8" fill="none" />
      <path d="M55,37 Q56,35 57,37" stroke="#7DA47D" strokeWidth="0.8" fill="none" />
    </svg>
  )
}

/** Decorative egg trio */
function EggDecor() {
  return (
    <svg width="36" height="20" viewBox="0 0 36 20" className="flex-shrink-0">
      <ellipse cx="6" cy="12" rx="4.5" ry="6" fill="#D4A574" opacity="0.6" transform="rotate(-8 6 12)" />
      <ellipse cx="18" cy="11" rx="5" ry="6.5" fill="#B8D4D2" opacity="0.6" />
      <ellipse cx="30" cy="12" rx="4.5" ry="6" fill="#F5F0E8" stroke="#E0D8CA" strokeWidth="0.4" opacity="0.7" transform="rotate(8 30 12)" />
    </svg>
  )
}

export default memo(function FarmHeader({ onSettings, onHistory }: Props) {
  return (
    <header className="px-4 pt-5 pb-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <FarmScene />
          <div>
            <h1 className="font-hand text-3xl font-bold text-wood-dark leading-none">
              Port Orchard
            </h1>
            <div className="flex items-center gap-2">
              <h2 className="font-hand text-xl text-olive leading-none">Farm Stand</h2>
              <EggDecor />
            </div>
          </div>
        </div>
        <div className="flex gap-1.5 mt-1">
          <button
            onClick={onSettings}
            className="text-sm text-wood/50 font-medium w-9 h-9 rounded-lg bg-parchment/60 flex items-center justify-center hover:bg-parchment transition-colors touch-manipulation"
            aria-label="Settings"
          >
            {'\u2699\uFE0F'}
          </button>
          <button
            onClick={onHistory}
            className="text-xs text-olive-dark font-medium px-3 h-9 rounded-lg bg-parchment/60 hover:bg-parchment transition-colors touch-manipulation"
          >
            History
          </button>
        </div>
      </div>
    </header>
  )
})
