import { memo } from 'react'

interface Props {
  label: string
  emoji: string
  price: number
  value: number
  onChange: (val: number) => void
}

export default memo(function QuantityStepper({ label, emoji, price, value, onChange }: Props) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <div>
          <div className="font-medium text-wood-dark text-sm">{label}</div>
          <div className="text-xs text-wood">${price}/half-doz</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-full bg-parchment text-wood-dark text-xl font-bold flex items-center justify-center active:bg-wood/20 disabled:opacity-30 select-none touch-manipulation"
          disabled={value === 0}
        >
          -
        </button>
        <span className="w-6 text-center font-bold text-lg text-wood-dark">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-10 h-10 rounded-full bg-olive text-cream text-xl font-bold flex items-center justify-center active:bg-olive-dark select-none touch-manipulation"
        >
          +
        </button>
      </div>
    </div>
  )
})
