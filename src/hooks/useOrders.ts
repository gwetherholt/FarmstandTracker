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

export async function addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString()
  const id = await db.orders.add({
    ...order,
    createdAt: now,
    updatedAt: now,
  })

  // Upsert customer
  const existing = await db.customers.where('name').equalsIgnoreCase(order.customerName).first()
  if (existing) {
    await db.customers.update(existing.id!, { lastOrderDate: order.sundayDate })
  } else {
    await db.customers.add({ name: order.customerName, lastOrderDate: order.sundayDate })
  }

  return id
}

export async function updateOrder(id: number, changes: Partial<Order>) {
  await db.orders.update(id, { ...changes, updatedAt: new Date().toISOString() })
}

export async function deleteOrder(id: number) {
  await db.orders.delete(id)
}

export async function togglePickedUp(id: number, current: boolean) {
  await updateOrder(id, { pickedUp: !current })
}

export async function toggleCartonReturn(id: number, current: boolean) {
  await updateOrder(id, { cartonReturn: !current })
}
