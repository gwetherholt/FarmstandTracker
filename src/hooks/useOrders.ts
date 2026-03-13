import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Order } from '../types'

export function useOrdersBySunday(sundayDate: string) {
  return useLiveQuery(
    () => db.orders.where('sundayDate').equals(sundayDate).sortBy('createdAt'),
    [sundayDate],
    []
  )
}

export function usePastSundays() {
  return useLiveQuery(async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]
    const orders = await db.orders.where('sundayDate').below(todayStr).toArray()
    const dates = [...new Set(orders.map((o) => o.sundayDate))].sort().reverse()
    return dates
  }, [], [])
}

/** Fire-and-forget: returns immediately, DB write happens in background */
export function addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString()
  db.orders.add({
    ...order,
    createdAt: now,
    updatedAt: now,
  }).then(() => {
    // Upsert customer in background — don't block anything
    db.customers.where('name').equalsIgnoreCase(order.customerName).first().then((existing) => {
      if (existing) {
        db.customers.update(existing.id!, { lastOrderDate: order.sundayDate })
      } else {
        db.customers.add({ name: order.customerName, lastOrderDate: order.sundayDate })
      }
    })
  })
}

export function updateOrder(id: number, changes: Partial<Order>) {
  db.orders.update(id, { ...changes, updatedAt: new Date().toISOString() })
}

export function deleteOrder(id: number) {
  db.orders.delete(id)
}

export function togglePickedUp(id: number, current: boolean) {
  updateOrder(id, { pickedUp: !current })
}

export function toggleCartonReturn(id: number, current: boolean) {
  updateOrder(id, { cartonReturn: !current })
}
