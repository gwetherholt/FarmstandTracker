import type { OrderItem } from '../types'

export const PRICES = {
  chicken: 2, // per half-dozen
  duck: 3,
  goose: 4,
} as const

export const CARTON_DISCOUNT = 1

export function calculateOrderTotal(items: OrderItem, cartonReturn: boolean): number {
  const subtotal =
    items.chicken * PRICES.chicken +
    items.duck * PRICES.duck +
    items.goose * PRICES.goose
  return cartonReturn ? Math.max(0, subtotal - CARTON_DISCOUNT) : subtotal
}

export function calculatePrepSummary(orders: { items: OrderItem; cartonReturn: boolean; pickedUp: boolean }[]) {
  const totals = {
    chickenHalfDoz: 0,
    duckHalfDoz: 0,
    gooseHalfDoz: 0,
    revenue: 0,
    orderCount: orders.length,
    pickedUpCount: 0,
    cartonsReturned: 0,
  }

  for (const order of orders) {
    totals.chickenHalfDoz += order.items.chicken
    totals.duckHalfDoz += order.items.duck
    totals.gooseHalfDoz += order.items.goose
    totals.revenue += calculateOrderTotal(order.items, order.cartonReturn)
    if (order.pickedUp) totals.pickedUpCount++
    if (order.cartonReturn) totals.cartonsReturned++
  }

  return {
    ...totals,
    chickenEggs: totals.chickenHalfDoz * 6,
    duckEggs: totals.duckHalfDoz * 6,
    gooseEggs: totals.gooseHalfDoz * 6,
  }
}
