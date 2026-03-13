export interface OrderItem {
  chicken: number // half-dozens
  duck: number
  goose: number
}

export type PaymentMethod = 'lockbox' | 'venmo'

export interface Order {
  id?: number
  sundayDate: string // ISO date string YYYY-MM-DD
  customerName: string
  items: OrderItem
  cartonReturn: boolean
  paymentMethod: PaymentMethod
  notes: string
  pickedUp: boolean
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id?: number
  name: string
  lastOrderDate: string
}
