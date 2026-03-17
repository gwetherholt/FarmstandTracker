import { memo, useState, useCallback } from 'react'
import type { Order } from '../types'
import { calculateOrderTotal } from '../utils/pricing'
import { togglePickedUp, deleteOrder, toggleRecurring } from '../hooks/useOrders'

interface Props {
  order: Order
  onEdit: (order: Order) => void
}

export default memo(function OrderCard({ order, onEdit }: Props) {
  const [confirming, setConfirming] = useState(false)
  const total = calculateOrderTotal(order.items)

  const handleDelete = useCallback(() => {
    deleteOrder(order.id!)
    setConfirming(false)
  }, [order.id])

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border ${
        order.pickedUp ? 'border-sage/50 opacity-75' : 'border-wood/10'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0" onClick={() => onEdit(order)}>
            <div className="flex items-center gap-2">
              <h4 className={`font-serif text-lg font-semibold truncate ${
                order.pickedUp ? 'text-sage line-through' : 'text-wood-dark'
              }`}>
                {order.customerName}
              </h4>
              {order.sourceOrderId && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-olive/10 text-olive flex-shrink-0">
                  {'\u{1F501}'} recurring
                </span>
              )}
            </div>
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
          <div className="flex items-start gap-2 ml-3 flex-shrink-0">
            <div className="text-right">
              <div className="font-bold text-olive-dark text-lg">${total}</div>
              {order.paymentMethod && (
                <div className="text-xs text-wood/60">
                  {order.paymentMethod === 'venmo' ? 'Venmo' : 'Lockbox'}
                </div>
              )}
            </div>
            <button
              onClick={() => setConfirming(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-barn/40 hover:text-barn hover:bg-barn/10 transition-colors touch-manipulation"
              aria-label="Delete order"
            >
              {'\u{1F5D1}\uFE0F'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-wood/10">
          <button
            onClick={() => togglePickedUp(order.id!, order.pickedUp)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
              order.pickedUp
                ? 'bg-sage/20 text-sage'
                : 'bg-olive/10 text-olive-dark'
            }`}
          >
            {order.pickedUp ? '\u2705 Picked Up' : '\u{1F4E6} Mark Picked Up'}
          </button>
          <button
            onClick={() => toggleRecurring(order.id!, !!order.recurring)}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
              order.recurring
                ? 'bg-olive/15 text-olive-dark'
                : 'bg-wood/5 text-wood/50'
            }`}
            title={order.recurring ? 'Repeats weekly — tap to stop' : 'Tap to repeat weekly'}
          >
            {'\u{1F501}'}{order.recurring ? ' On' : ''}
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirming && (
        <div className="border-t border-barn/20 bg-barn/5 px-4 py-3 rounded-b-xl">
          <p className="text-sm text-wood-dark mb-2">
            Delete <strong>{order.customerName}</strong>'s order?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 py-2 bg-white text-wood-dark rounded-lg text-sm font-medium border border-wood/20 touch-manipulation"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2 bg-barn text-white rounded-lg text-sm font-medium touch-manipulation"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
})
