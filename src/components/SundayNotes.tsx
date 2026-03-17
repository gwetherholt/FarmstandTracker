import { memo, useState, useCallback, useRef } from 'react'
import { useNotesBySunday, addNote, deleteNote } from '../hooks/useNotes'

const QUICK_NOTES = [
  'Check duck supply',
  'Check goose supply',
  'More cartons needed',
]

/** Display-only notes for the top of a Sunday board (sticky note style) */
export const NotesDisplay = memo(function NotesDisplay({ sundayDate }: { sundayDate: string }) {
  const notes = useNotesBySunday(sundayDate)

  if (notes.length === 0) return null

  return (
    <div className="bg-amber-light/30 border border-amber/30 rounded-xl p-3 space-y-1.5">
      <h4 className="text-xs font-semibold text-wood-dark uppercase tracking-wide flex items-center gap-1.5">
        <span className="text-sm">{'\u{1F4CC}'}</span> Reminders
      </h4>
      {notes.map((note) => (
        <div key={note.id} className="flex items-start gap-2">
          <span className="text-amber mt-0.5 text-xs">{'\u25CF'}</span>
          <span className="text-sm text-wood-dark">{note.text}</span>
        </div>
      ))}
    </div>
  )
})

interface AddNotesProps {
  targetSundayDate: string
}

/** Add-note section for the bottom of the current Sunday board */
export const AddNotes = memo(function AddNotes({ targetSundayDate }: AddNotesProps) {
  const notes = useNotesBySunday(targetSundayDate)
  const [input, setInput] = useState('')
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = useCallback(() => {
    if (!input.trim()) return
    addNote(targetSundayDate, input)
    setInput('')
    inputRef.current?.focus()
  }, [targetSundayDate, input])

  const handleQuickAdd = useCallback((text: string) => {
    addNote(targetSundayDate, text)
  }, [targetSundayDate])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }, [handleAdd])

  return (
    <div className="bg-parchment/60 rounded-xl border border-wood/10">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between touch-manipulation"
      >
        <span className="font-serif text-sm font-semibold text-wood-dark">
          {'\u{1F4DD}'} Notes for Next Week
          {notes.length > 0 && (
            <span className="ml-2 text-xs font-sans font-normal text-wood/60">
              ({notes.length})
            </span>
          )}
        </span>
        <span className="text-wood/40 text-sm">{expanded ? '\u25B2' : '\u25BC'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Existing notes for next week (preview) */}
          {notes.length > 0 && (
            <div className="space-y-1.5">
              {notes.map((note) => (
                <div key={note.id} className="flex items-start gap-2 bg-white rounded-lg px-3 py-2">
                  <span className="flex-1 text-sm text-wood-dark">{note.text}</span>
                  <button
                    onClick={() => deleteNote(note.id!)}
                    className="text-wood/30 hover:text-barn text-lg leading-none flex-shrink-0 touch-manipulation p-0.5"
                    aria-label="Delete note"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick-add chips */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_NOTES.map((text) => (
              <button
                key={text}
                onClick={() => handleQuickAdd(text)}
                className="px-2.5 py-1 bg-white border border-wood/15 rounded-full text-xs text-wood hover:bg-olive/10 hover:text-olive-dark transition-colors touch-manipulation"
              >
                + {text}
              </button>
            ))}
          </div>

          {/* Add custom note */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a note..."
              className="flex-1 px-3 py-2 rounded-lg border border-wood/20 bg-white text-wood-dark text-sm focus:outline-none focus:ring-2 focus:ring-olive/40"
              enterKeyHint="send"
            />
            <button
              onClick={handleAdd}
              disabled={!input.trim()}
              className="px-4 py-2 bg-olive text-cream rounded-lg text-sm font-medium disabled:opacity-40 active:bg-olive-dark touch-manipulation"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
})
