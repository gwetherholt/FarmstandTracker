import { useState, useCallback } from 'react'
import type { Order } from '../types'
import { useOrdersBySunday, useGenerateRecurring } from '../hooks/useOrders'
import { useIsClosed, toggleClosed } from '../hooks/useClosedSundays'
import { useIsSoldOut, toggleSoldOut } from '../hooks/useSoldOut'
import { toDateString } from '../utils/dates'
import PrepSummary from './PrepSummary'
import OrderCard from './OrderCard'
import OrderForm from './OrderForm'
import { NotesDisplay, AddNotes } from './SundayNotes'
import WeeklyChecklist from './WeeklyChecklist'

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
  const isSoldOut = useIsSoldOut(sundayDate)
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
          <div className="font-hand text-2xl font-bold text-wood/50 uppercase">Closed</div>
          <p className="text-sm text-wood/40 mt-1">No orders this week</p>
        </div>
      )}

      {/* Sold out banner */}
      {!isClosed && isSoldOut && (
        <div className="bg-barn/5 border border-barn/20 rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">{'\u{1F6A8}'}</div>
          <div className="font-hand text-2xl font-bold text-barn uppercase">Sold Out</div>
          <p className="text-sm text-wood/40 mt-1">All inventory claimed</p>
        </div>
      )}

      {/* Week controls */}
      <div className="flex justify-end gap-2">
        {!isClosed && (
          <button
            onClick={() => toggleSoldOut(sundayDate, isSoldOut)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors touch-manipulation ${
              isSoldOut
                ? 'bg-barn/10 text-barn hover:bg-barn/20'
                : 'bg-wood/5 text-wood/50 hover:text-wood hover:bg-wood/10'
            }`}
          >
            {isSoldOut ? 'Undo sold out' : 'Mark sold out'}
          </button>
        )}
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

          {/* Weekly checklist */}
          <WeeklyChecklist sundayDate={sundayDate} />

          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onEdit={handleEdit} />
            ))}
          </div>

          {orders.length === 0 && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-2">
                <svg width="48" height="60" viewBox="0 0 32 40">
                  <ellipse cx="16" cy="22" rx="12" ry="16" fill="#F0EDE6" stroke="#E0D8CA" strokeWidth="0.5" />
                  <ellipse cx="12" cy="16" rx="4" ry="5" fill="white" opacity="0.3" />
                </svg>
              </div>
              <p className="text-wood/50 italic font-hand text-xl">No preorders yet</p>
              <p className="text-sm text-wood/35 mt-1">Tap the egg to add one</p>
            </div>
          )}

          {/* Add notes targeting NEXT Sunday */}
          <AddNotes targetSundayDate={nextSunday} />

          {/* Egg FAB */}
          <button
            onClick={handleOpenForm}
            className="fixed bottom-6 right-6 w-14 h-[4.25rem] shadow-lg z-40 touch-manipulation select-none active:scale-95 transition-transform"
            aria-label="Add order"
          >
            <svg viewBox="0 0 56 68" className="w-full h-full drop-shadow-md">
              <ellipse cx="28" cy="37" rx="26" ry="30" fill="#5B7A3D" />
              <ellipse cx="22" cy="28" rx="8" ry="10" fill="white" opacity="0.12" />
              <text x="28" y="44" textAnchor="middle" fill="#FAF8F4" fontSize="28" fontWeight="bold" fontFamily="Inter, sans-serif">+</text>
            </svg>
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
