import { useState, useMemo } from 'react'
import type { Product } from '../types'
import {
  useProducts,
  addProduct,
  updateProduct,
  deactivateProduct,
  reactivateProduct,
} from '../hooks/useProducts'

const UNITS = ['half-doz', 'dozen', 'each', 'bunch', 'lb', 'oz', 'jar', 'bottle', 'bag']
const EMOJI_CHOICES = [
  '\u{1F414}', // chicken
  '\u{1F986}', // duck
  '\u{1FABF}', // goose
  '\u{1F95A}', // egg
  '\u{1F525}', // candle (using fire)
  '\u{1F56F}️', // candle proper
  '\u{1F36F}', // honey
  '\u{1F955}', // carrot
  '\u{1F345}', // tomato
  '\u{1F33D}', // corn
  '\u{1F952}', // cucumber
  '\u{1F33F}', // herb
  '\u{1F344}', // mushroom
  '\u{1F33A}', // flower
  '\u{1F490}', // bouquet
  '\u{1F95D}', // kiwi
  '\u{1F352}', // cherries
  '\u{1F347}', // grapes
  '\u{1F351}', // peach
  '\u{1F34E}', // apple
]

interface FormState {
  name: string
  emoji: string
  price: string
  unit: string
}

const EMPTY_FORM: FormState = {
  name: '',
  emoji: EMOJI_CHOICES[0],
  price: '',
  unit: 'half-doz',
}

export default function ProductManager() {
  const products = useProducts()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)

  const { active, hidden } = useMemo(() => {
    const a: Product[] = []
    const h: Product[] = []
    for (const p of products) (p.active ? a : h).push(p)
    return { active: a, hidden: h }
  }, [products])

  const startAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const startEdit = (p: Product) => {
    setEditingId(p.id!)
    setForm({
      name: p.name,
      emoji: p.emoji,
      price: String(p.price),
      unit: p.unit,
    })
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const submitForm = async () => {
    const name = form.name.trim()
    const price = parseFloat(form.price)
    if (!name || isNaN(price) || price < 0) return
    if (editingId != null) {
      await updateProduct(editingId, {
        name,
        emoji: form.emoji,
        price,
        unit: form.unit,
      })
    } else {
      await addProduct({ name, emoji: form.emoji, price, unit: form.unit })
    }
    cancelForm()
  }

  const isValid = form.name.trim().length > 0 && !isNaN(parseFloat(form.price)) && parseFloat(form.price) >= 0

  return (
    <div className="bg-white rounded-xl border border-wood/10 overflow-hidden">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg text-wood-dark font-semibold">
            {'\u{1F33E}'} Products
          </h3>
          {!showForm && (
            <button
              onClick={startAdd}
              className="text-sm font-medium px-3 py-1.5 rounded-lg bg-olive text-cream hover:bg-olive-dark transition-colors touch-manipulation"
            >
              + Add
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-parchment/60 rounded-lg p-3 space-y-3">
            <div>
              <label className="block text-xs font-medium text-wood mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Lavender Candle"
                className="w-full px-3 py-2 rounded-lg border border-wood/20 bg-white text-wood-dark focus:outline-none focus:ring-2 focus:ring-olive/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-wood mb-1">Price ($)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg border border-wood/20 bg-white text-wood-dark focus:outline-none focus:ring-2 focus:ring-olive/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-wood mb-1">Unit</label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-wood/20 bg-white text-wood-dark focus:outline-none focus:ring-2 focus:ring-olive/40"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-wood mb-1">Emoji</label>
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_CHOICES.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                    className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-colors touch-manipulation ${
                      form.emoji === e
                        ? 'bg-olive/30 ring-2 ring-olive'
                        : 'bg-white border border-wood/20'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={cancelForm}
                className="flex-1 py-2 bg-white text-wood-dark rounded-lg text-sm font-medium border border-wood/20 touch-manipulation"
              >
                Cancel
              </button>
              <button
                onClick={submitForm}
                disabled={!isValid}
                className="flex-1 py-2 bg-olive text-cream rounded-lg text-sm font-medium disabled:opacity-40 active:bg-olive-dark touch-manipulation"
              >
                {editingId != null ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        )}

        {/* Active products */}
        <div className="space-y-1.5">
          {active.length === 0 && !showForm && (
            <p className="text-sm text-wood/50 italic text-center py-3">
              No products yet. Tap Add to create one.
            </p>
          )}
          {active.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-parchment/40"
            >
              <span className="text-2xl">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-wood-dark text-sm truncate">{p.name}</div>
                <div className="text-xs text-wood">${p.price}/{p.unit}</div>
              </div>
              <button
                onClick={() => startEdit(p)}
                className="text-xs text-olive font-medium px-2 py-1 rounded hover:bg-olive/10 touch-manipulation"
              >
                Edit
              </button>
              <button
                onClick={() => deactivateProduct(p.id!)}
                className="text-xs text-wood/60 font-medium px-2 py-1 rounded hover:bg-wood/10 touch-manipulation"
              >
                Hide
              </button>
            </div>
          ))}
        </div>

        {/* Hidden products */}
        {hidden.length > 0 && (
          <div className="pt-2 border-t border-wood/10">
            <div className="text-xs font-semibold text-wood/60 uppercase tracking-wide mb-2">
              Hidden
            </div>
            <div className="space-y-1.5">
              {hidden.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 py-2 px-2 rounded-lg opacity-60"
                >
                  <span className="text-2xl grayscale">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-wood-dark text-sm truncate">{p.name}</div>
                    <div className="text-xs text-wood">${p.price}/{p.unit}</div>
                  </div>
                  <button
                    onClick={() => reactivateProduct(p.id!)}
                    className="text-xs text-olive font-medium px-2 py-1 rounded hover:bg-olive/10 touch-manipulation"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-[11px] text-wood/40">
          Hiding a product keeps past order history intact. Restore any time.
        </p>
      </div>
    </div>
  )
}
