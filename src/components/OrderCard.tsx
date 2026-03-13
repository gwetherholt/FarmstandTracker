import { memo, useState, useCallback } from 'react'
import type { Order } from '../types'
import { calculateOrderTotal } from '../utils/pricing'
import { togglePickedUp, toggleCartonReturn, deleteOrder } from '../hooks/useOrders'

interface Props {
  order: Order
  onEdit: (order: Order) => void
}

export default memo(function OrderCard({ order, onEdit }: Props) {
  const [showActions, setShowActions] = useState(false)
  const total = calculateOrderTotal(order.items, order.cartonReturn)

  const handleDelete = useCallback(() => {
    if (confirm(`Delete order for ${order.customerName}?`)) {
      deleteOrder(order.id!)
    }
  }, [order.id, order.customerName])

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border transition-all ${
        order.pickedUp ? 'border-sage/50 opacity-75' : 'border-wood/10'
      }`}
      onClick={() => setShowActions(!showActions)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className={`font-serif text-lg font-semibold truncate ${
              order.pickedUp ? 'text-sage line-through' : 'text-wood-dark'
            }`}>
              {order.customerName}
            </h4>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-wood">
              {order.items.chicken > 0 && (
                <span>{'\u{1F414}'} {order.items.chicken} &times; half-doz</span>
              )}
              {order.items.duck > 0 && (
                <span>{'\u{1F986}'} {order.items.duck} &times; half-doz</span>
              )}
              {order.items.goose > 0 && (
                <span>{'\u{1FABF}'} {order.items.goose} &times; half-doz</span>
              )}
            </div>
            {order.notes && (
              <p className="text-xs text-wood/70 mt-1 italic">{order.notes}</p>
            )}
          </div>
          <div className="text-right ml-3 flex-shrink-0">
            <div className="font-bold text-olive-dark text-lg">${total}</div>
            <div className="text-xs text-wood/60">
              {order.paymentMethod === 'venmo' ? 'Venmo' : 'Lockbox'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-wood/10">
          <button
            onClick={(e) => {
              e.stopPropagation()
              togglePickedUp(order.id!, order.pickedUp)
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
              order.pickedUp
                ? 'bg-sage/20 text-sage'
                : 'bg-olive/10 text-olive-dark'
            }`}
          >
            {order.pickedUp ? '\u2705 Picked Up' : '\u{1F4E6} Mark Picked Up'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleCartonReturn(order.id!, order.cartonReturn)
            }}
            className={`py-2 px-3 rounded-lg text-sm transition-colors touch-manipulation ${
              order.cartonReturn
                ? 'bg-amber/20 text-amber'
                : 'bg-wood/5 text-wood/60'
            }`}
            title="Carton returned"
          >
            {'\u267B\uFE0F'}
          </button>
        </div>

        {showActions && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(order)
              }}
              className="flex-1 py-2 bg-parchment text-wood-dark rounded-lg text-sm font-medium touch-manipulation"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              className="py-2 px-4 bg-barn/10 text-barn rounded-lg text-sm font-medium touch-manipulation"
            >
              {'\u{1F5D1}\uFE0F'} Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
})
