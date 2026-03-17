import { useState, useCallback } from 'react'
import { getNextSunday, toDateString, formatSundayLabel, formatShortDate, getRelativeLabel } from './utils/dates'
import { useClosedSundaySet } from './hooks/useClosedSundays'
import { useNotificationScheduler } from './hooks/useNotifications'
import SundayBoard from './components/SundayBoard'
import History from './components/History'
import Settings from './components/Settings'
import FarmHeader from './components/FarmHeader'

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
        <FarmHeader
          onSettings={() => setView('settings')}
          onHistory={() => setView('history')}
        />

        {/* Sunday navigation */}
        <div className="px-4 mb-4">
          <div className="flex items-center bg-parchment rounded-xl p-1">
            {/* Previous week arrow */}
            <button
              onClick={goBack}
              className="w-9 h-12 flex items-center justify-center rounded-lg text-wood/50 hover:text-wood-dark hover:bg-white/60 transition-colors touch-manipulation flex-shrink-0 text-lg"
              aria-label="Previous Sunday"
            >
              {'\u2039'}
            </button>

            {/* Previous Sunday */}
            <button
              onClick={goBack}
              className={`flex-1 py-1.5 rounded-lg transition-colors text-center touch-manipulation ${
                closedSet.has(prevSunday) ? 'opacity-40 line-through' : ''
              }`}
            >
              <div className="text-[11px] text-wood/40">{getRelativeLabel(prevSunday) ?? 'Sun'}</div>
              <div className="text-xs font-medium text-wood/60">{formatShortDate(prevSunday)}</div>
            </button>

            {/* Current Sunday (active) */}
            <div
              className={`flex-[1.3] py-1.5 px-1 rounded-lg text-center shadow-sm mx-0.5 ${
                closedSet.has(activeSunday)
                  ? 'bg-white/80 opacity-50 line-through'
                  : 'bg-white'
              }`}
            >
              {getRelativeLabel(activeSunday) && (
                <div className="text-[11px] text-olive font-medium">{getRelativeLabel(activeSunday)}</div>
              )}
              <div className="font-hand text-xl font-bold text-wood-dark leading-tight">
                {formatShortDate(activeSunday)}
              </div>
            </div>

            {/* Next Sunday */}
            <button
              onClick={goForward}
              className={`flex-1 py-1.5 rounded-lg transition-colors text-center touch-manipulation ${
                closedSet.has(nextSunday) ? 'opacity-40 line-through' : ''
              }`}
            >
              <div className="text-[11px] text-wood/40">{getRelativeLabel(nextSunday) ?? 'Sun'}</div>
              <div className="text-xs font-medium text-wood/60">{formatShortDate(nextSunday)}</div>
            </button>

            {/* Next week arrow */}
            <button
              onClick={goForward}
              className="w-9 h-12 flex items-center justify-center rounded-lg text-wood/50 hover:text-wood-dark hover:bg-white/60 transition-colors touch-manipulation flex-shrink-0 text-lg"
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
                {'\u2190'} This Sunday ({formatShortDate(baseSunday)})
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
