import { useState, useCallback } from 'react'
import type { Order } from '../types'
import { useOrdersBySunday, useGenerateRecurring } from '../hooks/useOrders'
import { useIsClosed, toggleClosed } from '../hooks/useClosedSundays'
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
  const isClosed = useIsClosed(sundayDate)
  const [formOpen, setFormOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  // Generate recurring orders from previous Sunday on load
  useGenerateRecurring(sundayDate)

  const handleEdit = useCallback((order: Order) => {
    if (isClosed) return
    setEditingOrder(order)
    setFormOpen(true)
  }, [isClosed])

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
      {/* Closed banner */}
      {isClosed && (
        <div className="bg-wood/5 border border-wood/15 rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">{'\u{1F6AB}'}</div>
          <div className="font-serif text-lg font-bold text-wood/60 uppercase tracking-wider">Closed</div>
          <p className="text-sm text-wood/40 mt-1">No orders this week</p>
        </div>
      )}

      {/* Close/Reopen toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => toggleClosed(sundayDate, isClosed)}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors touch-manipulation ${
            isClosed
              ? 'bg-olive/10 text-olive hover:bg-olive/20'
              : 'bg-wood/5 text-wood/50 hover:text-wood hover:bg-wood/10'
          }`}
        >
          {isClosed ? 'Reopen this week' : 'Mark as closed'}
        </button>
      </div>

      {!isClosed && (
        <>
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

          {/* FAB */}
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
        </>
      )}
    </div>
  )
}
