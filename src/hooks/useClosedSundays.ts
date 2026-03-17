import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

/** Check if a specific Sunday is closed */
export function useIsClosed(sundayDate: string): boolean {
  return useLiveQuery(
    () => db.closedSundays.get(sundayDate).then((r) => !!r),
    [sundayDate],
    false
  )
}

/** Get all closed Sunday dates as a Set (for nav display) */
export function useClosedSundaySet(): Set<string> {
  const list = useLiveQuery(
    () => db.closedSundays.toArray(),
    [],
    []
  )
  return new Set(list.map((c) => c.sundayDate))
}

export function toggleClosed(sundayDate: string, currentlyClosed: boolean) {
  if (currentlyClosed) {
    db.closedSundays.delete(sundayDate)
  } else {
    db.closedSundays.put({ sundayDate })
  }
}

/** Check if a Sunday is closed (non-hook, for use in async logic) */
export async function isSundayClosed(sundayDate: string): Promise<boolean> {
  const row = await db.closedSundays.get(sundayDate)
  return !!row
}
