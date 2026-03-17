import { useState, useCallback } from 'react'
import type { Order } from '../types'
import { useOrdersBySunday, useGenerateRecurring } from '../hooks/useOrders'
import { toDateString } from '../utils/dates'
import PrepSummary from './PrepSummary'
import OrderCard from './OrderCard'
import OrderForm from './OrderForm'
import { NotesDisplay, AddNotes } from './SundayNotes'

interface Props {
  sundayDate: string
}

/** Get the next Sunday after the given date string */
function getNextSundayFrom(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + 7)
  return toDateString(d)
}

export default function SundayBoard({ sundayDate }: Props) {
  const orders = useOrdersBySunday(sundayDate)
  const [formOpen, setFormOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  // Generate recurring orders from previous Sunday on load
  useGenerateRecurring(sundayDate)

  const handleEdit = useCallback((order: Order) => {
    setEditingOrder(order)
    setFormOpen(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setFormOpen(false)
    setEditingOrder(null)
  }, [])

  const handleOpenForm = useCallback(() => {
    setEditingOrder(null)
    setFormOpen(true)
  }, [])

  const nextSunday = getNextSundayFrom(sundayDate)

  return (
    <div className="space-y-4">
      <PrepSummary orders={orders} />

      {/* Notes for THIS Sunday displayed at top */}
      <NotesDisplay sundayDate={sundayDate} />

      <div className="space-y-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} onEdit={handleEdit} />
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">{'\u{1F95A}'}</div>
          <p className="text-wood/60 italic">No preorders yet for this Sunday</p>
          <p className="text-sm text-wood/40 mt-1">Tap + to add one</p>
        </div>
      )}

      {/* Add notes targeting NEXT Sunday */}
      <AddNotes targetSundayDate={nextSunday} />

      {/* FAB — always responsive */}
      <button
        onClick={handleOpenForm}
        className="fixed bottom-6 right-6 w-14 h-14 bg-olive text-cream rounded-full shadow-lg text-3xl flex items-center justify-center active:bg-olive-dark z-40 touch-manipulation select-none"
      >
        +
      </button>

      {formOpen && (
        <OrderForm
          key={editingOrder?.id ?? 'new'}
          sundayDate={sundayDate}
          editingOrder={editingOrder}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}
