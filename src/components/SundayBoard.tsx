import { useState } from 'react'
import type { Order } from '../types'
import { useOrdersBySunday } from '../hooks/useOrders'
import PrepSummary from './PrepSummary'
import OrderCard from './OrderCard'
import OrderForm from './OrderForm'

interface Props {
  sundayDate: string
}

export default function SundayBoard({ sundayDate }: Props) {
  const orders = useOrdersBySunday(sundayDate)
  const [showForm, setShowForm] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  const handleEdit = (order: Order) => {
    setEditingOrder(order)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingOrder(null)
  }

  return (
    <div className="space-y-4">
      <PrepSummary orders={orders} />

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

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-olive text-cream rounded-full shadow-lg text-3xl flex items-center justify-center active:bg-olive-dark z-40"
      >
        +
      </button>

      {showForm && (
        <OrderForm
          sundayDate={sundayDate}
          editingOrder={editingOrder}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}
