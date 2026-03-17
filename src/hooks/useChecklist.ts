import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect } from 'react'
import { db } from '../db'
import type { ChecklistItem } from '../types'

const DEFAULT_ITEMS = [
  'Community post (Port Orchard community group)',
  'Pre-order open post (Monday after previous Sunday)',
  'Sold out post (when inventory runs out)',
]

/** Ensure default checklist items exist for a given Sunday */
export function useInitChecklist(sundayDate: string) {
  useEffect(() => {
    db.checklist
      .where('sundayDate')
      .equals(sundayDate)
      .count()
      .then((count) => {
        if (count > 0) return
        const now = new Date().toISOString()
        db.checklist.bulkAdd(
          DEFAULT_ITEMS.map((text) => ({
            sundayDate,
            text,
            checked: false,
            isDefault: true,
            createdAt: now,
          }))
        )
      })
  }, [sundayDate])
}

export function useChecklist(sundayDate: string): ChecklistItem[] {
  return useLiveQuery(
    () => db.checklist.where('sundayDate').equals(sundayDate).sortBy('createdAt'),
    [sundayDate],
    []
  )
}

export function toggleChecklistItem(id: number, current: boolean) {
  db.checklist.update(id, { checked: !current })
}

export function addChecklistItem(sundayDate: string, text: string) {
  db.checklist.add({
    sundayDate,
    text,
    checked: false,
    isDefault: false,
    createdAt: new Date().toISOString(),
  })
}

export function deleteChecklistItem(id: number) {
  db.checklist.delete(id)
}
