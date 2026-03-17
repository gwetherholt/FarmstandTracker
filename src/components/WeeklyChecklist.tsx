import { memo, useState, useCallback, useRef } from 'react'
import {
  useChecklist,
  useInitChecklist,
  toggleChecklistItem,
  addChecklistItem,
  deleteChecklistItem,
} from '../hooks/useChecklist'

interface Props {
  sundayDate: string
}

export default memo(function WeeklyChecklist({ sundayDate }: Props) {
  useInitChecklist(sundayDate)
  const items = useChecklist(sundayDate)
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = useCallback(() => {
    if (!input.trim()) return
    addChecklistItem(sundayDate, input.trim())
    setInput('')
    inputRef.current?.focus()
  }, [sundayDate, input])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleAdd()
      }
    },
    [handleAdd]
  )

  const doneCount = items.filter((i) => i.checked).length

  return (
    <div className="bg-white rounded-xl border border-wood/10 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-wood-dark uppercase tracking-wide flex items-center gap-1.5">
          <span className="text-sm">{'\u2611\uFE0F'}</span> Weekly Checklist
        </h4>
        <span className="text-[11px] text-wood/40">
          {doneCount}/{items.length}
        </span>
      </div>

      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-2 group">
            <button
              onClick={() => toggleChecklistItem(item.id!, item.checked)}
              className="mt-0.5 w-5 h-5 rounded border border-wood/20 flex items-center justify-center flex-shrink-0 touch-manipulation transition-colors"
              style={item.checked ? { backgroundColor: '#5B7A3D', borderColor: '#5B7A3D' } : undefined}
            >
              {item.checked && (
                <span className="text-white text-xs font-bold">{'\u2713'}</span>
              )}
            </button>
            <span
              className={`flex-1 text-sm ${
                item.checked ? 'text-wood/40 line-through' : 'text-wood-dark'
              }`}
            >
              {item.text}
            </span>
            {!item.isDefault && (
              <button
                onClick={() => deleteChecklistItem(item.id!)}
                className="text-wood/20 hover:text-barn text-sm leading-none flex-shrink-0 touch-manipulation opacity-0 group-hover:opacity-100 p-0.5"
                aria-label="Delete item"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add custom item */}
      <div className="flex gap-2 pt-1">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task..."
          className="flex-1 px-2.5 py-1.5 rounded-lg border border-wood/15 bg-cream text-wood-dark text-xs focus:outline-none focus:ring-2 focus:ring-olive/30"
          enterKeyHint="send"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="px-3 py-1.5 bg-olive text-cream rounded-lg text-xs font-medium disabled:opacity-40 active:bg-olive-dark touch-manipulation"
        >
          Add
        </button>
      </div>
    </div>
  )
})
