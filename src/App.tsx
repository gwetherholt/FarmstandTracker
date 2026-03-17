import { useState, useCallback } from 'react'
import { getNextSunday, toDateString, formatSundayLabel } from './utils/dates'
import { useClosedSundaySet } from './hooks/useClosedSundays'
import { useNotificationScheduler } from './hooks/useNotifications'
import SundayBoard from './components/SundayBoard'
import History from './components/History'
import Settings from './components/Settings'

type View = 'current' | 'history' | 'settings'

/** Get a Sunday date string offset by N weeks from the base Sunday */
function getSundayByOffset(baseSunday: string, offset: number): string {
  const d = new Date(baseSunday + 'T00:00:00')
  d.setDate(d.getDate() + offset * 7)
  return toDateString(d)
}

export default function App() {
  const [view, setView] = useState<View>('current')
  const [weekOffset, setWeekOffset] = useState(0)
  const closedSet = useClosedSundaySet()

  // Start notification scheduler
  useNotificationScheduler()

  const baseSunday = toDateString(getNextSunday())
  const activeSunday = getSundayByOffset(baseSunday, weekOffset)

  // Peek at neighboring Sundays for nav labels
  const prevSunday = getSundayByOffset(baseSunday, weekOffset - 1)
  const nextSunday = getSundayByOffset(baseSunday, weekOffset + 1)

  const goBack = useCallback(() => setWeekOffset((o) => o - 1), [])
  const goForward = useCallback(() => setWeekOffset((o) => o + 1), [])
  const goToday = useCallback(() => setWeekOffset(0), [])

  if (view === 'history') {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-lg mx-auto px-4 py-4">
          <History onBack={() => setView('current')} />
        </div>
      </div>
    )
  }

  if (view === 'settings') {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-lg mx-auto px-4 py-4">
          <Settings onBack={() => setView('current')} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <header className="px-4 pt-6 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-wood-dark">
                Port Orchard
              </h1>
              <h2 className="font-serif text-lg text-olive -mt-1">Farm Stand</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView('settings')}
                className="text-sm text-olive-dark font-medium px-3 py-1.5 rounded-lg bg-parchment"
              >
                {'\u2699\uFE0F'}
              </button>
              <button
                onClick={() => setView('history')}
                className="text-sm text-olive-dark font-medium px-3 py-1.5 rounded-lg bg-parchment"
              >
                History
              </button>
            </div>
          </div>
        </header>

        {/* Sunday navigation */}
        <div className="px-4 mb-4">
          <div className="flex items-center gap-1 bg-parchment rounded-xl p-1">
            {/* Previous week */}
            <button
              onClick={goBack}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-wood/60 hover:text-wood-dark hover:bg-white/60 transition-colors touch-manipulation flex-shrink-0"
              aria-label="Previous Sunday"
            >
              {'\u2039'}
            </button>

            {/* Previous Sunday label */}
            <button
              onClick={goBack}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors text-center truncate ${
                closedSet.has(prevSunday)
                  ? 'text-wood/30 line-through'
                  : 'text-wood/50'
              }`}
            >
              {formatSundayLabel(prevSunday)}
            </button>

            {/* Current Sunday (active) */}
            <div
              className={`flex-[1.4] py-2.5 rounded-lg text-sm font-semibold text-center shadow-sm truncate ${
                closedSet.has(activeSunday)
                  ? 'bg-white/80 text-wood/40 line-through'
                  : 'bg-white text-wood-dark'
              }`}
            >
              {formatSundayLabel(activeSunday)}
            </div>

            {/* Next Sunday label */}
            <button
              onClick={goForward}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors text-center truncate ${
                closedSet.has(nextSunday)
                  ? 'text-wood/30 line-through'
                  : 'text-wood/50'
              }`}
            >
              {formatSundayLabel(nextSunday)}
            </button>

            {/* Next week */}
            <button
              onClick={goForward}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-wood/60 hover:text-wood-dark hover:bg-white/60 transition-colors touch-manipulation flex-shrink-0"
              aria-label="Next Sunday"
            >
              {'\u203A'}
            </button>
          </div>

          {/* Today button — only show when navigated away */}
          {weekOffset !== 0 && (
            <div className="flex justify-center mt-2">
              <button
                onClick={goToday}
                className="text-xs text-olive font-medium px-3 py-1 rounded-full bg-olive/10 hover:bg-olive/20 transition-colors touch-manipulation"
              >
                {'\u2190'} Back to {formatSundayLabel(baseSunday)}
              </button>
            </div>
          )}
        </div>

        {/* Board */}
        <main className="px-4 pb-24">
          <SundayBoard key={activeSunday} sundayDate={activeSunday} />
        </main>
      </div>
    </div>
  )
}
