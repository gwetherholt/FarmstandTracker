import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Customer } from '../types'

export function useCustomerNames() {
  return useLiveQuery(
    () => db.customers.orderBy('name').toArray().then((cs) => cs.map((c) => c.name)),
    [],
    [] as string[]
  )
}

/** Returns a map of customer name (lowercase) -> Customer for contact source lookup */
export function useCustomerMap(): Map<string, Customer> {
  const customers = useLiveQuery(
    () => db.customers.toArray(),
    [],
    [] as Customer[]
  )
  const map = new Map<string, Customer>()
  for (const c of customers) {
    map.set(c.name.toLowerCase(), c)
  }
  return map
}
