import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export function useCustomerNames() {
  return useLiveQuery(
    () => db.customers.orderBy('name').toArray().then((cs) => cs.map((c) => c.name)),
    [],
    [] as string[]
  )
}
