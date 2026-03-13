import { usePastSundays } from '../hooks/useOrders'
import { formatSundayLabel } from '../utils/dates'
import SundayBoard from './SundayBoard'

interface Props {
  onBack: () => void
}

export default function History({ onBack }: Props) {
  const pastDates = usePastSundays()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-olive-dark font-bold text-lg"
        >
          &larr;
        </button>
        <h2 className="font-serif text-2xl text-wood-dark font-bold">Past Sundays</h2>
      </div>

      {pastDates.length === 0 && (
        <p className="text-center text-wood/50 italic py-8">No past orders yet</p>
      )}

      {pastDates.map((date) => (
        <div key={date}>
          <h3 className="font-serif text-lg text-wood font-semibold mb-2">
            {formatSundayLabel(date)}
          </h3>
          <SundayBoard sundayDate={date} />
        </div>
      ))}
    </div>
  )
}
