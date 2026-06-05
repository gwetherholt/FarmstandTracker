import { memo } from 'react'
import type { Order } from '../types'
import { calculatePrepSummary } from '../utils/pricing'
import { useProductMap } from '../hooks/useProducts'

interface Props {
  orders: Order[]
}

export default memo(function PrepSummary({ orders }: Props) {
  const productMap = useProductMap()
  const summary = calculatePrepSummary(orders, productMap)

  if (orders.length === 0) {
    return (
      <div className="bg-parchment/70 rounded-xl p-4 text-center text-wood italic font-hand text-lg">
        No orders yet
      </div>
    )
  }

  return (
    <div className="bg-parchment/70 rounded-xl p-4 space-y-3">
      <h3 className="font-hand text-2xl text-wood-dark font-bold leading-none">Prep Summary</h3>
      <div className="grid grid-cols-3 gap-2 text-center">
        {summary.lines.map((line) => (
          <div key={line.key} className="bg-cream rounded-lg p-2">
            <div className="text-2xl">{line.product.emoji}</div>
            <div className="font-bold text-wood-dark mt-1">{line.qty}</div>
            <div className="text-xs text-wood">
              {line.product.unit}
              {line.product.unit === 'half-doz' && ` (${line.qty * 6} eggs)`}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-sm border-t border-wood/15 pt-2">
        <span className="text-wood">
          {summary.orderCount} order{summary.orderCount !== 1 ? 's' : ''} &middot;{' '}
          {summary.pickedUpCount} picked up
        </span>
        <span className="font-bold text-olive-dark">${summary.revenue}</span>
      </div>
    </div>
  )
})
