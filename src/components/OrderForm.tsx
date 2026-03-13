import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import type { Order, OrderItem, PaymentMethod } from '../types'
import { useCustomerNames } from '../hooks/useCustomers'
import { addOrder, updateOrder } from '../hooks/useOrders'
import { calculateOrderTotal, PRICES } from '../utils/pricing'
import QuantityStepper from './QuantityStepper'

interface Props {
  sundayDate: string
  editingOrder: Order | null
  onClose: () => void
}

const EMPTY_ITEMS: OrderItem = { chicken: 0, duck: 0, goose: 0 }

export default function OrderForm({ sundayDate, editingOrder, onClose }: Props) {
  const customerNames = useCustomerNames()
  const nameRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [items, setItems] = useState<OrderItem>(EMPTY_ITEMS)
  const [notes, setNotes] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>('lockbox')
  const [cartonReturn, setCartonReturn] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Populate form when editing
  useEffect(() => {
    if (editingOrder) {
      setName(editingOrder.customerName)
      setItems({ ...editingOrder.items })
      setNotes(editingOrder.notes)
      setPayment(editingOrder.paymentMethod)
      setCartonReturn(editingOrder.cartonReturn)
    }
  }, [editingOrder])

  useEffect(() => {
    // Small delay to let the bottom sheet animate in before focusing
    const t = setTimeout(() => nameRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [])

  const total = calculateOrderTotal(items, cartonReturn)
  const hasItems = items.chicken > 0 || items.duck > 0 || items.goose > 0

  // Memoize filtered suggestions — only recomputes when name or customer list changes
  const suggestions = useMemo(() => {
    if (name.length === 0) return []
    const lower = name.toLowerCase()
    return customerNames.filter((n) => n.toLowerCase().includes(lower)).slice(0, 5)
  }, [name, customerNames])

  const handleNameChange = useCallback((val: string) => {
    setName(val)
    setShowSuggestions(val.length > 0)
  }, [])

  const selectSuggestion = useCallback((s: string) => {
    setName(s)
    setShowSuggestions(false)
  }, [])

  // Stable callbacks for steppers so they don't cause re-renders
  const setChicken = useCallback((v: number) => setItems((prev) => ({ ...prev, chicken: v })), [])
  const setDuck = useCallback((v: number) => setItems((prev) => ({ ...prev, duck: v })), [])
  const setGoose = useCallback((v: number) => setItems((prev) => ({ ...prev, goose: v })), [])

  const handleSubmit = () => {
    if (!name.trim() || !hasItems) return

    // Close immediately (optimistic) — DB write is fire-and-forget
    onClose()

    if (editingOrder?.id) {
      updateOrder(editingOrder.id, {
        customerName: name.trim(),
        items,
        notes,
        paymentMethod: payment,
        cartonReturn,
      })
    } else {
      addOrder({
        sundayDate,
        customerName: name.trim(),
        items,
        notes,
        paymentMethod: payment,
        cartonReturn,
        pickedUp: false,
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-cream rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-cream px-4 pt-4 pb-2 border-b border-wood/10 z-10">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-wood-dark font-bold">
              {editingOrder ? 'Edit Order' : 'New Order'}
            </h2>
            <button onClick={onClose} className="text-wood text-2xl leading-none p-2 touch-manipulation">&times;</button>
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
              onBlur={() => {
                // Delay hiding so tap on suggestion registers
                setTimeout(() => setShowSuggestions(false), 150)
              }}
              onFocus={() => { if (name.length > 0) setShowSuggestions(true) }}
              placeholder="Customer name"
              className="w-full px-3 py-3 rounded-lg border border-wood/20 bg-white text-wood-dark text-lg focus:outline-none focus:ring-2 focus:ring-olive/40"
              autoComplete="off"
              enterKeyHint="next"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-wood/20 rounded-lg shadow-lg overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="w-full text-left px-3 py-2 text-wood-dark hover:bg-parchment active:bg-parchment touch-manipulation"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectSuggestion(s)}
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
                onChange={setChicken}
              />
              <QuantityStepper
                label="Duck Eggs"
                emoji={'\u{1F986}'}
                price={PRICES.duck}
                value={items.duck}
                onChange={setDuck}
              />
              <QuantityStepper
                label="Fertile Goose Eggs"
                emoji={'\u{1FABF}'}
                price={PRICES.goose}
                value={items.goose}
                onChange={setGoose}
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
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
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
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
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
          <label className="flex items-center gap-3 cursor-pointer touch-manipulation">
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
              enterKeyHint="done"
            />
          </div>

          {/* Total & Submit */}
          <div className="flex items-center justify-between pt-2 border-t border-wood/20 pb-2">
            <div className="text-lg font-serif font-bold text-olive-dark">
              Total: ${total}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || !hasItems}
              className="px-6 py-3 bg-olive text-cream rounded-xl font-bold text-lg disabled:opacity-40 active:bg-olive-dark touch-manipulation"
            >
              {editingOrder ? 'Update' : 'Add Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
