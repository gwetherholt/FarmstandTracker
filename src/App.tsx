import { useState } from 'react'
import { getNextSunday, getFollowingSunday, toDateString, formatSundayLabel } from './utils/dates'
import SundayBoard from './components/SundayBoard'
import History from './components/History'

type View = 'current' | 'history'

export default function App() {
  const [view, setView] = useState<View>('current')
  const [selectedTab, setSelectedTab] = useState<0 | 1>(0)

  const thisSunday = toDateString(getNextSunday())
  const nextSunday = toDateString(getFollowingSunday())
  const activeSunday = selectedTab === 0 ? thisSunday : nextSunday

  if (view === 'history') {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-lg mx-auto px-4 py-4">
          <History onBack={() => setView('current')} />
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
            <button
              onClick={() => setView('history')}
              className="text-sm text-olive-dark font-medium px-3 py-1.5 rounded-lg bg-parchment"
            >
              History
            </button>
          </div>
        </header>

        {/* Sunday tabs */}
        <div className="px-4 mb-4">
          <div className="flex gap-2 bg-parchment rounded-xl p-1">
            <button
              onClick={() => setSelectedTab(0)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === 0
                  ? 'bg-white text-wood-dark shadow-sm'
                  : 'text-wood/60'
              }`}
            >
              {formatSundayLabel(thisSunday)}
            </button>
            <button
              onClick={() => setSelectedTab(1)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === 1
                  ? 'bg-white text-wood-dark shadow-sm'
                  : 'text-wood/60'
              }`}
            >
              {formatSundayLabel(nextSunday)}
            </button>
          </div>
        </div>

        {/* Board */}
        <main className="px-4 pb-24">
          <SundayBoard key={activeSunday} sundayDate={activeSunday} />
        </main>
      </div>
    </div>
  )
}
