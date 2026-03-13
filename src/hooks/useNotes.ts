import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export function useNotesBySunday(sundayDate: string) {
  return useLiveQuery(
    () => db.notes.where('sundayDate').equals(sundayDate).sortBy('createdAt'),
    [sundayDate],
    []
  )
}

export function addNote(sundayDate: string, text: string) {
  db.notes.add({
    sundayDate,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  })
}

export function deleteNote(id: number) {
  db.notes.delete(id)
}
