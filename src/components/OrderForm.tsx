import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import type { Order, OrderItem, PaymentMethod, ContactSource } from '../types'
import { useCustomerNames, useCustomerMap } from '../hooks/useCustomers'
import { addOrder, updateOrder } from '../hooks/useOrders'
import { calculateOrderTotal, PRICES } from '../utils/pricing'
import QuantityStepper from './QuantityStepper'

interface Props {
  sundayDate: string
  editingOrder: Order | null
  onClose: () => void
}

const EMPTY_ITEMS: OrderItem = { chicken: 0, duck: 0, goose: 0 }

const CONTACT_SOURCES: { value: ContactSource; label: string; icon: string }[] = [
  { value: 'instagram', label: 'IG DM', icon: '\u{1F4F7}' },
  { value: 'facebook', label: 'FB Msg', icon: '\u{1F4AC}' },
  { value: 'marketplace', label: 'FB Mkt', icon: '\u{1F6D2}' },
  { value: 'text', label: 'Text', icon: '\u{1F4F1}' },
  { value: 'walkup', label: 'Walk-up', icon: '\u{1F6B6}' },
  { value: 'other', label: 'Other', icon: '\u{2709}\uFE0F' },
]

export default function OrderForm({ sundayDate, editingOrder, onClose }: Props) {
  const customerNames = useCustomerNames()
  const customerMap = useCustomerMap()
  const nameRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [items, setItems] = useState<OrderItem>(EMPTY_ITEMS)
  const [notes, setNotes] = useState('')
  const [payment, setPayment] = useState<PaymentMethod | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [contactSource, setContactSource] = useState<ContactSource | null>(null)
  const [showContact, setShowContact] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Populate form when editing
  useEffect(() => {
    if (editingOrder) {
      setName(editingOrder.customerName)
      setItems({ ...editingOrder.items })
      setNotes(editingOrder.notes)
      setPayment(editingOrder.paymentMethod ?? null)
      setShowPayment(!!editingOrder.paymentMethod)
      setContactSource(editingOrder.contactSource ?? null)
      setShowContact(!!editingOrder.contactSource)
    }
  }, [editingOrder])

  useEffect(() => {
    const t = setTimeout(() => nameRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [])

  const total = calculateOrderTotal(items)
  const hasItems = items.chicken > 0 || items.duck > 0 || items.goose > 0

  const suggestions = useMemo(() => {
    if (name.length === 0) return []
    const lower = name.toLowerCase()
    return customerNames.filter((n) => n.toLowerCase().includes(lower)).slice(0, 5)
  }, [name, customerNames])

  const handleNameChange = useCallback((val: string) => {
    setName(val)
    setShowSuggestions(val.length > 0)
  }, [])

  // Auto-fill contact source from customer's saved preference
  const applyCustomerDefaults = useCallback((customerName: string) => {
    const customer = customerMap.get(customerName.toLowerCase())
    if (customer?.contactSource && !editingOrder) {
      setContactSource(customer.contactSource)
      setShowContact(true)
    }
  }, [customerMap, editingOrder])

  const selectSuggestion = useCallback((s: string) => {
    setName(s)
    setShowSuggestions(false)
    applyCustomerDefaults(s)
  }, [applyCustomerDefaults])

  const setChicken = useCallback((v: number) => setItems((prev) => ({ ...prev, chicken: v })), [])
  const setDuck = useCallback((v: number) => setItems((prev) => ({ ...prev, duck: v })), [])
  const setGoose = useCallback((v: number) => setItems((prev) => ({ ...prev, goose: v })), [])

  const handleSubmit = () => {
    if (!name.trim() || !hasItems) return

    onClose()

    if (editingOrder?.id) {
      updateOrder(editingOrder.id, {
        customerName: name.trim(),
        items,
        notes,
        paymentMethod: payment,
        contactSource,
      })
    } else {
      addOrder({
        sundayDate,
        customerName: name.trim(),
        items,
        notes,
        paymentMethod: payment,
        contactSource,
        cartonReturn: false,
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
            <h2 className="font-hand text-2xl text-wood-dark font-bold">
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
                setTimeout(() => {
                  setShowSuggestions(false)
                  // Also try to auto-fill on blur if exact match
                  if (name.trim()) applyCustomerDefaults(name.trim())
                }, 150)
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
                emoji={'\u{1F9A2}'}
                price={PRICES.goose}
                value={items.goose}
                onChange={setGoose}
              />
            </div>
          </div>

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

          {/* Optional fields row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {!showContact && (
              <button
                type="button"
                onClick={() => setShowContact(true)}
                className="text-sm text-olive hover:text-olive-dark underline underline-offset-2"
              >
                + Add source
              </button>
            )}
            {!showPayment && (
              <button
                type="button"
                onClick={() => setShowPayment(true)}
                className="text-sm text-olive hover:text-olive-dark underline underline-offset-2"
              >
                + Add payment method
              </button>
            )}
          </div>

          {/* Contact source — hidden by default */}
          {showContact && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-wood">Contact source</label>
                <button
                  type="button"
                  onClick={() => { setShowContact(false); setContactSource(null) }}
                  className="text-xs text-wood/50 hover:text-wood"
                >
                  Remove
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CONTACT_SOURCES.map((cs) => (
                  <button
                    key={cs.value}
                    type="button"
                    onClick={() => setContactSource(cs.value)}
                    className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-colors touch-manipulation ${
                      contactSource === cs.value
                        ? 'bg-olive text-cream'
                        : 'bg-white border border-wood/20 text-wood'
                    }`}
                  >
                    {cs.icon} {cs.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payment — hidden by default */}
          {showPayment && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-wood">Payment</label>
                <button
                  type="button"
                  onClick={() => { setShowPayment(false); setPayment(null) }}
                  className="text-xs text-wood/50 hover:text-wood"
                >
                  Remove
                </button>
              </div>
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
          )}

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
