import { useState, useEffect, useRef } from 'react'
import type { Order, OrderItem, PaymentMethod } from '../types'
import { useCustomerNames } from '../hooks/useCustomers'
import { addOrder, updateOrder } from '../hooks/useOrders'
import { calculateOrderTotal, PRICES } from '../utils/pricing'
import QuantityStepper from './QuantityStepper'

interface Props {
  sundayDate: string
  editingOrder?: Order | null
  onClose: () => void
}

export default function OrderForm({ sundayDate, editingOrder, onClose }: Props) {
  const customerNames = useCustomerNames()
  const nameRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(editingOrder?.customerName ?? '')
  const [items, setItems] = useState<OrderItem>(
    editingOrder?.items ?? { chicken: 0, duck: 0, goose: 0 }
  )
  const [notes, setNotes] = useState(editingOrder?.notes ?? '')
  const [payment, setPayment] = useState<PaymentMethod>(editingOrder?.paymentMethod ?? 'lockbox')
  const [cartonReturn, setCartonReturn] = useState(editingOrder?.cartonReturn ?? false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const total = calculateOrderTotal(items, cartonReturn)
  const hasItems = items.chicken > 0 || items.duck > 0 || items.goose > 0

  const handleNameChange = (val: string) => {
    setName(val)
    if (val.length > 0) {
      const filtered = customerNames.filter((n) =>
        n.toLowerCase().includes(val.toLowerCase())
      )
      setSuggestions(filtered.slice(0, 5))
    } else {
      setSuggestions([])
    }
  }

  const handleSubmit = async () => {
    if (!name.trim() || !hasItems) return

    if (editingOrder?.id) {
      await updateOrder(editingOrder.id, {
        customerName: name.trim(),
        items,
        notes,
        paymentMethod: payment,
        cartonReturn,
      })
    } else {
      await addOrder({
        sundayDate,
        customerName: name.trim(),
        items,
        notes,
        paymentMethod: payment,
        cartonReturn,
        pickedUp: false,
      })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-cream rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-cream px-4 pt-4 pb-2 border-b border-wood/10">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-wood-dark font-bold">
              {editingOrder ? 'Edit Order' : 'New Order'}
            </h2>
            <button onClick={onClose} className="text-wood text-2xl leading-none p-1">&times;</button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Customer name */}
          <div className="relative">
            <label className="block text-sm font-medium text-wood mb-1">Customer</label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Customer name"
              className="w-full px-3 py-3 rounded-lg border border-wood/20 bg-white text-wood-dark text-lg focus:outline-none focus:ring-2 focus:ring-olive/40"
              autoComplete="off"
            />
            {suggestions.length > 0 && name.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-wood/20 rounded-lg shadow-lg overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="w-full text-left px-3 py-2 text-wood-dark hover:bg-parchment"
                    onClick={() => {
                      setName(s)
                      setSuggestions([])
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quantities */}
          <div>
            <label className="block text-sm font-medium text-wood mb-1">Quantities</label>
            <div className="bg-white rounded-lg border border-wood/10 px-3 divide-y divide-wood/10">
              <QuantityStepper
                label="Rainbow Chicken Eggs"
                emoji={'\u{1F414}'}
                price={PRICES.chicken}
                value={items.chicken}
                onChange={(v) => setItems({ ...items, chicken: v })}
              />
              <QuantityStepper
                label="Duck Eggs"
                emoji={'\u{1F986}'}
                price={PRICES.duck}
                value={items.duck}
                onChange={(v) => setItems({ ...items, duck: v })}
              />
              <QuantityStepper
                label="Fertile Goose Eggs"
                emoji={'\u{1FABF}'}
                price={PRICES.goose}
                value={items.goose}
                onChange={(v) => setItems({ ...items, goose: v })}
              />
            </div>
          </div>

          {/* Payment */}
          <div>
            <label className="block text-sm font-medium text-wood mb-1">Payment</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPayment('lockbox')}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
                  payment === 'lockbox'
                    ? 'bg-olive text-cream'
                    : 'bg-white border border-wood/20 text-wood'
                }`}
              >
                {'\u{1F4E6}'} Orange Lockbox
              </button>
              <button
                type="button"
                onClick={() => setPayment('venmo')}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
                  payment === 'venmo'
                    ? 'bg-olive text-cream'
                    : 'bg-white border border-wood/20 text-wood'
                }`}
              >
                Venmo
              </button>
            </div>
          </div>

          {/* Carton return */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={cartonReturn}
              onChange={(e) => setCartonReturn(e.target.checked)}
              className="w-5 h-5 rounded border-wood/30 text-olive focus:ring-olive"
            />
            <span className="text-sm text-wood-dark">
              {'\u267B\uFE0F'} Returned clean carton (-$1)
            </span>
          </label>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-wood mb-1">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. will pick up at noon"
              className="w-full px-3 py-2 rounded-lg border border-wood/20 bg-white text-wood-dark focus:outline-none focus:ring-2 focus:ring-olive/40"
            />
          </div>

          {/* Total & Submit */}
          <div className="flex items-center justify-between pt-2 border-t border-wood/20">
            <div className="text-lg font-serif font-bold text-olive-dark">
              Total: ${total}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || !hasItems}
              className="px-6 py-3 bg-olive text-cream rounded-xl font-bold text-lg disabled:opacity-40 active:bg-olive-dark"
            >
              {editingOrder ? 'Update' : 'Add Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
