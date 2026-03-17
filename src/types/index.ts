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
  paymentMethod?: PaymentMethod | null
  notes: string
  pickedUp: boolean
  recurring?: boolean
  sourceOrderId?: number | null
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id?: number
  name: string
  lastOrderDate: string
}

export interface SundayNote {
  id?: number
  sundayDate: string // the Sunday this note is for
  text: string
  createdAt: string
}
