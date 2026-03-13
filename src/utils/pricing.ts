import type { OrderItem } from '../types'

export const PRICES = {
  chicken: 2, // per half-dozen
  duck: 3,
  goose: 4,
} as const

export function calculateOrderTotal(items: OrderItem): number {
  return (
    items.chicken * PRICES.chicken +
    items.duck * PRICES.duck +
    items.goose * PRICES.goose
  )
}

export function calculatePrepSummary(orders: { items: OrderItem; pickedUp: boolean }[]) {
  const totals = {
    chickenHalfDoz: 0,
    duckHalfDoz: 0,
    gooseHalfDoz: 0,
    revenue: 0,
    orderCount: orders.length,
    pickedUpCount: 0,
  }

  for (const order of orders) {
    totals.chickenHalfDoz += order.items.chicken
    totals.duckHalfDoz += order.items.duck
    totals.gooseHalfDoz += order.items.goose
    totals.revenue += calculateOrderTotal(order.items)
    if (order.pickedUp) totals.pickedUpCount++
  }

  return {
    ...totals,
    chickenEggs: totals.chickenHalfDoz * 6,
    duckEggs: totals.duckHalfDoz * 6,
    gooseEggs: totals.gooseHalfDoz * 6,
  }
}
