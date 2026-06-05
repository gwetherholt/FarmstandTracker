import type { OrderItem, Product } from '../types'

export function calculateOrderTotal(
  items: OrderItem,
  productMap: Map<string, Product>
): number {
  let total = 0
  for (const [key, qty] of Object.entries(items)) {
    if (!qty) continue
    const product = productMap.get(key)
    if (product) total += product.price * qty
  }
  return total
}

export interface PrepSummaryLine {
  key: string
  product: Product
  qty: number
}

export interface PrepSummary {
  lines: PrepSummaryLine[]
  revenue: number
  orderCount: number
  pickedUpCount: number
}

export function calculatePrepSummary(
  orders: { items: OrderItem; pickedUp: boolean }[],
  productMap: Map<string, Product>
): PrepSummary {
  const totals = new Map<string, number>()
  let revenue = 0
  let pickedUpCount = 0

  for (const order of orders) {
    for (const [key, qty] of Object.entries(order.items)) {
      if (!qty) continue
      totals.set(key, (totals.get(key) ?? 0) + qty)
    }
    revenue += calculateOrderTotal(order.items, productMap)
    if (order.pickedUp) pickedUpCount++
  }

  const lines: PrepSummaryLine[] = []
  for (const [key, qty] of totals) {
    const product = productMap.get(key)
    if (!product) continue
    lines.push({ key, product, qty })
  }
  lines.sort((a, b) => a.product.sortOrder - b.product.sortOrder)

  return {
    lines,
    revenue,
    orderCount: orders.length,
    pickedUpCount,
  }
}
