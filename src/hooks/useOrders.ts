import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect } from 'react'
import { db } from '../db'
import type { Order } from '../types'
import { isSundayClosed } from './useClosedSundays'

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
    recurring: order.recurring ?? false,
    sourceOrderId: order.sourceOrderId ?? null,
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

export function toggleRecurring(id: number, current: boolean) {
  updateOrder(id, { recurring: !current })
}

/** Get the previous Sunday date string (7 days before) */
function getPreviousSunday(sundayDate: string): string {
  const d = new Date(sundayDate + 'T00:00:00')
  d.setDate(d.getDate() - 7)
  return d.toISOString().split('T')[0]
}

/**
 * Generate recurring orders from the previous Sunday into this Sunday.
 * Only copies orders that are marked recurring and haven't already been copied.
 * Skips generation if this Sunday is marked as closed.
 */
export async function generateRecurringOrders(sundayDate: string) {
  // Don't generate recurring orders for closed Sundays
  if (await isSundayClosed(sundayDate)) return

  const prevSunday = getPreviousSunday(sundayDate)
  const prevOrders = await db.orders.where('sundayDate').equals(prevSunday).toArray()
  const recurringOrders = prevOrders.filter((o) => o.recurring)

  if (recurringOrders.length === 0) return

  // Check which recurring orders have already been copied to this Sunday
  const existingOrders = await db.orders.where('sundayDate').equals(sundayDate).toArray()
  const existingSourceIds = new Set(existingOrders.map((o) => o.sourceOrderId).filter(Boolean))

  const now = new Date().toISOString()
  const toAdd: Order[] = []

  for (const source of recurringOrders) {
    if (existingSourceIds.has(source.id!)) continue

    toAdd.push({
      sundayDate,
      customerName: source.customerName,
      items: { ...source.items },
      cartonReturn: source.cartonReturn,
      paymentMethod: source.paymentMethod,
      notes: source.notes,
      pickedUp: false,
      recurring: true,
      sourceOrderId: source.id!,
      createdAt: now,
      updatedAt: now,
    })
  }

  if (toAdd.length > 0) {
    await db.orders.bulkAdd(toAdd)
    // Upsert customers in background
    for (const order of toAdd) {
      db.customers.where('name').equalsIgnoreCase(order.customerName).first().then((existing) => {
        if (existing) {
          db.customers.update(existing.id!, { lastOrderDate: sundayDate })
        } else {
          db.customers.add({ name: order.customerName, lastOrderDate: sundayDate })
        }
      })
    }
  }
}

/** Hook: generate recurring orders when viewing a Sunday board */
export function useGenerateRecurring(sundayDate: string) {
  useEffect(() => {
    generateRecurringOrders(sundayDate)
  }, [sundayDate])
}
