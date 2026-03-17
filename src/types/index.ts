export interface OrderItem {
  chicken: number // half-dozens
  duck: number
  goose: number
}

export type PaymentMethod = 'lockbox' | 'venmo'

export type ContactSource =
  | 'instagram'
  | 'facebook'
  | 'marketplace'
  | 'text'
  | 'walkup'
  | 'other'

export interface Order {
  id?: number
  sundayDate: string // ISO date string YYYY-MM-DD
  customerName: string
  items: OrderItem
  cartonReturn: boolean
  paymentMethod?: PaymentMethod | null
  contactSource?: ContactSource | null
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
  contactSource?: ContactSource | null
}

export interface SundayNote {
  id?: number
  sundayDate: string // the Sunday this note is for
  text: string
  createdAt: string
}

export interface ClosedSunday {
  sundayDate: string // primary key
}

export interface SoldOutSunday {
  sundayDate: string // primary key
}

export interface ChecklistItem {
  id?: number
  sundayDate: string
  text: string
  checked: boolean
  isDefault: boolean
  createdAt: string
}

export interface NotificationSettings {
  key: 'settings' // single-row primary key
  enabled: boolean
  sundayHour: number   // 0-23, default 7
  sundayMinute: number // 0-59, default 0
  saturdayHour: number   // 0-23, default 18
  saturdayMinute: number // 0-59, default 0
  lastSundayFired: string | null  // ISO date of last Sunday reminder fired
  lastSaturdayFired: string | null // ISO date of last Saturday reminder fired
}
