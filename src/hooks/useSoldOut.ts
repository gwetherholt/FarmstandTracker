import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export function useIsSoldOut(sundayDate: string): boolean {
  return useLiveQuery(
    () => db.soldOutSundays.get(sundayDate).then((r) => !!r),
    [sundayDate],
    false
  )
}

export function toggleSoldOut(sundayDate: string, currentlySoldOut: boolean) {
  if (currentlySoldOut) {
    db.soldOutSundays.delete(sundayDate)
  } else {
    db.soldOutSundays.put({ sundayDate })
  }
}
