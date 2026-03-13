import Dexie, { type Table } from 'dexie'
import type { Order, Customer, SundayNote } from '../types'

class FarmStandDB extends Dexie {
  orders!: Table<Order, number>
  customers!: Table<Customer, number>
  notes!: Table<SundayNote, number>

  constructor() {
    super('farmstand')
    this.version(1).stores({
      orders: '++id, sundayDate, customerName, createdAt',
      customers: '++id, &name, lastOrderDate',
    })
    this.version(2).stores({
      orders: '++id, sundayDate, customerName, createdAt',
      customers: '++id, &name, lastOrderDate',
      notes: '++id, sundayDate, createdAt',
    })
  }
}

export const db = new FarmStandDB()
